const db = require('./config/db');

function getSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function updateProductImages() {
  try {
    // Fetch products
    const [products] = await db.query(
      'SELECT id, name, image_url FROM products'
    );

    console.log(`Found ${products.length} products to update.`);
    let updatedCount = 0;

    for (const prod of products) {
      const slug = getSlug(prod.name);
      const newImageUrl = `https://picsum.photos/seed/${slug}/500/500`;

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

