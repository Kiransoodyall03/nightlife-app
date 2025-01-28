// navigation/RootNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../app/screens/login'; // Adjust the import path
import  SignUpScreen  from '../app/screens/register'; // Adjust the import path

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide the default header
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}