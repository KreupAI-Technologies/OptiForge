'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, BarChart3, TrendingUp, TrendingDown, Calendar, FileText, Award, AlertTriangle } from 'lucide-react';
import { ExportQualityReportModal } from '@/components/quality/QualityExportModals';
import { exportToCsv } from '@/lib/export';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface QualityMetric {
  period: string;
  totalProduced: number;
  totalInspected: number;
  totalPassed: number;
  totalRejected: number;
  rejectedCount?: number;
  passRate: number;
  rejectionRate: number;
  firstPassYield: number;
  reworkCount: number;
  scrapCount: number;
  ncrCount: number;
  costOfQuality: number;
}

interface ProductQuality {
  productCode: string;
  productName: string;
  category: string;
  totalProduced: number;
  passRate: number;
  rejectionRate: number;
  defectRate: number;
  topDefects: string[];
  qualityScore: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface DefectAnalysis {
  defectType: string;
  occurrences: number;
  percentage: number;
  affectedProducts: number;
  estimatedCost: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export default function QualityReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Quality metrics over time (live)
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getNcrs()) as any[];
        const mapped: QualityMetric[] = (raw || []).map((r: any) => ({
          period: String(r.period ?? ''),
          totalProduced: Number(r.totalProduced ?? 0),
          totalInspected: Number(r.totalInspected ?? 0),
          totalPassed: Number(r.totalPassed ?? 0),
          totalRejected: Number(r.totalRejected ?? 0),
          rejectedCount: r.rejectedCount != null ? Number(r.rejectedCount) : undefined,
          passRate: Number(r.passRate ?? 0),
          rejectionRate: Number(r.rejectionRate ?? 0),
          firstPassYield: Number(r.firstPassYield ?? 0),
          reworkCount: Number(r.reworkCount ?? 0),
          scrapCount: Number(r.scrapCount ?? 0),
          ncrCount: Number(r.ncrCount ?? 0),
          costOfQuality: Number(r.costOfQuality ?? 0),
        }));
        if (!cancelled) setQualityMetrics(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setQualityMetrics([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Mock data for product-wise quality
  const productQuality: ProductQuality[] = [
    {
      productCode: 'KIT-SINK-001',
      productName: 'Premium Stainless Steel Kitchen Sink',
      category: 'Kitchen Sinks',
      totalProduced: 850,
      passRate: 97.2,
      rejectionRate: 2.8,
      defectRate: 2.8,
      topDefects: ['Surface finish', 'Welding defects', 'Dimensional'],
      qualityScore: 97.2,
      trend: 'improving'
    },
    {
      productCode: 'KIT-FAUCET-002',
      productName: 'Chrome Kitchen Faucet',
      category: 'Kitchen Faucets',
      totalProduced: 1120,
      passRate: 96.5,
      rejectionRate: 3.5,
      defectRate: 3.5,
      topDefects: ['Pressure test failure', 'Chrome defects', 'Thread issues'],
      qualityScore: 96.5,
      trend: 'stable'
    },
    {
      productCode: 'KIT-COOKWARE-003',
      productName: 'Non-Stick Cookware Set',
      category: 'Cookware',
      totalProduced: 680,
      passRate: 95.1,
      rejectionRate: 4.9,
      defectRate: 4.9,
      topDefects: ['Coating adhesion', 'Handle issues', 'Surface defects'],
      qualityScore: 95.1,
      trend: 'declining'
    },
    {
      productCode: 'KIT-CHIMNEY-001',
      productName: 'Built-in Kitchen Chimney',
      category: 'Kitchen Appliances',
      totalProduced: 420,
      passRate: 98.1,
      rejectionRate: 1.9,
      defectRate: 1.9,
      topDefects: ['Noise level', 'Electrical safety', 'Filter efficiency'],
      qualityScore: 98.1,
      trend: 'improving'
    },
    {
      productCode: 'KIT-MIXER-007',
      productName: 'Electric Mixer Grinder',
      category: 'Kitchen Appliances',
      totalProduced: 920,
      passRate: 97.8,
      rejectionRate: 2.2,
      defectRate: 2.2,
      topDefects: ['Motor performance', 'Blade quality', 'Jar leakage'],
      qualityScore: 97.8,
      trend: 'stable'
    },
    {
      productCode: 'KIT-CABINET-004',
      productName: 'Modular Kitchen Cabinet',
      category: 'Kitchen Cabinets',
      totalProduced: 580,
      passRate: 96.0,
      rejectionRate: 4.0,
      defectRate: 4.0,
      topDefects: ['Dimensional', 'Edge banding', 'Hardware issues'],
      qualityScore: 96.0,
      trend: 'improving'
    },
    {
      productCode: 'KIT-STORAGE-008',
      productName: 'Kitchen Storage Container Set',
      category: 'Kitchen Accessories',
      totalProduced: 1280,
      passRate: 98.5,
      rejectionRate: 1.5,
      defectRate: 1.5,
      topDefects: ['Lid fit', 'Material defects', 'Print quality'],
      qualityScore: 98.5,
      trend: 'stable'
    }
  ];

  // Mock data for defect analysis
  const defectAnalysis: DefectAnalysis[] = [
    {
      defectType: 'Surface Finish Defects',
      occurrences: 45,
      percentage: 29.0,
      affectedProducts: 3,
      estimatedCost: 385000,
      trend: 'decreasing'
    },
    {
      defectType: 'Coating Issues',
      occurrences: 35,
      percentage: 22.6,
      affectedProducts: 2,
      estimatedCost: 425000,
      trend: 'stable'
    },
    {
      defectType: 'Dimensional Non-Conformance',
      occurrences: 28,
      percentage: 18.1,
      affectedProducts: 4,
      estimatedCost: 215000,
      trend: 'stable'
    },
    {
      defectType: 'Functional Test Failures',
      occurrences: 22,
      percentage: 14.2,
      affectedProducts: 3,
      estimatedCost: 340000,
      trend: 'increasing'
    },
    {
      defectType: 'Material Defects',
      occurrences: 15,
      percentage: 9.7,
      affectedProducts: 2,
      estimatedCost: 185000,
      trend: 'decreasing'
    },
    {
      defectType: 'Packaging Damage',
      occurrences: 10,
      percentage: 6.4,
      affectedProducts: 5,
      estimatedCost: 45000,
      trend: 'stable'
    }
  ];

  const filteredProducts = productQuality.filter(product => {
    return filterCategory === 'all' || product.category === filterCategory;
  });

  const emptyMetrics: QualityMetric = {
    period: '',
    totalProduced: 0,
    totalInspected: 0,
    totalPassed: 0,
    totalRejected: 0,
    passRate: 0,
    rejectionRate: 0,
    firstPassYield: 0,
    reworkCount: 0,
    scrapCount: 0,
    ncrCount: 0,
    costOfQuality: 0,
  };
  const currentMetrics = qualityMetrics[0] ?? emptyMetrics;
  const previousMetrics = qualityMetrics[1] ?? emptyMetrics;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-700 bg-green-100';
      case 'stable': return 'text-blue-700 bg-blue-100';
      case 'declining': return 'text-red-700 bg-red-100';
      case 'increasing': return 'text-red-700 bg-red-100';
      case 'decreasing': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return <TrendingUp className="w-4 h-4" />;
      case 'declining':
      case 'increasing':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 98) return 'text-green-600';
    if (score >= 95) return 'text-blue-600';
    if (score >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Modal handlers
  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = (_data: any) => {
    exportToCsv('quality-report', filteredProducts as unknown as Record<string, unknown>[]);
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
            <h1 className="text-2xl font-bold text-gray-900">Quality Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Comprehensive quality performance metrics and trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Pass Rate</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{currentMetrics.passRate}%</p>
              <p className="text-xs text-green-600 mt-1">
                {currentMetrics.passRate > previousMetrics.passRate ? '↑' : '↓'}
                {Math.abs(currentMetrics.passRate - previousMetrics.passRate).toFixed(1)}% vs last month
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Award className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">First Pass Yield</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{currentMetrics.firstPassYield}%</p>
              <p className="text-xs text-blue-600 mt-1">
                {currentMetrics.firstPassYield > previousMetrics.firstPassYield ? '↑' : '↓'}
                {Math.abs(currentMetrics.firstPassYield - previousMetrics.firstPassYield).toFixed(1)}% vs last month
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejection Rate</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{currentMetrics.rejectionRate}%</p>
              <p className="text-xs text-red-600 mt-1">
                {currentMetrics.rejectedCount} units rejected
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Cost of Quality</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">₹{(currentMetrics.costOfQuality / 100000).toFixed(1)}L</p>
              <p className="text-xs text-orange-600 mt-1">
                {currentMetrics.ncrCount} NCRs this month
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <FileText className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Quality Trend</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Produced</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Passed</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pass Rate</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">FPY</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rework</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Scrap</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">NCRs</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {qualityMetrics.map((metric, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{metric.period}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{metric.totalProduced.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-600 text-right">{metric.totalPassed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-bold text-right">
                    <span className={getQualityScoreColor(metric.passRate)}>{metric.passRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 text-right">{metric.firstPassYield}%</td>
                  <td className="px-4 py-3 text-sm text-yellow-600 text-right">{metric.reworkCount}</td>
                  <td className="px-4 py-3 text-sm text-red-600 text-right">{metric.scrapCount}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-right">{metric.ncrCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{(metric.costOfQuality / 100000).toFixed(1)}L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product-wise Quality */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">Product-wise Quality Performance</h3>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Kitchen Sinks">Kitchen Sinks</option>
            <option value="Kitchen Faucets">Kitchen Faucets</option>
            <option value="Cookware">Cookware</option>
            <option value="Kitchen Cabinets">Kitchen Cabinets</option>
            <option value="Kitchen Appliances">Kitchen Appliances</option>
            <option value="Kitchen Accessories">Kitchen Accessories</option>
          </select>
        </div>
        <div className="space-y-3">
          {filteredProducts.map((product, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{product.productCode}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(product.trend)}`}>
                      {getTrendIcon(product.trend)}
                      {product.trend}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{product.productName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Quality Score</p>
                  <p className={`text-2xl font-bold ${getQualityScoreColor(product.qualityScore)}`}>
                    {product.qualityScore}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                <div>
                  <p className="text-xs text-gray-500">Total Produced</p>
                  <p className="text-sm font-semibold text-gray-900">{product.totalProduced}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pass Rate</p>
                  <p className="text-sm font-semibold text-green-600">{product.passRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rejection Rate</p>
                  <p className="text-sm font-semibold text-red-600">{product.rejectionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Top Defects</p>
                  <p className="text-xs text-gray-700">{product.topDefects.slice(0, 2).join(', ')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Defect Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Defect Analysis - Pareto Chart</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defect Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Occurrences</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Est. Cost</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trend</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {defectAnalysis.map((defect, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{defect.defectType}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{defect.occurrences}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">{defect.percentage}%</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{defect.affectedProducts}</td>
                  <td className="px-4 py-3 text-sm text-orange-600 text-right">₹{defect.estimatedCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(defect.trend)}`}>
                      {getTrendIcon(defect.trend)}
                      {defect.trend}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${defect.percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <ExportQualityReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
