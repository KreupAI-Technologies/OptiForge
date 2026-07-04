'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  History,
  Activity,
  User,
  BellRing
} from 'lucide-react';
import { HrSafetyService, SafetyWellness } from '@/services/hr-safety.service';

interface CheckupRow {
  id: string;
  employee: string;
  type: string;
  date: string;
  status: string;
  compliance: string;
  location: string;
}

// Mock Data
const checkupStats = {
  completionRate: 94.5,
  pendingCheckups: 8,
  highRiskFlags: 3,
  remindersSent: 12
};

export default function WellnessCheckupsPage() {
  const [filter, setFilter] = useState('All');
  const [checkupLog, setCheckupLog] = useState<CheckupRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getWellness('checkup');
        const mapped: CheckupRow[] = rows.map((row: SafetyWellness) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            employee: row.employeeName ?? '',
            type: row.title ?? row.category ?? '',
            date: row.scheduledDate ?? row.completedDate ?? '',
            status: row.status ?? '',
            compliance: row.result ?? meta.compliance ?? '',
            location: row.provider ?? meta.location ?? '',
          };
        });
        if (!cancelled) setCheckupLog(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load wellness checkups');
          setCheckupLog([]);
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

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-orange-600" />
            Wellness Checkups & Assessments
          </h1>
          <p className="text-gray-500 mt-1">Manage mandatory health screenings, track medical compliance, and view assessment outcomes</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
            <History className="w-4 h-4 mr-2" />
            Archives
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Checkup
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading wellness checkups…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{checkupStats.completionRate}%</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${checkupStats.completionRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Checkups</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{checkupStats.pendingCheckups}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 italic">Next 30 days projection</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-red-100 border-2 shadow-sm relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">High Risk Alerts</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{checkupStats.highRiskFlags}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-[10px] text-red-600 mt-4 font-bold uppercase tracking-tighter cursor-pointer hover:underline">Requires Clinical Review</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Automated Reminders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{checkupStats.remindersSent}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <BellRing className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] text-green-600 mt-4 flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3" /> All active cases notified
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Checkup Queue */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['All', 'Completed', 'Scheduled', 'Overdue'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-4 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${filter === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search employee..." className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-48" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2">Employee & ID</th>
                    <th className="px-3 py-2">Assessment Type</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Compliance</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {checkupLog.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase tracking-tighter">
                            {check.employee.charAt(0)}
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold group-hover:text-orange-600 transition-colors uppercase italic">{check.employee}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 tracking-tighter">{check.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-600 italic">{check.type}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{check.date}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${check.status === 'Completed' ? 'bg-green-50 text-green-700' :
                            check.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                          }`}>
                          {check.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${check.compliance === 'Compliant' ? 'bg-green-500' :
                              check.compliance === 'On Track' ? 'bg-blue-500' : 'bg-red-500'
                            }`} />
                          <span className="text-[11px] text-gray-600 font-bold">{check.compliance}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Next Up & Guidelines */}
        <div className="space-y-3">
          <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Upcoming Assessment</span>
              </div>
              <h3 className="text-lg font-bold">Respiratory Performance</h3>
              <p className="text-xs text-gray-400 mt-2 font-medium italic">Employee: Robert Smith</p>
              <p className="text-xs text-orange-500 mt-1 uppercase font-bold tracking-widest leading-none">Tomorrow · 09:00 AM</p>
            </div>
            <button className="mt-6 w-full py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors shadow-md flex items-center justify-center gap-2">
              Verify Preparedness <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2 text-xs flex items-center gap-2 uppercase tracking-widest">
              <BellRing className="w-3.5 h-3.5 text-orange-400" />
              Policy Update
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium italic">
              Effective Q3, hearing assessments are now mandatory for all Production Level 2 personnel every <span className="text-gray-900 font-bold underline">12 months</span> instead of 18.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-900 uppercase">Coordinator</p>
                <p className="text-[10px] text-gray-400 italic">Dr. Ellen Vane</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
