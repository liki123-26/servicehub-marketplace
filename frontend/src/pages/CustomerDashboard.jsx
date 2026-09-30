import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Plus,
  Building2,
  Bell,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Store,
  Edit,
  Trash2,
  Check,
  Lock,
  Mail,
  Phone,
  FileText,
  Save
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CustomerDashboard() {
  const { user, customerProfile, fetchMe } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address Modal / Form state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressLine: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: false
  });

  // Personal Details Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    bio: customerProfile?.bio || '',
    password: ''
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Review Modal state
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        bio: customerProfile?.bio || '',
        password: ''
      });
    }
  }, [user, customerProfile]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [orderRes, addrRes, notifRes] = await Promise.all([
        api.get('/orders'),
        api.get('/addresses'),
        api.get('/notifications')
      ]);

      if (orderRes.success) setOrders(orderRes.orders || []);
      if (addrRes.success) setAddresses(addrRes.addresses || []);
      if (notifRes.success) setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Profile Details Save Handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileSubmitting(true);
      const res = await api.put('/auth/profile', profileForm);
      if (res.success) {
        showSuccess('Personal details updated successfully!');
        await fetchMe();
      }
    } catch (err) {
      showError(err.message || 'Failed to update personal details');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Address Save Handler (Create or Update)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        const res = await api.put(`/addresses/${editingAddress.id}`, addressForm);
        if (res.success) showSuccess('Address updated successfully!');
      } else {
        const res = await api.post('/addresses', addressForm);
        if (res.success) showSuccess('New address added!');
      }
      setAddressModalOpen(false);
      setEditingAddress(null);
      fetchCustomerData();
    } catch (err) {
      showError(err.message || 'Failed to save address');
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      const res = await api.put(`/addresses/${addrId}/default`);
      if (res.success) {
        showSuccess('Address set as default!');
        fetchCustomerData();
      }
    } catch (err) {
      showError(err.message || 'Failed to set default address');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/addresses/${addrId}`);
      if (res.success) {
        showSuccess('Address deleted.');
        fetchCustomerData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete address');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalOrder) return;

    try {
      setReviewSubmitting(true);
      const res = await api.post('/reviews', {
        orderId: reviewModalOrder.id,
        rating,
        comment
      });

      if (res.success) {
        showSuccess('Review submitted successfully!');
        setReviewModalOrder(null);
        setRating(5);
        setComment('');
        fetchCustomerData();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: 'CANCELLED' });
      if (res.success) {
        showSuccess('Booking cancelled.');
        fetchCustomerData();
      }
    } catch (err) {
      showError(err.message || 'Failed to cancel booking');
    }
  };

  const activeBookings = orders.filter((o) => ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalSpent = orders.reduce((sum, o) => (o.payment_status === 'PAID' ? sum + o.total_amount : sum), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header Greeting */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {user?.name}!</h1>
            <p className="text-slate-500 text-xs mt-0.5">{user?.email} • {user?.phone || 'No phone set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-bold">
            Customer Account
          </span>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bookings</div>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{activeBookings.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Services</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{completedOrders.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalSpent}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          My Bookings ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'addresses' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          My Addresses ({addresses.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Update Personal Details
        </button>
      </div>

      {/* TAB 1: My Bookings */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
              No orders found. Explore services to make your first booking.
            </div>
          ) : (
            orders.map((o) => {
              let badgeColor = 'bg-blue-50 text-blue-700';
              if (o.status === 'COMPLETED') badgeColor = 'bg-emerald-50 text-emerald-700';
              if (o.status === 'CANCELLED' || o.status === 'REJECTED') badgeColor = 'bg-rose-50 text-rose-700';

              return (
                <div key={o.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img src={o.service_image || 'https://picsum.photos/seed/order/200/200'} alt={o.service_name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{o.service_name}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">Provider: <strong>{o.business_name}</strong></div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-600" /> {o.booking_date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-teal-600" /> {o.booking_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                    <div className="font-extrabold text-slate-900 text-lg">₹{o.total_amount}</div>

                    {/* Review Button for COMPLETED orders */}
                    {o.status === 'COMPLETED' && !o.review_rating && (
                      <button
                        onClick={() => setReviewModalOrder(o)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    {o.review_rating && (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rated {o.review_rating}.0</span>
                      </div>
                    )}

                    {/* Cancel button for PENDING orders */}
                    {o.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(o.id)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-xl transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: My Addresses (Fully Functioning CRUD) */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Saved Service Addresses</h2>
              <p className="text-slate-500 text-xs">Manage your home, office, and secondary service locations</p>
            </div>
            <button
              onClick={() => {
                setEditingAddress(null);
                setAddressForm({
                  name: user?.name || '',
                  phone: user?.phone || '',
                  addressLine: '',
                  city: 'Bengaluru',
                  state: 'Karnataka',
                  pincode: '560001',
                  isDefault: addresses.length === 0
                });
                setAddressModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm space-y-3">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
              <p>No addresses saved yet. Click "Add New Address" to save your primary location.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between space-y-4 relative ${
                    addr.is_default ? 'border-blue-600 ring-2 ring-blue-600/10' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-base">{addr.name}</h3>
                      {addr.is_default ? (
                        <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" /> DEFAULT ADDRESS
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs text-slate-400 hover:text-blue-600 font-bold hover:underline"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {addr.phone}
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed pt-1">
                      {addr.address_line}, {addr.city}, {addr.state} - <strong className="text-slate-900">{addr.pincode}</strong>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 text-xs">
                    <button
                      onClick={() => {
                        setEditingAddress(addr);
                        setAddressForm({
                          name: addr.name,
                          phone: addr.phone,
                          addressLine: addr.address_line,
                          city: addr.city,
                          state: addr.state,
                          pincode: addr.pincode,
                          isDefault: Boolean(addr.is_default)
                        });
                        setAddressModalOpen(true);
                      }}
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="font-bold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Update Personal Details Section */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Account Details
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Update your name, contact phone number, email address, bio, and password.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 99887 76655"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">About / Bio Notes</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell service providers any special preferences or delivery notes..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-700 block mb-1">Change Password (Optional)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" />
              <span>{profileSubmitting ? 'Saving Details...' : 'Save Personal Details'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Address Add / Edit Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-slide-up space-y-4">
            <button onClick={() => setAddressModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address Line / Street</label>
                <input
                  type="text"
                  placeholder="e.g. 402, Green Park Apartments, HSR Layout"
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="font-bold text-slate-700">Set as default service address</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-slide-up space-y-4">
            <button onClick={() => setReviewModalOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg">Rate Your Service</h3>
            <p className="text-slate-500 text-xs">How was your experience for <strong>{reviewModalOrder.service_name}</strong>?</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Star Rating (1 - 5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition ${rating >= star ? 'text-amber-400 bg-amber-50' : 'text-slate-300 bg-slate-100'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Review Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the service quality, punctuality, and professionalism..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReviewModalOrder(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={reviewSubmitting} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
