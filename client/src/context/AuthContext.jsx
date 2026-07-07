import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

export { api };

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Set default header if token exists
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Error restoring session:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, user };
    }
    return { success: false, message: 'Invalid response' };
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true, user };
    }
    return { success: false, message: 'Invalid response' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
