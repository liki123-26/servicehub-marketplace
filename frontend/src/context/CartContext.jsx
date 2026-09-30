import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], merchant: null, subtotal: 0, tax: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    existingMerchantName: '',
    pendingItem: null
  });

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setCart({ items: [], merchant: null, subtotal: 0, tax: 0, total: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (serviceId, bookingDate, bookingTime, forceClear = false) => {
    try {
      const res = await api.post('/cart/add', {
        serviceId,
        bookingDate,
        bookingTime,
        forceClear
      });

      if (res.success) {
        setConflictModal({ isOpen: false, existingMerchantName: '', pendingItem: null });
        await fetchCart();
        return { success: true, message: res.message };
      }
    } catch (error) {
      if (error.status === 409 && error.data?.conflict) {
        // Trigger single merchant conflict dialog
        setConflictModal({
          isOpen: true,
          existingMerchantName: error.data.existingMerchantName || 'another merchant',
          pendingItem: { serviceId, bookingDate, bookingTime }
        });
        return { success: false, conflict: true, message: error.message };
      }
      throw error;
    }
  };

  const resolveConflictAndAdd = async () => {
    if (!conflictModal.pendingItem) return;
    const { serviceId, bookingDate, bookingTime } = conflictModal.pendingItem;
    return await addToCart(serviceId, bookingDate, bookingTime, true);
  };

  const removeFromCart = async (itemId) => {
    const res = await api.delete(`/cart/item/${itemId}`);
    if (res.success) {
      await fetchCart();
    }
    return res;
  };

  const clearCart = async () => {
    const res = await api.delete('/cart/clear');
    if (res.success) {
      await fetchCart();
    }
    return res;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        conflictModal,
        closeConflictModal: () => setConflictModal({ isOpen: false, existingMerchantName: '', pendingItem: null }),
        resolveConflictAndAdd
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
