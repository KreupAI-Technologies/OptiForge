'use client';

import React, { useState, useEffect } from 'react';
import { WarrantyService } from '@/services/warranty.service';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Search,
  Filter,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Download,
  Star,
  Wrench,
  Phone,
  Mail,
  MapPin,
  Package,
  TrendingUp,
  RefreshCw,
  Plus
} from 'lucide-react';

interface ActiveWarranty {
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
  status: 'active';
  startDate: string;
  endDate: string;
  daysRemaining: number;
  durationMonths: number;
  coverage: 'Parts Only' | 'Labor Only' | 'Parts & Labor' | 'Comprehensive';
  claimCount: number;
  totalClaimValue: number;
  approvedClaimValue: number;
  remainingCoverage: number;
  isExtended: boolean;
  baseWarrantyId?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastServiceDate?: string;
  nextMaintenanceDate?: string;
}

const ActiveWarrantiesPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCoverage, setFilterCoverage] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterExpiry, setFilterExpiry] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<ActiveWarranty | null>(null);

  const [activeWarranties, setActiveWarranties] = useState<ActiveWarranty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // WarrantyService.getAllWarranties returns the flat Warranty shape; keep
        // only active warranties and map into this page's ActiveWarranty view model.
        const raw = (await WarrantyService.getAllWarranties()) as any[];
        const typeMap: Record<string, ActiveWarranty['warrantyType']> = {
          standard: 'Standard', extended: 'Extended',
          manufacturer: 'Manufacturer', dealer: 'Dealer',
        };
        const coverageMap: Record<string, ActiveWarranty['coverage']> = {
          'parts only': 'Parts Only', 'labor only': 'Labor Only',
          'parts & labor': 'Parts & Labor', comprehensive: 'Comprehensive',
        };
        const dayMs = 1000 * 60 * 60 * 24;
        const mapped: ActiveWarranty[] = (Array.isArray(raw) ? raw : [])
          .filter((w) => String(w.status ?? '').toLowerCase() === 'active')
          .map((w) => {
            const end = w.endDate ?? w.end_date;
            const daysRemaining = end
              ? Math.max(0, Math.round((new Date(end).getTime() - Date.now()) / dayMs))
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
              status: 'active',
              startDate: w.startDate ?? w.start_date ?? '',
              endDate: end ?? '',
              daysRemaining,
              durationMonths: Number(w.durationMonths ?? w.duration_months ?? 0),
              coverage: coverageMap[String(w.coverage ?? '').toLowerCase()] ?? 'Parts & Labor',
              claimCount: Number(w.claimCount ?? 0),
              totalClaimValue: Number(w.totalClaimValue ?? 0),
              approvedClaimValue: Number(w.approvedClaimValue ?? 0),
              remainingCoverage: Number(w.remainingCoverage ?? 0),
              isExtended: Boolean(w.isExtended ?? false),
              baseWarrantyId: w.baseWarrantyId ?? undefined,
              riskLevel: (w.riskLevel as ActiveWarranty['riskLevel']) ?? 'Low',
              lastServiceDate: w.lastServiceDate ?? undefined,
              nextMaintenanceDate: w.nextMaintenanceDate ?? undefined,
            };
          });
        if (!cancelled) setActiveWarranties(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load warranties');
          setActiveWarranties([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredWarranties = activeWarranties.filter(warranty => {
    const matchesSearch = warranty.warrantyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.equipmentModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || warranty.warrantyType === filterType;
    const matchesCoverage = !filterCoverage || warranty.coverage === filterCoverage;
    const matchesRisk = !filterRisk || warranty.riskLevel === filterRisk;
    
    let matchesExpiry = true;
    if (filterExpiry) {
      const daysRemaining = warranty.daysRemaining;
      switch (filterExpiry) {
        case 'expiring-soon':
          matchesExpiry = daysRemaining <= 30;
          break;
        case 'next-3-months':
          matchesExpiry = daysRemaining <= 90;
          break;
        case 'next-6-months':
          matchesExpiry = daysRemaining <= 180;
          break;
        case 'long-term':
          matchesExpiry = daysRemaining > 180;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesCoverage && matchesRisk && matchesExpiry;
  });

  const stats = {
    totalActive: activeWarranties.length,
    expiringSoon: activeWarranties.filter(w => w.daysRemaining <= 30).length,
    highRisk: activeWarranties.filter(w => w.riskLevel === 'High').length,
    totalClaimValue: activeWarranties.reduce((sum, w) => sum + w.totalClaimValue, 0),
    avgCoverage: Math.round(activeWarranties.reduce((sum, w) => sum + w.remainingCoverage, 0) / activeWarranties.length)
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
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

  const getExpiryWarning = (daysRemaining: number) => {
    if (daysRemaining <= 7) return { color: 'text-red-600', icon: AlertTriangle, message: `Expires in ${daysRemaining} days!` };
    if (daysRemaining <= 30) return { color: 'text-orange-600', icon: Clock, message: `Expires in ${daysRemaining} days` };
    if (daysRemaining <= 90) return { color: 'text-yellow-600', icon: Calendar, message: `${daysRemaining} days remaining` };
    return { color: 'text-green-600', icon: CheckCircle2, message: `${daysRemaining} days remaining` };
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
      {!isLoading && !loadError && activeWarranties.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No active warranties found.
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-7 w-7 text-green-600" />
            Active Warranties
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor active warranty coverage</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </button>
          <button
            onClick={() => router.push('/after-sales-service/warranties/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Warranty
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalActive}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Next 30 days</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Needs attention</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-purple-600">₹{(stats.totalClaimValue / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Claim value</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Coverage</p>
              <p className="text-2xl font-bold text-blue-600">{stats.avgCoverage}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Remaining</div>
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
              value={filterCoverage}
              onChange={(e) => setFilterCoverage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Coverage</option>
              <option value="Comprehensive">Comprehensive</option>
              <option value="Parts & Labor">Parts & Labor</option>
              <option value="Parts Only">Parts Only</option>
              <option value="Labor Only">Labor Only</option>
            </select>

            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            <select
              value={filterExpiry}
              onChange={(e) => setFilterExpiry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Expiry</option>
              <option value="expiring-soon">Expiring Soon (30 days)</option>
              <option value="next-3-months">Next 3 Months</option>
              <option value="next-6-months">Next 6 Months</option>
              <option value="long-term">Long Term (6+ months)</option>
            </select>
          </div>
        )}
      </div>

      {/* Warranties List/Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Warranties ({filteredWarranties.length})
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWarranties.map((warranty) => {
                  const expiryInfo = getExpiryWarning(warranty.daysRemaining);
                  const ExpiryIcon = expiryInfo.icon;
                  
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
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="h-3 w-3" />
                            {warranty.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{warranty.equipmentModel}</div>
                          <div className="text-sm text-gray-500">{warranty.productCategory}</div>
                          <div className="text-xs text-gray-500 mt-1">{warranty.equipmentId}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCoverageColor(warranty.coverage)}`}>
                            {warranty.coverage}
                          </span>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">Coverage: {warranty.remainingCoverage}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${warranty.remainingCoverage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <div className={`flex items-center gap-1 text-sm ${expiryInfo.color}`}>
                            <ExpiryIcon className="h-4 w-4" />
                            {expiryInfo.message}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(warranty.riskLevel)}`}>
                              {warranty.riskLevel} Risk
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Expires: {warranty.endDate}
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
                          {warranty.claimCount > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              ₹{warranty.approvedClaimValue.toLocaleString()} approved
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
                          <button
                            onClick={() => router.push(`/after-sales-service/warranties/view/${warranty.id}`)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                           
                          >
                            <Wrench className="h-4 w-4" />
                          </button>
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
              const expiryInfo = getExpiryWarning(warranty.daysRemaining);
              const ExpiryIcon = expiryInfo.icon;
              
              return (
                <div key={warranty.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{warranty.warrantyNumber}</h3>
                      <p className="text-sm text-gray-500">{warranty.customerName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(warranty.riskLevel)}`}>
                      {warranty.riskLevel}
                    </span>
                  </div>

                  <div className="space-y-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{warranty.equipmentModel}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${expiryInfo.color}`}>
                      <ExpiryIcon className="h-4 w-4" />
                      {expiryInfo.message}
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

                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Claims: </span>
                      <span className="font-medium">{warranty.claimCount}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Coverage: </span>
                      <span className="font-medium">{warranty.remainingCoverage}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedWarranty(warranty)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/after-sales-service/warranties/view/${warranty.id}`)}
                      className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                     
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Warranty Details</h2>
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

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <div><strong>Name:</strong> {selectedWarranty.customerName}</div>
                    <div><strong>Phone:</strong> {selectedWarranty.customerPhone}</div>
                    <div><strong>Email:</strong> {selectedWarranty.customerEmail}</div>
                  </div>
                </div>
              </div>

              {/* Status & Dates */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status & Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <div><strong>Start Date:</strong> {selectedWarranty.startDate}</div>
                    <div><strong>End Date:</strong> {selectedWarranty.endDate}</div>
                    <div><strong>Days Remaining:</strong> {selectedWarranty.daysRemaining}</div>
                  </div>
                  <div>
                    <div><strong>Risk Level:</strong> 
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(selectedWarranty.riskLevel)}`}>
                        {selectedWarranty.riskLevel}
                      </span>
                    </div>
                    {selectedWarranty.nextMaintenanceDate && (
                      <div><strong>Next Maintenance:</strong> {selectedWarranty.nextMaintenanceDate}</div>
                    )}
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
                      <div className="text-2xl font-bold text-green-600">{selectedWarranty.remainingCoverage}%</div>
                      <div className="text-sm text-gray-500">Coverage Left</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push(`/after-sales-service/warranties/view/${selectedWarranty.id}`)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Full Details
                </button>
                <button
                  onClick={() => router.push(`/after-sales-service/warranties/claims`)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  View Claims
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveWarrantiesPage;