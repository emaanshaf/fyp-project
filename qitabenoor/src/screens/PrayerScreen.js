// src/screens/PrayerScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPrayerTimes, getQiblaDirection, getNextPrayer } from '../services/prayerApi';
import * as Location from 'expo-location';

export default function PrayerScreen() {
  const [prayerData, setPrayerData] = useState(null);
  const [qiblaAngle, setQiblaAngle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [error, setError] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    setLocationStatus('Getting location...');
    
    try {
      // Check and request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationStatus('Location permission denied. Using default location.');
      } else {
        setLocationStatus('Fetching prayer times...');
      }
      
      // Fetch prayer times from API
      const prayers = await getPrayerTimes();
      
      if (prayers && prayers.timings) {
        setPrayerData(prayers);
        const next = getNextPrayer(prayers.timings);
        setNextPrayer(next);
        setLocationStatus('');
      } else {
        setError('Could not fetch prayer times. Please check your connection.');
      }
      
      // Fetch Qibla direction
      const qibla = await getQiblaDirection();
      setQiblaAngle(qibla);
      
    } catch (error) {
      console.error('Error loading prayer data:', error);
      setError('Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getPrayerTime = (prayerName) => {
    return prayerData?.timings?.[prayerName] || '--:--';
  };

  const prayerList = [
    { name: 'Fajr', icon: '🌙', key: 'Fajr', arabic: 'الفجر' },
    { name: 'Sunrise', icon: '☀️', key: 'Sunrise', arabic: 'الشروق' },
    { name: 'Dhuhr', icon: '☀️', key: 'Dhuhr', arabic: 'الظهر' },
    { name: 'Asr', icon: '🌤️', key: 'Asr', arabic: 'العصر' },
    { name: 'Maghrib', icon: '🌅', key: 'Maghrib', arabic: 'المغرب' },
    { name: 'Isha', icon: '🌙', key: 'Isha', arabic: 'العشاء' }
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading prayer times...</Text>
        <Text style={styles.subText}>{locationStatus}</Text>
      </View>
    );
  }

  if (error && !prayerData) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline" size={60} color="#f44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />}
    >
      {/* Location and Date Card */}
      {prayerData && (
        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.locationText}>
              {prayerData.location?.fullName || `${prayerData.location?.city || 'Your City'}, ${prayerData.location?.country || 'Pakistan'}`}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.dateText}>
              {prayerData.date?.gregorian || new Date().toLocaleDateString()}
            </Text>
          </View>
          {prayerData.date?.hijri && (
            <View style={styles.hijriRow}>
              <Ionicons name="moon" size={18} color="#FFD700" />
              <Text style={styles.hijriText}>
                {prayerData.date.hijri}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Next Prayer Card */}
      {nextPrayer && (
        <View style={styles.nextPrayerCard}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          <Text style={styles.nextPrayerRemaining}>{nextPrayer.remaining}</Text>
        </View>
      )}

      {/* Prayer Times List */}
      {prayerData && prayerData.timings && (
        <View style={styles.prayerCardContainer}>
          <Text style={styles.cardTitle}>Today's Prayer Times</Text>
          {prayerList.map((prayer) => (
            <View key={prayer.key} style={styles.prayerRow}>
              <View style={styles.prayerLeft}>
                <Text style={styles.prayerIcon}>{prayer.icon}</Text>
                <View>
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                  <Text style={styles.prayerArabic}>{prayer.arabic}</Text>
                </View>
              </View>
              <Text style={styles.prayerTime}>{getPrayerTime(prayer.key)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Qibla Direction */}
      <View style={styles.qiblaCard}>
        <Text style={styles.qiblaTitle}>🕋 Qibla Direction</Text>
        <View style={styles.compassContainer}>
          <Ionicons name="compass" size={100} color="#2E7D32" />
          <View style={[styles.compassNeedle, { transform: [{ rotate: `${qiblaAngle || 0}deg` }] }]}>
            <Ionicons name="arrow-up" size={35} color="#d32f2f" />
          </View>
        </View>
        <Text style={styles.qiblaAngle}>{Math.round(qiblaAngle || 0)}°</Text>
        <Text style={styles.qiblaNote}>
          {qiblaAngle ? 
            (qiblaAngle > 180 ? `Face ${Math.round(360 - qiblaAngle)}° West of North` : `Face ${Math.round(qiblaAngle)}° East of North`) : 
            'Calculating...'}
        </Text>
      </View>

      {prayerData?.method && (
        <Text style={styles.methodText}>Calculation Method: {prayerData.method}</Text>
      )}
    </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#2E7D32',
    fontSize: 16,
  },
  subText: {
    marginTop: 5,
    color: '#999',
    fontSize: 12,
  },
  errorText: {
    marginTop: 10,
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#2E7D32',
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  hijriRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hijriText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  nextPrayerCard: {
    backgroundColor: '#1B5E20',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  nextPrayerLabel: {
    color: '#FFD700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPrayerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  nextPrayerTime: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nextPrayerRemaining: {
    color: '#A5D6A7',
    fontSize: 14,
    marginTop: 5,
  },
  prayerCardContainer: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  prayerName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  prayerArabic: {
    fontSize: 12,
    color: '#999',
  },
  prayerTime: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  qiblaCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  qiblaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  compassContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassNeedle: {
    position: 'absolute',
  },
  qiblaAngle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
  },
  qiblaNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  methodText: {
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    marginBottom: 20,
  },
});