// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../services/firebase/config';
import { UserData, GooglePlace, LocationData, UserContext, FilterData } from 'src/services/auth/types';
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import * as Location from 'expo-location';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const PLACES_API = 'https://places.googleapis.com/v1/places:searchNearby';
const storage = getStorage();

const UserContextInstance = createContext<UserContext>({
  user: null,
  userData: null,
  locationData: null,
  loading: true,
  signOut: async () => {},
  updateLocation: async () => {},
  pickImage: async () => undefined,
  updateUsername: async () => {},
  updateSearchRadius: async () => {},
  nearbyPlaces: [],
  fetchNearbyPlaces: async () => ({ results: [], nextPageToken: null }), // Fixed return value
  nextPageToken: null,
  placesLoading: false,
  hasMorePlaces: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<GooglePlace[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [hasMorePlaces, setHasMorePlaces] = useState(true);
  const [cooldown, setCooldown] = useState(false);

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
     // console.error('Username update error:', error);
      alert('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  // Function to update search radius
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
     // console.error('Search radius update error:', error);
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
        quality: 0.9,
      });
  
      if (!result.canceled && result.assets[0].uri) {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        
        // Use the user's UID in the storage path
        const storageRef = ref(storage, `profile-pictures/${user.uid}`);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
  
        // Update Firestore document
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
     // console.error('Image upload error:', error);
      throw error;
    }
  };
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
       // console.warn('Location permission denied');
        return null;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = coords;

      // Use Google Geocoding API
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
     // console.error('Geocoding error:', error);
      return null;
    }
  };

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

    // If we have a cooldown active and this isn't a pagination request, prevent the request
    if (cooldown && !options?.pageToken) {
      console.log("Request throttled due to cooldown");
      return { results: [], nextPageToken: null };
    }

    // Set a brief cooldown to prevent rapid repeated requests
    if (!options?.pageToken) {
      setCooldown(true);
      setTimeout(() => setCooldown(false), 2000);
    }

    // Default types if not provided
    let requestTypes = options?.types || ['bar', 'restaurant', 'cafe', 'night_club'];
    
    // Check user filter from Firestore if available
    if (!options?.types && userData?.filterId && userData.filterId !== "") {
      try {
        const filterDoc = await getDoc(doc(db, 'filters', userData.filterId));
        if (filterDoc.exists()) {
          const filterData = filterDoc.data() as FilterData;
          if (filterData.isFiltered && Array.isArray(filterData.filters) && filterData.filters.length > 0) {
            requestTypes = filterData.filters;
            console.log("Using filter types:", requestTypes);
          }
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    }

    console.log("Requesting places with types:", requestTypes);
    
    // Build parameters for backend request
    const locationParam = `${userLatitude},${userLongitude}`;
    const radius = Math.min(userData.searchRadius * 1000, 50000); // Max 50km
    
    const params = {
      location: locationParam,
      radius,
      types: requestTypes.join('|'),
      key: GOOGLE_API_KEY,
      ...(options?.pageToken && { pagetoken: options.pageToken })
    };

    // Add retry logic for more reliable API calls
    let retries = 0;
    const maxRetries = 3;
    let response;
    
    while (retries < maxRetries) {
      try {
        // If this is a page token request, add a small delay
        // This helps with Google's API which sometimes needs time to process page tokens
        if (options?.pageToken && retries === 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        response = await axios.get('http://localhost:5000/api/places', { 
          params,
          timeout: 10000 // 10 second timeout
        });
        
        // If we get here, the request succeeded
        break;
      } catch (error) {
        retries++;
        console.error(`API request failed (attempt ${retries}/${maxRetries}):`, 
          axios.isAxiosError(error) ? error.message : error);
          
        if (retries >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    
    if (response?.data?.results) {
      // Update the hasMorePlaces state based on the response
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
      
      console.log(`Found ${filteredResults.length} venues after filtering`);
      
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          setUserData(userDoc.exists() ? (userDoc.data() as UserData) : null);
        } else {
          setUserData(null);
        }
      } catch (error) {
       // console.error("Error fetching user data:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      //console.error('Update error:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
    //  console.error('Sign out error:', error);
    }
  };
  useEffect(() => {
    if (locationData?.latitude && locationData?.longitude && userData?.searchRadius) {
      setNearbyPlaces([]);
      setNextPageToken(null);
      setHasMorePlaces(true);
      fetchNearbyPlaces();
    }
  }, [locationData?.latitude,locationData?.longitude, userData?.searchRadius]);

  return (
<UserContextInstance.Provider
      value={{
        user,
        locationData,
        userData,
        loading,
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