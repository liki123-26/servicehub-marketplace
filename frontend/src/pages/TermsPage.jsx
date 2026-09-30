import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, CheckCircle, Scale, Building, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-3">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
          <FileText className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Last updated: September 16, 2026 • Please read these terms carefully before using ServiceHub Multi-Vendor Service Marketplace.
        </p>
      </div>

      {/* Terms Body */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 text-xs text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Scale className="w-4 h-4 text-blue-600" /> 1. Acceptance of Terms & Eligibility
          </h2>
          <p>
            By accessing or using ServiceHub ("Platform", "We", "Our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the platform. ServiceHub connects Customers seeking services with independent, verified Service Providers and Partners ("Merchants").
          </p>
          <p>
            Users must be at least 18 years of age and legally competent to enter into binding contracts under Indian law.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-teal-600" /> 2. Partner Onboarding & Government KYC Verification
          </h2>
          <p>
            All business partners and service merchants must undergo mandatory government document verification before publishing services or receiving bookings. Required verification documents include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
            <li><strong>NSDL Income Tax PAN Card Number</strong> (Verified against official Income Tax Department standards).</li>
            <li><strong>GSTIN / Trade License Number</strong> (Verified against official GST Portal state codes & checksums).</li>
            <li><strong>Bank Account Number & RBI IFSC Code</strong> (Verified against official RBI bank branch network).</li>
          </ul>
          <p>
            ServiceHub reserves the right to suspend or reject any account that fails government KYC checks or submits falsified documents.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <CheckCircle className="w-4 h-4 text-purple-600" /> 3. Bookings & Non-Conflicting Time Slot Guard
          </h2>
          <p>
            Customers select specific appointment dates and non-conflicting time slots based on merchant availability. Bookings are confirmed upon successful payment verification.
          </p>
          <p>
            <strong>Single Provider Cart Constraint:</strong> To prevent scheduling conflicts and streamline service fulfillment, a customer's shopping cart can contain services from only one merchant at a time.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" /> 4. Pricing, GST Taxes & Razorpay Payments
          </h2>
          <p>
            All service prices are listed in Indian Rupees (₹ INR). Prices include applicable Goods and Services Tax (5% GST). Payments are processed securely via Razorpay API integration with HMAC SHA256 payment signature verification.
          </p>
          <p>
            ServiceHub does not store raw credit card numbers or banking passwords on its servers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" /> 5. Verified Reviews & Ratings Policy
          </h2>
          <p>
            Customer reviews and 1 to 5-star ratings can be submitted <strong>only for verified COMPLETED bookings</strong>. This eliminates fake reviews and ensures transparent merchant rating calculations.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            ⚖️ 6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes or claims arising out of platform usage shall be submitted to customer support or resolved through arbitration under Indian jurisdiction.
          </p>
        </section>

        {/* Bottom CTA */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
          <Link to="/privacy" className="text-blue-600 hover:underline">
            Read Privacy Policy →
          </Link>
          <Link to="/security" className="text-purple-600 hover:underline">
            Read Security Architecture →
          </Link>
        </div>
      </div>
    </div>
  );
}
