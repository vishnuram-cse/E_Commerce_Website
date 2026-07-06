const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', verifyToken, requireAdmin, categoryController.createCategory);

module.exports = router;
