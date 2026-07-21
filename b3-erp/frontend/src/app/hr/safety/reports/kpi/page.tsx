'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Download,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Activity,
  Gauge,
  BarChart3,
  FileCheck,
  Flame,
  Heart,
  HardHat,
  Eye
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell
} from 'recharts';
import {
  HrSafetyService,
  SafetyReport,
  rowsToCsv,
  downloadTextFile,
} from '@/services/hr-safety.service';

interface LeadingIndicatorRow {
  name: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
}

interface LaggingIndicatorRow {
  name: string;
  current: number;
  target: number;
  yearAgo: number;
  trend: string;
}

// Named statutory ratios (TRIR/LTIR/DART…) with targets and prior-period
// trends — a fixed metric shape the flat report list does not carry as
// discrete keys; the list instead feeds the leading/lagging tables below.
const kpiData = {
  trir: { value: 1.8, target: 2.0, trend: -15, status: 'On Track' },
  ltir: { value: 0.4, target: 0.5, trend: -20, status: 'On Track' },
  dart: { value: 0.6, target: 0.8, trend: -10, status: 'On Track' },
  severity: { value: 12.5, target: 15.0, trend: -8, status: 'On Track' },
  nearMissRatio: { value: 8.2, target: 10.0, trend: 25, status: 'Improvement Needed' },
  trainingCompletion: { value: 94, target: 100, trend: 3, status: 'On Track' },
  auditScore: { value: 92, target: 95, trend: 5, status: 'On Track' },
  incidentsClosed: { value: 87, target: 90, trend: 8, status: 'On Track' }
};

// Per-department scores are not derivable from the flat report list; left as
// reference series pending a department-bucketed feed. The TRIR/LTIR monthly
// time-series is now computed server-side (see monthlyKPITrend state below).
const departmentScores = [
  { dept: 'Manufacturing', score: 91, target: 95 },
  { dept: 'Warehouse', score: 88, target: 95 },
  { dept: 'Maintenance', score: 95, target: 95 },
  { dept: 'Quality Lab', score: 98, target: 95 },
  { dept: 'Administration', score: 96, target: 95 }
];

const gaugeData = (value: number, color: string) => [
  { name: 'value', value: value, fill: color },
  { name: 'remaining', value: 100 - value, fill: '#f3f4f6' }
];

