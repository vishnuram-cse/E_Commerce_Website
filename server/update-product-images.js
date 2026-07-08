const db = require('./config/db');

const keywordMap = {
  // Electronics
  'Pro Mechanical Keyboard': 'keyboard',
  'Ultra Slim Power Bank': 'power-bank',
  'Active Noise Cancelling Earbuds': 'earbuds',
  'Full HD Webcam 1080p': 'webcam',
  // Fashion
  'Classic Denim Jacket': 'denim-jacket',
  'Polarized Sport Sunglasses': 'sunglasses',
  'Water-Resistant Travel Backpack': 'backpack',
  'Minimalist Leather Wallet': 'wallet',
  // Home & Living
  'Pour-Over Coffee Maker Set': 'coffee-maker',
  'Aromatic Soy Candle Set': 'candles',
  'Bamboo Plant Stand': 'plant-stand',
  'Memory Foam Pillow': 'pillow',
  // Sports & Outdoors
  'Non-Slip Eco Yoga Mat': 'yoga-mat',
  '3-Person Waterproof Tent': 'tent',
  'Adjustable Dumbbell Set': 'dumbbell',

  // Original Seeder products (from seeder.js)
  'Quantum Wireless Headphones': 'headphones',
  'Vanguard Chronograph Watch': 'watch',
  'AeroStride Running Shoes': 'shoes',
  'Sleek Thermal Flask': 'flask',
  'Ergonomic Desk Chair': 'chair',
  'Smart Ambient Desk Lamp': 'lamp'
};

function getKeyword(productName, categoryName) {
  // Check direct mapping first
  if (keywordMap[productName]) {
    return keywordMap[productName];
  }

  // Fallback pattern matching on name
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('keyboard')) return 'keyboard';
  if (nameLower.includes('power bank') || nameLower.includes('charger')) return 'power-bank';
  if (nameLower.includes('earbud') || nameLower.includes('headphone')) return 'earbuds';
  if (nameLower.includes('webcam') || nameLower.includes('camera')) return 'webcam';
  if (nameLower.includes('jacket') || nameLower.includes('coat')) return 'denim-jacket';
  if (nameLower.includes('sunglasses') || nameLower.includes('glasses')) return 'sunglasses';
  if (nameLower.includes('backpack') || nameLower.includes('bag')) return 'backpack';
  if (nameLower.includes('wallet') || nameLower.includes('purse')) return 'wallet';
  if (nameLower.includes('coffee') || nameLower.includes('maker')) return 'coffee-maker';
  if (nameLower.includes('candle')) return 'candles';
  if (nameLower.includes('plant') || nameLower.includes('stand')) return 'plant-stand';
  if (nameLower.includes('pillow')) return 'pillow';
  if (nameLower.includes('yoga') || nameLower.includes('mat')) return 'yoga-mat';
  if (nameLower.includes('tent')) return 'tent';
  if (nameLower.includes('dumbbell') || nameLower.includes('weight')) return 'dumbbell';
  if (nameLower.includes('watch')) return 'watch';
  if (nameLower.includes('shoe') || nameLower.includes('sneaker')) return 'shoes';
  if (nameLower.includes('flask') || nameLower.includes('bottle')) return 'flask';
  if (nameLower.includes('chair')) return 'chair';
  if (nameLower.includes('lamp') || nameLower.includes('light')) return 'lamp';

  // Fallback to category-based keywords
  if (categoryName) {
    const catLower = categoryName.toLowerCase();
    if (catLower.includes('electronics')) return 'electronics';
    if (catLower.includes('fashion') || catLower.includes('apparel')) return 'fashion';
    if (catLower.includes('home') || catLower.includes('living')) return 'home-decor';
    if (catLower.includes('sport') || catLower.includes('outdoor')) return 'sports';
  }

  // Final fallback: lowercase and slugify the product name
  return productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'product';
}

async function updateProductImages() {
  try {
    // Fetch products along with their category name
    const [products] = await db.query(
      `SELECT p.id, p.name, p.image_url, c.name AS category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id`
    );

    console.log(`Found ${products.length} products to update.`);
    let updatedCount = 0;

    for (const prod of products) {
      const keyword = getKeyword(prod.name, prod.category_name);
      const newImageUrl = `https://source.unsplash.com/500x500/?${keyword}`;

      // Update the product
      const [result] = await db.query(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [newImageUrl, prod.id]
      );
      
      updatedCount += result.affectedRows;
      console.log(`Updated product "${prod.name}" (ID: ${prod.id}) to keyword: "${keyword}" (affected: ${result.affectedRows})`);
    }

    console.log(`Success: Successfully updated ${updatedCount} rows in the products table.`);
  } catch (error) {
    console.error('Error updating product images:', error);
  } finally {
    // Close the connection pool
    await db.end();
    console.log('Database pool connection closed.');
  }
}

updateProductImages();
