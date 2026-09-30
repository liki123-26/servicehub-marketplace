import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ServiceFilterBar from '../components/service/ServiceFilterBar';
import ServiceCard from '../components/service/ServiceCard';
import ServiceDetailModal from '../components/service/ServiceDetailModal';
import { SearchX, Sparkles } from 'lucide-react';

export default function ServiceDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category_name: searchParams.get('category_name') || 'all',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    city: searchParams.get('city') || '',
    min_rating: parseFloat(searchParams.get('min_rating')) || 0,
    sort_by: searchParams.get('sort_by') || 'recommended'
  });

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);

  // Load Categories once
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Real-time Service Search & Filtering fetch
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category_name && filters.category_name !== 'all') params.category_name = filters.category_name;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.city) params.city = filters.city;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      if (filters.sort_by) params.sort_by = filters.sort_by;

      const res = await api.get('/services', { params });
      if (res.success) {
        setServices(res.services || []);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 200); // 200ms debounced real-time filter update

    return () => clearTimeout(timer);
  }, [fetchServices]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category_name: 'all',
      min_price: '',
      max_price: '',
      city: '',
      min_rating: 0,
      sort_by: 'recommended'
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-teal-500" /> Service Marketplace Discovery
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Services & Providers
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time search across verified service merchants, prices, and locations.
        </p>
      </div>

      {/* Real-time Filter Bar */}
      <ServiceFilterBar
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onReset={handleResetFilters}
        totalResults={services.length}
      />

      {/* Results Grid / Loading / Empty State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 animate-pulse">
              <div className="h-40 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Services Match Your Filters</h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
            We couldn't find any active services matching your search criteria or price range. Try broadening your filter parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBookNow={(s) => setSelectedService(s)}
            />
          ))}
        </div>
      )}

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
