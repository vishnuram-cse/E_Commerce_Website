const Order = require('../models/orderModel');

const orderController = {
  async checkout(req, res) {
    try {
      const { shipping_address } = req.body;
      const userId = req.user.id;

      // 1. Process checkout transaction
      const orderId = await Order.checkout(userId, shipping_address.trim());

      // 2. Fetch full details of created order
      const orderDetails = await Order.findById(orderId);

      res.status(201).json({
        success: true,
        message: 'Order placed successfully.',
        order: orderDetails
      });
    } catch (error) {
      console.error('Checkout error:', error);
      // Return specific error message (e.g. empty cart or insufficient stock)
      res.status(400).json({
        success: false,
        message: error.message || 'Error occurred during checkout.'
      });
    }
  },

  async getMyOrders(req, res) {
    try {
      const orders = await Order.findByUserId(req.user.id);
      res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ success: false, message: 'Server error fetching order history.' });
    }
  },

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(parseInt(id));

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Check authorization: Owner or Admin
      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized access to order details.' });
      }

      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ success: false, message: 'Server error fetching order details.' });
    }
  },

  async getAllOrders(req, res) {
    try {
      const orders = await Order.findAll();
      res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ success: false, message: 'Server error fetching orders.' });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await Order.findById(parseInt(id));
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      const success = await Order.updateStatus(parseInt(id), status);
      if (!success) {
        return res.status(400).json({ success: false, message: 'Failed to update order status.' });
      }

      res.status(200).json({
        success: true,
        message: 'Order status updated successfully.',
        status
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'Server error updating order status.' });
    }
  }
};

module.exports = orderController;
