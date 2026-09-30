import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Server, UserCheck, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
        <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Last updated: September 16, 2026 • Learn how ServiceHub collects, protects, and handles your personal & business information.
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 text-xs text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Eye className="w-4 h-4 text-teal-600" /> 1. Information We Collect
          </h2>
          <p>
            ServiceHub collects only necessary information to facilitate marketplace bookings, government KYC compliance, and secure payouts:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
            <li><strong>Customer Account Info:</strong> Full Name, Email Address, Contact Phone Number, Delivery Addresses.</li>
            <li><strong>Partner / Merchant Business Info:</strong> Owner Name, Business Name, Contact Number, Street Address, Operating City.</li>
            <li><strong>Government KYC Documents:</strong> Trade License / GSTIN Number, Income Tax PAN Card Number, Bank Account Number, and RBI IFSC Code.</li>
            <li><strong>Technical Data:</strong> IP address, session authentication tokens (JWT), and browser language preferences.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Server className="w-4 h-4 text-blue-600" /> 2. How We Use Your Information
          </h2>
          <p>Your information is strictly used for the following operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
            <li>To process service bookings and schedule non-conflicting appointment time slots.</li>
            <li>To execute government official KYC checks (NSDL PAN, GST Portal GSTIN, and RBI IFSC validation).</li>
            <li>To process secure online payments and bank payout settlements via Razorpay.</li>
            <li>To send in-app booking confirmation alerts and status notifications.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Lock className="w-4 h-4 text-purple-600" /> 3. Data Protection & Encryption Standards
          </h2>
          <p>We employ enterprise-grade security measures to keep your data safe:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
            <li><strong>Password Hashing:</strong> All user passwords are encrypted using <code className="bg-slate-100 px-1 py-0.5 rounded">bcrypt</code> with 10 salt rounds.</li>
            <li><strong>JWT Authentication:</strong> Session authorization uses signed JSON Web Tokens passed in secure Authorization headers.</li>
            <li><strong>Express Helmet Security:</strong> HTTP headers are protected against XSS, clickjacking, and MIME sniffing attacks.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <UserCheck className="w-4 h-4 text-emerald-600" /> 4. Data Sharing & Zero Selling Guarantee
          </h2>
          <p>
            <strong>We never sell, rent, or trade your personal or business data to third-party advertisers.</strong> Data is shared only with verified service providers involved in order fulfillment or payment gateway partners (Razorpay).
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-amber-600" /> 5. Your Rights & Data Controls
          </h2>
          <p>
            Users can update their personal details, phone numbers, bio notes, and saved delivery addresses anytime via the <strong>Customer Dashboard</strong> or <strong>Merchant Dashboard</strong>.
          </p>
        </section>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
          <Link to="/terms" className="text-blue-600 hover:underline">
            ← Terms of Service
          </Link>
          <Link to="/security" className="text-purple-600 hover:underline">
            Security Center →
          </Link>
        </div>
      </div>
    </div>
  );
}
