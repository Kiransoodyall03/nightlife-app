import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';
import TitleComponent from '../Title/title-animated'; // Make sure the path is correct

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface SidebarNavigationProps {
  profileImage?: string;
  onLogout: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  profileImage = 'https://via.placeholder.com/150',
  onLogout,
}) => {
  const router = useRouter();

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TitleComponent text="NightLife" /> {/* Add the TitleComponent here */}
      
      <View style={styles.profileSection}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        </View>
      </View>

      <View style={styles.navigationSection}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/profile')}>
          <Text style={styles.navText}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('/settings')}>
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
