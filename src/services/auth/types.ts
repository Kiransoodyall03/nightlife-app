// src/services/auth/types.ts
import { User } from "firebase/auth";

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
    searchRadius: number;
    uid: string;
    createdAt: Date;
    filterId: any;
  }
  
  export interface GroupData{
    groupId: string;
    groupnName: string;
    members: string[];
    createdAt: Date;
  }
  export interface AuthUser {
    username: string;
    email: string;
    password: string;
  }

  export interface FilterData {
    filterId: string;
    userId?: string;
    filters: string[];
    isFiltered: boolean;
  };

  export interface LocationData {
    locationId: string;
    latitude: number;
    longitude: number;
    address?: string;
  };

  export interface UserContext{
  user: User | null;
  userData: UserData | null;
  locationData: LocationData | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateLocation: () => Promise<void>;
  pickImage: () => Promise<string | undefined>;
  updateUsername: (newUsername: string) => Promise<void>;
  updateSearchRadius: (newRadius: number) => Promise<void>;
  nearbyPlaces: GooglePlace[];
  nextPageToken: string | null;
  fetchNearbyPlaces: (options?: {
    excludedTypes?: string[];
    types?: string[];
    pageToken?: string | null;
  }) => Promise<{ results: GooglePlace[]; nextPageToken: string | null }>;
  placesLoading: boolean;
  hasMorePlaces: boolean;
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