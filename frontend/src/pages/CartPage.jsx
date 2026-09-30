import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Calendar, Clock, ArrowRight, ShieldCheck, Store, Wrench } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cart.total || 0);
  const formattedSubtotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cart.subtotal || 0);
  const formattedTax = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cart.tax || 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Explore top-rated local service professionals and book your appointment.
        </p>
        <Link
          to="/services"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg inline-block transition"
        >
          Explore Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-slate-500 text-xs mt-1">Review your service appointment summary before checkout</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items Column */}
        <div className="md:col-span-2 space-y-4">
          {/* Merchant Header */}
          {cart.merchant && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-sm border border-slate-200 shrink-0">
                  <img src={cart.merchant.logo || 'https://picsum.photos/seed/logo/200/200'} alt={cart.merchant.business_name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{cart.merchant.business_name}</div>
                  <div className="text-slate-500 text-xs">{cart.merchant.city || 'Bengaluru'}</div>
                </div>
              </div>
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          )}

          {/* Items List */}
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={item.service_image || 'https://picsum.photos/seed/item/200/200'}
                    alt={item.service_name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.service_name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-600" /> {item.booking_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> {item.booking_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="font-extrabold text-slate-900 text-lg">
                    ₹{item.price}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Pricing Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6 h-fit">
          <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">Payment Summary</h3>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between text-slate-600">
              <span>Service Subtotal</span>
              <span className="text-slate-900 font-bold">{formattedSubtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Tax (5%)</span>
              <span className="text-slate-900 font-bold">{formattedTax}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Fee</span>
              <span className="text-teal-600 font-bold">FREE</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm text-slate-900 font-extrabold">
              <span>Total Amount</span>
              <span className="text-blue-600 text-xl">{formattedTotal}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-teal-600" /> Guaranteed appointment & payment security
          </div>
        </div>
      </div>
    </div>
  );
}
