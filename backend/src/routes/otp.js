const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { sendOTPEmail } = require('../utils/emailService');

/**
 * Generate a random 6-digit OTP code
 */
const generate6DigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Public: Dispatch OTP code (EMAIL, PHONE, GOV_KYC, BANK)
router.post('/send', async (req, res) => {
  try {
    const { type, target, name } = req.body; // type: EMAIL | PHONE | GOV_KYC | BANK
    const validTypes = ['EMAIL', 'PHONE', 'GOV_KYC', 'BANK'];

    if (!type || !validTypes.includes(type) || !target) {
      return res.status(400).json({ success: false, message: 'Valid OTP type and target value are required.' });
    }

    const cleanTarget = target.toString().trim();
    const code = generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Clear previous unverified OTPs for target
    await run('DELETE FROM otps WHERE target_type = ? AND target_value = ? AND is_verified = 0', [type, cleanTarget]);

    // Save OTP to DB
    await run(
      'INSERT INTO otps (target_type, target_value, code, expires_at) VALUES (?, ?, ?, ?)',
      [type, cleanTarget, code, expiresAt]
    );

    // Dispatch OTP based on channel
    if (type === 'EMAIL') {
      sendOTPEmail({
        email: cleanTarget,
        name: name || 'Valued User',
        otpCode: code,
        targetType: 'Email Account Verification'
      }).catch(console.error);
    } else {
      console.log(`[SMS/Portal OTP Simulation] Type: ${type} | Target: ${cleanTarget} | Code: ${code}`);
    }

    res.json({
      success: true,
      message: `${type} verification OTP sent to ${cleanTarget}.`,
      otpCode: code, // Shared in response for quick evaluation sandbox
      expiresAt
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});

// Public: Verify 6-digit OTP code
router.post('/verify', async (req, res) => {
  try {
    const { type, target, code } = req.body;

    if (!type || !target || !code) {
      return res.status(400).json({ success: false, message: 'OTP type, target, and 6-digit code are required.' });
    }

    const cleanTarget = target.toString().trim();
    const cleanCode = code.toString().trim();

    const record = await get(
      `SELECT * FROM otps 
       WHERE target_type = ? AND target_value = ? AND code = ? AND is_verified = 0 
       ORDER BY created_at DESC LIMIT 1`,
      [type, cleanTarget, cleanCode]
    );

    if (!record) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid OTP code. Please check and try again.'
      });
    }

    // Check expiration
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'OTP code has expired. Please request a new code.'
      });
    }

    // Mark as verified
    await run('UPDATE otps SET is_verified = 1 WHERE id = ?', [record.id]);

    res.json({
      success: true,
      verified: true,
      message: `${type} verification successful!`
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
});

module.exports = router;
