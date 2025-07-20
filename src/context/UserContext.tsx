// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native'; // Added missing Platform import
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth, db } from '../services/firebase/config';
import { 
  UserData, 
  GooglePlace, 
  LocationData, 
  UserContext, 
  FilterData 
} from 'src/services/auth/types';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  GeoPoint 
} from 'firebase/firestore';
import * as Location from 'expo-location';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Cookies from 'js-cookie';
import * as SecureStore from 'expo-secure-store';

// Constants
const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const PLACES_API = 'https://places.googleapis.com/v1/places:searchNearby';
const storage = getStorage();

// Cookie/Session constants
const COOKIE_NAME = 'nl_session_token';
const SECURE_KEY = 'nl_session_token';
const LOCATION_SERVICES_KEY = 'NL_enableLocation';
const GOOGLE_TOKEN_KEY = 'NL_googleId';

// Enhanced UserContext interface to include new auth methods
interface EnhancedUserContext extends UserContext {
  enableLocationServices: boolean;
  setEnableLocationServices: (enabled: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    location: { address: string; latitude: number; longitude: number };
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const UserContextInstance = createContext<EnhancedUserContext>({
  user: null,
  userData: null,
  locationData: null,
  loading: true,
  enableLocationServices: false,
  setEnableLocationServices: async () => {},
  signIn: async () => {},
  register: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateLocation: async () => {},
  pickImage: async () => undefined,
  updateUsername: async () => {},
  updateSearchRadius: async () => {},
  nearbyPlaces: [],
  fetchNearbyPlaces: async () => ({ results: [], nextPageToken: null }),
  nextPageToken: null,
  placesLoading: false,
  hasMorePlaces: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enableLocationServices, setEnableLocationServicesState] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<GooglePlace[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [cooldown, setCooldown] = useState(false);

  // ─── Session Token Management ─────────────────────────────────────────
  const saveSessionToken = async (token: string) => {
    try {
      if (Platform.OS === 'web') {
        Cookies.set(COOKIE_NAME, token, { 
          secure: true, 
          sameSite: 'lax',
          expires: 7 // 7 days
        });
      } else {
        await SecureStore.setItemAsync(SECURE_KEY, token);
      }
    } catch (error) {
      console.error('Error saving session token:', error);
    }
  };

  const loadSessionToken = async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return Cookies.get(COOKIE_NAME) || null;
      } else {
        return await SecureStore.getItemAsync(SECURE_KEY);
      }
    } catch (error) {
      console.error('Error loading session token:', error);
      return null;
    }
  };

  const clearSessionToken = async () => {
    try {
      if (Platform.OS === 'web') {
        Cookies.remove(COOKIE_NAME);
      } else {
        await SecureStore.deleteItemAsync(SECURE_KEY);
      }
    } catch (error) {
      console.error('Error clearing session token:', error);
    }
  };

