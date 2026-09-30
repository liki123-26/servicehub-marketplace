const jwt = require('jsonwebtoken');
const { get } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'servicehub_secret_key_2026';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await get('SELECT id, name, email, phone, role FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    req.user = user;

    // If user is a merchant, attach merchant_profile details
    if (user.role === 'MERCHANT') {
      const merchant = await get('SELECT * FROM merchant_profiles WHERE user_id = ?', [user.id]);
      req.merchant = merchant || null;
    }

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${roles.join(', ')}] permission role(s).`
      });
    }
    next();
  };
};

const requireApprovedMerchant = (req, res, next) => {
  if (!req.merchant) {
    return res.status(403).json({ success: false, message: 'Merchant profile not found.' });
  }
  if (req.merchant.status !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      message: `Access denied. Your merchant account is currently ${req.merchant.status}. Admin approval is required.`
    });
  }
  next();
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole,
  requireApprovedMerchant
};
