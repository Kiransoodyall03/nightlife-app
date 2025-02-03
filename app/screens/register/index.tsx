import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { styles } from './styles';
import { useAuth } from '../../../src/services/auth/useAuth';
import { validateEmail, validatePassword, validateUsername } from '../../../src/services/auth/validation';
import TitleComponent from '../../../src/components/Title-Dark/title-animated';
import { NavigationProp } from '@react-navigation/native';

interface ValidationState {
  isValid: boolean;
  message: string;
}

const RegisterScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { handleRegister, loading, error } = useAuth();

  // Validation states
  const [usernameValidation, setUsernameValidation] = useState<ValidationState>({
    isValid: true,
    message: '',
  });
  const [emailValidation, setEmailValidation] = useState<ValidationState>({
    isValid: true,
    message: '',
  });
  const [passwordValidation, setPasswordValidation] = useState<ValidationState>({
    isValid: true,
    message: '',
  });
  const [confirmPasswordValidation, setConfirmPasswordValidation] = useState<ValidationState>({
    isValid: true,
    message: '',
  });

  // Real-time validation effects
  useEffect(() => {
    if (username) {
      setUsernameValidation({
        isValid: validateUsername(username),
        message: validateUsername(username) ? '✓ Valid username' : '⚠️ Username must be at least 3 characters',
      });
    }
  }, [username]);

  useEffect(() => {
    if (email) {
      setEmailValidation({
        isValid: validateEmail(email),
        message: validateEmail(email) ? '✓ Valid email' : '⚠️ Please enter a valid email address',
      });
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      setPasswordValidation({
        isValid: validatePassword(password),
        message: validatePassword(password) 
          ? '✓ Password meets requirements' 
          : '⚠️ Password must be at least 6 characters',
      });
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setConfirmPasswordValidation({
        isValid: password === confirmPassword,
        message: password === confirmPassword 
          ? '✓ Passwords match' 
          : '⚠️ Passwords do not match',
      });
    }
  }, [confirmPassword, password]);

  const handleSubmit = async () => {
    // Validate all fields before submission
    if (!validateUsername(username) || !validateEmail(email) || 
        !validatePassword(password) || password !== confirmPassword) {
      Alert.alert('Error', 'Please fix all validation errors before submitting');
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

  // Helper function to determine text color based on validation
  const getValidationTextStyle = (isValid: boolean) => ({
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
    color: isValid ? '#4CAF50' : '#F44336',
  });

  return (
    <View style={styles.container}>
      <TitleComponent text="NightLife" />
      
      <TextInput
        style={[
          styles.input,
          !usernameValidation.isValid && username && styles.inputError
        ]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      {username && (
        <Text style={getValidationTextStyle(usernameValidation.isValid)}>
          {usernameValidation.message}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          !emailValidation.isValid && email && styles.inputError
        ]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {email && (
        <Text style={getValidationTextStyle(emailValidation.isValid)}>
          {emailValidation.message}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          !passwordValidation.isValid && password && styles.inputError
        ]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {password && (
        <Text style={getValidationTextStyle(passwordValidation.isValid)}>
          {passwordValidation.message}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          !confirmPasswordValidation.isValid && confirmPassword && styles.inputError
        ]}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {confirmPassword && (
        <Text style={getValidationTextStyle(confirmPasswordValidation.isValid)}>
          {confirmPasswordValidation.message}
        </Text>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <TouchableOpacity 
        style={[
          styles.button,
          (!usernameValidation.isValid || !emailValidation.isValid || 
           !passwordValidation.isValid || !confirmPasswordValidation.isValid) && 
          styles.buttonDisabled
        ]} 
        onPress={handleSubmit}
        disabled={loading || !usernameValidation.isValid || !emailValidation.isValid || 
                 !passwordValidation.isValid || !confirmPasswordValidation.isValid}
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