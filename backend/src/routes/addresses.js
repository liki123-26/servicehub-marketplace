const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get Customer Addresses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const addresses = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.user.id]);
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
});

// Add Address
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, phone, addressLine, city, state, pincode, isDefault } = req.body;

    if (!name || !phone || !addressLine || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All address fields are required.' });
    }

    if (isDefault) {
      await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    const count = await get('SELECT COUNT(*) as cnt FROM addresses WHERE user_id = ?', [req.user.id]);
    const makeDefault = isDefault || count.cnt === 0 ? 1 : 0;

    const result = await run(`
      INSERT INTO addresses (user_id, name, phone, address_line, city, state, pincode, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.user.id, name.trim(), phone.trim(), addressLine.trim(), city.trim(), state.trim(), pincode.trim(), makeDefault]);

    const address = await get('SELECT * FROM addresses WHERE id = ?', [result.id]);
    res.status(201).json({ success: true, message: 'Address saved successfully.', address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

// Update Address
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, phone, addressLine, city, state, pincode, isDefault } = req.body;

    const existing = await get('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Address not found.' });

    if (isDefault) {
      await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }

    await run(`
      UPDATE addresses SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        address_line = COALESCE(?, address_line),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        is_default = COALESCE(?, is_default)
      WHERE id = ?
    `, [name, phone, addressLine, city, state, pincode, isDefault ? 1 : 0, req.params.id]);

    const updated = await get('SELECT * FROM addresses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Address updated.', address: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

// Set Address as Default
router.put('/:id/default', authenticateToken, async (req, res) => {
  try {
    const existing = await get('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Address not found.' });

    await run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    await run('UPDATE addresses SET is_default = 1 WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Address set as default.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to set default address.' });
  }
});

// Delete Address
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const addr = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });

    await run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    // If deleted address was default, promote another address to default
    if (addr.is_default) {
      const nextAddr = await get('SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
      if (nextAddr) {
        await run('UPDATE addresses SET is_default = 1 WHERE id = ?', [nextAddr.id]);
      }
    }

    res.json({ success: true, message: 'Address deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

module.exports = router;
