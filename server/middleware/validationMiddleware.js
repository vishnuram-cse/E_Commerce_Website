const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Name is required and must be a string.' });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Password is required.' });
  }
  next();
};

const validateProduct = (req, res, next) => {
  const { name, price, stock_quantity, category_id } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Product name is required.' });
  }
  if (price === undefined || isNaN(price) || parseFloat(price) < 0) {
    return res.status(400).json({ success: false, message: 'Product price must be a non-negative number.' });
  }
  if (stock_quantity === undefined || isNaN(stock_quantity) || parseInt(stock_quantity) < 0) {
    return res.status(400).json({ success: false, message: 'Product stock quantity must be a non-negative integer.' });
  }
  next();
};

const validateCartItem = (req, res, next) => {
  const { product_id, quantity } = req.body;
  if (!product_id || isNaN(product_id)) {
    return res.status(400).json({ success: false, message: 'Valid product_id is required.' });
  }
  if (quantity !== undefined && (isNaN(quantity) || parseInt(quantity) <= 0)) {
    return res.status(400).json({ success: false, message: 'Quantity must be a positive integer.' });
  }
  next();
};

const validateOrder = (req, res, next) => {
  const { shipping_address } = req.body;
  if (!shipping_address || typeof shipping_address !== 'string' || shipping_address.trim() === '') {
    return res.status(400).json({ success: false, message: 'Shipping address is required.' });
  }
  next();
};

const validateStatus = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCartItem,
  validateOrder,
  validateStatus
};
