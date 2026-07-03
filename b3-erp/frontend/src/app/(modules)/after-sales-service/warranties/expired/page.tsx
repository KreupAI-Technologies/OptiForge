'use client';

import React, { useState, useEffect } from 'react';
import { WarrantyService } from '@/services/warranty.service';
import { useRouter } from 'next/navigation';
import {
  XCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Clock,
  DollarSign,
  FileText,
  Download,
  Star,
  Phone,
  Mail,
  Package,
  TrendingDown,
  Archive,
  RotateCcw,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface ExpiredWarranty {
  id: string;
  warrantyNumber: string;
  warrantyType: 'Standard' | 'Extended' | 'Manufacturer' | 'Dealer';
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  equipmentId: string;
  equipmentModel: string;
  productCategory: string;
  status: 'expired';
  startDate: string;
  endDate: string;
  expiredDays: number;
  durationMonths: number;
  coverage: 'Parts Only' | 'Labor Only' | 'Parts & Labor' | 'Comprehensive';
  claimCount: number;
  totalClaimValue: number;
  approvedClaimValue: number;
  finalClaimUtilization: number;
  isExtended: boolean;
  baseWarrantyId?: string;
  extensionEligible: boolean;
  renewalOffered: boolean;
  lastServiceDate?: string;
  totalServiceHistory: number;
  customerSatisfaction?: number;
  extensionRecommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
}

const ExpiredWarrantiesPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterExpiredPeriod, setFilterExpiredPeriod] = useState('');
  const [filterExtensionEligible, setFilterExtensionEligible] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<ExpiredWarranty | null>(null);

  const [expiredWarranties, setExpiredWarranties] = useState<ExpiredWarranty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // WarrantyService.getAllWarranties returns the flat Warranty shape; keep
        // only expired warranties and map into this page's ExpiredWarranty view model.
        const raw = (await WarrantyService.getAllWarranties()) as any[];
        const typeMap: Record<string, ExpiredWarranty['warrantyType']> = {
          standard: 'Standard', extended: 'Extended',
          manufacturer: 'Manufacturer', dealer: 'Dealer',
        };
        const coverageMap: Record<string, ExpiredWarranty['coverage']> = {
          'parts only': 'Parts Only', 'labor only': 'Labor Only',
          'parts & labor': 'Parts & Labor', comprehensive: 'Comprehensive',
        };
        const dayMs = 1000 * 60 * 60 * 24;
        const mapped: ExpiredWarranty[] = (Array.isArray(raw) ? raw : [])
          .filter((w) => String(w.status ?? '').toLowerCase() === 'expired')
          .map((w) => {
            const end = w.endDate ?? w.end_date;
            const expiredDays = end
              ? Math.max(0, Math.round((Date.now() - new Date(end).getTime()) / dayMs))
              : 0;
            return {
              id: String(w.id ?? ''),
              warrantyNumber: w.warrantyNumber ?? w.warranty_number ?? '',
              warrantyType: typeMap[String(w.warrantyType ?? '').toLowerCase()] ?? 'Standard',
              customerId: String(w.customerId ?? w.customer_id ?? ''),
              customerName: w.customerName ?? w.customer_name ?? '',
              customerPhone: w.customerPhone ?? w.phone ?? '',
              customerEmail: w.customerEmail ?? w.email ?? '',
              equipmentId: String(w.equipmentId ?? w.equipment_id ?? ''),
              equipmentModel: w.equipmentModel ?? w.equipment_model ?? '',
              productCategory: w.productCategory ?? w.category ?? '',
              status: 'expired',
              startDate: w.startDate ?? w.start_date ?? '',
              endDate: end ?? '',
              expiredDays,
              durationMonths: Number(w.durationMonths ?? w.duration_months ?? 0),
              coverage: coverageMap[String(w.coverage ?? '').toLowerCase()] ?? 'Parts & Labor',
              claimCount: Number(w.claimCount ?? 0),
              totalClaimValue: Number(w.totalClaimValue ?? 0),
              approvedClaimValue: Number(w.approvedClaimValue ?? 0),
              finalClaimUtilization: Number(w.finalClaimUtilization ?? 0),
              isExtended: Boolean(w.isExtended ?? false),
              baseWarrantyId: w.baseWarrantyId ?? undefined,
              extensionEligible: Boolean(w.extensionEligible ?? false),
              renewalOffered: Boolean(w.renewalOffered ?? false),
              lastServiceDate: w.lastServiceDate ?? undefined,
              totalServiceHistory: Number(w.totalServiceHistory ?? 0),
              customerSatisfaction: w.customerSatisfaction != null ? Number(w.customerSatisfaction) : undefined,
              extensionRecommendation: (w.extensionRecommendation as ExpiredWarranty['extensionRecommendation']) ?? 'Consider',
            };
          });
        if (!cancelled) setExpiredWarranties(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load warranties');
          setExpiredWarranties([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredWarranties = expiredWarranties.filter(warranty => {
    const matchesSearch = warranty.warrantyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.equipmentModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || warranty.warrantyType === filterType;
    const matchesExtensionEligible = !filterExtensionEligible || 
                                   (filterExtensionEligible === 'eligible' && warranty.extensionEligible) ||
                                   (filterExtensionEligible === 'not-eligible' && !warranty.extensionEligible);
    const matchesRecommendation = !filterRecommendation || warranty.extensionRecommendation === filterRecommendation;
    
    let matchesExpiredPeriod = true;
    if (filterExpiredPeriod) {
      const expiredDays = warranty.expiredDays;
      switch (filterExpiredPeriod) {
        case 'recent':
          matchesExpiredPeriod = expiredDays <= 30;
          break;
        case 'last-3-months':
          matchesExpiredPeriod = expiredDays <= 90;
          break;
        case 'last-6-months':
          matchesExpiredPeriod = expiredDays <= 180;
          break;
        case 'over-6-months':
          matchesExpiredPeriod = expiredDays > 180;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesExtensionEligible && matchesRecommendation && matchesExpiredPeriod;
  });

  const stats = {
    totalExpired: expiredWarranties.length,
    extensionEligible: expiredWarranties.filter(w => w.extensionEligible).length,
    renewalOffered: expiredWarranties.filter(w => w.renewalOffered).length,
    totalClaimValue: expiredWarranties.reduce((sum, w) => sum + w.totalClaimValue, 0),
    avgUtilization: Math.round(expiredWarranties.reduce((sum, w) => sum + w.finalClaimUtilization, 0) / expiredWarranties.length)
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Standard': return 'bg-blue-100 text-blue-700';
      case 'Extended': return 'bg-purple-100 text-purple-700';
      case 'Manufacturer': return 'bg-orange-100 text-orange-700';
      case 'Dealer': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'Comprehensive': return 'bg-green-100 text-green-700';
      case 'Parts & Labor': return 'bg-blue-100 text-blue-700';
      case 'Parts Only': return 'bg-yellow-100 text-yellow-700';
      case 'Labor Only': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended': return 'bg-green-100 text-green-700 border-green-300';
      case 'Recommended': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Consider': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Not Recommended': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getExpiredPeriodColor = (expiredDays: number) => {
    if (expiredDays <= 30) return { color: 'text-orange-600', message: `Expired ${expiredDays} days ago` };
    if (expiredDays <= 90) return { color: 'text-red-600', message: `Expired ${expiredDays} days ago` };
    if (expiredDays <= 180) return { color: 'text-red-700', message: `Expired ${Math.round(expiredDays / 30)} months ago` };
    return { color: 'text-gray-600', message: `Expired ${Math.round(expiredDays / 30)} months ago` };
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading warranties…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && expiredWarranties.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No expired warranties found.
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <XCircle className="h-7 w-7 text-red-600" />
            Expired Warranties
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage expired warranties and extension opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </button>
          <button
            onClick={() => router.push('/after-sales-service/warranties')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Shield className="h-4 w-4" />
            All Warranties
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expired</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalExpired}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Extension Eligible</p>
              <p className="text-2xl font-bold text-green-600">{stats.extensionEligible}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-green-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Renewal opportunity</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Renewal Offered</p>
              <p className="text-2xl font-bold text-blue-600">{stats.renewalOffered}</p>
            </div>
            <RotateCcw className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Active offers</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-purple-600">₹{(stats.totalClaimValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Lifetime value</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Utilization</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgUtilization}%</p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Claim usage</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by warranty number, customer, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Standard">Standard</option>
              <option value="Extended">Extended</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Dealer">Dealer</option>
            </select>

            <select
              value={filterExpiredPeriod}
              onChange={(e) => setFilterExpiredPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Periods</option>
              <option value="recent">Recently Expired (30 days)</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="over-6-months">Over 6 Months</option>
            </select>

            <select
              value={filterExtensionEligible}
              onChange={(e) => setFilterExtensionEligible(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Eligibility</option>
              <option value="eligible">Extension Eligible</option>
              <option value="not-eligible">Not Eligible</option>
            </select>

            <select
              value={filterRecommendation}
              onChange={(e) => setFilterRecommendation(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Recommendations</option>
              <option value="Highly Recommended">Highly Recommended</option>
              <option value="Recommended">Recommended</option>
              <option value="Consider">Consider</option>
              <option value="Not Recommended">Not Recommended</option>
            </select>
          </div>
        )}
      </div>

      {/* Expired Warranties List/Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Expired Warranties ({filteredWarranties.length})
          </h2>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expired</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extension</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWarranties.map((warranty) => {
                  const expiredInfo = getExpiredPeriodColor(warranty.expiredDays);
                  
                  return (
                    <tr key={warranty.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{warranty.warrantyNumber}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(warranty.warrantyType)}`}>
                              {warranty.warrantyType}
                            </span>
                            {warranty.isExtended && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                Extended
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{warranty.customerName}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Phone className="h-3 w-3" />
                            {warranty.customerPhone}
                          </div>
                          {warranty.customerSatisfaction && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex">
                                {renderStars(warranty.customerSatisfaction)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{warranty.equipmentModel}</div>
                          <div className="text-sm text-gray-500">{warranty.productCategory}</div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCoverageColor(warranty.coverage)} mt-1 inline-block`}>
                            {warranty.coverage}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className={`text-sm font-medium ${expiredInfo.color}`}>
                            {expiredInfo.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            End: {warranty.endDate}
                          </div>
                          <div className="text-xs text-gray-500">
                            Duration: {warranty.durationMonths} months
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {warranty.claimCount} claims
                          </div>
                          <div className="text-xs text-gray-500">
                            ₹{warranty.totalClaimValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {warranty.finalClaimUtilization}% utilized
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ width: `${warranty.finalClaimUtilization}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            {warranty.extensionEligible ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-600">
                              {warranty.extensionEligible ? 'Eligible' : 'Not Eligible'}
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationColor(warranty.extensionRecommendation)}`}>
                            {warranty.extensionRecommendation}
                          </span>
                          {warranty.renewalOffered && (
                            <div className="text-xs text-blue-600 font-medium">
                              Renewal Offered
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedWarranty(warranty)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                           
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {warranty.extensionEligible && (
                            <button
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                             
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md"
                           
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {filteredWarranties.map((warranty) => {
              const expiredInfo = getExpiredPeriodColor(warranty.expiredDays);
              
              return (
                <div key={warranty.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{warranty.warrantyNumber}</h3>
                      <p className="text-sm text-gray-500">{warranty.customerName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRecommendationColor(warranty.extensionRecommendation)}`}>
                      {warranty.extensionRecommendation.split(' ')[0]}
                    </span>
                  </div>

                  <div className="space-y-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{warranty.equipmentModel}</span>
                    </div>
                    <div className={`text-sm font-medium ${expiredInfo.color}`}>
                      {expiredInfo.message}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCoverageColor(warranty.coverage)}`}>
                        {warranty.coverage}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(warranty.warrantyType)}`}>
                        {warranty.warrantyType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Claims:</span>
                      <span className="font-medium">{warranty.claimCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Utilization:</span>
                      <span className="font-medium">{warranty.finalClaimUtilization}%</span>
                    </div>
                    {warranty.customerSatisfaction && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <div className="flex">
                          {renderStars(warranty.customerSatisfaction)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedWarranty(warranty)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {warranty.extensionEligible && (
                      <button
                        className="p-2 border border-green-300 text-green-600 rounded-md hover:bg-green-50"
                       
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                     
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Details Modal */}
      {selectedWarranty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Expired Warranty Details</h2>
              <button
                onClick={() => setSelectedWarranty(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Warranty Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Number:</strong> {selectedWarranty.warrantyNumber}</div>
                    <div><strong>Type:</strong> {selectedWarranty.warrantyType}</div>
                    <div><strong>Coverage:</strong> {selectedWarranty.coverage}</div>
                    <div><strong>Duration:</strong> {selectedWarranty.durationMonths} months</div>
                    <div><strong>Expired:</strong> {getExpiredPeriodColor(selectedWarranty.expiredDays).message}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Equipment</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Model:</strong> {selectedWarranty.equipmentModel}</div>
                    <div><strong>Category:</strong> {selectedWarranty.productCategory}</div>
                    <div><strong>ID:</strong> {selectedWarranty.equipmentId}</div>
                  </div>
                </div>
              </div>

              {/* Extension Analysis */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Extension Analysis</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${selectedWarranty.extensionEligible ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedWarranty.extensionEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                      </div>
                      <div className="text-sm text-gray-500">Extension Status</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{selectedWarranty.finalClaimUtilization}%</div>
                      <div className="text-sm text-gray-500">Claim Utilization</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{selectedWarranty.totalServiceHistory}</div>
                      <div className="text-sm text-gray-500">Service Calls</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className={`px-3 py-2 text-sm font-medium rounded-full border ${getRecommendationColor(selectedWarranty.extensionRecommendation)}`}>
                      {selectedWarranty.extensionRecommendation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Claims Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Claims Summary</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{selectedWarranty.claimCount}</div>
                      <div className="text-sm text-gray-500">Total Claims</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">₹{(selectedWarranty.totalClaimValue / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-gray-500">Claim Value</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">₹{(selectedWarranty.approvedClaimValue / 1000).toFixed(0)}K</div>
                      <div className="text-sm text-gray-500">Approved</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <div><strong>Name:</strong> {selectedWarranty.customerName}</div>
                    <div><strong>Phone:</strong> {selectedWarranty.customerPhone}</div>
                    <div><strong>Email:</strong> {selectedWarranty.customerEmail}</div>
                  </div>
                  <div>
                    {selectedWarranty.customerSatisfaction && (
                      <div className="flex items-center gap-2">
                        <strong>Satisfaction:</strong>
                        <div className="flex">
                          {renderStars(selectedWarranty.customerSatisfaction)}
                        </div>
                        <span className="text-sm">({selectedWarranty.customerSatisfaction}/5)</span>
                      </div>
                    )}
                    {selectedWarranty.lastServiceDate && (
                      <div><strong>Last Service:</strong> {selectedWarranty.lastServiceDate}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                {selectedWarranty.extensionEligible && (
                  <button
                    onClick={() => router.push(`/after-sales-service/warranties/extend/${selectedWarranty.id}`)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Extend Warranty
                  </button>
                )}
                <button
                  onClick={() => router.push(`/after-sales-service/warranties/view/${selectedWarranty.id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Full Details
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiredWarrantiesPage;