import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { SidebarNavigation } from '../../src/components/SideBar-Nav'
import { DrawerLayoutAndroid } from 'react-native';

export default function TabLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const drawerRef = useRef<DrawerLayoutAndroid>(null);

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
  };

  const renderSidebar = () => (
    <SidebarNavigation
      profileImage="https://via.placeholder.com/150"
      onLogout={handleLogout}
    />
  );

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={renderSidebar}
    >
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF4B6F',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          },
          // Add hamburger menu to header
          headerLeft: () => (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => drawerRef.current?.openDrawer()}
            >
              <FontAwesome name="bars" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="fire" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="map" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </DrawerLayoutAndroid>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 15,
  },
});