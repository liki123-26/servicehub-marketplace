import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, Home, Receipt } from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.success) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-8 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full mb-2">
            Payment Verified & Booking Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">Booking Confirmed!</h1>
          <p className="text-slate-500 text-xs mt-1">
            Order <strong className="text-slate-900">#{order?.order_number || 'SH1001'}</strong> has been created and sent to provider.
          </p>
        </div>

        {/* Order Card */}
        {order && (
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 text-xs">
            <div className="font-extrabold text-slate-900 text-base border-b border-slate-200 pb-2">
              {order.service_name}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Service Provider</span>
              <span className="font-bold text-slate-900">{order.business_name}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Scheduled Date</span>
              <span className="font-bold text-blue-600 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {order.booking_date}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Time Slot</span>
              <span className="font-bold text-teal-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {order.booking_time}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-600">₹{order.total_amount}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/customer/orders"
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            <span>View My Bookings</span>
          </Link>
          <Link
            to="/"
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
