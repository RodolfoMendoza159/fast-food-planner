// In frontend/src/App.tsx

import { useState, useEffect } from 'react';
import './App.css';

// --- Define our data structures (TypeScript types) ---
interface MenuItem {
  id: number;
  name: string; // Corrected from 'item_name'
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

interface Restaurant {
  id: number;
  name: string;
  menu_items: MenuItem[]; // Note: we changed the model to send this as menu_items
}

// NEW: A type for menu items grouped by category
interface GroupedMenu {
  [category: string]: MenuItem[];
}

function App() {
  // --- State Variables ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenu>({});
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null); // NEW: To track the expanded item
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Effect to fetch the initial list of restaurants ---
  useEffect(() => {
    async function fetchRestaurants() {
      // (This function is the same as before)
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

  // --- Function to handle clicking on a restaurant ---
  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restaurant.id}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Restaurant = await response.json();
      setSelectedRestaurant(data);

      // NEW: Group the fetched menu items by category
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
  
  // NEW: Function to toggle showing item details
  const handleItemClick = (item: MenuItem) => {
    // If the clicked item is already active, close it. Otherwise, open it.
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
          
          {/* NEW: Render by category */}
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
                    {/* NEW: Conditionally render details if this is the active item */}
                    {activeItem?.id === item.id && (
                      <div className="menu-item-details">
                        <p><strong>Protein:</strong> {item.protein}g</p>
                        <p><strong>Fat:</strong> {item.fat}g</p>
                        <p><strong>Carbs:</strong> {item.carbohydrates}g</p>
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