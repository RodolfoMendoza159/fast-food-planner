// mobile_app/src/styles.ts

import { StyleSheet, Platform, StatusBar } from 'react-native';

// Define your brand colors here for consistency
export const COLORS = {
  primary: '#007bff',    // Standard Blue
  secondary: '#6c757d',  // Gray
  success: '#28a745',    // Green
  danger: '#dc3545',     // Red
  warning: '#FF9F1C',    // Orange (Matches Home Button)
  info: '#2EC4B6',       // Teal (Matches Home Button)
  dark: '#011627',       // Navy (Matches Home Button)
  background: '#F4F7F6', // Light Gray Background
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#cccccc',
};

export const styles = StyleSheet.create({
  // --- Layout Containers ---
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  
  // --- Typography ---
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
    marginLeft: 4,
  },
  
  // --- Inputs ---
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12, // Rounded corners for modern look
    marginBottom: 15,
    backgroundColor: COLORS.white,
    fontSize: 16,
    color: COLORS.text,
  },

  // --- Buttons ---
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
  },
  logoutButton: {
    width: '100%',
    padding: 15,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  
  // --- Auth Screen Specific ---
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  toggleText: {
    color: COLORS.primary,
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.danger,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  successText: {
    color: COLORS.success,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // --- List Items (Dashboard/History/Favorites) ---
  listItem: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});