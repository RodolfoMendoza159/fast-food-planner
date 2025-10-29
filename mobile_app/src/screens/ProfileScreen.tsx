// In mobile_app/src/screens/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles'; // We will create this file next

export default function ProfileScreen() {
  const { authToken, logout } = useAuth();
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch the user's profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch profile data.');
        const data = await response.json();
        setCalorieGoal(data.calorie_goal);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [authToken]);

  // Handle the form submission
  const handleProfileUpdate = async () => {
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify({ calorie_goal: calorieGoal }),
      });
      if (!response.ok) throw new Error('Failed to update profile.');
      
      const data = await response.json();
      setCalorieGoal(data.calorie_goal);
      setSuccessMessage('Your calorie goal has been updated!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
        
        <Text style={styles.label}>Daily Calorie Goal:</Text>
        <TextInput
          style={styles.input}
          value={String(calorieGoal)} // TextInput must use a string
          onChangeText={(text) => setCalorieGoal(Number(text) || 0)}
          keyboardType="number-pad"
        />
        <Pressable style={styles.button} onPress={handleProfileUpdate}>
          <Text style={styles.buttonText}>Update Goal</Text>
        </Pressable>

        {/* Spacer View */}
        <View style={{ height: 40 }} /> 
        
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}