'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Filter,
  CheckCircle,
  Eye
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { HrSafetyService, SafetyIncident } from '@/services/hr-safety.service';

interface NearMissRow {
  id: string;
  hazard: string;
  location: string;
  date: string;
  status: string;
}

const hotspotColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export default function NearMissPage() {
  const [detailedLogs, setDetailedLogs] = useState<NearMissRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ hazard: '', location: '' });

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getIncidents('near-miss');
      const mapped: NearMissRow[] = rows.map((row: SafetyIncident) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.incidentNumber ?? row.id),
          hazard: row.description ?? meta.hazard ?? row.type ?? '',
          location: row.location ?? '',
          date: row.reportedDate ?? row.incidentDate ?? '',
          status: row.status ?? '',
        };
      });
      setDetailedLogs(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load near-miss reports');
      setDetailedLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.hazard.trim()) return;
    setSaving(true);
    try {
      await HrSafetyService.createIncident({
        type: 'near-miss',
        description: form.hazard.trim(),
        location: form.location.trim() || undefined,
        reportedDate: new Date().toISOString().slice(0, 10),
        status: 'Open',
      });
      setShowCreate(false);
      setForm({ hazard: '', location: '' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to report near miss');
    } finally {
      setSaving(false);
    }
  };

  // Derived: monthly reporting trend (last 6 months)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const nearMissTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = monthLabels[d.getMonth()];
    const count = detailedLogs.filter((log) => {
      const ld = new Date(log.date);
      return !isNaN(ld.getTime()) && ld.getFullYear() === d.getFullYear() && ld.getMonth() === d.getMonth();
    }).length;
    return { month: label, count };
  });

  // Derived: hazard hotspots by location (top 3)
  const locationCounts: Record<string, number> = {};
  detailedLogs.forEach((log) => {
    const loc = log.location || 'Unspecified';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const maxLoc = Math.max(1, ...Object.values(locationCounts));
  const hazardMapData = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([zone, count], idx) => ({
      zone,
      type: `${count} report${count === 1 ? '' : 's'}`,
      level: Math.round((count / maxLoc) * 100),
      color: hotspotColors[idx % hotspotColors.length],
    }));

  // Derived: proactive safety score from resolution rate
  const resolvedCount = detailedLogs.filter((l) => l.status === 'Resolved' || l.status === 'Closed').length;
  const safetyScore = detailedLogs.length ? Math.round((resolvedCount / detailedLogs.length) * 100) : 0;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            Near Miss Reports
          </h1>
          <p className="text-gray-500 mt-1">Proactive hazard reporting and trend analysis</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Near Miss
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" /> Report Near Miss
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hazard / Description</label>
                <input
                  type="text"
                  value={form.hazard}
                  onChange={(e) => setForm({ ...form, hazard: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Spilled liquid near loading dock"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Zone A"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.hazard.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Reporting…' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading near-miss reports…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-3">
          {/* Trend Chart */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-900">Reporting Trend (Last 6 Months)</h3>
              <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" /> +12% Reporting
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={nearMissTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="#f97316" fillOpacity={1} fill="url(#colorCount)" name="Reports" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Increased reporting correlates with higher safety awareness.</p>
          </div>

          {/* Recent Logs Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">View All</button>
            </div>
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-white border-b border-gray-100">
                <tr>
                  <th className="px-3 py-2 font-semibold">Hazard</th>
                  <th className="px-3 py-2 font-semibold">Location</th>
                  <th className="px-3 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detailedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{log.hazard}</td>
                    <td className="px-3 py-2">{log.location}</td>
                    <td className="px-3 py-2 text-gray-500">{log.date}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${log.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Score & Hotspots */}
        <div className="space-y-3">
          {/* Proactive Safety Score */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Proactive Safety Score</h3>
            <div className="relative w-32 h-32 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle
                  className="text-green-500"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - safetyScore / 100)}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <span className="absolute text-3xl font-bold text-gray-900">{safetyScore}</span>
            </div>
            <p className="text-sm text-gray-500 px-4">Based on reporting frequency, resolution time, and hazard elimination.</p>
            <div className="flex gap-2 mt-4 w-full">
              <div className="flex-1 bg-green-50 py-2 rounded-lg border border-green-100">
                <p className="text-xs text-green-600 font-bold uppercase">Target</p>
                <p className="text-lg font-bold text-green-800">90</p>
              </div>
            </div>
          </div>

          {/* Hazard Hotspots */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900">Hazard Hotspots</h3>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              {hazardMapData.map((zone, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{zone.zone}</span>
                    <span className="text-gray-500">{zone.type}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${zone.level}%`, backgroundColor: zone.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button className="w-full py-2 text-sm text-orange-600 font-medium hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center">
                <Eye className="w-4 h-4 mr-2" /> View Detailed Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
