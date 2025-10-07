// In frontend/src/App.tsx

import { useState, useEffect } from 'react';
import './App.css';

// --- Define our data structures (TypeScript types) ---
// NEW: The MenuItem interface is now updated with all the nutritional fields.
interface MenuItem {
  id: number;
  name: string;
  category: string;
  serving_size: string;
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

interface Restaurant {
  id: number;
  name: string;
  menu_items: MenuItem[];
}

interface GroupedMenu {
  [category: string]: MenuItem[];
}

function App() {
  // (State variables and functions are the same as before)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenu>({});
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/restaurants/');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setRestaurants(data);
      } catch (e) {
        if (e instanceof Error) setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restaurant.id}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Restaurant = await response.json();
      setSelectedRestaurant(data);

      const grouped = data.menu_items.reduce((acc, item) => {
        const category = item.category || 'Other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as GroupedMenu);
      setGroupedMenu(grouped);

    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setActiveItem(activeItem?.id === item.id ? null : item);
  };

  const handleBack = () => {
    setSelectedRestaurant(null);
    setGroupedMenu({});
    setActiveItem(null);
  };

  // --- Main Render Logic ---
  return (
    <div>
      <h1>Fast Food Tracker</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {selectedRestaurant ? (
        // --- MENU VIEW ---
        <div>
          <button onClick={handleBack}>&larr; Back to Restaurants</button>
          <h2>Menu for {selectedRestaurant.name}</h2>
          {loading && <p>Loading menu...</p>}
          
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category} className="category-section">
              <h3>{category}</h3>
              <div className="menu-list">
                {items.map(item => (
                  <div key={item.id} className="menu-item" onClick={() => handleItemClick(item)}>
                    <div className="menu-item-header">
                      <span>{item.name}</span>
                      <span>{item.calories} cal</span>
                    </div>
                    {activeItem?.id === item.id && (
                      // NEW: The details section now displays all nutritional data.
                      <div className="menu-item-details">
                        <p><strong>Serving Size:</strong> {item.serving_size || 'N/A'}</p>
                        <p><strong>Total Fat:</strong> {item.fat}g</p>
                        <p><strong>Saturated Fat:</strong> {item.sat_fat}g</p>
                        <p><strong>Trans Fat:</strong> {item.trans_fat}g</p>
                        <p><strong>Cholesterol:</strong> {item.cholesterol}mg</p>
                        <p><strong>Sodium:</strong> {item.sodium}mg</p>
                        <p><strong>Carbohydrates:</strong> {item.carbohydrates}g</p>
                        <p><strong>Fiber:</strong> {item.fiber}g</p>
                        <p><strong>Sugar:</strong> {item.sugar}g</p>
                        <p><strong>Protein:</strong> {item.protein}g</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // --- RESTAURANT LIST VIEW ---
        // (This section is the same as before)
        <div>
          <h2>Select a Restaurant</h2>
          {loading && <p>Loading...</p>}
          <div className="restaurant-list">
            {restaurants.map(restaurant => (
              <div key={restaurant.id} className="restaurant-item" onClick={() => handleRestaurantSelect(restaurant)}>
                {restaurant.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;