const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateCartItem } = require('../middleware/validationMiddleware');

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/', validateCartItem, cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);

module.exports = router;
