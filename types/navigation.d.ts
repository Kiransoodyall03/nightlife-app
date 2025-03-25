// types/navigation.d.ts
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Filter: undefined;
  DrawerNavigator: undefined;
  GroupInvite: undefined;
  FriendList: undefined;
  CreateGroup: undefined;
};

export type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList, 
  'Login'
>;