// In mobile_app/src/screens/AuthScreen.tsx

import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles'; // We will create this file next

export default function AuthNavigator() {
  const { setAuthToken } = useAuth();

  // States are identical to your web app
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  // handleAuth function is identical to before
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

      const data = await response.json();

      if (!response.ok) {
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

        <Pressable
          onPress={() => {
            setIsLoginView(!isLoginView);
            setError(null);
          }}
        >
          <Text style={styles.toggleText}>
            {isLoginView ? 'Need an account? Register' : 'Have an account? Login'}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}