'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { registerUser, loginUser, logoutUser, getUserProfile } from '@/lib/firebase-api';

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: string;
  college_name?: string;
  full_name?: string;
  bio?: string;
  profile_picture?: string;
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, fullName: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    fullName: string, 
    role: string
  ): Promise<boolean> => {
    try {
      const result = await registerUser(email, password, {
        username,
        full_name: fullName,
        role,
        college_name: '',
        bio: '',
        profile_picture: ''
      });
      
      if (result.success) {
        toast.success('Registration successful! Please log in.');
        return true;
      } else {
        toast.error(result.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
