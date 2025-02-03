// src/services/auth/register.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location'; // For location tracking
import { auth, db } from '../firebase/config';
import { AuthResult, FirebaseAuthError, AuthUser } from './types';

// Helper function to fetch user location
const fetchLocation = async () => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Reverse geocode to get a human-readable address
    const address = await Location.reverseGeocodeAsync({ latitude, longitude });
    const formattedAddress = address[0]?.city + ', ' + address[0]?.country;

    return {
      latitude,
      longitude,
      address: formattedAddress,
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
};

export const handleRegistration = async (
  userData: AuthUser
): Promise<AuthResult> => {
  try {
    // Step 1: Fetch user location
    const location = await fetchLocation();

    // Step 2: Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

// In your register.ts
await setDoc(doc(db, "users", userCredential.user.uid), {
  username: userData.username, // Match Firestore field name
  email: userData.email,
  location: location,
  searchRadius: 5,
  uid: userCredential.user.uid,
  createdAt: new Date(),
});

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    const firebaseError = error as FirebaseAuthError;
    return {
      success: false,
      error: firebaseError,
    };
  }
};