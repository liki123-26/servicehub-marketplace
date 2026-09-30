import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, MapPin, Plus, CheckCircle, Lock, Sparkles, Building2, User, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Address form fields
  const [newAddr, setNewAddr] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001'
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      if (res.success) {
        setAddresses(res.addresses || []);
        const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', { ...newAddr, isDefault: true });
      if (res.success) {
        showSuccess('New address saved!');
        setShowAddressForm(false);
        fetchAddresses();
      }
    } catch (err) {
      showError(err.message || 'Failed to save address');
    }
  };

  const handlePayAndConfirm = async () => {
    if (!selectedAddressId && addresses.length === 0) {
      showError('Please add a delivery/service address before paying.');
      setShowAddressForm(true);
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Create Payment Order on Backend
      const orderRes = await api.post('/payments/create', {
        addressId: selectedAddressId,
        customerName: user.name,
        customerPhone: user.phone
      });

      if (!orderRes.success) {
        showError(orderRes.message || 'Payment initiation failed.');
        setSubmitting(false);
        return;
      }

      // Step 2: Verification (Simulated Sandbox or Real Razorpay SDK)
      const verifyRes = await api.post('/payments/verify', {
        orderId: orderRes.orderId,
        razorpay_order_id: orderRes.razorpayOrderId,
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        simulatedSuccess: true
      });

      if (verifyRes.success) {
        await fetchCart();
        showSuccess('Payment verified! Booking confirmed.');
        navigate(`/orders/confirmation/${verifyRes.orderId}`);
      }
    } catch (err) {
      showError(err.message || 'Payment verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cart.total || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Step Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-teal-500" /> Secure Checkout Flow
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout & Confirm Booking</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Details Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Service & Appointment Recap */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle className="w-4 h-4 text-blue-600" /> Service Appointment Summary
            </h3>

            {cart.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{item.service_name}</div>
                  <div className="text-slate-500 font-medium">Provider: {cart.merchant?.business_name}</div>
                  <div className="text-blue-600 font-semibold mt-0.5">
                    Date: {item.booking_date} at {item.booking_time}
                  </div>
                </div>
                <div className="font-extrabold text-slate-900 text-sm">₹{item.price}</div>
              </div>
            ))}
          </div>

          {/* Service Address Selection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Service Location Address
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address
              </button>
            </div>

            {/* Address List */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedAddressId === addr.id
                        ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-slate-900">{addr.name} ({addr.phone})</div>
                        <div className="text-slate-600">{addr.address_line}, {addr.city}, {addr.state} - {addr.pincode}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Address Add Form */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line / House No / Street"
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                  required
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Payment Method Notice */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
              <CreditCard className="w-4 h-4" /> Razorpay Payment Gateway (Test/Sandbox Ready)
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Razorpay HMAC SHA256 signature verification endpoints are active. Operating in Sandbox Demo mode for instant verification without needing live API keys.
            </p>
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6 h-fit">
          <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">Final Payment</h3>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="text-slate-900">₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5%)</span>
              <span className="text-slate-900">₹{cart.tax}</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm text-slate-900 font-extrabold">
              <span>Total Payable</span>
              <span className="text-blue-600 text-2xl">{formattedTotal}</span>
            </div>
          </div>

          <button
            onClick={handlePayAndConfirm}
            disabled={submitting}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            <Lock className="w-4 h-4" />
            <span>{submitting ? 'Verifying Payment...' : `Pay ${formattedTotal} & Confirm`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