  // ─── Location Services Management ─────────────────────────────────────
  const setEnableLocationServices = async (enabled: boolean) => {
    try {
      setEnableLocationServicesState(enabled);
      await SecureStore.setItemAsync(LOCATION_SERVICES_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving location services preference:', error);
    }
  };

  // ─── Authentication Methods ───────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdToken();
      await saveSessionToken(token);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    location: { address: string; latitude: number; longitude: number };
  }) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', credential.user.uid), {
        username: data.username,
        email: data.email,
        uid: credential.user.uid,
        searchRadius: 5,
        filterId: '',
        createdAt: new Date(),
      });

      // Create user location document
      await setDoc(doc(db, 'user_locations', credential.user.uid), {
        locationId: credential.user.uid,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
      });

      const token = await credential.user.getIdToken();
      await saveSessionToken(token);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // Retrieve Google ID token from secure storage
      const idToken = await SecureStore.getItemAsync(GOOGLE_TOKEN_KEY);
      if (!idToken) {
        throw new Error('No Google ID token found. Please authenticate with Google first.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const token = await userCredential.user.getIdToken();
      await saveSessionToken(token);

      // Check if user document exists, create if not
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          username: userCredential.user.displayName || 'User',
          email: userCredential.user.email,
          uid: userCredential.user.uid,
          searchRadius: 5,
          filterId: '',
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      await clearSessionToken();
      
      // Clear all user-related state
      setUser(null);
      setUserData(null);
      setLocationData(null);
      setNearbyPlaces([]);
      setNextPageToken(null);
      setHasMorePlaces(false);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── User Profile Management ──────────────────────────────────────────
  const updateUsername = async (newUsername: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        username: newUsername,
      });

      setUserData(prev => ({
        ...prev!,
        username: newUsername,
      }));

      alert('Username updated successfully!');
    } catch (error) {
      console.error('Username update error:', error);
      alert('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const updateSearchRadius = async (newRadius: number) => {
    if (!user) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', user.uid), {
        searchRadius: newRadius,
      });

      setUserData(prev => ({
        ...prev!,
        searchRadius: newRadius,
      }));

      alert('Search radius updated successfully!');
    } catch (error) {
      console.error('Search radius update error:', error);
      alert('Failed to update search radius');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      if (!user) {
        alert('You must be logged in to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const storageRef = ref(storage, `user-images/${user.uid}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, 'users', user.uid), {
          profilePicture: downloadURL
        });

        setUserData(prev => ({
          ...prev!,
          profilePicture: downloadURL
        }));

        return downloadURL;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // ─── Location Management ──────────────────────────────────────────────
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return null;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      const response = await axios.get<{
        results: Array<{ formatted_address: string }>;
        status: string;
      }>(GEOCODING_API, {
        params: {
          latlng: `${latitude},${longitude}`,
          key: GOOGLE_API_KEY,
          result_type: 'street_address|locality'
        }
      });

      if (response.data.status === 'OK' && response.data.results[0]) {
        return {
          latitude,
          longitude,
          address: response.data.results[0].formatted_address
        };
      }

      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const updateLocation = async () => {
    if (!user) return;

    const newLocation = await fetchLocation();
    if (!newLocation) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        locationId: user.uid,
      });

      await updateDoc(doc(db, 'user_locations', user.uid), {
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        address: newLocation.address,
      });

      setLocationData(prev => ({
        ...prev!,
        locationId: user.uid,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        address: newLocation.address,
      }));
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  // ─── Places Management ────────────────────────────────────────────────
  const fetchNearbyPlaces = async (options?: {
    excludedTypes?: string[];
    types?: string[];
    pageToken?: string | null;
  }): Promise<{ results: GooglePlace[]; nextPageToken: string | null }> => {
    try {
      setPlacesLoading(true);
      const userLatitude = locationData?.latitude;
      const userLongitude = locationData?.longitude;

      if (!userLatitude || !userLongitude || !userData?.searchRadius) {
        console.log("Missing location data or search radius");
        return { results: [], nextPageToken: null };
      }

      if (cooldown && !options?.pageToken) {
        console.log("Request throttled due to cooldown");
        return { results: [], nextPageToken: null };
      }

      if (!options?.pageToken) {
        setCooldown(true);
        setTimeout(() => setCooldown(false), 2000);
      }

      let requestTypes = options?.types || ['bar', 'restaurant', 'cafe', 'night_club'];
      
      if (!options?.types && userData?.filterId && userData.filterId !== "") {
        try {
          const filterDoc = await getDoc(doc(db, 'filters', userData.filterId));
          if (filterDoc.exists()) {
            const filterData = filterDoc.data() as FilterData;
            if (filterData.isFiltered && Array.isArray(filterData.filters) && filterData.filters.length > 0) {
              requestTypes = filterData.filters;
            }
          }
        } catch (error) {
          console.error("Error fetching filter data:", error);
        }
      }

      const locationParam = `${userLatitude},${userLongitude}`;
      const radius = Math.min(userData.searchRadius * 1000, 50000);
      
      const params = {
        location: locationParam,
        radius,
        types: requestTypes.join('|'),
        key: GOOGLE_API_KEY,
        ...(options?.pageToken && { pagetoken: options.pageToken })
      };

      let retries = 0;
      const maxRetries = 3;
      let response;
      
      while (retries < maxRetries) {
        try {
          if (options?.pageToken && retries === 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          response = await axios.get('http://localhost:5000/api/places', { 
            params,
            timeout: 10000
          });
          
          break;
        } catch (error) {
          retries++;
          console.error(`API request failed (attempt ${retries}/${maxRetries}):`, 
            axios.isAxiosError(error) ? error.message : error);
            
          if (retries >= maxRetries) {
            throw error;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (response?.data?.results) {
        setHasMorePlaces(!!response.data.next_page_token);
        setNextPageToken(response.data.next_page_token || null);
        
        const filteredResults = response.data.results.filter((place: any) =>
          !place.types?.some((type: string) => options?.excludedTypes?.includes(type))
        ).map((place: any) => ({
          place_id: place.place_id,
          name: place.name || 'Unnamed Venue',
          types: place.types || [],
          vicinity: place.vicinity || 'Address not available',
          rating: place.rating || 0,
          geometry: {
            location: {
              lat: place.geometry?.location?.lat || 0,
              lng: place.geometry?.location?.lng || 0
            }
          },
          photos: place.photos?.map((photo: any) => ({
            photo_reference: photo.photo_reference
          })) || []
        }));
        
        return {
          results: filteredResults,
          nextPageToken: response.data.next_page_token || null
        };
      }
      
      return { results: [], nextPageToken: null };
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Error:', error.response?.data || error.message);
      } else {
        console.error('API Error:', error);
      }
      return { results: [], nextPageToken: null };
    } finally {
      setPlacesLoading(false);
    }
  };

  // ─── Effects ───────────────────────────────────────────────────────────
  
  // Load stored preferences on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Load location services preference
        const locationPref = await SecureStore.getItemAsync(LOCATION_SERVICES_KEY);
        if (locationPref) {
          setEnableLocationServicesState(locationPref === 'true');
        }

        // Try to restore session if token exists
        const token = await loadSessionToken();
        if (token) {
          // Optionally verify token with your backend or Firebase
          console.log('Session token found, user should be automatically signed in');
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      } finally {
        // Don't set loading false here, let the auth state change handle it
      }
    };

    loadStoredData();
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Load user data
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }

          // Load location data
          const locationDoc = await getDoc(doc(db, "user_locations", firebaseUser.uid));
          if (locationDoc.exists()) {
            setLocationData(locationDoc.data() as LocationData);
          }

          // Save fresh token
          const token = await firebaseUser.getIdToken();
          await saveSessionToken(token);
        } else {
          setUserData(null);
          setLocationData(null);
          await clearSessionToken();
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setUserData(null);
        setLocationData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-fetch places when location or radius changes
  useEffect(() => {
    if (locationData?.latitude && locationData?.longitude && userData?.searchRadius) {
      setNearbyPlaces([]);
      setNextPageToken(null);
      setHasMorePlaces(true);
      fetchNearbyPlaces();
    }
  }, [locationData?.latitude, locationData?.longitude, userData?.searchRadius]);

  return (
    <UserContextInstance.Provider
      value={{
        user,
        userData,
        locationData,
        loading,
        enableLocationServices,
        setEnableLocationServices,
        signIn,
        register,
        signInWithGoogle,
        signOut,
        updateLocation,
        pickImage,
        updateUsername,
        updateSearchRadius,
        nearbyPlaces,
        fetchNearbyPlaces,
        nextPageToken,
        placesLoading,
        hasMorePlaces,
      }}
    >
      {children}
    </UserContextInstance.Provider>
  );
};

export const useUser = () => useContext(UserContextInstance);