import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Adjust path to your firebase config
import { AuthUser } from './types';

export const auth = getAuth();

export const registerUser = async (userData: AuthUser) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      username: userData.username,
      email: userData.email,
      createdAt: new Date(),
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    const firebaseError = error as AuthError;
    return { success: false, error: firebaseError };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    const firebaseError = error as AuthError;
    return { success: false, error: firebaseError };
  }
};