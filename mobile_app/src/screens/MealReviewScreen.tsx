// In mobile_app/src/screens/MealReviewScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert, // <-- NEW: To show success/error alerts
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMeal } from '../context/MealContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants.example'; // <-- NEW: Need this for API calls

// Type definitions
type MenuItem = {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

type MealItemWithQuantity = {
  item: MenuItem;
  quantity: number;
};

export default function MealReviewScreen() {
  const navigation = useNavigation();
  const { currentMeal, removeItemFromMeal, logCurrentMeal } = useMeal();
  const { authToken } = useAuth();

  const [mealName, setMealName] = useState('');
  const [isLogging, setIsLogging] = useState(false); // Renamed for clarity
  const [isSavingFavorite, setIsSavingFavorite] = useState(false); // <-- NEW

  // (No change) Group items to show quantity
  const groupedMeal: MealItemWithQuantity[] = useMemo(() => {
    const itemMap = new Map<number, MealItemWithQuantity>();
    currentMeal.forEach((item) => {
      const existing = itemMap.get(item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        itemMap.set(item.id, { item: item, quantity: 1 });
      }
    });
    return Array.from(itemMap.values());
  }, [currentMeal]);

  // (No change) Handle the log meal button press
  const handleLogMeal = async () => {
    setIsLogging(true);
    const success = await logCurrentMeal(authToken, mealName);
    setIsLogging(false);
    if (success) {
      navigation.navigate('LogSuccess');
    }
  };

  // --- (NEW) Function to save the current meal as a favorite ---
  const handleSaveFavorite = async () => {
    if (!mealName) {
      Alert.alert(
        'Name Required',
        'Please enter a name for your favorite meal.'
      );
      return;
    }
    setIsSavingFavorite(true);

    // Get all item IDs from the current meal
    const item_ids = currentMeal.map((item) => item.id);

    try {
      // --- Call the /api/favorites/ endpoint ---
      const response = await fetch(`${API_BASE_URL}/favorites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify({
          name: mealName,
          item_ids: item_ids,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save favorite meal.');
      }

      // Success!
      Alert.alert('Saved!', `'${mealName}' has been saved to your favorites.`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSavingFavorite(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Review Your Meal</Text>

      <TextInput
        style={styles.textInput}
        placeholder="Enter meal name (e.g., 'Lunch')"
        value={mealName}
        onChangeText={setMealName}
        placeholderTextColor="#999"
      />

      <FlatList
        data={groupedMeal}
        keyExtractor={(entry) => entry.item.id.toString()}
        renderItem={({ item: entry }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {entry.quantity} x {entry.item.name}
              </Text>
              <Text style={styles.subtitle}>
                {`Cals: ${entry.item.calories} | Prot: ${entry.item.protein}g`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeItemFromMeal(entry.item.id)}
            >
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* --- (NEW) Button container for side-by-side buttons --- */}
      <View style={styles.buttonContainer}>
        <Button
          title="Log Meal"
          onPress={handleLogMeal}
          disabled={isLogging || isSavingFavorite || currentMeal.length === 0}
        />
        <Button
          title="Save as Favorite"
          onPress={handleSaveFavorite}
          disabled={isLogging || isSavingFavorite || currentMeal.length === 0}
          color="#007AFF" // iOS blue
        />
      </View>
      {(isLogging || isSavingFavorite) && (
        <ActivityIndicator size="large" style={{ margin: 10 }} />
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  removeButton: {
    color: 'red',
    fontSize: 16,
    fontWeight: '500',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },
});