import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { styles } from './styles';
import { useAuth } from '../../../src/services/auth/useAuth';
import { validateEmail, validatePassword, validateUsername } from '../../../src/services/auth/validation';
import TitleComponent from '../../../src/components/Title-Dark/title-animated';

import { NavigationProp } from '@react-navigation/native';

const RegisterScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { handleRegister, loading, error } = useAuth();

  const handleSubmit = async () => {
    if (!validateUsername(username)) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const result = await handleRegister({ username, email, password });
    
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('DrawerNavigator');
    } else {
      Alert.alert('Error', error || 'Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      <TitleComponent text="NightLife" />
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;