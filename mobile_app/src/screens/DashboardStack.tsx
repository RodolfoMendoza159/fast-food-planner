// In mobile_app/src/screens/DashboardStack.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import {
  MealProvider,
  useMeal,
  Restaurant,
} from '../context/MealContext';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles';

// --- (1) Define the Screens in our Stack ---
// We'll add more to this later
type DashboardStackParamList = {
  RestaurantList: undefined;
  // CategoryList: { restaurant: Restaurant };
  // MenuItemList: { restaurantId: number; category: string };
  // MealReview: undefined;
  // LogSuccess: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

// --- (2) The Stack Navigator ---
// This component is the new "main" export for the Dashboard tab.
// It wraps all screens in the MealProvider.
export default function DashboardStack() {
  return (
    <MealProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="RestaurantList"
          component={RestaurantListScreen}
        />
        {/* We'll add the other screens here later */}
      </Stack.Navigator>
    </MealProvider>
  );
}

// --- (3) Restaurant List Screen ---
// This is the first screen the user sees on this tab.
function RestaurantListScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This logic is from your old Dashboard.tsx
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!authToken) return;
      try {
        const res = await fetch(`${API_BASE_URL}/restaurants/`, {
          headers: { 'Authorization': `Token ${authToken}` },
        });
        if (!res.ok) throw new Error('Failed to fetch restaurants.');
        const data = await res.json();
        setRestaurants(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [authToken]);

  // This is the floating button that shows the current meal
  const MealTrackerButton = () => {
    const { mealTotals } = useMeal();
    if (mealTotals.count === 0) return null;

    return (
      <Pressable
        style={styles.floatingButton}
        // onPress={() => navigation.navigate('MealReview')} // We'll enable this later
      >
        <Text style={styles.buttonText}>
          View Meal ({mealTotals.count}) - {mealTotals.calories.toFixed(0)} Cal
        </Text>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select a Restaurant</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable
              style={styles.listItem}
              // onPress={() => navigation.navigate('CategoryList', { restaurant: item })} // We'll enable this later
            >
              <Text style={styles.listItemText}>{item.name}</Text>
            </Pressable>
          )}
        />
      </View>
      <MealTrackerButton />
    </SafeAreaView>
  );
}