/**
 * CardVerse Frontend - Authentication Context
 *
 * Document ID: CV-FE-006
 * Version: 0.1.0
 * Status: Development
 * Classification: Technical
 * Owner: Mostafa & ChatGPT
 * Created: 2026-07-07
 * Last Updated: 2026-07-07
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthResponse } from '../services/auth.service';

interface User {
  id: string;
  username: string;
  email?: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = authService.getAuthToken();
    if (token) {
      // TODO: Verify token and fetch user profile
      // For now, we'll just set loading to false
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    const { user, token } = response.data;
    authService.setAuthToken(token);
    setUser(user);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      handleAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  };

  const guestLogin = async () => {
    setIsLoading(true);
    try {
      const response = await authService.guestLogin();
      handleAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleLogin(token);
      handleAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ username, email, password });
      handleAuthResponse(response);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.clearAuthToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    guestLogin,
    googleLogin,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};