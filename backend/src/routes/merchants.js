const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { resolveCategoryId } = require('../utils/categoryResolver');

// Public: Get all approved merchants with filters
router.get('/', async (req, res) => {
  try {
    const { category_id, city, search, rating } = req.query;

    let sql = `
      SELECT m.*, c.name as category_name, u.email as owner_email
      FROM merchant_profiles m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.status = 'APPROVED'
    `;
    const params = [];

    if (category_id) {
      sql += ` AND m.category_id = ?`;
      params.push(category_id);
    }
    if (city) {
      sql += ` AND (LOWER(m.city) LIKE ? OR LOWER(m.address) LIKE ?)`;
      params.push(`%${city.toLowerCase()}%`, `%${city.toLowerCase()}%`);
    }
    if (search) {
      sql += ` AND (LOWER(m.business_name) LIKE ? OR LOWER(m.description) LIKE ?)`;
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }
    if (rating) {
      sql += ` AND m.rating >= ?`;
      params.push(parseFloat(rating));
    }

    sql += ` ORDER BY m.rating DESC, m.review_count DESC`;

    const merchants = await query(sql, params);
    res.json({ success: true, count: merchants.length, merchants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch merchants.' });
  }
});

// Public: Get merchant storefront details by ID
router.get('/:id', async (req, res) => {
  try {
    const merchant = await get(`
      SELECT m.*, c.name as category_name, u.email as owner_email, u.name as owner_name
      FROM merchant_profiles m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [req.params.id]);

    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant storefront not found.' });
    }

    const services = await query(`
      SELECT s.*, c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.merchant_id = ? AND s.status = 'ACTIVE'
      ORDER BY s.price ASC
    `, [req.params.id]);

    const availability = await query(`
      SELECT * FROM availability WHERE merchant_id = ? ORDER BY day_of_week ASC
    `, [req.params.id]);

    const reviews = await query(`
      SELECT r.*, u.name as customer_name, s.name as service_name
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      WHERE r.merchant_id = ?
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [req.params.id]);

    res.json({
      success: true,
      merchant,
      services,
      availability,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch merchant details.' });
  }
});

// Merchant: Get & Update own business profile
router.get('/my/profile', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const merchant = await get('SELECT * FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant profile not found.' });
    }
    res.json({ success: true, merchant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch business profile.' });
  }
});

router.put('/my/profile', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const { businessName, categoryId, customCategory, description, phone, address, city, state, pincode, logo, coverImage } = req.body;

    const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant) {
      return res.status(404).json({ success: false, message: 'Merchant profile not found.' });
    }

    let finalCategoryId = categoryId;
    if (categoryId || customCategory) {
      finalCategoryId = await resolveCategoryId(categoryId, customCategory);
    }

    await run(`
      UPDATE merchant_profiles SET
        business_name = COALESCE(?, business_name),
        category_id = COALESCE(?, category_id),
        description = COALESCE(?, description),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        logo = COALESCE(?, logo),
        cover_image = COALESCE(?, cover_image)
      WHERE id = ?
    `, [businessName, finalCategoryId, description, phone, address, city, state, pincode, logo, coverImage, merchant.id]);

    const updated = await get('SELECT * FROM merchant_profiles WHERE id = ?', [merchant.id]);
    res.json({ success: true, message: 'Business profile updated successfully.', merchant: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update business profile.' });
  }
});

// Merchant: Get & Update Availability Schedule
router.get('/my/availability', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant profile not found.' });

    const availability = await query('SELECT * FROM availability WHERE merchant_id = ? ORDER BY day_of_week ASC', [merchant.id]);
    res.json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch availability schedule.' });
  }
});

router.put('/my/availability', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const { schedule } = req.body; // Array of { day_of_week, is_open, open_time, close_time }
    const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant profile not found.' });

    if (Array.isArray(schedule)) {
      for (const item of schedule) {
        await run(`
          UPDATE availability SET
            is_open = ?,
            open_time = ?,
            close_time = ?
          WHERE merchant_id = ? AND day_of_week = ?
        `, [item.is_open ? 1 : 0, item.open_time, item.close_time, merchant.id, item.day_of_week]);
      }
    }

    const updated = await query('SELECT * FROM availability WHERE merchant_id = ? ORDER BY day_of_week ASC', [merchant.id]);
    res.json({ success: true, message: 'Working hours updated successfully.', availability: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update availability schedule.' });
  }
});

module.exports = router;
