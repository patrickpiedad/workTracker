import './global.css';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DatabaseProvider } from './src/db/DatabaseContext';
import HomeScreen from './src/screens/HomeScreen';
import EditSessionScreen from './src/screens/EditSessionScreen';
import StatsScreen from './src/screens/StatsScreen';

const Stack = createNativeStackNavigator();

const SlateTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#3b82f6', // blue-500
    background: '#020617', // slate-950
    card: '#0f172a', // slate-900
    text: '#f8fafc', // slate-50
    border: '#1e293b', // slate-800
    notification: '#ef4444',
  },
};

export default function App() {
  return (
    <DatabaseProvider>
      <NavigationContainer theme={SlateTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0f172a' }, // slate-900
            headerTintColor: '#f8fafc', // slate-50
            headerTitleStyle: { fontWeight: 'bold' },
            contentStyle: { backgroundColor: '#020617' }, // slate-950
          }}
        >
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
    </DatabaseProvider>
  );
}
