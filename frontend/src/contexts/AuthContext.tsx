import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, LoginData, CreateUserData } from '../types';
import { authApi, isAuthenticated } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: CreateUserData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in on app start
    if (isAuthenticated()) {
      refreshProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await authApi.getProfile();
      setUser(profile);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setUser(null);
      setIsLoggedIn(false);
      authApi.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginData) => {
    try {
      await authApi.login(credentials);
      await refreshProfile();
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: CreateUserData) => {
    try {
      await authApi.register(userData);
      // Auto-login after registration
      await login({ username: userData.username, password: userData.password });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const value = {
    user,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};