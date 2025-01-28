import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
import { styles } from './styles';
import TitleComponent from '../../../src/components/Title/title-animated';
import { testFirebaseConnection } from 'firebase/config';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testFirebaseConnection();
      if (isConnected) {
        console.log("Firebase connection successful!");
      } else {
        console.log("Firebase connection failed.");
      }
    };
    checkConnection();
  }, []);

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
          placeholder="Enter Your Email/Username" 
          placeholderTextColor="#C4C4C4"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          placeholderTextColor="#C4C4C4"
          secureTextEntry
        />

        {/* Action Buttons */}
        
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Log-in</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={() => navigation.navigate('SignUp' as never)}
        >
          <Text style={styles.signUpButtonText}>Sign-up</Text>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
};

export default LoginScreen;