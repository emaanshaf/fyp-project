// src/services/quranApi.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.alquran.cloud/v1';

export const TRANSLATIONS = {
  ENGLISH: { id: 'en.sahih', name: 'English', code: 'en', translator: 'Sahih International' },
  URDU: { id: 'ur.jalandhry', name: 'Urdu', code: 'ur', translator: 'Jalandhry' },
  SPANISH: { id: 'es.cortes', name: 'Spanish', code: 'es', translator: 'Julio Cortes' },
  FRENCH: { id: 'fr.hamidullah', name: 'French', code: 'fr', translator: 'Hamidullah' },
  INDONESIAN: { id: 'id.indonesian', name: 'Indonesian', code: 'id', translator: 'Indonesian Ministry' },
  TURKISH: { id: 'tr.diyanet', name: 'Turkish', code: 'tr', translator: 'Diyanet' }
};

// Available reciters
export const RECITERS = {
  AL_AFASY: { id: 'ar.alafasy', name: 'Mishary Rashid Al-Afasy' },
  ABDUL_BASIT: { id: 'ar.abdulbasit', name: 'Abdul Basit' },
  MAHER: { id: 'ar.maher', name: 'Maher Al Muaiqly' }
};

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;

const cacheData = async (key, data) => {
  try {
    const cacheEntry = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Cache error:', error);
  }
};

const getCachedData = async (key) => {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    const cacheEntry = JSON.parse(cached);
    if (Date.now() - cacheEntry.timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    return cacheEntry.data;
  } catch (error) {
    return null;
  }
};

// Get recitation URL for a specific ayah
export const getAyahRecitationUrl = (surahNumber, ayahNumber, reciter = 'ar.alafasy') => {
  return `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNumber}_${ayahNumber}.mp3`;
};

// Get all surahs
export const getSurahs = async () => {
  try {
    const cached = await getCachedData('all_surahs');
    if (cached) {
      return cached;
    }

    const response = await axios.get(`${API_BASE}/surah`, {
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    });

    if (response.data && response.data.data) {
      const surahs = response.data.data.map(surah => ({
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        numberOfAyahs: surah.numberOfAyahs,
        revelationType: surah.revelationType
      }));
      
      await cacheData('all_surahs', surahs);
      return surahs;
    }
    throw new Error('No data received');
  } catch (error) {
    console.error('API Error:', error.message);
    const cached = await AsyncStorage.getItem('all_surahs');
    if (cached) {
      return JSON.parse(cached).data;
    }
    return getFallbackSurahs();
  }
};

// Get surah with multiple translations
export const getSurahWithTranslations = async (surahNumber, translationIds = ['en.sahih']) => {
  try {
    const cacheKey = `surah_${surahNumber}_${translationIds.join('_')}`;
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const arabicResponse = await axios.get(`${API_BASE}/surah/${surahNumber}`, {
      timeout: 15000
    });
    
    if (!arabicResponse.data || !arabicResponse.data.data) {
      throw new Error('Failed to fetch Arabic text');
    }
    
    const arabicVerses = arabicResponse.data.data.ayahs.map((ayah, index) => ({
      number: index + 1,
      text: ayah.text
    }));
    
    const translationsObj = {};
    
    for (const transId of translationIds) {
      try {
        const translationResponse = await axios.get(`${API_BASE}/surah/${surahNumber}/${transId}`, {
          timeout: 10000
        });
        
        if (translationResponse.data && translationResponse.data.data) {
          const translation = Object.values(TRANSLATIONS).find(t => t.id === transId);
          const langCode = translation?.code || transId.split('.')[0];
          
          translationsObj[langCode] = translationResponse.data.data.ayahs.map((ayah, index) => ({
            number: index + 1,
            text: ayah.text
          }));
        }
      } catch (transError) {
        console.error(`Failed to fetch ${transId} translation:`, transError.message);
        const translation = Object.values(TRANSLATIONS).find(t => t.id === transId);
        if (translation) {
          translationsObj[translation.code] = arabicVerses.map(v => ({
            number: v.number,
            text: `[${translation.name} translation will appear here]`
          }));
        }
      }
    }
    
    const result = {
      arabic: { verses: arabicVerses },
      translations: translationsObj
    };
    
    await cacheData(cacheKey, result);
    return result;
    
  } catch (error) {
    console.error('Error fetching surah:', error.message);
    const cacheKey = `surah_${surahNumber}_${translationIds.join('_')}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return cached;
    return getFallbackSurah(surahNumber, translationIds);
  }
};

const getFallbackSurahs = () => {
  const surahs = [];
  for (let i = 1; i <= 114; i++) {
    surahs.push({
      number: i,
      name: `سورة ${i}`,
      englishName: `Surah ${i}`,
      englishNameTranslation: `Surah ${i}`,
      numberOfAyahs: i === 1 ? 7 : 100,
      revelationType: i < 50 ? 'Meccan' : 'Medinan'
    });
  }
  return surahs;
};

const getFallbackSurah = (surahNumber, translationIds) => {
  const verses = [];
  const verseCount = surahNumber === 1 ? 7 : 10;
  
  for (let i = 1; i <= verseCount; i++) {
    verses.push({ number: i, text: `Loading verse ${i}...` });
  }
  
  const translations = {};
  translationIds.forEach(id => {
    const translation = Object.values(TRANSLATIONS).find(t => t.id === id);
    if (translation) {
      translations[translation.code] = verses.map(v => ({
        number: v.number,
        text: `[${translation.name} translation loading...]`
      }));
    }
  });
  
  return {
    arabic: { verses },
    translations
  };
};

export const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const quranKeys = keys.filter(key => key.includes('surah') || key === 'all_surahs');
    await AsyncStorage.multiRemove(quranKeys);
    return true;
  } catch (error) {
    return false;
  }
};