import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import styles from './styles';
import { useUser } from '../../../src/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const Profile = ({navigation}: {navigation: NavigationProp<any>}) => {
  const { user, userData, signOut, updateLocation, pickImage, updateSearchRadius, updateUsername } = useUser();
  const [newUsername, setNewUsername] = useState(userData?.username || '');
  const [newSearchRadius, setNewSearchRadius] = useState(userData?.searchRadius?.toString() || '5');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingRadius, setEditingRadius] = useState(false);

  const handleSignOut = async () => {
      await signOut();
      navigation.navigate('Login');
  };

  const handleUpdateUsername = async () => {
    if (newUsername.trim() === '') {
      alert('Username cannot be empty');
      return;
    }
    await updateUsername(newUsername);
    setEditingUsername(false);
  };

  const handleUpdateSearchRadius = async () => {
    const radius = parseInt(newSearchRadius);
    if (isNaN(radius) || radius < 1 || radius > 100) {
      alert('Search radius must be between 1 and 100 km');
      return;
    }
    await updateSearchRadius(radius);
    setEditingRadius(false);
  };

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
    </ScrollView>
  );
};

export default Profile;