const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { get, run, query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const razorpay = RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

// Initialize Razorpay / Sandbox Payment Order
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { addressId, customerName, customerPhone } = req.body;

    const cart = await get('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
    if (!cart || !cart.merchant_id) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const items = await query(`
      SELECT ci.*, s.name as service_name, s.merchant_id
      FROM cart_items ci
      JOIN services s ON ci.service_id = s.id
      WHERE ci.cart_id = ?
    `, [cart.id]);

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const item = items[0]; // Single service booking per checkout in MVP
    const subtotal = item.price;
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const platformFee = 0;
    const totalAmount = subtotal + tax + platformFee;

    // Fetch address details
    let addressJson = '';
    if (addressId) {
      const addr = await get('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, req.user.id]);
      if (addr) addressJson = JSON.stringify(addr);
    }

    // Generate unique order number (e.g. SH1008)
    const countRow = await get('SELECT COUNT(*) as count FROM orders');
    const orderNumber = `SH${1001 + countRow.count}`;

    // Race condition check: Verify slot is still available
    const existingBooking = await get(`
      SELECT id FROM orders
      WHERE merchant_id = ? AND booking_date = ? AND booking_time = ? AND status NOT IN ('CANCELLED', 'REJECTED')
    `, [cart.merchant_id, item.booking_date, item.booking_time]);

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'Sorry! This date and time slot was just booked by another customer. Please select another slot.'
      });
    }

    // Create database order record in PENDING payment status
    const orderRes = await run(`
      INSERT INTO orders (
        order_number, customer_id, merchant_id, service_id,
        booking_date, booking_time, total_amount, tax_amount, platform_fee,
        status, payment_status, customer_name, customer_phone, address_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?, ?, ?)
    `, [
      orderNumber,
      req.user.id,
      cart.merchant_id,
      item.service_id,
      item.booking_date,
      item.booking_time,
      totalAmount,
      tax,
      platformFee,
      customerName || req.user.name,
      customerPhone || req.user.phone || '',
      addressJson
    ]);

    const orderId = orderRes.id;
    let razorpayOrderId = `rzp_demo_${Date.now()}_${orderId}`;

    if (razorpay) {
      // Real Razorpay integration mode
      const options = {
        amount: Math.round(totalAmount * 100), // Amount in paise
        currency: 'INR',
        receipt: `receipt_${orderNumber}`,
        notes: {
          order_id: orderId,
          order_number: orderNumber
        }
      };
      const rzpOrder = await razorpay.orders.create(options);
      razorpayOrderId = rzpOrder.id;
    }

    res.json({
      success: true,
      mode: razorpay ? 'RAZORPAY_LIVE' : 'SIMULATED_SANDBOX',
      keyId: RAZORPAY_KEY_ID || 'rzp_test_servicehub_demo_key',
      orderId,
      orderNumber,
      razorpayOrderId,
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      totalAmount,
      serviceName: item.service_name,
      bookingDate: item.booking_date,
      bookingTime: item.booking_time
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
});

// Verify Payment & Complete Order Confirmation
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      simulatedSuccess
    } = req.body;

    const order = await get('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [orderId, req.user.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    let isVerified = false;

    if (razorpay && razorpay_signature) {
      // Verify signature via crypto HMAC SHA256
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        isVerified = true;
      }
    } else {
      // Simulated Sandbox Verification (Keyless Mode)
      if (simulatedSuccess !== false) {
        isVerified = true;
      }
    }

    if (!isVerified) {
      await run("UPDATE orders SET payment_status = 'FAILED' WHERE id = ?", [order.id]);
      return res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }

    const payId = razorpay_payment_id || `pay_sim_${Date.now()}`;

    // Update order status to CONFIRMED and payment_status to PAID
    await run(`
      UPDATE orders SET
        status = 'CONFIRMED',
        payment_status = 'PAID'
      WHERE id = ?
    `, [order.id]);

    // Record payment log
    await run(`
      INSERT INTO payments (order_id, razorpay_order_id, razorpay_payment_id, amount, status, payment_method)
      VALUES (?, ?, ?, ?, 'SUCCESS', 'Razorpay')
    `, [order.id, razorpay_order_id || 'sim_order', payId, order.total_amount]);

    // Clear Customer Cart
    const cart = await get('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
    if (cart) {
      await run('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
      await run('UPDATE carts SET merchant_id = NULL WHERE id = ?', [cart.id]);
    }

    // Send notifications to Customer & Merchant
    const merchantUser = await get('SELECT user_id, business_name FROM merchant_profiles WHERE id = ?', [order.merchant_id]);

    // Customer Notification
    await run(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        req.user.id,
        'Booking Confirmed!',
        `Your appointment #${order.order_number} for ${order.booking_date} at ${order.booking_time} has been successfully confirmed.`,
        'SUCCESS'
      ]
    );

    // Merchant Notification
    if (merchantUser) {
      await run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [
          merchantUser.user_id,
          'New Service Booking Received',
          `New confirmed booking #${order.order_number} received for ${order.booking_date} at ${order.booking_time}. Total: ₹${order.total_amount}.`,
          'INFO'
        ]
      );
    }

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      orderId: order.id,
      orderNumber: order.order_number
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment verification.' });
  }
});

module.exports = router;
