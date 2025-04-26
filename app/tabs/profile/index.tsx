import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView, Animated } from 'react-native';
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
  const [newSearchRadius, setNewSearchRadius] = useState(userData?.searchRadius?.toString() || '5');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingRadius, setEditingRadius] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(!!locationData?.address);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setNewUsername(data?.username || '');
          setNewSearchRadius(data?.searchRadius?.toString() || '5');
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

  const NavigateToFilters = async () => {
    navigation.navigate('Filter')
  }

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

  const toggleLocationServices = () => {
    setLocationEnabled(!locationEnabled);
    if (!locationEnabled) {
      updateLocation();
    }
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
      <Image 
        source={require('../../../assets/background-art/background_profile.jpeg')}
        style={styles.backgroundHeader}
      />

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
          <Feather name="edit-2" size={18} color="#007AFF" />
        </TouchableOpacity>
      </View>

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
              <Text style={styles.name}>{userData?.username}</Text>
              <TouchableOpacity onPress={() => setEditingUsername(true)}>
                <Feather name="edit-2" size={20} color="#666" />
              </TouchableOpacity>
            </>
          )}
        </View>
        <Text style={styles.email}>{userData?.email || ''}</Text>
      </View>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Location Setting */}
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Location: {locationData?.address || 'Not set'}</Text>
            <TouchableOpacity onPress={updateLocation} disabled={!locationEnabled}>
              <Feather name="edit-2" size={20} color={locationEnabled ? "#666" : "#ccc"} />
            </TouchableOpacity>
          </View>
          <View style={styles.settingAction}>
            <ToggleButton 
              value={locationEnabled} 
              onToggle={toggleLocationServices}
            />
          </View>
        </View>
        
        {/* Search Area Setting */}
        <View style={styles.settingItem}>
          {editingRadius ? (
            <View style={styles.inlineEditContainer}>
              <Text style={styles.settingLabel}>Search Area: </Text>
              <TextInput
                style={styles.smallEditInput}
                value={newSearchRadius}
                onChangeText={setNewSearchRadius}
                keyboardType="numeric"
                autoFocus
              />
              <Text style={styles.settingLabel}>km</Text>
              <TouchableOpacity onPress={handleUpdateSearchRadius}>
                <Feather name="check" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.settingLabel}>Search Area: {userData?.searchRadius || '5'}km</Text>
              <TouchableOpacity onPress={() => setEditingRadius(true)}>
                <Feather name="edit-2" size={20} color="#666" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Filter Setting */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Filters</Text>
          <TouchableOpacity onPress={NavigateToFilters}>
            <Feather name="edit-2" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Password Setting */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Password: ••••••••••</Text>
          <TouchableOpacity>
            <Feather name="edit-2" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {/* Empty Settings (placeholder for future settings) */}
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}></Text>
          <TouchableOpacity>
            <Feather name="edit-2" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutButtonText}>Log-out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton}>
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