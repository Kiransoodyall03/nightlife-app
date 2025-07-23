import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import styles from './styles';
import { useUser } from '../../../src/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { auth, db } from '../../../src/services/firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNotification } from 'src/components/Notification/NotificationContext';
import { UserData, LocationData } from 'src/services/auth/types';
import { useAuth } from 'src/services/auth/useAuth';

// Toggle Button component
const ToggleButton = ({ value, onToggle, disabled = false }: { value: boolean; onToggle: () => void; disabled?: boolean }) => {
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animation]);

  const togglePosition = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24]
  });

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ccc', '#4cd964']
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onToggle}
      disabled={disabled}
      style={[styles.toggleContainer, { opacity: disabled ? 0.6 : 1 }]}
    >
      <Animated.View style={[styles.toggleBackground, { backgroundColor }]}>
        <Animated.View 
          style={[
            styles.toggleCircle, 
            { transform: [{ translateX: togglePosition }] }
          ]} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const Profile = ({navigation}: {navigation: NavigationProp<any>}) => {
  const { user, userData, locationData, signOut, updateLocation, pickImage, updateSearchRadius, updateUsername } = useUser();
  const { loading: authLoading, error: authError } = useAuth();
  const [newUsername, setNewUsername] = useState(userData?.username || '');
  const [searchRadius, setSearchRadius] = useState(userData?.searchRadius || 5);
  const [editingUsername, setEditingUsername] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification();

  // New state for additional settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [removeAdsEnabled, setRemoveAdsEnabled] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setNewUsername(data?.username || '');
          setSearchRadius(data?.searchRadius || 5);
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

  const handleSearchRadiusChange = async (value: number) => {
    setSearchRadius(value);
    try {
      await updateSearchRadius(value);
    } catch (error) {
      showError('Failed to update search radius');
    }
  };

  // Empty functions for new toggles
  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    // TODO: Add notifications functionality
  };

  const handleDarkModeToggle = () => {
    setDarkModeEnabled(!darkModeEnabled);
    // TODO: Add dark mode functionality
  };

  const handleRemoveAdsToggle = () => {
    setRemoveAdsEnabled(!removeAdsEnabled);
    // TODO: Add remove ads functionality
  };

  const handlePasswordEdit = () => {
    // TODO: Navigate to password change screen
  };

  const handleDeleteAccount = () => {
    // TODO: Add delete account functionality
  };

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || authError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || authError}</Text>
        <TouchableOpacity onPress={() => setError('')}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Header */}
      <View style={styles.backgroundHeader} />

      {/* Profile Image Container */}
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
        <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
          <Feather name="edit-2" size={16} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Profile Information Section */}
      <View style={styles.profileSection}>
        <View style={styles.nameContainer}>
          {editingUsername ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={newUsername}
                onChangeText={setNewUsername}
                autoFocus
                onBlur={handleUpdateUsername}
              />
            </View>
          ) : (
            <View style={styles.nameDisplayContainer}>
              <Text style={styles.name}>{userData?.username || 'User'}</Text>
              <TouchableOpacity onPress={() => setEditingUsername(true)} style={styles.editNameButton}>
                <Feather name="edit-2" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.email}>{userData?.email || ''}</Text>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Search Area Setting */}
        <View style={styles.settingCard}>
          <Text style={styles.settingTitle}>Search Area: {Math.round(searchRadius)}km</Text>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              value={searchRadius}
              onValueChange={setSearchRadius}
              onSlidingComplete={handleSearchRadiusChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#ddd"
            />
          </View>
        </View>
        
        {/* Enable Notifications Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Notifications:</Text>
            <ToggleButton 
              value={notificationsEnabled} 
              onToggle={handleNotificationsToggle}
            />
          </View>
        </View>

        {/* Dark Mode Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark mode:</Text>
            <ToggleButton 
              value={darkModeEnabled} 
              onToggle={handleDarkModeToggle}
            />
          </View>
        </View>

        {/* Remove Advertisements Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Remove Advertisements:</Text>
            <ToggleButton 
              value={removeAdsEnabled} 
              onToggle={handleRemoveAdsToggle}
            />
          </View>
        </View>
        
        {/* Password Setting */}
        <View style={styles.settingCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Password: ••••••••••</Text>
            <TouchableOpacity onPress={handlePasswordEdit}>
              <Feather name="edit-2" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutButtonText}>Log-out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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