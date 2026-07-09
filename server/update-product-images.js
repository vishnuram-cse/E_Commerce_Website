/**
 * update-product-images.js
 *
 * Assigns a unique, specific, real Unsplash image URL to every product in the
 * database (including duplicate-name products which each get a different photo).
 * Validates every URL with a HEAD request before applying it, and falls back to
 * an alternate photo if a URL returns 404.
 */

const db = require('./config/db');

// ---------------------------------------------------------------------------
// Per-product-ID image map  (product DB id → Unsplash photo id)
// Duplicated product names (IDs 22-36 mirror names of IDs 7-21) deliberately
// receive different photo IDs so every row has a unique image.
// All photo IDs were verified 200 OK before inclusion; extras are kept as
// category-level fallbacks inside the fallback bank below.
// ---------------------------------------------------------------------------
const PER_ID_MAP = {
  // ── Original seeder products ─────────────────────────────────────────────
  1:  '1505740420928-5e560c06d30e', // Quantum Wireless Headphones   – over-ear headphones
  2:  '1523275335684-37898b6baf30', // Vanguard Chronograph Watch    – luxury watch flat-lay
  3:  '1542291026-7eec264c27ff',   // AeroStride Running Shoes      – red Nike running shoe
  4:  '1602143407151-7111542de6e8', // Sleek Thermal Flask           – insulated flask
  5:  '1592078615290-033ee584e267', // Ergonomic Desk Chair          – mesh office chair
  6:  '1507473885765-e6ed057f782c', // Smart Ambient Desk Lamp       – glowing desk lamp

  // ── seed-products batch (first instance) ─────────────────────────────────
  7:  '1587829741301-dc798b83add3', // Pro Mechanical Keyboard       – RGB mech keyboard
  8:  '1609081219090-a6d81d3085bf', // Ultra Slim Power Bank         – slim power bank charging phone
  9:  '1590658268037-6bf12165a8df', // Active Noise Cancelling Earbuds – TWS earbuds in case
  10: '1615526675159-e248c3021d3f', // Full HD Webcam 1080p          – webcam on monitor
  11: '1576995853123-5a10305d93c0', // Classic Denim Jacket          – folded denim jacket
  12: '1572635196237-14b3f281503f', // Polarized Sport Sunglasses    – aviator sunglasses product shot
  13: '1553062407-98eeb64c6a62',   // Water-Resistant Travel Backpack – leather/nylon backpack
  14: '1512393144765-a04c69cf4f86', // Minimalist Leather Wallet     – slim bifold wallet
  15: '1514432324607-a09d9b4aefdd', // Pour-Over Coffee Maker Set    – pour-over glass coffee maker
  16: '1603006905003-be475563bc59', // Aromatic Soy Candle Set       – lit candles in jars
  17: '1501004318641-b39e6451bec6', // Bamboo Plant Stand            – indoor plant on stand
  18: '1499209974431-9dddcece7f88', // Memory Foam Pillow            – white fluffy pillow
  19: '1599447421416-3414500d18a5', // Non-Slip Eco Yoga Mat         – rolled yoga mat
  20: '1504280390367-361c6d9f38f4', // 3-Person Waterproof Tent      – tent in mountains
  21: '1517838277536-f5f99be501cd', // Adjustable Dumbbell Set       – dumbbells on rack

  // ── seed-products batch (second instance – all unique photos) ────────────
  22: '1461749280684-dccba630e2f6', // Pro Mechanical Keyboard #2    – coding keyboard desk setup
  23: '1583394838336-acd977736f90', // Ultra Slim Power Bank #2      – cables + power bank flat-lay
  24: '1606220838315-056192d5e927', // Active Noise Cancelling Earbuds #2 – earbuds on desk lifestyle
  25: '1623949556303-b0d17d198863', // Full HD Webcam 1080p #2       – small security/webcam
  26: '1591047139829-d91aecb6caea', // Classic Denim Jacket #2       – woman in denim jacket street style
  27: '1582552938357-32b906df40cb', // Polarized Sport Sunglasses #2 – sunglasses on sand
  28: '1533062618053-d51e617307ec', // Water-Resistant Travel Backpack #2 – travel backpack on ground
  29: '1593440498218-7e0b9037cd2d', // Minimalist Leather Wallet #2  – open leather wallet cards
  30: '1495474472287-4d71bcdd2085', // Pour-Over Coffee Maker Set #2 – espresso drip brew setup
  31: '1602028915047-37269d1a73f7', // Aromatic Soy Candle Set #2    – single candle warm glow
  32: '1416879595882-3373a0480b5b', // Bamboo Plant Stand #2         – potted plants shelf
  33: '1578541672279-414d32cd7a2e', // Memory Foam Pillow #2         – bed pillow arrangement
  34: '1544367567-0f2fcb009e0b',   // Non-Slip Eco Yoga Mat #2      – yoga mat workout lifestyle
  35: '1506126613408-eca07ce68773', // 3-Person Waterproof Tent #2   – camping tent at sunrise
  36: '1534438327276-14e5300c3a48', // Adjustable Dumbbell Set #2    – gym weights rack
};

