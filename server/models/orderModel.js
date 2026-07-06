const db = require('../config/db');
const Cart = require('./cartModel');

const Order = {
  async checkout(userId, shippingAddress) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch user's cart items
      const cartItems = await Cart.findByUserId(userId);
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // 2. Validate stock and calculate total amount
      let totalAmount = 0;
      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${item.name}. Available: ${item.stock_quantity}, requested: ${item.quantity}`);
        }
        totalAmount += parseFloat(item.price) * item.quantity;
      }

      // 3. Create the order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
        [userId, totalAmount, shippingAddress, 'pending']
      );
      const orderId = orderResult.insertId;

      // 4. Create order items and update product stock
      for (const item of cartItems) {
        // Insert order item
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price]
        );

        // Reduce product stock
        const newStock = item.stock_quantity - item.quantity;
        await connection.query(
          'UPDATE products SET stock_quantity = ? WHERE id = ?',
          [newStock, item.product_id]
        );
      }

      // 5. Clear cart
      await Cart.clear(userId, connection);

      // Commit transaction
      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const [orders] = await db.query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );
    if (orders.length === 0) return null;

    const order = orders[0];

    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name, p.image_url 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;
    return order;
  },

  async findAll() {
    const [rows] = await db.query(
      `SELECT o.*, u.name as user_name, u.email as user_email 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    return rows;
  },

  async updateStatus(id, status) {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Order;
