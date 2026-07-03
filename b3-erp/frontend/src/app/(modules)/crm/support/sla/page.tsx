'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Clock, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface SLAPolicy {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'technical' | 'billing' | 'general' | 'all';
  firstResponseTime: number; // in minutes
  resolutionTime: number; // in hours
  businessHoursOnly: boolean;
  isActive: boolean;
  appliesTo: string[];
  createdDate: string;
  lastUpdated: string;
}

interface SLAPerformance {
  policyId: string;
  policyName: string;
  period: string;
  totalTickets: number;
  metFirstResponse: number;
  metResolution: number;
  breachedFirstResponse: number;
  breachedResolution: number;
  avgFirstResponseTime: number; // in minutes
  avgResolutionTime: number; // in hours
  firstResponseCompliance: number; // percentage
  resolutionCompliance: number; // percentage
  trend: 'improving' | 'declining' | 'stable';
}

const mockPerformance: SLAPerformance[] = [
  {
    policyId: '1',
    policyName: 'Critical Issues - Enterprise',
    period: 'Last 30 Days',
    totalTickets: 45,
    metFirstResponse: 42,
    metResolution: 40,
    breachedFirstResponse: 3,
    breachedResolution: 5,
    avgFirstResponseTime: 12,
    avgResolutionTime: 3.5,
    firstResponseCompliance: 93.3,
    resolutionCompliance: 88.9,
    trend: 'improving',
  },
  {
    policyId: '2',
    policyName: 'High Priority - All Customers',
    period: 'Last 30 Days',
    totalTickets: 128,
    metFirstResponse: 115,
    metResolution: 108,
    breachedFirstResponse: 13,
    breachedResolution: 20,
    avgFirstResponseTime: 52,
    avgResolutionTime: 7.2,
    firstResponseCompliance: 89.8,
    resolutionCompliance: 84.4,
    trend: 'stable',
  },
  {
    policyId: '3',
    policyName: 'Technical Issues - Standard',
    period: 'Last 30 Days',
    totalTickets: 256,
    metFirstResponse: 234,
    metResolution: 218,
    breachedFirstResponse: 22,
    breachedResolution: 38,
    avgFirstResponseTime: 98,
    avgResolutionTime: 20.5,
    firstResponseCompliance: 91.4,
    resolutionCompliance: 85.2,
    trend: 'improving',
  },
  {
    policyId: '4',
    policyName: 'Billing Inquiries',
    period: 'Last 30 Days',
    totalTickets: 89,
    metFirstResponse: 78,
    metResolution: 72,
    breachedFirstResponse: 11,
    breachedResolution: 17,
    avgFirstResponseTime: 198,
    avgResolutionTime: 38.4,
    firstResponseCompliance: 87.6,
    resolutionCompliance: 80.9,
    trend: 'declining',
  },
  {
    policyId: '5',
    policyName: 'General Support - Low Priority',
    period: 'Last 30 Days',
    totalTickets: 342,
    metFirstResponse: 318,
    metResolution: 305,
    breachedFirstResponse: 24,
    breachedResolution: 37,
    avgFirstResponseTime: 420,
    avgResolutionTime: 58.2,
    firstResponseCompliance: 93.0,
    resolutionCompliance: 89.2,
    trend: 'stable',
  },
];

