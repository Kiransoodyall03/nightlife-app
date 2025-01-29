// types/navigation.d.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined; // Changed from SignUp
  DrawerNavigator: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList, 
  'Login'
>;