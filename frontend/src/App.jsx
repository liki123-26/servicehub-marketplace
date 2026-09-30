import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import Footer from './components/ui/Footer';
import ConflictModal from './components/ui/ConflictModal';

import HomePage from './pages/HomePage';
import ServiceDiscoveryPage from './pages/ServiceDiscoveryPage';
import MerchantStorefrontPage from './pages/MerchantStorefrontPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MerchantRegisterPage from './pages/MerchantRegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SecurityPage from './pages/SecurityPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Discovery Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServiceDiscoveryPage />} />
          <Route path="/merchants/:id" element={<MerchantStorefrontPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/merchant/register" element={<MerchantRegisterPage />} />

          {/* Customer Booking & Portal */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/orders" element={<CustomerDashboard />} />
          <Route path="/customer/addresses" element={<CustomerDashboard />} />

          {/* Merchant Portal */}
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="/merchant/profile" element={<MerchantDashboard />} />

          {/* Admin Control */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Legal & Security */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/security" element={<SecurityPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ConflictModal />
    </div>
  );
}
