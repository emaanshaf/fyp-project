// src/screens/DuaScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  Alert,
  Share,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { getContextAwareDuas } from '../services/contextAwareDua';

export default function DuaScreen() {
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDua, setSelectedDua] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [contextInfo, setContextInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDuas();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant gallery permission to save duas');
    }
  };

  const loadDuas = async () => {
    setLoading(true);
    try {
      const data = await getContextAwareDuas();
      
      if (data && data.duas && data.duas.length > 0) {
        const allDuas = [];
        data.duas.forEach(category => {
          if (category.duas && category.duas.length > 0) {
            category.duas.forEach(dua => {
              allDuas.push({
                id: `${category.category}-${Math.random()}`,
                category: category.category,
                arabic: dua.arabic,
                translation: dua.translation,
                reference: dua.reference
              });
            });
          }
        });
        setDuas(allDuas);
        setContextInfo(data.context);
      } else {
        setDuas(getFallbackDuas());
      }
    } catch (error) {
      console.error('Error loading duas:', error);
      setDuas(getFallbackDuas());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDuas();
    setRefreshing(false);
  };

  const getFallbackDuas = () => {
    return [
      {
        id: '1',
        category: 'Morning Dua',
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
        translation: "O Allah, by You we enter the morning and by You we enter the evening",
        reference: "Morning Dua"
      },
      {
        id: '2',
        category: 'Evening Dua',
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا",
        translation: "O Allah, by You we enter the evening and by You we enter the morning",
        reference: "Evening Dua"
      },
      {
        id: '3',
        category: 'Quranic Dua',
        arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً",
        translation: "Our Lord, give us good in this world and good in the Hereafter",
        reference: "Surah Al-Baqarah 2:201"
      },
      {
        id: '4',
        category: 'Forgiveness Dua',
        arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ",
        translation: "My Lord, forgive me and accept my repentance, You are the Acceptor of repentance, the Merciful",
        reference: "Istighfar Dua"
      }
    ];
  };

  const saveDuaToGallery = async (dua) => {
    try {
      // Request permission first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow access to gallery to save duas');
        return;
      }

      // Create formatted text for the dua
      const duaText = `🤲 ${dua.reference}
      
${dua.arabic}

${dua.translation}

— Qitab-e-Noor App
Your Companion in Faith`;

      const fileName = `Dua_${dua.reference.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.txt`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write the file
      await FileSystem.writeAsStringAsync(fileUri, duaText, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Qitab-e-Noor', asset, false);
      
      Alert.alert('Success', 'Dua saved to gallery!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save dua. Please try again.');
    }
  };

  const shareDua = async (dua) => {
    try {
      const message = `🤲 *${dua.reference}*\n\n${dua.arabic}\n\n${dua.translation}\n\n— Qitab-e-Noor App`;
      
      await Share.share({
        message: message,
        title: dua.reference,
        subject: dua.reference
      }, {
        dialogTitle: `Share ${dua.reference}`
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const renderContextCard = () => {
    if (!contextInfo) return null;
    
    return (
      <View style={styles.contextCard}>
        <Text style={styles.contextTitle}>🌍 Your Context</Text>

        {/* {contextInfo.islamicDate?.hijri && (
          <View style={styles.contextRow}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.contextText}>
              Islamic Date: <Text style={styles.contextValue}>
                {contextInfo.islamicDate.hijri.fullDate || 'Loading...'}
              </Text>
            </Text>
          </View>
        )*/}
        
        {contextInfo.specialEvent && (
          <View style={styles.specialEventRow}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.specialEventText}>✨ {contextInfo.specialEvent} ✨</Text>
          </View>
        )}
        
        <View style={styles.contextRow}>
          <Ionicons name="time" size={18} color="#fff" />
          <Text style={styles.contextText}>
            Time: <Text style={styles.contextValue}>{contextInfo.time?.name || 'General'}</Text>
          </Text>
        </View>
        
        <View style={styles.contextRow}>
          <Ionicons name="location" size={18} color="#fff" />
          <Text style={styles.contextText}>
            Location: <Text style={styles.contextValue}>
              {contextInfo.location?.city || contextInfo.location?.name || 'Pakistan'}
            </Text>
          </Text>
        </View>
        
        <View style={styles.contextRow}>
          <Ionicons name="thermometer" size={18} color="#fff" />
          <Text style={styles.contextText}>
            Weather: <Text style={styles.contextValue}>
              {contextInfo.weather?.temperature || '--'}°C
            </Text> - {contextInfo.weather?.description || 'Pleasant'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={16} color="#fff" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDuaItem = (dua, index) => (
    <TouchableOpacity
      key={index}
      style={styles.duaCard}
      onPress={() => {
        setSelectedDua(dua);
        setModalVisible(true);
      }}
    >
      <View style={styles.duaHeader}>
        <Ionicons name="bookmark" size={20} color="#2E7D32" />
        <Text style={styles.duaCategory}>{dua.category}</Text>
      </View>
      
      <Text style={styles.duaArabic} numberOfLines={2}>
        {dua.arabic}
      </Text>
      <Text style={styles.duaTranslation} numberOfLines={2}>
        {dua.translation}
      </Text>
      <Text style={styles.duaReference}>{dua.reference}</Text>
      
      <View style={styles.duaActions}>
        <TouchableOpacity 
          style={styles.duaActionBtn}
          onPress={() => saveDuaToGallery(dua)}
        >
          <Ionicons name="download-outline" size={18} color="#2E7D32" />
          <Text style={styles.duaActionText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.duaActionBtn}
          onPress={() => shareDua(dua)}
        >
          <Ionicons name="share-outline" size={18} color="#2E7D32" />
          <Text style={styles.duaActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading Duas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
      >
        {renderContextCard()}
        
        <View style={styles.duasContainer}>
          <Text style={styles.sectionTitle}>📖 Recommended Duas</Text>
          {duas.map((dua, index) => renderDuaItem(dua, index))}
        </View>
      </ScrollView>

      {/* Dua Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            {selectedDua && (
              <>
                <Text style={styles.modalTitle}>{selectedDua.reference}</Text>
                <Text style={styles.modalArabic}>{selectedDua.arabic}</Text>
                <Text style={styles.modalTranslation}>{selectedDua.translation}</Text>
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalAction}
                    onPress={() => saveDuaToGallery(selectedDua)}
                  >
                    <Ionicons name="download-outline" size={24} color="#2E7D32" />
                    <Text style={styles.modalActionText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalAction}
                    onPress={() => shareDua(selectedDua)}
                  >
                    <Ionicons name="share-outline" size={24} color="#2E7D32" />
                    <Text style={styles.modalActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#2E7D32',
    fontSize: 16,
  },
  contextCard: {
    backgroundColor: '#2E7D32',
    margin: 15,
    padding: 15,
    borderRadius: 15,
  },
  contextTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contextText: {
    color: '#fff',
    fontSize: 13,
    marginLeft: 8,
  },
  contextValue: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  specialEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,215,0,0.2)',
    padding: 6,
    borderRadius: 8,
  },
  specialEventText: {
    color: '#FFD700',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  refreshText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  duasContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  duaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  duaCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  duaArabic: {
    fontSize: 18,
    textAlign: 'right',
    color: '#333',
    marginBottom: 8,
    lineHeight: 28,
  },
  duaTranslation: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  duaReference: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginBottom: 8,
  },
  duaActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  duaActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  duaActionText: {
    fontSize: 11,
    color: '#2E7D32',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalArabic: {
    fontSize: 24,
    textAlign: 'right',
    color: '#333',
    marginBottom: 15,
    lineHeight: 40,
  },
  modalTranslation: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  modalAction: {
    alignItems: 'center',
  },
  modalActionText: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 5,
  },
});