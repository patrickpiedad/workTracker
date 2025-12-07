import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';

const VIEW_MODES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function StatsScreen({ route }) {
  const { sessions } = route.params;
  const [viewMode, setViewMode] = useState('Monthly');

  const aggregatedData = useMemo(() => {
    const data = {};

    sessions.forEach(session => {
      const date = new Date(session.date);
      let key;

      if (viewMode === 'Daily') {
        key = session.date; // YYYY-MM-DD
      } else if (viewMode === 'Weekly') {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()} - Week ${weekNum}`;
      } else if (viewMode === 'Monthly') {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else if (viewMode === 'Yearly') {
        key = `${date.getFullYear()}`;
      }

      if (!data[key]) {
        data[key] = 0;
      }
      data[key] += session.hours;
    });

    // Sort keys descending
    return Object.keys(data).sort().reverse().map(key => ({
      label: key,
      hours: data[key]
    }));
  }, [sessions, viewMode]);

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between items-center bg-white p-4 mb-2 rounded-lg border border-gray-100">
      <Text className="text-gray-800 font-medium text-lg">{item.label}</Text>
      <Text className="text-blue-600 font-bold text-lg">{item.hours.toFixed(1)} hrs</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="flex-row mb-4 bg-gray-200 p-1 rounded-lg">
        {VIEW_MODES.map(mode => (
          <TouchableOpacity
            key={mode}
            className={`flex-1 py-2 rounded-md ${viewMode === mode ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setViewMode(mode)}
          >
            <Text className={`text-center font-medium ${viewMode === mode ? 'text-blue-600' : 'text-gray-600'}`}>
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={aggregatedData}
        keyExtractor={(item) => item.label}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">No data available</Text>
        }
      />
    </View>
  );
}
