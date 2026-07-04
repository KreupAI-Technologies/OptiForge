'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Globe,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';
import { HrSafetyService, SafetyInspection } from '@/services/hr-safety.service';

const auditTypes = [
  { name: 'Regulatory', icon: Globe, color: 'text-red-600', count: 1 },
  { name: 'Internal', icon: Users, color: 'text-blue-600', count: 2 },
  { name: 'Compliance', icon: ShieldAlert, color: 'text-orange-600', count: 5 },
];

interface AuditItem {
  id: string;
  title: string;
  type: string;
  date: string;
  auditor: string;
  priority: string;
  notify: boolean;
}

export default function AuditSchedulePage() {
  const [activeType, setActiveType] = useState('All');
  const [upcomingAudits, setUpcomingAudits] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getInspections('schedule');
        const mapped: AuditItem[] = rows.map((row: SafetyInspection) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            title: row.title ?? '',
            type: row.auditType ?? '',
            date: row.scheduledDate ?? '',
            auditor: row.auditor ?? '',
            priority: row.priority ?? '',
            notify: Boolean(meta.notify ?? false),
          };
        });
        if (!cancelled) setUpcomingAudits(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load audit schedule');
          setUpcomingAudits([]);
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
            <Calendar className="h-8 w-8 text-orange-600" />
            Audit Schedule
          </h1>
          <p className="text-gray-500 mt-1">Plan and coordinate upcoming internal and external safety audits</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Audit
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading audit schedule…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Quick Type Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {auditTypes.map((type, idx) => (
          <div
            key={idx}
            className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 cursor-pointer hover:border-orange-200 transition-all ${activeType === type.name ? 'ring-2 ring-orange-100 border-orange-200' : ''}`}
            onClick={() => setActiveType(type.name)}
          >
            <div className={`p-3 rounded-lg bg-gray-50 bg-opacity-50`}>
              <type.icon className={`w-6 h-6 ${type.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">{type.name}</p>
              <p className="text-lg font-bold text-gray-900">{type.count} Audits</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Timeline / Calendar List View */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900 text-lg">Upcoming Timeline</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1 text-[10px] font-bold bg-white text-gray-900 rounded shadow-sm">List</button>
                  <button className="px-3 py-1 text-[10px] font-bold text-gray-500">Calendar</button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                <span className="text-sm font-bold text-gray-600">April 2024</span>
                <button className="p-1.5 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {upcomingAudits.map((audit, idx) => (
                <div key={audit.id} className="relative pl-8 pb-6 last:pb-0 border-l-2 border-gray-100 group">
                  {/* Timeline Bullet */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white translate-y-1 shadow-sm ${audit.priority === 'Critical' ? 'bg-red-500' :
                      audit.priority === 'High' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-white transition-all group-hover:shadow-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{audit.title}</h3>
                        <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono">{audit.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 opacity-60" /> {audit.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 opacity-60" /> {audit.auditor}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {audit.notify && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-[10px] font-bold animate-pulse">
                          <Clock className="w-3 h-3" /> Reminder Sent
                        </div>
                      )}
                      <button className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg group-hover:translate-x-1 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Sidebar / Stats */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">Compliance Status</h3>
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Regulatory Readiness</span>
                  <span>80%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Internal Schedule Adherence</span>
                  <span>94%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs font-bold text-orange-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Action Required
              </p>
              <p className="text-[11px] text-orange-600 mt-2 leading-relaxed">
                OSHA Q1 Audit is in 7 days. Ensure all corrective actions from previous session are verified and documents are ready.
              </p>
              <button className="mt-3 w-full py-2 bg-white text-orange-600 text-[10px] font-bold rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                View Prep Checklist
              </button>
            </div>
          </div>

          <div className="p-6 bg-gray-900 rounded-xl shadow-xl border border-gray-800 flex items-center justify-between text-white">
            <div>
              <p className="text-2xl font-bold">18</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Days Since Last Audit</p>
            </div>
            <CheckCircle2 className="w-10 h-10 text-green-500 opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
