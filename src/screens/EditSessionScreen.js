import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { addSession, updateSession } from '../db/db';

export default function EditSessionScreen({ route, navigation }) {
  const db = useSQLiteContext();
  const session = route.params?.session;
  const isEditing = !!session;

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (session) {
      setDate(session.date);
      setHours(session.hours.toString());
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!date || !hours) {
      Alert.alert('Error', 'Please fill in date and hours');
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum)) {
      Alert.alert('Error', 'Hours must be a number');
      return;
    }

    try {
      if (isEditing) {
        await updateSession(db, session.id, date, hoursNum, notes);
      } else {
        await addSession(db, date, hoursNum, notes);
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save session');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Date (YYYY-MM-DD)</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg bg-gray-50"
          value={date}
          onChangeText={setDate}
          placeholder="2023-01-01"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Hours</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg bg-gray-50"
          value={hours}
          onChangeText={setHours}
          placeholder="1.5"
          keyboardType="numeric"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-1">Notes</Text>
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg bg-gray-50 h-32"
          value={notes}
          onChangeText={setNotes}
          placeholder="WOD details..."
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg items-center"
        onPress={handleSave}
      >
        <Text className="text-white text-lg font-bold">
          {isEditing ? 'Update Session' : 'Save Session'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
