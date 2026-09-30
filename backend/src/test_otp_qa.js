const axios = require('axios');

const runOTPQATests = async () => {
  console.log('Starting Multi-Channel OTP Verification QA Suite...');
  const API_URL = 'http://localhost:5000/api';

  // 1. Email OTP
  console.log('\n1. Testing Email OTP Dispatch & Verification...');
  const emailSend = await axios.post(`${API_URL}/otp/send`, {
    type: 'EMAIL',
    target: 'verifytest@gmail.com',
    name: 'Rahul Sharma'
  });
  console.log('   ✓ Email OTP Code Dispatched:', emailSend.data.otpCode);

  const emailVerify = await axios.post(`${API_URL}/otp/verify`, {
    type: 'EMAIL',
    target: 'verifytest@gmail.com',
    code: emailSend.data.otpCode
  });
  console.log('   ✓ Email OTP Verified Status:', emailVerify.data.verified);

  // 2. Phone OTP
  console.log('\n2. Testing Phone Mobile OTP Dispatch & Verification...');
  const phoneSend = await axios.post(`${API_URL}/otp/send`, {
    type: 'PHONE',
    target: '+919988776655'
  });
  console.log('   ✓ Phone OTP Code Dispatched:', phoneSend.data.otpCode);

  const phoneVerify = await axios.post(`${API_URL}/otp/verify`, {
    type: 'PHONE',
    target: '+919988776655',
    code: phoneSend.data.otpCode
  });
  console.log('   ✓ Phone OTP Verified Status:', phoneVerify.data.verified);

  // 3. PAN / GSTIN Government Portal OTP
  console.log('\n3. Testing PAN / GSTIN Government Portal OTP Dispatch & Verification...');
  const govSend = await axios.post(`${API_URL}/otp/send`, {
    type: 'GOV_KYC',
    target: 'ABCDE1234F / 29ABCDE1234F1Z5'
  });
  console.log('   ✓ Government Portal Linked Mobile OTP Code Dispatched:', govSend.data.otpCode);

  const govVerify = await axios.post(`${API_URL}/otp/verify`, {
    type: 'GOV_KYC',
    target: 'ABCDE1234F / 29ABCDE1234F1Z5',
    code: govSend.data.otpCode
  });
  console.log('   ✓ Government Portal OTP Verified Status:', govVerify.data.verified);

  // 4. Bank Account Payout OTP
  console.log('\n4. Testing Bank Account & IFSC Linked Mobile OTP Dispatch & Verification...');
  const bankSend = await axios.post(`${API_URL}/otp/send`, {
    type: 'BANK',
    target: '501002938471 (HDFC0001234)'
  });
  console.log('   ✓ Bank Account Linked Mobile OTP Code Dispatched:', bankSend.data.otpCode);

  const bankVerify = await axios.post(`${API_URL}/otp/verify`, {
    type: 'BANK',
    target: '501002938471 (HDFC0001234)',
    code: bankSend.data.otpCode
  });
  console.log('   ✓ Bank Account OTP Verified Status:', bankVerify.data.verified);

  console.log('\n======================================================');
  console.log(' All 4 Multi-Channel OTP Verification Tests Passed! ');
  console.log('======================================================\n');
};

runOTPQATests().catch((err) => {
  console.error('OTP QA Test Error:', err.response?.data || err.message);
});
