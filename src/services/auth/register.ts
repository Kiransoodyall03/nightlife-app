// src/services/auth/register.ts
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthResult, AuthUser } from './types';
export const handleRegistration = async (
  userData: AuthUser & {location_id: string}
): Promise<AuthResult> => {
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
      searchRadius: 5,
      filterId: "",
      createdAt: new Date(),
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
  //  console.error('Registration error:', error);
    return { success: false, error: error as Error };
  }
};