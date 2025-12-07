import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function StatsScreen({ route }) {
  const { sessions } = route.params;

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalAllTime = 0;
    let totalThisMonth = 0;
    
    sessions.forEach(session => {
      totalAllTime += session.hours;
      
      const sessionDate = new Date(session.date);
      if (sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear) {
        totalThisMonth += session.hours;
      }
    });

    return { totalAllTime, totalThisMonth };
  }, [sessions]);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
        <Text className="text-gray-500 font-medium mb-1">Total Hours (All Time)</Text>
        <Text className="text-4xl font-bold text-blue-600">{stats.totalAllTime.toFixed(1)}</Text>
      </View>

      <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
        <Text className="text-gray-500 font-medium mb-1">This Month</Text>
        <Text className="text-4xl font-bold text-green-600">{stats.totalThisMonth.toFixed(1)}</Text>
      </View>
    </ScrollView>
  );
}