// Fallback photo IDs per product type (tried in order if primary fails)
const FALLBACKS = {
  headphones:  ['1484704849700-f032ad7dac32', '1505740420928-5e560c06d30e'],
  keyboard:    ['1587829741301-dc798b83add3', '1461749280684-dccba630e2f6', '1496181133206-80ce9b88a853', '1587825140708-dfaf72ae4b04'],
  powerbank:   ['1609081219090-a6d81d3085bf', '1583394838336-acd977736f90'],
  earbuds:     ['1590658268037-6bf12165a8df', '1606220838315-056192d5e927', '1588508065123-287b28e013da', '1574227492706-f65b24c3688a'],
  webcam:      ['1615526675159-e248c3021d3f', '1623949556303-b0d17d198863'],
  jacket:      ['1576995853123-5a10305d93c0', '1591047139829-d91aecb6caea'],
  sunglasses:  ['1572635196237-14b3f281503f', '1582552938357-32b906df40cb'],
  backpack:    ['1553062407-98eeb64c6a62',   '1533062618053-d51e617307ec', '1519389950473-47ba0277781c'],
  wallet:      ['1512393144765-a04c69cf4f86', '1593440498218-7e0b9037cd2d'],
  watch:       ['1523275335684-37898b6baf30', '1539874754761-3781c7f0b1e0'],
  shoes:       ['1542291026-7eec264c27ff',   '1491553895911-0055eca6402d'],
  coffee:      ['1514432324607-a09d9b4aefdd', '1495474472287-4d71bcdd2085'],
  candles:     ['1603006905003-be475563bc59', '1602028915047-37269d1a73f7'],
  plant:       ['1501004318641-b39e6451bec6', '1416879595882-3373a0480b5b'],
  pillow:      ['1499209974431-9dddcece7f88', '1578541672279-414d32cd7a2e'],
  chair:       ['1592078615290-033ee584e267', '1555041469-db61528b393a'],
  lamp:        ['1507473885765-e6ed057f782c', '1534438327276-14e5300c3a48'],
  yogamat:     ['1599447421416-3414500d18a5', '1544367567-0f2fcb009e0b'],
  tent:        ['1504280390367-361c6d9f38f4', '1506126613408-eca07ce68773'],
  dumbbell:    ['1517838277536-f5f99be501cd', '1534438327276-14e5300c3a48'],
  flask:       ['1602143407151-7111542de6e8', '1523362628-f0c0a1e5c985'],
  generic:     ['1531403009284-440f080d1e12', '1560472354-b33ff0ad4a3d'],
};

function categoryFallbackKey(name, cat) {
  const n = (name || '').toLowerCase();
  const c = (cat  || '').toLowerCase();
  if (n.includes('headphone'))                           return 'headphones';
  if (n.includes('keyboard'))                            return 'keyboard';
  if (n.includes('power bank') || n.includes('charger')) return 'powerbank';
  if (n.includes('earbud'))                              return 'earbuds';
  if (n.includes('webcam') || n.includes('camera'))      return 'webcam';
  if (n.includes('jacket') || n.includes('coat'))        return 'jacket';
  if (n.includes('sunglasses') || n.includes('glasses')) return 'sunglasses';
  if (n.includes('backpack') || n.includes('bag'))       return 'backpack';
  if (n.includes('wallet') || n.includes('purse'))       return 'wallet';
  if (n.includes('watch'))                               return 'watch';
  if (n.includes('shoe') || n.includes('sneaker'))       return 'shoes';
  if (n.includes('coffee') || n.includes('maker'))       return 'coffee';
  if (n.includes('candle'))                              return 'candles';
  if (n.includes('plant') || n.includes('stand'))        return 'plant';
  if (n.includes('pillow'))                              return 'pillow';
  if (n.includes('chair'))                               return 'chair';
  if (n.includes('lamp') || n.includes('light'))         return 'lamp';
  if (n.includes('yoga') || n.includes('mat'))           return 'yogamat';
  if (n.includes('tent'))                                return 'tent';
  if (n.includes('dumbbell') || n.includes('weight'))    return 'dumbbell';
  if (n.includes('flask') || n.includes('bottle'))       return 'flask';
  if (c.includes('electronics'))                         return 'headphones';
  if (c.includes('fashion') || c.includes('apparel'))    return 'shoes';
  if (c.includes('home') || c.includes('living'))        return 'lamp';
  if (c.includes('sport') || c.includes('outdoor'))      return 'flask';
  return 'generic';
}

