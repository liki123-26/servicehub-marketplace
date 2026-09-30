const express = require('express');
const router = express.Router();
const { get, run, query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer: Submit review for completed order
router.post('/', authenticateToken, requireRole('CUSTOMER'), async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Valid order ID and rating (1 to 5) are required.' });
    }

    const order = await get('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [orderId, req.user.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Must be COMPLETED order
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed service bookings.'
      });
    }

    // Check if already reviewed
    const existing = await get('SELECT id FROM reviews WHERE order_id = ?', [orderId]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this order.' });
    }

    await run(`
      INSERT INTO reviews (order_id, customer_id, merchant_id, service_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [order.id, req.user.id, order.merchant_id, order.service_id, parseInt(rating), comment || '']);

    // Re-calculate Merchant Rating & Review Count
    const stats = await get(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews WHERE merchant_id = ?
    `, [order.merchant_id]);

    const newRating = stats.avg_rating ? parseFloat(stats.avg_rating.toFixed(1)) : 5.0;
    const newCount = stats.total_reviews || 0;

    await run(`
      UPDATE merchant_profiles SET
        rating = ?,
        review_count = ?
      WHERE id = ?
    `, [newRating, newCount, order.merchant_id]);

    res.json({
      success: true,
      message: 'Thank you! Your review has been published.',
      newMerchantRating: newRating
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// Get reviews for a merchant or service
router.get('/merchant/:merchantId', async (req, res) => {
  try {
    const reviews = await query(`
      SELECT r.*, u.name as customer_name, s.name as service_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN services s ON r.service_id = s.id
      WHERE r.merchant_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.merchantId]);

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

module.exports = router;
