const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Get User Notifications & Unread Count
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await query(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    const unreadCountRow = await get('SELECT COUNT(*) as cnt FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]);

    res.json({
      success: true,
      unreadCount: unreadCountRow?.cnt || 0,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});

module.exports = router;
