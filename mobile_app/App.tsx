// In mobile_app/App.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Our new imports
import { AuthContext } from './src/context/AuthContext';
import AuthNavigator from './src/screens/AuthScreen'; // We will create this
import ProfileScreen from './src/screens/ProfileScreen'; // We will create this

// --- (1) Main App Entry Point ---
export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setAuthToken(token);
      } catch (e) {
        console.error('Failed to load auth token', e);
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setAuthToken(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, logout }}>
      <NavigationContainer>
        {authToken ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

// --- (2) Navigation ---
const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={PlaceholderDashboardScreen} />
      <Tab.Screen name="History" component={PlaceholderHistoryScreen} />
      <Tab.Screen name="Favorites" component={PlaceholderFavoritesScreen} />
      {/* This now points to our real ProfileScreen */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// --- (3) Placeholders ---
// We'll move these out soon
function PlaceholderDashboardScreen() {
  return <SafeAreaView><View><Text>Dashboard Screen</Text></View></SafeAreaView>;
}
function PlaceholderHistoryScreen() {
  return <SafeAreaView><View><Text>History Screen</Text></View></SafeAreaView>;
}
function PlaceholderFavoritesScreen() {
  return <SafeAreaView><View><Text>Favorites Screen</Text></View></SafeAreaView>;
}

// --- (4) Styles ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});