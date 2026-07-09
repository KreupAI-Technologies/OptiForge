'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  EquipmentAnalysisModal, CategoryTrendModal, PeriodComparisonModal,
  EquipmentAnalysisData, CategoryTrendData, PeriodComparisonData
} from '@/components/production/downtime/DowntimeAnalysisModals';
import { ExportAnalysisReportModal, ExportAnalysisConfig } from '@/components/production/downtime/DowntimeExportModals';

interface DowntimeAnalytics {
  period: string;
  totalDowntime: number;
  breakdownHours: number;
  maintenanceHours: number;
  changeoverHours: number;
  otherHours: number;
  avgMTBF: number;
  avgMTTR: number;
  availability: number;
}

interface EquipmentDowntime {
  equipment: string;
  totalDowntime: number;
  breakdownCount: number;
  avgDowntimePerEvent: number;
  mtbf: number;
  mttr: number;
  trend: 'improving' | 'stable' | 'worsening';
}

interface CategoryBreakdown {
  category: string;
  count: number;
  totalHours: number;
  percentage: number;
  avgDuration: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export default function DowntimeAnalysisPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');

  // Modal states
  const [isEquipmentAnalysisOpen, setIsEquipmentAnalysisOpen] = useState(false);
  const [isCategoryTrendOpen, setIsCategoryTrendOpen] = useState(false);
  const [isPeriodComparisonOpen, setIsPeriodComparisonOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedEquipmentData, setSelectedEquipmentData] = useState<EquipmentAnalysisData | null>(null);
  const [selectedCategoryData, setSelectedCategoryData] = useState<CategoryTrendData | null>(null);

