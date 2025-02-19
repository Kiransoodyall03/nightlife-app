import React, { useState, useEffect } from 'react'; // Added useEffect
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { styles } from './styles';
import TitleComponent from '../../../src/components/Title-Light/title-animated';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../src/services/auth/useAuth';
import { validateEmail } from '../../../src/services/auth/validation';
import { LoginScreenNavigationProp } from '../../../types/navigation';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../../src/services/firebase/config';
WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { performLogin, loading, error } = useAuth();

  // 🔴 Google Authentication Hook 🔴
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_CLIENT_ID, // From Google Cloud Console
    webClientId: process.env.EXPO_FIREBASE_CLIENT_ID, // From Firebase Project
  });

  // 🔴 Handle Google Auth Response 🔴
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, credential)
        .then(() => navigation.navigate('DrawerNavigator'))
        .catch((error) => Alert.alert('Google Sign-In Error', error.message));
    }
  }, [response]);

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const result = await performLogin(email, password);
    
    if (result.success) {
      navigation.navigate('DrawerNavigator');
    }
  };

  return (
    <ImageBackground
      source={require('@assets/icons/login-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Title Section */}
        <View style={styles.titleContainer}>
          <TitleComponent text="NightLife" />
        </View>

        {/* Social Login Buttons */}
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}>
          <Image
            source={require('@assets/icons/apple-icon.png')}
            style={styles.socialIcon}
          />
          <Text style={[styles.socialButtonText, { color: '#000000' }]}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* 🔴 Updated Google Sign-In Button 🔴 */}
        <TouchableOpacity 
          style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <Image
            source={require('@assets/icons/google-icon.png')}
            style={styles.socialIcon}
          />
          <Text style={[styles.socialButtonText, { color: '#000000' }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Rest of your existing components */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput 
          style={styles.input} 
          placeholder="Enter Your Email" 
          placeholderTextColor="#C4C4C4"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          placeholderTextColor="#C4C4C4"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Log-in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signUpButtonText}>Sign-up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;