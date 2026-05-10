// src/components/AudioPlayer.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

export default function AudioPlayer({ surahNumber, ayahNumber }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const getAudioUrl = () => {
    // Using reliable mp3quran.net server
    const surahPad = String(surahNumber).padStart(3, '0');
    const ayahPad = String(ayahNumber).padStart(3, '0');
    return `https://server8.mp3quran.net/afs/${surahPad}${ayahPad}.mp3`;
  };

  const playAudio = async () => {
    try {
      // Stop and unload if already playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      
      const audioUrl = getAudioUrl();
      console.log('Playing:', audioUrl);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      // Handle when playback finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          setSound(null);
        }
      });
      
    } catch (error) {
      console.error('Play error:', error);
      Alert.alert('Error', 'Could not play recitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isPlaying && styles.buttonActive]}
      onPress={playAudio}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name={isPlaying ? "stop" : "play"} size={16} color="#fff" />
          <Text style={styles.buttonText}>{isPlaying ? 'Stop' : 'Recite'}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buttonActive: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '500',
  },
});