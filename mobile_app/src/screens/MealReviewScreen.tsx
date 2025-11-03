// In mobile_app/src/screens/MealReviewScreen.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useMeal, MealItem } from '../context/MealContext';
import { API_BASE_URL } from '../constants.example';
import { styles } from '../styles';

const formatNumber = (num: number, digits: number = 0) => num.toFixed(digits);

export default function MealReviewScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const { currentMeal, clearMeal, setLastLoggedMeal } = useMeal();

  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [dailyCalories, setDailyCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- (1) Full Totals Calculation ---
  // We need to re-calculate all totals for the summary
  const fullMealTotals = useMemo(() => {
    return currentMeal.reduce(
      (totals, mealItem) => {
        const { item, quantity } = mealItem;
        totals.calories += item.calories * quantity;
        totals.protein += item.protein * quantity;
        totals.fat += item.fat * quantity;
        totals.sat_fat += item.sat_fat * quantity;
        totals.trans_fat += item.trans_fat * quantity;
        totals.cholesterol += item.cholesterol * quantity;
        totals.sodium += item.sodium * quantity;
        totals.carbohydrates += item.carbohydrates * quantity;
        totals.fiber += item.fiber * quantity;
        totals.sugar += item.sugar * quantity;
        return totals;
      },
      {
        calories: 0,
        protein: 0,
        fat: 0,
        sat_fat: 0,
        trans_fat: 0,
        cholesterol: 0,
        sodium: 0,
        carbohydrates: 0,
        fiber: 0,
        sugar: 0,
      }
    );
  }, [currentMeal]);

  // --- (2) Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      // ... (This logic is identical to before)
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

  // --- (3) Log Meal Logic ---
  const handleFinalLog = async () => {
    // ... (This logic is identical to before)
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
      
      // --- THIS IS THE FIX ---
      // 1. Save the meal to the context
      setLastLoggedMeal(currentMeal);
      // 2. Clear the *current* meal
      clearMeal();
      // 3. Navigate *without* params
      navigation.navigate('LogSuccess');
      // --- END FIX ---

    } catch (error: any) {
      setError(error.message);
    }
  };

  const predictedTotalCalories = dailyCalories + fullMealTotals.calories;
  const remainingCalories = calorieGoal - predictedTotalCalories;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // --- (4) Render Function for each Item Card ---
  const renderItemCard = ({ item: mealItem }: { item: MealItem }) => {
    const { item, quantity } = mealItem;
    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewCardHeader}>
          <Text style={styles.reviewItemName}>
            {quantity}x {item.name}
          </Text>
          <Text style={styles.reviewItemCals}>
            {formatNumber(item.calories * quantity)} cal
          </Text>
        </View>
        <View style={styles.macroGridContainer}>
          <MacroGridItem
            label="Protein"
            value={formatNumber(item.protein * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Fat"
            value={formatNumber(item.fat * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Carbs"
            value={formatNumber(item.carbohydrates * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Serving Size"
            value={item.serving_size || '-'}
            unit=""
          />
          <MacroGridItem
            label="Sat. Fat"
            value={formatNumber(item.sat_fat * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Trans Fat"
            value={formatNumber(item.trans_fat * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Fiber"
            value={formatNumber(item.fiber * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Sugar"
            value={formatNumber(item.sugar * quantity, 1)}
            unit="g"
          />
          <MacroGridItem
            label="Cholesterol"
            value={formatNumber(item.cholesterol * quantity)}
            unit="mg"
          />
          <MacroGridItem
            label="Sodium"
            value={formatNumber(item.sodium * quantity)}
            unit="mg"
          />
        </View>
      </View>
    );
  };

  // A small helper component for the grid
  const MacroGridItem = ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: string;
    unit: string;
  }) => (
    <View style={styles.macroGridItem}>
      <Text style={styles.macroGridLabel}>{label}</Text>
      <Text style={styles.macroGridValue}>
        {value}
        {unit ? ` ${unit}` : ''}
      </Text>
    </View>
  );

  // --- (5) Main Screen Render ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&larr; Back to Items</Text>
        </Pressable>
        <Text style={styles.title}>Review Your Meal</Text>

        <FlatList
          data={currentMeal}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.item.id.toString()}
          // The stuff *after* the list
          ListFooterComponent={
            <>
              {/* --- New Totals Section --- */}
              <View style={styles.reviewTotalsContainer}>
                <Text style={styles.title}>Meal Totals</Text>
                <View style={styles.macroGridContainer}>
                  <MacroGridItem label="Calories" value={formatNumber(fullMealTotals.calories)} unit="" />
                  <MacroGridItem label="Protein" value={formatNumber(fullMealTotals.protein, 1)} unit="g" />
                  <MacroGridItem label="Fat" value={formatNumber(fullMealTotals.fat, 1)} unit="g" />
                  <MacroGridItem label="Carbs" value={formatNumber(fullMealTotals.carbohydrates, 1)} unit="g" />
                  <MacroGridItem label="Sat. Fat" value={formatNumber(fullMealTotals.sat_fat, 1)} unit="g" />
                  <MacroGridItem label="Trans Fat" value={formatNumber(fullMealTotals.trans_fat, 1)} unit="g" />
                  <MacroGridItem label="Fiber" value={formatNumber(fullMealTotals.fiber, 1)} unit="g" />
                  <MacroGridItem label="Sugar" value={formatNumber(fullMealTotals.sugar, 1)} unit="g" />
                  <MacroGridItem label="Cholesterol" value={formatNumber(fullMealTotals.cholesterol)} unit="mg" />
                  <MacroGridItem label="Sodium" value={formatNumber(fullMealTotals.sodium)} unit="mg" />
                </View>
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
              
              {/* Add some space at the very bottom */}
              <View style={{ height: 40 }} /> 
            </>
          }
        />
      </View>
    </SafeAreaView>
  );
}