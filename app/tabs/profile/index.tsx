import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './styles';

const Profile = () => {
  return (
    <View style={styles.container}>
      {/* Background Header */}
      <Image 
        source={require('../../../assets/background-art/blue-background.jpg')} // Replace with your image
        style={styles.backgroundHeader}
      />

      {/* Profile Image Container */}
      <View style={styles.profileImageContainer}>
        <Image
          source={require('../../../assets/icons/profile_logo.png')} // Replace with user image
          style={styles.profileImage}
        />
      </View>

      {/* Profile Information Section */}
      <View style={styles.profileSection}>
        <Text style={styles.name}>Kiran</Text>
        <Text style={styles.email}>kiransoodyall03@gmail.com</Text>
      </View>

      {/* Account Settings Section */}
      <View style={styles.settingsSection}>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Location: Johannesburg, South Africa</Text>
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Search Area: 5km</Text>
        </View>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Password</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons Section */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton}>
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