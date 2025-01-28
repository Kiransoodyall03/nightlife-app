import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import {getAuth} from 'firebase/auth';

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test Firebase Connection
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    const testDoc = doc(db, "_test", "_connection");
    await getDoc(testDoc); // Try to fetch a non-existent document
    console.log("Firebase connection successful.");
    return true;
  } catch (error) {
    console.error("Error testing Firebase connection:", error);
    return false;
  }
};
