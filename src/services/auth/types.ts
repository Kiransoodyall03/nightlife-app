// src/services/auth/types.ts
import { GeoPoint } from 'firebase/firestore';

export interface FirebaseAuthError extends Error {
    code: string;
    message: string;
  };
  
  export type AuthResult<T = any> = {
    success: boolean;
    user?: T;
    error?: Error;
  };
  

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
  

  export interface LocationData {
    latitude: number;
    longitude: number;
    address?: string;
  };