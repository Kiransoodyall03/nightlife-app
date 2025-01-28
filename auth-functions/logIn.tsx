import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "firebase/config";

export const logIn = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
  } catch (error: any) {
    console.error("Error logging in:", error.message);
  }
};
