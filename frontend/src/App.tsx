// In frontend/src/App.tsx

import { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- (Interfaces are the same as before) ---
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
  // --- Auth State ---
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoginView, setIsLoginView] = useState(true);

  // --- App State ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenu>({});
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Meal Builder State ---
  const [currentMeal, setCurrentMeal] = useState<MenuItem[]>([]);

  // --- Fetch Restaurants (only if logged in) ---
  useEffect(() => {
    if (authToken) {
      async function fetchRestaurants() {
        setLoading(true);
        try {
          const response = await fetch('http://127.0.0.1:8000/api/restaurants/', {
            headers: { 'Authorization': `Token ${authToken}` }
          });
          if (!response.ok) throw new Error('Could not fetch restaurants');
          const data = await response.json();
          setRestaurants(data);
        } catch (e) {
          if (e instanceof Error) setError(e.message);
        } finally {
          setLoading(false);
        }
      }
      fetchRestaurants();
    }
  }, [authToken]);

  // --- Auth Functions ---
const handleAuth = async (event: React.FormEvent<HTMLFormElement>, endpoint: 'login' | 'register') => {
  event.preventDefault();
  setError(null); // Clear previous errors
  const form = event.currentTarget;
  const username = (form.elements.namedItem('username') as HTMLInputElement).value;
  const password = (form.elements.namedItem('password') as HTMLInputElement).value;
  const email = endpoint === 'register' ? (form.elements.namedItem('email') as HTMLInputElement).value : undefined;

  try {
    const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email })
    });
    
    // If the response is not OK, we'll process the error message from the server
    if (!response.ok) {
      const errorData = await response.json();
      // This will format the error nicely, e.g., "username: A user with that username already exists."
      const errorMessage = Object.entries(errorData)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join(' ');
      throw new Error(errorMessage || 'Authentication failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    setAuthToken(data.token);
  } catch (e) {
    if (e instanceof Error) {
      setError(e.message);
    }
  }
};

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setSelectedRestaurant(null);
    setCurrentMeal([]);
  };

  // --- Menu Selection Functions ---
  const handleRestaurantSelect = async (restaurant: Restaurant) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurants/${restaurant.id}/`, {
        headers: { 'Authorization': `Token ${authToken!}` }
      });
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
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleItemClick = (item: MenuItem) => setActiveItem(activeItem?.id === item.id ? null : item);
  const handleBack = () => {
    setSelectedRestaurant(null);
    setGroupedMenu({});
    setActiveItem(null);
  };

  // --- Meal Builder Functions ---
  const addToMeal = (item: MenuItem) => {
    setCurrentMeal(prevMeal => [...prevMeal, item]);
  };
  const removeFromMeal = (indexToRemove: number) => {
  setCurrentMeal(prevMeal => prevMeal.filter((_, index) => index !== indexToRemove));
  };
  const handleLogMeal = async () => {
    if (currentMeal.length === 0) return;
    const itemIds = currentMeal.map(item => item.id);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/log-meal/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken!}`
        },
        body: JSON.stringify({ menu_item_ids: itemIds })
      });
      if (!response.ok) throw new Error('Failed to log meal');
      alert('Meal logged successfully!');
      setCurrentMeal([]);
    } catch (e) {
      if (e instanceof Error) setError(e.message);
    }
  };

  const mealTotals = useMemo(() => {
    return currentMeal.reduce((totals, item) => {
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.fat += item.fat;
      totals.carbohydrates += item.carbohydrates;
      return totals;
    }, { calories: 0, protein: 0, fat: 0, carbohydrates: 0 });
  }, [currentMeal]);

  // --- Main Render Logic ---

  if (!authToken) {
    return (
      <div className="auth-container">
        {isLoginView ? (
          <form onSubmit={(e) => handleAuth(e, 'login')}>
            <h2>Login</h2>
            <input name="username" type="text" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
            <p onClick={() => setIsLoginView(false)}>Need an account? Register</p>
          </form>
        ) : (
          <form onSubmit={(e) => handleAuth(e, 'register')}>
            <h2>Register</h2>
            <input name="username" type="text" placeholder="Username" required />
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Register</button>
            <p onClick={() => setIsLoginView(true)}>Already have an account? Login</p>
          </form>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Fast Food Tracker</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      
      <main className="main-content">
        <div className="menu-view">
          {selectedRestaurant ? (
            <div>
              <button onClick={handleBack}>&larr; Back to Restaurants</button>
              <h2>Menu for {selectedRestaurant.name}</h2>
              {Object.entries(groupedMenu).map(([category, items]) => (
                <div key={category} className="category-section">
                  <h3>{category}</h3>
                  <div className="menu-list">
                    {items.map(item => (
                      <div key={item.id} className="menu-item">
                        <div className="menu-item-header" onClick={() => handleItemClick(item)}>
                          <span>{item.name}</span>
                          <span>{item.calories} cal</span>
                        </div>
                        {activeItem?.id === item.id && (
                          <div className="menu-item-details">
                            <p><strong>Serving Size:</strong> {item.serving_size || 'N/A'}</p>
                            <p><strong>Protein:</strong> {item.protein}g</p>
                            <p><strong>Fat:</strong> {item.fat}g</p>
                            <p><strong>Carbs:</strong> {item.carbohydrates}g</p>
                            <button className="add-button" onClick={() => addToMeal(item)}>Add to Meal</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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

        <div className="meal-sidebar">
          <h2>Current Meal</h2>
          {currentMeal.length === 0 ? (
            <p>Add items from the menu to build your meal.</p>
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
                <p><strong>Protein:</strong> {mealTotals.protein.toFixed(1)}g</p>
                <p><strong>Fat:</strong> {mealTotals.fat.toFixed(1)}g</p>
                <p><strong>Carbs:</strong> {mealTotals.carbohydrates.toFixed(1)}g</p>
              </div>
              <button className="log-button" onClick={handleLogMeal}>Log Meal</button>
            </>
          )}
        </div>
      </main>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default App;