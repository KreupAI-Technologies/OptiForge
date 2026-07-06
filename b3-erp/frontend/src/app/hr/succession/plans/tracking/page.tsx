'use client';

import { useState, useMemo, useEffect } from 'react';
import { Clock, TrendingUp, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface SuccessionPlan {
  id: string;
  planId: string;
  positionTitle: string;
  department: string;
  currentHolder: string;
  status: 'active' | 'on_track' | 'at_risk' | 'delayed' | 'completed';
  progress: number;
  successors: number;
  readySuccessors: number;
  startDate: string;
  targetDate: string;
  lastUpdated: string;
  milestones: {
    name: string;
    completed: boolean;
    dueDate: string;
  }[];
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [rows, setRows] = useState<SuccessionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<SuccessionPlan>('plan');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPlans = rows.filter(plan => {
    if (selectedStatus !== 'all' && plan.status !== selectedStatus) return false;
    if (selectedDepartment !== 'all' && plan.department !== selectedDepartment) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: rows.length,
    onTrack: rows.filter(p => p.status === 'on_track').length,
    atRisk: rows.filter(p => p.status === 'at_risk').length,
    delayed: rows.filter(p => p.status === 'delayed').length,
    completed: rows.filter(p => p.status === 'completed').length
  }), [rows]);

  const statusColors = {
    active: 'bg-blue-100 text-blue-700',
    on_track: 'bg-green-100 text-green-700',
    at_risk: 'bg-yellow-100 text-yellow-700',
    delayed: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-700'
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-6 w-6 text-teal-600" />
          Succession Plan Tracking
        </h1>
        <p className="text-sm text-gray-600 mt-1">Monitor progress of succession plans</p>
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Plans</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">On Track</p>
          <p className="text-2xl font-bold text-green-900">{stats.onTrack}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">At Risk</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.atRisk}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Delayed</p>
          <p className="text-2xl font-bold text-red-900">{stats.delayed}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Status</option>
              <option value="on_track">On Track</option>
              <option value="at_risk">At Risk</option>
              <option value="delayed">Delayed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredPlans.map(plan => {
          const daysRemaining = getDaysRemaining(plan.targetDate);
          const completedMilestones = plan.milestones.filter(m => m.completed).length;
          const totalMilestones = plan.milestones.length;

          return (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{plan.positionTitle}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[plan.status]}`}>
                      {plan.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.planId} • {plan.currentHolder} • {plan.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-teal-600">{plan.progress}%</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600 uppercase font-medium mb-1">Successors</p>
                  <p className="text-lg font-bold text-blue-900">{plan.successors}</p>
                  <p className="text-xs text-blue-600">{plan.readySuccessors} ready now</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-600 uppercase font-medium mb-1">Milestones</p>
                  <p className="text-lg font-bold text-green-900">{completedMilestones}/{totalMilestones}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-600 uppercase font-medium mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Target Date
                  </p>
                  <p className="text-sm font-bold text-purple-900">
                    {new Date(plan.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${daysRemaining < 30 ? 'bg-red-50' : daysRemaining < 90 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <p className={`text-xs uppercase font-medium mb-1 ${daysRemaining < 30 ? 'text-red-600' : daysRemaining < 90 ? 'text-yellow-600' : 'text-gray-600'}`}>
                    Days Remaining
                  </p>
                  <p className={`text-lg font-bold ${daysRemaining < 30 ? 'text-red-900' : daysRemaining < 90 ? 'text-yellow-900' : 'text-gray-900'}`}>
                    {daysRemaining}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium">Progress</p>
                  <p className="text-xs text-gray-600">{plan.progress}% complete</p>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full ${
                      plan.status === 'completed' ? 'bg-gray-500' :
                      plan.status === 'on_track' ? 'bg-green-500' :
                      plan.status === 'at_risk' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-2">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Milestones</h4>
                <div className="space-y-2">
                  {plan.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <p className={`text-sm ${milestone.completed ? 'text-gray-700 line-through' : 'text-gray-900 font-medium'}`}>
                          {milestone.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(milestone.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {plan.status === 'at_risk' && (
                <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <p className="text-xs text-yellow-700 uppercase font-medium">Action Required</p>
                  </div>
                  <p className="text-sm text-yellow-900">Plan is at risk. Review development activities and timeline.</p>
                </div>
              )}

              {plan.status === 'delayed' && (
                <div className="bg-red-50 rounded-lg p-3 mb-2 border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-xs text-red-700 uppercase font-medium">Delayed</p>
                  </div>
                  <p className="text-sm text-red-900">Plan is behind schedule. Immediate attention required.</p>
                </div>
              )}

              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
                <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
                  Update Progress
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
