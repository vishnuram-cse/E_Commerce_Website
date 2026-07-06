const db = require('../config/db');

const Cart = {
  async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT c.id, c.product_id, c.quantity, c.created_at,
              p.name, p.price, p.image_url, p.stock_quantity
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async findItem(userId, productId) {
    const [rows] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0];
  },

  async add({ userId, productId, quantity = 1 }) {
    // Check if it already exists
    const existingItem = await this.findItem(userId, productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existingItem.id]
      );
      return { id: existingItem.id, user_id: userId, product_id: productId, quantity: newQuantity };
    } else {
      const [result] = await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      );
      return { id: result.insertId, user_id: userId, product_id: productId, quantity };
    }
  },

  async update(itemId, userId, quantity) {
    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, itemId, userId]
    );
    return result.affectedRows > 0;
  },

  async delete(itemId, userId) {
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );
    return result.affectedRows > 0;
  },

  async clear(userId, connection = db) {
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }
};

module.exports = Cart;
