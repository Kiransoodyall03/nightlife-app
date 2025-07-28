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
  apiKey:             Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain:         Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId:          Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket:      Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId:  Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId:              Constants.expoConfig?.extra?.firebaseAppId,
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
