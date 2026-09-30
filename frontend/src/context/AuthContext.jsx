import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('servicehub_token');
    if (!token) {
      setUser(null);
      setMerchant(null);
      setCustomerProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.user);
        setMerchant(res.merchant);
        setCustomerProfile(res.customerProfile);
      } else {
        localStorage.removeItem('servicehub_token');
        setUser(null);
        setMerchant(null);
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      localStorage.removeItem('servicehub_token');
      setUser(null);
      setMerchant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('servicehub_token', res.token);
      setUser(res.user);
      setMerchant(res.merchant);
    }
    return res;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success) {
      localStorage.setItem('servicehub_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  const registerMerchant = async (formData) => {
    const res = await api.post('/auth/merchant-register', formData);
    if (res.success) {
      localStorage.setItem('servicehub_token', res.token);
      setUser(res.user);
      setMerchant(res.merchant);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('servicehub_token');
    setUser(null);
    setMerchant(null);
    setCustomerProfile(null);
  };

  // Demo Login Helpers
  const loginAsDemoCustomer = () => login('customer@gmail.com', 'customer123');
  const loginAsDemoMerchant = () => login('merchant@urbanglow.com', 'merchant123');
  const loginAsDemoAdmin = () => login('admin@servicehub.com', 'admin123');

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        customerProfile,
        loading,
        login,
        register,
        registerMerchant,
        merchantRegister: registerMerchant,
        logout,
        fetchMe,
        loginAsDemoCustomer,
        loginAsDemoMerchant,
        loginAsDemoAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
