'use client';

import { useState, useMemo, useEffect } from 'react';
import { User, Target, TrendingUp, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrTalentService } from '@/services/hr-talent.service';

interface MyGoal {
  id: string;
  title: string;
  description: string;
  category: 'individual' | 'team' | 'department';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  progress: number;
  weight: number;
  status: 'on_track' | 'at_risk' | 'completed' | 'overdue';
  kpiCount: number;
}

export default function MyGoalsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const mockGoals: MyGoal[] = [
    {
      id: '1', title: 'Improve Production Efficiency', description: 'Increase overall production efficiency by 15%',
      category: 'department', priority: 'high', startDate: '2024-11-01', endDate: '2025-03-31',
      progress: 65, weight: 30, status: 'on_track', kpiCount: 3
    },
    {
      id: '2', title: 'Reduce Quality Defects', description: 'Reduce manufacturing defects by 20%',
      category: 'individual', priority: 'high', startDate: '2024-11-01', endDate: '2025-02-28',
      progress: 45, weight: 25, status: 'at_risk', kpiCount: 2
    },
    {
      id: '3', title: 'Team Skill Development', description: 'Complete technical training for team members',
      category: 'team', priority: 'medium', startDate: '2024-11-15', endDate: '2025-01-31',
      progress: 80, weight: 20, status: 'on_track', kpiCount: 4
    },
    {
      id: '4', title: 'Process Documentation', description: 'Document all manufacturing SOPs',
      category: 'individual', priority: 'medium', startDate: '2024-10-01', endDate: '2024-12-31',
      progress: 90, weight: 15, status: 'on_track', kpiCount: 1
    },
    {
      id: '5', title: 'Cost Reduction Initiative', description: 'Reduce operational costs by 10%',
      category: 'department', priority: 'high', startDate: '2024-09-01', endDate: '2024-11-30',
      progress: 100, weight: 25, status: 'completed', kpiCount: 3
    }
  ];

  const [rows, setRows] = useState<MyGoal[]>(mockGoals);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getPerformance<MyGoal>('my-goal');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredGoals = useMemo(() => {
    if (selectedStatus === 'all') return rows;
    return rows.filter(goal => goal.status === selectedStatus);
  }, [selectedStatus, rows]);

  const stats = {
    total: rows.length,
    onTrack: rows.filter(g => g.status === 'on_track').length,
    atRisk: rows.filter(g => g.status === 'at_risk').length,
    completed: rows.filter(g => g.status === 'completed').length,
    avgProgress: rows.length ? Math.round(rows.reduce((sum, g) => sum + g.progress, 0) / rows.length) : 0
  };

  const getStatusColor = (status: string) => {
    const colors = {
      on_track: 'bg-green-100 text-green-800',
      at_risk: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const columns = [
    { key: 'title', label: 'Goal', sortable: true,
      render: (v: string, row: MyGoal) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    { key: 'category', label: 'Category', sortable: true,
      render: (v: string) => (
        <span className="capitalize text-sm text-gray-700">{v}</span>
      )
    },
    { key: 'priority', label: 'Priority', sortable: true,
      render: (v: string) => {
        const colors = {
          high: 'bg-red-100 text-red-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-green-100 text-green-800'
        };
        return (
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[v as keyof typeof colors]}`}>
            {v.toUpperCase()}
          </span>
        );
      }
    },
    { key: 'progress', label: 'Progress', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div className={`h-2 rounded-full ${getProgressColor(v)}`} style={{ width: `${v}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-900">{v}%</span>
        </div>
      )
    },
    { key: 'weight', label: 'Weight', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v}%</div>
    },
    { key: 'endDate', label: 'Due Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <User className="h-8 w-8 text-purple-600" />
          My Goals
        </h1>
        <p className="text-gray-600 mt-2">Track your personal performance objectives</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
            <Target className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-green-600">{stats.onTrack}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.avgProgress}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Goals</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Goals Table */}
      <DataTable data={filteredGoals} columns={columns} />
    </div>
  );
}
