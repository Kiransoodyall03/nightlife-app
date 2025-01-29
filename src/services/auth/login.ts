// src/services/auth/login.ts
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AuthResult, FirebaseAuthError } from './types';

export const handleLogin = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    const firebaseError = error as FirebaseAuthError;
    return {
      success: false,
      error: firebaseError
    };
  }
};