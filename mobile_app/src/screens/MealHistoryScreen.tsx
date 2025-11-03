// In mobile_app/src/screens/MealHistoryScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants.example';
import { styles } from '../styles';

// Interfaces are identical to your old MealHistory.tsx
interface HistoryMenuItem {
  id: number;
  name: string;
}

interface HistoryEntry {
  id: number;
  date: string;
  calories_consumed: number;
  protein_consumed: number;
  fat_consumed: number;
  carbs_consumed: number;
  items: HistoryMenuItem[];
}

export default function MealHistoryScreen() {
  const { authToken } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // This fetch logic is identical to your web app's
  useEffect(() => {
    const fetchHistory = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/history/`, {
          headers: { 'Authorization': `Token ${authToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch meal history.');
        const data = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [authToken]); // Re-fetch if auth token changes

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // This is the individual card component for each list item
  const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyDate}>
        {new Date(item.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <View style={styles.historyCardBody}>
        {/* Left Side: Macros */}
        <View style={styles.historyMacros}>
          <Text style={styles.macroText}>
            Calories: {item.calories_consumed.toFixed(0)}
          </Text>
          <Text style={styles.macroText}>
            Protein: {item.protein_consumed.toFixed(1)}g
          </Text>
          <Text style={styles.macroText}>
            Fat: {item.fat_consumed.toFixed(1)}g
          </Text>
          <Text style={styles.macroText}>
            Carbs: {item.carbs_consumed.toFixed(1)}g
          </Text>
        </View>
        
        {/* Right Side: Item List */}
        <View style={styles.historyItems}>
          <Text style={styles.itemsTitle}>Items ({item.items.length}):</Text>
          {item.items.length > 0 ? (
            item.items.map((menuItem, index) => (
              <Text key={`${menuItem.id}-${index}`} style={styles.itemText}>
                • {menuItem.name}
              </Text>
            ))
          ) : (
            <Text style={styles.itemText}>No items logged.</Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Meal History</Text>
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text>You haven't logged any meals yet.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}