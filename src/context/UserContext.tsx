// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signInWithCustomToken,
  getIdTokenResult
} from 'firebase/auth';
import { auth, db } from '../services/firebase/config';
import {
  UserData,
  GooglePlace,
  LocationData,
  UserContext as BaseUserContext,
  FilterData
} from 'src/services/auth/types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { getStorage } from 'firebase/storage';
import axios from 'axios';
import Cookies from 'js-cookie';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from 'jwt-decode';

// API & Storage Constants
const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const PLACES_API = 'https://places.googleapis.com/v1/places:searchNearby';
const storage = getStorage();

// Session & Cache Keys
const COOKIE_NAME = 'nl_session_token';
const SECURE_KEY = 'nl_session_token';
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes
const LOCATION_SERVICES_KEY = 'NL_enableLocation';
const GOOGLE_TOKEN_KEY = 'NL_googleId';
const LOCATION_CACHE_KEY = 'NL_location_cache';
const USER_DATA_CACHE_KEY = 'NL_user_data_cache';
const LOCATION_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Platform detection
const isWeb = Platform.OS === 'web';

// Web-compatible SecureStore
const WebSecureStore = {
  setItemAsync: async (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  getItemAsync: async (key: string): Promise<string | null> => {
    return localStorage.getItem(key);
  },
  deleteItemAsync: async (key: string) => {
    localStorage.removeItem(key);
  }
};

// Unified storage solution
const SecureStorage = isWeb ? WebSecureStore : SecureStore;

// Enhanced Context Interface
interface EnhancedUserContext extends BaseUserContext {
  enableLocationServices: boolean;
  setEnableLocationServices: (enabled: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  register: (data: { 
    email: string; 
    password: string; 
    username: string; 
    location: { address: string; latitude: number; longitude: number } 
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const UserContextInstance = createContext<EnhancedUserContext>({} as EnhancedUserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // States
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
  const tokenRefreshTimer = useRef<NodeJS.Timeout | null>(null);

  // ─── Session Token Management ─────────────────────────────────────
  const saveSessionToken = async (token: string, expiry?: number) => {
    try {
      const expires = expiry ? new Date(expiry) : new Date(Date.now() + 7 * 86400000);
      
      if (isWeb) {
        Cookies.set(COOKIE_NAME, token, { 
          secure: true, 
          sameSite: 'lax',
          expires,
          path: '/'
        });
        localStorage.setItem(COOKIE_NAME, token);
      } else {
        await SecureStore.setItemAsync(SECURE_KEY, token);
      }
    } catch (error) {
      console.error('Error saving session token:', error);
    }
  };

  const loadSessionToken = async (): Promise<string | null> => {
    try {
      if (isWeb) {
        return Cookies.get(COOKIE_NAME) || localStorage.getItem(COOKIE_NAME);
      }
      return await SecureStore.getItemAsync(SECURE_KEY);
    } catch (error) {
      console.error('Error loading session token:', error);
      return null;
    }
  };

  const clearSessionToken = async () => {
    try {
      if (isWeb) {
        Cookies.remove(COOKIE_NAME);
        localStorage.removeItem(COOKIE_NAME);
      } else {
        await SecureStore.deleteItemAsync(SECURE_KEY);
      }
    } catch (error) {
      console.error('Error clearing session token:', error);
    }
  };

  // ─── Token Refresh Management ────────────────────────────────────
  const refreshToken = async () => {
    if (!user) return;
    
    try {
      const tokenResult = await user.getIdTokenResult(true);
      await saveSessionToken(tokenResult.token, new Date(tokenResult.expirationTime).getTime());
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  };

  const startTokenRefreshTimer = () => {
    if (tokenRefreshTimer.current) {
      clearTimeout(tokenRefreshTimer.current);
    }
    
    tokenRefreshTimer.current = setTimeout(async () => {
      await refreshToken();
      startTokenRefreshTimer();
    }, TOKEN_REFRESH_INTERVAL);
  };

  // ─── Data Caching Functions ──────────────────────────────────────
  const cacheLocationData = async (data: LocationData) => {
    try {
      const cache = {
        data,
        timestamp: Date.now()
      };
      await SecureStorage.setItemAsync(LOCATION_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Location caching error:', error);
    }
  };

  const getCachedLocation = async (): Promise<LocationData | null> => {
    try {
      const cached = await SecureStorage.getItemAsync(LOCATION_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > LOCATION_CACHE_EXPIRY) return null;
      
      return data;
    } catch (error) {
      console.error('Location cache read error:', error);
      return null;
    }
  };

  const cacheUserData = async (data: UserData) => {
    try {
      await SecureStorage.setItemAsync(USER_DATA_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('User data caching error:', error);
    }
  };

  const getCachedUserData = async (): Promise<UserData | null> => {
    try {
      const cached = await SecureStorage.getItemAsync(USER_DATA_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('User data cache read error:', error);
      return null;
    }
  };

  // ─── Location Services Preference ────────────────────────────────
  const setEnableLocationServices = async (enabled: boolean) => {
    setEnableLocationServicesState(enabled);
    try { 
      await SecureStorage.setItemAsync(LOCATION_SERVICES_KEY, enabled.toString()); 
    } catch (e) { 
      console.error('Saving location pref:', e); 
    }
  };

  // ─── Authentication Methods ──────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await credential.user.getIdTokenResult();
      await saveSessionToken(tokenResult.token, new Date(tokenResult.expirationTime).getTime());
      startTokenRefreshTimer();
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
    location: { address: string; latitude: number; longitude: number } 
  }) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Create user document
      await setDoc(doc(db, 'users', credential.user.uid), {
        username: data.username,
        email: data.email,
        uid: credential.user.uid,
        searchRadius: 5,
        filterId: '',
        createdAt: new Date(),
      });

      // Create location document
      await setDoc(doc(db, 'user_locations', credential.user.uid), {
        locationId: credential.user.uid,
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        address: data.location.address,
      });

      const tokenResult = await credential.user.getIdTokenResult();
      await saveSessionToken(tokenResult.token, new Date(tokenResult.expirationTime).getTime());
      startTokenRefreshTimer();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally { 
      setLoading(false); 
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const idToken = await SecureStorage.getItemAsync(GOOGLE_TOKEN_KEY);
      if (!idToken) throw new Error('No Google ID token found');
      
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Create user document if needed
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

      const tokenResult = await userCredential.user.getIdTokenResult();
      await saveSessionToken(tokenResult.token, new Date(tokenResult.expirationTime).getTime());
      startTokenRefreshTimer();
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
      setUser(null);
      setUserData(null);
      setLocationData(null);
      setNearbyPlaces([]);
      setNextPageToken(null);
      setHasMorePlaces(false);
      
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
        tokenRefreshTimer.current = null;
      }
      
      await SecureStorage.deleteItemAsync(USER_DATA_CACHE_KEY);
      await SecureStorage.deleteItemAsync(LOCATION_CACHE_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally { 
      setLoading(false); 
    }
  };

  // ─── Location Management ─────────────────────────────────────────
  const performReverseGeocoding = async (
    latitude: number, 
    longitude: number,
    retryCount = 2
  ): Promise<string> => {
    let attempts = 0;
    
    while (attempts < retryCount) {
      try {
        const response = await axios.get(GEOCODING_API, {
          params: {
            latlng: `${latitude},${longitude}`,
            key: GOOGLE_API_KEY,
            result_type: 'street_address|premise|establishment',
            language: 'en'
          },
          timeout: 10000
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          return response.data.results[0].formatted_address;
        }
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      } catch (error) {
        attempts++;
        if (attempts >= retryCount) {
          return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const fetchLocation = async (): Promise<LocationData> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Location permission denied');
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    const address = await performReverseGeocoding(
      location.coords.latitude,
      location.coords.longitude
    );
    
    return {
      locationId: user?.uid || '',
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      address,
      timestamp: new Date().toISOString()
    };
  };

  const updateLocation = async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Use cached location if available and recent
      if (!forceRefresh) {
        const cached = await getCachedLocation();
        if (cached && cached.timestamp) {
          const lastUpdate = new Date(cached.timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - lastUpdate.getTime();
          
          if (timeDiff < 5 * 60 * 1000) { // 5 minutes
            setLocationData(cached);
            return;
          }
        }
      }

      // Fetch fresh location
      const newLocation = await fetchLocation();
      
      // Update cache and state
      await cacheLocationData(newLocation);
      setLocationData(newLocation);
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        locationId: user.uid,
        lastLocationUpdate: new Date(),
      });
      
      await setDoc(doc(db, 'user_locations', user.uid), newLocation, { merge: true });
    } catch (error) {
      console.error('Location update error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Places Management ───────────────────────────────────────────
// Most common fixes for Google Places API (New) 400 errors

const fetchNearbyPlaces = async (
  options?: { 
    excludedTypes?: string[]; 
    types?: string[]; 
    pageToken?: string | null 
  }
): Promise<{ results: GooglePlace[]; nextPageToken: string | null }> => {
  if (!locationData || !userData?.searchRadius) {
    return { results: [], nextPageToken: null };
  }
  
  setPlacesLoading(true);
  
  try {
    if (cooldown && !options?.pageToken) {
      return { results: [], nextPageToken: null };
    }
    
    if (!options?.pageToken) {
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }
    
    // FIX 1: Use correct place types for New Places API
    let includedTypes = options?.types || ['restaurant', 'cafe', 'bar'];
    
    // FIX 2: Map legacy types to new API types and validate
    const typeMapping: { [key: string]: string } = {
      // Legacy to New API mappings
      'african_restaurant': 'restaurant',
      'asian_restaurant': 'restaurant', 
      'brunch_restaurant': 'restaurant',
      'dessert_shop': 'restaurant',
      'donut_shop': 'bakery',
      'fast_food_restaurant': 'restaurant',
      'mexican_restaurant': 'restaurant',
      'pizza_restaurant': 'restaurant',
      'seafood_restaurant': 'restaurant',
      'steak_house': 'restaurant',
      'sushi_restaurant': 'restaurant',
      'thai_restaurant': 'restaurant',
      'vegetarian_restaurant': 'restaurant',
      'meal_takeaway': 'meal_takeaway',
      'meal_delivery': 'meal_delivery',
      // Valid new API types (keep as-is)
      'restaurant': 'restaurant',
      'cafe': 'cafe', 
      'bar': 'bar',
      'night_club': 'night_club',
      'bakery': 'bakery',
      'tourist_attraction': 'tourist_attraction',
    };
    
    const validNewApiTypes = [
      'restaurant', 'cafe', 'bar', 'night_club', 'meal_takeaway', 'meal_delivery',
      'bakery', 'food','tourist_attraction',
    ];
    const validTypes = Object.keys(typeMapping).concat(validNewApiTypes);
    
    // Map legacy types to new API types and remove duplicates
    let mappedTypes = includedTypes
      .map(type => typeMapping[type] || type)
      .filter(Boolean);
    
    // Remove duplicates
    mappedTypes = [...new Set(mappedTypes)];
    
    if (mappedTypes.length === 0) {
      mappedTypes = ['restaurant']; // fallback
    }
    
    console.log('Original types:', includedTypes);
    console.log('Mapped types for API:', mappedTypes);
    
    if (options?.types && options.types.length > 0) {
      includedTypes = options.types;
    }
    
    // FIX 3: Ensure radius is within valid range (1-50000 meters)
    const radiusMeters = Math.min(Math.max(userData.searchRadius * 1000, 1), 50000);
    
    // FIX 4: Create properly structured request body
    const requestBody: any = {
      includedTypes: mappedTypes, // Use mapped types
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: {
            latitude: Number(locationData.latitude),
            longitude: Number(locationData.longitude)
          },
          radius: radiusMeters
        }
      }
    };

    // FIX 5: Only add pageToken if it's valid and not empty
    if (options?.pageToken && typeof options.pageToken === 'string' && options.pageToken.trim()) {
      requestBody.pageToken = options.pageToken.trim();
    }

    console.log('Places API Request:', JSON.stringify(requestBody, null, 2));

    // FIX 6: Correct headers and field mask
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchNearby',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          // FIX 7: Correct field mask - nextPageToken is NOT included here
          'X-Goog-FieldMask': 'places.id,places.displayName,places.types,places.formattedAddress,places.rating,places.location,places.photos'
        },
        timeout: 15000,
        // FIX 8: Add request validation
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      }
    );

    // FIX 9: Better error handling
    if (response.status !== 200) {
      console.error('API returned non-200 status:', response.status, response.data);
      return { results: [], nextPageToken: null };
    }

    console.log('Places API Response:', response.data);

    if (response.data?.places) {
      const results = response.data.places
        .filter((place: any) => 
          place.id && place.displayName?.text && // Ensure required fields exist
          !options?.excludedTypes?.some(type => place.types?.includes(type))
        )
        .map((place: any) => ({
          place_id: place.id,
          name: place.displayName?.text || 'Unnamed Venue',
          types: place.types || [],
          vicinity: place.formattedAddress || 'Address not available',
          rating: place.rating || 0,
          geometry: {
            location: {
              lat: place.location?.latitude || 0,
              lng: place.location?.longitude || 0
            }
          },
          // FIX 10: Handle photos safely
          photos: place.photos?.slice(0, 5).map((photo: any) => ({
            photo_reference: photo.name?.split('/').pop() || ''
          })) || []
        }));
      
      const nextToken = response.data.nextPageToken || null;
      setHasMorePlaces(!!nextToken);
      setNextPageToken(nextToken);
      
      return { results, nextPageToken };
    }
    
    return { results: [], nextPageToken: null };
    
  } catch (error) {
    console.error('Places fetch error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        requestBody: error.config?.data,
        responseData: error.response?.data,
        message: error.message
      };
      
      console.error('Complete API Error Details:', JSON.stringify(errorDetails, null, 2));
      
      // Log specific Google API error
      if (error.response?.data?.error) {
        console.error('Google API Error:', {
          code: error.response.data.error.code,
          message: error.response.data.error.message,
          status: error.response.data.error.status,
          details: error.response.data.error.details
        });
      }
    }
    
    return { results: [], nextPageToken: null };
  } finally {
    setPlacesLoading(false);
  }
};
  // ─── Profile Management ──────────────────────────────────────────
  const pickImage = async (): Promise<string | undefined> => {
    if (!user) {
      alert('You must be logged in to upload images');
      return;
    }

    try {
      // Implementation for image picking would go here
      // This is a placeholder for actual implementation
      return 'https://example.com/profile.jpg';
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

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
      
      // Update cache
      if (userData) {
        await cacheUserData({ ...userData, username: newUsername });
      }
    } catch (error) {
      console.error('Username update error:', error);
      throw error;
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
      
      // Update cache
      if (userData) {
        await cacheUserData({ ...userData, searchRadius: newRadius });
      }
    } catch (error) {
      console.error('Search radius update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ─── Initialization & Auth State ────────────────────────────────
  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Wait for Firebase auth to initialize
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve();
        });
      });
      
      // Auto-login for web using session token
      if (isWeb && !auth.currentUser) {
        const token = await loadSessionToken();
        if (token) {
          try {
            await signInWithCustomToken(auth, token);
          } catch (error) {
            console.error('Auto-login failed:', error);
            await clearSessionToken();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Effects ────────────────────────────────────────────────────
  useEffect(() => {
    // Load location services preference
    const loadPreferences = async () => {
      try {
        const locationPref = await SecureStorage.getItemAsync(LOCATION_SERVICES_KEY);
        if (locationPref) {
          setEnableLocationServicesState(locationPref === 'true');
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Load cached data for immediate UI display
          const [cachedUserData, cachedLocation] = await Promise.all([
            getCachedUserData(),
            getCachedLocation()
          ]);
          
          if (cachedUserData) setUserData(cachedUserData);
          if (cachedLocation) setLocationData(cachedLocation);
          
          // Fetch fresh data from Firestore
          const [userDoc, locationDoc] = await Promise.all([
            getDoc(doc(db, 'users', firebaseUser.uid)),
            getDoc(doc(db, 'user_locations', firebaseUser.uid))
          ]);
          
          if (userDoc.exists()) {
            const freshUserData = userDoc.data() as UserData;
            setUserData(freshUserData);
            await cacheUserData(freshUserData);
          }
          
          if (locationDoc.exists()) {
            const freshLocation = locationDoc.data() as LocationData;
            setLocationData(freshLocation);
            await cacheLocationData(freshLocation);
          }
          
          // Start token refresh cycle
          startTokenRefreshTimer();
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      } else {
        // Clear data on logout
        setUserData(null);
        setLocationData(null);
        setNearbyPlaces([]);
        setNextPageToken(null);
      }
      
      setLoading(false);
    });
    
    return () => {
      unsubscribe();
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-fetch places when location changes
    if (locationData?.latitude && locationData?.longitude && userData?.searchRadius) {
      setNearbyPlaces([]);
      setNextPageToken(null);
      setHasMorePlaces(true);
      fetchNearbyPlaces();
    }
  }, [locationData?.latitude, locationData?.longitude, userData?.searchRadius]);

  // ─── Provider Value ─────────────────────────────────────────────
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