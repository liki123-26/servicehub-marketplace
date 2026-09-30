const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, query } = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { resolveCategoryId } = require('../utils/categoryResolver');
const { sendRegistrationAckEmail } = require('../utils/emailService');

// Register Customer (Pending Admin Verification & Approval)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, phone || '', 'CUSTOMER', 'PENDING']
    );

    await run('INSERT INTO customer_profiles (user_id) VALUES (?)', [result.id]);
    await run('INSERT INTO carts (user_id) VALUES (?)', [result.id]);

    // Send Registration Acknowledgment Email
    sendRegistrationAckEmail({ email: email.toLowerCase().trim(), name: name.trim(), role: 'CUSTOMER' }).catch(console.error);

    // Admin notification
    const admins = await query("SELECT id FROM users WHERE role = 'ADMIN'");
    for (const admin of admins) {
      await run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [admin.id, 'New Customer Registration', `Customer ${name.trim()} (${email.toLowerCase().trim()}) has registered and is pending approval.`, 'WARNING']
      );
    }

    res.status(201).json({
      success: true,
      pendingApproval: true,
      message: 'Registration submitted successfully! Your customer account is pending admin verification and approval.',
      user: { id: result.id, name, email, phone, role: 'CUSTOMER', status: 'PENDING' }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Register Partner / Merchant Business with Full KYC (PAN, License, IFSC Code)
router.post('/merchant-register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      categoryId,
      customCategory,
      description,
      address,
      city,
      state,
      pincode,
      licenseNumber,
      panNumber,
      bankName,
      accountNumber,
      ifscCode,
      documentUrl
    } = req.body;

    if (!name || !email || !password || !businessName || !licenseNumber || !panNumber || !ifscCode || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, email, password, business name, Trade License/GSTIN, PAN card number, bank account number, and IFSC code are required.'
      });
    }

    const existing = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const finalCategoryId = await resolveCategoryId(categoryId, customCategory);

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await run(
      'INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, phone || '', 'MERCHANT', 'PENDING']
    );

    const defaultLogo = `https://picsum.photos/seed/merchant-${userRes.id}/200/200`;
    const defaultCover = `https://picsum.photos/seed/cover-${userRes.id}/800/400`;

    const merchantRes = await run(
      `INSERT INTO merchant_profiles 
      (user_id, business_name, category_id, description, phone, address, city, state, pincode, license_number, pan_number, bank_name, account_number, ifsc_code, document_url, logo, cover_image, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userRes.id,
        businessName.trim(),
        finalCategoryId || null,
        description || '',
        phone || '',
        address || '',
        city || '',
        state || '',
        pincode || '',
        licenseNumber.trim(),
        panNumber.trim().toUpperCase(),
        bankName ? bankName.trim() : '',
        accountNumber.trim(),
        ifscCode.trim().toUpperCase(),
        documentUrl || '',
        defaultLogo,
        defaultCover,
        'PENDING' // Pending Admin Approval after KYC verification
      ]
    );

    // Initialize 7-day default availability hours (0=Sun to 6=Sat)
    for (let day = 0; day <= 6; day++) {
      const isOpen = day === 0 ? 0 : 1; // Sunday closed by default
      await run(
        'INSERT INTO availability (merchant_id, day_of_week, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
        [merchantRes.id, day, isOpen, '09:00', '18:00']
      );
    }

    // Send Registration Acknowledgment Email
    sendRegistrationAckEmail({ email: email.toLowerCase().trim(), name: name.trim(), role: 'MERCHANT', businessName: businessName.trim() }).catch(console.error);

    // Admin notification
    const admins = await query("SELECT id FROM users WHERE role = 'ADMIN'");
    for (const admin of admins) {
      await run(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [admin.id, 'New Business Partner KYC Verification', `Partner "${businessName}" (PAN: ${panNumber.toUpperCase()}, IFSC: ${ifscCode.toUpperCase()}) has submitted details and is pending admin KYC verification.`, 'WARNING']
      );
    }

    res.status(201).json({
      success: true,
      pendingApproval: true,
      message: 'Business partner registration & KYC submitted successfully! Admin will verify your license, PAN card, and IFSC details before approving.',
      user: { id: userRes.id, name, email, phone, role: 'MERCHANT', status: 'PENDING' },
      merchant: { id: merchantRes.id, businessName, status: 'PENDING' }
    });
  } catch (error) {
    console.error('Merchant register error:', error);
    res.status(500).json({ success: false, message: 'Server error during merchant registration.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.role === 'CUSTOMER' && user.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        pendingApproval: user.status === 'PENDING',
        message: `Account sign-in restricted. Your customer account registration is currently ${user.status}. Admin verification and approval is required.`
      });
    }

    let merchant = null;
    if (user.role === 'MERCHANT') {
      merchant = await get('SELECT * FROM merchant_profiles WHERE user_id = ?', [user.id]);
      if (merchant && merchant.status !== 'APPROVED' && user.status !== 'APPROVED') {
        return res.status(403).json({
          success: false,
          pendingApproval: merchant.status === 'PENDING',
          message: `Partner sign-in restricted. Your business profile for "${merchant.business_name}" (PAN: ${merchant.pan_number || 'N/A'}) is currently ${merchant.status}. Admin KYC verification & approval is required.`
        });
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status },
      merchant
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let merchant = null;
    if (req.user.role === 'MERCHANT') {
      merchant = await get('SELECT * FROM merchant_profiles WHERE user_id = ?', [req.user.id]);
    }
    let customerProfile = null;
    if (req.user.role === 'CUSTOMER') {
      customerProfile = await get('SELECT * FROM customer_profiles WHERE user_id = ?', [req.user.id]);
    }

    res.json({
      success: true,
      user: req.user,
      merchant,
      customerProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user info.' });
  }
});

// Update Personal Profile Details
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, bio, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    if (email && email.toLowerCase().trim() !== req.user.email) {
      const existing = await get('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase().trim(), req.user.id]);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another account is already using this email address.' });
      }
    }

    await run(`
      UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email)
      WHERE id = ?
    `, [name.trim(), phone ? phone.trim() : req.user.phone, email ? email.toLowerCase().trim() : req.user.email, req.user.id]);

    if (password && password.trim().length >= 6) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      await run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    }

    if (req.user.role === 'CUSTOMER' && bio !== undefined) {
      const existingProfile = await get('SELECT id FROM customer_profiles WHERE user_id = ?', [req.user.id]);
      if (existingProfile) {
        await run('UPDATE customer_profiles SET bio = ? WHERE user_id = ?', [bio, req.user.id]);
      } else {
        await run('INSERT INTO customer_profiles (user_id, bio) VALUES (?, ?)', [req.user.id, bio]);
      }
    }

    const updatedUser = await get('SELECT id, name, email, phone, role, status FROM users WHERE id = ?', [req.user.id]);
    let customerProfile = null;
    if (req.user.role === 'CUSTOMER') {
      customerProfile = await get('SELECT * FROM customer_profiles WHERE user_id = ?', [req.user.id]);
    }

    res.json({
      success: true,
      message: 'Personal details updated successfully.',
      user: updatedUser,
      customerProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile details.' });
  }
});

module.exports = router;
