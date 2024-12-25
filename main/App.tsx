import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoverScreen from '../app/tabs/discover';
import GroupScreen from '../app/tabs/group';
import ProfileScreen from '../app/tabs/profile'

const Tab = createBottomTabNavigator();

// Import icons directly
const discoverIcon = require('@assets/icons/discover-icon.png');
const groupicon = require('@assets/icons/group-icon.png');
const profileIcon = require('@assets/icons/profile-icon.png');
export default function App() {
  return (
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
            tabBarIcon: ({ focused }) => (
              <Image
                source={discoverIcon}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? '#007AFF' : '#8E8E93' }
                ]}
              />
            ),
          }}
        />
        {/* Temporarily using the same icon for other tabs until you add their icons */}
        <Tab.Screen
          name="My Group"
          component={GroupScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={groupicon}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? '#007AFF' : '#8E8E93' }
                ]}
              />
            ),
          }}
        />
        <Tab.Screen
          name="My Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <Image
                source={profileIcon}
                style={[
                  styles.tabIcon,
                  { tintColor: focused ? '#007AFF' : '#8E8E93' }
                ]}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 24,  // You can adjust this size
    height: 24, // You can adjust this size
    resizeMode: 'contain',
  },
});