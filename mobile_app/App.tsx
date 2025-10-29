// In mobile_app/App.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // This is a loading spinner
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigation Imports
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- (1) CRITICAL CONFIGURATION ---
// TODO: REPLACE THIS IP WITH YOUR COMPUTER'S LOCAL IP ADDRESS
// This is the IP you found earlier with 'ipconfig' or 'ifconfig'
const API_BASE_URL = 'http://192.168.1.178:8000/api'; 
// ---

// --- (2) AUTHENTICATION CONTEXT ---
// This will provide the auth token to all screens in our app
interface AuthContextType {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to easily access the auth context
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// --- (3) MAIN APP ENTRY POINT ---
export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Check for stored token on app launch
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        setAuthToken(token);
      } catch (e) {
        console.error('Failed to load auth token', e);
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    setAuthToken(null);
  };

  // Show a loading spinner while we check for the token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, logout }}>
      <NavigationContainer>
        {authToken ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

// --- (4) NAVIGATION ---
// We create "stacks" of screens
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// This is the stack for when the user is NOT logged in
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="AuthScreen" component={AuthScreen} />
    </AuthStack.Navigator>
  );
}

// This is the stack for when the user IS logged in
function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={PlaceholderDashboardScreen} />
      <Tab.Screen name="History" component={PlaceholderHistoryScreen} />
      <Tab.Screen name="Favorites" component={PlaceholderFavoritesScreen} />
      <Tab.Screen name="Profile" component={PlaceholderProfileScreen} />
    </Tab.Navigator>
  );
}

// --- (5) AUTHENTICATION SCREEN ---
// This is your translated Login/Register form from the old App.tsx
function AuthScreen() {
  const { setAuthToken } = useAuth();
  
  // States are identical to your web app
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // handleAuth function is almost identical, just with the new URL
  const handleAuth = async () => {
    setError(null);
    const url = isLoginView 
      ? `${API_BASE_URL}/login/` 
      : `${API_BASE_URL}/register/`;
      
    const body = isLoginView 
      ? { username, password } 
      : { username, email, password };
      
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json(); // Read JSON regardless of response.ok

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(data.error || 'Authentication failed');
      }

      await AsyncStorage.setItem('authToken', data.token);
      setAuthToken(data.token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.authContainer}
      >
        <Text style={styles.title}>{isLoginView ? 'Login' : 'Register'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        {!isLoginView && (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry // Hides the password
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {isLoginView ? 'Login' : 'Register'}
          </Text>
        </Pressable>

        <Pressable onPress={() => { setIsLoginView(!isLoginView); setError(null); }}>
          <Text style={styles.toggleText}>
            {isLoginView ? 'Need an account? Register' : 'Have an account? Login'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- (6) PLACEHOLDER SCREENS ---
// These are temporary screens so the tab navigator works.
// We will replace these with your real component code next.

function PlaceholderDashboardScreen() {
  return <SafeAreaView><View><Text>Dashboard Screen</Text></View></SafeAreaView>;
}
function PlaceholderHistoryScreen() {
  return <SafeAreaView><View><Text>History Screen</Text></View></SafeAreaView>;
}
function PlaceholderFavoritesScreen() {
  return <SafeAreaView><View><Text>Favorites Screen</Text></View></SafeAreaView>;
}
function PlaceholderProfileScreen() {
  // We can even add the logout button here already
  const { logout } = useAuth();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.placeholderContainer}>
        <Text>Profile Screen</Text>
        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


// --- (7) STYLESHEET ---
// This is your new "CSS" file, written in JavaScript.
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f6', // From your old App.css body
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff', // From your old App.css button
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  toggleText: {
    color: '#007bff',
    marginTop: 20,
  },
  placeholderContainer: {
    flex: 1,
    padding: 16,
  }
});