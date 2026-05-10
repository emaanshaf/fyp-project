// src/screens/ZakatScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ZakatScreen() {
  // Gold in different units
  const [goldGrams, setGoldGrams] = useState('');
  const [goldTolas, setGoldTolas] = useState('');
  const [goldOunces, setGoldOunces] = useState('');
  
  // Silver in different units
  const [silverGrams, setSilverGrams] = useState('');
  const [silverTolas, setSilverTolas] = useState('');
  const [silverOunces, setSilverOunces] = useState('');
  
  // Cash and other assets
  const [cash, setCash] = useState('');
  const [savings, setSavings] = useState('');
  const [businessAssets, setBusinessAssets] = useState('');
  const [investment, setInvestment] = useState('');
  const [otherAssets, setOtherAssets] = useState('');
  
  // Debts/liabilities
  const [debts, setDebts] = useState('');
  
  const [zakatAmount, setZakatAmount] = useState(null);
  const [nisabValue, setNisabValue] = useState(null);

  // Conversion constants
  const GRAM_TO_TOLA = 11.6638;
  const GRAM_TO_OUNCE = 31.1035;
  
  // Current market prices (to be updated via API)
  const GOLD_PRICE_PER_GRAM = 18500; // PKR per gram (adjust as needed)
  const SILVER_PRICE_PER_GRAM = 250; // PKR per gram

  // Calculate total gold in grams from all units
  const calculateTotalGoldGrams = () => {
    let total = 0;
    
    if (goldGrams) total += parseFloat(goldGrams) || 0;
    if (goldTolas) total += (parseFloat(goldTolas) || 0) * GRAM_TO_TOLA;
    if (goldOunces) total += (parseFloat(goldOunces) || 0) * GRAM_TO_OUNCE;
    
    return total;
  };

  // Calculate total silver in grams from all units
  const calculateTotalSilverGrams = () => {
    let total = 0;
    
    if (silverGrams) total += parseFloat(silverGrams) || 0;
    if (silverTolas) total += (parseFloat(silverTolas) || 0) * GRAM_TO_TOLA;
    if (silverOunces) total += (parseFloat(silverOunces) || 0) * GRAM_TO_OUNCE;
    
    return total;
  };

  // Calculate total wealth
  const calculateTotalWealth = () => {
    const totalGoldGrams = calculateTotalGoldGrams();
    const totalSilverGrams = calculateTotalSilverGrams();
    
    const goldValue = totalGoldGrams * GOLD_PRICE_PER_GRAM;
    const silverValue = totalSilverGrams * SILVER_PRICE_PER_GRAM;
    const cashValue = parseFloat(cash) || 0;
    const savingsValue = parseFloat(savings) || 0;
    const businessValue = parseFloat(businessAssets) || 0;
    const investmentValue = parseFloat(investment) || 0;
    const otherValue = parseFloat(otherAssets) || 0;
    const debtsValue = parseFloat(debts) || 0;
    
    const totalAssets = goldValue + silverValue + cashValue + savingsValue + businessValue + investmentValue + otherValue;
    const totalWealth = totalAssets - debtsValue;
    
    return { totalWealth, goldValue, silverValue };
  };

  // Calculate Nisab (threshold for Zakat)
  const calculateNisab = () => {
    // Nisab is 87.48 grams of gold or 612.36 grams of silver
    const GOLD_NISAB_GRAMS = 87.48;
    const SILVER_NISAB_GRAMS = 612.36;
    
    const goldNisabValue = GOLD_NISAB_GRAMS * GOLD_PRICE_PER_GRAM;
    const silverNisabValue = SILVER_NISAB_GRAMS * SILVER_PRICE_PER_GRAM;
    
    // Use the lower of the two (silver nisab is usually lower)
    return Math.min(goldNisabValue, silverNisabValue);
  };

  const calculateZakat = () => {
    // Validate inputs
    const totalGoldGrams = calculateTotalGoldGrams();
    const totalSilverGrams = calculateTotalSilverGrams();
    
    if (totalGoldGrams === 0 && totalSilverGrams === 0 && !cash && !savings && !businessAssets && !investment && !otherAssets) {
      Alert.alert('Info', 'Please enter at least one asset value');
      return;
    }
    
    const { totalWealth, goldValue, silverValue } = calculateTotalWealth();
    const nisab = calculateNisab();
    setNisabValue(nisab);
    
    if (totalWealth < nisab) {
      Alert.alert(
        'Not Eligible for Zakat',
        `Your total wealth (PKR ${totalWealth.toLocaleString()}) is below the Nisab threshold (PKR ${nisab.toLocaleString()}). Zakat is not applicable.`,
        [{ text: 'OK' }]
      );
      setZakatAmount(null);
      return;
    }
    
    const zakat = totalWealth * 0.025; // 2.5%
    setZakatAmount(zakat);
    
    Alert.alert(
      'Zakat Calculation',
      `Your total wealth: PKR ${totalWealth.toLocaleString()}\nNisab threshold: PKR ${nisab.toLocaleString()}\nZakat (2.5%): PKR ${zakat.toLocaleString()}`,
      [{ text: 'OK' }]
    );
  };

  const resetForm = () => {
    setGoldGrams('');
    setGoldTolas('');
    setGoldOunces('');
    setSilverGrams('');
    setSilverTolas('');
    setSilverOunces('');
    setCash('');
    setSavings('');
    setBusinessAssets('');
    setInvestment('');
    setOtherAssets('');
    setDebts('');
    setZakatAmount(null);
    setNisabValue(null);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📖 What is Zakat?</Text>
          <Text style={styles.infoText}>
            Zakat is one of the Five Pillars of Islam. It is a mandatory charity
            calculated as 2.5% of your savings and wealth that has been in your
            possession for one lunar year.
          </Text>
          <View style={styles.nisabInfo}>
            <Text style={styles.nisabTitle}>💰 Nisab Threshold:</Text>
            <Text style={styles.nisabValue}>87.48 grams of Gold</Text>
            <Text style={styles.nisabValue}>OR 612.36 grams of Silver</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>💰 Gold</Text>
          
          <View style={styles.rowInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grams (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={goldGrams}
                onChangeText={setGoldGrams}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tolas</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={goldTolas}
                onChangeText={setGoldTolas}
              />
              <Text style={styles.hint}>1 Tola = 11.66g</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ounces (oz)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={goldOunces}
                onChangeText={setGoldOunces}
              />
              <Text style={styles.hint}>1 oz = 31.10g</Text>
            </View>
          </View>

          <Text style={styles.formTitle}>🥈 Silver</Text>
          
          <View style={styles.rowInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grams (g)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={silverGrams}
                onChangeText={setSilverGrams}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tolas</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={silverTolas}
                onChangeText={setSilverTolas}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ounces (oz)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={silverOunces}
                onChangeText={setSilverOunces}
              />
            </View>
          </View>

          <Text style={styles.formTitle}>💵 Cash & Assets</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Cash on hand (PKR)"
              keyboardType="numeric"
              value={cash}
              onChangeText={setCash}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="wallet-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Bank Savings (PKR)"
              keyboardType="numeric"
              value={savings}
              onChangeText={setSavings}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Business Assets (PKR)"
              keyboardType="numeric"
              value={businessAssets}
              onChangeText={setBusinessAssets}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="trending-up-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Investments/Stocks (PKR)"
              keyboardType="numeric"
              value={investment}
              onChangeText={setInvestment}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="apps-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Other Assets (PKR)"
              keyboardType="numeric"
              value={otherAssets}
              onChangeText={setOtherAssets}
            />
          </View>

          <Text style={styles.formTitle}>📉 Liabilities</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Debts / Loans (PKR)"
              keyboardType="numeric"
              value={debts}
              onChangeText={setDebts}
            />
            <Text style={styles.hint}>Subtract from total assets</Text>
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateZakat}>
            <Text style={styles.calculateButtonText}>Calculate Zakat</Text>
          </TouchableOpacity>

          {zakatAmount !== null && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Your Zakat Amount:</Text>
              <Text style={styles.resultAmount}>PKR {formatNumber(zakatAmount)}</Text>
              {nisabValue && (
                <Text style={styles.nisabResult}>Nisab Threshold: PKR {formatNumber(nisabValue)}</Text>
              )}
              <TouchableOpacity style={styles.resetButton} onPress={resetForm}>
                <Text style={styles.resetButtonText}>Calculate Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Gold Price Info */}
        <View style={styles.priceInfo}>
          <Text style={styles.priceInfoText}>
            💰 Current Gold Price: PKR {GOLD_PRICE_PER_GRAM.toLocaleString()}/g
          </Text>
          <Text style={styles.priceInfoText}>
            🥈 Current Silver Price: PKR {SILVER_PRICE_PER_GRAM.toLocaleString()}/g
          </Text>
          <Text style={styles.priceInfoSmall}>
            *Prices are approximate. Check local market rates for accuracy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  infoCard: {
    backgroundColor: '#2E7D32',
    margin: 15,
    padding: 20,
    borderRadius: 15,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  nisabInfo: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  nisabTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nisabValue: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    flex: 1,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  hint: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  calculateButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  resultAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  nisabResult: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  resetButton: {
    padding: 10,
  },
  resetButtonText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  priceInfo: {
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  priceInfoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  priceInfoSmall: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});