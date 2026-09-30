const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken, requireRole, requireApprovedMerchant } = require('../middleware/auth');
const { resolveCategoryId } = require('../utils/categoryResolver');

// Public: Service Discovery with keyword, category, price range, area/location, rating filter & sorting
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category_id,
      category_name,
      min_price,
      max_price,
      city,
      min_rating,
      sort_by = 'recommended'
    } = req.query;

    let sql = `
      SELECT 
        s.*, 
        c.name as category_name,
        c.icon as category_icon,
        m.business_name,
        m.city,
        m.state,
        m.address,
        m.rating as merchant_rating,
        m.review_count as merchant_review_count,
        m.logo as merchant_logo,
        m.status as merchant_status
      FROM services s
      INNER JOIN merchant_profiles m ON s.merchant_id = m.id
      INNER JOIN categories c ON s.category_id = c.id
      WHERE s.status = 'ACTIVE' AND m.status = 'APPROVED'
    `;
    const params = [];

    // Keyword search
    if (search && search.trim() !== '') {
      const keyword = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(s.name) LIKE ? OR LOWER(s.description) LIKE ? OR LOWER(m.business_name) LIKE ? OR LOWER(c.name) LIKE ?)`;
      params.push(keyword, keyword, keyword, keyword);
    }

    // Category filter by ID
    if (category_id && category_id !== 'all') {
      sql += ` AND s.category_id = ?`;
      params.push(category_id);
    }

    // Category filter by Name
    if (category_name && category_name !== 'all') {
      sql += ` AND LOWER(c.name) = ?`;
      params.push(category_name.toLowerCase());
    }

    // Price range filters
    if (min_price && !isNaN(parseFloat(min_price))) {
      sql += ` AND s.price >= ?`;
      params.push(parseFloat(min_price));
    }
    if (max_price && !isNaN(parseFloat(max_price))) {
      sql += ` AND s.price <= ?`;
      params.push(parseFloat(max_price));
    }

    // Location / Area filter
    if (city && city.trim() !== '') {
      const loc = `%${city.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(m.city) LIKE ? OR LOWER(m.address) LIKE ? OR LOWER(m.state) LIKE ?)`;
      params.push(loc, loc, loc);
    }

    // Minimum rating filter
    if (min_rating && !isNaN(parseFloat(min_rating))) {
      sql += ` AND m.rating >= ?`;
      params.push(parseFloat(min_rating));
    }

    // Sorting
    if (sort_by === 'price_asc') {
      sql += ` ORDER BY s.price ASC`;
    } else if (sort_by === 'price_desc') {
      sql += ` ORDER BY s.price DESC`;
    } else if (sort_by === 'rating_desc') {
      sql += ` ORDER BY m.rating DESC, m.review_count DESC`;
    } else {
      // Default: Recommended
      sql += ` ORDER BY m.rating DESC, s.created_at DESC`;
    }

    const services = await query(sql, params);
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// Public: Get Service details by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await get(`
      SELECT 
        s.*, 
        c.name as category_name,
        m.business_name,
        m.city,
        m.address,
        m.phone as merchant_phone,
        m.rating as merchant_rating,
        m.review_count as merchant_review_count,
        m.logo as merchant_logo,
        m.cover_image as merchant_cover
      FROM services s
      INNER JOIN merchant_profiles m ON s.merchant_id = m.id
      INNER JOIN categories c ON s.category_id = c.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch service detail.' });
  }
});

// Merchant: Get own services
router.get('/my/services', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant profile not found.' });

    const services = await query(`
      SELECT s.*, c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.merchant_id = ?
      ORDER BY s.created_at DESC
    `, [merchant.id]);

    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch services.' });
  }
});

// Merchant: Create Service (Multi-tenant isolated)
router.post('/', authenticateToken, requireRole('MERCHANT'), requireApprovedMerchant, async (req, res) => {
  try {
    const { name, categoryId, customCategory, description, price, durationMinutes, image, status } = req.body;

    if (!name || !categoryId || !price) {
      return res.status(400).json({ success: false, message: 'Service name, category, and price are required.' });
    }

    const finalCategoryId = await resolveCategoryId(categoryId, customCategory);
    const defaultImg = image || `https://picsum.photos/seed/service-${Date.now()}/600/400`;

    const result = await run(`
      INSERT INTO services (merchant_id, category_id, name, description, price, duration_minutes, image, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.merchant.id,
      finalCategoryId,
      name.trim(),
      description || '',
      parseFloat(price),
      parseInt(durationMinutes) || 60,
      defaultImg,
      status || 'ACTIVE'
    ]);

    const service = await get('SELECT * FROM services WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, message: 'Service created successfully.', service });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// Merchant: Update Service (Multi-tenant check)
router.put('/:id', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const service = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    // Ownership Check
    const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant || service.merchant_id !== merchant.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this service.' });
    }

    const { name, categoryId, customCategory, description, price, durationMinutes, image, status } = req.body;
    let finalCategoryId = categoryId;
    if (categoryId || customCategory) {
      finalCategoryId = await resolveCategoryId(categoryId, customCategory);
    }

    await run(`
      UPDATE services SET
        name = COALESCE(?, name),
        category_id = COALESCE(?, category_id),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        duration_minutes = COALESCE(?, duration_minutes),
        image = COALESCE(?, image),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [name, finalCategoryId, description, price, durationMinutes, image, status, req.params.id]);

    const updated = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Service updated successfully.', service: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// Merchant: Delete Service (Multi-tenant check)
router.delete('/:id', authenticateToken, requireRole('MERCHANT'), async (req, res) => {
  try {
    const service = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });

    const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    if (!merchant || service.merchant_id !== merchant.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this service.' });
    }

    await run('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

module.exports = router;
