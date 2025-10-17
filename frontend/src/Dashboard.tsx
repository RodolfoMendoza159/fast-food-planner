// In frontend/src/Dashboard.tsx

import { useState, useEffect, useMemo } from 'react';
import MealReview from './MealReview'; // We need this for the review screen

// --- Interface Definitions ---
interface MenuItem { id: number; name: string; category: string; serving_size: string; calories: number; fat: number; sat_fat: number; trans_fat: number; cholesterol: number; sodium: number; carbohydrates: number; fiber: number; sugar: number; protein: number; }
interface Restaurant { id: number; name: string; menu_items: MenuItem[]; }
interface GroupedMenu { [category: string]: MenuItem[]; }

interface DashboardProps {
  authToken: string | null;
  onNavigate: (view: 'dashboard' | 'profile' | 'history') => void;
}

function Dashboard({ authToken, onNavigate }: DashboardProps) {
  // --- State Management ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenu>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [currentMeal, setCurrentMeal] = useState<MenuItem[]>([]);
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [dailyCaloriesConsumed, setDailyCaloriesConsumed] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'browsing' | 'reviewing' | 'success'>('browsing');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!authToken) { setLoading(false); return; }
      try {
        const [resRes, profileRes, trackerRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/restaurants/', { headers: { 'Authorization': `Token ${authToken}` } }),
          fetch('http://127.0.0.1:8000/api/profile/', { headers: { 'Authorization': `Token ${authToken}` } }),
          fetch('http://127.0.0.1:8000/api/tracker/', { headers: { 'Authorization': `Token ${authToken}` } })
        ]);

        if (!resRes.ok || !profileRes.ok || !trackerRes.ok) throw new Error('Failed to fetch initial data.');

        const restaurantsData = await resRes.json();
        const profileData = await profileRes.json();
        const trackerData = await trackerRes.json();

        setRestaurants(restaurantsData);
        setCalorieGoal(profileData.calorie_goal);
        setDailyCaloriesConsumed(trackerData.calories_consumed);

      } catch (err: any) { setError(err.message); } 
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, [authToken]);

  // --- Event Handlers ---
  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restaurant.id}/`, { headers: { 'Authorization': `Token ${authToken!}` }});
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Restaurant = await response.json();
      setSelectedRestaurant(data);
      const grouped = data.menu_items.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
      }, {} as GroupedMenu);
      setGroupedMenu(grouped);
    } catch (e) { if (e instanceof Error) setError(e.message); } 
    finally { setLoading(false); }
  };

  const handleItemClick = (item: MenuItem) => { setActiveItem(activeItem?.id === item.id ? null : item); };
  const handleBack = () => {
    if (selectedCategory) { setSelectedCategory(null); setActiveItem(null); } 
    else if (selectedRestaurant) { setSelectedRestaurant(null); setGroupedMenu({}); }
  };
  const addToMeal = (item: MenuItem) => { setCurrentMeal(prev => [...prev, item]); };
  const removeFromMeal = (indexToRemove: number) => { setCurrentMeal(prev => prev.filter((_, i) => i !== indexToRemove)); };
  const mealTotals = useMemo(() => currentMeal.reduce((totals, item) => {
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.fat += item.fat;
      totals.carbohydrates += item.carbohydrates;
      return totals;
    }, { calories: 0, protein: 0, fat: 0, carbohydrates: 0 }), [currentMeal]);

  const handleMealLogged = () => {
    setViewMode('success');
    // We need to refetch the daily tracker to get the updated calorie count
    const fetchTrackerData = async () => {
        const trackerRes = await fetch('http://127.0.0.1:8000/api/tracker/', { headers: { 'Authorization': `Token ${authToken!}` } });
        const trackerData = await trackerRes.json();
        setDailyCaloriesConsumed(trackerData.calories_consumed);
    };
    fetchTrackerData();
  };

  const handleStartNewMeal = () => {
    setSelectedRestaurant(null);
    setSelectedCategory(null);
    setActiveItem(null);
    setCurrentMeal([]);
    setViewMode('browsing');
  };

  // --- Main Render Logic ---

  // 1. Loading State
  if (loading) return <p>Loading your dashboard...</p>;

  // 2. Review Screen
  if (viewMode === 'reviewing') {
    return (
      <MealReview
        currentMeal={currentMeal}
        calorieGoal={calorieGoal}
        dailyCaloriesConsumed={dailyCaloriesConsumed}
        authToken={authToken}
        onLogMeal={handleMealLogged}
        onNavigate={onNavigate}
      />
    );
  }
  
  // 3. Success Screen
  if (viewMode === 'success') {
    return (
      <div className="meal-log-success">
        <h2>Meal Logged!</h2>
        <p>Your meal has been successfully added to your daily tracker.</p>
        <div className="navigation-buttons">
          <button onClick={() => onNavigate('history')}>See History</button>
          <button onClick={handleStartNewMeal}>Log New Meal</button>
        </div>
      </div>
    );
  }

  // --- 4. Main Browsing View (This is the part that was missing) ---
  const renderMainContent = () => {
    if (selectedRestaurant && selectedCategory) {
      const items = groupedMenu[selectedCategory] || [];
      return (
        <div>
          <button onClick={handleBack} className="back-button">&larr; Back to Categories</button>
          <h2>{selectedCategory}</h2>
          <div className="menu-list">
            {items.map(item => (
              <div key={item.id} className="menu-item">
                <div className="menu-item-header" onClick={() => handleItemClick(item)}>
                  <span>{item.name}</span>
                  <span>{item.calories} cal</span>
                </div>
                {activeItem?.id === item.id && (
                  <div className="menu-item-details">
                    <p><strong>Protein:</strong> {item.protein}g, <strong>Fat:</strong> {item.fat}g, <strong>Carbs:</strong> {item.carbohydrates}g</p>
                    <button className="add-button" onClick={() => addToMeal(item)}>Add to Meal</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (selectedRestaurant) {
      return (
        <div>
          <button onClick={handleBack} className="back-button">&larr; Back to Restaurants</button>
          <h2>Categories for {selectedRestaurant.name}</h2>
          <div className="category-list"> 
            {Object.keys(groupedMenu).map(category => (
              <div key={category} className="category-item" onClick={() => setSelectedCategory(category)}>
                {category}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <h2>Select a Restaurant</h2>
        <div className="restaurant-list">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="restaurant-item" onClick={() => handleRestaurantSelect(restaurant)}>
              {restaurant.name}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <main className="main-content">
      <div className="menu-view">
        {renderMainContent()}
      </div>

      <div className="meal-sidebar">
        <h2>Current Meal</h2>
        {currentMeal.length === 0 ? (
          <p>Add items to build your meal.</p>
        ) : (
          <>
            <ul className="meal-list">
              {currentMeal.map((item, index) => (
                <li key={`${item.id}-${index}`}>
                  <span>{item.name}</span>
                  <button onClick={() => removeFromMeal(index)}>X</button>
                </li>
              ))}
            </ul>
            <div className="meal-totals">
              <h3>Totals:</h3>
              <p><strong>Calories:</strong> {mealTotals.calories.toFixed(0)}</p>
            </div>
            <button className="log-button" onClick={() => setViewMode('reviewing')}>
              Review Meal ({currentMeal.length})
            </button>
          </>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </main>
  );
}

export default Dashboard;