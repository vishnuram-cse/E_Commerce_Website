import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { token, user } = useAuth();

  const fetchCart = async () => {
    if (!token || !user) return;
    try {
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Error fetching cart:', err.message);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [token, user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post('/cart', { product_id: productId, quantity });
      await fetchCart();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const updateQty = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { quantity });
      await fetchCart();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      await fetchCart();
      return res.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cart,
    cartCount,
    fetchCart,
    addToCart,
    updateQty,
    removeCartItem
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
