import { useState } from 'react';
import { handleLogin } from './login';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { addDoc, collection, doc, setDoc, updateDoc, GeoPoint, runTransaction, 
  query,where,getDoc } from 'firebase/firestore';
import { AuthResult, AuthUser, FilterData, UserData } from './types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [ userData, setUserData] = useState<UserData | null>(null);
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
  
      // 2. Create location document - FIXED
      await setDoc(doc(db, 'user_locations', user.uid), {
        userId: user.uid,  // Added missing userId field
        coordinates: new GeoPoint(userData.location.latitude, userData.location.longitude),  // Changed to GeoPoint
        address: userData.location.address
      });
  
      // 3. Create user document
      await setDoc(doc(db, 'users', user.uid), {
        username: userData.username,
        email: userData.email,
        uid: user.uid,
        locationId: user.uid,
        searchRadius: 5,
        filterId: "",
        createdAt: new Date()
      });

      setUserData(prev => ({
        ...prev!,
        username: userData.username,
        email: userData.email,
        uid: user.uid,
        searchRadius: 5,
        filterId: "",
        profilePicture: "",
        locationId: user.uid,
      }));
  
      return { success: true, user };
    } catch (error) {
      setError('Registration failed: ' + (error as Error).message);
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

 // This would go in your handleFilters function
const handleFilters = async (filterData: FilterData): Promise<AuthResult> => {
  setLoading(true);
  setError(null);
  
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Get current user data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const currentFilterId = userData?.filterId;
    
    let newFilterId;
    
    // If user already has a filter, update it
    if (currentFilterId && currentFilterId !== "") {
      await updateDoc(doc(db, 'filters', currentFilterId), {
        ...filterData,
        userId: user.uid,
        filterId: currentFilterId
      });
      newFilterId = currentFilterId;
    } else {
      // Create new filter
      const filterRef = doc(collection(db, 'filters'));
      await setDoc(filterRef, {
        ...filterData,
        userId: user.uid,
        filterId: filterRef.id
      });
      newFilterId = filterRef.id;
      
      // Update user document with new filterId
      await updateDoc(doc(db, 'users', user.uid), {
        filterId: filterRef.id
      });
    }
    
    // Important: Update local state to reflect the changes
    if (userData) {
      setUserData(prev => ({
        ...prev!,
        filterId: newFilterId
      }));
    }
    
    return { success: true, filterId: newFilterId };
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