export default function SafetyKPIsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');
  const [leadingIndicators, setLeadingIndicators] = useState<LeadingIndicatorRow[]>([]);
  const [laggingIndicators, setLaggingIndicators] = useState<LaggingIndicatorRow[]>([]);
  const [monthlyKPITrend, setMonthlyKPITrend] = useState<
    Array<{ month: string; trir: number; ltir: number; target: number }>
  >([]);
  // Computed TRIR/LTIR summary; overrides the static card reference values.
  const [computedTrir, setComputedTrir] = useState<number | null>(null);
  const [computedLtir, setComputedLtir] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const trirValue = computedTrir ?? kpiData.trir.value;
  const ltirValue = computedLtir ?? kpiData.ltir.value;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      const monthsBack =
        selectedPeriod === 'mtd'
          ? 1
          : selectedPeriod === 'qtd'
            ? 3
            : selectedPeriod === 'rolling12'
              ? 12
              : 12; // ytd
      try {
        const [rows, trends] = await Promise.all([
          HrSafetyService.getReports('kpi'),
          HrSafetyService.getTrends(monthsBack),
        ]);
        const leading: LeadingIndicatorRow[] = [];
        const lagging: LaggingIndicatorRow[] = [];
        rows.forEach((row: SafetyReport) => {
          const meta = (row.meta || {}) as any;
          const group = (row.category ?? meta.group ?? '').toString().toLowerCase();
          if (group === 'lagging') {
            lagging.push({
              name: row.label ?? '',
              current: row.value ?? 0,
              target: row.target ?? 0,
              yearAgo: meta.yearAgo ?? 0,
              trend: row.trend ?? meta.trend ?? 'down',
            });
          } else {
            const current = row.value ?? 0;
            const target = row.target ?? 0;
            leading.push({
              name: row.label ?? '',
              current,
              target,
              unit: row.unit ?? '',
              progress: meta.progress ?? (target > 0 ? Math.round((current / target) * 100) : 0),
            });
          }
        });
        if (!cancelled) {
          setLeadingIndicators(leading);
          setLaggingIndicators(lagging);
          setMonthlyKPITrend(
            trends.monthlyTrends.map((m) => ({
              month: m.month,
              trir: m.trir,
              ltir: m.ltir,
              target: m.target,
            })),
          );
          setComputedTrir(trends.summary.trir);
          setComputedLtir(trends.summary.ltir);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load safety KPIs');
          setLeadingIndicators([]);
          setLaggingIndicators([]);
          setMonthlyKPITrend([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedPeriod]);

  const handleExport = () => {
    const csv = rowsToCsv([
      ...leadingIndicators.map((i) => ({
        kind: 'leading',
        name: i.name,
        current: i.current,
        target: i.target,
        unit: i.unit,
        progress: i.progress,
      })),
      ...laggingIndicators.map((i) => ({
        kind: 'lagging',
        name: i.name,
        current: i.current,
        target: i.target,
        yearAgo: i.yearAgo,
        trend: i.trend,
      })),
    ]);
    downloadTextFile(`safety-kpis-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-green-600 bg-green-50';
      case 'Improvement Needed': return 'text-yellow-600 bg-yellow-50';
      case 'At Risk': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-3 text-sm font-medium">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-8 w-8 text-orange-600" />
            Safety Key Performance Indicators
          </h1>
          <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
            Real-time monitoring of safety metrics and performance targets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white"
          >
            <option value="mtd">Month to Date</option>
            <option value="qtd">Quarter to Date</option>
            <option value="ytd">Year to Date</option>
            <option value="rolling12">Rolling 12 Months</option>
          </select>
          <button
            onClick={handleExport}
            disabled={leadingIndicators.length === 0 && laggingIndicators.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Export KPIs
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading safety KPIs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* TRIR */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TRIR</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Total Recordable Incident Rate</p>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${getStatusColor(kpiData.trir.status)}`}>
              {kpiData.trir.status}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900 italic tracking-tighter leading-none">{trirValue}</p>
            <p className="text-sm text-gray-400 font-bold mb-1">/ {kpiData.trir.target}</p>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowDownRight className="w-4 h-4 text-green-500" />
            <span className="text-[10px] text-green-600 font-black">{Math.abs(kpiData.trir.trend)}% improvement</span>
          </div>
        </div>

        {/* LTIR */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">LTIR</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Lost Time Incident Rate</p>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${getStatusColor(kpiData.ltir.status)}`}>
              {kpiData.ltir.status}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900 italic tracking-tighter leading-none">{ltirValue}</p>
            <p className="text-sm text-gray-400 font-bold mb-1">/ {kpiData.ltir.target}</p>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowDownRight className="w-4 h-4 text-green-500" />
            <span className="text-[10px] text-green-600 font-black">{Math.abs(kpiData.ltir.trend)}% improvement</span>
          </div>
        </div>

        {/* DART */}
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">DART</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Days Away/Restricted/Transfer</p>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${getStatusColor(kpiData.dart.status)}`}>
              {kpiData.dart.status}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900 italic tracking-tighter leading-none">{kpiData.dart.value}</p>
            <p className="text-sm text-gray-400 font-bold mb-1">/ {kpiData.dart.target}</p>
          </div>
          <div className="flex items-center gap-1 mt-4">
            <ArrowDownRight className="w-4 h-4 text-green-500" />
            <span className="text-[10px] text-green-600 font-black">{Math.abs(kpiData.dart.trend)}% improvement</span>
          </div>
        </div>

        {/* Severity Rate */}
        <div className="bg-gray-900 p-3 rounded-2xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Severity Rate</p>
                <p className="text-[9px] text-gray-600 mt-0.5">Lost days per 200K hours</p>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{kpiData.severity.value}</p>
              <p className="text-sm text-gray-500 font-bold mb-1">/ {kpiData.severity.target}</p>
            </div>
            <div className="flex items-center gap-1 mt-4">
              <ArrowDownRight className="w-4 h-4 text-green-500" />
              <span className="text-[10px] text-green-500 font-black">{Math.abs(kpiData.severity.trend)}% better</span>
            </div>
          </div>
          <Target className="absolute -bottom-4 -right-4 w-20 h-20 text-white opacity-5" />
        </div>
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
          <div className="p-3 bg-yellow-50 rounded-xl">
            <Eye className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Near Miss Ratio</p>
            <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{kpiData.nearMissRatio.value}:1</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Award className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Training Completion</p>
            <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{kpiData.trainingCompletion.value}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
          <div className="p-3 bg-purple-50 rounded-xl">
            <FileCheck className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Score</p>
            <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{kpiData.auditScore.value}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
          <div className="p-3 bg-green-50 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incidents Closed</p>
            <p className="text-2xl font-black text-gray-900 italic tracking-tighter">{kpiData.incidentsClosed.value}%</p>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* KPI Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" /> KPI Performance Trend
            </h3>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> TRIR</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> LTIR</span>
              <span className="flex items-center gap-1 text-gray-400"><span className="w-3 h-0.5 bg-gray-400"></span> Target</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyKPITrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={[0, 3]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="trir" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4 }} />
              <Line type="monotone" dataKey="ltir" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="target" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Scores */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2 mb-3">
            <HardHat className="w-4 h-4 text-orange-600" /> Department Safety Scores
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={departmentScores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="#9ca3af" domain={[0, 100]} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 9 }} stroke="#9ca3af" width={85} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {departmentScores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.score >= entry.target ? '#22c55e' : '#f97316'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Meets Target</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Below Target</span>
          </div>
        </div>
      </div>

      {/* Leading & Lagging Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Leading Indicators */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-blue-600" /> Leading Indicators
          </h3>
          <div className="space-y-2">
            {leadingIndicators.map((indicator, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-gray-700 font-bold">{indicator.name}</span>
                  <span className="text-[10px] font-black text-gray-900">
                    {indicator.current}{indicator.unit} / {indicator.target}{indicator.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${indicator.progress >= 90 ? 'bg-green-500' : indicator.progress >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${indicator.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lagging Indicators */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-red-600" /> Lagging Indicators
          </h3>
          <table className="w-full">
            <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              <tr>
                <th className="text-left py-2">Metric</th>
                <th className="text-center py-2">Current</th>
                <th className="text-center py-2">Target</th>
                <th className="text-center py-2">Year Ago</th>
                <th className="text-right py-2">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {laggingIndicators.map((indicator, i) => (
                <tr key={i} className="text-[11px]">
                  <td className="py-3 text-gray-700 font-bold">{indicator.name}</td>
                  <td className="py-3 text-center font-black text-gray-900">{indicator.current}</td>
                  <td className="py-3 text-center text-gray-500">{indicator.target}</td>
                  <td className="py-3 text-center text-gray-400">{indicator.yearAgo}</td>
                  <td className="py-3 text-right">
                    {indicator.trend === 'down' ? (
                      <span className="flex items-center justify-end gap-1 text-green-600">
                        <TrendingDown className="w-3 h-3" />
                        <span className="text-[10px] font-black">Improved</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-red-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-[10px] font-black">Worsened</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Days Since Last Incident Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-green-200">Days Since Last Recordable Incident</p>
              <p className="text-5xl font-black italic tracking-tighter">47</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-200">Best Streak This Year</p>
            <p className="text-3xl font-black italic tracking-tighter">62 Days</p>
          </div>
        </div>
        <Target className="absolute -bottom-8 -right-8 w-32 h-32 text-white opacity-10" />
      </div>
    </div>
  );
}
