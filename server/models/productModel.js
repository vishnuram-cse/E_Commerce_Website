const db = require('../config/db');

const Product = {
  async findAll({ categoryId, search, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM products p';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (categoryId) {
      conditions.push('p.category_id = ?');
      params.push(categoryId);
      countParams.push(categoryId);
    }

    if (search) {
      conditions.push('p.name LIKE ?');
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    // Add pagination
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    const [countRows] = await db.query(countQuery, countParams);
    
    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
      products: rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    };
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create({ name, description, price, stock_quantity, image_url, category_id }) {
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, stock_quantity, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock_quantity, image_url, category_id]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, description, price, stock_quantity, image_url, category_id }) {
    await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock_quantity = ?, image_url = ?, category_id = ? 
       WHERE id = ?`,
      [name, description, price, stock_quantity, image_url, category_id, id]
    );
    return this.findById(id);
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = Product;
