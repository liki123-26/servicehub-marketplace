import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, CheckCircle, Store, ArrowRight } from 'lucide-react';

export default function MerchantCard({ merchant }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Cover Image & Logo Overlay */}
      <div className="relative h-32 w-full bg-slate-200">
        <img
          src={merchant.cover_image || 'https://picsum.photos/seed/cover/800/400'}
          alt={merchant.business_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute -bottom-5 left-5 w-14 h-14 rounded-2xl bg-white p-1 shadow-md border border-slate-100 overflow-hidden">
          <img
            src={merchant.logo || 'https://picsum.photos/seed/logo/200/200'}
            alt={merchant.business_name}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      <div className="pt-7 p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate group-hover:text-blue-600 transition-colors">
              {merchant.business_name}
            </h3>
            <span className="flex items-center gap-1 bg-amber-50 text-amber-700 font-bold text-xs px-2 py-0.5 rounded-md shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {merchant.rating?.toFixed(1) || '5.0'}
            </span>
          </div>

          <p className="text-xs font-semibold text-teal-600 mt-0.5">
            {merchant.category_name || 'Service Provider'}
          </p>

          <p className="text-slate-500 text-xs line-clamp-2 mt-2 leading-relaxed">
            {merchant.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium truncate max-w-[140px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{merchant.city || 'Bengaluru'}</span>
          </div>

          <Link
            to={`/merchants/${merchant.id}`}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
          >
            <span>Storefront</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
