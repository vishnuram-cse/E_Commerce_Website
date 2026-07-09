const pool = require('./config/db');
const axios = require('axios');
require('dotenv').config();

async function getImageForProduct(productName) {
    try {
        const query = encodeURIComponent(productName);
        const res = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: { query, per_page: 1, orientation: 'squarish' },
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        if (res.data.results && res.data.results.length > 0) {
            return res.data.results[0].urls.small;
        }
        return null;
    } catch (err) {
        console.error(`Failed to fetch image for "${productName}":`, err.message);
        return null;
    }
}

async function run() {
    try {
        const [products] = await pool.query('SELECT id, name FROM products');
        console.log(`Found ${products.length} products. Fetching real images...`);

        let updated = 0;
        for (const product of products) {
            const imageUrl = await getImageForProduct(product.name);
            if (imageUrl) {
                await pool.query('UPDATE products SET image_url = ? WHERE id = ?', [imageUrl, product.id]);
                console.log(`Updated "${product.name}" -> ${imageUrl}`);
                updated++;
            } else {
                console.log(`Skipped "${product.name}" (no image found)`);
            }
            await new Promise(r => setTimeout(r, 1200));
        }

        console.log(`\nDone. ${updated}/${products.length} products updated with real images.`);
    } catch (err) {
        console.error('Script failed:', err.message);
    } finally {
        await pool.end();
    }
}

run();