  // Raw downtime records loaded from the NestJS backend
  // (production/downtime-records). All analytics below are derived from these.
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getDowntimeRecords()) as any[];
        if (!cancelled) setRecords(Array.isArray(raw) ? raw : []);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setRecords([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- Helpers derived from the raw record shape ----
  const durationOf = (r: any): number => {
    const n = Number(r?.durationMinutes);
    return Number.isFinite(n) ? n : 0;
  };
  const isResolved = (r: any): boolean =>
    !!(r?.endTime || r?.resolvedBy || String(r?.status).toLowerCase() === 'resolved');
  const round1 = (n: number) => Math.round(n * 10) / 10;

  // Map raw category -> display label used across this page.
  const categoryLabel = (c: any): string => {
    const key = String(c ?? '').toLowerCase();
    const map: Record<string, string> = {
      breakdown: 'Breakdown',
      setup: 'Setup',
      changeover: 'Changeover',
      maintenance: 'Maintenance',
      material_shortage: 'Material Shortage',
      quality_issue: 'Quality Issue',
      operator_unavailable: 'No Operator',
      other: 'Other',
    };
    return map[key] ?? (c ? String(c) : 'Other');
  };

  // Equipment-wise downtime, grouped by machine (falls back to work center).
  const equipmentDowntime: EquipmentDowntime[] = useMemo(() => {
    const groups = new Map<string, { totalMinutes: number; count: number; resolvedMinutes: number; resolvedCount: number }>();
    for (const r of records) {
      const key = String(r?.machineName ?? r?.workCenterName ?? 'Unknown');
      const g = groups.get(key) ?? { totalMinutes: 0, count: 0, resolvedMinutes: 0, resolvedCount: 0 };
      const dur = durationOf(r);
      g.totalMinutes += dur;
      g.count += 1;
      if (isResolved(r)) { g.resolvedMinutes += dur; g.resolvedCount += 1; }
      groups.set(key, g);
    }
    return Array.from(groups.entries())
      .map(([equipment, g]) => ({
        equipment,
        totalDowntime: round1(g.totalMinutes / 60),
        breakdownCount: g.count,
        avgDowntimePerEvent: g.count > 0 ? round1(g.totalMinutes / g.count / 60) : 0,
        // MTBF/MTTR need operating time; MTTR approximated from resolved events, MTBF not derivable.
        mtbf: 0,
        mttr: g.resolvedCount > 0 ? round1(g.resolvedMinutes / g.resolvedCount / 60) : 0,
        trend: 'stable' as const,
      }))
      .sort((a, b) => b.totalDowntime - a.totalDowntime);
  }, [records]);

  // Category breakdown grouped by the record's `category` field.
  const categoryBreakdown: CategoryBreakdown[] = useMemo(() => {
    const totalMinutesAll = records.reduce((s, r) => s + durationOf(r), 0);
    const groups = new Map<string, { count: number; totalMinutes: number }>();
    for (const r of records) {
      const label = categoryLabel(r?.category);
      const g = groups.get(label) ?? { count: 0, totalMinutes: 0 };
      g.count += 1;
      g.totalMinutes += durationOf(r);
      groups.set(label, g);
    }
    return Array.from(groups.entries())
      .map(([category, g]) => ({
        category,
        count: g.count,
        totalHours: round1(g.totalMinutes / 60),
        percentage: totalMinutesAll > 0 ? round1((g.totalMinutes / totalMinutesAll) * 100) : 0,
        avgDuration: g.count > 0 ? Math.round(g.totalMinutes / g.count) : 0,
        trend: 'stable' as const,
      }))
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [records]);

  // Monthly analytics grouped by the month of startTime.
  const monthlyAnalytics: DowntimeAnalytics[] = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groups = new Map<string, {
      period: string; sortKey: number; totalMinutes: number;
      breakdownMinutes: number; maintenanceMinutes: number; changeoverMinutes: number;
      resolvedMinutes: number; resolvedCount: number;
    }>();
    for (const r of records) {
      const t = r?.startTime ? new Date(r.startTime) : null;
      if (!t || Number.isNaN(t.getTime())) continue;
      const y = t.getFullYear();
      const m = t.getMonth();
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const g = groups.get(key) ?? {
        period: `${monthNames[m]} ${y}`, sortKey: y * 12 + m, totalMinutes: 0,
        breakdownMinutes: 0, maintenanceMinutes: 0, changeoverMinutes: 0,
        resolvedMinutes: 0, resolvedCount: 0,
      };
      const dur = durationOf(r);
      g.totalMinutes += dur;
      const cat = String(r?.category ?? '').toLowerCase();
      if (cat === 'breakdown') g.breakdownMinutes += dur;
      else if (cat === 'maintenance') g.maintenanceMinutes += dur;
      else if (cat === 'changeover' || cat === 'setup') g.changeoverMinutes += dur;
      if (isResolved(r)) { g.resolvedMinutes += dur; g.resolvedCount += 1; }
      groups.set(key, g);
    }
    return Array.from(groups.values())
      .sort((a, b) => b.sortKey - a.sortKey) // most recent first
      .map(g => {
        const otherMinutes = Math.max(0, g.totalMinutes - g.breakdownMinutes - g.maintenanceMinutes - g.changeoverMinutes);
        return {
          period: g.period,
          totalDowntime: round1(g.totalMinutes / 60),
          breakdownHours: round1(g.breakdownMinutes / 60),
          maintenanceHours: round1(g.maintenanceMinutes / 60),
          changeoverHours: round1(g.changeoverMinutes / 60),
          otherHours: round1(otherMinutes / 60),
          // MTBF/availability need total operating time (not in records) -> 0.
          avgMTBF: 0,
          avgMTTR: g.resolvedCount > 0 ? round1(g.resolvedMinutes / g.resolvedCount / 60) : 0,
          availability: 0,
        };
      });
  }, [records]);

  const emptyPeriod: DowntimeAnalytics = {
    period: '—', totalDowntime: 0, breakdownHours: 0, maintenanceHours: 0,
    changeoverHours: 0, otherHours: 0, avgMTBF: 0, avgMTTR: 0, availability: 0,
  };
  const currentPeriod = monthlyAnalytics[0] ?? emptyPeriod;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return 'text-green-700 bg-green-100';
      case 'stable':
        return 'text-blue-700 bg-blue-100';
      case 'worsening':
      case 'increasing':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return <TrendingDown className="w-4 h-4" />;
      case 'worsening':
      case 'increasing':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  // Modal handlers
  const handleEquipmentClick = (equipment: any) => {
    // Convert to EquipmentAnalysisData format
    const equipmentData: EquipmentAnalysisData = {
      equipmentId: equipment.equipment,
      equipmentName: equipment.equipment,
      type: '',
      period: selectedPeriod,
      metrics: {
        totalDowntime: equipment.totalDowntime,
        eventCount: equipment.breakdownCount,
        mtbf: equipment.mtbf,
        mttr: equipment.mttr,
        trend: equipment.trend,
        targetMTBF: 168, // 1 week
        targetMTTR: 4
      },
      events: [],
      categoryBreakdown: [],
      costImpact: {
        total: 0,
        average: 0,
        trend: 0
      },
      recommendations: equipment.trend === 'worsening' ? [
        'Schedule preventive maintenance',
        'Investigate recurring failure patterns',
        'Review operator training'
      ] : []
    };
    setSelectedEquipmentData(equipmentData);
    setIsEquipmentAnalysisOpen(true);
  };

  const handleCategoryClick = (category: any) => {
    // Convert to CategoryTrendData format
    const categoryData: CategoryTrendData = {
      category: category.category,
      totalEvents: category.count,
      totalHours: category.totalHours,
      avgDuration: category.avgDuration,
      totalCost: 0,
      trendStatus: category.trend,
      monthlyTrends: [],
      topEquipment: []
    };
    setSelectedCategoryData(categoryData);
    setIsCategoryTrendOpen(true);
  };

  const handleComparePeriods = () => {
    setIsPeriodComparisonOpen(true);
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = async (_config: ExportAnalysisConfig): Promise<void> => {
    exportToCsv('downtime-analysis', equipmentDowntime as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading…</div>)}
      {loadError && !isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Downtime Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">Analyze trends, patterns, and root causes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleComparePeriods}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Compare Periods</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current-month">Current Month (Oct 2025)</option>
            <option value="last-month">Last Month (Sep 2025)</option>
            <option value="last-quarter">Last Quarter (Jul-Sep 2025)</option>
            <option value="ytd">Year to Date (2025)</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Downtime</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{currentPeriod.totalDowntime}h</p>
              <p className="text-xs text-red-600 mt-1">{currentPeriod.period}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Availability</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{currentPeriod.availability}%</p>
              <p className="text-xs text-blue-600 mt-1">Equipment uptime</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg MTBF</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{currentPeriod.avgMTBF}h</p>
              <p className="text-xs text-green-600 mt-1">Mean Time Between Failures</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg MTTR</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{currentPeriod.avgMTTR}h</p>
              <p className="text-xs text-orange-600 mt-1">Mean Time To Repair</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Downtime Trend</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Breakdown</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Maintenance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Changeover</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Other</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">MTBF</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">MTTR</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyAnalytics.map((month, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.period}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{month.totalDowntime}h</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{month.breakdownHours}h</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{month.maintenanceHours}h</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{month.changeoverHours}h</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{month.otherHours}h</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">{month.avgMTBF}h</td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-right">{month.avgMTTR}h</td>
                  <td className="px-4 py-3 text-sm text-blue-600 text-right font-bold">{month.availability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment-wise Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Equipment-wise Downtime Analysis</h3>
        <div className="space-y-3">
          {equipmentDowntime.map((eq, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleEquipmentClick(eq)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{eq.equipment}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(eq.trend)}`}>
                    {getTrendIcon(eq.trend)}
                    {eq.trend}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{eq.totalDowntime}h</p>
                  <p className="text-xs text-gray-500">Total downtime</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Breakdowns</p>
                  <p className="text-sm font-semibold text-gray-900">{eq.breakdownCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg per Event</p>
                  <p className="text-sm font-semibold text-gray-900">{eq.avgDowntimePerEvent.toFixed(1)}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">MTBF</p>
                  <p className="text-sm font-semibold text-green-600">{eq.mtbf}h</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">MTTR</p>
                  <p className="text-sm font-semibold text-orange-600">{eq.mttr}h</p>
                </div>
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(eq.totalDowntime / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown - Pareto Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Downtime by Category - Pareto Chart</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Duration</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categoryBreakdown.map((cat, idx) => (
                <tr
                  key={idx}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{cat.count}</td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">{cat.totalHours}h</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{cat.percentage}%</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{cat.avgDuration} mins</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(cat.trend)}`}>
                      {getTrendIcon(cat.trend)}
                      {cat.trend}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Components */}
      {selectedEquipmentData && (
        <EquipmentAnalysisModal
          isOpen={isEquipmentAnalysisOpen}
          onClose={() => setIsEquipmentAnalysisOpen(false)}
          data={selectedEquipmentData}
        />
      )}

      {selectedCategoryData && (
        <CategoryTrendModal
          isOpen={isCategoryTrendOpen}
          onClose={() => setIsCategoryTrendOpen(false)}
          data={selectedCategoryData}
        />
      )}

      <PeriodComparisonModal
        isOpen={isPeriodComparisonOpen}
        onClose={() => setIsPeriodComparisonOpen(false)}
        data={{
          period1: {
            start: '2025-09-01',
            end: '2025-09-30',
            metrics: {
              totalDowntime: 52.3,
              eventCount: 28,
              mtbf: 445,
              mttr: 6.2,
              totalCost: 125000,
              availability: 93.2,
              categoryBreakdown: [
                { category: 'Breakdown', count: 15, totalHours: 24.8, percentage: 47.4, avgDuration: 99, trend: 'stable' },
                { category: 'Maintenance', count: 6, totalHours: 11.2, percentage: 21.4, avgDuration: 112, trend: 'stable' },
              ],
            },
          },
          period2: {
            start: '2025-10-01',
            end: '2025-10-31',
            metrics: {
              totalDowntime: 58.5,
              eventCount: 32,
              mtbf: 420,
              mttr: 6.8,
              totalCost: 145000,
              availability: 92.5,
              categoryBreakdown: [
                { category: 'Breakdown', count: 19, totalHours: 28.5, percentage: 48.7, avgDuration: 90, trend: 'increasing' },
                { category: 'Maintenance', count: 8, totalHours: 12.5, percentage: 21.4, avgDuration: 94, trend: 'stable' },
              ],
            },
          },
          variance: {
            totalDowntime: 11.9,
            eventCount: 14.3,
            mtbf: -5.6,
            mttr: 9.7,
            totalCost: 16.0,
            availability: -0.8,
          },
          insights: [
            'Total downtime increased by 11.9% compared to previous period',
            'MTBF decreased by 5.6%, indicating more frequent failures',
            'Availability dropped from 93.2% to 92.5%',
          ],
        }}
      />

      <ExportAnalysisReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
