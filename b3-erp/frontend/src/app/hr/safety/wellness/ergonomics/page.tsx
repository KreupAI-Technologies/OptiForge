'use client';

import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Search,
  Plus,
  Monitor,
  Armchair,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  History,
  Layout,
  User,
  Wrench,
  ArrowUpRight,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { HrSafetyService, SafetyWellness } from '@/services/hr-safety.service';

interface AssessmentRow {
  id: string;
  employee: string;
  station: string;
  riskLevel: string;
  date: string;
  status: string;
}

// Mock Data
const ergoStats = {
  activeAssessments: 12,
  highRiskStations: 2,
  adjustmentsPending: 5,
  siteRiskScore: 2.4 // Out of 5, lower is better
};

export default function ErgonomicsPage() {
  const [filter, setFilter] = useState('All');
  const [assessmentQueue, setAssessmentQueue] = useState<AssessmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getWellness('ergonomics');
        const mapped: AssessmentRow[] = rows.map((row: SafetyWellness) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            employee: row.employeeName ?? '',
            station: row.title ?? meta.station ?? '',
            riskLevel: row.riskLevel ?? '',
            date: row.scheduledDate ?? row.completedDate ?? '',
            status: row.status ?? '',
          };
        });
        if (!cancelled) setAssessmentQueue(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load ergonomic assessments');
          setAssessmentQueue([]);
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
    <div className="p-6 space-y-3 text-sm font-medium">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layout className="h-8 w-8 text-orange-600" />
            Industrial Ergonomics & Workstation Safety
          </h1>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">Assessment of musculoskeletal risks and equipment optimization</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-100 transition-colors flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Request Assessment
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
            <Plus className="w-4 h-4" /> Log Site Walk
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading ergonomic assessments…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Site Risk Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Assessments</p>
              <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter italic leading-none">{ergoStats.activeAssessments}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-6 italic font-bold">5 scheduled for next week</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-red-100 shadow-sm border-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">High Risk Stations</p>
              <p className="text-3xl font-black text-red-600 mt-1 italic tracking-tighter italic leading-none">{ergoStats.highRiskStations}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-red-600 mt-6 font-black uppercase tracking-widest animate-pulse">Immediate Correction Necessary</p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjustments Pending</p>
              <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter italic leading-none">{ergoStats.adjustmentsPending}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full mt-6 overflow-hidden">
            <div className="bg-orange-600 h-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="bg-gray-900 p-3 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Overall Site Score</p>
              <p className="text-3xl font-black text-white mt-1 italic tracking-tighter italic leading-none">{ergoStats.siteRiskScore}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-xl text-green-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-green-500 mt-6 font-black uppercase tracking-widest">Target: Below 2.0</p>
          <Layout className="absolute -bottom-6 -right-6 w-24 h-24 text-white opacity-5 rotate-12" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Assessment Queue */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-2">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic">Assessment Worklist</h3>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search by employee or station..." className="w-full pl-10 pr-4 py-1.5 border border-gray-100 bg-gray-50 rounded-lg text-xs" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5">Request ID & Station</th>
                    <th className="px-6 py-5">Requested By</th>
                    <th className="px-6 py-5">Risk Category</th>
                    <th className="px-6 py-5">Filing Date</th>
                    <th className="px-6 py-5 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assessmentQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 uppercase group-hover:text-orange-600 transition-colors">{item.station}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5 tracking-tighter">ID: {item.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          <span className="text-[11px] text-gray-600 font-bold italic">{item.employee}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${item.riskLevel === 'High' ? 'bg-red-50 text-red-600' :
                            item.riskLevel === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                            }`}>
                            {item.riskLevel}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[11px] text-gray-500 font-bold">{item.date}</td>
                      <td className="px-6 py-5 text-right font-black">
                        <span className={`text-[10px] uppercase tracking-widest ${item.status === 'Completed' ? 'text-green-600' :
                          item.status === 'Action Required' ? 'text-red-500' : 'text-gray-400'
                          }`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button className="text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                View Archived Ergonomic Studies <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Resources & Sidenote Sidebar */}
        <div className="space-y-3">
          <div className="bg-orange-100 p-3 rounded-2xl border border-orange-200 relative overflow-hidden group hover:shadow-lg transition-all">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                <AlertTriangle className="w-4 h-4" /> Site-Wide Study
              </h3>
              <h4 className="text-xl font-black italic tracking-tighter leading-tight uppercase text-orange-900 mb-2">Back Safety in <br />Packaging Dept</h4>
              <p className="text-[11px] text-orange-700 italic font-bold leading-relaxed mb-3">
                Recent patterns indicate strain in Packaging Line 4. Implementing mechanical lifting assists by April 30.
              </p>
              <button className="w-full py-2 bg-orange-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-800 transition-all flex items-center justify-center gap-2">
                Read Full Report <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 italic">
              <Monitor className="w-4 h-4 text-blue-400" /> Best Practices
            </h3>
            <div className="space-y-2">
              {[
                { icon: Monitor, text: 'Monitor top at eye level' },
                { icon: Armchair, text: 'Lumbar support fully engaged' },
                { icon: Activity, text: 'Micro-breaks every 20 mins' }
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 group cursor-pointer">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                    <tip.icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-bold italic group-hover:text-gray-900 transition-colors">{tip.text}</span>
                </div>
              ))}
            </div>
            <button className="mt-8 w-full py-2 border border-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-all">Resource Library</button>
          </div>
        </div>
      </div>
    </div>
  );
}
