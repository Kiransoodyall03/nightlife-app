import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../app/screens/login';
import  RegisterScreen  from '../app/screens/register'; 
import DiscoverScreen from '../app/tabs/discover';

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="DrawerNavigator" component={DiscoverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}