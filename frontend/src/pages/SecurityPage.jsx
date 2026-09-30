import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, Server, CheckCircle2, Key, CreditCard, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SecurityPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl text-center space-y-3">
        <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold">ServiceHub Security Center</h1>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Comprehensive overview of architecture, encryption standards, government KYC verification, and data safety protocols.
        </p>
      </div>

      {/* Security Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Authentication & RBAC Security</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Multi-tenant Role-Based Access Control (RBAC) enforces isolated boundaries between <strong>CUSTOMER</strong>, <strong>MERCHANT</strong>, and <strong>ADMIN</strong> roles. Passwords are encrypted using <code>bcrypt</code> (10 salt rounds), and sessions use signed JSON Web Tokens (JWT).
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Official Government KYC Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automated verification against official government databases:
          </p>
          <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
            <li><strong>NSDL PAN Card Check:</strong> Validates 10-character tax entity.</li>
            <li><strong>GST Portal Check:</strong> Validates 15-character GSTIN & State Code 29.</li>
            <li><strong>RBI IFSC Check:</strong> Validates 11-character bank branch code.</li>
            <li><strong>UIDAI Check:</strong> Validates Aadhaar Verhoeff Checksum.</li>
          </ul>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">PCI-DSS Payment Security</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Payments are securely routed via Razorpay SDK with <strong>HMAC SHA256 payment signature verification</strong>. Prevents order amount tampering or unauthorized transaction injection.
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Web Infrastructure Security</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Backend runs on Express 5 equipped with <code>helmet</code> security headers, CORS origin restrictions, strict parameterized SQL query prevention against SQL injection, and body payload limits.
          </p>
        </div>
      </div>

      {/* Security Statement Banner */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 text-center">
        <h3 className="font-extrabold text-slate-900 text-lg">Responsible Security & Incident Reporting</h3>
        <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
          If you discover a security vulnerability or security bug in ServiceHub, please report it to our security team at <strong className="text-purple-600">security@servicehub.com</strong>.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-bold pt-2">
          <Link to="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="text-teal-600 hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
