// main/App.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoverScreen from '../app/tabs/discover';
import GroupScreen from '../app/tabs/group';
import ProfileScreen from '../app/tabs/profile';
import { DrawerLayoutAndroid } from 'react-native'; // Import DrawerLayoutAndroid
import { SidebarNavigation } from '../src/components/SideBar-Nav'; // Import your sidebar component
import { FontAwesome } from '@expo/vector-icons'; // If using FontAwesome icons

const Tab = createBottomTabNavigator();

export default function App() {
  const drawerRef = useRef<DrawerLayoutAndroid>(null); // Create a ref for the drawer

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
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              height: 60,
              paddingBottom: 5,
              paddingTop: 5,
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E5E5',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tab.Screen
            name="Discover"
            component={DiscoverScreen}
            options={{
              title: "Discover",
              tabBarIcon: ({ focused }) => (
                <FontAwesome name="fire" size={24} color={focused ? '#007AFF' : '#8E8E93'} />
              ),
            }}
          />
          <Tab.Screen
            name="Group"
            component={GroupScreen}
            options={{
              title: "My Group",
              tabBarIcon: ({ focused }) => (
                <FontAwesome name="users" size={24} color={focused ? '#007AFF' : '#8E8E93'} />
              ),
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: "My Profile",
              tabBarIcon: ({ focused }) => (
                <FontAwesome name="user" size={24} color={focused ? '#007AFF' : '#8E8E93'} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DrawerLayoutAndroid>
  );
}

const styles = StyleSheet.create({
  // Your styles here
});