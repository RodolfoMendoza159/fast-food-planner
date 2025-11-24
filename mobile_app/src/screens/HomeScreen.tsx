import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Modal, TextInput, ScrollView, ActivityIndicator, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext';
import { API_BASE_URL } from '../constants.example';
import { styles as globalStyles } from '../styles'; // Import global styles

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { authToken } = useAuth();
  const { addItemToMeal } = useMeal();

  const [modalVisible, setModalVisible] = useState(false);
  const [targetCals, setTargetCals] = useState('700');
  const [randomMeal, setRandomMeal] = useState<any[]>([]);
  const [totalCals, setTotalCals] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchRandomMeal = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/random_meal/?target=${targetCals}`, {
        headers: { 'Authorization': `Token ${authToken}` }
      });
      const data = await response.json();
      setRandomMeal(data.items || []);
      setTotalCals(data.total_calories || 0);
    } catch (e) {
      Alert.alert("Error", "Could not generate meal.");
    } finally {
      setLoading(false);
    }
  };

  const acceptMeal = () => {
    randomMeal.forEach(item => addItemToMeal(item));
    setModalVisible(false);
    Alert.alert("Added!", "Items added to your review list.");
    // Navigate to the Meal Review screen inside the Build Meal stack
    navigation.navigate('Build Meal', { screen: 'MealReview' });
  };

  return (
    <View style={styles.container}>
      {/* Header / Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Fast Food Planner</Text>
        <Text style={styles.subBannerText}>Eat smarter, faster.</Text>
      </View>

      {/* Main Grid Buttons */}
      <View style={styles.grid}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#FF9F1C' }]} 
          onPress={() => navigation.navigate('Build Meal')}
        >
          <Text style={styles.cardText}>🍔 Build a Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#2EC4B6' }]} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.cardText}>🎲 Pick for Me</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#E71D36' }]} 
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.cardText}>📅 History</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, { backgroundColor: '#011627' }]} 
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.cardText}>⭐ Favorites</Text>
        </TouchableOpacity>
      </View>

      {/* Random Meal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Random Meal Generator</Text>
            
            <Text>Target Calories:</Text>
            <TextInput 
              style={globalStyles.input} 
              value={targetCals} 
              onChangeText={setTargetCals} 
              keyboardType="number-pad" 
            />

            {loading ? (
              <ActivityIndicator size="large" color="#2EC4B6" />
            ) : (
              randomMeal.length > 0 && (
                <ScrollView style={{ maxHeight: 150, width: '100%', marginVertical: 10 }}>
                  {randomMeal.map((item, index) => (
                    <Text key={index} style={{ fontSize: 16 }}>• {item.name} ({item.calories} cal)</Text>
                  ))}
                  <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Total: {totalCals} cal</Text>
                </ScrollView>
              )
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 15 }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: 'red' }}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={fetchRandomMeal} style={styles.actionBtn}>
                <Text style={{ color: '#fff' }}>{randomMeal.length > 0 ? "Try Again" : "Generate"}</Text>
              </TouchableOpacity>

              {randomMeal.length > 0 && (
                <TouchableOpacity onPress={acceptMeal} style={[styles.actionBtn, { backgroundColor: 'green' }]}>
                  <Text style={{ color: '#fff' }}>Accept</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6', padding: 20 },
  banner: { marginBottom: 30, marginTop: 40, alignItems: 'center' },
  bannerText: { fontSize: 32, fontWeight: '900', color: '#333' },
  subBannerText: { fontSize: 16, color: '#666', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  cardText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  actionBtn: { backgroundColor: '#2EC4B6', padding: 10, borderRadius: 5 },
});