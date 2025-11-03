// In mobile_app/src/screens/DashboardStack.tsx

import React, { useState, useEffect, useMemo } from 'react';
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
  useMeal,
  Restaurant,
  MenuItem,
  MealItem
} from '../context/MealContext';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles';
import MealReviewScreen from './MealReviewScreen'; 
import LogSuccessScreen from './LogSuccessScreen'; 

// --- (1) Define the Screens in our Stack ---
type DashboardStackParamList = {
  RestaurantList: undefined;
  CategoryList: { restaurant: Restaurant };
  // This screen will receive the category name and the list of items
  MenuItemList: { category: string; items: MenuItem[] };
  MealReview: undefined; 
  LogSuccess: undefined;
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

// --- (2) The Stack Navigator ---
export default function DashboardStack() {
  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="RestaurantList"
          component={RestaurantListScreen}
        />
        <Stack.Screen name="CategoryList" component={CategoryListScreen} />
        <Stack.Screen name="MenuItemList" component={MenuItemListScreen} />
        <Stack.Screen name="MealReview" component={MealReviewScreen} />
        <Stack.Screen name="LogSuccess" component={LogSuccessScreen} />
      </Stack.Navigator>
  );
}

// --- (3) Shared Floating Meal Button ---
// We can move this outside the screens so it's reusable
const MealTrackerButton = ({ navigation }: { navigation: any }) => {
  const { mealTotals } = useMeal();
  if (mealTotals.count === 0) return null; // Don't show if meal is empty

  return (
    <Pressable
      style={styles.floatingButton}
      onPress={() => navigation.navigate('MealReview')} // ENABLED
    >
      <Text style={styles.buttonText}>
        View Meal ({mealTotals.count}) - {mealTotals.calories.toFixed(0)} Cal
      </Text>
    </Pressable>
  );
};

// --- (4) Restaurant List Screen (UPDATED) ---
function RestaurantListScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  // ... (loading and error states are the same)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      // ... (fetch logic is the same)
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
              onPress={() =>
                navigation.navigate('CategoryList', { restaurant: item })
              }
            >
              <Text style={styles.listItemText}>{item.name}</Text>
            </Pressable>
          )}
        />
      </View>
      {/* Show the floating button */}
      <MealTrackerButton navigation={navigation} />
    </SafeAreaView>
  );
}

// --- (5) Category List Screen (UPDATED) ---
function CategoryListScreen({ navigation, route }: any) {
  const { restaurant } = route.params as { restaurant: Restaurant };

  const groupedMenu = useMemo(() => {
    // ... (grouping logic is the same)
    return restaurant.menu_items.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as { [key: string]: MenuItem[] });
  }, [restaurant.menu_items]);

  const categories = Object.keys(groupedMenu);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&larr; Back to Restaurants</Text>
        </Pressable>
        <Text style={styles.title}>Categories for {restaurant.name}</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item: category }) => (
            <Pressable
              style={styles.listItem}
              // ENABLE THIS ONPRESS
              onPress={() =>
                navigation.navigate('MenuItemList', {
                  category: category,
                  items: groupedMenu[category], // Pass the items for this category
                })
              }
            >
              <Text style={styles.listItemText}>{category}</Text>
            </Pressable>
          )}
        />
      </View>
      {/* Show the floating button */}
      <MealTrackerButton navigation={navigation} />
    </SafeAreaView>
  );
}

// --- (6) NEW: Menu Item List Screen ---
function MenuItemListScreen({ navigation, route }: any) {
  const { category, items } = route.params as {
    category: string;
    items: MenuItem[];
  };
  const { addToMeal } = useMeal();
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);

  // This is the render function for each item in the list
  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const isActive = activeItem?.id === item.id;
    return (
      <View style={styles.menuItemCard}>
        <Pressable
          style={styles.menuItemHeader}
          onPress={() => setActiveItem(isActive ? null : item)}
        >
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemCals}>{item.calories.toFixed(0)} cal</Text>
        </Pressable>
        {/* This is the expandable detail section */}
        {isActive && (
          <View style={styles.menuItemDetails}>
            <Text>
              Protein: {item.protein}g, Fat: {item.fat}g, Carbs: {item.carbohydrates}g
            </Text>
            <Pressable
              style={styles.addButton}
              onPress={() => addToMeal(item)}
            >
              <Text style={styles.buttonText}>Add to Meal</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&larr; Back to Categories</Text>
        </Pressable>
        <Text style={styles.title}>{category}</Text>
        <FlatList
          data={items}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id.toString()}
          // Add some space at the bottom so the list can scroll
          // above the floating button
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
      {/* Show the floating button */}
      <MealTrackerButton navigation={navigation} />
    </SafeAreaView>
  );
}