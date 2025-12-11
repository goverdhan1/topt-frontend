import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.headers.common['Content-Type'] = 'application/json';

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      checkAuthStatus(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async (token) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/status');

      if (response.data.success) {
        setUser({
          ...response.data.user,
          token: token
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (mobile, otp) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/verify-otp', {
        mobile,
        otp
      });

      if (response.data.success) {
        const { token, user: userData, expiresAt } = response.data;

        // Store token in localStorage
        localStorage.setItem('userToken', token);
        localStorage.setItem('tokenExpiry', expiresAt);

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser({
          ...userData,
          token: token
        });

        return { success: true };
      } else {
        setError(response.data.error);
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const requestOTP = async (mobile) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/request-otp', {
        mobile
      });

      if (response.data.success) {
        return {
          success: true,
          method: response.data.method,
          qrData: response.data.qrData,
          secret: response.data.secret,
          enabled: response.data.enabled
        };
      } else {
        setError(response.data.error);
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to setup authentication';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if user is authenticated
      if (user) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('userToken');
      localStorage.removeItem('tokenExpiry');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setError(null);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');

      if (response.data.success) {
        const { token, expiresAt } = response.data;

        localStorage.setItem('userToken', token);
        localStorage.setItem('tokenExpiry', expiresAt);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setUser(prev => ({
          ...prev,
          token: token
        }));

        return { success: true };
      } else {
        logout();
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      logout();
      return { success: false, error: 'Token refresh failed' };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    requestOTP,
    refreshToken,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
