// src/components/PrayerCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PrayerCard({ prayerName, prayerTime }) {
  return (
    <View style={styles.card}>
      <Text style={styles.prayerName}>{prayerName}</Text>
      <Text style={styles.prayerTime}>{prayerTime}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  prayerName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  prayerTime: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});