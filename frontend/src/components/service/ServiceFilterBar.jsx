import React from 'react';
import { Search, Filter, X, RotateCcw, MapPin, Star, ArrowUpDown, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ServiceFilterBar({
  filters,
  setFilters,
  categories,
  onReset,
  totalResults
}) {
  const { t } = useLanguage();

  const handleCategoryClick = (catName) => {
    setFilters((prev) => ({
      ...prev,
      category_name: prev.category_name === catName ? 'all' : catName
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-200/80 mb-6 space-y-5">
      {/* Top Search Bar & Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Filter Input */}
        <div className="relative w-full md:w-56">
          <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" />
          <input
            type="text"
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
            placeholder={t('filterByArea')}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          />
        </div>

        {/* Sorting Dropdown */}
        <div className="relative w-full md:w-52 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort_by: e.target.value }))}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition cursor-pointer"
          >
            <option value="recommended">{t('recommended')}</option>
            <option value="rating_desc">{t('ratingHighLow')}</option>
            <option value="price_asc">{t('priceLowHigh')}</option>
            <option value="price_desc">{t('priceHighLow')}</option>
          </select>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" /> {t('categories')}
          </span>
          {filters.category_name !== 'all' && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, category_name: 'all' }))}
              className="text-blue-600 hover:underline capitalize"
            >
              ({filters.category_name})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, category_name: 'all' }))}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              filters.category_name === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category_name.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                {cat.service_count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {cat.service_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Range & Rating Controls */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Price Range Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('minPrice')} / {t('maxPrice')} (₹ INR)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={t('minPrice')}
              value={filters.min_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, min_price: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              placeholder={t('maxPrice')}
              value={filters.max_price}
              onChange={(e) => setFilters((prev) => ({ ...prev, max_price: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rating</label>
          <div className="flex items-center gap-1.5">
            {[0, 4, 4.5, 4.8].map((stars) => (
              <button
                key={stars}
                onClick={() => setFilters((prev) => ({ ...prev, min_rating: prev.min_rating === stars ? 0 : stars }))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                  filters.min_rating === stars
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                {stars === 0 ? 'Any' : `${stars}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Result Counter & Reset Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-4">
          <span className="text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg">
            {totalResults} services
          </span>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
