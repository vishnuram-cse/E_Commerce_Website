const bcrypt = require('bcrypt');
const db = require('../config/db');

const seedDatabase = async () => {
  try {
    // 1. Check if users table is empty
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('Database is empty. Running seeder...');

      // Insert Admin and User
      const adminPass = await bcrypt.hash('adminpassword', 10);
      const userPass = await bcrypt.hash('password123', 10);

      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@ecommerce.com', adminPass, 'admin']
      );

      await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['John Doe', 'john@example.com', userPass, 'user']
      );

      console.log('Seeded default users: admin@ecommerce.com / adminpassword, john@example.com / password123');

      // Insert Categories
      const categories = ['Electronics', 'Fashion', 'Home & Living', 'Sports & Outdoors'];
      const categoryIds = {};

      for (const cat of categories) {
        const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [cat]);
        categoryIds[cat] = result.insertId;
      }
      console.log('Seeded categories.');

      // Insert Products
      const products = [
        {
          name: 'Quantum Wireless Headphones',
          description: 'Experience immersive audio with active noise-canceling technology, 40-hour battery life, and ultra-comfortable memory foam earcups.',
          price: 199.99,
          stock_quantity: 25,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
          category_id: categoryIds['Electronics']
        },
        {
          name: 'Vanguard Chronograph Watch',
          description: 'A premium minimalist watch featuring Japanese quartz movement, genuine leather strap, and 50m water resistance.',
          price: 129.50,
          stock_quantity: 15,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          category_id: categoryIds['Fashion']
        },
        {
          name: 'AeroStride Running Shoes',
          description: 'Lightweight performance running shoes with reactive cushioning, breathable mesh knit, and high-traction rubber outer soles.',
          price: 89.99,
          stock_quantity: 40,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
          category_id: categoryIds['Fashion']
        },
        {
          name: 'Sleek Thermal Flask',
          description: 'Double-walled vacuum insulated water bottle keeping beverages ice-cold for 24 hours or steaming hot for 12 hours.',
          price: 24.95,
          stock_quantity: 100,
          image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
          category_id: categoryIds['Sports & Outdoors']
        },
        {
          name: 'Ergonomic Desk Chair',
          description: 'High-back mesh computer chair with adjustable lumbar support, 3D armrests, and dynamic reclining mechanism.',
          price: 249.99,
          stock_quantity: 8,
          image_url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&auto=format&fit=crop&q=60',
          category_id: categoryIds['Home & Living']
        },
        {
          name: 'Smart Ambient Desk Lamp',
          description: 'Dimmable LED task light with wireless charging pad, adjustable color temperature, and scheduling via smart app.',
          price: 45.00,
          stock_quantity: 30,
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
          category_id: categoryIds['Home & Living']
        }
      ];

      for (const prod of products) {
        await db.query(
          'INSERT INTO products (name, description, price, stock_quantity, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
          [prod.name, prod.description, prod.price, prod.stock_quantity, prod.image_url, prod.category_id]
        );
      }
      console.log('Seeded products.');
      console.log('Database seeding finished successfully!');
    }
  } catch (error) {
    console.error('Failed to seed database:', error.message);
  }
};

module.exports = seedDatabase;
