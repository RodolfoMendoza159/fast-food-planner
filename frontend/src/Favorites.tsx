// In frontend/src/Favorites.tsx

import { useState, useEffect } from 'react';

// --- INTERFACES ---
interface MenuItem { id: number; name: string; }
interface FavoriteMeal {
  id: number;
  name: string;
  items: MenuItem[];
}
interface FavoritesProps {
  authToken: string | null;
  onNavigate: (view: 'dashboard' | 'profile' | 'history' | 'favorites') => void;
}

function Favorites({ authToken, onNavigate }: FavoritesProps) {
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchFavorites = async () => {
    if (!authToken) { setLoading(false); return; }
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/favorites/', {
        headers: { 'Authorization': `Token ${authToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch favorites.');
      const data = await response.json();
      setFavorites(data);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchFavorites();
  }, [authToken]);

  const handleDelete = async (favoriteId: number) => {
    if (!authToken || !confirm('Are you sure you want to delete this favorite meal?')) return;

    try {
      await fetch(`http://127.0.0.1:8000/api/favorites/${favoriteId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${authToken}` },
      });
      fetchFavorites(); // Refresh the list
    } catch (err) { setError('Failed to delete favorite meal.'); }
  };

  const handleLogFavorite = async (favoriteId: number) => {
    if (!authToken) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/favorites/${favoriteId}/log/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${authToken}` },
      });
      if (!response.ok) throw new Error('Failed to log favorite meal.');
      setSuccessMessage('Favorite meal logged successfully! Navigating to history...');
      setTimeout(() => onNavigate('history'), 2000);
    } catch (err) { setError('Failed to log favorite meal.'); }
  };

  if (loading) return <p>Loading your favorite meals...</p>;

  return (
    <div className="favorites-container">
      <h2>Your Favorite Meals</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {favorites.length === 0 ? (
        <p>You haven't saved any favorite meals yet. Create a meal on the dashboard and save it!</p>
      ) : (
        <div className="favorites-list">
          {favorites.map(fav => (
            <div key={fav.id} className="favorite-card">
              <div className="favorite-card-header">
                <h3>{fav.name}</h3>
                <div className="favorite-card-actions">
                  <button onClick={() => handleLogFavorite(fav.id)}>Log Meal</button>
                  <button className="delete" onClick={() => handleDelete(fav.id)}>Delete</button>
                </div>
              </div>
              <div className="favorite-card-body">
                <ul>
                  {fav.items.map(item => <li key={item.id}>{item.name}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;