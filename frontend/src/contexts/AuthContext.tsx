'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  college_name?: string;
  is_student: boolean;
  role: string;
  profile_completed: boolean;
  skills?: string[] | string | null; // backend returns comma-separated string; we normalize to string[] when setting state
  github_profile?: string | null;
  // UI-friendly aliases (added at runtime)
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: { fullName: string; college: string; skills: string[]; githubProfile?: string }) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  college_name: string;
  is_student: boolean;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Normalize skills (backend returns comma-separated string)
        let skills: string[] | undefined = undefined;
        if (userData.skills) {
          if (Array.isArray(userData.skills)) {
            skills = userData.skills as string[];
          } else if (typeof userData.skills === 'string') {
            skills = userData.skills
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);
          }
        }
        const transformed: User = {
          ...userData,
          skills,
          profileCompleted: userData.profile_completed
        };
        setUser(transformed);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        await fetchCurrentUser(data.access_token);
        toast.success('Successfully signed in!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.access_token);
        await fetchCurrentUser(data.access_token);
        toast.success('Account created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUserProfile = async (data: { fullName: string; college: string; skills: string[]; githubProfile?: string }) => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    try {
      const response = await fetch('http://localhost:8000/profile-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: data.fullName,
          college: data.college,
            skills: data.skills,
          github_profile: data.githubProfile || null
        })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Profile update failed');
      }
      // Optimistically update local user state
      setUser(prev => prev ? {
        ...prev,
        name: data.fullName,
        college_name: data.college,
        skills: data.skills,
        github_profile: data.githubProfile || null,
        profile_completed: true,
        profileCompleted: true
      } : prev);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message || 'Profile update failed');
      throw e;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}