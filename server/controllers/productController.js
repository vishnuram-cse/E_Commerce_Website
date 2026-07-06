const Product = require('../models/productModel');

const productController = {
  async getAllProducts(req, res) {
    try {
      const { categoryId, search, page, limit } = req.query;
      const parsedPage = parseInt(page) || 1;
      const parsedLimit = parseInt(limit) || 10;

      const result = await Product.findAll({
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        search,
        page: parsedPage,
        limit: parsedLimit
      });

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, message: 'Server error fetching products.' });
    }
  },

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(parseInt(id));
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      res.status(200).json({ success: true, product });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ success: false, message: 'Server error fetching product.' });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, description, price, stock_quantity, image_url, category_id } = req.body;
      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
        image_url,
        category_id: category_id ? parseInt(category_id) : null
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, message: 'Server error creating product.' });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock_quantity, image_url, category_id } = req.body;

      // Check if product exists first
      const existingProduct = await Product.findById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const updatedProduct = await Product.update(parseInt(id), {
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
        image_url,
        category_id: category_id ? parseInt(category_id) : null
      });

      res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        product: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, message: 'Server error updating product.' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const success = await Product.delete(parseInt(id));
      if (!success) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, message: 'Server error deleting product.' });
    }
  }
};

module.exports = productController;
