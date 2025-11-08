// In mobile_app/src/screens/MealReviewScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  StyleSheet, // <-- We will use this
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMeal } from '../context/MealContext';
import { useAuth } from '../context/AuthContext';
// --- (REMOVED) The bad import is gone ---

// --- (NEW) Define a type for our grouped items ---
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
  const [isLoading, setIsLoading] = useState(false);

  // --- (NEW) Group the items from context to show quantity ---
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

  // --- (UPDATED) Handle the log meal button press ---
  const handleLogMeal = async () => {
    setIsLoading(true);
    const success = await logCurrentMeal(authToken, mealName); 
    setIsLoading(false);

    if (success) {
      navigation.navigate('LogSuccess');
    }
  };

  return (
    // --- (UPDATED) Using 'styles.container' (local) ---
    <View style={styles.container}>
      {/* --- (UPDATED) Using 'styles.header' (local) --- */}
      <Text style={styles.header}>Review Your Meal</Text>

      {/* --- (NEW) Meal Name Input --- */}
      <TextInput
        style={styles.textInput}
        placeholder="Enter meal name (e.g., 'Lunch')"
        value={mealName}
        onChangeText={setMealName}
        placeholderTextColor="#999"
      />

      {/* --- (UPDATED) List now shows grouped items --- */}
      <FlatList
        data={groupedMeal}
        keyExtractor={(entry) => entry.item.id.toString()}
        renderItem={({ item: entry }) => (
          // --- (UPDATED) Using 'styles.listItem' (local) ---
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              {/* --- (UPDATED) Using 'styles.title' (local) --- */}
              <Text style={styles.title}>
                {entry.quantity} x {entry.item.name}
              </Text>
              {/* --- (UPDATED) Using 'styles.subtitle' (local) --- */}
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

      {/* --- (UPDATED) Log Meal Button --- */}
      <Button
        title="Log Meal"
        onPress={handleLogMeal}
        disabled={isLoading || currentMeal.length === 0}
      />
      {isLoading && <ActivityIndicator size="large" style={{ margin: 10 }} />}
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
    flexDirection: 'row', // <-- Added this for the remove button
    justifyContent: 'space-between', // <-- Added this
    alignItems: 'center', // <-- Added this
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
});