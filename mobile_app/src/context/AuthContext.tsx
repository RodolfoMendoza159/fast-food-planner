// In mobile_app/src/context/AuthContext.tsx

import React, { createContext, useContext } from 'react';

// This is the exact same code from old App.tsx
interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};