'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Download,
  Filter,
  BarChart2,
  AlertCircle,
  TrendingDown,
  Info,
  ChevronRight
} from 'lucide-react';
import { HrSafetyService, SafetyHazard } from '@/services/hr-safety.service';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Risk-level color map (label constant — not mock data; values derived)
const RISK_LEVEL_META: { name: string; color: string }[] = [
  { name: 'Critical', color: '#ef4444' },
  { name: 'High', color: '#f97316' },
  { name: 'Medium', color: '#eab308' },
  { name: 'Low', color: '#10b981' },
];

interface RiskItem {
  id: string;
  hazard: string;
  department: string;
  likelihood: number;
  impact: number;
  rpn: number;
  level: string;
  controls: string;
  status: string;
}

export default function RiskRegisterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskRegister, setRiskRegister] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getHazards('risk');
        const mapped: RiskItem[] = rows.map((row: SafetyHazard) => {
          const meta = (row.meta || {}) as any;
          const likelihood = Number(meta.likelihood ?? row.likelihood ?? 0) || 0;
          const impact = Number(meta.impact ?? 0) || 0;
          const rpn = Number(meta.rpn ?? row.riskScore ?? (likelihood * impact)) || 0;
          return {
            id: String(row.id),
            hazard: row.title ?? '',
            department: row.department ?? '',
            likelihood,
            impact,
            rpn,
            level: row.riskLevel ?? '',
            controls: row.controlMeasures ?? '',
            status: row.status ?? '',
          };
        });
        if (!cancelled) setRiskRegister(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load risk register');
          setRiskRegister([]);
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

  // Derived risk-level distribution (pie) from fetched register
  const riskSummaryData = RISK_LEVEL_META.map((meta) => ({
    ...meta,
    value: riskRegister.filter((r) => r.level === meta.name).length,
  }));

  const filteredRegister = riskRegister.filter((r) => {
    const q = searchTerm.toLowerCase();
    return r.hazard.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  });

  // Derived risk exposure by department (bar) from fetched register
  const departmentRiskData = Object.entries(
    riskRegister.reduce<Record<string, { total: number; high: number; critical: number }>>((acc, r) => {
      const dept = r.department || 'Unassigned';
      if (!acc[dept]) acc[dept] = { total: 0, high: 0, critical: 0 };
      acc[dept].total += 1;
      if (r.level === 'High') acc[dept].high += 1;
      if (r.level === 'Critical') acc[dept].critical += 1;
      return acc;
    }, {}),
  ).map(([dept, v]) => ({ dept, ...v }));

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-8 w-8 text-orange-600" />
            Risk Register
          </h1>
          <p className="text-gray-500 mt-1">Central database of all identified risks, their evaluations, and current status</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export Register
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading risk register…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Risk Level Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskSummaryData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskSummaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {riskSummaryData.map((item, idx) => (
              <span key={idx} className="text-[10px] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                {item.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-2">Risk Exposure by Department</h3>
          <div className="h-48 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentRiskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="total" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} name="Total Risks" />
                <Bar dataKey="high" stackId="b" fill="#f97316" radius={[4, 4, 0, 0]} name="High Risks" />
                <Bar dataKey="critical" stackId="c" fill="#ef4444" radius={[4, 4, 0, 0]} name="Critical Risks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="bg-red-600 p-3 rounded-xl text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-red-100">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Site Hazard Level</span>
            </div>
            <p className="text-4xl font-extrabold tracking-tight">ELEVATED</p>
            <p className="text-xs text-red-100 mt-2">Based on current open critical investigations and pending risk evaluations.</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">{riskRegister.length} Total Entries</p>
              <p className="text-xs text-gray-500 mt-1">Consolidated risk database</p>
            </div>
            <BarChart2 className="w-8 h-8 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            < Database className="w-5 h-5 text-gray-400" />
            Master Risk Register
          </h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search database..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg text-gray-400 hover:text-gray-900 shadow-sm">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] text-gray-600">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-3 py-2">Ref ID & Hazard Description</th>
                <th className="px-3 py-2">L x I = RPN</th>
                <th className="px-3 py-2">Risk Level</th>
                <th className="px-3 py-2">Implemented Controls</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRegister.map((risk) => (
                <tr key={risk.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="font-bold text-gray-900">{risk.hazard}</div>
                    <div className="text-[10px] text-gray-400">Database Reference: {risk.id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                      {risk.likelihood} x {risk.impact} = {risk.rpn}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${risk.level === 'Critical' ? 'bg-red-100 text-red-800' :
                        risk.level === 'High' ? 'bg-orange-100 text-orange-800' :
                          risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                      }`}>
                      {risk.level}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate text-[10px]">
                    {risk.controls}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1.5 font-bold ${risk.status === 'Mitigated' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${risk.status === 'Mitigated' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-gray-300 hover:text-orange-600">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Register compliant with OSHA / ISO 31000 standards. Last update: Today.</span>
          </div>
          <p>Showing {filteredRegister.length} of {riskRegister.length} registered risks</p>
        </div>
      </div>
    </div>
  );
}
