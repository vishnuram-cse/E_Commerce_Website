const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const cartController = {
  async getCart(req, res) {
    try {
      const items = await Cart.findByUserId(req.user.id);
      res.status(200).json({ success: true, cart: items });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ success: false, message: 'Server error fetching cart.' });
    }
  },

  async addToCart(req, res) {
    try {
      const { product_id, quantity = 1 } = req.body;
      const userId = req.user.id;

      // 1. Verify product exists
      const product = await Product.findById(parseInt(product_id));
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      // 2. Verify stock
      const existingItem = await Cart.findItem(userId, parseInt(product_id));
      const currentCartQty = existingItem ? existingItem.quantity : 0;
      const requestedQty = currentCartQty + parseInt(quantity);

      if (product.stock_quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add product. Only ${product.stock_quantity} item(s) in stock. You already have ${currentCartQty} in cart.`
        });
      }

      // 3. Add to cart
      const cartItem = await Cart.add({
        userId,
        productId: parseInt(product_id),
        quantity: parseInt(quantity)
      });

      res.status(200).json({
        success: true,
        message: 'Product added to cart.',
        cartItem
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ success: false, message: 'Server error adding to cart.' });
    }
  },

  async updateCartItem(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
        return res.status(400).json({ success: false, message: 'Valid quantity is required.' });
      }

      // 1. Find cart item to get product_id
      const cartItems = await Cart.findByUserId(userId);
      const cartItem = cartItems.find(item => item.id === parseInt(itemId));
      if (!cartItem) {
        return res.status(404).json({ success: false, message: 'Cart item not found or unauthorized.' });
      }

      // 2. Check stock of that product
      const product = await Product.findById(cartItem.product_id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      if (product.stock_quantity < parseInt(quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${product.stock_quantity} item(s) available.`
        });
      }

      // 3. Update quantity
      const success = await Cart.update(parseInt(itemId), userId, parseInt(quantity));
      if (!success) {
        return res.status(404).json({ success: false, message: 'Failed to update cart item.' });
      }

      res.status(200).json({ success: true, message: 'Cart updated successfully.' });
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ success: false, message: 'Server error updating cart item.' });
    }
  },

  async removeFromCart(req, res) {
    try {
      const { itemId } = req.params;
      const userId = req.user.id;

      const success = await Cart.delete(parseInt(itemId), userId);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Cart item not found or unauthorized.' });
      }

      res.status(200).json({ success: true, message: 'Item removed from cart.' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ success: false, message: 'Server error removing item from cart.' });
    }
  }
};

module.exports = cartController;
