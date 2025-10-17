// In frontend/src/MealHistory.tsx

import { useState, useEffect } from 'react';

// R: A simple interface for the items within our history
interface HistoryMenuItem {
  id: number;
  name: string;
}

// R: UPDATED interface to include the new 'items' array
interface HistoryEntry {
  id: number;
  date: string;
  calories_consumed: number;
  protein_consumed: number;
  fat_consumed: number;
  carbs_consumed: number;
  items: HistoryMenuItem[]; // This is the new field from our backend
}

interface MealHistoryProps {
  authToken: string | null;
}

function MealHistory({ authToken }: MealHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://127.0.0.1:8000/api/history/', {
          headers: { 'Authorization': `Token ${authToken}` },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch meal history.');
        }
        const data = await response.json();
        setHistory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [authToken]);

  if (loading) {
    return <p>Loading your meal history...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="history-container">
      <h2>Your Meal History</h2>
      {history.length === 0 ? (
        <p>You haven't logged any meals yet.</p>
      ) : (
        <div className="history-list">
          {history.map(entry => (
            <div key={entry.id} className="history-card">
              <h3>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
              <div className="history-card-body">
                <div className="history-macros">
                  <p><strong>Calories:</strong> {entry.calories_consumed.toFixed(0)}</p>
                  <p><strong>Protein:</strong> {entry.protein_consumed.toFixed(1)}g</p>
                  <p><strong>Fat:</strong> {entry.fat_consumed.toFixed(1)}g</p>
                  <p><strong>Carbs:</strong> {entry.carbs_consumed.toFixed(1)}g</p>
                </div>
                {/* R: This is the new section that displays the list of items */}
                <div className="history-items">
                  <h4>Items Logged:</h4>
                  <ul>
                    {entry.items.map(item => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MealHistory;