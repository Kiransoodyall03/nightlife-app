import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { NavigationProp } from '@react-navigation/native';

import { styles } from './styles';
import TitleComponent from '../../../src/components/Title-Light/title-animated';
import { useUser } from '../../../src/context/UserContext';
import {
  validateEmail,
  validatePassword,
  validateUsername
} from '../../../src/services/auth/validation';

const GEOCODING_API   = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface ValidationState {
  isValid: boolean;
  message: string;
}

export default function RegisterScreen({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  const { register, loading } = useUser();

  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [location, setLocation]         = useState<{ address: string; latitude: number; longitude: number } | null>(null);
  const [locLoading, setLocLoading]     = useState(false);

  const [userVal, setUserVal]           = useState<ValidationState>({ isValid: true, message: '' });
  const [emailVal, setEmailVal]         = useState<ValidationState>({ isValid: true, message: '' });
  const [pwVal, setPwVal]               = useState<ValidationState>({ isValid: true, message: '' });
  const [confirmVal, setConfirmVal]     = useState<ValidationState>({ isValid: true, message: '' });

  // Real‑time validation
  useEffect(() => {
    setUserVal({ isValid: validateUsername(username), message: validateUsername(username) ? '✓' : '3+ chars' });
  }, [username]);
  useEffect(() => {
    setEmailVal({ isValid: validateEmail(email), message: validateEmail(email) ? '✓' : 'Invalid email' });
  }, [email]);
  useEffect(() => {
    setPwVal({ isValid: validatePassword(password), message: validatePassword(password) ? '✓' : '6+ chars' });
  }, [password]);
  useEffect(() => {
    setConfirmVal({ isValid: password === confirmPassword, message: password === confirmPassword ? '✓' : 'Doesn’t match' });
  }, [confirmPassword, password]);

  // Fetch user’s address via Expo‑Location + Geocoding
  const fetchLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed to register.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;
      const resp = await axios.get(GEOCODING_API, {
        params: { latlng: `${latitude},${longitude}`, key: GOOGLE_API_KEY, result_type: 'street_address|locality' },
      });
      if (resp.data.status === 'OK' && resp.data.results[0]) {
        setLocation({ address: resp.data.results[0].formatted_address, latitude, longitude });
      } else {
        setLocation({ address: `${latitude.toFixed(6)},${longitude.toFixed(6)}`, latitude, longitude });
      }
    } catch {
      Alert.alert('Error', 'Failed to fetch location.');
    } finally {
      setLocLoading(false);
    }
  };

  useEffect(() => { fetchLocation(); }, []);

  const onSubmit = async () => {
    if (!userVal.isValid || !emailVal.isValid || !pwVal.isValid || !confirmVal.isValid) {
      Alert.alert('Fix errors', 'Please correct the form before submitting.');
      return;
    }
    if (!location) {
      Alert.alert('Location missing', 'Unable to determine your address.');
      return;
    }

    try {
      await register({
        email,
        password,
        username,
        location,
      });
      navigation.navigate('Filter');
    } catch (err: any) {
      Alert.alert('Registration failed', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TitleComponent text="NightLife" />

      {locLoading
        ? <ActivityIndicator size="small" />
        : location && <Text style={styles.locationText}>{location.address}</Text>
      }

      <TextInput
        style={[styles.input, username && !userVal.isValid && styles.inputError]}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      {username !== '' && <Text style={styles.valText}>{userVal.message}</Text>}

      <TextInput
        style={[styles.input, email && !emailVal.isValid && styles.inputError]}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      {email !== '' && <Text style={styles.valText}>{emailVal.message}</Text>}

      <TextInput
        style={[styles.input, password && !pwVal.isValid && styles.inputError]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {password !== '' && <Text style={styles.valText}>{pwVal.message}</Text>}

      <TextInput
        style={[styles.input, confirmPassword && !confirmVal.isValid && styles.inputError]}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirm}
      />
      {confirmPassword !== '' && <Text style={styles.valText}>{confirmVal.message}</Text>}

      {/* If you want to show an error, ensure your context provides it, or remove this line */}

      <TouchableOpacity
        style={[styles.button, (loading || !location) && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading || !location}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Register</Text>
        }
      </TouchableOpacity>
    </View>
  );
}
