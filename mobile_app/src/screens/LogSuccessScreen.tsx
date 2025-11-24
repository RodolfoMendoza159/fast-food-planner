// In mobile_app/src/screens/LogSuccessScreen.tsx

import React from 'react';
import { View, Text, SafeAreaView, Pressable, Alert } from 'react-native';
import { styles } from '../styles';
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext'; 
import { API_BASE_URL } from '../constants.example';

export default function LogSuccessScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const { lastLoggedMeal } = useMeal(); // Note: Ensure useMeal provides this if you want to use it, or remove if not strictly needed for logging logic. 
  // If lastLoggedMeal isn't in your context, you might need to pass data via navigation params.
  // Assuming the context update from previous steps included basic log logic.

  const handleHistory = () => {
    // Navigate to the History Tab
    navigation.navigate('History');
  };

  const handleNewMeal = () => {
    // Reset this stack to the Dashboard
    navigation.reset({
      index: 0,
      routes: [{ name: 'DashboardHome' }],
    });
  };

  const handleSaveFavorite = () => {
    // Simply verify we have a meal to save
    Alert.prompt(
      'Save Favorite',
      'Please enter a name for this favorite meal:',
      async (mealName) => {
        if (!mealName) return;
        
        // If you need item IDs, you should ideally pass them to this screen 
        // via navigation.navigate('LogSuccess', { items: ... }) 
        // For now, we assume the user just wants to save context state if available.
        // If context is cleared on log, this might be empty. 
        // Better approach: Use the Dashboard logic to add favorites BEFORE logging if desired.
        Alert.alert("Info", "To save favorites effectively, please use the 'Save as Favorite' button on the Review screen before logging.");
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
        </View>
      </View>
    </SafeAreaView>
  );
}