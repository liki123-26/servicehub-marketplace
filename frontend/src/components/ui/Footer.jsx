import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, CreditCard, Clock, Heart, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Service<span className="text-teal-400">Hub</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              India's premier multi-vendor marketplace connecting customers with verified local service professionals, salons, repair technicians, and fitness experts.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> {t('kycVerified')}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-4 h-4 text-blue-400" /> Razorpay Secured
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">{t('exploreServices')}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/services?category_name=Cleaning" className="hover:text-white transition">Home Cleaning</Link></li>
              <li><Link to="/services?category_name=Beauty" className="hover:text-white transition">Salon & Spa</Link></li>
              <li><Link to="/services?category_name=Repairs" className="hover:text-white transition">Plumbing & Repairs</Link></li>
              <li><Link to="/services?category_name=Automotive" className="hover:text-white transition">Car Wash & Detailing</Link></li>
              <li><Link to="/services?category_name=Fitness" className="hover:text-white transition">Fitness Trainers</Link></li>
            </ul>
          </div>

          {/* Business & Providers */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">For Business</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/merchant/register" className="text-teal-400 font-semibold hover:underline">{t('registerPartner')}</Link></li>
              <li><Link to="/login" className="hover:text-white transition">{t('login')}</Link></li>
              <li><Link to="/merchant/dashboard" className="hover:text-white transition">{t('myDashboard')}</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition">{t('adminConsole')}</Link></li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Trust & Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/terms" className="hover:text-white transition font-semibold">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition font-semibold">Privacy Policy</Link></li>
              <li><Link to="/security" className="hover:text-white transition font-semibold text-purple-400">Security Center</Link></li>
              <li className="flex items-center gap-2 pt-1"><Mail className="w-4 h-4 text-blue-400 shrink-0" /> support@servicehub.in</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ServiceHub Technologies Pvt. Ltd. {t('footerRights')}
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-slate-300 transition">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
            <Link to="/security" className="hover:text-slate-300 transition">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
