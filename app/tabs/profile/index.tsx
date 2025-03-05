import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import styles from './styles';
import { useUser } from '../../../src/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { auth, db } from '../../../src/services/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNotification } from 'src/components/Notification/NotificationContext';

const Profile = ({navigation}: {navigation: NavigationProp<any>}) => {
  const { user, userData, signOut, updateLocation, pickImage, updateSearchRadius, updateUsername } = useUser();
  const [newUsername, setNewUsername] = useState(userData?.username || '');
  const [newSearchRadius, setNewSearchRadius] = useState(userData?.searchRadius?.toString() || '5');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingRadius, setEditingRadius] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNewUsername(data?.username || '');
          setNewSearchRadius(data?.searchRadius?.toString() || '5');
        } else {
          // Initialize new user document
          await setDoc(doc(db, 'users', user.uid), {
            username: 'New User',
            email: user.email,
            searchRadius: 5,
            createdAt: new Date(),
            profilePicture: '',
            location: null
          });
          setNewUsername('New User');
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  const handleUpdateUsername = async () => {
    try {
      if (!user) throw new Error('Not authenticated');
      if (!newUsername.trim()) {
        showError('Username cannot be empty');
        return;
      }
      
      await updateUsername(newUsername);
      showSuccess("Username updated successfully");
      setEditingUsername(false);
    } catch (error) {
      showError('Failed to update username');
    }
  };

 const handleUpdateSearchRadius = async () => {
    try {
      const radius = parseInt(newSearchRadius);
      if (isNaN(radius) || radius < 1 || radius > 100) {
        showError('Search radius must be between 1-100 km');
        return;
      }
      
      await updateSearchRadius(radius);
      showSuccess("Successfully updated search radius");
      setEditingRadius(false);
    } catch (error) {
      showError('Failed to update search radius');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => setError('')}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
    contentContainerStyle = {styles.container}
      showsVerticalScrollIndicator = {false}
    >
      {/* Background Header */}
      <Image 
        source={require('../../../assets/background-art/blue-background.jpg')}
        style={styles.backgroundHeader}
      />

      {/* Profile Image Container */}
      <TouchableOpacity onPress={pickImage}>
        <View style={styles.profileImageContainer}>
          {userData?.profilePicture ? (
            <Image
              source={{ uri: userData.profilePicture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitial}>
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Profile Information Section */}
      <View style={styles.profileSection}>
        <View style={styles.inlineEditContainer}>
          {editingUsername ? (
            <>
              <TextInput
                style={styles.editInput}
                value={newUsername}
                onChangeText={setNewUsername}
                autoFocus
              />
              <TouchableOpacity onPress={handleUpdateUsername}>
                <Feather name="check" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.name}>{userData?.username || 'User'}</Text>
              <TouchableOpacity onPress={() => setEditingUsername(true)}>
                <Feather name="edit-2" size={20} color="#666" />
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.email}>{userData?.email || ''}</Text>
      </View>

      {/* Account Settings Section */}
      <View style={styles.settingsSection}>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>
            {userData?.location?.address || 'Location not available'}
          </Text>
          <TouchableOpacity
            style={styles.recalibrateButton}
            onPress={updateLocation}
          >
            <Text style={styles.recalibrateButtonText}>
              {userData?.location?.address ? 
                'Update Location' : 
                'Enable Location'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.inlineEditContainer}>
            {editingRadius ? (
              <>
                <TextInput
                  style={styles.editInput}
                  value={newSearchRadius}
                  onChangeText={setNewSearchRadius}
                  keyboardType="numeric"
                  autoFocus
                />
                <TouchableOpacity onPress={handleUpdateSearchRadius}>
                  <Feather name="check" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.settingText}>
                  Search Area: {userData?.searchRadius ? `${userData.searchRadius}km` : 'Not set'}
                </Text>
                <TouchableOpacity onPress={() => setEditingRadius(true)}>
                  <Feather name="edit-2" size={20} color="#666" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons Section */}
      <View style={[styles.actionsSection, { marginTop: 'auto' }]}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Log-out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[styles.buttonText, styles.deleteText]}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.inlineError}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

export default Profile;