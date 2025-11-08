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
  clearMeal: () => void;
  logCurrentMeal: (authToken: string | null) => Promise<boolean>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export const MealProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentMeal, setCurrentMeal] = useState<MenuItem[]>([]);

  const addItemToMeal = (item: MenuItem) => {
    setCurrentMeal((prev) => [...prev, item]);
  };

  const clearMeal = () => {
    setCurrentMeal([]);
  };

  const logCurrentMeal = async (authToken: string | null): Promise<boolean> => {
    if (!authToken) {
      Alert.alert('Error', 'You are not logged in.');
      return false;
    }
    if (currentMeal.length === 0) {
      Alert.alert('Error', 'Your meal is empty.');
      return false;
    }

    const item_ids = currentMeal.map((item) => item.id);

    try {
      const response = await fetch(`${API_BASE_URL}/log_meal/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify({ item_ids }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to log meal');
      }

      clearMeal();
      return true;
    } catch (e: any) {
      Alert.alert('Log Failed', e.message);
      return false;
    }
  };

  // --- THIS IS THE FIX ---
  // The 'value' object was missing addItemToMeal
  const value = {
    currentMeal,
    addItemToMeal, // <-- This line was missing
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