// In mobile_app/src/context/MealContext.tsx

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../constants.example';

type MenuItem = {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

interface MealContextType {
  currentMeal: MenuItem[];
  addItemToMeal: (item: MenuItem) => void;
  removeItemFromMeal: (itemId: number) => void; // <-- NEW: We'll add this
  clearMeal: () => void;
  logCurrentMeal: (
    authToken: string | null,
    mealName: string // <-- UPDATED: Now takes a meal name
  ) => Promise<boolean>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentMeal, setCurrentMeal] = useState<MenuItem[]>([]);

  const addItemToMeal = (item: MenuItem) => {
    setCurrentMeal((prev) => [...prev, item]);
  };

  // --- NEW FUNCTION ---
  // This lets us remove an item from the review screen
  // It only removes *one* instance of the item
  const removeItemFromMeal = (itemId: number) => {
    setCurrentMeal((prev) => {
      const index = prev.findIndex((item) => item.id === itemId);
      if (index > -1) {
        // This removes just the first instance of the item
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
  };

  const clearMeal = () => {
    setCurrentMeal([]);
  };

  // --- (THE BIG UPDATE) ---
  // This is the new function that sends quantities
  const logCurrentMeal = async (
    authToken: string | null,
    mealName: string
  ): Promise<boolean> => {
    if (!authToken) {
      Alert.alert('Error', 'You are not logged in.');
      return false;
    }
    if (currentMeal.length === 0) {
      Alert.alert('Error', 'Your meal is empty.');
      return false;
    }

    // 1. Count quantities
    // Create a "map" to count how many of each item we have
    // e.g., { 5: 1, 22: 2 } (item 5 has quantity 1, item 22 has quantity 2)
    const itemCounts = new Map<number, number>();
    currentMeal.forEach((item) => {
      const count = itemCounts.get(item.id) || 0;
      itemCounts.set(item.id, count + 1);
    });

    // 2. Format for the API
    // Convert the map into the array format our backend needs:
    // e.g., [{ id: 5, quantity: 1 }, { id: 22, quantity: 2 }]
    const itemsToLog = Array.from(itemCounts.entries()).map(
      ([itemId, quantity]) => ({
        id: itemId,
        quantity: quantity,
      })
    );

    // 3. Send to the new backend endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/log_meal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify({
          name: mealName || 'Meal', // Send the meal name
          items: itemsToLog,       // Send the new items array
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to log meal');
      }

      // Success!
      clearMeal(); // Clear the meal from context
      return true;
    } catch (e: any) {
      Alert.alert('Log Failed', e.message);
      return false;
    }
  };

  const value = {
    currentMeal,
    addItemToMeal,
    removeItemFromMeal, // <-- NEW: Added to value
    clearMeal,
    logCurrentMeal,
  };

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
};

export const useMeal = () => {
  const context = useContext(MealContext);
  if (context === undefined) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
};