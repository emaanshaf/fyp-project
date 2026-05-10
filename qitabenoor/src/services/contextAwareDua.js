// src/services/contextAwareDua.js
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Weather API (OpenWeatherMap - free)
// Get your free API key from: https://openweathermap.org/api
const WEATHER_API_KEY = 'deb8380ac097696491f1673294af8cdc'; // Replace with your actual API key
const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';

// Dua categories based on context
const DUAS = {
  // Time-based Duas
  timeBased: {
    Fajr: [
      { arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا", translation: "O Allah, by You we enter the morning and by You we enter the evening", reference: "Morning Dua" },
      { arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ فَمِنْكَ وَحْدَكَ", translation: "O Allah, whatever blessing I have received is from You alone", reference: "Morning Gratitude" }
    ],
    Sunrise: [
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلاً مُتَقَبَّلاً", translation: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds", reference: "After Fajr Dua" }
    ],
    Dhuhr: [
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ وَرَحْمَتِكَ", translation: "O Allah, I ask You of Your bounty and mercy", reference: "Midday Dua" }
    ],
    Asr: [
      { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحَزَنِ", translation: "O Allah, I seek refuge in You from anxiety and grief", reference: "Afternoon Dua" }
    ],
    Maghrib: [
      { arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا", translation: "O Allah, by You we enter the evening and by You we enter the morning", reference: "Evening Dua" }
    ],
    Isha: [
      { arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا", translation: "O Allah, with Your name I die and live", reference: "Night Dua" }
    ],
    Tahajjud: [
      { arabic: "اللَّهُمَّ رَبَّ السَّمَاوَاتِ وَالأَرْضِ وَرَبَّ الْعَرْشِ الْعَظِيمِ", translation: "O Allah, Lord of the heavens and the earth and Lord of the Mighty Throne", reference: "Tahajjud Dua" }
    ]
  },
  
  // Weather-based Duas
  weatherBased: {
    Rain: [
      { arabic: "اللَّهُمَّ صَيِّبًا نَافِعًا", translation: "O Allah, (make it) a beneficial rain", reference: "When it rains" },
      { arabic: "اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا", translation: "O Allah, around us and not upon us", reference: "When rain is heavy" },
      { arabic: "مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ", translation: "We have been given rain by the grace and mercy of Allah", reference: "After rain" }
    ],
    Hot: [
      { arabic: "اللَّهُمَّ أَجِرْنَا مِنْ حَرِّ جَهَنَّمَ", translation: "O Allah, protect us from the heat of Hellfire", reference: "Hot weather Dua" },
      { arabic: "اللَّهُمَّ أَظِلَّنَا تَحْتَ ظِلِّ عَرْشِكَ", translation: "O Allah, shade us under the shade of Your throne", reference: "Seeking shade from heat" }
    ],
    Cold: [
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الدِّفْءَ", translation: "O Allah, I ask You for warmth", reference: "Cold weather Dua" },
      { arabic: "اللَّهُمَّ أَنْتَ الْكَنُّ", translation: "O Allah, You are the shelter", reference: "Seeking shelter from cold" }
    ],
    Windy: [
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فِيهَا", translation: "O Allah, I ask You for the good of it", reference: "Windy conditions" }
    ],
    Thunderstorm: [
      { arabic: "سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ", translation: "Glory to the One whom thunder glorifies with His praise and the angels from fear of Him", reference: "During thunder" }
    ],
    Clear: [
      { arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَشَفَ عَنَّا هَذَا", translation: "All praise is for Allah who removed this from us", reference: "When weather clears" }
    ]
  },
  
  // Location-based Duas
  locationBased: {
    Mountain: [
      { arabic: "سُبْحَانَ الَّذِى خَلَقَ هَذِهِ الْجِبَالَ", translation: "Glory to the One who created these mountains", reference: "Seeing mountains" },
      { arabic: "اللَّهُمَّ ثَبِّتْنَا عَلَى الْجِبَالِ", translation: "O Allah, make us firm like mountains", reference: "Mountain strength" }
    ],
    Beach: [
      { arabic: "اللَّهُمَّ إِنَّ هَذَا الْبَحْرَ يَشْهَدُ بِعَظَمَتِكَ", translation: "O Allah, this sea testifies to Your greatness", reference: "At the beach" }
    ],
    Forest: [
      { arabic: "سُبْحَانَ الَّذِي خَلَقَ هَذِهِ الْأَشْجَارَ", translation: "Glory to the One who created these trees", reference: "In the forest" }
    ],
    Desert: [
      { arabic: "اللَّهُمَّ أَنْزِلْ عَلَيْنَا رَحْمَتَكَ", translation: "O Allah, send down Your mercy upon us", reference: "In the desert" },
      { arabic: "اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ عَطَشِ الْقِيَامَةِ", translation: "O Allah, we seek refuge in You from the thirst of the Day of Judgment", reference: "In arid lands" }
    ],
    City: [
      { arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي مَدِينَتِنَا", translation: "O Allah, bless us in our city", reference: "Urban setting" }
    ],
    Farm: [
      { arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي زُرُوعِنَا", translation: "O Allah, bless us in our crops", reference: "Agricultural area" }
    ]
  },
  
  // Special condition Duas
  specialCondition: {
    Travel: [
      { arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", translation: "Glory to Him who has subjected this to us, and we could never have done it by ourselves", reference: "When boarding transport" },
      { arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى", translation: "O Allah, we ask You in this journey of ours for righteousness and piety", reference: "Travel Dua" }
    ],
    EnterMosque: [
      { arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", translation: "O Allah, open for me the doors of Your mercy", reference: "Entering mosque" }
    ],
    LeaveMosque: [
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ", translation: "O Allah, I ask You of Your bounty", reference: "Leaving mosque" }
    ],
    Stress: [
      { arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", translation: "Allah is sufficient for me, there is no deity except Him, in Him I put my trust, and He is the Lord of the Mighty Throne", reference: "During difficulty" }
    ],
    Grateful: [
      { arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ", translation: "All praise is for Allah in every condition", reference: "General gratitude" },
      { arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ", translation: "All praise is for Allah by whose blessings good deeds are completed", reference: "For blessings" }
    ]
  },
  
  // General daily Duas
  general: [
    { arabic: "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ", translation: "All praise is for Allah in every condition", reference: "General gratitude" },
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", translation: "Our Lord, give us good in this world and good in the Hereafter and protect us from the punishment of the Fire", reference: "Quran 2:201" },
    { arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translation: "Glory be to Allah, praise be to Allah, there is no deity except Allah, and Allah is the Greatest", reference: "Daily Dhikr" },
    { arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", translation: "I seek forgiveness from Allah, my Lord, for every sin and I repent to Him", reference: "Istighfar" },
    { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", translation: "There is no power and no strength except with Allah", reference: "Daily Remembrance" }
  ]
};

// Get current time-based context
const getTimeBasedContext = () => {
  const hour = new Date().getHours();
  
  if (hour >= 4 && hour < 6) return { name: 'Fajr', period: 'Dawn (4-6 AM)', dua: 'Fajr' };
  if (hour >= 6 && hour < 7) return { name: 'Sunrise', period: 'Sunrise (6-7 AM)', dua: 'Sunrise' };
  if (hour >= 12 && hour < 14) return { name: 'Dhuhr', period: 'Noon (12-2 PM)', dua: 'Dhuhr' };
  if (hour >= 15 && hour < 17) return { name: 'Asr', period: 'Afternoon (3-5 PM)', dua: 'Asr' };
  if (hour >= 17 && hour < 19) return { name: 'Maghrib', period: 'Sunset (5-7 PM)', dua: 'Maghrib' };
  if (hour >= 19 && hour < 21) return { name: 'Isha', period: 'Night (7-9 PM)', dua: 'Isha' };
  if (hour >= 22 || hour < 4) return { name: 'Tahajjud', period: 'Late night (10 PM - 4 AM)', dua: 'Tahajjud' };
  
  return { name: 'General Time', period: 'General', dua: null };
};

// Get Islamic date (simplified calculation)
const getIslamicDate = () => {
  const date = new Date();
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  // Simplified Hijri calculation
  const gregorianYear = date.getFullYear();
  const hijriYear = gregorianYear - 622;
  const dayOfYear = Math.floor((date - new Date(gregorianYear, 0, 0)) / (24 * 60 * 60 * 1000));
  const hijriDay = (dayOfYear % 354) + 1;
  const hijriMonth = Math.floor(dayOfYear / 29.5) % 12;
  
  return {
    hijri: {
      day: hijriDay,
      month: islamicMonths[hijriMonth],
      year: hijriYear,
      fullDate: `${hijriDay} ${islamicMonths[hijriMonth]} ${hijriYear} AH`
    },
    gregorian: {
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    specialEvent: null
  };
};

// Get real location from device
const getRealLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return { name: 'Pakistan', city: 'Attock', country: 'Pakistan', gotLocation: false };
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
    
    if (reverseGeocode && reverseGeocode.length > 0) {
      const geo = reverseGeocode[0];
      const city = geo.city || geo.district || geo.region || 'Attock';
      const country = geo.country || 'Pakistan';
      
      return {
        name: `${city}, ${country}`,
        city: city,
        country: country,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        gotLocation: true
      };
    }
    
    return { name: 'Attock, Pakistan', city: 'Attock', country: 'Pakistan', gotLocation: false };
  } catch (error) {
    console.log('Location error:', error);
    return { name: 'Attock, Pakistan', city: 'Attock', country: 'Pakistan', gotLocation: false };
  }
};

// Get real weather from API
const getRealWeather = async (latitude, longitude) => {
  try {
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
      // Return mock weather if no API key
      const hour = new Date().getHours();
      let temp = 25;
      if (hour > 22 || hour < 6) temp = 18;
      else if (hour > 12) temp = 32;
      else temp = 25;
      return { temperature: temp, condition: 'Clear', description: 'Pleasant weather' };
    }
    
    const response = await axios.get(`${WEATHER_API}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`, {
      timeout: 10000
    });
    
    if (response.data) {
      const temp = Math.round(response.data.main.temp);
      const weatherCondition = response.data.weather[0].main;
      const weatherDescription = response.data.weather[0].description;
      
      let condition = 'Clear';
      let weatherCategory = 'Clear';
      
      if (weatherCondition === 'Rain' || weatherCondition === 'Drizzle') {
        condition = 'Rain';
        weatherCategory = 'Rain';
      } else if (weatherCondition === 'Thunderstorm') {
        condition = 'Thunderstorm';
        weatherCategory = 'Rain';
      } else if (temp > 30) {
        condition = 'Hot';
        weatherCategory = 'Hot';
      } else if (temp < 15) {
        condition = 'Cold';
        weatherCategory = 'Cold';
      } else if (weatherCondition === 'Clear') {
        condition = 'Clear';
        weatherCategory = 'Clear';
      }
      
      return { 
        temperature: temp, 
        condition: weatherCategory, 
        description: weatherDescription 
      };
    }
    
    return { temperature: 25, condition: 'Clear', description: 'Pleasant weather' };
  } catch (error) {
    console.log('Weather API error:', error);
    return { temperature: 25, condition: 'Clear', description: 'Weather data unavailable' };
  }
};

// Get special day of week
const getSpecialDay = () => {
  const day = new Date().getDay();
  if (day === 5) return { name: 'Friday', dua: 'Friday' };
  return null;
};

// Get context-aware Duas - MAIN FUNCTION
export const getContextAwareDuas = async () => {
  try {
    const recommendedDuas = [];
    
    // 1. Get Islamic date info
    const islamicInfo = getIslamicDate();
    
    // 2. Get time context
    const timeContext = getTimeBasedContext();
    if (timeContext.dua && DUAS.timeBased[timeContext.dua]) {
      recommendedDuas.push({
        category: `⏰ ${timeContext.name} Time Dua (${timeContext.period})`,
        icon: 'time',
        duas: DUAS.timeBased[timeContext.dua]
      });
    }
    
    // 3. Get location
    const locationInfo = await getRealLocation();
    
    // Add location-specific dua
    recommendedDuas.push({
      category: `📍 Dua for ${locationInfo.city}, ${locationInfo.country}`,
      icon: 'location',
      duas: [
        { 
          arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي بَلَدِنَا هَذَا", 
          translation: `O Allah, bless us in ${locationInfo.city}, ${locationInfo.country}`, 
          reference: "Dua for your city" 
        },
        { 
          arabic: "اللَّهُمَّ اجْعَلْ فِي هَذِهِ الْبَلْدَةِ أَمْنًا وَرِزْقًا", 
          translation: "O Allah, make this city safe and provide for its people", 
          reference: "Dua for security and provision" 
        }
      ]
    });
    
    // 4. Get weather
    let weatherInfo = { temperature: 25, condition: 'Clear', description: 'Pleasant' };
    if (locationInfo.latitude && locationInfo.longitude) {
      weatherInfo = await getRealWeather(locationInfo.latitude, locationInfo.longitude);
    }
    
    // Add weather-based duas
    if (weatherInfo.condition === 'Hot') {
      recommendedDuas.push({
        category: `☀️ Hot Weather Dua (${weatherInfo.temperature}°C)`,
        icon: 'cloud',
        duas: DUAS.weatherBased.Hot
      });
    } else if (weatherInfo.condition === 'Cold') {
      recommendedDuas.push({
        category: `❄️ Cold Weather Dua (${weatherInfo.temperature}°C)`,
        icon: 'cloud',
        duas: DUAS.weatherBased.Cold
      });
    } else if (weatherInfo.condition === 'Rain') {
      recommendedDuas.push({
        category: `🌧️ Rainy Weather Dua`,
        icon: 'cloud',
        duas: DUAS.weatherBased.Rain
      });
    } else {
      recommendedDuas.push({
        category: `🌤️ Pleasant Weather Dua (${weatherInfo.temperature}°C - ${weatherInfo.description})`,
        icon: 'cloud',
        duas: DUAS.weatherBased.Clear
      });
    }
    
    // 5. Add Friday special duas
    const specialDay = getSpecialDay();
    if (specialDay && DUAS.specialCondition[specialDay.name]) {
      recommendedDuas.push({
        category: `📿 ${specialDay.name} Special Dua`,
        icon: 'star',
        duas: DUAS.specialCondition[specialDay.name]
      });
    }
    
    // 6. Add general duas
    recommendedDuas.push({
      category: '💫 Daily Recommended Duas',
      icon: 'heart',
      duas: DUAS.general
    });
    
    // Create context info
    const context = {
      time: timeContext,
      location: locationInfo,
      weather: weatherInfo,
      islamicDate: islamicInfo,
      specialEvent: islamicInfo.specialEvent
    };
    
    await cacheContext(context);
    
    return {
      context: context,
      duas: recommendedDuas
    };
    
  } catch (error) {
    console.error('Error in getContextAwareDuas:', error);
    
    // Return fallback data
    return {
      context: {
        time: { name: 'General' },
        location: { name: 'Pakistan', city: 'Attock' },
        weather: { temperature: 25, description: 'Pleasant' },
        islamicDate: { hijri: { fullDate: 'Loading...' } }
      },
      duas: [
        {
          category: '💫 Daily Duas',
          icon: 'heart',
          duas: DUAS.general
        }
      ]
    };
  }
};

// Cache context
const cacheContext = async (context) => {
  try {
    const cacheEntry = { context, timestamp: Date.now() };
    await AsyncStorage.setItem('cached_context', JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Cache error:', error);
  }
};

// Get cached context
export const getCachedContext = async () => {
  try {
    const cached = await AsyncStorage.getItem('cached_context');
    if (cached) {
      const cacheEntry = JSON.parse(cached);
      if (Date.now() - cacheEntry.timestamp < 3600000) { // 1 hour cache
        return cacheEntry.context;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Refresh context
export const refreshContext = async () => {
  return await getContextAwareDuas();
};

// Export for compatibility
export const getCurrentContext = getContextAwareDuas;