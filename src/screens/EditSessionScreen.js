import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAppDatabase } from '../db/DatabaseContext';
import { addSession, updateSession } from '../db/db';
import DateTimePicker from '@react-native-community/datetimepicker';

import { formatDate } from '../utils/dateFormatter';

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

    // Format date as YYYY-MM-DD for storage (ISO format best for sorting)
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
    <ScrollView className="flex-1 bg-slate-950 p-4">
      <View className="mb-4">
        <Text className="text-slate-400 font-medium mb-1">Date</Text>
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)}
          className="border border-slate-800 rounded-lg p-3 bg-slate-900"
        >
          <Text className="text-lg text-slate-50">{formatDate(date, false)}</Text>
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
        <Text className="text-slate-400 font-medium mb-1">Hours</Text>
        <TextInput
          className="border border-slate-800 rounded-lg p-3 text-lg bg-slate-900 text-slate-50"
          value={hours}
          onChangeText={setHours}
          placeholder="1.5"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
        />
      </View>

      <View className="mb-6">
        <Text className="text-slate-400 font-medium mb-1">Notes</Text>
        <TextInput
          className="border border-slate-800 rounded-lg p-3 text-lg bg-slate-900 h-32 text-slate-50"
          value={notes}
          onChangeText={setNotes}
          placeholder="WOD details..."
          placeholderTextColor="#64748b"
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-lg items-center border border-blue-500 shadow-lg mb-10"
        onPress={handleSave}
      >
        <Text className="text-white text-lg font-bold">
          {isEditing ? 'Update Session' : 'Save Session'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
