// In mobile_app/src/context/MealContext.tsx

import React, { createContext, useState, useContext, useMemo } from 'react';

// --- (1) Interfaces ---
// (These are all the same)
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  serving_size: string; // R:[FIX] Should Update to fit data (e.g. of data '450g')
  calories: number;
  fat: number;
  sat_fat: number;
  trans_fat: number;
  cholesterol: number;
  sodium: number;
  carbohydrates: number;
  fiber: number;
  sugar: number;
  protein: number;
}
export interface Restaurant {
  id: number;
  name: string;
  menu_items: MenuItem[];
}
export interface MealItem {
  item: MenuItem;
  quantity: number;
}

// --- (2) Context Definition ---
interface MealContextType {
  currentMeal: MealItem[];
  addToMeal: (itemToAdd: MenuItem) => void;
  removeFromMeal: (itemToRemove: MenuItem) => void;
  clearMeal: () => void;
  mealTotals: { calories: number; count: number };
  
  // --- ADDed THESE TWO  ---
  lastLoggedMeal: MealItem[] | null;
  setLastLoggedMeal: (meal: MealItem[] | null) => void;
}

const MealContext = createContext<MealContextType | null>(null);

// --- (3) Context Provider ---
export const MealProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentMeal, setCurrentMeal] = useState<MealItem[]>([]);
  
  // --- ADDED THIS STATE ---
  const [lastLoggedMeal, setLastLoggedMeal] = useState<MealItem[] | null>(null);

  // ... (addToMeal and removeFromMeal are the same)
  const addToMeal = (itemToAdd: MenuItem) => {
    setCurrentMeal((prevMeal) => {
      const existingItem = prevMeal.find(
        (mealItem) => mealItem.item.id === itemToAdd.id
      );
      if (existingItem) {
        return prevMeal.map((mealItem) =>
          mealItem.item.id === itemToAdd.id
            ? { ...mealItem, quantity: mealItem.quantity + 1 }
            : mealItem
        );
      } else {
        return [...prevMeal, { item: itemToAdd, quantity: 1 }];
      }
    });
  };

  const removeFromMeal = (itemToRemove: MenuItem) => {
    setCurrentMeal((prevMeal) => {
      const existingItem = prevMeal.find(
        (mealItem) => mealItem.item.id === itemToRemove.id
      );
      if (existingItem && existingItem.quantity > 1) {
        return prevMeal.map((mealItem) =>
          mealItem.item.id === itemToRemove.id
            ? { ...mealItem, quantity: mealItem.quantity - 1 }
            : mealItem
        );
      } else {
        return prevMeal.filter(
          (mealItem) => mealItem.item.id !== itemToRemove.id
        );
      }
    });
  };

  const clearMeal = () => {
    setCurrentMeal([]);
  };

  // ... (mealTotals is the same)
  const mealTotals = useMemo(() => {
    return currentMeal.reduce(
      (totals, mealItem) => {
        totals.calories += mealItem.item.calories * mealItem.quantity;
        totals.count += mealItem.quantity;
        return totals;
      },
      { calories: 0, count: 0 }
    );
  }, [currentMeal]);

  return (
    <MealContext.Provider
      value={{
        currentMeal,
        addToMeal,
        removeFromMeal,
        clearMeal,
        mealTotals,
        // --- ADDED THESE TWO LINES ---
        lastLoggedMeal,
        setLastLoggedMeal,
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

// --- (4) Custom Hook ---
// (This is the same)
export const useMeal = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
};