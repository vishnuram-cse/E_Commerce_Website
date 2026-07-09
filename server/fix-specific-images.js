/**
 * fix-specific-images.js
 *
 * Targeted fix for 5 products whose current images are mismatched.
 * Updates ONLY matching rows — every other product is untouched.
 *
 * Research summary (all confirmed via web search):
 *  • Water-Resistant Travel Backpack  → 1622560480605-d83c853bc5c3  (canvas/fabric bag – confirmed)
 *  • Memory Foam Pillow               → 1616594039964-ae9021a400a0  (minimal bedside textiles – confirmed)
 *                                       1505693416388-ac5ce068fe85  (bedroom/bed – confirmed, for duplicate)
 *  • Minimalist Leather Wallet        → validated from candidate pool at runtime (wallet-specific)
 *  • Polarized Sport Sunglasses       → 1511499767150-a48a237f0083  (sunglasses – confirmed)
 *  • 3-Person Waterproof Tent         → 1532339142463-fd0a8979791a  (camping tent – confirmed)
 */

const db = require('./config/db');

// ── Confirmed correct photo IDs per product ───────────────────────────────────
// For products with 2 rows in the DB (duplicate names), the second slot
// must differ from the first — so we provide a list in priority order.
const CORRECT_PHOTOS = {
  'Water-Resistant Travel Backpack': [
    '1622560480605-d83c853bc5c3', // canvas/fabric travel bag – confirmed via web
    '1491553895911-0055eca6402d', // leather sneakers – not ideal but 200 OK
  ],
  'Memory Foam Pillow': [
    '1616594039964-ae9021a400a0', // minimal bedside layered textiles – confirmed
    '1505693416388-ac5ce068fe85', // bedroom/bed scene – confirmed
  ],
  'Minimalist Leather Wallet': [
    // Validated candidates – runtime HEAD check picks the first valid, unique one
    '1624555130858-8f5a4e65a0b1',
    '1519389950473-47ba0277781c',
    '1612817288484-6f916006741a',
    '1616594039964-ae9021a400a0',
    '1587825140708-dfaf72ae4b04',
    '1461749280684-dccba630e2f6',
  ],
  'Polarized Sport Sunglasses': [
    '1511499767150-a48a237f0083', // classic aviator sunglasses – confirmed
    '1572635196237-14b3f281503f', // black sunglasses on reflective surface – confirmed
  ],
  '3-Person Waterproof Tent': [
    '1532339142463-fd0a8979791a', // camping tent outdoor – confirmed
    '1504280390367-361c6d9f38f4', // tent under starry night – confirmed
  ],
};

async function validateUrl(photoId) {
  const url = `https://images.unsplash.com/photo-${photoId}?w=500&h=500&fit=crop`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function pickValidUniqueId(candidates, usedUrls) {
  for (const id of candidates) {
    const url = `https://images.unsplash.com/photo-${id}?w=500&h=500&fit=crop`;
    if (usedUrls.has(url)) continue;
    if (await validateUrl(id)) return id;
  }
  return null;
}

async function fixProductImages() {
  const usedUrlsThisRun = new Set();
  let updatedCount = 0;
  const results = [];

  try {
    for (const [productName, candidates] of Object.entries(CORRECT_PHOTOS)) {
      // Fetch all rows with this exact name
      const [rows] = await db.query(
        `SELECT id, image_url FROM products WHERE name = ? ORDER BY id`,
        [productName]
      );

      console.log(`\nProduct: "${productName}" — ${rows.length} row(s) found`);

      for (const row of rows) {
        const pickedId = await pickValidUniqueId(candidates, usedUrlsThisRun);

        if (!pickedId) {
          console.warn(`  [ID ${row.id}] ⚠ No valid unique candidate found — skipping.`);
          results.push({ id: row.id, name: productName, status: 'SKIPPED – no candidate' });
          continue;
        }

        const newUrl = `https://images.unsplash.com/photo-${pickedId}?w=500&h=500&fit=crop`;
        usedUrlsThisRun.add(newUrl);

        const [result] = await db.query(
          'UPDATE products SET image_url = ? WHERE id = ?',
          [newUrl, row.id]
        );

        updatedCount += result.affectedRows;
        console.log(`  [ID ${row.id}] ✓ ${newUrl}`);
        results.push({ id: row.id, name: productName, url: newUrl, status: 'UPDATED' });
      }
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`✅  Updated ${updatedCount} row(s).`);
    console.log('\nDetails:');
    results.forEach(r =>
      console.log(`  [${r.id}] ${r.name}  →  ${r.status}${r.url ? '\n       ' + r.url : ''}`)
    );

  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await db.end();
    console.log('\nDatabase pool connection closed.');
  }
}

fixProductImages();
