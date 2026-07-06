'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  ArrowLeft,
  MapPin,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Globe,
  Building2,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  Calendar,
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  Activity,
  Clock
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
    email: string;
    phone: string;
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

export default function ViewTerritoryPage() {
  const router = useRouter();
  const params = useParams();
  const territoryId = params.id as string;

  const emptyTerritory: Territory = {
    id: territoryId,
    name: '',
    code: '',
    type: 'geographic',
    status: 'active',
    region: '',
    description: '',
    assignedTo: { name: '', avatar: '', role: '', email: '', phone: '' },
    coverage: {},
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
    createdAt: '',
    lastModified: '',
  };

  const [territory, setTerritory] = useState<Territory>(emptyTerritory);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!territoryId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const t = (await crmService.territories.getById(territoryId)) as any;
        if (cancelled || !t) return;
        const assignedName: string = t.assignedTo?.name ?? t.assignedToName ?? t.ownerName ?? '';
        const avatar = assignedName
          ? assignedName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          : '';
        setTerritory({
          id: String(t.id ?? territoryId),
          name: t.name ?? '',
          code: t.code ?? '',
          type: (t.type ?? 'geographic') as Territory['type'],
          status: (t.status ?? 'active') as Territory['status'],
          region: t.region ?? '',
          description: t.description ?? '',
          assignedTo: {
            name: assignedName,
            avatar: t.assignedTo?.avatar ?? avatar,
            role: t.assignedTo?.role ?? t.assignedToRole ?? '',
            email: t.assignedTo?.email ?? t.assignedToEmail ?? '',
            phone: t.assignedTo?.phone ?? t.assignedToPhone ?? '',
          },
          coverage: {
            countries: t.coverage?.countries ?? t.countries ?? undefined,
            states: t.coverage?.states ?? t.states ?? undefined,
            cities: t.coverage?.cities ?? t.cities ?? undefined,
            industries: t.coverage?.industries ?? t.industries ?? undefined,
            accountSizes: t.coverage?.accountSizes ?? t.accountSizes ?? undefined,
          },
          performance: {
            accounts: Number(t.performance?.accounts ?? t.accounts ?? 0),
            activeOpportunities: Number(t.performance?.activeOpportunities ?? t.activeOpportunities ?? 0),
            revenue: Number(t.performance?.revenue ?? t.revenue ?? 0),
            quota: Number(t.performance?.quota ?? t.quota ?? 0),
            quotaAttainment: Number(t.performance?.quotaAttainment ?? t.quotaAttainment ?? 0),
            avgDealSize: Number(t.performance?.avgDealSize ?? t.avgDealSize ?? 0),
            winRate: Number(t.performance?.winRate ?? t.winRate ?? 0),
          },
          growth: {
            accountsChange: Number(t.growth?.accountsChange ?? t.accountsChange ?? 0),
            revenueChange: Number(t.growth?.revenueChange ?? t.revenueChange ?? 0),
          },
          metrics: {
            totalLeads: Number(t.metrics?.totalLeads ?? t.totalLeads ?? 0),
            convertedLeads: Number(t.metrics?.convertedLeads ?? t.convertedLeads ?? 0),
            customerSatisfaction: Number(t.metrics?.customerSatisfaction ?? t.customerSatisfaction ?? 0),
          },
          createdAt: t.createdAt ?? t.createdDate ?? '',
          lastModified: t.updatedAt ?? t.lastModified ?? '',
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load territory.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [territoryId]);

  const handleBack = () => {
    router.push('/crm/settings/territories');
  };

  const handleEdit = () => {
    router.push(`/crm/settings/territories/edit/${territoryId}`);
  };

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

  const TypeIcon = getTypeIcon(territory.type);
  const quotaProgress = territory.performance.quotaAttainment;

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className=" space-y-3">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading territory…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Territories
            </button>
            <div className="flex items-center gap-2">
              <div className="p-4 bg-blue-50 rounded-xl">
                <TypeIcon className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{territory.name}</h1>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                    {territory.code}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getTypeColor(territory.type)}`}>
                    {territory.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(territory.status)}`}>
                    {territory.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600">{territory.description}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-5 h-5" />
            Edit Territory
          </button>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Accounts</p>
                <p className="text-4xl font-bold mt-1">{territory.performance.accounts}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{territory.growth.accountsChange} this quarter</span>
                </div>
              </div>
              <Building2 className="w-12 h-12 text-white/30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Opportunities</p>
                <p className="text-4xl font-bold mt-1">{territory.performance.activeOpportunities}</p>
                <p className="text-white/70 text-sm mt-2">In pipeline</p>
              </div>
              <Activity className="w-12 h-12 text-white/30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Revenue</p>
                <p className="text-4xl font-bold mt-1">
                  ${(territory.performance.revenue / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+{territory.growth.revenueChange}% growth</span>
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-white/30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Win Rate</p>
                <p className="text-4xl font-bold mt-1">{territory.performance.winRate}%</p>
                {territory.performance.winRate >= 70 && (
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                )}
              </div>
              <Award className="w-12 h-12 text-white/30" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-3">
            {/* Quota Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quota Attainment</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Progress</span>
                  <span className={`text-lg font-bold ${
                    quotaProgress >= 100 ? 'text-green-600' : quotaProgress >= 80 ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {quotaProgress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      quotaProgress >= 100
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : quotaProgress >= 80
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600'
                    }`}
                    style={{ width: `${Math.min(quotaProgress, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${(territory.performance.revenue / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Quota</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${(territory.performance.quota / 1000000).toFixed(2)}M
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Performance Metrics</h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(territory.performance.avgDealSize / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Per opportunity</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{territory.metrics.totalLeads}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {territory.metrics.convertedLeads} converted
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">CSAT Score</p>
                  <p className="text-2xl font-bold text-gray-900">{territory.metrics.customerSatisfaction}</p>
                  <p className="text-xs text-gray-600 mt-1">Out of 5.0</p>
                </div>
              </div>
            </div>

            {/* Coverage Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Territory Coverage</h2>
              <div className="space-y-2">
                {territory.coverage.countries && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Countries</p>
                      <div className="flex flex-wrap gap-2">
                        {territory.coverage.countries.map((country) => (
                          <span
                            key={country}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {territory.coverage.states && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">States/Provinces</p>
                      <div className="flex flex-wrap gap-2">
                        {territory.coverage.states.map((state) => (
                          <span
                            key={state}
                            className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full"
                          >
                            {state}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {territory.coverage.cities && (
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Major Cities</p>
                      <div className="flex flex-wrap gap-2">
                        {territory.coverage.cities.map((city) => (
                          <span
                            key={city}
                            className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {territory.coverage.industries && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Industries</p>
                      <div className="flex flex-wrap gap-2">
                        {territory.coverage.industries.map((industry) => (
                          <span
                            key={industry}
                            className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-full"
                          >
                            {industry}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {territory.coverage.accountSizes && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Account Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {territory.coverage.accountSizes.map((size) => (
                          <span
                            key={size}
                            className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3">
            {/* Assigned Owner */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Territory Owner</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {territory.assignedTo.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{territory.assignedTo.name}</h3>
                    <p className="text-sm text-gray-600">{territory.assignedTo.role}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${territory.assignedTo.email}`} className="text-blue-600 hover:text-blue-700">
                      {territory.assignedTo.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${territory.assignedTo.phone}`} className="text-gray-700 hover:text-gray-900">
                      {territory.assignedTo.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Territory Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Territory Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Region</p>
                  <p className="text-base font-medium text-gray-900">{territory.region}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Territory Type</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded ${getTypeColor(territory.type)}`}>
                    {territory.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded ${getStatusColor(territory.status)}`}>
                    {territory.status.toUpperCase()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Created: {new Date(territory.createdAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Last Modified: {new Date(territory.lastModified).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
