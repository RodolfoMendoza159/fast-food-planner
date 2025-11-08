// In mobile_app/src/screens/FavoritesScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants.example';
import { useIsFocused } from '@react-navigation/native';

// --- (NEW) Type definitions for our Favorite Meals ---
type MenuItem = {
  id: number;
  name: string;
  calories: number;
  protein: number;
};

type FavoriteMeal = {
  id: number;
  name: string;
  items: MenuItem[];
};

export default function FavoritesScreen() {
  const { authToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data: FavoriteMeal[] = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      fetchFavorites();
    }
  }, [isFocused, authToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  // --- (NEW) Function to log a favorite meal ---
  const handleLogFavorite = async (mealId: number) => {
    try {
      // Calls the new backend endpoint
      const response = await fetch(`${API_BASE_URL}/favorites/${mealId}/log/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to log this meal.');
      }
      
      Alert.alert('Success', 'Favorite meal logged to your history.');

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderFavorite = ({ item: meal }: { item: FavoriteMeal }) => {
    const totals = meal.items.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        return acc;
      },
      { calories: 0, protein: 0 }
    );

    return (
      <View style={styles.listItem}>
        <Text style={styles.title}>{meal.name}</Text>
        <Text style={styles.subtitle}>
          {`Cals: ${totals.calories.toFixed(0)} | Prot: ${totals.protein.toFixed(1)}g`}
        </Text>
        
        {meal.items.map((item) => (
          <Text key={item.id} style={styles.itemText}>
            - {item.name}
          </Text>
        ))}

        <View style={styles.buttonContainer}>
          <Button
            title="Log This Meal"
            onPress={() => handleLogFavorite(meal.id)}
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorite Meals</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFavorite}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't saved any favorite meals yet.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

// --- (UPDATED) Local styles with global styles included ---
const styles = StyleSheet.create({
  // --- Copied from globalStyles ---
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5ff',
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 10,
  },

  // --- New styles for this screen ---
  itemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});