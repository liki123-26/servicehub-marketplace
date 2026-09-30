import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [pendingNotice, setPendingNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      showError('Please fill out all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await register(formData);
      if (res.success) {
        showSuccess(res.message || 'Registration submitted! Account pending admin approval.');
        setPendingNotice(true);
      }
    } catch (err) {
      showError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create Customer Account</h1>
          <p className="text-xs text-slate-500">Sign up for a customer profile. Fill in your details below.</p>
        </div>

        {pendingNotice ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-emerald-900 text-base">Registration Submitted!</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your customer account details have been recorded. Once approved by an admin, you will be able to sign in and book services.
            </p>
            <Link
              to="/login"
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow inline-block"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rohan Mehta"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rohan@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition"
            >
              {submitting ? 'Submitting Application...' : 'Register Customer Account'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
