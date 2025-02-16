import { Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import DiscoverScreen from '../app/tabs/discover';
import GroupScreen from '../app/tabs/group';
import ProfileScreen from '../app/tabs/profile';
import LoginScreen from '../app/screens/login';
import FilterScreen from 'app/screens/filter';
import SignUpScreen from '../app/screens/register'; // Add this import
import TitleComponent from '../src/components/Title-Dark/title-animated';
import { useFonts } from 'expo-font';
import { styles, DRAWER_WIDTH} from './style';
import { setLogLevel } from "firebase/firestore";
import { UserProvider } from '../src/context/UserContext';
setLogLevel("debug");

type StackParamList = {
  Login: undefined;
  Register: undefined; // Add SignUp route
  DrawerNavigator: undefined;
  Filter: undefined;
};

// Keep other type definitions the same
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
const Stack = createStackNavigator<StackParamList>();


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
              source={require('../assets/icons/menu-icon.png')}
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
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabel: () => null,
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

function DrawerNavigator() {
  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          width: DRAWER_WIDTH,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
}


export default function App() {
  const [fontsLoaded] = useFonts({
    'Jaldi-Regular': require('../assets/fonts/Jaldi-Regular.ttf'),
    'Jaldi-Bold': require('../assets/fonts/Jaldi-Bold.ttf'),
  });

  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ headerShown: false }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={SignUpScreen} />
        <Stack.Screen name="Filter" component={FilterScreen} />
        
        {/* Main App */}
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}