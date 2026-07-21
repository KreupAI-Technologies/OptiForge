'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Search,
  Filter,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  MoreVertical,
  Download,
  AlertTriangle,
  Siren
} from 'lucide-react';
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
import { HrSafetyService, SafetyIncident } from '@/services/hr-safety.service';

interface IncidentRow {
  id: string;
  title: string;
  location: string;
  date: string;
  reportedBy: string;
  severity: string;
  status: string;
  type: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  Low: '#3b82f6',
  Medium: '#f59e0b',
  High: '#ef4444',
  Critical: '#7f1d1d',
};

const normalizeSeverity = (s: string) => {
  const v = (s || '').toLowerCase();
  if (v.includes('crit')) return 'Critical';
  if (v.includes('high') || v.includes('serious')) return 'High';
  if (v.includes('med') || v.includes('mod')) return 'Medium';
  return 'Low';
};

const isOpen = (s: string) => /report|open/i.test(s);
const isInvestigating = (s: string) => /investigat/i.test(s);
const isClosed = (s: string) => /closed|resolved/i.test(s);

export default function IncidentReportPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    location: '',
    department: '',
    severity: 'minor',
    type: 'injury',
    description: '',
    reportedBy: '',
  });

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getIncidents();
      const mapped: IncidentRow[] = rows.map((row: SafetyIncident) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.incidentNumber ?? row.id),
          title: meta.title ?? row.description ?? '',
          location: row.location ?? '',
          date: row.reportedDate ?? row.incidentDate ?? '',
          reportedBy: row.reportedBy ?? '',
          severity: row.severity ?? '',
          status: row.status ?? '',
          type: row.type ?? '',
        };
      });
      setIncidents(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load incidents');
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await HrSafetyService.createIncident({
        location: form.location,
        department: form.department,
        severity: form.severity,
        type: form.type,
        description: form.description,
        reportedBy: form.reportedBy,
        reportedDate: new Date().toISOString().slice(0, 10),
        status: 'reported',
        meta: { title: form.title },
      });
      setShowCreate(false);
      setForm({
        title: '',
        location: '',
        department: '',
        severity: 'minor',
        type: 'injury',
        description: '',
        reportedBy: '',
      });
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to report incident');
    } finally {
      setSaving(false);
    }
  };

  // Derived stats (replaces former hardcoded mock consts)
  const incidentStats = {
    totalIncidents: incidents.length,
    open: incidents.filter((i) => isOpen(i.status)).length,
    investigating: incidents.filter((i) => isInvestigating(i.status)).length,
    closed: incidents.filter((i) => isClosed(i.status)).length,
    avgResolutionTime: 'N/A',
  };

  const severityData = (['Low', 'Medium', 'High', 'Critical'] as const).map(
    (name) => ({
      name,
      value: incidents.filter((i) => normalizeSeverity(i.severity) === name).length,
      color: SEVERITY_COLORS[name],
    }),
  );

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            Incident Reporting
          </h1>
          <p className="text-gray-500 mt-1">Log, track, and manage safety incidents</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-colors"
        >
          <Siren className="w-4 h-4 mr-2" />
          Report New Incident
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Report New Incident</h2>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Severity</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                >
                  <option value="injury">Injury</option>
                  <option value="near_miss">Near Miss</option>
                  <option value="property_damage">Property Damage</option>
                  <option value="environmental">Environmental</option>
                  <option value="fire">Fire</option>
                  <option value="chemical_spill">Chemical Spill</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Reported By</label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  value={form.reportedBy}
                  onChange={(e) => setForm((f) => ({ ...f, reportedBy: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading incidents…
        </div>
      )}
      {loadError && !isLoading && (
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
              <p className="text-sm font-medium text-gray-500">Open Incidents</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{incidentStats.open}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Requires immediate attention</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Under Investigation</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{incidentStats.investigating}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Search className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Active RCA processes</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Closed (This Month)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{incidentStats.closed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">Avg. Resolution: {incidentStats.avgResolutionTime}</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <p className="text-sm font-medium text-gray-500 absolute top-4 left-6">Severity Breakdown</p>
          <div className="w-full h-24 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  innerRadius={25}
                  outerRadius={35}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 text-xs text-gray-500 mt-1">
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-1"></span>Critical</span>
            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Low</span>
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Incident Logs</h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search incidents..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2.5"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Investigating">Investigating</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Incident ID & Title</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Location</th>
                <th className="px-3 py-2">Reported By / Date</th>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div>
                      <div className="font-medium text-gray-900">{incident.title}</div>
                      <div className="text-xs text-gray-400">{incident.id}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                      {incident.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">{incident.location}</td>
                  <td className="px-3 py-2">
                    <div className="text-gray-900">{incident.reportedBy}</div>
                    <div className="text-xs text-gray-500">{incident.date}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${incident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        incident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                          incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                      }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${incident.status === 'Open' ? 'bg-red-50 text-red-700 border border-red-100' :
                        incident.status === 'Investigating' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                          'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                      {incident.status === 'Open' && <AlertCircle className="w-3 h-3" />}
                      {incident.status === 'Investigating' && <Search className="w-3 h-3" />}
                      {incident.status === 'Closed' && <CheckCircle className="w-3 h-3" />}
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-xs font-medium text-orange-600 hover:text-orange-900 hover:underline">View details</button>
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
      </div>
    </div>
  );
}
