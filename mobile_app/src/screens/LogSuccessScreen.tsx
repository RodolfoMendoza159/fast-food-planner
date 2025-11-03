// In mobile_app/src/screens/LogSuccessScreen.tsx

import React from 'react';
import { View, Text, SafeAreaView, Pressable } from 'react-native';
import { styles } from '../styles';

export default function LogSuccessScreen({ navigation }: any) {
  const handleHistory = () => {
    // This goes back to the Restaurant List, then jumps to the History tab.
    navigation.popToTop();
    navigation.getParent()?.jumpTo('History');
  };

  const handleNewMeal = () => {
    // This sends the user all the way back to the start of the stack
    navigation.popToTop();
  };
  
  const handleFavorites = () => {
    // TODO: We will add the "Save as Favorite" logic from Dashboard.tsx here
    alert('Save as Favorite - Coming Soon!');
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
            onPress={handleFavorites}
          >
            <Text style={styles.buttonText}>Save as Favorite</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}