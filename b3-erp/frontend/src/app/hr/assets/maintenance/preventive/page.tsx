'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle, RefreshCw, AlertCircle, X } from 'lucide-react';
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
  const [detailSchedule, setDetailSchedule] = useState<PreventiveMaintenance | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  const handleStartMaintenance = async (schedule: PreventiveMaintenance) => {
    setTransitioningId(schedule.id);
    setLoadError(null);
    try {
      await HrAssetsService.updatePreventiveMaintenance(schedule.id, {
        status: 'completed',
        lastMaintenanceDate: new Date().toISOString().slice(0, 10),
      });
      setSchedules(prev =>
        prev.map(s =>
          s.id === schedule.id
            ? { ...s, status: 'completed', lastMaintenanceDate: new Date().toISOString().slice(0, 10) }
            : s
        )
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update schedule');
    } finally {
      setTransitioningId(null);
    }
  };

  const emptyForm = {
    assetTag: '',
    assetName: '',
    assetCategory: 'laptop',
    maintenanceType: 'inspection',
    frequency: 'monthly',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    assignedTo: '',
    estimatedDuration: '',
    location: '',
    priority: 'low',
  };
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await HrAssetsService.createPreventiveMaintenance({
        assetTag: form.assetTag,
        assetName: form.assetName,
        assetCategory: form.assetCategory,
        maintenanceType: form.maintenanceType,
        frequency: form.frequency,
        lastMaintenanceDate: form.lastMaintenanceDate,
        nextMaintenanceDate: form.nextMaintenanceDate,
        assignedTo: form.assignedTo,
        estimatedDuration: Number(form.estimatedDuration) || 0,
        status: 'upcoming',
        location: form.location,
        checklist: JSON.stringify([]),
        priority: form.priority,
      });
      const row: PreventiveMaintenance = {
        id: String(created.id),
        scheduleId: created.scheduleId ?? '',
        assetTag: created.assetTag ?? form.assetTag,
        assetName: created.assetName ?? form.assetName,
        assetCategory: (created.assetCategory ?? form.assetCategory) as PreventiveMaintenance['assetCategory'],
        maintenanceType: (created.maintenanceType ?? form.maintenanceType) as PreventiveMaintenance['maintenanceType'],
        frequency: (created.frequency ?? form.frequency) as PreventiveMaintenance['frequency'],
        lastMaintenanceDate: created.lastMaintenanceDate ?? form.lastMaintenanceDate,
        nextMaintenanceDate: created.nextMaintenanceDate ?? form.nextMaintenanceDate,
        assignedTo: created.assignedTo ?? form.assignedTo,
        estimatedDuration: Number(created.estimatedDuration ?? form.estimatedDuration ?? 0),
        status: (created.status ?? 'upcoming') as PreventiveMaintenance['status'],
        location: created.location ?? form.location,
        checklist: parseChecklist(created.checklist),
        priority: (created.priority ?? form.priority) as PreventiveMaintenance['priority'],
        remarks: created.remarks ?? undefined,
      };
      setSchedules((prev) => [row, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to add schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <button onClick={() => setShowForm(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
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
                  <button onClick={() => setDetailSchedule(schedule)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    Reschedule
                  </button>
                )}
                {(schedule.status === 'due' || schedule.status === 'overdue') && (
                  <button onClick={() => handleStartMaintenance(schedule)} disabled={transitioningId === schedule.id} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50">
                    Start Maintenance
                  </button>
                )}
                {schedule.status === 'completed' && (
                  <button onClick={() => setDetailSchedule(schedule)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    View Report
                  </button>
                )}
                <button onClick={() => setDetailSchedule(schedule)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {detailSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Preventive Schedule Details</h2>
              <button onClick={() => setDetailSchedule(null)} className="text-white hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asset Name</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.assetName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asset Tag</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.assetTag}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Schedule ID</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.scheduleId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Maintenance Type</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.maintenanceType.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Frequency</p>
                  <p className="text-gray-900 font-semibold">{frequencyLabel[detailSchedule.frequency]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned To</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.assignedTo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Status</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.status.charAt(0).toUpperCase() + detailSchedule.status.slice(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Priority</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.priority.charAt(0).toUpperCase() + detailSchedule.priority.slice(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Maintenance Date</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.lastMaintenanceDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Next Maintenance Date</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.nextMaintenanceDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Estimated Duration</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.estimatedDuration}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                  <p className="text-gray-900 font-semibold">{detailSchedule.location}</p>
                </div>
                {detailSchedule.remarks && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-gray-900 font-semibold">{detailSchedule.remarks}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setDetailSchedule(null)} className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Add Maintenance Schedule</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {submitError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag</label>
                  <input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                  <input value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                  <select value={form.assetCategory} onChange={(e) => setForm({ ...form, assetCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="server">Server</option>
                    <option value="printer">Printer</option>
                    <option value="network">Network</option>
                    <option value="hvac">HVAC</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                  <select value={form.maintenanceType} onChange={(e) => setForm({ ...form, maintenanceType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="cleaning">Cleaning</option>
                    <option value="inspection">Inspection</option>
                    <option value="calibration">Calibration</option>
                    <option value="lubrication">Lubrication</option>
                    <option value="software_update">Software Update</option>
                    <option value="comprehensive">Comprehensive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half-Yearly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Maintenance Date</label>
                  <input type="date" value={form.lastMaintenanceDate} onChange={(e) => setForm({ ...form, lastMaintenanceDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Date</label>
                  <input type="date" value={form.nextMaintenanceDate} onChange={(e) => setForm({ ...form, nextMaintenanceDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (hours)</label>
                  <input type="number" value={form.estimatedDuration} onChange={(e) => setForm({ ...form, estimatedDuration: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
                  {isSubmitting ? 'Adding…' : 'Add Schedule'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
