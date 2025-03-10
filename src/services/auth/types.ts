// src/services/auth/types.ts
import { GeoPoint } from 'firebase/firestore';

export interface FirebaseAuthError extends Error {
    code: string;
    message: string;
  };
  
  export interface AuthResult {
    success: boolean;
    user?: any;
    error?: Error;
    filterId?: string;
  };

  export interface UserData {
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
    filterId?:  string;
    searchRadius: number;
    uid: string;
    createdAt: Date;
  }
  
  export interface AuthUser {
    username: string;
    email: string;
    password: string;
    location: {
      address: string;
      latitude: number;
      longitude: number;
    };
  }

  export interface FilterData {
    userId?: string;
    filters: string[];
    isFiltered: boolean;
  };

  export interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
  };

  export interface GooglePlace {
    place_id: string;
    name: string;
    types: string[];
    vicinity: string;
    rating?: number;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    photos?: Array<{
      photo_reference: string;
    }>;
  }