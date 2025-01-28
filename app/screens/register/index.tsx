import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from './styles';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import TitleComponent from 'src/components/Title/title-animated';

const SignUpScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    setErrorMessage('');
    
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // You can add additional user profile update here if needed
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TitleComponent text="NightLife" />
        </View>
      
      <TextInput
        style={styles.input}
        placeholder="Enter a Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter Your Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Your Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign-up</Text>
      </TouchableOpacity>
    </View>
  );
};
export default SignUpScreen;