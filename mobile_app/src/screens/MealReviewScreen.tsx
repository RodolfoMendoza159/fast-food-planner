// In mobile_app/src/screens/MealReviewScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles';

// From your old MealReview.tsx
const formatNumber = (num: number, digits: number = 0) => num.toFixed(digits);

export default function MealReviewScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const { currentMeal, mealTotals, clearMeal } = useMeal();

  // We need to load profile & tracker data, just like the old Dashboard did
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!authToken) return;
      try {
        const [profileRes, trackerRes] = await Promise.all([
          fetch(`${API_BASE_URL}/profile/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
          fetch(`${API_BASE_URL}/tracker/`, {
            headers: { Authorization: `Token ${authToken}` },
          }),
        ]);
        if (!profileRes.ok || !trackerRes.ok)
          throw new Error('Failed to fetch data.');
        
        const profileData = await profileRes.json();
        const trackerData = await trackerRes.json();
        
        setCalorieGoal(profileData.calorie_goal);
        setDailyCalories(trackerData.calories_consumed);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [authToken]);

  // Logic from old MealReview.tsx
  const predictedTotalCalories = dailyCalories + mealTotals.calories;
  const remainingCalories = calorieGoal - predictedTotalCalories;

  // This is the API call from your old MealReview.tsx
  const handleFinalLog = async () => {
    if (currentMeal.length === 0 || !authToken) return;
    const itemIds = currentMeal.flatMap((mealItem) =>
      Array(mealItem.quantity).fill(mealItem.item.id)
    );
    try {
      const response = await fetch(`${API_BASE_URL}/log-meal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify({ item_ids: itemIds }),
      });
      if (!response.ok) throw new Error('Failed to log meal.');
      
      // Success! Clear the meal from context and move to success screen
      clearMeal();
      navigation.navigate('LogSuccess');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewCell}>{item.quantity}x</Text>
      <Text style={[styles.reviewCell, { flex: 2 }]}>{item.item.name}</Text>
      <Text style={styles.reviewCell}>
        {formatNumber(item.item.calories * item.quantity)}
      </Text>
      <Text style={styles.reviewCell}>
        {formatNumber(item.item.protein * item.quantity, 1)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&larr; Back to Items</Text>
        </Pressable>
        <Text style={styles.title}>Review Your Meal</Text>

        {/* --- Review Table --- */}
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewHeaderText}>Qty</Text>
          <Text style={[styles.reviewHeaderText, { flex: 2 }]}>Item</Text>
          <Text style={styles.reviewHeaderText}>Cals</Text>
          <Text style={styles.reviewHeaderText}>Prot</Text>
        </View>
        <FlatList
          data={currentMeal}
          renderItem={renderItem}
          keyExtractor={(item) => item.item.id.toString()}
        />
        <View style={styles.reviewTotalRow}>
          <Text style={styles.reviewTotalText}>Total</Text>
          <Text style={styles.reviewTotalText}>
            {formatNumber(mealTotals.calories)}
          </Text>
          <Text style={styles.reviewTotalText}>
            {formatNumber(
              currentMeal.reduce(
                (sum, i) => sum + i.item.protein * i.quantity,
                0
              ),
              1
            )}
            g
          </Text>
        </View>

        {/* --- Summary --- */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Calorie Impact</Text>
          <Text style={styles.summaryText}>
            After this meal, your new daily total will be{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {formatNumber(predictedTotalCalories)} calories
            </Text>
            .
          </Text>
          <Text style={styles.summaryFinal}>
            You will have{' '}
            <Text style={{ fontWeight: 'bold' }}>
              {formatNumber(remainingCalories)} calories
            </Text>{' '}
            remaining.
          </Text>
        </View>

        <Pressable style={styles.logButton} onPress={handleFinalLog}>
          <Text style={styles.buttonText}>Confirm & Log Meal</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}