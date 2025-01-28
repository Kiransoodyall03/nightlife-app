import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "firebase/config";

export const signUp = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User signed up:", userCredential.user);
  } catch (error: any) {
    console.error("Error signing up:", error.message);
  }
};
