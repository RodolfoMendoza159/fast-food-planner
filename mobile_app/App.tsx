// In mobile_app/App.tsx

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthContext } from './src/context/AuthContext';
import { MealProvider } from './src/context/MealContext';
import AuthNavigator from './src/screens/AuthScreen'; 
import ProfileScreen from './src/screens/ProfileScreen'; 
import MealHistoryScreen from './src/screens/MealHistoryScreen'; 
import DashboardStack from './src/screens/DashboardStack'; 
import FavoritesScreen from './src/screens/FavoritesScreen';
import HomeScreen from './src/screens/HomeScreen'; // <-- NEW IMPORT

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

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <MealProvider>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
          {/* Home is the first route now */}
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Build Meal" component={DashboardStack} />
          <Tab.Screen name="History" component={MealHistoryScreen} />
          <Tab.Screen name="Favorites" component={FavoritesScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </MealProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});