// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, TouchableOpacity, Alert } from 'react-native';

import LoginScreen from './src/screens/loginScreen';
import QuranScreen from './src/screens/QuranScreen';
import PrayerScreen from './src/screens/PrayerScreen';
import DuaScreen from './src/screens/DuaScreen';
import HadithScreen from './src/screens/HadithScreen';
import ZakatScreen from './src/screens/ZakatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Main Tabs Component
function MainTabs({ navigation }) {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userName');
              
              // Clear localStorage for web
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userName');
              }
              
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Quran') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Prayer') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Duas') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Hadith') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          else if (route.name === 'Zakat') iconName = focused ? 'calculator' : 'calculator-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Quran" component={QuranScreen} />
      <Tab.Screen name="Prayer" component={PrayerScreen} />
      <Tab.Screen name="Duas" component={DuaScreen} />
      <Tab.Screen name="Hadith" component={HadithScreen} />
      <Tab.Screen name="Zakat" component={ZakatScreen} />
    </Tab.Navigator>
  );
}

// Check login status across platforms
const checkLoginStatusAsync = async () => {
  try {
    // Try AsyncStorage first (mobile)
    let loggedIn = await AsyncStorage.getItem('isLoggedIn');
    
    // If on web and AsyncStorage failed, try localStorage
    if (typeof window !== 'undefined' && !loggedIn) {
      loggedIn = localStorage.getItem('isLoggedIn');
    }
    
    return loggedIn === 'true';
  } catch (error) {
    // Try localStorage as fallback
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false;
  }
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatusAsync().then(status => {
      setIsLoggedIn(status);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}