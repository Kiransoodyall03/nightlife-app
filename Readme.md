1. npm install
2. create env in root for database connection:
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAdNMppJlGTJt9eJZDE_yG-ZJuyFcmjJTU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=nightlife-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=nightlife-app-c4311
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=nightlife-app-c4311.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=461689495108
EXPO_PUBLIC_FIREBASE_APP_ID=1:461689495108:android:a99f2af7120f9621746611

3. npx expo start

How to create new screen + routing:

1. Create screen in app/screen directory:
index.tsx
styles.ts
2. IN types/navigation.d.ts, add your screen variable name here:
export type RootStackParamList = {
  Login: undefined;
  Register: undefined; // Changed from SignUp
  DrawerNavigator: undefined;
 *ScreenName*: undefined;
};

3. in the navigation\RootNavigator.tsx directory, add the import to the page created
import *NameScreen* from '../app/screens/foldername'; 
// the NameScreen comes from the export default NameScreen in the frontend index.tsx file you created.

4. in the navigation\RootNavigator.tsx directory, add the page to the stack:
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="DrawerNavigator" component={DiscoverScreen} />
	<Stack.Screen name="ScreenName" component={NameScreen} />
      </Stack.Navigator>
    </NavigationContainer>

5. Repeat step 4 in main/App.tsx

Link to Designs of each page:
https://www.figma.com/design/XbZOf2QEbZ7FWLNRdPHCPq/App?node-id=0-1&t=jJREjwslTcQhVeIl-1
