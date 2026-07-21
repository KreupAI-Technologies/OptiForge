'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Flame,
  UserCheck
} from 'lucide-react';
import { HrSafetyService, SafetyInspection } from '@/services/hr-safety.service';

interface ChecklistItem {
  name: string;
  status: string;
  note?: string;
}

interface InspectionItem {
  id: string;
  title: string;
  area: string;
  inspector: string;
  status: string;
  compliance: number;
  items: ChecklistItem[];
}

export default function InspectionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectionChecklists, setInspectionChecklists] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', area: '', inspector: '' });

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const rows = await HrSafetyService.getInspections('inspection');
      const mapped: InspectionItem[] = rows.map((row: SafetyInspection) => {
        const meta = (row.meta || {}) as any;
        return {
          id: String(row.id),
          title: row.title ?? '',
          area: row.area ?? '',
          inspector: row.auditor ?? row.assignedTo ?? '',
          status: row.status ?? '',
          compliance: Number(meta.compliance ?? row.score ?? 0) || 0,
          items: Array.isArray(meta.items) ? (meta.items as ChecklistItem[]) : [],
        };
      });
      setInspectionChecklists(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load inspections');
      setInspectionChecklists([]);
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
        recordType: 'inspection',
        title: form.title.trim(),
        area: form.area.trim() || undefined,
        auditor: form.inspector.trim() || undefined,
        status: 'In Progress',
      });
      setShowCreate(false);
      setForm({ title: '', area: '', inspector: '' });
      await load();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create inspection');
    } finally {
      setSaving(false);
    }
  };

  const inspectionStats = {
    activeInspections: inspectionChecklists.filter((i) => i.status === 'In Progress').length,
    completedMTD: inspectionChecklists.filter((i) => i.status === 'Completed').length,
    avgCompliance: inspectionChecklists.length
      ? Math.round(
          inspectionChecklists.reduce((s, i) => s + (i.compliance || 0), 0) /
            inspectionChecklists.length,
        )
      : 0,
    outstandingIssues: inspectionChecklists.reduce(
      (s, i) => s + i.items.filter((it) => it.status === 'Fail').length,
      0,
    ),
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-orange-600" />
            Safety Inspections
          </h1>
          <p className="text-gray-500 mt-1">Conduct and manage routine safety walkthroughs and compliance checks</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start New Inspection
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-orange-600" /> Start New Inspection
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Warehouse Walkthrough"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Area</label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Production Floor"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Inspector</label>
                <input
                  type="text"
                  value={form.inspector}
                  onChange={(e) => setForm({ ...form, inspector: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. Jane Doe"
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
                disabled={saving || !form.title.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading inspections…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-gray-900">{inspectionStats.activeInspections}</span>
            <Clock className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
          <p className="text-[10px] text-blue-600 mt-2 font-medium">Currently in-progress</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed (MTD)</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-gray-900">{inspectionStats.completedMTD}</span>
            <ShieldCheck className="w-8 h-8 text-green-500 opacity-20" />
          </div>
          <p className="text-[10px] text-green-600 mt-2 font-medium">+2 from last month</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Compliance</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-gray-900">{inspectionStats.avgCompliance}%</span>
            <UserCheck className="w-8 h-8 text-orange-500 opacity-20" />
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-orange-500 h-full" style={{ width: `${inspectionStats.avgCompliance}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Issues Found</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold text-red-600">{inspectionStats.outstandingIssues}</span>
            <AlertCircle className="w-8 h-8 text-red-500 opacity-20" />
          </div>
          <p className="text-[10px] text-red-600 mt-2 font-medium">Requires corrective action</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Inspection List */}
        <div className="lg:col-span-2 space-y-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent Inspections</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter inspections..."
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-orange-500 focus:border-orange-500 w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {inspectionChecklists.map((insp) => (
                <div key={insp.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{insp.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${insp.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            insp.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {insp.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="font-medium">{insp.id}</span> · Area: {insp.area}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Compliance</p>
                      <p className={`text-xl font-bold ${insp.compliance > 90 ? 'text-green-600' : 'text-orange-600'}`}>{insp.compliance}%</p>
                    </div>
                  </div>

                  {insp.items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {insp.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100 text-[11px]">
                          <span className="text-gray-700 flex items-center gap-2">
                            {item.status === 'Pass' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> :
                              item.status === 'Fail' ? <XCircle className="w-3.5 h-3.5 text-red-500" /> :
                                <Clock className="w-3.5 h-3.5 text-blue-500" />}
                            {item.name}
                          </span>
                          {item.status === 'Fail' && <span className="text-[9px] bg-red-100 text-red-600 px-1 rounded">Action Needed</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-transparent">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                      Inspector: <span className="font-bold text-gray-600">{insp.inspector}</span>
                    </span>
                    <button className="text-[11px] font-bold text-orange-600 flex items-center group-hover:gap-2 gap-1 transition-all">
                      View Full Checklist <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspection Templates & Tips */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Quick Templates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-orange-200 cursor-pointer transition-all bg-gray-50">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase">Electrical Safety</span>
                </div>
                <Plus className="w-3 h-3 text-gray-400" />
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-orange-200 cursor-pointer transition-all bg-gray-50">
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-gray-700 uppercase">Fire Prevention</span>
                </div>
                <Plus className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 p-3 rounded-xl text-white shadow-lg relative overflow-hidden">
            <h3 className="font-bold mb-2">Did you know?</h3>
            <p className="text-xs opacity-80 leading-relaxed italic">
              "Mobile inspections are 40% more efficient than paper-based reporting. Capture photos of hazards directly to the checklist to accelerate corrective actions."
            </p>
            <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
