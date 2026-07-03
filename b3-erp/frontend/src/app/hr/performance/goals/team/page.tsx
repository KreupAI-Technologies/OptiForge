'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Target, TrendingUp, CheckCircle, AlertCircle, Award } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrTalentService } from '@/services/hr-talent.service';

interface TeamGoal {
  id: string;
  title: string;
  description: string;
  teamName: string;
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate: string;
  progress: number;
  weight: number;
  status: 'on_track' | 'at_risk' | 'completed' | 'overdue';
  owner: string;
  kpiCount: number;
  contributingMembers: number;
}

export default function TeamGoalsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const mockGoals: TeamGoal[] = [
    {
      id: '1', title: 'Manufacturing Excellence Initiative', description: 'Achieve 98% first-pass quality rate',
      teamName: 'Production Team A', teamSize: 12, priority: 'high', startDate: '2024-11-01', endDate: '2025-03-31',
      progress: 70, weight: 35, status: 'on_track', owner: 'Rajesh Kumar', kpiCount: 4, contributingMembers: 10
    },
    {
      id: '2', title: 'Reduce Machine Downtime', description: 'Decrease downtime by 25% through preventive maintenance',
      teamName: 'Maintenance Team', teamSize: 8, priority: 'high', startDate: '2024-11-01', endDate: '2025-02-28',
      progress: 55, weight: 30, status: 'on_track', owner: 'Suresh Patel', kpiCount: 3, contributingMembers: 7
    },
    {
      id: '3', title: 'Safety Training Completion', description: 'Complete safety certification for all team members',
      teamName: 'Production Team B', teamSize: 15, priority: 'high', startDate: '2024-10-15', endDate: '2024-12-31',
      progress: 85, weight: 25, status: 'on_track', owner: 'Priya Sharma', kpiCount: 2, contributingMembers: 15
    },
    {
      id: '4', title: 'Inventory Optimization', description: 'Reduce raw material waste by 15%',
      teamName: 'Warehouse Team', teamSize: 10, priority: 'medium', startDate: '2024-11-01', endDate: '2025-01-31',
      progress: 40, weight: 20, status: 'at_risk', owner: 'Amit Singh', kpiCount: 3, contributingMembers: 8
    },
    {
      id: '5', title: 'Quality Documentation', description: 'Digitize all quality inspection records',
      teamName: 'Quality Assurance', teamSize: 6, priority: 'medium', startDate: '2024-09-01', endDate: '2024-12-15',
      progress: 90, weight: 15, status: 'on_track', owner: 'Meena Rao', kpiCount: 2, contributingMembers: 5
    },
    {
      id: '6', title: 'Energy Conservation Project', description: 'Reduce energy consumption by 12%',
      teamName: 'Production Team A', teamSize: 12, priority: 'medium', startDate: '2024-08-01', endDate: '2024-11-30',
      progress: 100, weight: 20, status: 'completed', owner: 'Rajesh Kumar', kpiCount: 3, contributingMembers: 9
    },
    {
      id: '7', title: 'Cross-Training Initiative', description: 'Train team members on multiple workstations',
      teamName: 'Production Team B', teamSize: 15, priority: 'low', startDate: '2024-11-01', endDate: '2025-04-30',
      progress: 30, weight: 15, status: 'on_track', owner: 'Priya Sharma', kpiCount: 2, contributingMembers: 12
    },
    {
      id: '8', title: 'Supplier Quality Improvement', description: 'Achieve 95% on-time delivery from suppliers',
      teamName: 'Procurement Team', teamSize: 5, priority: 'high', startDate: '2024-10-01', endDate: '2025-01-31',
      progress: 35, weight: 25, status: 'at_risk', owner: 'Vikram Mehta', kpiCount: 4, contributingMembers: 4
    }
  ];

  const [rows, setRows] = useState<TeamGoal[]>(mockGoals);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getPerformance<TeamGoal>('team-goal');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const teams = ['all', ...Array.from(new Set(rows.map(g => g.teamName)))];

  const filteredGoals = useMemo(() => {
    return rows.filter(goal => {
      const matchesStatus = selectedStatus === 'all' || goal.status === selectedStatus;
      const matchesTeam = selectedTeam === 'all' || goal.teamName === selectedTeam;
      return matchesStatus && matchesTeam;
    });
  }, [selectedStatus, selectedTeam, rows]);

  const stats = {
    total: rows.length,
    onTrack: rows.filter(g => g.status === 'on_track').length,
    atRisk: rows.filter(g => g.status === 'at_risk').length,
    completed: rows.filter(g => g.status === 'completed').length,
    teamsCount: new Set(rows.map(g => g.teamName)).size,
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

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors];
  };

  const columns = [
    { key: 'title', label: 'Goal', sortable: true,
      render: (v: string, row: TeamGoal) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    { key: 'teamName', label: 'Team', sortable: true,
      render: (v: string, row: TeamGoal) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.teamSize} members • Owner: {row.owner}</div>
        </div>
      )
    },
    { key: 'priority', label: 'Priority', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(v)}`}>
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'contributingMembers', label: 'Contributors', sortable: true,
      render: (v: number, row: TeamGoal) => (
        <div className="text-sm text-gray-700">{v}/{row.teamSize}</div>
      )
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
          <Users className="h-8 w-8 text-indigo-600" />
          Team Goals
        </h1>
        <p className="text-gray-600 mt-2">Track collaborative team objectives and progress</p>
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Goals</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
            </div>
            <Target className="h-10 w-10 text-indigo-400" />
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
            <Award className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Teams</p>
              <p className="text-2xl font-bold text-purple-600">{stats.teamsCount}</p>
            </div>
            <Users className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgProgress}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Team:</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {teams.map(team => (
                <option key={team} value={team}>
                  {team === 'all' ? 'All Teams' : team}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Goals Table */}
      <DataTable data={filteredGoals} columns={columns} />

      {/* Info Box */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Team Goal Guidelines</h3>
        <ul className="text-sm text-indigo-800 space-y-1">
          <li>• Team goals require collaboration from multiple team members to achieve</li>
          <li>• Progress is aggregated from individual contributions and KPI achievements</li>
          <li>• Team owner is responsible for coordination and tracking progress</li>
          <li>• High-priority team goals should align with departmental objectives</li>
          <li>• Regular team check-ins help maintain goals on track</li>
        </ul>
      </div>
    </div>
  );
}
