const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath);

// Helper wrapper for async database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Users
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          phone TEXT,
          role TEXT CHECK(role IN ('CUSTOMER', 'MERCHANT', 'ADMIN')) NOT NULL DEFAULT 'CUSTOMER',
          status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')) DEFAULT 'APPROVED',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'APPROVED'`, () => {});

      // 2. Customer Profiles
      db.run(`
        CREATE TABLE IF NOT EXISTS customer_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          avatar TEXT,
          bio TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 3. Categories
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          image TEXT,
          status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 4. Merchant Profiles with KYC & Bank Payout Details
      db.run(`
        CREATE TABLE IF NOT EXISTS merchant_profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          business_name TEXT NOT NULL,
          category_id INTEGER,
          description TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          pincode TEXT,
          license_number TEXT,
          pan_number TEXT,
          bank_name TEXT,
          account_number TEXT,
          ifsc_code TEXT,
          document_url TEXT,
          logo TEXT,
          cover_image TEXT,
          status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')) DEFAULT 'PENDING',
          rating REAL DEFAULT 5.0,
          review_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);

      // Migrations for existing merchant profiles
      db.run(`ALTER TABLE merchant_profiles ADD COLUMN license_number TEXT`, () => {});
      db.run(`ALTER TABLE merchant_profiles ADD COLUMN pan_number TEXT`, () => {});
      db.run(`ALTER TABLE merchant_profiles ADD COLUMN bank_name TEXT`, () => {});
      db.run(`ALTER TABLE merchant_profiles ADD COLUMN account_number TEXT`, () => {});
      db.run(`ALTER TABLE merchant_profiles ADD COLUMN ifsc_code TEXT`, () => {});
      db.run(`ALTER TABLE merchant_profiles ADD COLUMN document_url TEXT`, () => {});

      // 5. Services
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          merchant_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          duration_minutes INTEGER NOT NULL DEFAULT 60,
          image TEXT,
          status TEXT CHECK(status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (merchant_id) REFERENCES merchant_profiles(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
        )
      `);

      // 6. Availability Hours
      db.run(`
        CREATE TABLE IF NOT EXISTS availability (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          merchant_id INTEGER NOT NULL,
          day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
          is_open INTEGER DEFAULT 1,
          open_time TEXT DEFAULT '09:00',
          close_time TEXT DEFAULT '18:00',
          FOREIGN KEY (merchant_id) REFERENCES merchant_profiles(id) ON DELETE CASCADE
        )
      `);

      // 7. Customer Addresses
      db.run(`
        CREATE TABLE IF NOT EXISTS addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          address_line TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          pincode TEXT NOT NULL,
          is_default INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 8. Carts & Cart Items
      db.run(`
        CREATE TABLE IF NOT EXISTS carts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE NOT NULL,
          merchant_id INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (merchant_id) REFERENCES merchant_profiles(id) ON DELETE SET NULL
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cart_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          booking_date TEXT NOT NULL,
          booking_time TEXT NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
        )
      `);

      // 9. Orders
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE NOT NULL,
          customer_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          booking_date TEXT NOT NULL,
          booking_time TEXT NOT NULL,
          total_amount REAL NOT NULL,
          tax_amount REAL DEFAULT 0,
          platform_fee REAL DEFAULT 0,
          status TEXT CHECK(status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED')) DEFAULT 'PENDING',
          payment_status TEXT CHECK(payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING',
          customer_name TEXT,
          customer_phone TEXT,
          address_json TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES users(id),
          FOREIGN KEY (merchant_id) REFERENCES merchant_profiles(id),
          FOREIGN KEY (service_id) REFERENCES services(id)
        )
      `);

      // 10. Payments
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          razorpay_order_id TEXT,
          razorpay_payment_id TEXT,
          amount REAL NOT NULL,
          status TEXT NOT NULL,
          payment_method TEXT DEFAULT 'Razorpay',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);

      // 11. Reviews
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER UNIQUE NOT NULL,
          customer_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          service_id INTEGER NOT NULL,
          rating INTEGER CHECK(rating BETWEEN 1 AND 5) NOT NULL,
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (customer_id) REFERENCES users(id),
          FOREIGN KEY (merchant_id) REFERENCES merchant_profiles(id),
          FOREIGN KEY (service_id) REFERENCES services(id)
        )
      `);

      // 12. Notifications
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'INFO',
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // 13. Disputes
      db.run(`
        CREATE TABLE IF NOT EXISTS disputes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          customer_id INTEGER NOT NULL,
          merchant_id INTEGER NOT NULL,
          reason TEXT NOT NULL,
          description TEXT,
          status TEXT CHECK(status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'REFUND_APPROVED')) DEFAULT 'OPEN',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (customer_id) REFERENCES users(id),
          FOREIGN KEY (merchant_id) REFERENCES merchant_profiles(id)
        )
      `);

      // 14. OTP Verification
      db.run(`
        CREATE TABLE IF NOT EXISTS otps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          target_type TEXT NOT NULL,
          target_value TEXT NOT NULL,
          code TEXT NOT NULL,
          is_verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL
        )
      `, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  });
};

module.exports = { db, query, get, run, initDb };
