'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Search,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { HrSafetyService, SafetyTraining } from '@/services/hr-safety.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Mock Data
const complianceData = [
  { name: 'Fire Safety', completed: 145, pending: 5, total: 150, color: '#f59e0b' },
  { name: 'PPE Usage', completed: 148, pending: 2, total: 150, color: '#10b981' },
  { name: 'HazMat', completed: 45, pending: 5, total: 50, color: '#ef4444' },
  { name: 'First Aid', completed: 25, pending: 5, total: 30, color: '#3b82f6' },
];

const upcomingDrills = [
  { id: 1, name: 'Fire Evacuation Drill', date: '2024-04-15', time: '10:00 AM', status: 'Scheduled', type: 'Evacuation' },
  { id: 2, name: 'Chemical Spill Response', date: '2024-05-02', time: '02:00 PM', status: 'Planned', type: 'Response' },
  { id: 3, name: 'Severe Weather Drill', date: '2024-06-10', time: '11:00 AM', status: 'Proposed', type: 'Evacuation' },
];

interface TrainingRecord {
  id: string;
  employee: string;
  course: string;
  date: string;
  expiry: string;
  status: string;
}

export default function SafetyTrainingPage() {
  const [activeTab, setActiveTab] = useState('Compliance');
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Evacuation', scheduledDate: '' });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getTrainings('training');
      const mapped: TrainingRecord[] = rows.map((row: SafetyTraining) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.code ?? row.id ?? ''),
          employee: row.memberName ?? meta.employee ?? '',
          course: row.title ?? '',
          date: row.completedDate ?? row.scheduledDate ?? '',
          expiry: row.reviewDate ?? meta.expiry ?? '',
          status: row.status ?? '',
        };
      });
      setTrainingRecords(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load training records');
      setTrainingRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSchedule = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await HrSafetyService.createTraining({
        recordType: 'training',
        title: form.name.trim(),
        category: form.type,
        scheduledDate: form.scheduledDate || undefined,
        status: 'Scheduled',
      });
      setShowSchedule(false);
      setForm({ name: '', type: 'Evacuation', scheduledDate: '' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to schedule drill');
    } finally {
      setSaving(false);
    }
  };

  const isExpired = (s: string) => s === 'Expired' || s === 'expired';
  const isValid = (s: string) => s === 'Valid' || s === 'valid';
  const expiredCount = trainingRecords.filter(r => isExpired(r.status)).length;
  const overallCompliance = trainingRecords.length
    ? Math.round((trainingRecords.filter(r => isValid(r.status)).length / trainingRecords.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading training records…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-orange-600" />
            Safety Training & Drills
          </h1>
          <p className="text-gray-500 mt-1">Manage certifications, compliance, and emergency drills</p>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Drill
        </button>
      </div>

      {/* Schedule Drill Modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Schedule Drill</h2>
              <button onClick={() => setShowSchedule(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drill Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Fire Evacuation Drill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Evacuation">Evacuation</option>
                  <option value="Response">Response</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowSchedule(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Schedule Drill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Overall Compliance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{overallCompliance}%</p>
            <p className="text-xs text-green-600 mt-1">Based on valid certifications</p>
          </div>
          <div className="h-16 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ value: overallCompliance, fill: '#10b981' }, { value: 100 - overallCompliance, fill: '#f3f4f6' }]} dataKey="value" innerRadius={20} outerRadius={30} startAngle={90} endAngle={-270} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Expired Certifications</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{expiredCount}</p>
            <p className="text-xs text-red-600 mt-1">Immediate action required</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Upcoming Drills</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingDrills.length}</p>
            <p className="text-xs text-blue-600 mt-1">Next: Apr 15</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Compliance Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Training Compliance by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="completed" stackId="a" fill="#10b981" barSize={20} radius={[0, 4, 4, 0]} name="Completed" />
                <Bar dataKey="pending" stackId="a" fill="#e5e7eb" barSize={20} radius={[0, 4, 4, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drill Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Upcoming Emergency Drills</h3>
          <div className="space-y-2">
            {upcomingDrills.map((drill) => (
              <div key={drill.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold flex-col">
                  <span className="text-xs uppercase">{new Date(drill.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-lg leading-none">{new Date(drill.date).getDate()}</span>
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{drill.name}</h4>
                  <div className="flex items-center mt-1 text-xs text-gray-500 gap-3">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {drill.time}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{drill.type}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${drill.status === 'Scheduled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {drill.status}
                </span>
              </div>
            ))}
            <button className="w-full py-2 text-sm text-center text-gray-500 hover:text-orange-600 transition-colors border border-dashed border-gray-300 rounded-lg hover:border-orange-300 hover:bg-orange-50">
              + Plan New Drill
            </button>
          </div>
        </div>
      </div>

      {/* Certification Records */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900">Recent Certification Status</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee or course..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Course / Certification</th>
                <th className="px-3 py-2">Completion Date</th>
                <th className="px-3 py-2">Expiry Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trainingRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {record.employee.split(' ').map(n => n[0]).join('')}
                    </div>
                    {record.employee}
                  </td>
                  <td className="px-3 py-2">{record.course}</td>
                  <td className="px-3 py-2">{record.date}</td>
                  <td className="px-3 py-2">{record.expiry}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Valid' ? 'bg-green-100 text-green-800' :
                        record.status === 'Expired' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
