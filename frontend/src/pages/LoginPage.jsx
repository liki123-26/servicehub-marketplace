import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Wrench, Sparkles, User, Store, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { login, loginAsDemoCustomer, loginAsDemoMerchant, loginAsDemoAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await login(email, password);
      if (res.success) {
        showSuccess('Login successful!');
        if (res.user.role === 'ADMIN') navigate('/admin/dashboard');
        else if (res.user.role === 'MERCHANT') navigate('/merchant/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err) {
      showError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role) => {
    try {
      if (role === 'CUSTOMER') {
        await loginAsDemoCustomer();
        showSuccess('Logged in as Demo Customer!');
        navigate('/customer/dashboard');
      } else if (role === 'MERCHANT') {
        await loginAsDemoMerchant();
        showSuccess('Logged in as Demo Merchant!');
        navigate('/merchant/dashboard');
      } else if (role === 'ADMIN') {
        await loginAsDemoAdmin();
        showSuccess('Logged in as Demo Admin!');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showError('Demo login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-600/30">
            <Wrench className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign in to ServiceHub</h1>
          <p className="text-xs text-slate-500">Access your appointments, orders, and business dashboard</p>
        </div>

        {/* Demo Quick Logins */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Instant Demo Account Switcher
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-bold">
            <button
              onClick={() => handleDemoLogin('CUSTOMER')}
              className="p-2 bg-white hover:bg-blue-600 hover:text-white text-slate-700 rounded-xl shadow-sm border border-slate-200 transition flex flex-col items-center gap-1 text-[11px]"
            >
              <User className="w-4 h-4 text-blue-500" />
              <span>Customer</span>
            </button>
            <button
              onClick={() => handleDemoLogin('MERCHANT')}
              className="p-2 bg-white hover:bg-teal-600 hover:text-white text-slate-700 rounded-xl shadow-sm border border-slate-200 transition flex flex-col items-center gap-1 text-[11px]"
            >
              <Store className="w-4 h-4 text-teal-500" />
              <span>Merchant</span>
            </button>
            <button
              onClick={() => handleDemoLogin('ADMIN')}
              className="p-2 bg-white hover:bg-purple-600 hover:text-white text-slate-700 rounded-xl shadow-sm border border-slate-200 transition flex flex-col items-center gap-1 text-[11px]"
            >
              <Building2 className="w-4 h-4 text-purple-500" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register as Customer
          </Link>
          {' '}or{' '}
          <Link to="/merchant/register" className="text-teal-600 font-bold hover:underline">
            Become a Provider
          </Link>
        </div>
      </div>
    </div>
  );
}
