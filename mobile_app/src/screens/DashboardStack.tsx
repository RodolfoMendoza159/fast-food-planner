// In mobile_app/src/screens/DashboardStack.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Button,
} from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker'; // <-- NEW: Import Picker

// --- Our App Imports ---
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext';
import { API_BASE_URL } from '../constants.example'; 
import MealReviewScreen from './MealReviewScreen';
import LogSuccessScreen from './LogSuccessScreen';

// --- (1) Type Definitions (UPDATED) ---
type Restaurant = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};
// NEW: Added CategoryScreen
type DashboardStackParamList = {
  DashboardHome: undefined;
  Categories: { restaurantId: number; restaurantName: string }; // <-- NEW
  Menu: {
    restaurantId: number;
    restaurantName: string;
    categoryName: string; // <-- NEW
  };
  MealReview: undefined;
  LogSuccess: undefined;
};

// Updated props
type DashboardScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'DashboardHome'
>;
type CategoryScreenProps = NativeStackScreenProps< // <-- NEW
  DashboardStackParamList,
  'Categories'
>;
type MenuScreenProps = NativeStackScreenProps<
  DashboardStackParamList,
  'Menu'
>;

// --- (2) Stack Navigator ---
const Stack = createNativeStackNavigator<DashboardStackParamList>();

// --- (3) Dashboard Screen (Restaurant List - UPDATED) ---
function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { authToken } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ... fetchRestaurants function is unchanged ...
  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      const data = await response.json();
      setRestaurants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [authToken]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Restaurant</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              // --- UPDATED: Navigate to Categories, not Menu ---
              navigation.navigate('Categories', {
                restaurantId: item.id,
                restaurantName: item.name,
              })
            }
          >
            <Text style={styles.title}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// --- (4) NEW: Category Screen ---
function CategoryScreen({ route, navigation }: CategoryScreenProps) {
  const { restaurantId, restaurantName } = route.params;
  const { authToken } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        // We fetch *all* items for this restaurant and find
        // the unique categories on the client-side.
        const response = await fetch(
          `${API_BASE_URL}/items/?restaurant=${restaurantId}`,
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );
        const items: MenuItem[] = await response.json();

        // Use a Set to get unique category names
        const categorySet = new Set<string>();
        items.forEach((item) => {
          if (item.category) {
            categorySet.add(item.category);
          }
        });

        setCategories(Array.from(categorySet).sort()); // Sort categories alphabetically
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [restaurantId, authToken]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories for {restaurantName}</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              // --- Navigate to Menu, passing the category ---
              navigation.navigate('Menu', {
                restaurantId,
                restaurantName,
                categoryName: item,
              })
            }
          >
            <Text style={styles.title}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// --- (5) Menu Screen (UPDATED) ---
function MenuScreen({ route, navigation }: MenuScreenProps) {
  // --- UPDATED: Now receives categoryName ---
  const { restaurantId, restaurantName, categoryName } = route.params;
  const { authToken } = useAuth();
  const { addItemToMeal, currentMeal } = useMeal();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // --- UPDATED: Default sort is now 'name' (alphabetical) ---
  const [sortBy, setSortBy] = useState('name');

  const fetchMenuItems = async () => {
    setIsLoading(true);
    
    const params = new URLSearchParams({
      restaurant: String(restaurantId),
      category: categoryName, // <-- NEW: Filter by category
      search: searchQuery,
      ordering: sortBy,
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/items/?${params.toString()}`,
        {
          headers: { 'Authorization': `Token ${authToken}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch menu items');
      
      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPDATED: Re-fetch if categoryName changes ---
  useEffect(() => {
    fetchMenuItems();
  }, [searchQuery, sortBy, restaurantId, categoryName]);

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => addItemToMeal(item)}
    >
      <View>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.subtitle}>
          {`Cals: ${item.calories} | Prot: ${item.protein}g | Carbs: ${item.carbohydrates}g`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 1. Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder={`Search in ${categoryName}...`}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* 2. --- NEW: Sort Dropdown (Picker) --- */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Sort By:</Text>
        <Picker
          selectedValue={sortBy}
          style={styles.picker}
          onValueChange={(itemValue) => setSortBy(itemValue)}
        >
          <Picker.Item label="Alphabetical (A-Z)" value="name" />
          <Picker.Item label="Calories (High-Low)" value="-calories" />
          <Picker.Item label="Calories (Low-High)" value="calories" />
          <Picker.Item label="Protein (High-Low)" value="-protein" />
          <Picker.Item label="Protein (Low-High)" value="protein" />
          <Picker.Item label="Carbs (High-Low)" value="-carbohydrates" />
          <Picker.Item label="Carbs (Low-High)" value="carbohydrates" />
        </Picker>
      </View>

      {/* 3. Review Meal Button */}
      <Button
        title={`Review Meal (${currentMeal.length} items)`}
        onPress={() => navigation.navigate('MealReview')}
        disabled={currentMeal.length === 0}
      />

      {/* 4. Menu Item List */}
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }}/>
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMenuItem}
          ListHeaderComponent={() => (
            <Text style={styles.listHeader}>{categoryName}</Text>
          )}
        />
      )}
    </View>
  );
}

// --- (6) Main Stack Navigator (UPDATED) ---
export default function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      {/* --- NEW: Added CategoryScreen to the stack --- */}
      <Stack.Screen 
        name="Categories" 
        component={CategoryScreen} 
        options={{
          headerShown: true,
          title: 'Select Category',
        }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          headerShown: true, 
          title: 'Select Items',
        }}
      />
      <Stack.Screen name="MealReview" component={MealReviewScreen} />
      <Stack.Screen name="LogSuccess" component={LogSuccessScreen} />
    </Stack.Navigator>
  );
}

// --- (7) Styles (UPDATED) ---
// (Using the local styles workaround from before)
const styles = StyleSheet.create({
  // --- Global Styles ---
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  listItem: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // --- Component-Specific Styles ---
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 10,
    backgroundColor: '#fff',
  },
  listHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  // --- NEW Picker Styles ---
  pickerContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerLabel: {
    fontSize: 12,
    color: 'gray',
    paddingLeft: 10,
    paddingTop: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});