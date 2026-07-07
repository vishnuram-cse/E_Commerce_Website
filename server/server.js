const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const seedDatabase = require('./utils/seeder');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Enable CORS for React frontend (Vite default is http://localhost:5173)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://e-commerce-website-pink-beta.vercel.app'],
  credentials: true
}));

// 2. Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', orderRoutes); // Registers /api/orders and /api/admin/orders

// 5. Catch 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error details:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// 7. Seed Database and Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Run seeder to make database ready
  await seedDatabase();
});
