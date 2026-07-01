'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(savedToken);
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data.user);
      } catch (error) {
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [setAuthToken]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setAuthToken(res.data.token);
      setUser(res.data.user);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Direct login with token (for demo and social login)
  const loginWithToken = useCallback(async (newToken) => {
    try {
      setAuthToken(newToken);
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data.user);
      toast.success('Welcome!');
      return true;
    } catch (error) {
      setAuthToken(null);
      toast.error('Authentication failed');
      return false;
    }
  }, [setAuthToken]);

  const register = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      setAuthToken(res.data.token);
      setUser(res.data.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setAuthToken(null);
    router.push('/');
    toast.success('Logged out');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      isAdmin,
      login,
      register,
      logout,
      loginWithToken,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};