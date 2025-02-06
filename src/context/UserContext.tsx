// src/context/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../services/firebase/config';
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import * as Location from 'expo-location';
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const PLACES_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const storage = getStorage();

interface UserData {
  username: string;
  email: string;
  profilePicture?: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  searchRadius: number;
  uid: string;
  createdAt: Date;
}

type UserContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateLocation: () => Promise<void>;
  pickImage: () => Promise<string | undefined>;
  updateUsername: (newUsername: string) => Promise<void>;
  updateSearchRadius: (newRadius: number) => Promise<void>;
  nearbyPlaces: any[];
  fetchNearbyPlaces: () => Promise<void>;
};
const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  signOut: async () => {},
  updateLocation: async () => {},
  pickImage: async () => undefined,
  updateUsername: async () => {},
  updateSearchRadius: async () => {},
  nearbyPlaces: [],
  fetchNearbyPlaces: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  const uploadProfilePicture = async (uri: string) => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profile-pictures/${user.uid}`);

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
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setLoading(false);
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

      alert('Username updated successfully!');
    } catch (error) {
      console.error('Username update error:', error);
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
      console.error('Image upload error:', error);
      throw error;
    }
  };
  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
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
      console.error('Geocoding error:', error);
      return null;
    }
  };
  const fetchNearbyPlaces = async () => {
    if (!userData?.location.coordinates || !userData?.searchRadius) return;

    try {
      setPlacesLoading(true);

      const {latitude, longitude} = userData.location.coordinates;

      const response = await axios.get(PLACES_API, {
        params: {
          location: `${latitude},${longitude}`,
          radius: userData.searchRadius * 1000, // Convert km to meters
          type: 'bar|night_club|restaurant',
          key: GOOGLE_API_KEY,
        },
      });

      if (response.data.status === 'OK') {
        setNearbyPlaces(response.data.results);
      } else {
        console.error('Places API error:', response.data.status);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
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
        console.error("Error fetching user data:", error);
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
        location: {
          address: newLocation.address,
          coordinates: new GeoPoint(newLocation.latitude, newLocation.longitude)
        }
      });

      setUserData(prev => ({
        ...prev!,
        location: {
          address: newLocation.address,
          coordinates: new GeoPoint(newLocation.latitude, newLocation.longitude)
        }
      }));
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
<UserContext.Provider
      value={{
        user,
        userData,
        loading,
        signOut,
        updateLocation,
        pickImage,
        updateUsername,
        updateSearchRadius,
        nearbyPlaces,
        fetchNearbyPlaces,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);