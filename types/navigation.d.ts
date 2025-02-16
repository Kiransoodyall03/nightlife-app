// types/navigation.d.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Filter: undefined;
  DrawerNavigator: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList, 
  'Login'
>;