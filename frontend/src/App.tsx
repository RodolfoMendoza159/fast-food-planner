// In frontend/src/App.tsx

import { useState, useEffect } from 'react';
import './App.css';

// --- Define our data structures (TypeScript types) ---
interface MenuItem {
  id: number;
  item_name: string;
  category: string;
  calories: number;
  protein: number;
}

interface Restaurant {
  id: number;
  name: string;
  menu_items?: MenuItem[]; // Menu items are optional and will be loaded on click
}

function App() {
  // --- State Variables ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Effect to fetch the initial list of restaurants ---
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

  // --- Function to handle clicking on a restaurant ---
  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the detailed data for the selected restaurant, which now includes the menu
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restaurant.id}/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Restaurant = await response.json();
      setSelectedRestaurant(data); // Set the selected restaurant state, now with menu_items
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Function to go back to the restaurant list ---
  const handleBack = () => {
    setSelectedRestaurant(null);
  };

  // --- Main Render Logic ---
  return (
    <div>
      <h1>Fast Food Tracker</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {/* If a restaurant is selected, show its menu. Otherwise, show the list. */}
      {selectedRestaurant ? (
        <div>
          <button onClick={handleBack}>&larr; Back to Restaurants</button>
          <h2>Menu for {selectedRestaurant.name}</h2>
          {loading && <p>Loading menu...</p>}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Calories</th>
                <th>Protein (g)</th>
              </tr>
            </thead>
            <tbody>
              {selectedRestaurant.menu_items?.map(item => (
                <tr key={item.id}>
                  <td>{item.item_name}</td>
                  <td>{item.category}</td>
                  <td>{item.calories}</td>
                  <td>{item.protein}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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