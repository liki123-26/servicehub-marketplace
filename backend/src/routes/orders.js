const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper to generate time slots (e.g., 09:00 to 18:00 in 1-hour intervals)
const generateTimeSlots = (openTimeStr, closeTimeStr) => {
  const slots = [];
  let [startHour] = openTimeStr.split(':').map(Number);
  let [endHour] = closeTimeStr.split(':').map(Number);

  for (let hour = startHour; hour < endHour; hour++) {
    const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    const displayStr = `${displayHour < 10 ? '0' + displayHour : displayHour}:00 ${period}`;

    slots.push({
      time: formattedHour,
      label: displayStr
    });
  }
  return slots;
};

// Public/Customer: Fetch available time slots for a given merchant and date
router.get('/slots/available', async (req, res) => {
  try {
    const { merchant_id, date } = req.query; // date format YYYY-MM-DD
    if (!merchant_id || !date) {
      return res.status(400).json({ success: false, message: 'Merchant ID and date are required.' });
    }

    const bookingDateObj = new Date(date);
    const dayOfWeek = bookingDateObj.getDay(); // 0=Sunday, 6=Saturday

    // Fetch merchant day schedule
    const schedule = await get(
      'SELECT * FROM availability WHERE merchant_id = ? AND day_of_week = ?',
      [merchant_id, dayOfWeek]
    );

    if (!schedule || !schedule.is_open) {
      return res.json({
        success: true,
        isOpen: false,
        message: 'Merchant is closed on this day.',
        slots: []
      });
    }

    const allSlots = generateTimeSlots(schedule.open_time || '09:00', schedule.close_time || '18:00');

    // Fetch existing active bookings for this date
    const bookedOrders = await query(`
      SELECT booking_time FROM orders
      WHERE merchant_id = ? AND booking_date = ? AND status NOT IN ('CANCELLED', 'REJECTED')
    `, [merchant_id, date]);

    const bookedTimes = new Set(bookedOrders.map(o => o.booking_time));

    const slots = allSlots.map(slot => ({
      ...slot,
      isAvailable: !bookedTimes.has(slot.time)
    }));

    res.json({
      success: true,
      isOpen: true,
      date,
      slots
    });
  } catch (error) {
    console.error('Fetch slots error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available time slots.' });
  }
});

// Customer/Merchant/Admin: Get Orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    let orders = [];

    if (req.user.role === 'ADMIN') {
      orders = await query(`
        SELECT o.*, s.name as service_name, s.image as service_image, m.business_name, u.name as customer_user_name, u.email as customer_email, r.rating as review_rating
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN merchant_profiles m ON o.merchant_id = m.id
        JOIN users u ON o.customer_id = u.id
        LEFT JOIN reviews r ON o.id = r.order_id
        ORDER BY o.created_at DESC
      `);
    } else if (req.user.role === 'MERCHANT') {
      const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
      if (!merchant) return res.json({ success: true, orders: [] });

      orders = await query(`
        SELECT o.*, s.name as service_name, s.duration_minutes, s.image as service_image, u.name as customer_user_name, u.email as customer_email, r.rating as review_rating
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN users u ON o.customer_id = u.id
        LEFT JOIN reviews r ON o.id = r.order_id
        WHERE o.merchant_id = ?
        ORDER BY o.created_at DESC
      `, [merchant.id]);
    } else {
      // CUSTOMER
      orders = await query(`
        SELECT o.*, s.name as service_name, s.duration_minutes, s.image as service_image, m.business_name, m.logo as merchant_logo, m.phone as merchant_phone, r.rating as review_rating, r.comment as review_comment
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN merchant_profiles m ON o.merchant_id = m.id
        LEFT JOIN reviews r ON o.id = r.order_id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
      `, [req.user.id]);
    }

    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// Get Order Details by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await get(`
      SELECT o.*, s.name as service_name, s.description as service_desc, s.duration_minutes, s.image as service_image,
             m.business_name, m.address as merchant_address, m.city as merchant_city, m.phone as merchant_phone, m.logo as merchant_logo,
             u.name as customer_user_name, u.email as customer_email, u.phone as customer_user_phone,
             r.rating as review_rating, r.comment as review_comment
      FROM orders o
      JOIN services s ON o.service_id = s.id
      JOIN merchant_profiles m ON o.merchant_id = m.id
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN reviews r ON o.id = r.order_id
      WHERE o.id = ?
    `, [req.params.id]);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Authorization check
    if (req.user.role === 'CUSTOMER' && order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
    if (req.user.role === 'MERCHANT') {
      const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
      if (!merchant || order.merchant_id !== merchant.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
});

// Update Order Status (Merchant / Admin / Customer Cancellation)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Permission checks
    if (req.user.role === 'CUSTOMER') {
      if (order.customer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized.' });
      if (status !== 'CANCELLED') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel eligible pending orders.' });
      }
    } else if (req.user.role === 'MERCHANT') {
      const merchant = await get('SELECT id FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
      if (!merchant || order.merchant_id !== merchant.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
    }

    await run('UPDATE orders SET status = ? WHERE id = ?', [status, order.id]);

    // Send notifications
    let notifUserId = order.customer_id;
    let notifTitle = `Order Status Updated`;
    let notifMsg = `Your booking #${order.order_number} status is now ${status}.`;

    if (req.user.role === 'CUSTOMER') {
      const merchantUser = await get('SELECT user_id FROM merchant_profiles WHERE id = ?', [order.merchant_id]);
      if (merchantUser) {
        notifUserId = merchantUser.user_id;
        notifTitle = `Booking Cancelled`;
        notifMsg = `Customer cancelled booking #${order.order_number}.`;
      }
    }

    await run(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [notifUserId, notifTitle, notifMsg, status === 'CANCELLED' ? 'WARNING' : 'INFO']
    );

    const updated = await get('SELECT * FROM orders WHERE id = ?', [order.id]);
    res.json({ success: true, message: `Order status updated to ${status}.`, order: updated });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
});

module.exports = router;
