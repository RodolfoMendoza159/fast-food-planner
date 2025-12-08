// In mobile_app/src/screens/LogSuccessScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { styles } from '../styles';
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext';
import { API_BASE_URL } from '../constants.example';

export default function LogSuccessScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const { lastLoggedMeal } = useMeal();

  // --- NEW: State for calorie calculation ---
  const [caloriesLeft, setCaloriesLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // --- NEW: Fetch tracker data on mount ---
  useEffect(() => {
    const fetchTracker = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tracker/`, {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Calculate remaining: Goal - Consumed
          const remaining = data.goal - data.consumed.calories;
          setCaloriesLeft(remaining);
        }
      } catch (error) {
        console.error("Failed to fetch tracker data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, [authToken]);

  const handleHistory = () => {
    navigation.popToTop();
    navigation.getParent()?.jumpTo('History');
  };

  const handleNewMeal = () => {
    navigation.popToTop();
  };

  const handleSaveFavorite = () => {
    if (!lastLoggedMeal || lastLoggedMeal.length === 0 || !authToken) {
      Alert.alert('Error', 'Could not find the last logged meal to save.');
      return;
    }

    Alert.prompt(
      'Save Favorite',
      'Please enter a name for this favorite meal:',
      async (mealName) => {
        if (!mealName) return;

        const itemIds = lastLoggedMeal.flatMap((mealItem) =>
          Array(mealItem.quantity).fill(mealItem.item.id)
        );

        try {
          const response = await fetch(`${API_BASE_URL}/favorites/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${authToken}`,
            },
            body: JSON.stringify({ name: mealName, item_ids: itemIds }),
          });

          if (!response.ok) throw new Error('Failed to save favorite.');
          
          Alert.alert(
            'Success!',
            `Meal "${mealName}" saved. Going to favorites...`,
            [
              { text: 'OK', onPress: () => {
                navigation.popToTop();
                navigation.getParent()?.jumpTo('Favorites');
              }}
            ]
          );
        } catch (err) {
          Alert.alert('Error', 'Failed to save favorite meal.');
        }
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>Meal Logged!</Text>
        <Text style={styles.summaryText}>
          Your meal has been successfully added to your daily tracker.
        </Text>

        {/* --- NEW: Leftover Calories Display --- */}
        <View style={{ marginVertical: 20, alignItems: 'center', width: '100%' }}>
          {loading ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            caloriesLeft !== null && (
              <>
                <Text style={{ fontSize: 16, color: '#555', marginBottom: 5 }}>
                  You have
                </Text>
                <Text style={{ 
                  fontSize: 36, 
                  fontWeight: 'bold', 
                  color: caloriesLeft >= 0 ? '#28a745' : '#dc3545' // Green if positive, Red if over
                }}>
                  {caloriesLeft}
                </Text>
                <Text style={{ fontSize: 16, color: '#555' }}>
                  calories left for today.
                </Text>
              </>
            )
          )}
        </View>

        <View style={styles.successButtonContainer}>
          <Pressable style={styles.button} onPress={handleHistory}>
            <Text style={styles.buttonText}>See History</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleNewMeal}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Log New Meal
            </Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveFavorite}
          >
            <Text style={styles.buttonText}>Save as Favorite</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
