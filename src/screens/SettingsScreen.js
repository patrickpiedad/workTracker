import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAppDatabase } from '../db/DatabaseContext';
import { exportData, importData } from '../utils/backup';

export default function SettingsScreen() {
  const db = useAppDatabase();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await exportData(db);
      if (result.success) {
        // Success is often self-explanatory via the share sheet, but a toast wouldn't hurt.
        // Alert.alert('Success', 'Backup ready to share'); 
      } else {
        Alert.alert('Export Failed', result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Import Backup',
      'This will merge sessions from the backup file. Existing sessions with the same date/creation time will be skipped.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await importData(db);
              if (result.success) {
                if (result.canceled) {
                  // do nothing
                } else {
                  Alert.alert('Import Successful', `Imported ${result.count} new sessions.`);
                }
              } else {
                if(!result.canceled) {
                   Alert.alert('Import Failed', result.error);
                }
              }
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-950 p-4">
      <View className="mb-6">
        <Text className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider">Data Management</Text>
        <View className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
          <TouchableOpacity 
            className="p-4 border-b border-slate-800 flex-row items-center justify-between"
            onPress={handleExport}
            disabled={loading}
          >
            <View>
              <Text className="text-slate-50 text-base font-medium">Export Backup</Text>
              <Text className="text-slate-500 text-sm">Save your data to a file</Text>
            </View>
            {loading ? <ActivityIndicator color="#3b82f6" /> : <Text className="text-slate-400 text-xl">›</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            className="p-4 flex-row items-center justify-between"
            onPress={handleImport}
            disabled={loading}
          >
            <View>
              <Text className="text-slate-50 text-base font-medium">Import Backup</Text>
              <Text className="text-slate-500 text-sm">Restore data from a file</Text>
            </View>
            {loading ? <ActivityIndicator color="#3b82f6" /> : <Text className="text-slate-400 text-xl">›</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-slate-600 text-center text-xs mt-4">
        App Version 1.0.0
      </Text>
    </ScrollView>
  );
}
