// App.tsx
import { Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import DiscoverScreen from '../app/tabs/discover';
import GroupScreen from '../app/tabs/group';
import ProfileScreen from '../app/tabs/profile';
import { SidebarNavigation } from 'src/components/SideBar-Nav';
import TitleComponent from '../src/components/Title/title-animated';
import { testFirebaseConnection } from '../firebase/config';
import { styles, DRAWER_WIDTH, tabBarStyle, headerStyle } from './style';
import { setLogLevel } from "firebase/firestore";
setLogLevel("debug");
type TabParamList = {
  Discover: undefined;
  'My Group': undefined;
  'My Profile': undefined;
};

type DrawerParamList = {
  MainTabs: undefined;
};

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  DrawerNavigationProp<DrawerParamList>
>;

const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();


function TabNavigator() {
  useEffect(() => {
    testFirebaseConnection()
      .then(success => {
        if (success) {
          console.log('Firebase connection test completed successfully');
        } else {
          console.log('Firebase connection test failed');
        }
      })
      .catch(error => {
        console.error('Error during connection test:', error);
      });
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ navigation, route }) => ({
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              const drawerNavigation = navigation.getParent<DrawerNavigationProp<DrawerParamList>>();
              drawerNavigation?.openDrawer();
            }}
            style={styles.menuButton}
          >
            <Image
              source={require('@assets/icons/menu-icon.png')}
              style={styles.menuIcon}
            />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Image
              source={require('@assets/icons/discover-icon.png')}
              style={styles.headerIcon}
            />
            <TitleComponent text="NightLife" />
          </View>
        ),
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabel: () => null,
        headerStyle: headerStyle,
      })}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          headerTitle: () => <TitleComponent text="NightLife" />,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@assets/icons/discover-icon.png')}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="My Group"
        component={GroupScreen}
        options={{
          headerTitle: () => <TitleComponent text="My Group" />,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@assets/icons/group-icon.png')}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tab.Screen
        name="My Profile"
        component={ProfileScreen}
        options={{
          headerTitle: () => <TitleComponent text="My Profile" />,
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@assets/icons/profile-icon.png')}
              style={styles.tabIcon}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logging out...');
  };

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => (
          <SidebarNavigation
            {...props}
            onLogout={handleLogout}
          />
        )}
        screenOptions={{
          drawerStyle: {
            width: DRAWER_WIDTH,
          },
          headerShown: false,
        }}
      >
        <Drawer.Screen 
          name="MainTabs" 
          component={TabNavigator}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}