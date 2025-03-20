import React, { useState, useRef, forwardRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerLayoutAndroid } from 'react-native'; // Import DrawerLayoutAndroid
import { FontAwesome } from '@expo/vector-icons'; // If using FontAwesome icons
import { Tabs } from 'expo-router'; // If using expo-router for navigation
export default function TabLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const drawerRef = useRef<DrawerLayoutAndroid>(null);

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logging out...');
  };``

  return (
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTitleStyle: {
            color: 'black',
          },
          tabBarActiveTintColor: '#FF4B6F',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          },
          headerLeft: () => (
            <TouchableOpacity
              style={[styles.menuButton, { marginLeft: 8 }]}
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
            title: 'Disocver',
            }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Explore',
            headerLeft: () => (
              <TouchableOpacity
                style={[styles.menuButton, { marginLeft: 8 }]}
                onPress={() => drawerRef.current?.openDrawer()}
              >
                <FontAwesome name="bars" size={24} color="#333" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color }) => (
              <FontAwesome name="map" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerLeft: () => (
              <TouchableOpacity
                style={[styles.menuButton, { marginLeft: 8 }]}
                onPress={() => drawerRef.current?.openDrawer()}
              >
                <FontAwesome name="bars" size={24} color="#333" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});