'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Globe,
  Building2,
  User,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Settings,
  Copy,
  UserPlus
} from 'lucide-react';

interface Territory {
  id: string;
  name: string;
  code: string;
  type: 'geographic' | 'industry' | 'account_size' | 'product' | 'hybrid';
  status: 'active' | 'inactive' | 'pending';
  region: string;
  description: string;
  assignedTo: {
    name: string;
    avatar: string;
    role: string;
  };
  coverage: {
    countries?: string[];
    states?: string[];
    cities?: string[];
    industries?: string[];
    accountSizes?: string[];
  };
  performance: {
    accounts: number;
    activeOpportunities: number;
    revenue: number;
    quota: number;
    quotaAttainment: number;
    avgDealSize: number;
    winRate: number;
  };
  growth: {
    accountsChange: number;
    revenueChange: number;
  };
  metrics: {
    totalLeads: number;
    convertedLeads: number;
    customerSatisfaction: number;
  };
  createdAt: string;
  lastModified: string;
}

export default function TerritoriesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (GET /crm/territories) returns a sparse SalesTerritory ORM
        // shape (id/name/country/state/city/assignedUserId/priority/isActive).
        // Map it defensively onto this page's richer Territory model, filling
        // absent analytics with safe defaults so the UI never crashes.
        const raw = (await crmService.territories.getAll()) as any[];
        const mapped: Territory[] = (Array.isArray(raw) ? raw : []).map((t) => {
          const countries = [t?.country].filter(Boolean) as string[];
          const states = [t?.state].filter(Boolean) as string[];
          const cities = [t?.city].filter(Boolean) as string[];
          return {
            id: String(t?.id ?? ''),
            name: t?.name ?? 'Unnamed Territory',
            code: (t?.name ?? '').toString().slice(0, 6).toUpperCase() || '—',
            type: 'geographic',
            status: (t?.isActive ?? true) ? 'active' : 'inactive',
            region: t?.country ?? '—',
            description: [t?.city, t?.state, t?.country].filter(Boolean).join(', '),
            assignedTo: {
              name: t?.assignedUserId ?? 'Unassigned',
              avatar: (t?.assignedUserId ?? 'NA').toString().slice(0, 2).toUpperCase(),
              role: t?.assignedTeamId ? 'Team' : 'Owner',
            },
            coverage: { countries, states, cities },
            performance: {
              accounts: 0,
              activeOpportunities: 0,
              revenue: 0,
              quota: 0,
              quotaAttainment: 0,
              avgDealSize: 0,
              winRate: 0,
            },
            growth: { accountsChange: 0, revenueChange: 0 },
            metrics: { totalLeads: 0, convertedLeads: 0, customerSatisfaction: 0 },
            createdAt: t?.createdAt ? String(t.createdAt).slice(0, 10) : '',
            lastModified: t?.updatedAt ? String(t.updatedAt).slice(0, 10) : '',
          };
        });
        if (!cancelled) setTerritories(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load territories');
          setTerritories([]);
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

  const filteredTerritories = territories.filter(territory => {
    const matchesSearch = territory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         territory.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         territory.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || territory.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || territory.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Territories',
      value: territories.length,
      subtitle: `${territories.filter(t => t.status === 'active').length} active`,
      icon: Globe,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Accounts',
      value: territories.reduce((sum, t) => sum + t.performance.accounts, 0),
      change: '+' + territories.reduce((sum, t) => sum + t.growth.accountsChange, 0),
      trend: 'up' as const,
      icon: Building2,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Total Revenue',
      value: '$' + (territories.reduce((sum, t) => sum + t.performance.revenue, 0) / 1000000).toFixed(1) + 'M',
      change: '+' + (territories.reduce((sum, t) => sum + (t.performance.revenue * t.growth.revenueChange / 100), 0) / 1000000).toFixed(1) + 'M',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Avg Quota Attainment',
      value: (territories.length ? Math.round(territories.reduce((sum, t) => sum + t.performance.quotaAttainment, 0) / territories.length) : 0) + '%',
      change: territories.filter(t => t.performance.quotaAttainment >= 100).length + ' over quota',
      icon: Target,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'geographic': return MapPin;
      case 'industry': return Building2;
      case 'account_size': return Users;
      case 'product': return BarChart3;
      default: return Globe;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'geographic': return 'bg-blue-100 text-blue-700';
      case 'industry': return 'bg-purple-100 text-purple-700';
      case 'account_size': return 'bg-green-100 text-green-700';
      case 'product': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewTerritory = (territory: Territory) => {
    router.push(`/crm/settings/territories/view/${territory.id}`);
  };

  const handleEditTerritory = (territory: Territory) => {
    router.push(`/crm/settings/territories/edit/${territory.id}`);
  };

  const handleAssignUser = (territory: Territory) => {
    router.push(`/crm/settings/territories/assign/${territory.id}`);
  };

  const handleCopyTerritory = (territory: Territory) => {
    const newTerritory: Territory = {
      ...territory,
      id: `TER-${Date.now().toString().slice(-3)}`,
      name: `${territory.name} (Copy)`,
      code: `${territory.code}-COPY`,
      status: 'pending',
      performance: {
        ...territory.performance,
        accounts: 0,
        activeOpportunities: 0,
        revenue: 0,
        quotaAttainment: 0,
      },
      growth: {
        accountsChange: 0,
        revenueChange: 0,
      },
      metrics: {
        totalLeads: 0,
        convertedLeads: 0,
        customerSatisfaction: 0,
      },
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
    };
    setTerritories([...territories, newTerritory]);
  };

  const handleSettingsTerritory = (territory: Territory) => {
    router.push(`/crm/settings/territories/configure/${territory.id}`);
  };

  const handleCreateTerritory = () => {
    setShowAddModal(false);
    router.push('/crm/settings/territories');
  };

  return (
    <div className="w-full h-full px-3 py-2  space-y-3">
      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading territories…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && territories.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No territories found.
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Territory
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  {'subtitle' in stat && (
                    <p className="text-white/70 text-xs mt-1">{stat.subtitle}</p>
                  )}
                  {'change' in stat && (
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  )}
                </div>
                <Icon className="w-12 h-12 text-white/30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search Territories
            </label>
            <input
              type="text"
              placeholder="Search by name, code, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Territory Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="geographic">Geographic</option>
              <option value="industry">Industry</option>
              <option value="account_size">Account Size</option>
              <option value="product">Product</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Territories Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredTerritories.map((territory) => {
          const TypeIcon = getTypeIcon(territory.type);
          const quotaProgress = territory.performance.quotaAttainment;

          return (
            <div key={territory.id} className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <TypeIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{territory.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {territory.code}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(territory.type)}`}>
                          {territory.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(territory.status)}`}>
                          {territory.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{territory.description}</p>

                      {/* Assigned To */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {territory.assignedTo.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{territory.assignedTo.name}</p>
                          <p className="text-xs text-gray-600">{territory.assignedTo.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewTerritory(territory)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Territory"
                    >
                      <Eye className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEditTerritory(territory)}
                      className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Territory"
                    >
                      <Edit className="w-5 h-5 text-purple-600" />
                    </button>
                    <button
                      onClick={() => handleAssignUser(territory)}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                      title="Assign User"
                    >
                      <UserPlus className="w-5 h-5 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleCopyTerritory(territory)}
                      className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Copy Territory"
                    >
                      <Copy className="w-5 h-5 text-orange-600" />
                    </button>
                    <button
                      onClick={() => handleSettingsTerritory(territory)}
                      className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Configure Territory"
                    >
                      <Settings className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-6 bg-gray-50/50">
                <div className="grid grid-cols-6 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Accounts</p>
                    <p className="text-2xl font-bold text-gray-900">{territory.performance.accounts}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">+{territory.growth.accountsChange}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Active Deals</p>
                    <p className="text-2xl font-bold text-gray-900">{territory.performance.activeOpportunities}</p>
                    <p className="text-xs text-gray-600 mt-1">In pipeline</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(territory.performance.revenue / 1000000).toFixed(1)}M
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ArrowUpRight className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">+{territory.growth.revenueChange}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${(territory.performance.avgDealSize / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Per deal</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{territory.performance.winRate}%</p>
                    {territory.performance.winRate >= 70 && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Excellent</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CSAT Score</p>
                    <p className="text-2xl font-bold text-gray-900">{territory.metrics.customerSatisfaction}</p>
                    <p className="text-xs text-gray-600 mt-1">Out of 5.0</p>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quota Attainment</span>
                    <span className={`text-sm font-bold ${
                      quotaProgress >= 100 ? 'text-green-600' : quotaProgress >= 80 ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {quotaProgress.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        quotaProgress >= 100
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : quotaProgress >= 80
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}
                      style={{ width: `${Math.min(quotaProgress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">
                      ${(territory.performance.revenue / 1000000).toFixed(2)}M
                    </span>
                    <span className="text-xs text-gray-600">
                      ${(territory.performance.quota / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">COVERAGE</p>
                  <div className="space-y-2">
                    {territory.coverage.countries && (
                      <div className="flex items-start gap-2">
                        <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Countries</p>
                          <p className="text-sm text-gray-900">{territory.coverage.countries.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    {territory.coverage.states && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">States/Provinces</p>
                          <p className="text-sm text-gray-900">{territory.coverage.states.slice(0, 3).join(', ')}
                            {territory.coverage.states.length > 3 && ` +${territory.coverage.states.length - 3} more`}
                          </p>
                        </div>
                      </div>
                    )}
                    {territory.coverage.industries && (
                      <div className="flex items-start gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Industries</p>
                          <p className="text-sm text-gray-900">{territory.coverage.industries.join(', ')}</p>
                        </div>
                      </div>
                    )}
                    {territory.coverage.accountSizes && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Account Sizes</p>
                          <p className="text-sm text-gray-900">{territory.coverage.accountSizes.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-3 py-2 bg-gray-100/50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Region: <strong className="text-gray-900">{territory.region}</strong></span>
                  <span>•</span>
                  <span>Created: {new Date(territory.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>Last Modified: {new Date(territory.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Territory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-900">Add New Territory</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory Name</label>
                  <input
                    type="text"
                    placeholder="e.g., North America East"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory Code</label>
                  <input
                    type="text"
                    placeholder="e.g., NAE"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Territory Type</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="geographic">Geographic</option>
                    <option value="industry">Industry</option>
                    <option value="account_size">Account Size</option>
                    <option value="product">Product</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="americas">Americas</option>
                    <option value="emea">EMEA</option>
                    <option value="asia_pacific">Asia Pacific</option>
                    <option value="global">Global</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  placeholder="Describe the territory coverage and scope..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select team member...</option>
                  <option value="sarah">Sarah Johnson - Regional Sales Director</option>
                  <option value="michael">Michael Chen - Regional Sales Director</option>
                  <option value="emily">Emily Rodriguez - EMEA Sales Director</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Quota</label>
                <input
                  type="number"
                  placeholder="e.g., 10000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTerritory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Territory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
