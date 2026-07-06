const Category = require('../models/categoryModel');

const categoryController = {
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();
      res.status(200).json({ success: true, categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ success: false, message: 'Server error fetching categories.' });
    }
  },

  async createCategory(req, res) {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      const existingCategory = await Category.findAll();
      const duplicate = existingCategory.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Category already exists.' });
      }

      const category = await Category.create(name.trim());
      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        category
      });
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ success: false, message: 'Server error creating category.' });
    }
  }
};

module.exports = categoryController;
