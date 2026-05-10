// src/screens/QuranScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSurahs, getSurahWithTranslations, TRANSLATIONS } from '../services/quranApi';
import AudioPlayer from '../components/AudioPlayer';

export default function QuranScreen() {
  const [surahs, setSurahs] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [surahData, setSurahData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedTranslations, setSelectedTranslations] = useState(['en.sahih']);
  const [showTranslationSelector, setShowTranslationSelector] = useState(false);

  useEffect(() => {
    loadSurahs();
  }, []);

  const loadSurahs = async () => {
    setLoading(true);
    const data = await getSurahs();
    setSurahs(data);
    setFilteredSurahs(data);
    setLoading(false);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === '') {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(
        (s) => s.englishName.toLowerCase().includes(text.toLowerCase()) ||
               (s.name && s.name.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredSurahs(filtered);
    }
  };

  const openSurah = async (surah) => {
    setSelectedSurah(surah);
    setModalVisible(true);
    setDetailsLoading(true);
    setSurahData(null);
    
    const data = await getSurahWithTranslations(surah.number, selectedTranslations);
    setSurahData(data);
    setDetailsLoading(false);
  };

  const toggleTranslation = (translationId) => {
    let newTranslations;
    if (selectedTranslations.includes(translationId)) {
      newTranslations = selectedTranslations.filter(id => id !== translationId);
    } else {
      newTranslations = [...selectedTranslations, translationId];
    }
    setSelectedTranslations(newTranslations);
    
    if (selectedSurah) {
      refreshSurah(newTranslations);
    }
  };

  const refreshSurah = async (translations) => {
    if (selectedSurah) {
      setDetailsLoading(true);
      const data = await getSurahWithTranslations(selectedSurah.number, translations);
      setSurahData(data);
      setDetailsLoading(false);
    }
  };

  const renderTranslationButtons = () => {
    return (
      <View style={styles.translationPanel}>
        <Text style={styles.translationTitle}>📖 Select Translations:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(TRANSLATIONS).map(([key, trans]) => (
            <TouchableOpacity
              key={trans.id}
              style={[
                styles.translationButton,
                selectedTranslations.includes(trans.id) && styles.translationButtonActive
              ]}
              onPress={() => toggleTranslation(trans.id)}
            >
              <Text style={[
                styles.translationButtonText,
                selectedTranslations.includes(trans.id) && styles.translationButtonTextActive
              ]}>
                {trans.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderVerse = ({ item, index }) => {
    return (
      <View style={styles.verseCard}>
        <View style={styles.verseHeader}>
          <View style={styles.verseNumberContainer}>
            <Text style={styles.verseNumber}>{item.number}</Text>
          </View>
          
          <AudioPlayer 
            surahNumber={selectedSurah?.number} 
            ayahNumber={item.number}
          />
        </View>
        
        <Text style={styles.arabicVerse}>{item.text}</Text>
        
        {selectedTranslations.map(transId => {
          const translation = Object.values(TRANSLATIONS).find(t => t.id === transId);
          if (!translation) return null;
          
          const translationText = surahData?.translations?.[translation.code]?.[index]?.text;
          if (!translationText) return null;
          
          return (
            <View key={transId} style={styles.translationContainer}>
              <Text style={styles.translationLabel}>{translation.name}:</Text>
              <Text style={styles.translationText}>{translationText}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSurahCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openSurah(item)}>
      <View style={styles.numberContainer}>
        <Text style={styles.number}>{item.number}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.arabicName}>{item.name || `Surah ${item.number}`}</Text>
        <Text style={styles.englishName}>{item.englishName}</Text>
        <Text style={styles.ayahCount}>{item.numberOfAyahs} verses</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Quran...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search surah..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
      </View>
      
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.number.toString()}
        renderItem={renderSurahCard}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            {selectedSurah && (
              <Text style={styles.modalTitle}>{selectedSurah.englishName}</Text>
            )}
            <TouchableOpacity onPress={() => setShowTranslationSelector(!showTranslationSelector)}>
              <Ionicons name="language" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {showTranslationSelector && renderTranslationButtons()}

          {detailsLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text>Loading surah...</Text>
            </View>
          ) : (
            <FlatList
              data={surahData?.arabic?.verses || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderVerse}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.versesList}
              ListHeaderComponent={
                selectedSurah && (
                  <View style={styles.surahHeader}>
                    <Text style={styles.surahArabic}>{selectedSurah.name}</Text>
                    <Text style={styles.surahEnglish}>{selectedSurah.englishName}</Text>
                    <Text style={styles.surahInfo}>
                      {selectedSurah.numberOfAyahs} verses • {selectedSurah.revelationType}
                    </Text>
                  </View>
                )
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#2E7D32' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    margin: 15, paddingHorizontal: 15, borderRadius: 25,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, marginLeft: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    marginHorizontal: 15, marginBottom: 10, padding: 15, borderRadius: 12,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  numberContainer: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  number: { color: '#2E7D32', fontWeight: 'bold', fontSize: 16 },
  infoContainer: { flex: 1 },
  arabicName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  englishName: { fontSize: 14, color: '#666' },
  ayahCount: { fontSize: 12, color: '#999', marginTop: 2 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    backgroundColor: '#2E7D32', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 15, paddingTop: 50
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  versesList: { padding: 15 },
  surahHeader: {
    alignItems: 'center', marginBottom: 20, padding: 15,
    backgroundColor: '#E8F5E9', borderRadius: 12
  },
  surahArabic: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  surahEnglish: { fontSize: 18, color: '#333' },
  surahInfo: { fontSize: 14, color: '#666', marginTop: 5 },
  verseCard: {
    marginBottom: 20, padding: 15, backgroundColor: '#fff',
    borderRadius: 12, boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  verseNumberContainer: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center'
  },
  verseNumber: { color: '#2E7D32', fontWeight: 'bold' },
  arabicVerse: { fontSize: 22, textAlign: 'right', color: '#333', marginBottom: 10, lineHeight: 40 },
  translationContainer: {
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee'
  },
  translationLabel: { fontSize: 12, color: '#2E7D32', fontWeight: 'bold', marginBottom: 5 },
  translationText: { fontSize: 14, color: '#555', lineHeight: 20 },
  translationPanel: {
    backgroundColor: '#fff', padding: 15, borderBottomWidth: 1,
    borderBottomColor: '#ddd', maxHeight: 120
  },
  translationTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  translationButton: {
    paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f0f0f0', marginRight: 8
  },
  translationButtonActive: { backgroundColor: '#2E7D32' },
  translationButtonText: { fontSize: 12, color: '#666' },
  translationButtonTextActive: { color: '#fff' },
});