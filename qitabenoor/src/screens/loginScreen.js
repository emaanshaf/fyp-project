// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sign Up states
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // FIXED: Less strict for testing
  const validatePassword = (password) => {
    if (password.length < 6) return false;
    return true;
  };

  const handleLogin = async () => {
    console.log('Login button pressed');
    
    if (!email) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    
    // FIXED: Removed password strength validation for login
    setLoading(true);
    
    try {
      console.log('Saving to AsyncStorage...');
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userName', email.split('@')[0]);
      
      console.log('Saved, navigating to Main');
      Alert.alert('Success', 'Login successful!');
      navigation.replace('Main');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log('Signup button pressed');
    
    if (!signupName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    if (!signupEmail) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    if (!validateEmail(signupEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    if (!signupPassword) {
      Alert.alert('Error', 'Password is required');
      return;
    }
    
    if (!validatePassword(signupPassword)) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setSignupLoading(true);
    
    try {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userEmail', signupEmail);
      await AsyncStorage.setItem('userName', signupName);
      
      setSignupModalVisible(false);
      console.log('Signup successful, navigating to Main');
      Alert.alert('Success', 'Account created successfully!');
      navigation.replace('Main');
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Sign up failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={60} color="#2E7D32" />
          </View>
          <Text style={styles.appName}>Qitab-e-Noor</Text>
          <Text style={styles.tagline}>Your Companion in Faith</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin} 
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.signupButton} 
            onPress={() => setSignupModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sign Up Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={signupModalVisible}
        onRequestClose={() => setSignupModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSignupModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Create Account</Text>
            <Text style={styles.modalSubtitle}>Join us to access all features</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={signupName}
                onChangeText={setSignupName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password (min 6 characters)"
                placeholderTextColor="#999"
                value={signupPassword}
                onChangeText={setSignupPassword}
                secureTextEntry={!showSignupPassword}
              />
              <TouchableOpacity onPress={() => setShowSignupPassword(!showSignupPassword)}>
                <Ionicons name={showSignupPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                value={signupConfirmPassword}
                onChangeText={setSignupConfirmPassword}
                secureTextEntry={!showSignupPassword}
              />
            </View>

            <TouchableOpacity 
              style={styles.signupButtonModal} 
              onPress={handleSignUp} 
              disabled={signupLoading}
              activeOpacity={0.8}
            >
              {signupLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupButtonTextModal}>Sign Up</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  headerContainer: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  tagline: { fontSize: 14, color: '#666', marginTop: 5 },
  formContainer: { backgroundColor: '#fff', marginHorizontal: 20, padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  loginTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  loginSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 25 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#fff' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  loginButton: { backgroundColor: '#2E7D32', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { marginHorizontal: 10, color: '#999' },
  signupButton: { borderWidth: 1, borderColor: '#2E7D32', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  signupButtonText: { color: '#2E7D32', fontSize: 16, fontWeight: '500' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: '90%', maxHeight: '80%' },
  modalClose: { alignSelf: 'flex-end' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  signupButtonModal: { backgroundColor: '#2E7D32', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  signupButtonTextModal: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});