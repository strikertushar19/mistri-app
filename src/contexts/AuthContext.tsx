'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, User, RegisterData, LoginData } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: RegisterData) => Promise<void>;
  signIn: (data: LoginData) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in cookie first
        const token = getCookie('auth_token');
        if (token) {
          // Set token in localStorage for axios interceptor
          localStorage.setItem('accessToken', token);
        }
        
        // Try to get current user if token exists
        if (token) {
          const userProfile = await authApi.getCurrentUser();
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
        removeCookie('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (data: RegisterData) => {
    try {
      await authApi.register(data);
      // After successful signup, automatically sign in
      await signIn({ email: data.email, password: data.password });
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);
      setUser(response.user);
      
      // Store token in cookie for middleware access
      if (response.access_token) {
        setCookie('auth_token', response.access_token);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    removeCookie('auth_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Refreshing user, token exists:', !!token);
      if (token) {
        const userProfile = await authApi.getCurrentUser();
        console.log('User profile loaded:', userProfile);
        setUser(userProfile);
      } else {
        console.log('Not authenticated, cannot refresh user');
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      removeCookie('auth_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 