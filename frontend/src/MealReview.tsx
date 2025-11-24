// In frontend/src/MealReview.tsx

import { useMemo } from 'react';

// --- INTERFACES ---
interface MealItem { item: MenuItem; quantity: number; }
interface MenuItem { id: number; name: string; category: string; serving_size: string; calories: number; fat: number; sat_fat: number; trans_fat: number; cholesterol: number; sodium: number; carbohydrates: number; fiber: number; sugar: number; protein: number; }
interface MealReviewProps {
  currentMeal: MealItem[];
  calorieGoal: number;
  dailyCaloriesConsumed: number;
  authToken: string | null;
  onLogMeal: () => void;
  onNavigate: (view: 'dashboard' | 'history') => void;
}

const formatNumber = (num: number, digits: number = 0) => num.toFixed(digits);

function MealReview({ currentMeal, calorieGoal, dailyCaloriesConsumed, authToken, onLogMeal, onNavigate }: MealReviewProps) {

  const mealTotals = useMemo(() => {
    return currentMeal.reduce((totals, mealItem) => {
      const { item, quantity } = mealItem;
      totals.calories += item.calories * quantity;
      totals.protein += item.protein * quantity;
      totals.fat += item.fat * quantity;
      totals.carbohydrates += item.carbohydrates * quantity;
      totals.sugar += item.sugar * quantity;
      totals.sodium += item.sodium * quantity;
      return totals;
    }, { calories: 0, protein: 0, fat: 0, carbohydrates: 0, sugar: 0, sodium: 0 });
  }, [currentMeal]);

  const predictedTotalCalories = dailyCaloriesConsumed + mealTotals.calories;
  const remainingCalories = calorieGoal - predictedTotalCalories;

  const handleFinalLog = async () => {
    if (currentMeal.length === 0 || !authToken) return;
    const itemIds = currentMeal.flatMap(mealItem => Array(mealItem.quantity).fill(mealItem.item.id));
    try {
      const response = await fetch('http://127.0.0.1:8000/api/log-meal/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${authToken}` },
        body: JSON.stringify({ item_ids: itemIds })
      });
      if (!response.ok) throw new Error('Failed to log meal.');
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
              <th>Qty</th>
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
            {currentMeal.map(({ item, quantity }) => (
              <tr key={item.id}>
                <td>{quantity}</td>
                <td>{item.name}</td>
                <td>{formatNumber(item.calories * quantity)}</td>
                <td>{formatNumber(item.protein * quantity, 1)}</td>
                <td>{formatNumber(item.fat * quantity, 1)}</td>
                <td>{formatNumber(item.carbohydrates * quantity, 1)}</td>
                <td>{formatNumber(item.sugar * quantity, 1)}</td>
                <td>{formatNumber(item.sodium * quantity)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td>-</td>
              <td><strong>{formatNumber(mealTotals.calories)}</strong></td>
              <td><strong>{formatNumber(mealTotals.protein, 1)}</strong></td>
              <td><strong>{formatNumber(mealTotals.fat, 1)}</strong></td>
              <td><strong>{formatNumber(mealTotals.carbohydrates, 1)}</strong></td>
              <td><strong>{formatNumber(mealTotals.sugar, 1)}</strong></td>
              <td><strong>{formatNumber(mealTotals.sodium)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="meal-review-summary">
        <h3>Calorie Impact</h3>
        <p>After this meal, your new daily total will be <strong>{formatNumber(predictedTotalCalories)} calories</strong>.</p>
        <p className="final-message">You will still have <strong>{formatNumber(remainingCalories)} calories</strong> remaining for today.</p>
        <button className="log-button-review" onClick={handleFinalLog}>Confirm & Log Meal</button>
      </div>
    </div>
  );
}

export default MealReview;