// src/components/QiblaCompass.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function QiblaCompass({ qiblaAngle }) {
  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <Ionicons name="compass" size={80} color="#2E7D32" />
        <View style={[styles.needle, { transform: [{ rotate: `${qiblaAngle || 0}deg` }] }]}>
          <Ionicons name="arrow-up" size={30} color="#d32f2f" />
        </View>
      </View>
      <Text style={styles.angleText}>{Math.round(qiblaAngle || 0)}°</Text>
      <Text style={styles.directionText}>Qibla Direction</Text>
      <Text style={styles.noteText}>Point the arrow towards Qibla</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  compassContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  needle: {
    position: 'absolute',
  },
  angleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
  },
  directionText: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  noteText: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
  },
});