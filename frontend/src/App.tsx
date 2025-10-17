// In frontend/src/App.tsx

import { useState } from 'react';
import './App.css';
import Dashboard from './Dashboard';
import Profile from './Profile';
import MealHistory from './MealHistory';

interface AuthResponse { token: string; }

function App() {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'history'>('dashboard');
  
  // --- Auth form state ---
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- Auth functions ---
  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const url = isLoginView ? 'http://127.0.0.1:8000/api/login/' : 'http://127.0.0.1:8000/api/register/';
    const body = isLoginView ? { username, password } : { username, email, password };
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Authentication failed');
      }
      const data: AuthResponse = await response.json();
      localStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
    } catch (err: any) { setError(err.message); }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setCurrentView('dashboard');
  };

  // --- Login/Register View ---
  // THIS IS THE CORRECTED SECTION THAT WAS PREVIOUSLY INCOMPLETE
  if (!authToken) {
    return (
      <div className="auth-container">
        <form onSubmit={handleAuth}>
          <h2>{isLoginView ? 'Login' : 'Register'}</h2>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Username" 
            required 
          />
          {!isLoginView && (
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Email" 
              required 
            />
          )}
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
          />
          <button type="submit">{isLoginView ? 'Login' : 'Register'}</button>
          {error && <p className="error-message">{error}</p>}
          <p onClick={() => { setIsLoginView(!isLoginView); setError(null); }}>
            {isLoginView ? 'Need an account? Register' : 'Have an account? Login'}
          </p>
        </form>
      </div>
    );
  }

  // --- Main Application View (Logged In) ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>Fast Food Tracker</h1>
        <nav>
          <button onClick={() => setCurrentView('dashboard')} disabled={currentView === 'dashboard'}>Dashboard</button>
          <button onClick={() => setCurrentView('profile')} disabled={currentView === 'profile'}>Profile</button>
          <button onClick={() => setCurrentView('history')} disabled={currentView === 'history'}>History</button>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      
      <main className="App-content">
        {currentView === 'dashboard' && <Dashboard authToken={authToken} onNavigate={setCurrentView} />}
        {currentView === 'profile' && <Profile authToken={authToken} />}
        {currentView === 'history' && <MealHistory authToken={authToken} />}
      </main>
    </div>
  );
}

export default App;