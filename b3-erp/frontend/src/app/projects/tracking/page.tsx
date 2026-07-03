'use client';

import { useMemo, useState } from 'react';
import { Activity, Search, Filter, Download, TrendingUp, Calendar, User, Layers } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

export default function ProgressTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_track' | 'at_risk' | 'delayed' | 'completed'>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  type Project = {
    id: string;
    name: string;
    code: string;
    client: string;
    manager: string;
    startDate: string;
    endDate: string;
    progress: number; // 0-100
    status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
    tasksDone: number;
    tasksTotal: number;
    openRisks: number;
    budgetUsedPct: number; // 0-100
  };

  const projects: Project[] = [
    {
      id: 'PRJ-001',
      name: 'Kitchen Fitout - Tower A',
      code: 'KF-A',
      client: 'Sharma Modular Kitchens Pvt Ltd',
      manager: 'Amit Singh',
      startDate: '2025-08-01',
      endDate: '2025-12-15',
      progress: 72,
      status: 'on_track',
      tasksDone: 144,
      tasksTotal: 200,
      openRisks: 2,
      budgetUsedPct: 68,
    },
    {
      id: 'PRJ-002',
      name: 'Luxury Villa Wardrobes',
      code: 'LVW-09',
      client: 'Prestige Developers Bangalore',
      manager: 'Priya Patel',
      startDate: '2025-07-10',
      endDate: '2025-11-20',
      progress: 54,
      status: 'at_risk',
      tasksDone: 97,
      tasksTotal: 180,
      openRisks: 5,
      budgetUsedPct: 74,
    },
    {
      id: 'PRJ-003',
      name: 'Corporate Pantry Rollout',
      code: 'CPR-14',
      client: 'Oberoi Realty Projects',
      manager: 'Rahul Kumar',
      startDate: '2025-06-01',
      endDate: '2025-10-30',
      progress: 88,
      status: 'on_track',
      tasksDone: 220,
      tasksTotal: 250,
      openRisks: 1,
      budgetUsedPct: 81,
    },
    {
      id: 'PRJ-004',
      name: 'Showroom Refurbishment',
      code: 'SRF-22',
      client: 'Urban Interiors & Designers',
      manager: 'Amit Singh',
      startDate: '2025-09-05',
      endDate: '2025-12-31',
      progress: 33,
      status: 'delayed',
      tasksDone: 33,
      tasksTotal: 100,
      openRisks: 7,
      budgetUsedPct: 42,
    },
    {
      id: 'PRJ-005',
      name: 'Premium Kitchen Set (VIP)',
      code: 'PKS-VIP',
      client: 'DLF Home Solutions Limited',
      manager: 'Sarah Williams',
      startDate: '2025-08-20',
      endDate: '2025-12-05',
      progress: 96,
      status: 'completed',
      tasksDone: 180,
      tasksTotal: 180,
      openRisks: 0,
      budgetUsedPct: 95,
    },
    // more mock rows
  ];

  const managers = useMemo(() => ['all', ...Array.from(new Set(projects.map(p => p.manager)))], [projects]);
  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = [p.name, p.code, p.client, p.manager]
        .some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
      const matchesManager = managerFilter === 'all' ? true : p.manager === managerFilter;
      return matchesSearch && matchesStatus && matchesManager;
    });
  }, [projects, searchTerm, statusFilter, managerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const setPageSafe = (n: number) => setPage(Math.min(Math.max(1, n), totalPages));

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="h-8 w-8 text-teal-600" />
          Progress Tracking
        </h1>
        <p className="text-gray-600 mt-2">Monitor project progress and completion status</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects..."
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
            <button onClick={() => exportToCsv('progress-tracking', filtered)} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Overall Progress</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">67%</p>
            </div>
            <Activity className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">On Track</p>
              <p className="text-3xl font-bold text-green-900 mt-1">32</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">At Risk</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">8</p>
            </div>
            <Activity className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Completed Tasks</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">245</p>
            </div>
            <Activity className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters:</span>
          </div>
          <div className="flex gap-2 flex-1">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={managerFilter}
              onChange={(e) => { setManagerFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {managers.map(m => (
                <option key={m} value={m}>{m === 'all' ? 'All Managers' : m}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => {setStatusFilter('all'); setManagerFilter('all'); setSearchTerm(''); setPage(1);}}>Reset</button>
            <button onClick={() => exportToCsv('progress-tracking', filtered)} className="px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Timeline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tasks</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Risks</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Budget</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pageData.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className="text-xs text-gray-500">{p.code} • {p.client}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-700"><User className="h-4 w-4 text-gray-500" /> {p.manager}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> {p.startDate} → {p.endDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-44">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div
                          className={`h-2 rounded ${p.status === 'on_track' ? 'bg-green-500' : p.status === 'at_risk' ? 'bg-yellow-500' : p.status === 'delayed' ? 'bg-red-500' : 'bg-teal-600'}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{p.progress}% • {p.status.replace('_',' ')}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.tasksDone}/{p.tasksTotal}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${p.openRisks === 0 ? 'bg-green-50 text-green-700' : p.openRisks < 3 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>{p.openRisks}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-32">
                      <div className="h-2 w-full bg-gray-100 rounded">
                        <div className="h-2 rounded bg-indigo-500" style={{ width: `${p.budgetUsedPct}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-gray-600">{p.budgetUsedPct}% used</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-teal-700 hover:text-teal-900 text-sm flex items-center gap-1"><Layers className="h-4 w-4" /> View</button>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">Showing {(page-1)*pageSize + 1}-{Math.min(page*pageSize, filtered.length)} of {filtered.length}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" onClick={() => setPageSafe(page-1)} disabled={page===1}>Prev</button>
            <div className="px-2 text-sm">{page} / {totalPages}</div>
            <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" onClick={() => setPageSafe(page+1)} disabled={page===totalPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
