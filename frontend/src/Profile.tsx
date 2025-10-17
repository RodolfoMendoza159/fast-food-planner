// In frontend/src/Profile.tsx

import { useState, useEffect } from 'react';

interface ProfileProps {
  authToken: string | null;
}

function Profile({ authToken }: ProfileProps) {
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [initialGoal, setInitialGoal] = useState<number>(2000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch the user's profile data when the component loads
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) {
        setIsLoading(false);
        setError("You are not logged in.");
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data.');
        }

        const data = await response.json();
        setCalorieGoal(data.calorie_goal);
        setInitialGoal(data.calorie_goal); // Store the initial value
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authToken]);

  // Handle the form submission to update the calorie goal
  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${authToken}`,
        },
        body: JSON.stringify({ calorie_goal: calorieGoal }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile.');
      }
      
      const data = await response.json();
      setCalorieGoal(data.calorie_goal);
      setInitialGoal(data.calorie_goal);


      setSuccessMessage('Your calorie goal has been updated successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <p>Loading your profile...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      <form onSubmit={handleProfileUpdate}>
        <div className="form-group">
          <label htmlFor="calorieGoal">Daily Calorie Goal:</label>
          <input
            type="number"
            id="calorieGoal"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(Number(e.target.value))}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn-submit">
          Update Goal
        </button>
      </form>
    </div>
  );
}

export default Profile;