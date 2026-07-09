const db = require('./config/db');

// Hard-coded mapping of product names to specific, real, direct Unsplash photo IDs
const photoIdMap = {
  // Electronics
  'Pro Mechanical Keyboard': '1587829741301-dc798b83add3',
  'Ultra Slim Power Bank': '1609081219090-a6d81d3085bf',
  'Active Noise Cancelling Earbuds': '1590658268037-6bf12165a8df',
  'Full HD Webcam 1080p': '1615526675159-e248c3021d3f',
  'Quantum Wireless Headphones': '1505740420928-5e560c06d30e',

  // Fashion / Apparel
  'Classic Denim Jacket': '1576995853123-5a10305d93c0',
  'Polarized Sport Sunglasses': '1572635196237-14b3f281503f',
  'Water-Resistant Travel Backpack': '1553062407-98eeb64c6a62',
  'Minimalist Leather Wallet': '1512393144765-a04c69cf4f86',
  'Vanguard Chronograph Watch': '1523275335684-37898b6baf30',
  'AeroStride Running Shoes': '1542291026-7eec264c27ff',

  // Home & Living
  'Pour-Over Coffee Maker Set': '1514432324607-a09d9b4aefdd',
  'Aromatic Soy Candle Set': '1603006905003-be475563bc59',
  'Bamboo Plant Stand': '1501004318641-b39e6451bec6',
  'Memory Foam Pillow': '1499209974431-9dddcece7f88',
  'Ergonomic Desk Chair': '1592078615290-033ee584e267',
  'Smart Ambient Desk Lamp': '1507473885765-e6ed057f782c',

  // Sports & Outdoors
  'Non-Slip Eco Yoga Mat': '1599447421416-3414500d18a5',
  '3-Person Waterproof Tent': '1504280390367-361c6d9f38f4',
  'Adjustable Dumbbell Set': '1517838277536-f5f99be501cd',
  'Sleek Thermal Flask': '1602143407151-7111542de6e8'
};

function getPhotoId(productName, categoryName) {
  // Check direct mapping first
  if (photoIdMap[productName]) {
    return photoIdMap[productName];
  }

  // Fallback pattern matching on name (case-insensitive)
  const nameLower = productName.toLowerCase();
  if (nameLower.includes('keyboard')) return '1587829741301-dc798b83add3';
  if (nameLower.includes('power bank') || nameLower.includes('charger')) return '1609081219090-a6d81d3085bf';
  if (nameLower.includes('earbud')) return '1590658268037-6bf12165a8df';
  if (nameLower.includes('headphone')) return '1505740420928-5e560c06d30e';
  if (nameLower.includes('webcam') || nameLower.includes('camera')) return '1615526675159-e248c3021d3f';
  
  if (nameLower.includes('jacket') || nameLower.includes('coat')) return '1576995853123-5a10305d93c0';
  if (nameLower.includes('sunglasses') || nameLower.includes('glasses')) return '1572635196237-14b3f281503f';
  if (nameLower.includes('backpack') || nameLower.includes('bag')) return '1553062407-98eeb64c6a62';
  if (nameLower.includes('wallet') || nameLower.includes('purse')) return '1512393144765-a04c69cf4f86';
  if (nameLower.includes('watch')) return '1523275335684-37898b6baf30';
  if (nameLower.includes('shoe') || nameLower.includes('sneaker') || nameLower.includes('footwear')) return '1542291026-7eec264c27ff';

  if (nameLower.includes('coffee') || nameLower.includes('maker') || nameLower.includes('carafe')) return '1514432324607-a09d9b4aefdd';
  if (nameLower.includes('candle')) return '1603006905003-be475563bc59';
  if (nameLower.includes('plant') || nameLower.includes('stand')) return '1501004318641-b39e6451bec6';
  if (nameLower.includes('pillow')) return '1499209974431-9dddcece7f88';
  if (nameLower.includes('chair')) return '1592078615290-033ee584e267';
  if (nameLower.includes('lamp') || nameLower.includes('light')) return '1507473885765-e6ed057f782c';

  if (nameLower.includes('yoga') || nameLower.includes('mat')) return '1599447421416-3414500d18a5';
  if (nameLower.includes('tent')) return '1504280390367-361c6d9f38f4';
  if (nameLower.includes('dumbbell') || nameLower.includes('weight')) return '1517838277536-f5f99be501cd';
  if (nameLower.includes('flask') || nameLower.includes('bottle')) return '1602143407151-7111542de6e8';

  // Fallback to category-based keywords
  if (categoryName) {
    const catLower = categoryName.toLowerCase();
    if (catLower.includes('electronics')) return '1505740420928-5e560c06d30e'; // headphones
    if (catLower.includes('fashion') || catLower.includes('apparel')) return '1542291026-7eec264c27ff'; // shoes
    if (catLower.includes('home') || catLower.includes('living')) return '1507473885765-e6ed057f782c'; // lamp
    if (catLower.includes('sport') || catLower.includes('outdoor')) return '1602143407151-7111542de6e8'; // flask
  }

  // Final fallback (generic product/tech photo)
  return '1531403009284-440f080d1e12';
}

async function updateProductImages() {
  try {
    // Fetch products along with their category name for robust fallback checking
    const [products] = await db.query(
      `SELECT p.id, p.name, p.image_url, c.name AS category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id`
    );

    console.log(`Found ${products.length} products to update.`);
    let updatedCount = 0;

    for (const prod of products) {
      const photoId = getPhotoId(prod.name, prod.category_name);
      const newImageUrl = `https://images.unsplash.com/photo-${photoId}?w=500&h=500&fit=crop`;

      // Update the product
      const [result] = await db.query(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [newImageUrl, prod.id]
      );
      
      updatedCount += result.affectedRows;
      console.log(`Updated product "${prod.name}" (ID: ${prod.id}) to URL: "${newImageUrl}" (affected: ${result.affectedRows})`);
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


