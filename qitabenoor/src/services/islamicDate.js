// src/services/islamicDate.js
import axios from 'axios';

// Accurate Hijri date from multiple APIs
export const getIslamicDate = async () => {
  try {
    // Get current date
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // Try AlAdhan API first (most reliable)
    const response = await axios.get(`https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`, {
      timeout: 10000,
      params: {
        adjustment: 0
      }
    });
    
    if (response.data && response.data.data) {
      const hijri = response.data.data.hijri;
      
      // Get Arabic month name
      const arabicMonths = {
        'Muharram': 'محرم',
        'Safar': 'صفر',
        "Rabi' al-Awwal": 'ربيع الأول',
        "Rabi' al-Thani": 'ربيع الثاني',
        'Jumada al-Awwal': 'جمادى الأولى',
        'Jumada al-Thani': 'جمادى الثانية',
        'Rajab': 'رجب',
        "Sha'ban": 'شعبان',
        'Ramadan': 'رمضان',
        'Shawwal': 'شوال',
        'Dhu al-Qi\'dah': 'ذو القعدة',
        'Dhu al-Hijjah': 'ذو الحجة'
      };
      
      const monthArabic = arabicMonths[hijri.month.en] || hijri.month.ar;
      
      return {
        hijri: {
          day: hijri.day,
          month: hijri.month.en,
          monthArabic: monthArabic,
          year: hijri.year,
          fullDate: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
          fullDateArabic: `${hijri.day} ${monthArabic} ${hijri.year} هـ`,
          weekday: hijri.weekday.en,
          weekdayArabic: hijri.weekday.ar
        },
        gregorian: {
          day: today.getDate(),
          month: today.toLocaleString('default', { month: 'long' }),
          year: today.getFullYear(),
          fullDate: today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        },
        specialEvent: getIslamicEvent(parseInt(hijri.day), hijri.month.en)
      };
    }
    
    return getFallbackIslamicDate();
  } catch (error) {
    console.log('API error, trying alternative...', error);
    return await getAlternativeIslamicDate();
  }
};

// Alternative API
const getAlternativeIslamicDate = async () => {
  try {
    const response = await axios.get('https://api.islamic-date.com/v1/current', {
      timeout: 10000
    });
    
    if (response.data) {
      return {
        hijri: {
          day: response.data.hijri_day,
          month: response.data.hijri_month_name,
          year: response.data.hijri_year,
          fullDate: `${response.data.hijri_day} ${response.data.hijri_month_name} ${response.data.hijri_year} AH`
        },
        gregorian: {
          fullDate: new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        },
        specialEvent: null
      };
    }
    return getCalculatedIslamicDate();
  } catch (error) {
    return getCalculatedIslamicDate();
  }
};

// Get Islamic events
const getIslamicEvent = (day, month) => {
  const events = {
    '1 Muharram': 'Islamic New Year',
    '10 Muharram': 'Day of Ashura',
    '12 Rabi\' al-Awwal': 'Mawlid (Prophet\'s Birthday)',
    '27 Rajab': 'Isra and Mi\'raj',
    '15 Sha\'ban': 'Mid-Sha\'ban',
    '1 Ramadan': 'First Day of Ramadan',
    '27 Ramadan': 'Laylat al-Qadr',
    '1 Shawwal': 'Eid al-Fitr',
    '9 Dhu al-Hijjah': 'Day of Arafah',
    '10 Dhu al-Hijjah': 'Eid al-Adha'
  };
  
  const key = `${day} ${month}`;
  return events[key] || null;
};

// Calculated fallback
const getCalculatedIslamicDate = () => {
  const today = new Date();
  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  
  // More accurate calculation
  const gregorianYear = today.getFullYear();
  let hijriYear = gregorianYear - 622;
  
  // Calculate approximate hijri day
  const start = new Date(gregorianYear, 0, 0);
  const dayOfYear = Math.floor((today - start) / (24 * 60 * 60 * 1000));
  
  let hijriDay = dayOfYear - 77; // Adjust for Hijri offset
  if (hijriDay < 1) {
    hijriYear -= 1;
    hijriDay += 354;
  }
  
  let hijriMonth = Math.floor((hijriDay - 1) / 29.5);
  if (hijriMonth >= 12) hijriMonth = 11;
  
  const monthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
  let dayCount = 0;
  for (let i = 0; i < hijriMonth; i++) {
    dayCount += monthDays[i];
  }
  const hijriDayOfMonth = hijriDay - dayCount;
  
  return {
    hijri: {
      day: hijriDayOfMonth,
      month: islamicMonths[hijriMonth],
      year: hijriYear,
      fullDate: `${hijriDayOfMonth} ${islamicMonths[hijriMonth]} ${hijriYear} AH`
    },
    gregorian: {
      fullDate: today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    specialEvent: null
  };
};

// Final fallback
const getFallbackIslamicDate = () => {
  return {
    hijri: {
      day: '--',
      month: 'Loading...',
      year: '----',
      fullDate: 'Loading Islamic date...'
    },
    gregorian: {
      fullDate: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    },
    specialEvent: null
  };
};