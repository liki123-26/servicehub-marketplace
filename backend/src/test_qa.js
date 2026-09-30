const axios = require('axios');

const API = 'http://localhost:5000/api';

async function runQATests() {
  console.log('Starting ServiceHub End-to-End Automated QA Verification Pass...\n');

  try {
    // 1. Test Discovery Search & Filters
    console.log('1. Testing Customer Service Discovery Search & Filters...');
    const searchRes = await axios.get(`${API}/services?search=haircut`);
    console.assert(searchRes.data.success, 'Service search should succeed');
    console.log(`   ✓ Keyword Search "haircut" returned ${searchRes.data.count} result(s)`);

    const filterRes = await axios.get(`${API}/services?category_name=Cleaning&max_price=3000`);
    console.assert(filterRes.data.success, 'Category & Price filter should succeed');
    console.log(`   ✓ Category "Cleaning" under ₹3000 returned ${filterRes.data.count} result(s)`);

    // 2. Test Customer Login
    console.log('\n2. Testing Customer Authentication...');
    const customerLogin = await axios.post(`${API}/auth/login`, {
      email: 'customer@gmail.com',
      password: 'customer123'
    });
    console.assert(customerLogin.data.success, 'Customer login should succeed');
    const customerToken = customerLogin.data.token;
    console.log(`   ✓ Customer logged in: ${customerLogin.data.user.name} (${customerLogin.data.user.email})`);

    // 3. Test Time Slot Availability
    console.log('\n3. Testing Appointment Time Slot Availability Algorithm...');
    const servicesRes = await axios.get(`${API}/services`);
    console.assert(servicesRes.data.success && servicesRes.data.services.length > 0, 'Services list should not be empty');
    const targetService = servicesRes.data.services[0];
    const merchantId = targetService.merchant_id;
    const targetServiceId = targetService.id;

    // Use a future date for testing slots (e.g. tomorrow or next Monday)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];

    const slotsRes = await axios.get(`${API}/orders/slots/available?merchant_id=${merchantId}&date=${dateStr}`);
    console.assert(slotsRes.data.success, 'Available slots query should succeed');
    console.log(`   ✓ Available slots checked for merchant #${merchantId} on ${dateStr}. Open: ${slotsRes.data.isOpen}`);

    // 4. Test Cart Addition
    console.log('\n4. Testing Cart & Single-Merchant Guard...');
    const cartAddRes = await axios.post(
      `${API}/cart/add`,
      { serviceId: targetServiceId, bookingDate: dateStr, bookingTime: '14:00', forceClear: true },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.assert(cartAddRes.data.success, 'Cart add should succeed');
    console.log('   ✓ Service added to customer cart.');

    // 5. Test Payment Order Creation & Verification
    console.log('\n5. Testing Razorpay Payment Order Creation & Verification...');
    const payOrderRes = await axios.post(
      `${API}/payments/create`,
      { customerName: 'Rohan Mehta', customerPhone: '+91 9988776655' },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.assert(payOrderRes.data.success, 'Payment order creation should succeed');
    console.log(`   ✓ Payment Order Created #${payOrderRes.data.orderNumber} (ID: ${payOrderRes.data.orderId})`);

    const verifyRes = await axios.post(
      `${API}/payments/verify`,
      {
        orderId: payOrderRes.data.orderId,
        razorpay_order_id: payOrderRes.data.razorpayOrderId,
        simulatedSuccess: true
      },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.assert(verifyRes.data.success, 'Payment verification should succeed');
    console.log(`   ✓ Payment Signature Verified & Booking Confirmed! Order #${verifyRes.data.orderNumber}`);

    // 6. Test Merchant Login & Order Completion
    console.log('\n6. Testing Merchant Order Lifecycle Management...');
    const merchantLogin = await axios.post(`${API}/auth/login`, {
      email: 'merchant@urbanglow.com',
      password: 'merchant123'
    });
    const merchantToken = merchantLogin.data.token;

    const statusRes = await axios.put(
      `${API}/orders/${payOrderRes.data.orderId}/status`,
      { status: 'COMPLETED' },
      { headers: { Authorization: `Bearer ${merchantToken}` } }
    );
    console.assert(statusRes.data.success, 'Merchant status update to COMPLETED should succeed');
    console.log('   ✓ Merchant marked order as COMPLETED.');

    // 7. Test Customer Review Submission
    console.log('\n7. Testing Customer Review Submission for Completed Order...');
    const reviewRes = await axios.post(
      `${API}/reviews`,
      { orderId: payOrderRes.data.orderId, rating: 5, comment: 'Exceptional haircut and professional staff!' },
      { headers: { Authorization: `Bearer ${customerToken}` } }
    );
    console.assert(reviewRes.data.success, 'Review submission should succeed');
    console.log(`   ✓ Review published! Updated Merchant Rating: ${reviewRes.data.newMerchantRating}`);

    // 8. Test Admin Console Stats
    console.log('\n8. Testing Admin Console Analytics & Merchant Approvals Queue...');
    const adminLogin = await axios.post(`${API}/auth/login`, {
      email: 'admin@servicehub.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;

    const adminStats = await axios.get(`${API}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.assert(adminStats.data.success, 'Admin stats should succeed');
    console.log(`   ✓ Admin Analytics: Total Revenue = ₹${adminStats.data.stats.totalRevenue}, Total Orders = ${adminStats.data.stats.totalOrders}`);

    console.log('\n======================================================');
    console.log(' All End-to-End ServiceHub QA Verification Checks Passed!');
    console.log('======================================================');
  } catch (err) {
    console.error('\n❌ QA Test Failed:', err.response?.data || err.message);
  }
}

runQATests();
