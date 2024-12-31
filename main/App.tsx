import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
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

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

function TabNavigator() {
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
        tabBarLabel: () => null,
        headerStyle: {
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E5E5',
        },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  menuButton: {
    padding: 10,
    marginLeft: 10,
  },
  menuIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});