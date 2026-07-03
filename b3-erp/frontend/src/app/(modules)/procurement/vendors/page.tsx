'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { vendorService } from '@/services/VendorService';

interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  status: 'Active' | 'Inactive' | 'Blacklisted';
  balance: number;
}

// Map the categorical rating labels used by the backend to a 0-5 numeric score.
const RATING_SCORE: Record<string, number> = {
  Excellent: 5,
  Good: 4,
  Fair: 3,
  Poor: 2,
  'No Rating': 0,
};

// Defensive transform from the raw API/ORM vendor shape to the page's Vendor model.
function mapVendor(raw: any): Vendor {
  const status = raw?.status;
  const normalizedStatus: Vendor['status'] =
    status === 'Active' || status === 'Inactive' || status === 'Blacklisted' ? status : 'Inactive';
  const rating =
    raw?.averageRating != null
      ? Number(raw.averageRating)
      : RATING_SCORE[raw?.overallRating as string] ?? 0;
  return {
    id: String(raw?.id ?? ''),
    code: raw?.vendorCode ?? raw?.code ?? '',
    name: raw?.vendorName ?? raw?.name ?? '',
    category: raw?.category ?? '',
    contactPerson: raw?.contactPerson ?? '',
    email: raw?.email ?? '',
    phone: raw?.phone ?? '',
    rating: Number(rating ?? 0),
    status: normalizedStatus,
    balance: Number(raw?.outstandingPayables ?? raw?.balance ?? 0),
  };
}

export default function VendorManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = (await vendorService.getVendors()) as any;
        const raw: any[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        const mapped = raw.map(mapVendor);
        if (!cancelled) setVendors(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load vendors');
          setVendors([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400';
      case 'Inactive': return 'bg-gray-500/20 text-gray-400';
      case 'Blacklisted': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
      <div className="w-full space-y-3">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-orange-500" />
              Vendor Management
            </h1>
            <p className="text-gray-400 mt-1">Manage suppliers, track performance, and handle procurements.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-lg shadow-orange-900/20">
            <Plus className="w-4 h-4" />
            Add Vendor
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendor name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Categories</option>
              <option value="Raw Materials">Raw Materials</option>
              <option value="Electronics">Electronics</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>
        </div>

        {/* Load states */}
        {isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400/40 border-t-orange-400" />
            Loading vendors…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && vendors.length === 0 && (
          <div className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-400">
            No vendors found.
          </div>
        )}

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-orange-500/50 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                      <Building2 className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors">{vendor.name}</h3>
                      <p className="text-sm text-gray-400">{vendor.code}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {vendor.rating} / 5.0 Rating
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {vendor.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {vendor.phone}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                    {vendor.status}
                  </span>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Outstanding</p>
                    <p className="text-sm font-bold text-white">${vendor.balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 px-3 py-2 border-t border-gray-700 flex justify-between items-center">
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Orders
                </button>
                <button className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Pay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
