'use client';

import { useMemo, useState } from 'react';
import { PieChart, Search, Filter, Download, TrendingUp, User, Briefcase, Clock, AlertTriangle, Users, DollarSign, Activity } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

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

const RESOURCE_UTILIZATION: ResourceUtilization[] = [
  {
    id: '1',
    resourceId: 'RES-101',
    name: 'Amit Singh',
    role: 'Project Manager',
    dept: 'Projects',
    email: 'amit.singh@company.com',
    utilizationPct: 82,
    billablePct: 90,
    availableHours: 160,
    allocatedHours: 131,
    billableHours: 118,
    nonBillableHours: 13,
    activeProjects: 4,
    efficiency: 95,
    status: 'optimal',
    trend: 'stable',
    costPerHour: 2500,
    revenueGenerated: 295000
  },
  {
    id: '2',
    resourceId: 'RES-102',
    name: 'Priya Patel',
    role: 'Designer',
    dept: 'Design',
    email: 'priya.patel@company.com',
    utilizationPct: 75,
    billablePct: 85,
    availableHours: 160,
    allocatedHours: 120,
    billableHours: 102,
    nonBillableHours: 18,
    activeProjects: 3,
    efficiency: 88,
    status: 'optimal',
    trend: 'improving',
    costPerHour: 2000,
    revenueGenerated: 204000
  },
  {
    id: '3',
    resourceId: 'RES-103',
    name: 'Rahul Kumar',
    role: 'Project Manager',
    dept: 'Projects',
    email: 'rahul.kumar@company.com',
    utilizationPct: 92,
    billablePct: 95,
    availableHours: 160,
    allocatedHours: 147,
    billableHours: 140,
    nonBillableHours: 7,
    activeProjects: 5,
    efficiency: 92,
    status: 'over-utilized',
    trend: 'declining',
    costPerHour: 2500,
    revenueGenerated: 350000
  },
  {
    id: '4',
    resourceId: 'RES-104',
    name: 'Sara Ali',
    role: 'Installer',
    dept: 'Installation',
    email: 'sara.ali@company.com',
    utilizationPct: 48,
    billablePct: 60,
    availableHours: 160,
    allocatedHours: 77,
    billableHours: 46,
    nonBillableHours: 31,
    activeProjects: 2,
    efficiency: 72,
    status: 'under-utilized',
    trend: 'stable',
    costPerHour: 1500,
    revenueGenerated: 69000
  },
  {
    id: '5',
    resourceId: 'RES-105',
    name: 'Vikram Reddy',
    role: 'Assembler',
    dept: 'Production',
    email: 'vikram.reddy@company.com',
    utilizationPct: 78,
    billablePct: 92,
    availableHours: 160,
    allocatedHours: 125,
    billableHours: 115,
    nonBillableHours: 10,
    activeProjects: 3,
    efficiency: 90,
    status: 'optimal',
    trend: 'improving',
    costPerHour: 1800,
    revenueGenerated: 207000
  },
  {
    id: '6',
    resourceId: 'RES-106',
    name: 'Karthik Iyer',
    role: 'Electrician',
    dept: 'Installation',
    email: 'karthik.iyer@company.com',
    utilizationPct: 85,
    billablePct: 88,
    availableHours: 160,
    allocatedHours: 136,
    billableHours: 120,
    nonBillableHours: 16,
    activeProjects: 4,
    efficiency: 91,
    status: 'at-capacity',
    trend: 'stable',
    costPerHour: 1600,
    revenueGenerated: 192000
  },
  {
    id: '7',
    resourceId: 'RES-107',
    name: 'Neha Gupta',
    role: 'Procurement Officer',
    dept: 'Procurement',
    email: 'neha.gupta@company.com',
    utilizationPct: 65,
    billablePct: 45,
    availableHours: 160,
    allocatedHours: 104,
    billableHours: 47,
    nonBillableHours: 57,
    activeProjects: 5,
    efficiency: 78,
    status: 'under-utilized',
    trend: 'improving',
    costPerHour: 1400,
    revenueGenerated: 65800
  },
  {
    id: '8',
    resourceId: 'RES-108',
    name: 'Deepak Singh',
    role: 'Finisher',
    dept: 'Production',
    email: 'deepak.singh@company.com',
    utilizationPct: 88,
    billablePct: 95,
    availableHours: 160,
    allocatedHours: 141,
    billableHours: 134,
    nonBillableHours: 7,
    activeProjects: 4,
    efficiency: 94,
    status: 'over-utilized',
    trend: 'declining',
    costPerHour: 1700,
    revenueGenerated: 227800
  },
  {
    id: '9',
    resourceId: 'RES-109',
    name: 'Arjun Nair',
    role: 'Site Engineer',
    dept: 'Engineering',
    email: 'arjun.nair@company.com',
    utilizationPct: 72,
    billablePct: 80,
    availableHours: 160,
    allocatedHours: 115,
    billableHours: 92,
    nonBillableHours: 23,
    activeProjects: 3,
    efficiency: 85,
    status: 'optimal',
    trend: 'stable',
    costPerHour: 2200,
    revenueGenerated: 202400
  },
  {
    id: '10',
    resourceId: 'RES-110',
    name: 'Meera Kapoor',
    role: 'Project Coordinator',
    dept: 'Projects',
    email: 'meera.kapoor@company.com',
    utilizationPct: 55,
    billablePct: 50,
    availableHours: 160,
    allocatedHours: 88,
    billableHours: 44,
    nonBillableHours: 44,
    activeProjects: 4,
    efficiency: 75,
    status: 'under-utilized',
    trend: 'declining',
    costPerHour: 1300,
    revenueGenerated: 57200
  },
  {
    id: '11',
    resourceId: 'RES-111',
    name: 'Anjali Sharma',
    role: 'QC Inspector',
    dept: 'Quality',
    email: 'anjali.sharma@company.com',
    utilizationPct: 70,
    billablePct: 65,
    availableHours: 160,
    allocatedHours: 112,
    billableHours: 73,
    nonBillableHours: 39,
    activeProjects: 5,
    efficiency: 82,
    status: 'optimal',
    trend: 'improving',
    costPerHour: 1500,
    revenueGenerated: 109500
  },
  {
    id: '12',
    resourceId: 'RES-112',
    name: 'Suresh Kumar',
    role: 'Safety Officer',
    dept: 'Safety',
    email: 'suresh.kumar@company.com',
    utilizationPct: 60,
    billablePct: 40,
    availableHours: 160,
    allocatedHours: 96,
    billableHours: 38,
    nonBillableHours: 58,
    activeProjects: 6,
    efficiency: 70,
    status: 'under-utilized',
    trend: 'stable',
    costPerHour: 1600,
    revenueGenerated: 60800
  },
  {
    id: '13',
    resourceId: 'RES-113',
    name: 'Geeta Rao',
    role: 'Vendor Manager',
    dept: 'Procurement',
    email: 'geeta.rao@company.com',
    utilizationPct: 68,
    billablePct: 55,
    availableHours: 160,
    allocatedHours: 109,
    billableHours: 60,
    nonBillableHours: 49,
    activeProjects: 4,
    efficiency: 76,
    status: 'under-utilized',
    trend: 'improving',
    costPerHour: 1400,
    revenueGenerated: 84000
  },
  {
    id: '14',
    resourceId: 'RES-114',
    name: 'Mohammad Ali',
    role: 'Plumber',
    dept: 'Installation',
    email: 'mohammad.ali@company.com',
    utilizationPct: 80,
    billablePct: 90,
    availableHours: 160,
    allocatedHours: 128,
    billableHours: 115,
    nonBillableHours: 13,
    activeProjects: 3,
    efficiency: 89,
    status: 'optimal',
    trend: 'stable',
    costPerHour: 1500,
    revenueGenerated: 172500
  },
  {
    id: '15',
    resourceId: 'RES-115',
    name: 'Lakshmi Iyer',
    role: 'Documentation Specialist',
    dept: 'Administration',
    email: 'lakshmi.iyer@company.com',
    utilizationPct: 52,
    billablePct: 30,
    availableHours: 160,
    allocatedHours: 83,
    billableHours: 25,
    nonBillableHours: 58,
    activeProjects: 5,
    efficiency: 68,
    status: 'under-utilized',
    trend: 'declining',
    costPerHour: 1200,
    revenueGenerated: 30000
  }
];

export default function ResourceUtilizationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const depts = useMemo(() => ['all', ...Array.from(new Set(RESOURCE_UTILIZATION.map(r => r.dept)))], []);
  const roles = useMemo(() => ['all', ...Array.from(new Set(RESOURCE_UTILIZATION.map(r => r.role)))], []);

  const filtered = useMemo(() => RESOURCE_UTILIZATION.filter(r => {
    const matchesSearch = [r.name, r.role, r.dept, r.resourceId, r.email].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === 'all' ? true : r.dept === deptFilter;
    const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
    const matchesRole = roleFilter === 'all' ? true : r.role === roleFilter;
    return matchesSearch && matchesDept && matchesStatus && matchesRole;
  }), [searchTerm, deptFilter, statusFilter, roleFilter]);

  // Calculate aggregated stats
  const totalResources = RESOURCE_UTILIZATION.length;
  const avgUtilization = Math.round(RESOURCE_UTILIZATION.reduce((sum, r) => sum + r.utilizationPct, 0) / totalResources);
  const optimalCount = RESOURCE_UTILIZATION.filter(r => r.status === 'optimal' || r.status === 'at-capacity').length;
  const underUtilizedCount = RESOURCE_UTILIZATION.filter(r => r.status === 'under-utilized').length;
  const overUtilizedCount = RESOURCE_UTILIZATION.filter(r => r.status === 'over-utilized').length;
  const totalBillableHours = RESOURCE_UTILIZATION.reduce((sum, r) => sum + r.billableHours, 0);
  const totalRevenue = RESOURCE_UTILIZATION.reduce((sum, r) => sum + r.revenueGenerated, 0);

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
              {filtered.map(r => (
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
              {filtered.length === 0 && (
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
