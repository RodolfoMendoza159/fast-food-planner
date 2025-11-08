// In mobile_app/src/screens/MealHistoryScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl, // <-- NEW: To allow "pull to refresh"
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants.example';
import { useIsFocused } from '@react-navigation/native'; // <-- NEW

// --- (NEW) Type definitions for our new API data ---
// These match your LoggedMealSerializer
type MenuItem = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

type LoggedMealItem = {
  menu_item: MenuItem;
  quantity: number;
};

type LoggedMeal = {
  id: number;
  name: string | null;
  created_at: string; // This will be an ISO date string
  logged_items: LoggedMealItem[];
};

export default function MealHistoryScreen() {
  const { authToken } = useAuth();
  const [history, setHistory] = useState<LoggedMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // useIsFocused will be true when the user is on this tab
  const isFocused = useIsFocused(); 

  const fetchHistory = async () => {
    try {
      // --- (UPDATED) Fetch from the new /api/history/ endpoint ---
      const response = await fetch(`${API_BASE_URL}/history/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data: LoggedMeal[] = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // --- (UPDATED) useEffect hook ---
  useEffect(() => {
    // We fetch history when the screen is focused (i.e., you tap the tab)
    // and also when the component first loads.
    if (isFocused) {
      setIsLoading(true);
      fetchHistory();
    }
  }, [isFocused, authToken]); // Re-run if isFocused or authToken changes

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // --- (NEW) Render function for a single meal in history ---
  const renderMeal = ({ item: meal }: { item: LoggedMeal }) => {
    // Format the date string to be more readable
    const mealDate = new Date(meal.created_at);
    const dateString = mealDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeString = mealDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.listItem}>
        {/* Meal Header: Name and Time */}
        <View style={styles.mealHeader}>
          <Text style={styles.title}>{meal.name || 'Meal'}</Text>
          <Text style={styles.subtitle}>{timeString}</Text>
        </View>
        <Text style={styles.dateText}>{dateString}</Text>

        {/* --- (NEW) List of items inside the meal --- */}
        {meal.logged_items.map((loggedItem) => (
          <View
            key={loggedItem.menu_item.id}
            style={styles.mealItemContainer}
          >
            <Text style={styles.itemText}>
              {loggedItem.quantity} x {loggedItem.menu_item.name}
            </Text>
            <Text style={styles.itemMacros}>
              {`Cals: ${loggedItem.menu_item.calories * loggedItem.quantity}`}
            </Text>
          </View>
        ))}
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
      <Text style={styles.header}>Meal History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMeal}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No meals logged yet.</Text>
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
    backgroundColor: '#f5f5f5',
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
  },

  // --- New styles for this screen ---
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  mealItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  itemMacros: {
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});