export default function SLAManagementPage() {
  const router = useRouter();
  const [policies, setPolicies] = useState<SLAPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Performance metrics have no matching backend endpoint yet; kept as static sample.
  const [performance] = useState<SLAPerformance[]>(mockPerformance);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (NestJS CrmSla) uses different field names than the page's
        // SLAPolicy model; map defensively. responseTimeHours is in hours, the
        // page expects firstResponseTime in minutes.
        const raw = (await crmService.slas.getAll()) as any[];
        const mapped: SLAPolicy[] = (raw || []).map((s) => ({
          id: String(s.id),
          name: s.name ?? '',
          description: s.description ?? '',
          priority: (s.priority ?? 'medium') as SLAPolicy['priority'],
          category: (s.category ?? (Array.isArray(s.ticketCategories) && s.ticketCategories.length === 1 ? s.ticketCategories[0] : 'all')) as SLAPolicy['category'],
          firstResponseTime: Number(s.responseTimeHours ?? 0) * 60,
          resolutionTime: Number(s.resolutionTimeHours ?? 0),
          businessHoursOnly: Boolean(s.businessHoursOnly),
          isActive: s.isActive ?? (s.status ? s.status === 'active' : true),
          appliesTo: Array.isArray(s.customerCategories) ? s.customerCategories : [],
          createdDate: s.createdAt ?? s.createdDate ?? '',
          lastUpdated: s.updatedAt ?? s.lastUpdated ?? '',
        }));
        if (!cancelled) setPolicies(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load SLA policies');
          setPolicies([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'technical' | 'billing' | 'general'>('all');

  const handleCreatePolicy = () => {
    router.push('/crm/support/sla/create');
  };

  const handleEditPolicy = (policy: SLAPolicy) => {
    router.push(`/crm/support/sla/edit/${policy.id}`);
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || policy.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || policy.category === filterCategory || policy.category === 'all';
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const overallStats = {
    totalPolicies: policies.filter(p => p.isActive).length,
    avgFirstResponseCompliance: Math.round(
      performance.reduce((sum, p) => sum + p.firstResponseCompliance, 0) / performance.length
    ),
    avgResolutionCompliance: Math.round(
      performance.reduce((sum, p) => sum + p.resolutionCompliance, 0) / performance.length
    ),
    totalTickets: performance.reduce((sum, p) => sum + p.totalTickets, 0),
    totalBreaches: performance.reduce((sum, p) => sum + p.breachedFirstResponse + p.breachedResolution, 0),
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-700';
      case 'billing': return 'bg-green-100 text-green-700';
      case 'general': return 'bg-purple-100 text-purple-700';
      case 'all': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 95) return 'text-green-700 bg-green-100';
    if (compliance >= 85) return 'text-blue-700 bg-blue-100';
    if (compliance >= 75) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading SLA policies…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && policies.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No SLA policies found.
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleCreatePolicy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create SLA Policy
          </button>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <Target className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{overallStats.totalPolicies}</div>
            <div className="text-blue-100 text-sm">Active Policies</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{overallStats.avgFirstResponseCompliance}%</div>
            <div className="text-green-100 text-sm">Response Compliance</div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{overallStats.avgResolutionCompliance}%</div>
            <div className="text-teal-100 text-sm">Resolution Compliance</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <Activity className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{overallStats.totalTickets}</div>
            <div className="text-purple-100 text-sm">Total Tickets</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{overallStats.totalBreaches}</div>
            <div className="text-red-100 text-sm">Total Breaches</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search SLA policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* SLA Policies with Performance */}
      <div className="space-y-3">
        {filteredPolicies.map((policy) => {
          const perf = performance.find(p => p.policyId === policy.id);

          return (
            <div key={policy.id} className="bg-white rounded-lg border border-gray-200 p-3">
              {/* Policy Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{policy.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(policy.priority)}`}>
                      {policy.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(policy.category)}`}>
                      {policy.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {!policy.businessHoursOnly && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        24/7
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>Applies to: {policy.appliesTo.join(', ')}</span>
                    <span>•</span>
                    <span>Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleEditPolicy(policy)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Edit className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">Edit</span>
                </button>
              </div>

              {/* SLA Targets */}
              <div className="grid grid-cols-2 gap-2 mb-3 pb-6 border-b border-gray-200">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">First Response Target</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatTime(policy.firstResponseTime)}
                  </div>
                  <div className="text-xs text-blue-700 mt-1">
                    {policy.businessHoursOnly ? 'Business hours only' : '24/7 coverage'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="text-sm font-medium">Resolution Target</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-900">
                    {policy.resolutionTime}h
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    {policy.businessHoursOnly ? 'Business hours only' : '24/7 coverage'}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {perf && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">Performance - {perf.period}</h4>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(perf.trend)}
                      <span className="text-sm text-gray-600 capitalize">{perf.trend}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {/* Total Tickets */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-gray-700 mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium">Total Tickets</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{perf.totalTickets}</div>
                    </div>

                    {/* First Response Compliance */}
                    <div className={`rounded-lg p-3 ${getComplianceColor(perf.firstResponseCompliance)}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Response SLA</span>
                      </div>
                      <div className="text-2xl font-bold">{perf.firstResponseCompliance.toFixed(1)}%</div>
                      <div className="text-xs mt-1">{perf.metFirstResponse}/{perf.totalTickets} met</div>
                      <div className="text-xs">Avg: {formatTime(perf.avgFirstResponseTime)}</div>
                    </div>

                    {/* Resolution Compliance */}
                    <div className={`rounded-lg p-3 ${getComplianceColor(perf.resolutionCompliance)}`}>
                      <div className="flex items-center gap-1 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-medium">Resolution SLA</span>
                      </div>
                      <div className="text-2xl font-bold">{perf.resolutionCompliance.toFixed(1)}%</div>
                      <div className="text-xs mt-1">{perf.metResolution}/{perf.totalTickets} met</div>
                      <div className="text-xs">Avg: {perf.avgResolutionTime.toFixed(1)}h</div>
                    </div>

                    {/* Response Breaches */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-orange-700 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Response Breach</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900">{perf.breachedFirstResponse}</div>
                      <div className="text-xs text-orange-700 mt-1">
                        {((perf.breachedFirstResponse / perf.totalTickets) * 100).toFixed(1)}% of total
                      </div>
                    </div>

                    {/* Resolution Breaches */}
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-red-700 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Resolution Breach</span>
                      </div>
                      <div className="text-2xl font-bold text-red-900">{perf.breachedResolution}</div>
                      <div className="text-xs text-red-700 mt-1">
                        {((perf.breachedResolution / perf.totalTickets) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>

                  {/* Compliance Bars */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>First Response Compliance</span>
                        <span className="font-medium">{perf.firstResponseCompliance.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            perf.firstResponseCompliance >= 95 ? 'bg-green-500' :
                            perf.firstResponseCompliance >= 85 ? 'bg-blue-500' :
                            perf.firstResponseCompliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${perf.firstResponseCompliance}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Resolution Compliance</span>
                        <span className="font-medium">{perf.resolutionCompliance.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            perf.resolutionCompliance >= 95 ? 'bg-green-500' :
                            perf.resolutionCompliance >= 85 ? 'bg-blue-500' :
                            perf.resolutionCompliance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${perf.resolutionCompliance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Target className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SLA policies found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
