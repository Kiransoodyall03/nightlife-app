// src/services/auth/register.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import * as Location from 'expo-location'; // For location tracking
import { auth, db } from '../firebase/config';
import { AuthResult, FirebaseAuthError, AuthUser } from './types';
import { GeoPoint } from 'firebase/firestore';
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
   // console.error('Error fetching location:', error);
    throw error;
  }
};
export const handleRegistration = async (
  userData: AuthUser
): Promise<AuthResult> => {
  try {
    // Validate coordinates first
    if (typeof userData.location.latitude !== 'number' || 
        typeof userData.location.longitude !== 'number') {
      throw new Error('Invalid coordinates');
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      username: userData.username,
      email: userData.email,
      location: {
        address: userData.location.address,
        coordinates: new GeoPoint(
          userData.location.latitude,
          userData.location.longitude
        ),
      },
      searchRadius: 5,
      createdAt: new Date(),
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
  //  console.error('Registration error:', error);
    return { success: false, error: error as Error };
  }
};