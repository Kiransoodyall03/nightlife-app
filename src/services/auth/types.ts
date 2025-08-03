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
    groupId?: string;
    likeId?: string;
  };

  export interface UserData {
    username: string;
    email: string;
    profilePicture?: string;
    searchRadius: number;
    uid: string;
    createdAt: Date;
    filterId: any;
    groupIds?: string[];
  }
  export interface AuthUser {
    username: string;
    email: string;
    password: string;
  }

  export interface LikeData {
    likeId: string;
    groupId: string;
    userId: string;
    locationId: string;
    locationName?: string;
    locationAddress?: string;
    locationRating?: number;
    locationPicture?: string | null;
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
    accuracy?: number | null;
    timestamp?: string;
  };

  export interface GroupData {
    groupId: string;
    groupName: string;
    members?: string[];
    groupPicture: string;
    isActive: boolean;
    filtersId?: string[];
    createdAt: Date;
    ownerId: string;
    groupCode: string;
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
  }) => Promise<{
    status: any; results: GooglePlace[]; nextPageToken: string | null 
}>;
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

  // Add these to your types.ts
export interface MatchedUser {
  id: string;
  profileImage: string;
}

export interface MatchData {
  matchId: string;
  groupId: string;
  locationId: string;
  locationName: string;
  locationImage: string;
  locationRating: number;
  locationDistance: string;
  locationAddress: string;
  locationTypes: string[];
  matchedUsers: MatchedUser[];
  matchedUsersCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}