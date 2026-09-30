const bcrypt = require('bcryptjs');
const { initDb, run, get, query } = require('./config/db');

const seedDatabase = async () => {
  console.log('Seeding ServiceHub database...');
  await initDb();

  // Clear existing tables
  await run('DELETE FROM reviews');
  await run('DELETE FROM payments');
  await run('DELETE FROM orders');
  await run('DELETE FROM cart_items');
  await run('DELETE FROM carts');
  await run('DELETE FROM addresses');
  await run('DELETE FROM availability');
  await run('DELETE FROM services');
  await run('DELETE FROM merchant_profiles');
  await run('DELETE FROM categories');
  await run('DELETE FROM customer_profiles');
  await run('DELETE FROM notifications');
  await run('DELETE FROM disputes');
  await run('DELETE FROM users');

  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedMerchantPass = await bcrypt.hash('merchant123', 10);
  const hashedCustomerPass = await bcrypt.hash('customer123', 10);

  // 1. Create Users
  const adminUser = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Marketplace Admin', 'admin@servicehub.com', hashedAdminPass, '+91 98765 43210', 'ADMIN']
  );

  const merchantUser1 = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Priya Sharma (UrbanGlow)', 'merchant@urbanglow.com', hashedMerchantPass, '+91 98123 45678', 'MERCHANT']
  );

  const merchantUser2 = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Rajesh Kumar (Sparkle Clean)', 'merchant@sparkle.com', hashedMerchantPass, '+91 98234 56789', 'MERCHANT']
  );

  const merchantUser3 = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Amit Verma (AutoCare)', 'merchant@autocare.com', hashedMerchantPass, '+91 98345 67890', 'MERCHANT']
  );

  const merchantUser4 = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Sneha Reddy (FitZone)', 'merchant@fitzone.com', hashedMerchantPass, '+91 98456 78901', 'MERCHANT']
  );

  const merchantUser5 = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Vikram Malhotra (BrightLens)', 'merchant@brightlens.com', hashedMerchantPass, '+91 98567 89012', 'MERCHANT']
  );

  const customerUser = await run(
    'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
    ['Rohan Mehta', 'customer@gmail.com', hashedCustomerPass, '+91 99887 76655', 'CUSTOMER']
  );

  await run('INSERT INTO customer_profiles (user_id, bio) VALUES (?, ?)', [customerUser.id, 'Passionate home maintenance seeker']);
  await run('INSERT INTO carts (user_id) VALUES (?)', [customerUser.id]);

  // Customer default address
  await run(`
    INSERT INTO addresses (user_id, name, phone, address_line, city, state, pincode, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `, [customerUser.id, 'Rohan Mehta', '+91 99887 76655', '402, Green Park Apartments, HSR Layout', 'Bengaluru', 'Karnataka', '560102']);

  // 2. Categories
  const catList = [
    { name: 'Cleaning', icon: 'Sparkles', desc: 'Home, deep cleaning, sofa & kitchen sanitization', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80' },
    { name: 'Beauty', icon: 'Scissors', desc: 'Haircut, spa, salon & grooming services', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80' },
    { name: 'Repairs', icon: 'Wrench', desc: 'Plumbing, electrical, AC repair & carpentry', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80' },
    { name: 'Automotive', icon: 'Car', desc: 'Car wash, detailing, engine service & repairs', image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80' },
    { name: 'Fitness', icon: 'Dumbbell', desc: 'Personal trainer, yoga instructor & wellness coaching', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80' },
    { name: 'Pet Care', icon: 'Dog', desc: 'Pet grooming, dog walking & vet consultations', image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80' },
    { name: 'Photography', icon: 'Camera', desc: 'Event, wedding & portrait photography', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80' },
    { name: 'Education', icon: 'BookOpen', desc: 'Home tutoring, music classes & skill training', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80' },
    { name: 'Events', icon: 'Calendar', desc: 'Party planning, catering & decoration services', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80' },
    { name: 'Wellness', icon: 'Heart', desc: 'Physiotherapy, massage & holistic therapies', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80' }
  ];

  const catMap = {};
  for (const cat of catList) {
    const res = await run(
      'INSERT INTO categories (name, description, icon, image, status) VALUES (?, ?, ?, ?, ?)',
      [cat.name, cat.desc, cat.icon, cat.image, 'ACTIVE']
    );
    catMap[cat.name] = res.id;
  }

  // 3. Merchant Profiles
  const merchantsData = [
    {
      userId: merchantUser1.id,
      businessName: 'UrbanGlow Salon & Spa',
      catId: catMap['Beauty'],
      desc: 'Premium beauty treatment, haircuts, bridal makeup, and relaxing facial spa by certified professionals.',
      phone: '+91 98123 45678',
      address: '102, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      logo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      rating: 4.9,
      reviewCount: 48
    },
    {
      userId: merchantUser2.id,
      businessName: 'Sparkle Home Services',
      catId: catMap['Cleaning'],
      desc: 'Top-rated deep home cleaning, sofa sanitization, water tank cleaning, and full kitchen scrub services.',
      phone: '+91 98234 56789',
      address: 'Shop 14, Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      logo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1000&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      rating: 4.8,
      reviewCount: 64
    },
    {
      userId: merchantUser3.id,
      businessName: 'AutoCare Pro Garage',
      catId: catMap['Automotive'],
      desc: 'Complete doorstep car foam wash, ceramic coating, wheel alignment, and full synthetic oil change.',
      phone: '+91 98345 67890',
      address: 'Plot 45, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      logo: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=200&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=1000&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      rating: 4.7,
      reviewCount: 32
    },
    {
      userId: merchantUser4.id,
      businessName: 'FitZone Personal Training',
      catId: catMap['Fitness'],
      desc: '1-on-1 personal fitness training, weight loss programs, functional cross-fit, and custom diet plans.',
      phone: '+91 98456 78901',
      address: '22, Bellandur Ring Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560103',
      logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      rating: 4.9,
      reviewCount: 29
    },
    {
      userId: merchantUser5.id,
      businessName: 'BrightLens Studio',
      catId: catMap['Photography'],
      desc: 'Candid event photography, portrait shoots, product photography, and high-definition video coverage.',
      phone: '+91 98567 89012',
      address: '88, Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80',
      cover: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80',
      status: 'PENDING', // PENDING Approval for Admin Demo Testing!
      rating: 5.0,
      reviewCount: 5
    }
  ];

  const merchantIds = {};
  for (const m of merchantsData) {
    const res = await run(`
      INSERT INTO merchant_profiles 
      (user_id, business_name, category_id, description, phone, address, city, state, pincode, logo, cover_image, status, rating, review_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [m.userId, m.businessName, m.catId, m.desc, m.phone, m.address, m.city, m.state, m.pincode, m.logo, m.cover, m.status, m.rating, m.reviewCount]);

    merchantIds[m.businessName] = res.id;

    // Create 7-day availability
    for (let day = 0; day <= 6; day++) {
      const isOpen = day === 0 ? 0 : 1;
      await run(
        'INSERT INTO availability (merchant_id, day_of_week, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
        [res.id, day, isOpen, '09:00', '18:00']
      );
    }
  }

  // 4. Services
  const servicesData = [
    // UrbanGlow Salon
    {
      merchantId: merchantIds['UrbanGlow Salon & Spa'],
      catId: catMap['Beauty'],
      name: "Men's Premium Haircut & Hair Styling",
      desc: 'Haircut by senior stylist including hair wash, scalp massage, blow dry, and beard shaping.',
      price: 499,
      duration: 45,
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80'
    },
    {
      merchantId: merchantIds['UrbanGlow Salon & Spa'],
      catId: catMap['Beauty'],
      name: 'Glowing Herbal Facial & De-Tan Spa',
      desc: 'Deep cleansing herbal facial mask with organic antioxidants, de-tan scrub, and soothing neck massage.',
      price: 1299,
      duration: 75,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'
    },

    // Sparkle Home Services
    {
      merchantId: merchantIds['Sparkle Home Services'],
      catId: catMap['Cleaning'],
      name: 'Full Home Deep Cleaning (2 BHK)',
      desc: 'Complete scrubbing & sanitization of living room, bedrooms, kitchen counters, bathrooms, and balcony.',
      price: 2499,
      duration: 240,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80'
    },
    {
      merchantId: merchantIds['Sparkle Home Services'],
      catId: catMap['Cleaning'],
      name: 'Sofa Shampooing & Vacuum Cleaning (5 Seater)',
      desc: 'Fabric shampoo extraction, stain removal, dust mite sanitization, and deodorizing treat.',
      price: 999,
      duration: 90,
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80'
    },

    // AutoCare Pro Garage
    {
      merchantId: merchantIds['AutoCare Pro Garage'],
      catId: catMap['Automotive'],
      name: 'Doorstep Eco Foam Car Wash & Vacuum',
      desc: 'High-pressure foam wash, tire dressing, interior vacuuming, dashboard polish, and glass cleaning.',
      price: 699,
      duration: 60,
      image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80'
    },
    {
      merchantId: merchantIds['AutoCare Pro Garage'],
      catId: catMap['Automotive'],
      name: 'Synthetic Engine Oil Change & 25-Point Checkup',
      desc: 'Engine oil drain & replace with 5W-30 synthetic oil, filter check, battery test, and brake check.',
      price: 2999,
      duration: 90,
      image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80'
    },

    // FitZone Personal Training
    {
      merchantId: merchantIds['FitZone Personal Training'],
      catId: catMap['Fitness'],
      name: '1-on-1 Personal Fitness & HIIT Training',
      desc: 'Customized 60-minute personal training workout session focused on fat loss, core strength, and mobility.',
      price: 899,
      duration: 60,
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'
    },

    // BrightLens Studio
    {
      merchantId: merchantIds['BrightLens Studio'],
      catId: catMap['Photography'],
      name: 'Outdoor Portrait & Headshot Session',
      desc: '2-hour professional outdoor photo session with 15 color-edited high-res digital photos.',
      price: 3499,
      duration: 120,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const serviceIds = [];
  for (const s of servicesData) {
    const res = await run(`
      INSERT INTO services (merchant_id, category_id, name, description, price, duration_minutes, image, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `, [s.merchantId, s.catId, s.name, s.desc, s.price, s.duration, s.image]);
    serviceIds.push(res.id);
  }

  // 5. Seed Orders (One COMPLETED order so Customer can test Review Submission!)
  const completedOrder = await run(`
    INSERT INTO orders (
      order_number, customer_id, merchant_id, service_id,
      booking_date, booking_time, total_amount, tax_amount, platform_fee,
      status, payment_status, customer_name, customer_phone, address_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'COMPLETED', 'PAID', ?, ?, ?)
  `, [
    'SH1001',
    customerUser.id,
    merchantIds['UrbanGlow Salon & Spa'],
    serviceIds[0], // Premium Haircut
    '2026-08-10',
    '11:00',
    524,
    25,
    0,
    'Rohan Mehta',
    '+91 99887 76655',
    JSON.stringify({ address_line: '402, Green Park, HSR Layout', city: 'Bengaluru', pincode: '560102' })
  ]);

  await run(`
    INSERT INTO payments (order_id, razorpay_order_id, razorpay_payment_id, amount, status)
    VALUES (?, ?, ?, ?, 'SUCCESS')
  `, [completedOrder.id, 'rzp_demo_1001', 'pay_demo_1001', 524]);

  // Seed sample confirmed upcoming booking
  const upcomingOrder = await run(`
    INSERT INTO orders (
      order_number, customer_id, merchant_id, service_id,
      booking_date, booking_time, total_amount, tax_amount, platform_fee,
      status, payment_status, customer_name, customer_phone, address_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'PAID', ?, ?, ?)
  `, [
    'SH1002',
    customerUser.id,
    merchantIds['Sparkle Home Services'],
    serviceIds[2], // Deep cleaning
    '2026-08-22',
    '10:00',
    2624,
    125,
    0,
    'Rohan Mehta',
    '+91 99887 76655',
    JSON.stringify({ address_line: '402, Green Park, HSR Layout', city: 'Bengaluru', pincode: '560102' })
  ]);

  await run(`
    INSERT INTO payments (order_id, razorpay_order_id, razorpay_payment_id, amount, status)
    VALUES (?, ?, ?, ?, 'SUCCESS')
  `, [upcomingOrder.id, 'rzp_demo_1002', 'pay_demo_1002', 2624]);

  // 6. Seed Notifications
  await run(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, ?, ?, ?)
  `, [
    customerUser.id,
    'Welcome to ServiceHub!',
    'Discover top-rated local service professionals, compare pricing, and book instantly.',
    'INFO'
  ]);

  await run(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, ?, ?, ?)
  `, [
    merchantUser1.id,
    'Business Account Active',
    'Your business profile UrbanGlow Salon & Spa is active. Start adding services and receiving bookings.',
    'SUCCESS'
  ]);

  console.log('=====================================================');
  console.log(' ServiceHub Database Seeded Successfully!');
  console.log('-----------------------------------------------------');
  console.log(' Demo Accounts:');
  console.log('  Customer: customer@gmail.com / customer123');
  console.log('  Merchant: merchant@urbanglow.com / merchant123');
  console.log('  Admin:    admin@servicehub.com / admin123');
  console.log('=====================================================');
};

seedDatabase().catch((err) => {
  console.error('Seed error:', err);
});
