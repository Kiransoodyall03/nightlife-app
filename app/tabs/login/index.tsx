import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { styles } from './styles';
import TitleComponent from '../../../src/components/Title/title-animated';

const LoginScreen = () => {
  return (
    <ImageBackground
      source={require('@assets/icons/login-background.png')} // Replace with your actual background image URL
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.headerTitleContainer}>
          <Image
            source={require('@assets/icons/discover-icon.png')}
            style={styles.headerIcon}
          />
          <TitleComponent text="NightLife" />
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Continue with{' '}
            <Text style={{ color: '#4285F4', fontWeight: 'bold' }}>G</Text>
            <Text style={{ color: '#EA4335', fontWeight: 'bold' }}>o</Text>
            <Text style={{ color: '#FBBC05', fontWeight: 'bold' }}>o</Text>
            <Text style={{ color: '#4285F4', fontWeight: 'bold' }}>g</Text>
            <Text style={{ color: '#34A853', fontWeight: 'bold' }}>l</Text>
            <Text style={{ color: '#EA4335', fontWeight: 'bold' }}>e</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>
            Continue with{' '}
            <Text style={{ fontWeight: 'bold' }}> Apple</Text>
          </Text>
        </TouchableOpacity>

        {/* Input Fields */}
        <TextInput style={styles.input} placeholder="Enter Your Email" placeholderTextColor="#C4C4C4" />
        <TextInput
          style={styles.input}
          placeholder="Enter Your Password"
          placeholderTextColor="#C4C4C4"
          secureTextEntry
        />

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={styles.signInText}>Sign-in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
