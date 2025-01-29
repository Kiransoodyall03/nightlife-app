// src/services/auth/types.ts
export interface FirebaseAuthError extends Error {
    code: string;
    message: string;
  }
  
  export type AuthResult<T = any> = {
    success: boolean;
    user?: T;
    error?: FirebaseAuthError;
  };
  
  export type AuthUser = {
    email: string;
    password: string;
    username?: string;
  };