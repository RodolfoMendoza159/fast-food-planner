// In frontend/src/App.tsx

import { useState, useEffect } from 'react';
import './App.css'; // You can ignore the CSS for now

// Define a type for our restaurant data for TypeScript
interface Restaurant {
  id: number;
  name: string;
}

function App() {
  // 'useState' creates a state variable to hold our data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 'useEffect' runs code when the component first loads
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        // NOTE: We are calling your Django API here!
        const response = await fetch('http://127.0.0.1:8000/api/restaurants/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setRestaurants(data); // Save the fetched data to our state
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        }
      } finally {
        setLoading(false); // Stop showing the loading message
      }
    }

    fetchRestaurants();
  }, []); // The empty array means this effect runs only once

  return (
    <div>
      <h1>Fast Food Tracker</h1>
      <h2>Restaurants</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <ul>
        {restaurants.map(restaurant => (
          <li key={restaurant.id}>{restaurant.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;