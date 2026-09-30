const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public: Get all active categories with service count
router.get('/', async (req, res) => {
  try {
    const categories = await query(`
      SELECT c.*, COUNT(s.id) as service_count
      FROM categories c
      LEFT JOIN services s ON c.id = s.category_id AND s.status = 'ACTIVE'
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// Admin: Create Category
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, description, icon, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const defaultImg = image || `https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80`;
    const result = await run(
      'INSERT INTO categories (name, description, icon, image, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), description || '', icon || 'Wrench', defaultImg, 'ACTIVE']
    );

    const category = await get('SELECT * FROM categories WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
});

// Admin: Update Category
router.put('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, description, icon, image, status } = req.body;
    await run(
      `UPDATE categories SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        image = COALESCE(?, image),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [name, description, icon, image, status, req.params.id]
    );

    const category = await get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
});

// Admin: Delete/Deactivate Category
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const servicesCount = await get('SELECT COUNT(*) as count FROM services WHERE category_id = ?', [req.params.id]);
    if (servicesCount.count > 0) {
      // Soft deactivate instead of hard delete to preserve referential integrity
      await run("UPDATE categories SET status = 'INACTIVE' WHERE id = ?", [req.params.id]);
      return res.json({ success: true, message: 'Category deactivated as it has associated services.' });
    }

    await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
});

module.exports = router;
