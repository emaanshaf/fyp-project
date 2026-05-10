// src/services/prayerApi.js
import axios from 'axios';
import * as Location from 'expo-location';

const PRAYER_API = 'https://api.aladhan.com/v1/timings';

export const getPrayerTimes = async () => {
  try {
    // Get current date
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // Get location
    let latitude = 33.6844;
    let longitude = 73.0479;
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
        console.log('Location detected:', latitude, longitude);
      }
    } catch (locError) {
      console.log('Location error:', locError);
    }
    
    // Fetch prayer times
    const response = await axios.get(`${PRAYER_API}/${day}-${month}-${year}`, {
      params: {
        latitude: latitude,
        longitude: longitude,
        method: 2,
        school: 1
      },
      timeout: 15000
    });
    
    if (response.data && response.data.code === 200) {
      const data = response.data.data;
      const timings = data.timings;
      const date = data.date;
      
      return {
        timings: {
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha,
          Imsak: timings.Imsak,
          Midnight: timings.Midnight
        },
        date: {
          gregorian: date.gregorian.date,
          hijri: `${date.hijri.day} ${date.hijri.month.en} ${date.hijri.year}`,
          hijriFull: date.hijri.date
        },
        method: data.meta.method.name
      };
    }
    
    throw new Error('API response invalid');
    
  } catch (error) {
    console.error('Prayer times error:', error);
    return null;
  }
};

export const getQiblaDirection = async () => {
  try {
    let latitude = 33.6844;
    let longitude = 73.0479;
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync();
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;
      }
    } catch (locError) {
      console.log('Location error for Qibla:', locError);
    }
    
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;
    
    // Calculate Qibla direction
    const φ1 = latitude * Math.PI / 180;
    const φ2 = kaabaLat * Math.PI / 180;
    const Δλ = (kaabaLng - longitude) * Math.PI / 180;
    
    const x = Math.sin(Δλ) * Math.cos(φ2);
    const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let qiblaAngle = Math.atan2(x, y) * 180 / Math.PI;
    qiblaAngle = (qiblaAngle + 360) % 360;
    
    return qiblaAngle;
    
  } catch (error) {
    console.error('Qibla error:', error);
    return 250;
  }
};

export const getNextPrayer = (timings) => {
  if (!timings) return null;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const prayers = [
    { name: 'Fajr', time: timings.Fajr },
    { name: 'Sunrise', time: timings.Sunrise },
    { name: 'Dhuhr', time: timings.Dhuhr },
    { name: 'Asr', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isha', time: timings.Isha }
  ];
  
  for (const prayer of prayers) {
    if (prayer.time) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      
      if (prayerMinutes > currentTime) {
        const diff = prayerMinutes - currentTime;
        const hoursRemaining = Math.floor(diff / 60);
        const minutesRemaining = diff % 60;
        
        return {
          name: prayer.name,
          time: prayer.time,
          remaining: hoursRemaining > 0 
            ? `${hoursRemaining}h ${minutesRemaining}m`
            : `${minutesRemaining}m`
        };
      }
    }
  }
  
  return {
    name: 'Fajr (Tomorrow)',
    time: timings.Fajr,
    remaining: 'Next day'
  };
};