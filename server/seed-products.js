const db = require('./config/db');

const additionalProducts = [
  // Electronics
  {
    name: 'Pro Mechanical Keyboard',
    description: 'Tactile mechanical switches, customizable RGB backlighting, and a premium aluminum top frame for ultimate typing precision and gaming performance.',
    price: 119.99,
    stock_quantity: 35,
    image_url: 'https://source.unsplash.com/500x500/?keyboard',
    categoryName: 'Electronics'
  },
  {
    name: 'Ultra Slim Power Bank',
    description: '20,000mAh high-capacity external battery pack with 22.5W fast charging, dual USB-C output ports, and an LED power level indicator.',
    price: 34.99,
    stock_quantity: 80,
    image_url: 'https://source.unsplash.com/500x500/?power-bank',
    categoryName: 'Electronics'
  },
  {
    name: 'Active Noise Cancelling Earbuds',
    description: 'True wireless Bluetooth earbuds featuring high-fidelity sound, smart touch control, IPX7 water resistance, and up to 30 hours of playback.',
    price: 79.99,
    stock_quantity: 50,
    image_url: 'https://source.unsplash.com/500x500/?earbuds',
    categoryName: 'Electronics'
  },
  {
    name: 'Full HD Webcam 1080p',
    description: 'High-definition video streaming camera with built-in dual noise-reducing microphones, auto-light correction, and privacy cover.',
    price: 49.50,
    stock_quantity: 45,
    image_url: 'https://source.unsplash.com/500x500/?webcam',
    categoryName: 'Electronics'
  },
  // Fashion
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless style crafted from 100% premium cotton denim. Features a button closure, chest pockets, and a comfortable relaxed fit.',
    price: 65.00,
    stock_quantity: 30,
    image_url: 'https://source.unsplash.com/500x500/?denim-jacket',
    categoryName: 'Fashion'
  },
  {
    name: 'Polarized Sport Sunglasses',
    description: 'Lightweight shatterproof frames with 100% UV400 protection polarized lenses. Ideal for running, cycling, and outdoor adventures.',
    price: 29.99,
    stock_quantity: 60,
    image_url: 'https://source.unsplash.com/500x500/?sunglasses',
    categoryName: 'Fashion'
  },
  {
    name: 'Water-Resistant Travel Backpack',
    description: 'Durable nylon backpack with a padded 15.6-inch laptop compartment, anti-theft design, and comfortable breathable mesh shoulder straps.',
    price: 45.99,
    stock_quantity: 40,
    image_url: 'https://source.unsplash.com/500x500/?backpack',
    categoryName: 'Fashion'
  },
  {
    name: 'Minimalist Leather Wallet',
    description: 'Slim bi-fold wallet made of genuine full-grain leather. Features RFID-blocking technology and space for up to 8 cards plus cash.',
    price: 24.99,
    stock_quantity: 75,
    image_url: 'https://source.unsplash.com/500x500/?wallet',
    categoryName: 'Fashion'
  },
  // Home & Living
  {
    name: 'Pour-Over Coffee Maker Set',
    description: 'Premium glass carafe with a reusable double-layer stainless steel mesh filter for brewing clean, rich coffee at home.',
    price: 32.50,
    stock_quantity: 25,
    image_url: 'https://source.unsplash.com/500x500/?coffee-maker',
    categoryName: 'Home & Living'
  },
  {
    name: 'Aromatic Soy Candle Set',
    description: 'Set of four hand-poured natural soy wax candles scented with Lavender, Vanilla, Jasmine, and Eucalyptus essential oils.',
    price: 19.99,
    stock_quantity: 110,
    image_url: 'https://source.unsplash.com/500x500/?candles',
    categoryName: 'Home & Living'
  },
  {
    name: 'Bamboo Plant Stand',
    description: 'Modern multi-tier display rack crafted from eco-friendly sustainable bamboo. Sturdy structure suitable for indoor and outdoor plants.',
    price: 38.00,
    stock_quantity: 20,
    image_url: 'https://source.unsplash.com/500x500/?plant-stand',
    categoryName: 'Home & Living'
  },
  {
    name: 'Memory Foam Pillow',
    description: 'Contour memory foam pillow designed for neck and shoulder support, featuring a breathable cooling cover.',
    price: 42.99,
    stock_quantity: 35,
    image_url: 'https://source.unsplash.com/500x500/?pillow',
    categoryName: 'Home & Living'
  },
  // Sports & Outdoors
  {
    name: 'Non-Slip Eco Yoga Mat',
    description: 'Extra thick high-density TPE yoga mat with dual-sided non-slip textures. Lightweight, alignment lines, and carrying strap included.',
    price: 27.99,
    stock_quantity: 50,
    image_url: 'https://source.unsplash.com/500x500/?yoga-mat',
    categoryName: 'Sports & Outdoors'
  },
  {
    name: '3-Person Waterproof Tent',
    description: 'Double-layer camping tent with a seam-taped rainfly, instant setup system, and mesh windows for optimal ventilation.',
    price: 89.99,
    stock_quantity: 15,
    image_url: 'https://source.unsplash.com/500x500/?tent',
    categoryName: 'Sports & Outdoors'
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Durable cast iron dumbbell set with spinlock collars and weight plates ranging from 5lbs to 40lbs, complete with a carrying case.',
    price: 69.99,
    stock_quantity: 18,
    image_url: 'https://source.unsplash.com/500x500/?dumbbell',
    categoryName: 'Sports & Outdoors'
  }
];

async function seed() {
  try {
    // Fetch categories to map category names to their database IDs dynamically
    const [categories] = await db.query('SELECT id, name FROM categories');
    
    if (categories.length === 0) {
      console.error('No categories found in the database. Please run the main database seeder first.');
      process.exit(1);
    }
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    console.log('Category mapping loaded:', categoryMap);
    
    let insertedCount = 0;
    
    for (const prod of additionalProducts) {
      const categoryId = categoryMap[prod.categoryName];
      if (!categoryId) {
        console.warn(`Category "${prod.categoryName}" not found. Skipping product: ${prod.name}`);
        continue;
      }
      
      await db.query(
        'INSERT INTO products (name, description, price, stock_quantity, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)',
        [prod.name, prod.description, prod.price, prod.stock_quantity, prod.image_url, categoryId]
      );
      insertedCount++;
    }
    
    console.log(`Success: Successfully added ${insertedCount} new products to the database.`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    // Close the connection pool
    await db.end();
    console.log('Database pool connection closed.');
  }
}

seed();
