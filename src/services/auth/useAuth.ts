import { useState } from 'react';
import { handleLogin } from './login';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleRegistration } from './register';
import { AuthResult, AuthUser } from './types';
import { GeoPoint } from 'firebase/firestore'; // Import GeoPoint for Firestore
import { User } from 'lucide-react-native';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    userData: AuthUser & { location: { address: string; latitude: number; longitude: number } }
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const user = userCredential.user;

      // 2. Create location document
      const locationRef = await addDoc(collection(db, 'Locations'), {
        address: userData.location.address,
        coordinates: new GeoPoint(
          userData.location.latitude,
          userData.location.longitude
        ),
        userId: user.uid,
        created_at: new Date()
      });

      // 3. Create user document
      await setDoc(doc(db, 'users', user.uid), {
        username: userData.username,
        email: userData.email,
        location_id: locationRef.id,
        searchRadius: 5,
        createdAt: new Date()
      });

      return { success: true, user };
    } catch (error) {
      // Handle errors
      setError('Registration failed: ' + (error as Error).message);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };
  const performLogin = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await handleLogin(email, password);

      if (!result.success) {
        setError(result.error?.message || 'Login failed');
      }

      return result;
    } catch (error) {
    //  console.error('Login error:', error);
      setError('An unexpected error occurred during login.');
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, performLogin, loading, error };
};