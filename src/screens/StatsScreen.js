import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

const VIEW_MODES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function StatsScreen({ route }) {
  const { sessions } = route.params || { sessions: [] };
  const [viewMode, setViewMode] = useState('Weekly');

  const aggregatedData = useMemo(() => {
    const data = {};
    if (!sessions) return [];

    try {
      sessions.forEach(session => {
        if (!session.date) return;
        const date = new Date(session.date);
        if (isNaN(date.getTime())) return;

        let key;

        if (viewMode === 'Daily') {
          key = session.date; // YYYY-MM-DD
        } else if (viewMode === 'Weekly') {
          // Robust Week Calculation
          const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
          key = `${d.getUTCFullYear()} - Week ${weekNo}`;
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
    } catch (e) {
      console.error("Error calculating stats:", e);
      return [];
    }
  }, [sessions, viewMode]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', padding: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: '#e5e7eb', padding: 4, borderRadius: 8 }}>
        {VIEW_MODES.map(mode => (
          <TouchableOpacity
            key={mode}
            style={{ 
              flex: 1, 
              paddingVertical: 8, 
              borderRadius: 6,
              backgroundColor: viewMode === mode ? 'white' : 'transparent',
              shadowOpacity: viewMode === mode ? 0.1 : 0,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowRadius: 1,
              elevation: viewMode === mode ? 1 : 0
            }}
            onPress={() => setViewMode(mode)}
          >
            <Text style={{ 
              textAlign: 'center', 
              fontWeight: '500', 
              color: viewMode === mode ? '#2563eb' : '#4b5563' 
            }}>
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
        {aggregatedData.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 40 }}>No data available</Text>
        ) : (
          aggregatedData.map((item) => (
            <View 
              key={item.label} 
              style={{ 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                backgroundColor: 'white', 
                padding: 16, 
                marginBottom: 8, 
                borderRadius: 8, 
                borderWidth: 1, 
                borderColor: '#f3f4f6' 
              }}
            >
              <Text style={{ color: '#1f2937', fontWeight: '500', fontSize: 18 }}>{item.label}</Text>
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 18 }}>{item.hours.toFixed(1)} hrs</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
