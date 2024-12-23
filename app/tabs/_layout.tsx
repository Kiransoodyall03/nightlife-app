import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF4B6F',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
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
      // in app/(tabs)/_layout.tsx
<Tabs.Screen
  name="discover"  // Changed from 'index'
  options={{
    title: 'Discover',
    tabBarIcon: ({ color }) => (
      <FontAwesome name="fire" size={24} color={color} />
    ),
  }}
/>
    </Tabs>
  );
}