import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { styles } from './styles';
import TitleComponent from '../../../src/components/Title-Light/title-animated';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../src/services/auth/useAuth'; // Update path accordingly
import { validateEmail } from '../../../src/services/auth/validation'; // Update path accordingly
import { LoginScreenNavigationProp } from '../../../types/navigation'; // Update path

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { performLogin, loading, error } = useAuth();
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

        {/* Social Login Buttons (Placeholder) */}
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}>
          <Image
            source={require('@assets/icons/apple-icon.png')}
            style={styles.socialIcon}
          />
          <Text style={[styles.socialButtonText, { color: '#000000' }]}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}>
          <Image
            source={require('@assets/icons/google-icon.png')}
            style={styles.socialIcon}
          />
          <Text style={[styles.socialButtonText, { color: '#000000' }]}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Input Fields */}
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

        {/* Error Message */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Login Button */}
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

        {/* Sign Up Navigation */}
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