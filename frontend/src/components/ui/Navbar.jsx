import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Search,
  ShoppingCart,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Store,
  CheckCircle,
  Menu,
  X,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function Navbar() {
  const { user, logout, loginAsDemoCustomer, loginAsDemoMerchant, loginAsDemoAdmin } = useAuth();
  const { cart } = useCart();
  const { showSuccess, showError } = useToast();
  const { language, setLanguage, t, LANGUAGES } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const cartCount = cart.items?.length || 0;
  const activeLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      showSuccess('All notifications marked as read');
    } catch (err) {
      showError('Failed to update notifications');
    }
  };

  const handleDemoSwitch = async (role) => {
    try {
      setDemoDropdownOpen(false);
      if (role === 'CUSTOMER') {
        await loginAsDemoCustomer();
        showSuccess('Switched to Demo Customer Account');
        navigate('/customer/dashboard');
      } else if (role === 'MERCHANT') {
        await loginAsDemoMerchant();
        showSuccess('Switched to Demo Merchant Account');
        navigate('/merchant/dashboard');
      } else if (role === 'ADMIN') {
        await loginAsDemoAdmin();
        showSuccess('Switched to Demo Admin Account');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      showError('Demo login failed');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Service<span className="text-teal-600">Hub</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-bold">
            <Link
              to="/services"
              className={`transition-colors flex items-center gap-1.5 ${
                location.pathname === '/services' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-500" />
              {t('exploreServices')}
            </Link>

            <Link
              to="/merchant/register"
              className="text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-teal-200/60"
            >
              <Store className="w-3.5 h-3.5 text-teal-600" />
              {t('registerPartner')}
            </Link>

            {user?.role === 'CUSTOMER' && (
              <Link
                to="/customer/dashboard"
                className={`transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/customer') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {t('myBookings')}
              </Link>
            )}

            {user?.role === 'MERCHANT' && (
              <Link
                to="/merchant/dashboard"
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
                {t('myDashboard')}
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                {t('adminConsole')}
              </Link>
            )}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2.5">
            {/* Multilingual Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition"
                title="Select Language"
              >
                <span className="text-sm">{activeLangObj.flag}</span>
                <span className="hidden sm:inline-block">{activeLangObj.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium animate-slide-up">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Choose Language / भाषा चुनें
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 ${
                        language === lang.code ? 'font-extrabold text-blue-600 bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Demo Login Selector */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="px-2.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Demo</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium animate-slide-up">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Switch
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('CUSTOMER')}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold">Customer</div>
                      <div className="text-[10px] text-slate-400">customer@gmail.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('MERCHANT')}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Store className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-bold">UrbanGlow Partner</div>
                      <div className="text-[10px] text-slate-400">merchant@urbanglow.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-bold">Admin Console</div>
                      <div className="text-[10px] text-slate-400">admin@servicehub.com</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon */}
            {(!user || user.role === 'CUSTOMER') && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
                title={t('cart')}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                      <span className="font-bold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition ${
                              n.is_read ? 'bg-white text-slate-600' : 'bg-blue-50/50 text-slate-900 font-medium'
                            }`}
                          >
                            <div className="font-bold mb-0.5">{n.title}</div>
                            <div className="text-slate-500 leading-snug">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-medium animate-slide-up">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900">{user.name}</div>
                      <div className="text-slate-400 text-[11px] truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        {user.role}
                      </span>
                    </div>

                    {user.role === 'CUSTOMER' && (
                      <Link
                        to="/customer/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-600" />
                        {t('myDashboard')}
                      </Link>
                    )}

                    {user.role === 'MERCHANT' && (
                      <Link
                        to="/merchant/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <LayoutDashboard className="w-4 h-4 text-teal-600" />
                        {t('myDashboard')}
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                      >
                        <Layers className="w-4 h-4 text-purple-600" />
                        {t('adminConsole')}
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition"
                >
                  {t('registerCustomer')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in text-xs font-bold">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-50"
          >
            {t('exploreServices')}
          </Link>
          <Link
            to="/merchant/register"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-teal-700 bg-teal-50"
          >
            {t('registerPartner')}
          </Link>
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-slate-700 bg-slate-100 rounded-xl"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-white bg-blue-600 rounded-xl"
              >
                {t('registerCustomer')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
