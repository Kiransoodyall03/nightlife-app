import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

import { styles } from './styles';
import TitleComponent from '../../../src/components/Title-Light/title-animated';
import { useUser } from '../../../src/context/UserContext';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import { validateEmail } from '../../../src/services/auth/validation';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { showSuccess, showError } = useNotification();
  const { signIn, signInWithGoogle, loading } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Expo Google Auth hook
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.googleAndroidClientId,
    iosClientId:     Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId:     Constants.expoConfig?.extra?.googleWebClientId,
  });

  useEffect(() => {
    // Handle Google response
    if (response?.type === 'success') {
      promptSaveGoogleToken()
        .then(() => signInWithGoogle())
        .then(() => {
          showSuccess('Welcome back!');
          navigation.navigate('DrawerNavigator');
        })
        .catch(err => showError(err.message));
    }
  }, [response]);

  // Save the id_token so UserContext can pick it up
  const promptSaveGoogleToken = async () => {
    if (response?.type === 'success' && response.authentication?.idToken) {
      const idToken = response.authentication.idToken;
      await SecureStore.setItemAsync('NL_googleId', idToken);
    } else {
      throw new Error('Google authentication failed or idToken missing');
    }
  };

  const onEmailLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      await signIn(email, password);
      showSuccess('Logged in successfully');
      navigation.navigate('DrawerNavigator');
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <ImageBackground
      source={require('@assets/icons/login-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TitleComponent text="NightLife" />
        </View>

        {/* Removed authError display since error is not available from useUser */}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#C4C4C4"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#C4C4C4"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={onEmailLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginButtonText}>Log In</Text>
          }
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, { backgroundColor: '#fff' }]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Image
            source={require('@assets/icons/google-icon.png')}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
