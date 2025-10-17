// In frontend/src/MealReview.tsx

import { useMemo } from 'react';

// --- Interface Definitions ---
// R: Using the full MenuItem definition to display all data
interface MenuItem {
  id: number; name: string; category: string; serving_size: string;
  calories: number; fat: number; sat_fat: number; trans_fat: number;
  cholesterol: number; sodium: number; carbohydrates: number;
  fiber: number; sugar: number; protein: number;
}

interface MealReviewProps {
  currentMeal: MenuItem[];
  calorieGoal: number;
  dailyCaloriesConsumed: number;
  authToken: string | null;
  onLogMeal: () => void;      // Function to trigger after successful log
  onNavigate: (view: 'dashboard' | 'history') => void; // Function for navigation
}

// R: A helper function to format numbers nicely
const formatNumber = (num: number, digits: number = 1) => num.toFixed(digits);

function MealReview({ currentMeal, calorieGoal, dailyCaloriesConsumed, authToken, onLogMeal, onNavigate }: MealReviewProps) {

  // R: useMemo is great here. It only recalculates the totals if the currentMeal changes.
  const mealTotals = useMemo(() => {
    const totals = {
      calories: 0, fat: 0, sat_fat: 0, trans_fat: 0, cholesterol: 0,
      sodium: 0, carbohydrates: 0, fiber: 0, sugar: 0, protein: 0
    };
    currentMeal.forEach(item => {
      totals.calories += item.calories;
      totals.fat += item.fat;
      totals.sat_fat += item.sat_fat;
      totals.trans_fat += item.trans_fat;
      totals.cholesterol += item.cholesterol;
      totals.sodium += item.sodium;
      totals.carbohydrates += item.carbohydrates;
      totals.fiber += item.fiber;
      totals.sugar += item.sugar;
      totals.protein += item.protein;
    });
    return totals;
  }, [currentMeal]);

  const predictedTotalCalories = dailyCaloriesConsumed + mealTotals.calories;
  const remainingCalories = calorieGoal - predictedTotalCalories;

  const handleFinalLog = async () => {
    if (currentMeal.length === 0 || !authToken) return;

    const itemIds = currentMeal.map(item => item.id);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/log-meal/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify({ item_ids: itemIds })
      });

      if (!response.ok) {
        throw new Error('Failed to log meal from review page.');
      }
      
      // R: Instead of handling navigation here, we call the function passed in props.
      // This keeps our components reusable.
      onLogMeal();

    } catch (error) {
      console.error(error);
      alert("There was an error logging your meal.");
    }
  };

  return (
    <div className="meal-review-container">
      <h2>Review Your Meal</h2>
      <div className="meal-review-table-wrapper">
        <table className="meal-review-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Cals</th>
              <th>Protein (g)</th>
              <th>Fat (g)</th>
              <th>Carbs (g)</th>
              <th>Sugar (g)</th>
              <th>Sodium (mg)</th>
            </tr>
          </thead>
          <tbody>
            {currentMeal.map((item, index) => (
              <tr key={`${item.id}-${index}`}>
                <td>{item.name}</td>
                <td>{formatNumber(item.calories, 0)}</td>
                <td>{formatNumber(item.protein)}</td>
                <td>{formatNumber(item.fat)}</td>
                <td>{formatNumber(item.carbohydrates)}</td>
                <td>{formatNumber(item.sugar)}</td>
                <td>{formatNumber(item.sodium, 0)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{formatNumber(mealTotals.calories, 0)}</strong></td>
              <td><strong>{formatNumber(mealTotals.protein)}</strong></td>
              <td><strong>{formatNumber(mealTotals.fat)}</strong></td>
              <td><strong>{formatNumber(mealTotals.carbohydrates)}</strong></td>
              <td><strong>{formatNumber(mealTotals.sugar)}</strong></td>
              <td><strong>{formatNumber(mealTotals.sodium, 0)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="meal-review-summary">
        <h3>Calorie Impact</h3>
        <p>
          After this meal, your new daily total will be <strong>{predictedTotalCalories.toFixed(0)} calories</strong>.
        </p>
        <p className="final-message">
          You will still get to enjoy <strong>{remainingCalories.toFixed(0)} calories</strong> for today.
        </p>
        <button className="log-button-review" onClick={handleFinalLog}>
          Confirm & Log Meal
        </button>
      </div>
    </div>
  );
}

export default MealReview;