'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User, SignUpInput, SignInInput } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: SignUpInput) => Promise<void>;
  signIn: (data: SignInInput) => Promise<void>;
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
          apiClient.setToken(token);
        }
        
        if (apiClient.isAuthenticated()) {
          const userProfile = await apiClient.getUserProfile();
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiClient.clearToken();
        removeCookie('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (data: SignUpInput) => {
    try {
      await apiClient.signUp(data);
      // After successful signup, automatically sign in
      await signIn({ email: data.email, password: data.password });
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (data: SignInInput) => {
    try {
      const response = await apiClient.signIn(data);
      setUser(response.user);
      
      // Store token in cookie for middleware access
      if (response.token) {
        setCookie('auth_token', response.token);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = () => {
    apiClient.clearToken();
    removeCookie('auth_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      console.log('Refreshing user, isAuthenticated:', apiClient.isAuthenticated());
      if (apiClient.isAuthenticated()) {
        const userProfile = await apiClient.getUserProfile();
        console.log('User profile loaded:', userProfile);
        setUser(userProfile);
      } else {
        console.log('Not authenticated, cannot refresh user');
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      apiClient.clearToken();
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