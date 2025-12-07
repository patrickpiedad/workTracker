import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { getSessions, deleteSession } from '../db/db';

export default function HomeScreen({ navigation }) {
  const db = useSQLiteContext();
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
          <View className="mb-4">
            <TouchableOpacity 
              className="bg-indigo-600 p-4 rounded-lg items-center shadow-sm"
              onPress={() => navigation.navigate('Stats', { sessions })}
            >
              <Text className="text-white font-bold text-lg">View Stats</Text>
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
