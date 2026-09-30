import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  Clock,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Star,
  DollarSign,
  ShoppingBag,
  Calendar,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function MerchantDashboard() {
  const { merchant, fetchMe } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Service Form Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    categoryId: '',
    customCategory: '',
    description: '',
    price: '',
    durationMinutes: 60,
    image: '',
    status: 'ACTIVE'
  });

  // Business Profile Form
  const [profileForm, setProfileForm] = useState({
    businessName: merchant?.business_name || '',
    description: merchant?.description || '',
    phone: merchant?.phone || '',
    address: merchant?.address || '',
    city: merchant?.city || 'Bengaluru',
    state: merchant?.state || 'Karnataka',
    pincode: merchant?.pincode || '560001',
    logo: merchant?.logo || '',
    coverImage: merchant?.cover_image || ''
  });

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const [srvRes, ordRes, availRes, catRes] = await Promise.all([
        api.get('/services/my/services'),
        api.get('/orders'),
        api.get('/merchants/my/availability'),
        api.get('/categories')
      ]);

      if (srvRes.success) setServices(srvRes.services || []);
      if (ordRes.success) setOrders(ordRes.orders || []);
      if (availRes.success) setAvailability(availRes.availability || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load merchant dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateService = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        const res = await api.put(`/services/${editingService.id}`, serviceForm);
        if (res.success) showSuccess('Service updated!');
      } else {
        const res = await api.post('/services', serviceForm);
        if (res.success) showSuccess('Service created successfully!');
      }
      setServiceModalOpen(false);
      setEditingService(null);
      fetchMerchantData();
    } catch (err) {
      showError(err.message || 'Failed to save service');
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await api.delete(`/services/${id}`);
      if (res.success) {
        showSuccess('Service deleted.');
        fetchMerchantData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete service');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        showSuccess(`Order status updated to ${newStatus}`);
        fetchMerchantData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update order status');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/merchants/my/profile', profileForm);
      if (res.success) {
        showSuccess('Business profile updated!');
        fetchMe();
      }
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    }
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/merchants/my/availability', { schedule: availability });
      if (res.success) {
        showSuccess('Working hours schedule updated!');
        fetchMerchantData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update schedule');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => (o.payment_status === 'PAID' ? sum + o.total_amount : sum), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Merchant Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-teal-600/30 overflow-hidden">
            {merchant?.logo ? <img src={merchant.logo} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{merchant?.business_name || 'My Storefront'}</h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${merchant?.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {merchant?.status}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">Merchant Provider SaaS Dashboard</p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingService(null);
            setServiceForm({ name: '', categoryId: categories[0]?.id || '', description: '', price: '', durationMinutes: 60, image: '', status: 'ACTIVE' });
            setServiceModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">₹{totalRevenue}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Bookings</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{pendingOrders.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Orders</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{completedOrders.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-1">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>{merchant?.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'services' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          My Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Working Hours
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Business Profile
        </button>
      </div>

      {/* Tab 1: Orders Lifecycle Manager */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
              No customer bookings received yet.
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">#{o.order_number} - {o.service_name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {o.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Customer: <strong>{o.customer_user_name || o.customer_name}</strong> ({o.customer_email})</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Date: <strong>{o.booking_date}</strong> at <strong>{o.booking_time}</strong></span>
                    <span>•</span>
                    <span className="font-bold text-emerald-600">₹{o.total_amount} ({o.payment_status})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {o.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleOrderStatusUpdate(o.id, 'CONFIRMED')} className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
                        Accept Booking
                      </button>
                      <button onClick={() => handleOrderStatusUpdate(o.id, 'REJECTED')} className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl">
                        Reject
                      </button>
                    </>
                  )}
                  {o.status === 'CONFIRMED' && (
                    <button onClick={() => handleOrderStatusUpdate(o.id, 'COMPLETED')} className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Service CRUD */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-2">
                <img src={s.image || 'https://picsum.photos/seed/service/400/250'} alt={s.name} className="w-full h-36 object-cover rounded-xl" />
                <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                <div className="font-extrabold text-slate-900 text-lg">₹{s.price} <span className="text-xs font-normal text-slate-400">({s.duration_minutes} mins)</span></div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingService(s);
                    setServiceForm({ name: s.name, categoryId: s.category_id, description: s.description, price: s.price, durationMinutes: s.duration_minutes, image: s.image, status: s.status });
                    setServiceModalOpen(true);
                  }}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDeleteService(s.id)} className="text-xs font-bold text-rose-600 flex items-center gap-1 hover:underline">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Working Hours Schedule Editor */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleUpdateAvailability} className="bg-white rounded-2xl p-6 border border-slate-200 max-w-xl space-y-4">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Configure Provider Operating Hours</h3>
          {availability.map((item, idx) => (
            <div key={item.day_of_week} className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 w-24">{daysOfWeek[item.day_of_week]}</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(item.is_open)}
                  onChange={(e) => {
                    const copy = [...availability];
                    copy[idx].is_open = e.target.checked ? 1 : 0;
                    setAvailability(copy);
                  }}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-600">{item.is_open ? 'Open' : 'Closed'}</span>
              </label>

              {item.is_open ? (
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    value={item.open_time}
                    onChange={(e) => {
                      const copy = [...availability];
                      copy[idx].open_time = e.target.value;
                      setAvailability(copy);
                    }}
                    className="p-1 border border-slate-300 rounded text-xs"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={item.close_time}
                    onChange={(e) => {
                      const copy = [...availability];
                      copy[idx].close_time = e.target.value;
                      setAvailability(copy);
                    }}
                    className="p-1 border border-slate-300 rounded text-xs"
                  />
                </div>
              ) : (
                <span className="text-slate-400 italic">Day Off</span>
              )}
            </div>
          ))}

          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
            Save Operating Hours
          </button>
        </form>
      )}

      {/* Tab 4: Business Profile Editor */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl p-6 border border-slate-200 max-w-xl space-y-4">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Edit Business Storefront Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Name</label>
              <input
                type="text"
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Description</label>
              <textarea
                rows={3}
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Address Line</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
            Save Business Profile
          </button>
        </form>
      )}

      {/* Service CRUD Modal */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-slide-up space-y-4">
            <button onClick={() => setServiceModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg">{editingService ? 'Edit Service' : 'Add New Service'}</h3>

            <form onSubmit={handleCreateOrUpdateService} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Title</label>
                <input
                  type="text"
                  placeholder="e.g. Deep Sofa Cleaning"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={serviceForm.categoryId}
                  onChange={(e) => setServiceForm({ ...serviceForm, categoryId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  <option value="other">+ Others (Enter Manually)</option>
                </select>
              </div>

              {serviceForm.categoryId === 'other' && (
                <div className="bg-teal-50/70 border border-teal-200 p-3 rounded-xl animate-fade-in">
                  <label className="font-bold text-teal-900 block mb-1 text-xs">
                    Custom Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Appliance Repair, Photography, Custom Painting..."
                    value={serviceForm.customCategory || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, customCategory: e.target.value })}
                    className="w-full p-2 bg-white border border-teal-300 rounded-lg text-xs font-medium text-teal-900 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    placeholder="1499"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain what is included in this service..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setServiceModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
