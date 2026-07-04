'use client';

import { useEffect, useMemo, useState } from 'react';
import { PieChart, Search, Filter, Download, TrendingUp, User, Briefcase, Clock, AlertTriangle, Users, DollarSign, Activity } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

type ResourceUtilization = {
  id: string;
  resourceId: string;
  name: string;
  role: string;
  dept: string;
  email: string;
  utilizationPct: number; // 0-100
  billablePct: number; // 0-100
  availableHours: number;
  allocatedHours: number;
  billableHours: number;
  nonBillableHours: number;
  activeProjects: number;
  efficiency: number; // 0-100
  status: 'optimal' | 'under-utilized' | 'over-utilized' | 'at-capacity';
  trend: 'improving' | 'declining' | 'stable';
  costPerHour: number;
  revenueGenerated: number;
};

const VALID_STATUSES: ResourceUtilization['status'][] = ['optimal', 'under-utilized', 'over-utilized', 'at-capacity'];
const VALID_TRENDS: ResourceUtilization['trend'][] = ['improving', 'declining', 'stable'];

// Maps a raw backend record (field names may vary; array is currently empty) into the
// strongly-typed ResourceUtilization the UI renders. Derives values not sent by the API.
function mapResourceUtilization(r: any, index: number): ResourceUtilization {
  const availableHours = Number(r?.totalCapacity ?? r?.availableHours ?? r?.availability ?? 160) || 0;
  const allocatedHours = Number(r?.allocatedHours ?? r?.actualHours ?? 0) || 0;
  const billableHours = Number(r?.billableHours ?? 0) || 0;
  const nonBillableHours = Number(r?.nonBillableHours ?? Math.max(allocatedHours - billableHours, 0)) || 0;

  const utilizationPct = Number(
    r?.utilization ?? r?.utilizationPct ?? (availableHours > 0 ? Math.round((allocatedHours / availableHours) * 100) : 0)
  ) || 0;
  const billablePct = Number(
    r?.billablePct ?? (allocatedHours > 0 ? Math.round((billableHours / allocatedHours) * 100) : 0)
  ) || 0;

  const rawStatus = String(r?.status ?? '').toLowerCase().replace(/[_\s]+/g, '-');
  const status: ResourceUtilization['status'] = VALID_STATUSES.includes(rawStatus as any)
    ? (rawStatus as ResourceUtilization['status'])
    : utilizationPct > 95
      ? 'over-utilized'
      : utilizationPct >= 85
        ? 'at-capacity'
        : utilizationPct < 60
          ? 'under-utilized'
          : 'optimal';

  const rawTrend = String(r?.trend ?? '').toLowerCase();
  const trend: ResourceUtilization['trend'] = VALID_TRENDS.includes(rawTrend as any)
    ? (rawTrend as ResourceUtilization['trend'])
    : 'stable';

  const costPerHour = Number(r?.costPerHour ?? 0) || 0;

  return {
    id: String(r?.id ?? r?.resourceId ?? index + 1),
    resourceId: String(r?.resourceId ?? r?.id ?? ''),
    name: r?.resourceName ?? r?.name ?? '',
    role: r?.role ?? '',
    dept: r?.department ?? r?.dept ?? '',
    email: r?.email ?? '',
    utilizationPct,
    billablePct,
    availableHours,
    allocatedHours,
    billableHours,
    nonBillableHours,
    activeProjects: Number(r?.activeProjects ?? 0) || 0,
    efficiency: Number(r?.efficiency ?? 0) || 0,
    status,
    trend,
    costPerHour,
    revenueGenerated: Number(r?.revenueGenerated ?? billableHours * costPerHour) || 0,
  };
}

