const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../emails.log');

// Create test or SMTP transporter
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Ethereal / Simulated SMTP transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (e) {
      // Fallback dummy transporter
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('[Email Simulation] Mail dispatched to:', mailOptions.to);
          return { messageId: `mock-${Date.now()}` };
        }
      };
    }
  }
  return transporter;
};

// Helper to log outgoing emails to emails.log for auditing & quick inspection
const logEmailAudit = (to, subject, htmlBody) => {
  const timestamp = new Date().toISOString();
  const logEntry = `\n======================================================\n[${timestamp}] TO: ${to}\nSUBJECT: ${subject}\n\n${htmlBody.replace(/<[^>]+>/g, '')}\n======================================================\n`;
  try {
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (err) {
    console.error('Failed to write to emails.log:', err.message);
  }
};

/**
 * 1. Send Registration Acknowledgment Email
 */
const sendRegistrationAckEmail = async ({ email, name, role, businessName }) => {
  try {
    const activeTransporter = await getTransporter();
    const subject = `ServiceHub - Application Received & Verification Pending`;
    const entityName = businessName ? `"${businessName}"` : name;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
        <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ServiceHub Marketplace</h1>
          <p style="color: #ccfbf1; margin: 5px 0 0 0; font-size: 14px;">Registration Application Submitted</p>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h2 style="color: #0f172a; margin-top: 0;">Hello ${name},</h2>
          <p style="font-size: 14px; line-height: 1.6;">
            Thank you for registering your ${role === 'MERCHANT' ? 'Business Partner' : 'Customer'} account for <strong>${entityName}</strong> on <strong>ServiceHub</strong>.
          </p>
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #15803d; display: block; margin-bottom: 4px;">Application Status: PENDING ADMIN VERIFICATION</strong>
            <span style="font-size: 13px; color: #166534;">
              Your account details and verification documents (Trade License/GSTIN, PAN Card & Bank IFSC) have been received. Our compliance team is currently reviewing your application.
            </span>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Once our administrator verifies your government credentials, you will receive an official approval email with your direct access credentials to sign in.
          </p>
          <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
            &copy; ${new Date().getFullYear()} ServiceHub Marketplace Compliance Team. All rights reserved.
          </div>
        </div>
      </div>
    `;

    const info = await activeTransporter.sendMail({
      from: '"ServiceHub Admin" <no-reply@servicehub.com>',
      to: email,
      subject,
      html
    });

    logEmailAudit(email, subject, html);
    console.log(`[Email Delivered] Registration Ack Email sent to ${email} (MsgID: ${info.messageId || 'ok'})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Error] Failed to send registration email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 2. Send Official Verification & Approval Email with Access Credentials
 */
const sendApprovalEmail = async ({ email, name, role, businessName, passwordHint }) => {
  try {
    const activeTransporter = await getTransporter();
    const subject = `🎉 Congratulations! Your ServiceHub ${role === 'MERCHANT' ? 'Partner' : 'Customer'} Account is Approved`;
    const entityTitle = businessName ? `Business Profile: "${businessName}"` : `Customer Account: ${name}`;

    const loginUrl = `http://localhost:5173/login`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #10b981; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🎉 Verification Successful!</h1>
          <p style="color: #ecfdf5; margin: 6px 0 0 0; font-size: 14px;">Your ServiceHub Account is Now Active</p>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h2 style="color: #0f172a; margin-top: 0;">Dear ${name},</h2>
          <p style="font-size: 14px; line-height: 1.6;">
            We are pleased to inform you that your registration for <strong>${entityTitle}</strong> has passed all official compliance checks (including NSDL PAN, GSTIN, and RBI IFSC verification) and has been <strong>APPROVED</strong> by the platform administrator!
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 12px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; border-b: 1px solid #e2e8f0; padding-bottom: 8px;">🔑 Your Sign-In Access Credentials</h3>
            <table style="width: 100%; font-size: 13px; text-align: left;">
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold; width: 140px;">Registered Email:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Account Role:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #0d9488;">${role === 'MERCHANT' ? 'Verified Business Merchant Partner' : 'Approved Customer Account'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Verification Status:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #16a34a;">✅ VERIFIED & APPROVED</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b; font-weight: bold;">Access Password:</td>
                <td style="padding: 6px 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #2563eb;">${passwordHint || '•••••••• (Your chosen password during registration)'}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: bold; border-radius: 10px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
              Sign In to ServiceHub Portal &rarr;
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center;">
            Need assistance? You can access support anytime directly from your dashboard navigation bar.
          </p>

          <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
            &copy; ${new Date().getFullYear()} ServiceHub Marketplace Inc. Direct Portal Access: ${loginUrl}
          </div>
        </div>
      </div>
    `;

    const info = await activeTransporter.sendMail({
      from: '"ServiceHub Admin & Compliance" <support@servicehub.com>',
      to: email,
      subject,
      html
    });

    logEmailAudit(email, subject, html);
    console.log(`[Email Delivered] Approval & Credentials Email sent to ${email} (MsgID: ${info.messageId || 'ok'})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Error] Failed to send approval email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 3. Send Rejection Email
 */
const sendRejectionEmail = async ({ email, name, role, reason }) => {
  try {
    const activeTransporter = await getTransporter();
    const subject = `ServiceHub - Application Status Update`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ServiceHub Application Update</h1>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h2 style="color: #0f172a; margin-top: 0;">Hello ${name},</h2>
          <p style="font-size: 14px; line-height: 1.6;">
            We regret to inform you that your application for a ${role.toLowerCase()} account on ServiceHub could not be approved at this time.
          </p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #991b1b; display: block; margin-bottom: 4px;">Reason for Rejection:</strong>
            <span style="font-size: 13px; color: #7f1d1d;">${reason || 'KYC or business document details could not be validated.'}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">
            You may re-apply with valid details or contact support for further assistance.
          </p>
        </div>
      </div>
    `;

    const info = await activeTransporter.sendMail({
      from: '"ServiceHub Compliance" <no-reply@servicehub.com>',
      to: email,
      subject,
      html
    });

    logEmailAudit(email, subject, html);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Error] Failed to send rejection email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * 4. Send Verification OTP Email
 */
const sendOTPEmail = async ({ email, name, otpCode, targetType }) => {
  try {
    const activeTransporter = await getTransporter();
    const subject = `ServiceHub - Verification OTP Code: ${otpCode}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 16px; background-color: #ffffff;">
        <div style="background-color: #0f766e; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h2 style="color: #ffffff; margin: 0; font-size: 22px;">ServiceHub Security Verification</h2>
          <p style="color: #ccfbf1; margin: 4px 0 0 0; font-size: 13px;">${targetType || 'Identity'} Verification Code</p>
        </div>
        <div style="padding: 24px; color: #334155; text-align: center;">
          <p style="font-size: 14px; margin-top: 0;">Hello ${name || 'User'},</p>
          <p style="font-size: 13px; color: #64748b;">
            Your one-time 6-digit verification security OTP code for <strong>${targetType || 'ServiceHub Account'}</strong> is:
          </p>
          <div style="background-color: #f0fdf4; border: 2px dashed #16a34a; padding: 16px; border-radius: 12px; margin: 20px 0; display: inline-block; width: 80%;">
            <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #15803d;">${otpCode}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">
            This OTP code will expire in 10 minutes. Do not share this code with anyone.
          </p>
        </div>
      </div>
    `;

    const info = await activeTransporter.sendMail({
      from: '"ServiceHub Security" <otp@servicehub.com>',
      to: email,
      subject,
      html
    });

    logEmailAudit(email, subject, html);
    console.log(`[OTP Email] OTP ${otpCode} dispatched to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[OTP Email Error] Failed to send OTP to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendRegistrationAckEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendOTPEmail
};
