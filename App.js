import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from './src/db/db';
import HomeScreen from './src/screens/HomeScreen';
import EditSessionScreen from './src/screens/EditSessionScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SQLiteProvider databaseName="worktracker.db" onInit={migrateDbIfNeeded}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Work Tracker' }} 
          />
          <Stack.Screen 
            name="EditSession" 
            component={EditSessionScreen} 
            options={({ route }) => ({ 
              title: route.params?.session ? 'Edit Session' : 'Add Session' 
            })} 
          />
          <Stack.Screen 
            name="Stats" 
            component={StatsScreen} 
            options={{ title: 'Statistics' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
