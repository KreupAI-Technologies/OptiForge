'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Wind,
  Volume2,
  ShieldAlert,
  Syringe,
  Microscope,
  ArrowUpRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MoreVertical,
  ChevronRight,
  Database,
  BarChart3
} from 'lucide-react';
import { HrSafetyService, SafetyWellness } from '@/services/hr-safety.service';

interface SurveillanceRow {
  id: string;
  employee: string;
  hazard: string;
  lastCheck: string;
  nextCheck: string;
  result: string;
  status: string;
}

// Mock Data (chart)
const exposureMetrics = [
  { label: 'Ambient Noise', value: '72 dB', limit: '85 dB', status: 'Safe', icon: Volume2, color: 'text-blue-500' },
  { label: 'Airborne Dust', value: '1.2 mg/m³', limit: '5.0 mg/m³', status: 'Safe', icon: Wind, color: 'text-teal-500' },
  { label: 'Chemical Vapor', value: '0.04 ppm', limit: '0.10 ppm', status: 'Warning', icon: ShieldAlert, color: 'text-orange-500' }
];

export default function OccupationalHealthPage() {
  const [filter, setFilter] = useState('All');
  const [surveillanceLog, setSurveillanceLog] = useState<SurveillanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getWellness('occupational');
        const mapped: SurveillanceRow[] = rows.map((row: SafetyWellness) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            employee: row.employeeName ?? '',
            hazard: row.exposureType ?? row.category ?? '',
            lastCheck: row.completedDate ?? row.scheduledDate ?? '',
            nextCheck: row.nextDue ?? '',
            result: row.result ?? '',
            status: row.status ?? '',
          };
        });
        if (!cancelled) setSurveillanceLog(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load surveillance records');
          setSurveillanceLog([]);
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
            <Briefcase className="h-8 w-8 text-orange-600" />
            Occupational Health Surveillance
          </h1>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">Hazard Exposure Monitoring & Long-term Health Tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Database className="w-4 h-4" /> Exposure Registry
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md">
            <Plus className="w-4 h-4" /> Log Assessment
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading surveillance records…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Real-time Exposure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {exposureMetrics.map((met, i) => (
          <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{met.label}</p>
                <h4 className="text-3xl font-black text-gray-900 tracking-tighter italic leading-none">{met.value}</h4>
              </div>
              <div className={`p-3 rounded-xl bg-gray-50 ${met.color}`}>
                <met.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-8 relative z-10 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-gray-400 font-bold uppercase">Exposure Limit: <span className="text-gray-900">{met.limit}</span></p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${met.status === 'Safe' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>{met.status}</span>
              </div>
              <BarChart3 className="w-12 h-12 text-gray-100 group-hover:text-gray-200 transition-colors" />
            </div>
            <div className="absolute top-0 right-0 w-16 h-1 bg-orange-600 opacity-20 transform translate-x-8 -translate-y-4 rotate-45"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Surveillance Log */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between gap-2">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic">Health Surveillance Registry</h3>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Search employee..." className="w-full pl-10 pr-4 py-1.5 border border-gray-100 bg-gray-50 rounded-lg text-xs" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5">Assessment ID & Employee</th>
                    <th className="px-6 py-5">Hazard Vector</th>
                    <th className="px-6 py-5">Cycle Dates</th>
                    <th className="px-6 py-5">Clinical Result</th>
                    <th className="px-6 py-5 text-right">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {surveillanceLog.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 uppercase group-hover:text-orange-600 transition-colors">{log.employee}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5 tracking-tighter">REF: {log.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          <span className="text-[11px] text-gray-600 font-bold italic">{log.hazard}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-gray-500">Last: {log.lastCheck}</span>
                          <span className="text-[10px] text-orange-500 font-black flex items-center gap-1 uppercase">Next: {log.nextCheck}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${log.result === 'Normal' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                            {log.result}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><MoreVertical className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button className="text-[10px] font-black text-gray-400 hover:text-orange-600 uppercase tracking-widest transition-colors flex items-center gap-2">
                Load Historical Surveillance Data <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Vaccination & Reminders Sidebar */}
        <div className="space-y-3">
          <div className="bg-gray-900 p-3 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Syringe className="w-4 h-4 text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Immunization Drive</span>
                </div>
                <h3 className="text-lg font-black italic tracking-tighter leading-tight uppercase mb-2">Tetanus Booster <br />Campaign Q2</h3>

                <div className="flex items-center gap-3 mb-8">
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Enrolled</p>
                    <p className="text-xl font-black italic tracking-tighter">240</p>
                  </div>
                  <div className="h-8 w-px bg-gray-800"></div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">Target</p>
                    <p className="text-xl font-black italic tracking-tighter">800</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 bg-white text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">
                Schedule Session <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <Microscope className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
          </div>

          <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 italic">
              <AlertTriangle className="w-4 h-4 text-orange-400" /> Critical Compliance Reminders
            </h3>
            <div className="space-y-3">
              {[
                { emp: 'Mike Ross', detail: 'Particulate exposure limit reached for current cycle.', type: 'Warning' },
                { emp: 'Dept 2', detail: 'Calibration for noise sensors overdue by 12 days.', type: 'System' }
              ].map((note, i) => (
                <div key={i} className="flex gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl relative overflow-hidden">
                  <div className={`w-1 h-full absolute left-0 top-0 ${note.type === 'Warning' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{note.emp} · {note.type}</p>
                    <p className="text-[11px] text-gray-700 italic font-bold leading-relaxed">{note.detail}</p>
                    <button className="mt-3 text-[9px] font-black text-orange-600 uppercase tracking-widest hover:underline">Mark as resolved</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
