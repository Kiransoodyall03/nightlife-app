import { useState } from 'react';
import { handleLogin } from './login';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { addDoc, collection, doc, setDoc, updateDoc, 
  GeoPoint, runTransaction,  query,
  where,
  limit,
  getDocs,
  FieldPath,
  documentId, } from 'firebase/firestore';
import { AuthResult, AuthUser, FilterData } from './types';

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
      const locationRef = await addDoc(collection(db, 'user_locations'), {
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
        filterId: "",
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
  const handleFilters = async (
    filterData: FilterData
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
  
      await runTransaction(db, async (transaction) => {
        // 1. Create new filter
        const userRef = doc(db, 'users', user.uid);
        const filterRef = doc(collection(db, 'filters'));
        transaction.set(filterRef, {
          userId: user.uid,
          ...filterData
        });
      
        // 2. Update user document (only filterId)
        transaction.update(userRef, {
          filterId: filterRef.id
        });
      
        // 3. Delete previous filters
        const oldFiltersQuery = query(
          collection(db, 'filters'),
          where('userId', '==', user.uid),
          where(documentId(), '!=', filterRef.id)
        );
        const oldFilters = await getDocs(oldFiltersQuery);
        oldFilters.forEach(doc => {
          transaction.delete(doc.ref);
        });
      });
  
      return { success: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      setError(`Filter update failed: ${errorMessage}`);
      return { 
        success: false, 
        error: new Error(`Filter Error: ${errorMessage}`) 
      };
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

  return { handleRegister, performLogin, loading, error, handleFilters };
};