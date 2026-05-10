// src/screens/HadithScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHadiths, searchHadiths } from '../services/hadithApi';

export default function HadithScreen() {
  const [hadiths, setHadiths] = useState([]);
  const [filteredHadiths, setFilteredHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadHadiths();
  }, []);

  const loadHadiths = async () => {
    setLoading(true);
    const data = await getHadiths();
    setHadiths(data);
    setFilteredHadiths(data);
    setLoading(false);
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredHadiths(hadiths);
    } else {
      const results = await searchHadiths(text);
      setFilteredHadiths(results);
    }
  };

  const renderHadithCard = ({ item }) => (
    <View style={styles.hadithCard}>
      <Text style={styles.hadithText}>"{item.text}"</Text>
      <View style={styles.referenceContainer}>
        <Text style={styles.referenceText}>{item.reference}</Text>
        <Text style={styles.bookText}>{item.book}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Hadith...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hadith..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredHadiths}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHadithCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2E7D32',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  hadithCard: {
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
  hadithText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  referenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  referenceText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  bookText: {
    fontSize: 12,
    color: '#999',
  },
});