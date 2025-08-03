// services/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  browserLocalPersistence
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';


// — Firebase config
const firebaseConfig = {
  apiKey:             process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAdNMppJlGTJt9eJZDE_yG-ZJuyFcmjJTU",
  authDomain:         process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "nightlife-app-c4311.firebaseapp.com",
  projectId:          process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "nightlife-app-c4311",
  storageBucket:      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "nightlife-app-c4311.firebasestorage.app",
  messagingSenderId:  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "461689495108",
  appId:              process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:461689495108:android:a99f2af7120f9621746611",
};
console.log('🔍 Firebase Config Debug:');
console.log('API Key:', !!firebaseConfig.apiKey ? 'Present' : 'MISSING');
console.log('Auth Domain:', !!firebaseConfig.authDomain ? 'Present' : 'MISSING');
console.log('Project ID:', !!firebaseConfig.projectId ? 'Present' : 'MISSING');
console.log('All values:', Object.entries(firebaseConfig).map(([key, value]) => `${key}: ${!!value}`));
const app = initializeApp(firebaseConfig);

// — Initialize persistence exactly once
if (Constants.platform?.web) {
  // nothing extra — web uses indexDB by default via getAuth()
} else {
  // on React Native, hook AsyncStorage in
  initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

// — Grab the auth instance
const auth = getAuth(app);

// — Firestore & Google provider exports
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
