import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://topt-back-47b6d49bc89e.herokuapp.com';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.timeout = 10000; // 10 seconds timeout to prevent hanging requests

  // Check if admin is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      checkAdminStatus(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAdminStatus = async (token) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/admin/profile');

      if (response.data.success) {
        setAdmin({
          ...response.data.user,
          token: token
        });
      } else {
        adminLogout();
      }
    } catch (error) {
      console.error('Admin status check failed:', error);
      adminLogout();
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('https://topt-back-47b6d49bc89e.herokuapp.com/api/admin/login', {
        username,
        password
      });

      if (response.data.success) {
        const { token, admin: adminData, expiresAt } = response.data;

        // Store token in localStorage
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminTokenExpiry', expiresAt);

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setAdmin({
          ...adminData,
          token: token
        });

        return { success: true };
      } else {
        setError(response.data.error);
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Admin login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const adminLogout = async () => {
    try {
      // Call logout endpoint if admin is authenticated
      if (admin) {
        await axios.post('/api/admin/logout');
      }
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminTokenExpiry');
      delete axios.defaults.headers.common['Authorization'];
      setAdmin(null);
      setError(null);
    }
  };

  const value = {
    admin,
    loading,
    error,
    adminLogin,
    adminLogout,
    setError
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
