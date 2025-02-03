import { useState } from 'react';
import { handleLogin } from './login';
import { handleRegistration } from './register';
import { AuthResult, AuthUser } from './types';
import { GeoPoint } from 'firebase/firestore'; // Import GeoPoint for Firestore

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (
    userData: AuthUser & { location: { address: string; latitude: number; longitude: number } }
  ): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      // Add location data to the registration payload
      const result = await handleRegistration({
        ...userData,
        location: {
          address: userData.location.address,
          latitude: userData.location.latitude,
          longitude: userData.location.longitude,}
      });

      if (!result.success) {
        setError(result.error?.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred during registration.');
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const performLogin = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await handleLogin(email, password);

      if (!result.success) {
        setError(result.error?.message || 'Login failed');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login.');
      return { success: false, error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, performLogin, loading, error };
};