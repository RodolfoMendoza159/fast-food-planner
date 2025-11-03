// In mobile_app/src/screens/FavoritesScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Alert, // We'll use this for confirmation
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants';
import { styles } from '../styles';
import { MenuItem } from '../context/MealContext'; // Reuse our existing interface
import { useIsFocused } from '@react-navigation/native'; // Import this hook

interface FavoriteMeal {
  id: number;
  name: string;
  items: MenuItem[];
}

export default function FavoritesScreen({ navigation }: any) {
  const { authToken } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // This hook returns `true` if the screen is focused
  const isFocused = useIsFocused();

  // We use `isFocused` as a dependency. Now, every time the user
  // taps the "Favorites" tab, this will re-run and fetch the latest data.
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/favorites/`, {
          headers: { Authorization: `Token ${authToken}` },
        });
        if (!response.ok) throw new Error('Failed to fetch favorites.');
        const data = await response.json();
        setFavorites(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if the screen is focused
    if (isFocused) {
      fetchFavorites();
    }
  }, [authToken, isFocused]); // Re-run when screen is focused

  const handleDelete = (favoriteId: number) => {
    if (!authToken) return;
    
    // Use native Alert for confirmation
    Alert.alert(
      'Delete Favorite',
      'Are you sure you want to delete this favorite meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/favorites/${favoriteId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Token ${authToken}` },
              });
              // Refresh the list by filtering out the deleted item
              setFavorites((prev) =>
                prev.filter((fav) => fav.id !== favoriteId)
              );
            } catch (err) {
              setError('Failed to delete favorite meal.');
            }
          },
        },
      ]
    );
  };

  const handleLogFavorite = async (favoriteId: number) => {
    if (!authToken) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/favorites/${favoriteId}/log/`,
        {
          method: 'POST',
          headers: { Authorization: `Token ${authToken}` },
        }
      );
      if (!response.ok) throw new Error('Failed to log favorite meal.');
      setSuccessMessage('Favorite meal logged! Going to history...');
      // Navigate to the History tab
      setTimeout(() => {
        setSuccessMessage(null);
        navigation.jumpTo('History');
      }, 2000);
    } catch (err) {
      setError('Failed to log favorite meal.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderFavoriteItem = ({ item }: { item: FavoriteMeal }) => (
    <View style={styles.favoriteCard}>
      <View style={styles.favoriteCardHeader}>
        <Text style={styles.favoriteCardTitle}>{item.name}</Text>
        <View style={styles.favoriteCardActions}>
          <Pressable
            style={styles.logFavButton}
            onPress={() => handleLogFavorite(item.id)}
          >
            <Text style={styles.buttonText}>Log</Text>
          </Pressable>
          <Pressable
            style={styles.deleteFavButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>Del</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.favoriteCardBody}>
        {item.items.map((menuItem) => (
          <Text key={menuItem.id} style={styles.itemText}>
            • {menuItem.name}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Your Favorite Meals</Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
        
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text>You haven't saved any favorite meals yet.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}