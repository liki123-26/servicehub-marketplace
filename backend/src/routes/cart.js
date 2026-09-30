const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get Customer Cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    let cart = await get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
    if (!cart) {
      const result = await run('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
      cart = { id: result.id, user_id: req.user.id, merchant_id: null };
    }

    let items = [];
    let merchant = null;

    if (cart.merchant_id) {
      merchant = await get('SELECT * FROM merchant_profiles WHERE id = ?', [cart.merchant_id]);
      items = await query(`
        SELECT ci.*, s.name as service_name, s.duration_minutes, s.image as service_image
        FROM cart_items ci
        JOIN services s ON ci.service_id = s.id
        WHERE ci.cart_id = ?
      `, [cart.id]);
    }

    const subtotal = items.reduce((acc, item) => acc + item.price, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const platformFee = items.length > 0 ? 0 : 0;
    const total = subtotal + tax + platformFee;

    res.json({
      success: true,
      cart: {
        id: cart.id,
        merchant,
        items,
        subtotal,
        tax,
        platformFee,
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
});

// Add Item to Cart (Guards single merchant constraint)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { serviceId, bookingDate, bookingTime, forceClear } = req.body;

    if (!serviceId || !bookingDate || !bookingTime) {
      return res.status(400).json({ success: false, message: 'Service ID, date, and time slot are required.' });
    }

    const service = await get('SELECT * FROM services WHERE id = ? AND status = "ACTIVE"', [serviceId]);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service is unavailable or inactive.' });
    }

    let cart = await get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
    if (!cart) {
      const result = await run('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
      cart = { id: result.id, user_id: req.user.id, merchant_id: null };
    }

    // Check Single Merchant Conflict
    if (cart.merchant_id && cart.merchant_id !== service.merchant_id) {
      if (!forceClear) {
        const existingMerchant = await get('SELECT business_name FROM merchant_profiles WHERE id = ?', [cart.merchant_id]);
        return res.status(409).json({
          success: false,
          conflict: true,
          message: `Your cart already contains services from "${existingMerchant?.business_name || 'another provider'}". Would you like to clear your cart and add this service instead?`,
          existingMerchantName: existingMerchant?.business_name
        });
      }

      // If user confirms clearing existing cart:
      await run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
      await run('UPDATE carts SET merchant_id = ? WHERE id = ?', [service.merchant_id, cart.id]);
      cart.merchant_id = service.merchant_id;
    } else if (!cart.merchant_id) {
      await run('UPDATE carts SET merchant_id = ? WHERE id = ?', [service.merchant_id, cart.id]);
      cart.merchant_id = service.merchant_id;
    }

    // Replace or add item
    await run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]); // Single active service booking per checkout in MVP
    await run(`
      INSERT INTO cart_items (cart_id, service_id, booking_date, booking_time, price)
      VALUES (?, ?, ?, ?, ?)
    `, [cart.id, service.id, bookingDate, bookingTime, service.price]);

    res.json({ success: true, message: 'Service added to cart.' });
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
  }
});

// Delete item from cart
router.delete('/item/:id', authenticateToken, async (req, res) => {
  try {
    const cart = await get('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (cart) {
      await run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [req.params.id, cart.id]);
      const remaining = await get('SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?', [cart.id]);
      if (remaining.count === 0) {
        await run('UPDATE carts SET merchant_id = NULL WHERE id = ?', [cart.id]);
      }
    }
    res.json({ success: true, message: 'Item removed from cart.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove item.' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const cart = await get('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (cart) {
      await run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
      await run('UPDATE carts SET merchant_id = NULL WHERE id = ?', [cart.id]);
    }
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear cart.' });
  }
});

module.exports = router;
