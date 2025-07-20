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

import {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
} from '@env';

// — Firebase config
const firebaseConfig = {
  apiKey:             EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:         EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:          EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:              EXPO_PUBLIC_FIREBASE_APP_ID,
};

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
