'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Plus,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Zap,
  Settings,
  Users,
  HardHat
} from 'lucide-react';
import { HrSafetyService, SafetyHazard } from '@/services/hr-safety.service';

// Mock Data
const hierarchyData = [
  { level: 'Elimination', icon: Zap, color: 'text-red-600', bg: 'bg-red-50', desc: 'Physically remove the hazard', count: 2 },
  { level: 'Substitution', icon: ArrowRight, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Replace the hazard', count: 1 },
  { level: 'Engineering', icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Isolate people from the hazard', count: 5 },
  { level: 'Administrative', icon: Users, color: 'text-yellow-600', bg: 'bg-yellow-50', desc: 'Change the way people work', count: 8 },
  { level: 'PPE', icon: HardHat, color: 'text-green-600', bg: 'bg-green-50', desc: 'Protect the worker with PPE', count: 12 },
];

interface ControlItem {
  id: string;
  title: string;
  type: string;
  targetRisk: string;
  lastReview: string;
  efficiency: number;
  status: string;
}

export default function ControlMeasuresPage() {
  const [activeLevel, setActiveLevel] = useState('All');
  const [activeControls, setActiveControls] = useState<ControlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getHazards('control');
        const mapped: ControlItem[] = rows.map((row: SafetyHazard) => {
          const meta = (row.meta || {}) as any;
          return {
            id: String(row.id),
            title: row.title ?? '',
            type: row.category ?? '',
            targetRisk: meta.targetRisk ?? row.remarks ?? '',
            lastReview: meta.lastReview ?? row.date ?? '',
            efficiency: Number(meta.efficiency ?? row.riskScore ?? 0) || 0,
            status: row.status ?? '',
          };
        });
        if (!cancelled) setActiveControls(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load control measures');
          setActiveControls([]);
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
            <Shield className="h-8 w-8 text-orange-600" />
            Control Measures
          </h1>
          <p className="text-gray-500 mt-1">Implement and track the hierarchy of controls to mitigate identified risks</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Implement Control
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading control measures…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Hierarchy of Controls Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {hierarchyData.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border border-gray-200 shadow-sm transition-all cursor-pointer hover:shadow-md ${activeLevel === item.level ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
            onClick={() => setActiveLevel(item.level)}
          >
            <div className={`p-2 rounded-lg ${item.bg} w-fit mb-3`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">{item.level}</h3>
            <p className="text-[10px] text-gray-500 mt-1 leading-tight">{item.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900">{item.count}</span>
              <span className="text-[10px] text-gray-400">Total</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Active Controls Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Active Control Inventory</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-green-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> All systems active
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2">Control ID & Title</th>
                  <th className="px-3 py-2">Hierarchy Level</th>
                  <th className="px-3 py-2">Efficiency</th>
                  <th className="px-3 py-2">Last Review</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeControls.map((control) => (
                  <tr key={control.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-bold text-gray-900">{control.title}</div>
                      <div className="text-[10px] text-gray-400">ID: {control.id} · Target: {control.targetRisk}</div>
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-600">{control.type}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${control.efficiency}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold">{control.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{control.lastReview}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${control.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                        {control.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 text-center">
            <button className="text-xs font-bold text-orange-600 hover:text-orange-900">Download Control Register (PDF)</button>
          </div>
        </div>

        {/* Review Alerts & Effectiveness */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Review Alerts
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-xs font-bold text-red-800">PPE Inspection Overdue</p>
                <p className="text-[10px] text-red-600 mt-1 italic">Line 2 Respiratory protection requires inspection since Apr 01.</p>
                <button className="mt-2 text-[10px] font-bold text-red-700 hover:underline">Settle Now →</button>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <p className="text-xs font-bold text-orange-800">Upcoming Noise Audit</p>
                <p className="text-[10px] text-orange-600 mt-1 italic">Administrative control review scheduled for Apr 25.</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 text-white">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-green-400" />
                Safety Impact
              </h3>
              <p className="text-3xl font-bold">-24%</p>
              <p className="text-xs text-gray-400 mt-1">Reduction in risk exposure across site since new engineering controls implementation.</p>
            </div>
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Shield className="w-24 h-24 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
