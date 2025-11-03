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
  // --- MealHistoryScreen ---
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // for Android
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    marginBottom: 8,
  },
  historyCardBody: {
    flexDirection: 'row', // This is the key: macros on left, items on right
    justifyContent: 'space-between',
  },
  historyMacros: {
    flex: 1, // Takes up 1/2 of the space
  },
  historyItems: {
    flex: 1, // Takes up 1/2 of the space
    paddingLeft: 10,
  },
  macroText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  // --- Dashboard Stack (RestaurantList) ---
  listItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemText: {
    fontSize: 18,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007bff',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    fontSize: 18,
    color: '#007bff',
    marginBottom: 10,
    fontWeight: '500',
  },
  // --- MenuItemListScreen ---
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden', // Ensures rounded corners apply to children
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1, // Allows text to wrap
    paddingRight: 10,
  },
  menuItemCals: {
    fontSize: 16,
    color: '#333',
  },
  menuItemDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addButton: {
    backgroundColor: '#28a745', // Green "Add" button
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  // --- MealReviewScreen ---
  reviewHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    marginBottom: 8,
  },
  reviewHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reviewCell: {
    flex: 1,
    fontSize: 14,
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: '#333',
    marginTop: 8,
  },
  reviewTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  summaryFinal: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
    color: '#28a745',
  },
  logButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },

  // --- LogSuccessScreen ---
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 16,
  },
  successButtonContainer: {
    width: '100%',
    marginTop: 30,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#17a2b8', // Blue-green
    marginTop: 10,
  },
});

//new  
