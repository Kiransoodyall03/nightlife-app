// src/hooks/useAuth.ts
import { useState } from 'react';
import { handleLogin } from './login';
import { handleRegistration } from './register';
import { AuthResult, AuthUser } from './types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (userData: AuthUser): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    const result = await handleRegistration(userData);
    
    if (!result.success) {
      setError(result.error?.message || 'Registration failed');
    }
    
    setLoading(false);
    return result;
  };

  const performLogin = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    
    const result = await handleLogin(email, password);
    
    if (!result.success) {
      setError(result.error?.message || 'Login failed');
    }
    
    setLoading(false);
    return result;
  };

  return { handleRegister, performLogin, loading, error };
};