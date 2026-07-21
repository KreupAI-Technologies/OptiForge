'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Shield,
  AlertCircle,
  CheckCircle,
  Calendar,
  MoreVertical,
  Download
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

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  lastUpdated: string;
  status: string;
  adherence: number;
  owner: string;
}

export default function SafetyPoliciesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Operational Safety', version: '1.0', owner: '' });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getTrainings('policy');
      const mapped: Policy[] = rows.map((row: SafetyTraining) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.code ?? row.id ?? ''),
          title: row.title ?? '',
          category: row.category ?? '',
          version: row.version ?? '',
          lastUpdated: row.effectiveDate ?? row.completedDate ?? '',
          status: row.status ?? '',
          adherence: row.compliancePercent ?? meta.adherence ?? 0,
          owner: row.owner ?? '',
        };
      });
      setPolicies(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load policies');
      setPolicies([]);
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
      await HrSafetyService.createTraining({
        recordType: 'policy',
        title: form.title.trim(),
        category: form.category,
        version: form.version,
        owner: form.owner,
        status: 'Active',
        effectiveDate: new Date().toISOString().slice(0, 10),
      });
      setShowCreate(false);
      setForm({ title: '', category: 'Operational Safety', version: '1.0', owner: '' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create policy');
    } finally {
      setSaving(false);
    }
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || policy.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isActive = (s: string) => s === 'Active' || s === 'active';
  const policyStats = {
    totalPolicies: policies.length,
    needsReview: policies.filter(p => !isActive(p.status)).length,
    avgAdherence: policies.length
      ? Math.round(policies.reduce((sum, p) => sum + (p.adherence || 0), 0) / policies.length)
      : 0,
    newThisMonth: 0,
  };

  const compliantCount = policies.filter(p => p.adherence >= 90).length;
  const minorGapsCount = policies.filter(p => p.adherence >= 80 && p.adherence < 90).length;
  const nonCompliantCount = policies.filter(p => p.adherence < 80).length;
  const adherenceData = [
    { name: 'Compliant', value: compliantCount, color: '#10b981' },
    { name: 'Minor Gaps', value: minorGapsCount, color: '#f59e0b' },
    { name: 'Non-Compliant', value: nonCompliantCount, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading policies…
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
            <FileText className="h-8 w-8 text-orange-600" />
            Safety Policies
          </h1>
          <p className="text-gray-500 mt-1">Manage and track safety guidelines and compliance</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Policy
        </button>
      </div>

      {/* Create Policy Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Create New Policy</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Lockout / Tagout Policy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Operational Safety">Operational Safety</option>
                  <option value="Emergency Response">Emergency Response</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Compliance">Compliance</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <input
                    type="text"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g. EHS"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.title.trim()}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create Policy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Policies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{policyStats.totalPolicies}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> All core areas covered
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Needs Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{policyStats.needsReview}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">Expired or due this month</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Adherence</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{policyStats.avgAdherence}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">+2% vs last quarter</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <p className="text-sm font-medium text-gray-500 absolute top-4 left-6">Adherence Status</p>
          <div className="w-full h-24 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adherenceData}
                  innerRadius={25}
                  outerRadius={35}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {adherenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 text-xs text-gray-500 mt-1">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>Compliant</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>Non-C.</span>
          </div>
        </div>
      </div>

      {/* Policy Library */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Policy Library</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Operational Safety">Operational Safety</option>
              <option value="Emergency Response">Emergency Response</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Compliance">Compliance</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Policy ID & Title</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2">Last Updated</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Adherence</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{policy.title}</div>
                      <div className="text-xs text-gray-400">{policy.id}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                      {policy.category}
                    </span>
                  </td>
                  <td className="px-3 py-2">v{policy.version}</td>
                  <td className="px-3 py-2 text-gray-500">{policy.lastUpdated}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${policy.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {policy.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${policy.adherence >= 90 ? 'bg-green-500' : policy.adherence >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${policy.adherence}%` }}></div>
                      </div>
                      <span className="text-xs font-medium">{policy.adherence}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-orange-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPolicies.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No policies found</h3>
            <p className="mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
