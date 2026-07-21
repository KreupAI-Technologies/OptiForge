'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  MoreVertical,
  Activity,
  FileWarning,
  Clock
} from 'lucide-react';
import { HrSafetyService, SafetyInspection } from '@/services/hr-safety.service';
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

const severityColors: Record<string, string> = {
  Critical: '#ef4444',
  Major: '#f97316',
  Minor: '#eab308',
  Observation: '#3b82f6',
};

interface FindingItem {
  id: string;
  title: string;
  source: string;
  category: string;
  severity: string;
  date: string;
  status: string;
  ref: string;
}

export default function AuditFindingsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [findings, setFindings] = useState<FindingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', source: '', category: '', severity: 'Minor' });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getInspections('finding');
      const mapped: FindingItem[] = rows.map((row: SafetyInspection) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.id),
          title: row.title ?? '',
          source: row.auditType ?? meta.source ?? '',
          category: row.area ?? row.department ?? '',
          severity: row.severity ?? '',
          date: row.completedDate ?? row.scheduledDate ?? '',
          status: row.status ?? '',
          ref: row.code ?? meta.ref ?? '',
        };
      });
      setFindings(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load findings');
      setFindings([]);
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
      await HrSafetyService.createInspection({
        recordType: 'finding',
        title: form.title.trim(),
        auditType: form.source.trim() || undefined,
        area: form.category.trim() || undefined,
        severity: form.severity,
        status: 'Open',
      });
      setShowCreate(false);
      setForm({ title: '', source: '', category: '', severity: 'Minor' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to log finding');
    } finally {
      setSaving(false);
    }
  };

  const findingStats = {
    activeFindings: findings.filter((f) => f.status !== 'Resolved' && f.status !== 'Closed').length,
    criticalNCRs: findings.filter((f) => f.severity === 'Critical').length,
    resolvedThisMonth: findings.filter((f) => f.status === 'Resolved' || f.status === 'Closed').length,
    pendingVerification: findings.filter((f) => f.status === 'Pending Verification').length,
  };

  const severityData = ['Critical', 'Major', 'Minor', 'Observation'].map((name) => ({
    name,
    value: findings.filter((f) => f.severity === name).length,
    color: severityColors[name],
  }));

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8 text-orange-600" />
            Audit Findings
          </h1>
          <p className="text-gray-500 mt-1">Review and manage observations, non-conformances, and audit outcomes</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Finding
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" /> Log Finding
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Unguarded conveyor pinch point"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source</label>
                <input
                  type="text"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Internal Audit"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category / Area</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Production Floor"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Critical">Critical</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="Observation">Observation</option>
                </select>
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
                disabled={saving || !form.title.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Logging…' : 'Log Finding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading findings…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Insight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border-l-4 border-l-red-500 border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Critical NCRs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{findingStats.criticalNCRs}</p>
            </div>
            <AlertOctagon className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border-l-4 border-l-orange-500 border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Findings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{findingStats.activeFindings}</p>
            </div>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border-l-4 border-l-blue-500 border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{findingStats.pendingVerification}</p>
            </div>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border-l-4 border-l-green-500 border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolved (MTD)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{findingStats.resolvedThisMonth}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Findings Log Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('All')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors ${activeTab === 'All' ? 'border-orange-600 text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                  Recent Findings
                </button>
                <button
                  onClick={() => setActiveTab('NCR')}
                  className={`text-xs font-bold pb-2 border-b-2 transition-colors ${activeTab === 'NCR' ? 'border-orange-600 text-gray-900' : 'border-transparent text-gray-400'}`}
                >
                  Open NCRs
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">Title & Description</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Severity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {findings.map((fnd) => (
                    <tr key={fnd.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td className="px-3 py-2">
                        <div className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase">{fnd.title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{fnd.category} · {fnd.date}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{fnd.source}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${fnd.severity === 'Critical' ? 'bg-red-50 text-red-700' :
                          fnd.severity === 'Major' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                          <AlertTriangle className="w-3 h-3" /> {fnd.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-[11px] font-medium ${fnd.status === 'Resolved' ? 'text-green-600' : 'text-gray-500'
                          }`}>
                          {fnd.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded italic">
                          {fnd.ref}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-center">
              <button className="text-xs font-bold text-orange-600 hover:underline">View Historical Findings Library</button>
            </div>
          </div>
        </div>

        {/* Sidebar: Analytics */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              Severity Profile
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-orange-600 p-3 rounded-xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <FileWarning className="w-4 h-4 text-orange-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-orange-100">Action Required</span>
              </div>
              <h4 className="font-bold text-lg mb-2">Critical Follow-up</h4>
              <p className="text-xs text-orange-50 text-opacity-80 leading-relaxed font-medium">
                The unguarded conveyor pinched point (NCR-2024-010) requires physical verification by the Maintenance Head before final closure can be recorded.
              </p>
              <button className="mt-4 px-4 py-2 bg-white text-orange-600 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors">
                Verify Closure
              </button>
            </div>
            <FileText className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
