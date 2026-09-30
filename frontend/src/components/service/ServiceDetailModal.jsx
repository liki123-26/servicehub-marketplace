import React, { useState } from 'react';
import { X, Clock, MapPin, Star, ShieldCheck, ShoppingCart, CheckCircle } from 'lucide-react';
import TimeSlotPicker from './TimeSlotPicker';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function ServiceDetailModal({ service, onClose }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!service) return null;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(service.price);

  const handleAddToCart = async () => {
    if (!user) {
      showError('Please sign in or use a demo account to book services.');
      navigate('/login');
      return;
    }

    if (user.role !== 'CUSTOMER') {
      showError('Only Customer accounts can book services. Switch to Customer account via Demo Accounts menu.');
      return;
    }

    if (!selectedDate || !selectedTime) {
      showError('Please choose a valid appointment date and time slot.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await addToCart(service.id, selectedDate, selectedTime);
      if (res?.success) {
        showSuccess('Service added to cart!');
        onClose();
        navigate('/cart');
      }
    } catch (err) {
      showError(err.message || 'Failed to add service to cart');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 relative animate-slide-up max-h-[90vh] flex flex-col">
        {/* Banner Header */}
        <div className="relative h-44 w-full bg-slate-100 shrink-0">
          <img
            src={service.image || 'https://picsum.photos/seed/detail/600/400'}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white p-1.5 rounded-full backdrop-blur-sm transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow">
            {service.category_name}
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
              <span>{service.business_name}</span>
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            </div>

            <h2 className="font-extrabold text-slate-900 text-xl leading-snug">
              {service.name}
            </h2>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 mt-2">
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                {service.merchant_rating?.toFixed(1) || '5.0'} ({service.merchant_review_count || 0} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-4 h-4" />
                {service.duration_minutes} minutes
              </span>
            </div>

            <p className="text-slate-600 text-xs mt-3 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Time Slot Selector */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">Book Your Appointment</h3>
            <TimeSlotPicker
              merchantId={service.merchant_id}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
            />
          </div>
        </div>

        {/* Modal Sticky Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Fee</div>
            <div className="font-extrabold text-slate-900 text-xl">
              {formattedPrice}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedTime || submitting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
              !selectedTime || submitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{submitting ? 'Adding...' : 'Add to Cart & Checkout'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
