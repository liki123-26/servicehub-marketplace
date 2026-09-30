import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Calendar,
  CheckCircle,
  Star,
  ArrowRight,
  UserCheck,
  Scissors,
  Car,
  Dumbbell,
  Dog,
  Camera,
  BookOpen,
  Heart,
  Store
} from 'lucide-react';
import api from '../services/api';
import ServiceCard from '../components/service/ServiceCard';
import MerchantCard from '../components/service/MerchantCard';
import ServiceDetailModal from '../components/service/ServiceDetailModal';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [categories, setCategories] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [featuredMerchants, setFeaturedMerchants] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [catRes, serviceRes, merchantRes] = await Promise.all([
        api.get('/categories'),
        api.get('/services?sort_by=rating_desc'),
        api.get('/merchants')
      ]);

      if (catRes.success) setCategories(catRes.categories || []);
      if (serviceRes.success) setPopularServices((serviceRes.services || []).slice(0, 6));
      if (merchantRes.success) setFeaturedMerchants((merchantRes.merchants || []).slice(0, 4));
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold mb-6">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>{t('brandName')} - {t('tagline')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mt-5 leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-8 bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/20"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>{t('exploreServices')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t('popularCategories')}</h2>
            </div>
            <Link
              to="/services"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t('allCategories')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category_name=${encodeURIComponent(cat.name)}`}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all duration-200 group flex flex-col items-center text-center space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('topRatedServices')}</h2>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>{t('exploreServices')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookNow={(s) => setSelectedService(s)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Merchants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{t('kycVerified')}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredMerchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      </section>

      {/* Partner CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{t('partnerCtaTitle')}</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">{t('partnerCtaDesc')}</p>
          </div>
          <Link
            to="/merchant/register"
            className="px-6 py-3.5 bg-teal-500 hover:bg-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition whitespace-nowrap shrink-0"
          >
            {t('becomePartnerBtn')}
          </Link>
        </div>
      </section>

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
