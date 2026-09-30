import React, { useState, useEffect } from 'react';
import {
  Layers,
  Users,
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  ShoppingBag,
  ShieldAlert,
  UserCheck,
  X,
  CreditCard,
  FileText,
  ShieldCheck,
  Building,
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('pending-merchants');
  const [stats, setStats] = useState({});
  const [merchants, setMerchants] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: 'Wrench', image: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, merchRes, userRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/merchants'),
        api.get('/admin/users'),
        api.get('/categories')
      ]);

      if (statsRes.success) setStats(statsRes.stats || {});
      if (merchRes.success) setMerchants(merchRes.merchants || []);
      if (userRes.success) setUsers(userRes.users || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMerchantStatus = async (merchantId, status, forceApprove = false) => {
    try {
      const res = await api.put(`/admin/merchants/${merchantId}/status`, { status, forceApprove });
      if (res.success) {
        showSuccess(`Merchant profile updated to ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      if (err.kycFailed) {
        showError(err.message);
      } else {
        showError(err.message || 'Failed to update merchant status');
      }
    }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status });
      if (res.success) {
        showSuccess(`User account updated to ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to update user status');
    }
  };

  const handleVerifyDoc = async (docType, docValue, merchant) => {
    try {
      const res = await api.post('/admin/verify-kyc', {
        type: 'MERCHANT',
        panNumber: docType === 'PAN' ? docValue : merchant.pan_number,
        licenseNumber: docType === 'GSTIN' ? docValue : merchant.license_number,
        ifscCode: docType === 'IFSC' ? docValue : merchant.ifsc_code
      });

      if (res.success) {
        let docReport = null;
        if (docType === 'PAN') docReport = res.report?.pan;
        if (docType === 'GSTIN') docReport = res.report?.gstin;
        if (docType === 'IFSC') docReport = res.report?.ifsc;

        if (docReport && docReport.valid) {
          showSuccess(`✅ Official ${docType} Verification PASSED: ${docReport.message}`);
        } else {
          showError(`❌ Official ${docType} Verification FAILED: ${docReport?.message || 'Invalid format'}`);
        }
        fetchAdminData();
      }
    } catch (err) {
      showError(err.message || `Failed to verify ${docType}`);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory.id}`, catForm);
        if (res.success) showSuccess('Category updated!');
      } else {
        const res = await api.post('/categories', catForm);
        if (res.success) showSuccess('New Category created!');
      }
      setCategoryModalOpen(false);
      setEditingCategory(null);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Deactivate this category?')) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.success) {
        showSuccess(res.message);
        fetchAdminData();
      }
    } catch (err) {
      showError(err.message || 'Failed to delete category');
    }
  };

  const pendingCustomers = users.filter((u) => u.role === 'CUSTOMER' && u.status === 'PENDING');
  const pendingMerchants = merchants.filter((m) => m.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">ServiceHub Admin Console</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Official Government KYC Engine (Income Tax NSDL PAN, GST Portal GSTIN, RBI IFSC Validation) & Marketplace Oversight
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setCatForm({ name: '', description: '', icon: 'Wrench', image: '' });
            setCategoryModalOpen(true);
          }}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹{stats.totalRevenue || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Partner KYC</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{pendingMerchants.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Customers</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCustomers.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Partners</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{stats.totalMerchants || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalCustomers || 0}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending-merchants')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'pending-merchants' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Pending Partner KYC ({pendingMerchants.length})
        </button>
        <button
          onClick={() => setActiveTab('pending-customers')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'pending-customers' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Pending Customers ({pendingCustomers.length})
        </button>
        <button
          onClick={() => setActiveTab('merchants')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'merchants' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          All Partners ({merchants.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'categories' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-bold text-xs rounded-xl transition whitespace-nowrap ${activeTab === 'users' ? 'bg-purple-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          Users Registry ({users.length})
        </button>
      </div>

      {/* TAB 1: Partner KYC Verification Queue */}
      {activeTab === 'pending-merchants' && (
        <div className="space-y-4">
          {pendingMerchants.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending business partner applications. All PAN, Trade License, and IFSC details verified against official government standards.
            </div>
          ) : (
            pendingMerchants.map((m) => {
              const kyc = m.kyc_report || {};
              const panValid = kyc.pan?.valid;
              const gstinValid = kyc.gstin?.valid;
              const ifscValid = kyc.ifsc?.valid;
              const canApprove = panValid && gstinValid && ifscValid;

              return (
                <div key={m.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-lg">{m.business_name}</span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          PENDING GOVERNMENT KYC CHECK
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">Owner: <strong>{m.owner_name}</strong> ({m.owner_email} • {m.phone || 'N/A'})</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email: {m.owner_email}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" /> Phone: {m.phone || 'Provided'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateMerchantStatus(m.id, 'APPROVED')}
                        className="px-5 py-2.5 font-extrabold text-xs rounded-xl shadow transition bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Approve Partner
                      </button>
                      <button
                        onClick={() => handleUpdateMerchantStatus(m.id, 'REJECTED')}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition"
                      >
                        Reject Application
                      </button>
                    </div>
                  </div>

                  {/* Official Government Verification Status Pills */}
                  <div className="space-y-3">
                    <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <span>Official Government Verification Report</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* PAN Check Result */}
                      <div className={`rounded-2xl p-4 border text-xs space-y-2 flex flex-col justify-between ${panValid ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800">NSDL Income Tax PAN</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${panValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {panValid ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-slate-900 mt-1">{m.pan_number || 'Not Provided'}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{kyc.pan?.message || 'Syntax & Entity validation'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifyDoc('PAN', m.pan_number, m)}
                          className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1 mt-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Verify PAN Card
                        </button>
                      </div>

                      {/* GSTIN Check Result */}
                      <div className={`rounded-2xl p-4 border text-xs space-y-2 flex flex-col justify-between ${gstinValid ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800">GST Portal Trade License</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${gstinValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {gstinValid ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-slate-900 mt-1">{m.license_number || 'Not Provided'}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{kyc.gstin?.message || '15-digit GSTIN checksum & state code'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifyDoc('GSTIN', m.license_number, m)}
                          className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1 mt-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Verify Trade License / GSTIN
                        </button>
                      </div>

                      {/* RBI IFSC Check Result */}
                      <div className={`rounded-2xl p-4 border text-xs space-y-2 flex flex-col justify-between ${ifscValid ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800">RBI Bank IFSC Code</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${ifscValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                              {ifscValid ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div className="font-mono font-bold text-slate-900 mt-1">{m.ifsc_code || 'Not Provided'}</div>
                          <p className="text-[11px] text-slate-600 mt-0.5">{kyc.ifsc?.message || '11-character RBI branch code'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleVerifyDoc('IFSC', m.ifsc_code, m)}
                          className="w-full py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-lg shadow-sm flex items-center justify-center gap-1 mt-2"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Verify Bank IFSC Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Customer Verification Queue */}
      {activeTab === 'pending-customers' && (
        <div className="space-y-4">
          {pendingCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
              <UserCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending customer verification applications. All customer sign-ups have been verified.
            </div>
          ) : (
            pendingCustomers.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">{u.name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      PENDING APPROVAL
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Email: <strong>{u.email}</strong> • Phone: {u.phone || 'N/A'}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Registered: {new Date(u.created_at).toLocaleString('en-IN')}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateUserStatus(u.id, 'APPROVED')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    Approve Customer
                  </button>
                  <button
                    onClick={() => handleUpdateUserStatus(u.id, 'REJECTED')}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: All Partners */}
      {activeTab === 'merchants' && (
        <div className="space-y-4">
          {merchants.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-base">{m.business_name}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${m.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {m.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Owner: {m.owner_name} ({m.owner_email}) • PAN: {m.pan_number || 'N/A'} • IFSC: {m.ifsc_code || 'N/A'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {m.status !== 'APPROVED' && (
                  <button onClick={() => handleUpdateMerchantStatus(m.id, 'APPROVED', true)} className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">
                    Approve
                  </button>
                )}
                {m.status !== 'SUSPENDED' && (
                  <button onClick={() => handleUpdateMerchantStatus(m.id, 'SUSPENDED')} className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl">
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">{c.name}</h3>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                <div className="text-[11px] text-slate-400 font-semibold mt-2">{c.service_count || 0} associated services</div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setEditingCategory(c);
                    setCatForm({ name: c.name, description: c.description, icon: c.icon || 'Wrench', image: c.image || '' });
                    setCategoryModalOpen(true);
                  }}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDeleteCategory(c.id)} className="text-xs font-bold text-rose-600 flex items-center gap-1 hover:underline">
                  <Trash2 className="w-3.5 h-3.5" /> Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: Users Registry */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold">#{u.id}</td>
                  <td className="p-3.5 font-extrabold">{u.name}</td>
                  <td className="p-3.5 text-slate-600">{u.email}</td>
                  <td className="p-3.5 text-slate-500">{u.phone || 'N/A'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'MERCHANT' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : u.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {u.role !== 'ADMIN' && u.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateUserStatus(u.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg shadow"
                      >
                        Approve
                      </button>
                    )}
                    {u.role !== 'ADMIN' && u.status !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleUpdateUserStatus(u.id, 'SUSPENDED')}
                        className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-[11px] rounded-lg"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-slide-up space-y-4">
            <button onClick={() => setCategoryModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 text-lg">{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Home Cleaning"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Short summary of services under this category..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl shadow">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
