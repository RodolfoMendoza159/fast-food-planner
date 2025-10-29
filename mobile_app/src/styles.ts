// In mobile_app/src/styles.ts

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // --- Global ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7f6',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f7f6',
  },
  container: {
    flex: 1,
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
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#dc3545', // Red
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: '#28a745', // Green
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  // --- AuthScreen ---
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  toggleText: {
    color: '#007bff',
    marginTop: 20,
  },

  // --- ProfileScreen ---
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  logoutButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#dc3545', // Red for logout
    borderRadius: 8,
    alignItems: 'center',
  },
});