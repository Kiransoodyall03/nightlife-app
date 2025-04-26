import React, { useEffect } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigationProp, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import DiscoverScreen from '../app/tabs/discover';
import GroupScreen from '../app/tabs/group';
import ProfileScreen from '../app/tabs/profile';
import LoginScreen from '../app/screens/login';
import FilterGroupScreen from 'app/screens/filterGroup';
import SignUpScreen from '../app/screens/register';
import FilterScreen from 'app/screens/filter';
import FriendsListScreen from 'app/screens/friendsList';
import CreateGroupScreen from 'app/screens/createGroup';
import GroupInviteScreen from 'app/screens/groupInvite';
import JoinGroupScreen from 'app/screens/joinGroup/joinGroup';
import TitleComponent from '../src/components/Title-Dark/title-animated';
import { styles, DRAWER_WIDTH } from './style';
import { UserProvider } from '../src/context/UserContext';
import { NotificationProvider } from 'src/components/Notification/NotificationContext';
import CustomDrawerContent from 'src/components/DrawerNavigation';

// Navigation type definitions
type StackParamList = {
  Login: undefined;
  Register: undefined;
  GroupInvite: undefined;
  FriendsList: undefined;
  DrawerNavigator: undefined;
  Filter: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
  FilterGroup: undefined;
};

type TabParamList = {
  Discover: undefined;
  'My Group': undefined;
  'My Profile': undefined;
  'FriendsList': undefined;
  'GroupInvite': undefined;
  'JoinGroup': undefined;
  'Filters': undefined;
  'CreateGroup': undefined;
  'FilterGroup': undefined;
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
      screenOptions={({ navigation }) => ({
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              const drawerNavigation = navigation.getParent<DrawerNavigationProp<DrawerParamList>>();
              drawerNavigation?.openDrawer();
            }}
            style={styles.menuButton}
          >
            <Image source={require('../assets/icons/menu-icon.png')} style={styles.menuIcon} />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Image source={require('@assets/icons/discover-icon.png')} style={styles.headerIcon} />
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
          tabBarIcon: () => (
            <Image source={require('@assets/icons/discover-icon.png')} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="My Group"
        component={GroupScreen}
        options={{
          headerTitle: () => <TitleComponent text="Groups" />,
          tabBarIcon: () => (
            <Image source={require('@assets/icons/group-icon.png')} style={styles.tabIcon} />
          ),
        }}
      />
      <Tab.Screen
        name="My Profile"
        component={ProfileScreen}
        options={{
          headerTitle: () => <TitleComponent text="My Profile" />,
          tabBarIcon: () => (
            <Image source={require('@assets/icons/profile-icon.png')} style={styles.tabIcon} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />} // Set custom drawer content here
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
    <NotificationProvider>
      <UserProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={SignUpScreen} />
            <Stack.Screen name="Filter" component={FilterScreen} />
            <Stack.Screen name ="FriendsList" component={FriendsListScreen} />
            <Stack.Screen name="GroupInvite" component={GroupInviteScreen} />
            <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
            <Stack.Screen name= "CreateGroup" component={CreateGroupScreen} />
            <Stack.Screen name= "FilterGroup" component={FilterGroupScreen} />
            <Stack.Screen name= "JoinGroup" component={JoinGroupScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </NotificationProvider>
  );
}