async function validateUrl(photoId) {
  const url = `https://images.unsplash.com/photo-${photoId}?w=500&h=500&fit=crop`;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function resolveImageUrl(productId, productName, categoryName, usedUrls) {
  // 1. Try the per-ID assignment first
  const primaryId = PER_ID_MAP[productId];
  if (primaryId) {
    const primaryUrl = `https://images.unsplash.com/photo-${primaryId}?w=500&h=500&fit=crop`;
    if (!usedUrls.has(primaryUrl) && await validateUrl(primaryId)) {
      return { url: primaryUrl, validated: true };
    }
    console.warn(`  ⚠ Primary photo for ID ${productId} ("${productName}") failed – trying fallbacks...`);
  }

  // 2. Walk through category fallbacks
  const key = categoryFallbackKey(productName, categoryName);
  const pool = FALLBACKS[key] || FALLBACKS.generic;
  for (const fbId of pool) {
    const fbUrl = `https://images.unsplash.com/photo-${fbId}?w=500&h=500&fit=crop`;
    if (!usedUrls.has(fbUrl) && await validateUrl(fbId)) {
      console.warn(`  ↳ Using fallback photo ${fbId} for "${productName}" (ID ${productId})`);
      return { url: fbUrl, validated: true };
    }
  }

  // 3. Nothing worked – use a safe generic placeholder that is always 200
  const safeId = '1531403009284-440f080d1e12';
  const safeUrl = `https://images.unsplash.com/photo-${safeId}?w=500&h=500&fit=crop`;
  console.error(`  ✖ All fallbacks exhausted for "${productName}" (ID ${productId}) – using generic.`);
  return { url: safeUrl, validated: false };
}

async function updateProductImages() {
  const failed = [];
  let updatedCount = 0;

  try {
    // ── 1. Fetch all products ──────────────────────────────────────────────
    const [products] = await db.query(
      `SELECT p.id, p.name, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.id`
    );

    console.log(`\nFound ${products.length} products in the database:\n`);
    products.forEach(p => console.log(`  [${p.id}] ${p.name} (${p.category_name || 'no category'})`));
    console.log('');

    // ── 2. Assign & validate unique URLs ──────────────────────────────────
    const usedUrls = new Set();

    for (const prod of products) {
      console.log(`Processing [${prod.id}] "${prod.name}" ...`);

      const { url, validated } = await resolveImageUrl(
        prod.id, prod.name, prod.category_name, usedUrls
      );

      usedUrls.add(url);

      // ── 3. Apply to database ───────────────────────────────────────────
      const [result] = await db.query(
        'UPDATE products SET image_url = ? WHERE id = ?',
        [url, prod.id]
      );

      updatedCount += result.affectedRows;

      if (!validated) {
        failed.push({ id: prod.id, name: prod.name, url });
      }

      console.log(`  ✓ ${url}`);
    }

    // ── 4. Summary ────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`✅  Successfully updated ${updatedCount} / ${products.length} rows.`);

    if (failed.length > 0) {
      console.warn(`\n⚠  ${failed.length} product(s) fell back to a generic image (all fallbacks failed):`);
      failed.forEach(f => console.warn(`   [${f.id}] "${f.name}"  →  ${f.url}`));
    } else {
      console.log('🎉  All products received a validated, unique Unsplash photo.');
    }

  } catch (error) {
    console.error('Fatal error during update:', error);
  } finally {
    await db.end();
    console.log('\nDatabase pool connection closed.');
  }
}

updateProductImages();
