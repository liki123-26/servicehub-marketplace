import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, User, Mail, Lock, Phone, MapPin, Building, CreditCard, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function MerchantRegisterPage() {
  const { registerMerchant, merchantRegister } = useAuth();
  const handleRegister = registerMerchant || merchantRegister;
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    categoryId: '',
    customCategory: '',
    description: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    licenseNumber: '',
    panNumber: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
    documentUrl: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.categories || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.businessName) {
      showError('Please fill out all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await handleRegister(formData);
      if (res.success) {
        showSuccess(res.message || 'Partner application submitted successfully! Admin will review your profile.');
        setPendingNotice(true);
      }
    } catch (err) {
      showError(err.message || 'Partner registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-teal-600/30">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Partner & Business Merchant Onboarding</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Register your business profile to offer services on ServiceHub. Fill in your details below to submit your partner application.
          </p>
        </div>

        {pendingNotice ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-4 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-emerald-900 text-xl">Application Submitted!</h3>
            <p className="text-xs text-emerald-800 leading-relaxed max-w-lg mx-auto">
              Your business application for <strong>"{formData.businessName}"</strong> has been submitted.
              Our team will review your business profile and details before granting sign-in access.
            </p>
            <Link
              to="/login"
              className="px-6 py-3 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow inline-block"
            >
              Go to Sign In Page
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* SECTION 1: Account & Owner Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                1. Owner & Account Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Owner Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    placeholder="+91 99887 76655"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Email *</label>
                  <input
                    type="email"
                    placeholder="merchant@urbanglow.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Account Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Business Info */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                2. Business Profile Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business / Storefront Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. UrbanGlow Salon & Spa"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="other">+ Others (Enter Manually)</option>
                  </select>
                </div>
              </div>

              {formData.categoryId === 'other' && (
                <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-2xl animate-fade-in">
                  <label className="font-bold text-teal-900 block mb-1 text-xs">
                    Custom Business Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Event Catering, Mobile Repairs, Tattoo Art, Laundry..."
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="w-full p-2.5 bg-white border border-teal-300 rounded-xl font-medium text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-[11px] text-teal-700 mt-1 block">
                    Your custom category will be created and associated with your business profile.
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe your services, specialization, experience..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* SECTION 3: Business Documents */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> 3. Business Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trade License / GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. GSTIN29ABCDE1234F1Z5 / LIC998877"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    value={formData.panNumber}
                    onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium uppercase"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Bank Payout Account Details */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" /> 4. Bank Payout Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank / ICICI"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 501002938471"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium uppercase"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Address */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                5. Operating Location Address
              </h3>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 102, Commercial Street, Indiranagar"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-teal-600/30 transition"
            >
              {submitting ? 'Submitting Partner Application...' : 'Submit Partner Business Application'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already a registered business partner?{' '}
          <Link to="/login" className="text-teal-600 font-bold hover:underline">
            Partner Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
