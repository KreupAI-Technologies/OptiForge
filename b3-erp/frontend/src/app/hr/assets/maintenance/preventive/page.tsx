'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface PreventiveMaintenance {
  id: string;
  scheduleId: string;
  assetTag: string;
  assetName: string;
  assetCategory: 'laptop' | 'desktop' | 'mobile' | 'printer' | 'server' | 'network' | 'hvac' | 'other';
  maintenanceType: 'cleaning' | 'inspection' | 'calibration' | 'lubrication' | 'software_update' | 'comprehensive';
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  assignedTo: string;
  estimatedDuration: number;
  status: 'upcoming' | 'due' | 'overdue' | 'completed' | 'skipped';
  location: string;
  checklist: {
    item: string;
    completed: boolean;
  }[];
  priority: 'low' | 'medium' | 'high';
  remarks?: string;
}

function parseChecklist(value: unknown): { item: string; completed: boolean }[] {
  if (Array.isArray(value)) return value as { item: string; completed: boolean }[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFrequency, setSelectedFrequency] = useState('all');
  const [schedules, setSchedules] = useState<PreventiveMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrAssetsService.getPreventiveMaintenance();
        const mapped: PreventiveMaintenance[] = raw.map((s) => ({
          id: String(s.id),
          scheduleId: s.scheduleId ?? '',
          assetTag: s.assetTag ?? '',
          assetName: s.assetName ?? '',
          assetCategory: (s.assetCategory ?? 'other') as PreventiveMaintenance['assetCategory'],
          maintenanceType: (s.maintenanceType ?? 'inspection') as PreventiveMaintenance['maintenanceType'],
          frequency: (s.frequency ?? 'monthly') as PreventiveMaintenance['frequency'],
          lastMaintenanceDate: s.lastMaintenanceDate ?? '',
          nextMaintenanceDate: s.nextMaintenanceDate ?? '',
          assignedTo: s.assignedTo ?? '',
          estimatedDuration: Number(s.estimatedDuration ?? 0),
          status: (s.status ?? 'upcoming') as PreventiveMaintenance['status'],
          location: s.location ?? '',
          checklist: parseChecklist(s.checklist),
          priority: (s.priority ?? 'low') as PreventiveMaintenance['priority'],
          remarks: s.remarks ?? undefined,
        }));
        if (!cancelled) setSchedules(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load preventive maintenance schedules');
          setSchedules([]);
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

  const filteredSchedules = schedules.filter(s => {
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    if (selectedCategory !== 'all' && s.assetCategory !== selectedCategory) return false;
    if (selectedFrequency !== 'all' && s.frequency !== selectedFrequency) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: schedules.length,
    due: schedules.filter(s => s.status === 'due').length,
    overdue: schedules.filter(s => s.status === 'overdue').length,
    upcoming: schedules.filter(s => s.status === 'upcoming').length,
    completed: schedules.filter(s => s.status === 'completed').length
  }), [schedules]);

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    due: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700',
    skipped: 'bg-gray-100 text-gray-700'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700'
  };

  const frequencyLabel = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    half_yearly: 'Half-Yearly',
    annual: 'Annual'
  };

  const getDaysUntilMaintenance = (nextDate: string) => {
    const today = new Date();
    const next = new Date(nextDate);
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Preventive Maintenance</h1>
        <p className="text-sm text-gray-600 mt-1">Scheduled maintenance activities for assets</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading preventive maintenance schedules…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Schedules</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Due</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.due}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <p className="text-sm font-medium text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-900 mt-1">{stats.overdue}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Upcoming</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.upcoming}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="server">Server</option>
              <option value="printer">Printer</option>
              <option value="network">Network</option>
              <option value="hvac">HVAC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
            <select value={selectedFrequency} onChange={(e) => setSelectedFrequency(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Frequencies</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half-Yearly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Add Schedule
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredSchedules.map(schedule => {
          const daysUntil = getDaysUntilMaintenance(schedule.nextMaintenanceDate);
          const completedItems = schedule.checklist.filter(item => item.completed).length;
          const totalItems = schedule.checklist.length;
          const completionPercent = (completedItems / totalItems) * 100;

          return (
            <div key={schedule.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{schedule.assetName}</h3>
                      <p className="text-sm text-gray-600">Schedule: {schedule.scheduleId} • Asset: {schedule.assetTag}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[schedule.priority]}`}>
                      {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[schedule.status]}`}>
                      {schedule.status === 'upcoming' ? 'Upcoming' : schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700">
                      {frequencyLabel[schedule.frequency]}
                    </span>
                    {schedule.status === 'overdue' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-red-50 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {Math.abs(daysUntil)} days overdue
                      </span>
                    )}
                    {schedule.status === 'due' && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-50 text-yellow-700">
                        Due in {daysUntil} days
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Next Maintenance</p>
                  <p className="text-lg font-bold text-blue-600">{new Date(schedule.nextMaintenanceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs text-gray-600 mt-1 flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    ~{schedule.estimatedDuration}h
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Maintenance Type</p>
                  <p className="text-sm font-semibold text-gray-900">{schedule.maintenanceType.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned To</p>
                  <p className="text-sm font-semibold text-gray-900">{schedule.assignedTo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Maintenance</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(schedule.lastMaintenanceDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{schedule.location}</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 uppercase font-medium">Maintenance Checklist</p>
                  <p className="text-xs font-semibold text-gray-900">{completedItems}/{totalItems} completed</p>
                </div>
                <div className="bg-gray-200 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full ${completionPercent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${completionPercent}%` }}></div>
                </div>
                <div className="space-y-2">
                  {schedule.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {item.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                      )}
                      <span className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {schedule.remarks && (
                <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                  <p className="text-xs text-yellow-700 uppercase font-medium mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Remarks
                  </p>
                  <p className="text-sm text-yellow-800">{schedule.remarks}</p>
                </div>
              )}

              <div className="flex gap-2">
                {schedule.status === 'upcoming' && (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    Reschedule
                  </button>
                )}
                {(schedule.status === 'due' || schedule.status === 'overdue') && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    Start Maintenance
                  </button>
                )}
                {schedule.status === 'completed' && (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    View Report
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