export default function ResourceUtilizationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [resources, setResources] = useState<ResourceUtilization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.getProjectsResourceUtilization();
        const mapped = (Array.isArray(raw) ? raw : []).map((r: any, i: number) => mapResourceUtilization(r, i));
        if (!cancelled) setResources(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setResources([]);
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

  const depts = useMemo(() => ['all', ...Array.from(new Set(resources.map(r => r.dept).filter(Boolean)))], [resources]);
  const roles = useMemo(() => ['all', ...Array.from(new Set(resources.map(r => r.role).filter(Boolean)))], [resources]);

  const filtered = useMemo(() => resources.filter(r => {
    const matchesSearch = [r.name, r.role, r.dept, r.resourceId, r.email].some(v => (v ?? '').toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === 'all' ? true : r.dept === deptFilter;
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    const matchesRole = roleFilter === 'all' ? true : r.role === roleFilter;
    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  }), [resources, searchTerm, deptFilter, statusFilter, roleFilter]);

  // Calculate aggregated stats (derived from fetched state; divide-by-zero guarded)
  const totalResources = resources.length;
  const avgUtilization = totalResources === 0
    ? 0
    : Math.round(resources.reduce((sum, r) => sum + r.utilizationPct, 0) / totalResources);
  const optimalCount = resources.filter(r => r.status === 'optimal' || r.status === 'at-capacity').length;
  const underUtilizedCount = resources.filter(r => r.status === 'under-utilized').length;
  const overUtilizedCount = resources.filter(r => r.status === 'over-utilized').length;
  const totalBillableHours = resources.reduce((sum, r) => sum + r.billableHours, 0);
  const totalRevenue = resources.reduce((sum, r) => sum + r.revenueGenerated, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-50 text-green-700';
      case 'at-capacity': return 'bg-blue-50 text-blue-700';
      case 'under-utilized': return 'bg-yellow-50 text-yellow-700';
      case 'over-utilized': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '↑';
      case 'declining': return '↓';
      default: return '→';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <PieChart className="h-8 w-8 text-teal-600" />
          Resource Utilization
        </h1>
        <p className="text-gray-600 mt-2">Resource usage analytics, optimization, and capacity planning</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search resources by name, role, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button onClick={() => exportToCsv('resource-utilization', filtered)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Resources</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalResources}</p>
            </div>
            <Users className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Avg Utilization</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{avgUtilization}%</p>
            </div>
            <PieChart className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Optimal</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{optimalCount}</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Under-utilized</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{underUtilizedCount}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Over-utilized</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{overUtilizedCount}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">₹{(totalRevenue / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </div>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {depts.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {roles.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Status</option>
            <option value="optimal">Optimal</option>
            <option value="at-capacity">At Capacity</option>
            <option value="under-utilized">Under-utilized</option>
            <option value="over-utilized">Over-utilized</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setDeptFilter('all');
              setStatusFilter('all');
              setRoleFilter('all');
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Resource table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Resource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Role/Dept</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Utilization</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Billable %</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Hours</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Projects</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Efficiency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">Loading resource utilization...</td>
                </tr>
              )}
              {!isLoading && loadError && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-red-600">{loadError}</td>
                </tr>
              )}
              {!isLoading && !loadError && filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{r.name}</span>
                        <span className="text-xs text-gray-500">{r.resourceId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-800">{r.role}</span>
                      <span className="text-xs text-gray-500">{r.dept}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-40">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div
                          className={`h-2 rounded ${r.utilizationPct > 85 ? 'bg-red-500' : r.utilizationPct < 60 ? 'bg-yellow-500' : 'bg-green-600'}`}
                          style={{ width: `${r.utilizationPct}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{r.utilizationPct}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div className="h-2 rounded bg-indigo-500" style={{ width: `${r.billablePct}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{r.billablePct}%</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-xs">
                      <span className="text-gray-900 font-medium">{r.allocatedHours}/{r.availableHours}h</span>
                      <span className="text-gray-500">B: {r.billableHours}h | NB: {r.nonBillableHours}h</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      {r.activeProjects}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{r.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(r.status)}`}>
                      {r.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`flex items-center gap-1 ${getTrendColor(r.trend)}`}>
                      <span className="text-lg">{getTrendIcon(r.trend)}</span>
                      <span className="text-xs capitalize">{r.trend}</span>
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && !loadError && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">No resources found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Resource Utilization Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Utilization Ranges:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="font-medium">0-60%:</span> Under-utilized - Can take more work</li>
              <li><span className="font-medium">60-70%:</span> Good utilization with flexibility</li>
              <li><span className="font-medium">70-85%:</span> Optimal range for productivity</li>
              <li><span className="font-medium">85-95%:</span> At capacity - Monitor for burnout</li>
              <li><span className="font-medium">&gt;95%:</span> Over-utilized - Reassign or reschedule</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Balance billable and non-billable work</li>
              <li>Track efficiency trends for performance reviews</li>
              <li>Reassign work from over-utilized resources</li>
              <li>Provide training to under-utilized resources</li>
              <li>Monitor project count for optimal focus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
