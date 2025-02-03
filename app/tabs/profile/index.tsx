import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import styles from './styles';
import { useUser } from '../../../src/context/UserContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const Profile = ({navigation}: {navigation: NavigationProp<any>}) => {
  const { user, userData, signOut, updateLocation } = useUser();

  const handleSignOut = async () => {
    try{
      await signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  return (
    <View style={styles.container}>
      {/* Background Header */}
      <Image 
        source={require('../../../assets/background-art/blue-background.jpg')}
        style={styles.backgroundHeader}
      />

      {/* Profile Image Container */}
      <View style={styles.profileImageContainer}>
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
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

      {/* Profile Information Section */}
      <View style={styles.profileSection}>
        <Text style={styles.name}>{userData?.username || 'User'}</Text>
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
          <Text style={styles.settingText}>
            Search Area: {userData?.searchRadius ? `${userData.searchRadius}km` : 'Not set'}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Password</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Log-out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={[styles.buttonText, styles.deleteText]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;