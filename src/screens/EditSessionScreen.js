import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAppDatabase } from '../db/DatabaseContext';
import { addSession, updateSession } from '../db/db';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EditSessionScreen({ route, navigation }) {
  const db = useAppDatabase();
  const session = route.params?.session;
  const isEditing = !!session;

  const [date, setDate] = useState(new Date());
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (session) {
      setDate(new Date(session.date));
      setHours(session.hours.toString());
      setNotes(session.notes || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!hours) {
      Alert.alert('Error', 'Please fill in hours');
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum)) {
      Alert.alert('Error', 'Hours must be a number');
      return;
    }

    const dateStr = date.toISOString().split('T')[0];

    try {
      if (isEditing) {
        await updateSession(db, session.id, dateStr, hoursNum, notes);
      } else {
        await addSession(db, dateStr, hoursNum, notes);
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-1">Date</Text>
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)}
          className="border border-gray-300 rounded-lg p-3 bg-gray-50"
        >
          <Text className="text-lg text-gray-800">{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
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
