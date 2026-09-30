import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ServiceCard({ service, onBookNow }) {
  const { t } = useLanguage();

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(service.price);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={service.image || 'https://picsum.photos/seed/service/600/400'}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
          {service.category_name}
        </span>
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{service.merchant_rating?.toFixed(1) || '5.0'}</span>
          <span className="text-slate-400 font-normal text-[10px]">({service.merchant_review_count || 0})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
            <span className="truncate text-slate-700 font-bold hover:underline">
              {service.business_name}
            </span>
            <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" title={t('kycVerified')} />
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>

          <p className="text-slate-500 text-xs line-clamp-2 mt-1.5 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Metadata & Footer Price / Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {service.duration_minutes} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate max-w-[110px]">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {service.city || 'Bengaluru'}
              </span>
            </div>
            <div className="font-extrabold text-slate-900 text-lg tracking-tight">
              {formattedPrice}
            </div>
          </div>

          <button
            onClick={() => onBookNow(service)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-1.5 transition-all"
          >
            <span>{t('bookNow')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
