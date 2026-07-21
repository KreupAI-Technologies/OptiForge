'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle,
  MoreVertical,
  Download,
  Activity,
  User,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { HrSafetyService, SafetyHazard } from '@/services/hr-safety.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Category color map (label constant — not mock data)
const CATEGORY_COLORS: Record<string, string> = {
  Mechanical: '#f97316',
  Electrical: '#eab308',
  Chemical: '#ef4444',
  Ergonomic: '#3b82f6',
};
const FALLBACK_CATEGORY_COLOR = '#6b7280';

interface HazardItem {
  id: string;
  title: string;
  category: string;
  location: string;
  identifiedBy: string;
  date: string;
  status: string;
  initialSeverity: string;
}

export default function HazardsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [hazards, setHazards] = useState<HazardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Mechanical',
    location: '',
    identifiedBy: '',
    severity: 'Medium',
  });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getHazards('hazard');
      const mapped: HazardItem[] = rows.map((row: SafetyHazard) => ({
        id: String(row.id),
        title: row.title ?? '',
        category: row.category ?? '',
        location: row.location ?? '',
        identifiedBy: row.identifiedBy ?? '',
        date: row.date ?? '',
        status: row.status ?? '',
        initialSeverity: row.severity ?? '',
      }));
      setHazards(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load hazards');
      setHazards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await HrSafetyService.createHazard({
        recordType: 'hazard',
        title: form.title.trim(),
        category: form.category,
        location: form.location.trim(),
        identifiedBy: form.identifiedBy.trim(),
        severity: form.severity,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending Evaluation',
      });
      setShowCreate(false);
      setForm({ title: '', category: 'Mechanical', location: '', identifiedBy: '', severity: 'Medium' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create hazard');
    } finally {
      setSaving(false);
    }
  };

  const filteredHazards = hazards.filter(haz => {
    const matchesSearch = haz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      haz.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || haz.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Derived stats from fetched hazards
  const nowMonth = new Date().toISOString().slice(0, 7);
  const hazardStats = {
    totalHazards: hazards.length,
    identifiedThisMonth: hazards.filter(h => (h.date || '').startsWith(nowMonth)).length,
    pendingEvaluation: hazards.filter(h => h.status.toLowerCase().includes('pending')).length,
    criticalHazards: hazards.filter(
      h => h.initialSeverity === 'High' || h.status.toLowerCase().includes('critical'),
    ).length,
  };

  // Derived category distribution from fetched hazards
  const categoryData = Object.entries(
    hazards.reduce<Record<string, number>>((acc, h) => {
      const key = h.category || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({
    name,
    count,
    color: CATEGORY_COLORS[name] || FALLBACK_CATEGORY_COLOR,
  }));

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Eye className="h-8 w-8 text-orange-600" />
            Hazard Identification
          </h1>
          <p className="text-gray-500 mt-1">Detect and log potential workplace hazards before they become incidents</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report New Hazard
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">Report New Hazard</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-3 px-5 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Describe the hazard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option>Mechanical</option>
                  <option>Electrical</option>
                  <option>Chemical</option>
                  <option>Ergonomic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="e.g. Line 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identified By</label>
                <input
                  type="text"
                  value={form.identifiedBy}
                  onChange={(e) => setForm({ ...form, identifiedBy: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Reporter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.title.trim()}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saving ? 'Saving…' : 'Save Hazard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading hazards…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hazards</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{hazardStats.totalHazards}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <Activity className="w-3 h-3 mr-1" /> Active monitoring
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Eval</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{hazardStats.pendingEvaluation}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2 flex items-center">Requires risk assessment</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Reported (MTD)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{hazardStats.identifiedThisMonth}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Month-to-date identification</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{hazardStats.criticalHazards}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-red-600 mt-2">Immediate action required</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content: Hazard Log */}
        <div className="lg:col-span-2 space-y-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-gray-900">Hazard Identification Log</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hazards..."
                    className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">Hazard ID & Title</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Identified By</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredHazards.map((hazard) => (
                    <tr key={hazard.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{hazard.title}</div>
                        <div className="text-xs text-gray-400">{hazard.id}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs">
                          {hazard.category}
                        </span>
                      </td>
                      <td className="px-3 py-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {hazard.location}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white">
                            {hazard.identifiedBy.charAt(0)}
                          </div>
                          <div>
                            <div className="text-gray-900">{hazard.identifiedBy}</div>
                            <div className="text-[10px] text-gray-400">{hazard.date}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${hazard.initialSeverity === 'High' ? 'bg-red-100 text-red-800' :
                            hazard.initialSeverity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {hazard.initialSeverity}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-medium ${hazard.status.includes('Critical') ? 'text-red-600' :
                            hazard.status.includes('Pending') ? 'text-orange-600' : 'text-gray-500'
                          }`}>
                          {hazard.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Distribution Chart */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Hazard Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="count" barSize={16} radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    {cat.name}
                  </span>
                  <span className="font-bold text-gray-900">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-lg text-white">
            <h3 className="font-bold mb-2">Safety Tip</h3>
            <p className="text-sm opacity-90 italic">"Ensure that all machine guards are in place and properly adjusted before operating equipment. If a guard is missing, report it immediately as a critical hazard."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
