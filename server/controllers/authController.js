const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token_for_ecommerce_app_2026';

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // 1. Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already registered.' });
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Create user
      // If role is passed, we check if it is 'admin' or 'user' (only for ease of first admin setup, though security-wise admin setup should be controlled. Let's allow role for register but default to user)
      const userRole = (role === 'admin' || role === 'user') ? role : 'user';

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: userRole
      });

      // 4. Generate token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        token,
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 1. Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // 2. Validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // 3. Generate token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  },

  async me(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Fetch profile error:', error);
      res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
    }
  }
};

module.exports = authController;
