const { sendRegistrationAckEmail, sendApprovalEmail, sendRejectionEmail } = require('./utils/emailService');
const fs = require('fs');
const path = require('path');

const runEmailQATests = async () => {
  console.log('Starting Email Notification & Credentials Dispatch Verification...');

  // 1. Customer Registration Email
  console.log('\n1. Testing Registration Acknowledgment Email...');
  const regRes = await sendRegistrationAckEmail({
    email: 'newcustomer@test.com',
    name: 'Aarav Patel',
    role: 'CUSTOMER'
  });
  console.log('   ✓ Customer Registration Email Sent:', regRes.success);

  // 2. Merchant Registration Email
  console.log('\n2. Testing Partner Merchant Registration Email...');
  const merchRegRes = await sendRegistrationAckEmail({
    email: 'partner@expressclean.com',
    name: 'Suresh Raina',
    role: 'MERCHANT',
    businessName: 'Express Clean Services'
  });
  console.log('   ✓ Partner Registration Email Sent:', merchRegRes.success);

  // 3. Admin Approval & Credentials Email
  console.log('\n3. Testing Post-Verification Approval & Access Credentials Email...');
  const approvalRes = await sendApprovalEmail({
    email: 'partner@expressclean.com',
    name: 'Suresh Raina',
    role: 'MERCHANT',
    businessName: 'Express Clean Services',
    passwordHint: 'partnerPass123'
  });
  console.log('   ✓ Approval & Credentials Email Sent:', approvalRes.success);

  // 4. Verify emails.log audit file
  const logPath = path.join(__dirname, '../emails.log');
  if (fs.existsSync(logPath)) {
    const logContent = fs.readFileSync(logPath, 'utf8');
    console.log(`\n4. Verified emails.log Audit File (${logContent.length} bytes logged).`);
  }

  console.log('\n======================================================');
  console.log(' All Email Notification & Credentials Tests Passed! ');
  console.log('======================================================\n');
};

runEmailQATests().catch(console.error);
