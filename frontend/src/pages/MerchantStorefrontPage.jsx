import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Store,
  Calendar,
  Wrench,
  User
} from 'lucide-react';
import api from '../services/api';
import ServiceCard from '../components/service/ServiceCard';
import ServiceDetailModal from '../components/service/ServiceDetailModal';

export default function MerchantStorefrontPage() {
  const { id } = useParams();
  const [merchantData, setMerchantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    fetchMerchantDetails();
  }, [id]);

  const fetchMerchantDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/merchants/${id}`);
      if (res.success) {
        setMerchantData(res);
      }
    } catch (err) {
      console.error('Failed to fetch merchant details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-60 bg-slate-200 rounded-3xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!merchantData?.merchant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Merchant Storefront Not Found</h2>
        <p className="text-slate-500 text-sm">The requested service provider could not be found.</p>
        <Link to="/services" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl inline-block">
          Explore Services
        </Link>
      </div>
    );
  }

  const { merchant, services = [], availability = [], reviews = [] } = merchantData;
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-8 pb-16">
      {/* Cover Banner & Storefront Header */}
      <div className="relative bg-white border-b border-slate-200 pb-6">
        <div className="h-64 sm:h-80 w-full bg-slate-900 overflow-hidden">
          <img
            src={merchant.cover_image || 'https://picsum.photos/seed/cover/1200/500'}
            alt={merchant.business_name}
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-4">
            {/* Logo & Storefront Title */}
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-1.5 shadow-2xl border-2 border-white overflow-hidden shrink-0">
                <img
                  src={merchant.logo || 'https://picsum.photos/seed/logo/200/200'}
                  alt={merchant.business_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {merchant.business_name}
                  </h1>
                  <CheckCircle className="w-5 h-5 text-teal-600" title="Verified Merchant" />
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md font-bold">
                    {merchant.category_name || 'Service Provider'}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    {merchant.rating?.toFixed(1) || '5.0'} ({merchant.review_count || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{merchant.address}, {merchant.city}, {merchant.state} - {merchant.pincode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{merchant.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Verified Service Merchant Partner</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
              activeTab === 'services' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
              activeTab === 'hours' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Working Hours
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-bold text-xs rounded-xl transition ${
              activeTab === 'reviews' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-6">
          {activeTab === 'services' && (
            <div>
              {services.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                  No active services published yet by this provider.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((s) => (
                    <ServiceCard key={s.id} service={s} onBookNow={(srv) => setSelectedService(srv)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-md space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-blue-600" /> Opening Schedule
              </h3>
              {availability.map((day) => (
                <div key={day.day_of_week} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                  <span className="font-semibold text-slate-700">{daysOfWeek[day.day_of_week]}</span>
                  {day.is_open ? (
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {day.open_time} - {day.close_time}
                    </span>
                  ) : (
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              {reviews.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
                  No customer reviews submitted yet.
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {r.customer_name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{r.customer_name}</div>
                          <div className="text-[10px] text-slate-400">Booked {r.service_name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs italic leading-relaxed pt-1">
                      "{r.comment || 'Great service quality!'}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
