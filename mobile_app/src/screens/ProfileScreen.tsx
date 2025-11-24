// In mobile_app/src/screens/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants.example';
import { styles } from '../styles'; 

export default function ProfileScreen() {
  const { authToken, logout } = useAuth();
  const [calorieGoal, setCalorieGoal] = useState<string>('2000');
  const [aboutMe, setAboutMe] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  
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
        
        setCalorieGoal(String(data.calorie_goal));
        setAboutMe(data.about_me || '');
        setFavoriteFood(data.favorite_food || '');
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
        body: JSON.stringify({ 
          calorie_goal: Number(calorieGoal) || 2000,
          about_me: aboutMe,
          favorite_food: favoriteFood
        }),
      });
      if (!response.ok) throw new Error('Failed to update profile.');
      
      const data = await response.json();
      setCalorieGoal(String(data.calorie_goal));
      setSuccessMessage('Profile updated successfully!');
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
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Profile</Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
        
        <Text style={styles.label}>Daily Calorie Goal:</Text>
        <TextInput
          style={styles.input}
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Favorite Food Type:</Text>
        <TextInput
          style={styles.input}
          value={favoriteFood}
          onChangeText={setFavoriteFood}
          placeholder="e.g. Burgers, Tacos"
        />

        <Text style={styles.label}>About Me:</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={aboutMe}
          onChangeText={setAboutMe}
          placeholder="Short bio or fitness goals..."
          multiline
        />

        <Pressable style={styles.button} onPress={handleProfileUpdate}>
          <Text style={styles.buttonText}>Update Profile</Text>
        </Pressable>

        {/* Spacer View */}
        <View style={{ height: 40 }} /> 
        
        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}