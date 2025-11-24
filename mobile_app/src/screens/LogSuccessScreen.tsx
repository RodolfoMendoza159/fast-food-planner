// In mobile_app/src/screens/LogSuccessScreen.tsx

import React from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { styles } from '../styles';
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext'; // <-- Import useMeal
import { API_BASE_URL } from '../constants.example';

// Remove 'route' from the props, we don't need it
export default function LogSuccessScreen({ navigation }: any) {
  const { authToken } = useAuth();
  // --- GET THE MEAL FROM CONTEXT ---
  const { lastLoggedMeal } = useMeal();

  const handleHistory = () => {
    navigation.popToTop();
    navigation.getParent()?.jumpTo('History');
  };

  const handleNewMeal = () => {
    navigation.popToTop();
  };

  const handleSaveFavorite = () => {
    // --- THIS WILL NOW WORK ---
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