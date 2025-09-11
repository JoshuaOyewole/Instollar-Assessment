'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { cookieUtils } from '@/lib/cookies';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'talent' | 'admin';
  location?: string;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token in cookies
    const tokenFromCookie = cookieUtils.getToken();
    if (tokenFromCookie) {
      setToken(tokenFromCookie);
      // Verify token and get user data
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (error) {
      // Token might be invalid, clear it
      cookieUtils.clearToken();
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, data: userData } = response.data;
      // Store token only in cookie (more secure)
      cookieUtils.setToken(newToken, 1); // 1 day expiry
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: any): Promise<User> => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, data: newUserData } = response.data;

      // Store token only in cookie (more secure)
      cookieUtils.setToken(newToken, 1); // 1 day expiry
      setToken(newToken);
      setUser(newUserData);
      return newUserData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    // Clear cookie only
    cookieUtils.clearToken();
    router.push("/")
    setToken(null);
    setUser(null);
  };

  const updateUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error('Error updating user:', error);
      // If token is invalid, clear it
      cookieUtils.clearToken();
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
