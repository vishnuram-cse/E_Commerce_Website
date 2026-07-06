const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { validateOrder, validateStatus } = require('../middleware/validationMiddleware');

// Regular user order endpoints
router.post('/orders', verifyToken, validateOrder, orderController.checkout);
router.get('/orders', verifyToken, orderController.getMyOrders);
router.get('/orders/:id', verifyToken, orderController.getOrderById);

// Admin-only order endpoints
router.get('/admin/orders', verifyToken, requireAdmin, orderController.getAllOrders);
router.put('/admin/orders/:id/status', verifyToken, requireAdmin, validateStatus, orderController.updateOrderStatus);

module.exports = router;
