import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAppDatabase } from '../db/DatabaseContext';
import { useFocusEffect } from '@react-navigation/native';
import { getSessions, deleteSession } from '../db/db';

export default function HomeScreen({ navigation }) {
  const db = useAppDatabase();
  const [sessions, setSessions] = useState([]);

  const loadSessions = useCallback(async () => {
    try {
      const data = await getSessions(db);
      setSessions(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load sessions');
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [loadSessions])
  );

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(db, id);
            loadSessions();
          },
        },
      ]
    );
  };

  const monthlyHours = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return sessions.reduce((total, session) => {
      const sessionDate = new Date(session.date);
      if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
        return total + session.hours;
      }
      return total;
    }, 0);
  }, [sessions]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('EditSession', { session: item })}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-gray-800">{item.date}</Text>
          <Text className="text-gray-600">{item.hours} hours</Text>
          {item.notes ? <Text className="text-gray-400 text-sm mt-1">{item.notes}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2">
          <Text className="text-red-500 font-medium">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          <View className="mb-6">
            <View className="bg-blue-600 p-6 rounded-xl shadow-md mb-4">
              <Text className="text-blue-100 text-lg font-medium mb-1">This Month</Text>
              <Text className="text-white text-4xl font-bold">{monthlyHours.toFixed(1)} hrs</Text>
            </View>
            
            <TouchableOpacity 
              className="bg-white p-4 rounded-lg items-center shadow-sm border border-gray-200"
              onPress={() => navigation.navigate('Stats', { sessions })}
            >
              <Text className="text-blue-600 font-bold text-lg">View Detailed Stats</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <Text className="text-gray-400 text-lg">No sessions yet.</Text>
            <Text className="text-gray-400">Tap + to add one.</Text>
          </View>
        }
      />
      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg"
        onPress={() => navigation.navigate('EditSession')}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}
