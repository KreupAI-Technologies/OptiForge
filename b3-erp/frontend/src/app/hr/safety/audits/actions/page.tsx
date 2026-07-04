'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  TrendingDown,
  Clock,
  User,
  AlertTriangle,
  AlertCircle,
  History,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import { HrSafetyService, SafetyInspection } from '@/services/hr-safety.service';

// Mock Data
const actionStats = {
  activeCAPAs: 18,
  overdue: 2,
  completedThisMonth: 14,
  avgClosureTime: '5.2 days'
};

interface ActionItem {
  id: string;
  title: string;
  source: string;
  owner: string;
  dueDate: string;
  progress: number;
  status: string;
  priority: string;
}

export default function CorrectiveActionsPage() {
  const [activeTab, setActiveTab] = useState('Active');
  const [correctiveActions, setCorrectiveActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getInspections('action');
        const mapped: ActionItem[] = rows.map((row: SafetyInspection) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            title: row.title ?? '',
            source: meta.source ?? row.code ?? '',
            owner: row.assignedTo ?? row.auditor ?? '',
            dueDate: row.dueDate ?? '',
            progress: Number(meta.progress ?? row.score ?? 0) || 0,
            status: row.status ?? '',
            priority: row.priority ?? row.severity ?? '',
          };
        });
        if (!cancelled) setCorrectiveActions(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load corrective actions');
          setCorrectiveActions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-orange-600" />
            Corrective Actions (CAPA)
          </h1>
          <p className="text-gray-500 mt-1">Track, manage, and verify the closure of safety-related tasks and non-conformances</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Create Action
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading corrective actions…
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
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active CAPAs</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{actionStats.activeCAPAs}</p>
          <p className="text-[10px] text-orange-600 mt-1 font-bold">4 Scheduled for next 7 days</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Overdue</p>
          <p className="text-2xl font-bold text-red-600 mt-2">{actionStats.overdue}</p>
          <p className="text-[10px] text-red-500 mt-1 font-bold">Immediate attention required</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm text-center flex flex-col items-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Closure</p>
          <div className="mt-2 text-2xl font-black text-blue-600 flex items-center gap-1">
            <TrendingDown className="w-5 h-5" /> {actionStats.avgClosureTime}
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center bg-gray-900 text-white">
          <CheckCheck className="w-6 h-6 text-green-500 mb-1" />
          <p className="text-xl font-bold">{actionStats.completedThisMonth}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Resolved MTD</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* CAPA Tracker Log */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex bg-gray-50 rounded-lg p-1">
                {['Active', 'All History', 'Overdue'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search actions..."
                    className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-orange-500 focus:border-orange-500 w-48"
                  />
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {correctiveActions.map((action) => (
                <div key={action.id} className="p-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 uppercase group-hover:text-orange-600 transition-colors">{action.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${action.priority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 flex items-center gap-3">
                        <span className="font-mono text-gray-400">{action.id}</span>
                        <span className="flex items-center gap-1"><History className="w-3 h-3" /> Src: {action.source}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-8 min-w-[300px]">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500">
                          <span>Progress</span>
                          <span>{action.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200">
                          <div
                            className={`h-full transition-all duration-1000 ${action.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${action.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Due Date</p>
                        <p className={`text-xs font-bold ${action.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{action.dueDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between bg-transparent">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-blue-500" />
                        Assignee: <span className="font-bold text-gray-700">{action.owner}</span>
                      </span>
                      <span className={`text-[11px] font-bold ${action.status === 'Completed' ? 'text-green-600' :
                        action.status === 'Pending Verification' ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                        {action.status}
                      </span>
                    </div>
                    <button className="text-[11px] font-bold text-orange-600 flex items-center gap-1 hover:gap-2 transition-all">
                      Action Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Activity & Guidelines */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Responsible Owners
            </h3>
            <div className="space-y-2">
              {[
                { name: 'David Miller', role: 'Maint. Head', load: 4 },
                { name: 'Emma Watson', role: 'HSE Officer', load: 7 },
                { name: 'Robert Chen', role: 'Training Lead', load: 2 },
              ].map((user, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-blue-600">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{user.name}</p>
                      <p className="text-[10px] text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-gray-50 px-2 py-0.5 rounded text-gray-400 border border-gray-100">
                    {user.load} Tasks
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              Verification Tip
            </h3>
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              High-priority corrective actions must be physically verified by a third-party committee member before they can be marked as 'Closed'. Attachment of photo evidence is mandatory for all CAPAs.
            </p>
            <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
              Full Policy <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
