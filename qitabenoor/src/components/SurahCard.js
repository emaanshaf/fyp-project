// src/components/SurahCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SurahCard({ surah, index, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{surah.number}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.arabicName}>{surah.name}</Text>
        <Text style={styles.englishName}>{surah.englishName}</Text>
      </View>
      <View style={styles.ayahContainer}>
        <Text style={styles.ayahCount}>{surah.numberOfAyahs} ayahs</Text>
        <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  number: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
  },
  arabicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  englishName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ayahContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ayahCount: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
});