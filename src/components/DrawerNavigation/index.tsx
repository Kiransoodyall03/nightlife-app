import React from 'react';
import { View, Text, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useUser } from 'src/context/UserContext';
import styles from './styles';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { userData, signOut } = useUser();

  const handleLogout = async () => {
    try {
      await signOut();
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Retrieve the groupId from userData or any other context/state.
  // Replace `currentGroupId` with the actual key where the group id is stored.

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      <View style={styles.userInfoSection}>
        {userData?.profilePicture ? (
          <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>
              {userData?.username?.charAt(0) || 'U'}
            </Text>
          </View>
        )}
        <Text style={styles.userName}>{userData?.username || 'User'}</Text>
        <Text style={styles.userEmail}>{userData?.email || ''}</Text>
      </View>

      <DrawerItem
        label="Main Tabs"
        onPress={() => props.navigation.navigate('MainTabs')}
        icon={() => (
          <Image
            source={require('../../../assets/icons/group-icon.png')}
            style={styles.drawerIcon}
          />
        )}
      />

      <DrawerItem
        label="Friends List"
        onPress={() => props.navigation.navigate('FriendsList')}
        icon={() => (
          <Image
            source={require('../../../assets/icons/group-icon.png')}
            style={styles.drawerIcon}
          />
        )}
      />

      <DrawerItem
        label="Group Invite"
        onPress={() => {
            props.navigation.navigate('GroupInvite' );
        }}
        icon={() => (
          <Image
            source={require('../../../assets/icons/group-icon.png')}
            style={styles.drawerIcon}
          />
        )}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
