'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, TrendingUp, Activity, AlertTriangle,
  Clock, Users, Package, Settings, Download,
  ChevronDown, Calendar, Filter, RefreshCw,
  PieChart, Target, Zap, Award, AlertCircle
} from 'lucide-react';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
  trend: 'up' | 'down' | 'stable';
  previousPeriod: number;
}

interface ProductionData {
  month: string;
  planned: number;
  actual: number;
  efficiency: number;
}

interface ProductData {
  productCode: string;
  productName: string;
  planned: number;
  actual: number;
  variance: number;
  efficiency: number;
}

interface WorkCenterUtilization {
  workCenter: string;
  shifts: {
    morning: number;
    afternoon: number;
    night: number;
  };
  avgUtilization: number;
}

interface DefectData {
  defectType: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
}

interface DowntimeData {
  reason: string;
  hours: number;
  percentage: number;
  color: string;
}

interface ShiftPerformance {
  shift: string;
  production: number;
  target: number;
  efficiency: number;
  oee: number;
  downtime: number;
}

interface OperatorProductivity {
  operatorId: string;
  operatorName: string;
  shift: string;
  unitsProduced: number;
  target: number;
  efficiency: number;
  qualityRate: number;
  rank: number;
}

export default function ProductionAnalyticsPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState('thisMonth');
  const [selectedPlant, setSelectedPlant] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock OEE Metrics
  const oeeMetrics: OEEMetrics = {
    availability: 87.5,
    performance: 92.3,
    quality: 96.8,
    oee: 78.2,
    trend: 'up',
    previousPeriod: 75.8
  };

  // Mock Production Trend Data (12 months)
  const productionTrendData: ProductionData[] = [
    { month: 'Jan', planned: 45000, actual: 42300, efficiency: 94.0 },
    { month: 'Feb', planned: 48000, actual: 46100, efficiency: 96.0 },
    { month: 'Mar', planned: 52000, actual: 49800, efficiency: 95.8 },
    { month: 'Apr', planned: 50000, actual: 47200, efficiency: 94.4 },
    { month: 'May', planned: 55000, actual: 53100, efficiency: 96.5 },
    { month: 'Jun', planned: 58000, actual: 55800, efficiency: 96.2 },
    { month: 'Jul', planned: 60000, actual: 57000, efficiency: 95.0 },
    { month: 'Aug', planned: 62000, actual: 59500, efficiency: 95.9 },
    { month: 'Sep', planned: 61000, actual: 58800, efficiency: 96.4 },
    { month: 'Oct', planned: 63000, actual: 61200, efficiency: 97.1 },
    { month: 'Nov', planned: 65000, actual: 62800, efficiency: 96.6 },
    { month: 'Dec', planned: 64000, actual: 61500, efficiency: 96.1 }
  ];

  // Mock Product-wise Production
  const productWiseData: ProductData[] = [
    { productCode: 'P001', productName: 'Control Panel CP-1000', planned: 1200, actual: 1156, variance: -44, efficiency: 96.3 },
    { productCode: 'P002', productName: 'Switch Gear SG-500', planned: 850, actual: 872, variance: 22, efficiency: 102.6 },
    { productCode: 'P003', productName: 'Motor Starter MS-750', planned: 2100, actual: 2031, variance: -69, efficiency: 96.7 },
    { productCode: 'P004', productName: 'Transformer TR-300', planned: 450, actual: 467, variance: 17, efficiency: 103.8 },
    { productCode: 'P005', productName: 'Circuit Breaker CB-250', planned: 3200, actual: 3088, variance: -112, efficiency: 96.5 },
    { productCode: 'P006', productName: 'Relay Panel RP-400', planned: 680, actual: 702, variance: 22, efficiency: 103.2 },
    { productCode: 'P007', productName: 'Junction Box JB-150', planned: 4500, actual: 4365, variance: -135, efficiency: 97.0 },
    { productCode: 'P008', productName: 'Distribution Board DB-600', planned: 920, actual: 896, variance: -24, efficiency: 97.4 }
  ];

  // Mock Work Center Utilization (Heatmap data)
  const workCenterUtilization: WorkCenterUtilization[] = [
    { workCenter: 'WC-001: CNC Machining', shifts: { morning: 92, afternoon: 88, night: 76 }, avgUtilization: 85.3 },
    { workCenter: 'WC-002: Welding Bay', shifts: { morning: 85, afternoon: 89, night: 82 }, avgUtilization: 85.3 },
    { workCenter: 'WC-003: Assembly Line-1', shifts: { morning: 94, afternoon: 91, night: 87 }, avgUtilization: 90.7 },
    { workCenter: 'WC-004: Assembly Line-2', shifts: { morning: 88, afternoon: 86, night: 79 }, avgUtilization: 84.3 },
    { workCenter: 'WC-005: Painting Booth', shifts: { morning: 78, afternoon: 82, night: 74 }, avgUtilization: 78.0 },
    { workCenter: 'WC-006: Quality Testing', shifts: { morning: 96, afternoon: 94, night: 91 }, avgUtilization: 93.7 },
    { workCenter: 'WC-007: Packaging', shifts: { morning: 89, afternoon: 92, night: 86 }, avgUtilization: 89.0 }
  ];

  // Mock Defect Analysis (Pareto Chart)
  const defectData: DefectData[] = [
    { defectType: 'Dimensional Variation', count: 342, percentage: 38.5, cumulativePercentage: 38.5 },
    { defectType: 'Surface Finish', count: 256, percentage: 28.8, cumulativePercentage: 67.3 },
    { defectType: 'Weld Defects', count: 134, percentage: 15.1, cumulativePercentage: 82.4 },
    { defectType: 'Assembly Error', count: 89, percentage: 10.0, cumulativePercentage: 92.4 },
    { defectType: 'Material Defect', count: 45, percentage: 5.1, cumulativePercentage: 97.5 },
    { defectType: 'Others', count: 22, percentage: 2.5, cumulativePercentage: 100.0 }
  ];

  // Mock Downtime Reasons (Pie Chart)
  const downtimeData: DowntimeData[] = [
    { reason: 'Machine Breakdown', hours: 45.5, percentage: 35.2, color: 'bg-red-500' },
    { reason: 'Setup & Changeover', hours: 32.8, percentage: 25.4, color: 'bg-orange-500' },
    { reason: 'Material Shortage', hours: 21.3, percentage: 16.5, color: 'bg-yellow-500' },
    { reason: 'Tool Change', hours: 15.6, percentage: 12.1, color: 'bg-blue-500' },
    { reason: 'Quality Hold', hours: 9.2, percentage: 7.1, color: 'bg-purple-500' },
    { reason: 'Others', hours: 4.8, percentage: 3.7, color: 'bg-gray-500' }
  ];

  // Mock Shift Performance
  const shiftPerformance: ShiftPerformance[] = [
    { shift: 'Morning (6AM-2PM)', production: 4850, target: 5000, efficiency: 97.0, oee: 82.5, downtime: 2.3 },
    { shift: 'Afternoon (2PM-10PM)', production: 4680, target: 5000, efficiency: 93.6, oee: 78.9, downtime: 3.8 },
    { shift: 'Night (10PM-6AM)', production: 4320, target: 5000, efficiency: 86.4, oee: 71.2, downtime: 5.2 }
  ];

  // Mock Operator Productivity
  const operatorProductivity: OperatorProductivity[] = [
    { operatorId: 'OP-001', operatorName: 'Rajesh Kumar', shift: 'Morning', unitsProduced: 485, target: 450, efficiency: 107.8, qualityRate: 98.5, rank: 1 },
    { operatorId: 'OP-012', operatorName: 'Priya Sharma', shift: 'Afternoon', unitsProduced: 472, target: 450, efficiency: 104.9, qualityRate: 99.2, rank: 2 },
    { operatorId: 'OP-023', operatorName: 'Amit Patel', shift: 'Morning', unitsProduced: 468, target: 450, efficiency: 104.0, qualityRate: 97.8, rank: 3 },
    { operatorId: 'OP-007', operatorName: 'Sunita Reddy', shift: 'Afternoon', unitsProduced: 461, target: 450, efficiency: 102.4, qualityRate: 98.9, rank: 4 },
    { operatorId: 'OP-034', operatorName: 'Vikram Singh', shift: 'Night', unitsProduced: 456, target: 450, efficiency: 101.3, qualityRate: 96.7, rank: 5 },
    { operatorId: 'OP-018', operatorName: 'Lakshmi Iyer', shift: 'Morning', unitsProduced: 453, target: 450, efficiency: 100.7, qualityRate: 99.5, rank: 6 },
    { operatorId: 'OP-029', operatorName: 'Mohammed Ali', shift: 'Afternoon', unitsProduced: 448, target: 450, efficiency: 99.6, qualityRate: 97.2, rank: 7 },
    { operatorId: 'OP-041', operatorName: 'Anjali Mehta', shift: 'Night', unitsProduced: 442, target: 450, efficiency: 98.2, qualityRate: 98.1, rank: 8 }
  ];

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 90) return 'bg-green-500';
    if (utilization >= 80) return 'bg-blue-500';
    if (utilization >= 70) return 'bg-yellow-500';
    if (utilization >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getUtilizationTextColor = (utilization: number): string => {
    if (utilization >= 90) return 'text-green-700';
    if (utilization >= 80) return 'text-blue-700';
    if (utilization >= 70) return 'text-yellow-700';
    if (utilization >= 60) return 'text-orange-700';
    return 'text-red-700';
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 95) return 'text-blue-600';
    if (efficiency >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankBadgeColor = (rank: number): string => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  // Handler functions
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Dashboard data refreshed successfully!');
    }, 1000);
  };

  const handleExportDashboard = () => {
    alert('Exporting complete analytics dashboard to Excel...');
  };

  const handleViewAllProducts = () => {
    router.push('/production/work-orders');
  };

  const handleViewAllOperators = () => {
    alert('Viewing all operator productivity rankings...');
  };

  const handleReportClick = (reportType: string) => {
    alert(`Opening ${reportType} report...`);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Production Analytics
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive production metrics and KPI dashboard</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExportDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
          >
            <Download className="w-4 h-4" />
            Export Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisQuarter">This Quarter</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plant</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
              >
                <option value="all">All Plants</option>
                <option value="plant1">Pune Manufacturing Unit</option>
                <option value="plant2">Bangalore Assembly Plant</option>
                <option value="plant3">Chennai Fabrication Unit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="machining">Machining</option>
                <option value="assembly">Assembly</option>
                <option value="welding">Welding</option>
                <option value="painting">Painting</option>
                <option value="quality">Quality Control</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* OEE Metrics Cards */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
            <span className={`flex items-center gap-1 text-sm ${oeeMetrics.trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
              {oeeMetrics.trend === 'up' ? '↑' : '↓'} {Math.abs(oeeMetrics.oee - oeeMetrics.previousPeriod).toFixed(1)}%
            </span>
          </div>
          <div className="text-4xl font-bold mb-1">{oeeMetrics.oee}%</div>
          <div className="text-blue-100">Overall OEE</div>
          <div className="mt-3 pt-3 border-t border-blue-400 text-sm">
            Previous: {oeeMetrics.previousPeriod}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 opacity-80" />
            <span className="text-sm text-green-200">World Class: 85%+</span>
          </div>
          <div className="text-4xl font-bold mb-1">{oeeMetrics.availability}%</div>
          <div className="text-green-100">Availability</div>
          <div className="mt-3 pt-3 border-t border-green-400 text-sm">
            Uptime vs Planned Time
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-sm text-purple-200">World Class: 95%+</span>
          </div>
          <div className="text-4xl font-bold mb-1">{oeeMetrics.performance}%</div>
          <div className="text-purple-100">Performance</div>
          <div className="mt-3 pt-3 border-t border-purple-400 text-sm">
            Actual vs Ideal Cycle Time
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-sm text-orange-200">World Class: 99%+</span>
          </div>
          <div className="text-4xl font-bold mb-1">{oeeMetrics.quality}%</div>
          <div className="text-orange-100">Quality Rate</div>
          <div className="mt-3 pt-3 border-t border-orange-400 text-sm">
            Good Parts / Total Parts
          </div>
        </div>
      </div>

      {/* Production Trend Chart */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Production Trend (12 Months)
            </h2>
            <p className="text-sm text-gray-600 mt-1">Planned vs Actual production with efficiency</p>
          </div>
          <div className="flex gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Efficiency</span>
            </div>
          </div>
        </div>

        {/* Line Chart Visualization */}
        <div className="relative h-80">
          <div className="absolute inset-0 flex items-end justify-between gap-2">
            {productionTrendData.map((data, index) => {
              const maxValue = 65000;
              const plannedHeight = (data.planned / maxValue) * 100;
              const actualHeight = (data.actual / maxValue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bars */}
                  <div className="w-full flex items-end justify-center gap-1" style={{ height: '280px' }}>
                    <div
                      className="w-4 bg-blue-500 rounded-t hover:bg-blue-600 transition-all cursor-pointer relative group"
                      style={{ height: `${plannedHeight}%` }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        Planned: {data.planned.toLocaleString()}
                      </div>
                    </div>
                    <div
                      className="w-4 bg-green-500 rounded-t hover:bg-green-600 transition-all cursor-pointer relative group"
                      style={{ height: `${actualHeight}%` }}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        Actual: {data.actual.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {/* Labels */}
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-700">{data.month}</div>
                    <div className={`text-xs font-semibold ${getEfficiencyColor(data.efficiency)}`}>
                      {data.efficiency}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product-wise Production */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Product-wise Production (Current Month)
          </h2>
          <button
            onClick={handleViewAllProducts}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Products →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product Name</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Planned</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actual</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Variance</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Efficiency</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Progress</th>
              </tr>
            </thead>
            <tbody>
              {productWiseData.map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm font-medium text-gray-900">{product.productCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900">{product.productName}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-700">{product.planned.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-medium text-gray-900">{product.actual.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-medium ${product.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.variance >= 0 ? '+' : ''}{product.variance}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-semibold ${getEfficiencyColor(product.efficiency)}`}>
                      {product.efficiency.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${product.efficiency >= 100 ? 'bg-green-500' : product.efficiency >= 95 ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min(product.efficiency, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Center Utilization Heatmap */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Work Center Utilization Heatmap
            </h2>
            <p className="text-sm text-gray-600 mt-1">Shift-wise capacity utilization across work centers</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Utilization:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>&lt;60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>60-70%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>70-80%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>80-90%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>&gt;90%</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Work Center</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Morning Shift<br/>(6AM-2PM)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Afternoon Shift<br/>(2PM-10PM)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Night Shift<br/>(10PM-6AM)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Utilization</th>
              </tr>
            </thead>
            <tbody>
              {workCenterUtilization.map((wc, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{wc.workCenter}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <div className={`w-20 h-10 ${getUtilizationColor(wc.shifts.morning)} rounded flex items-center justify-center text-white font-semibold`}>
                        {wc.shifts.morning}%
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <div className={`w-20 h-10 ${getUtilizationColor(wc.shifts.afternoon)} rounded flex items-center justify-center text-white font-semibold`}>
                        {wc.shifts.afternoon}%
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <div className={`w-20 h-10 ${getUtilizationColor(wc.shifts.night)} rounded flex items-center justify-center text-white font-semibold`}>
                        {wc.shifts.night}%
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`text-center font-bold text-lg ${getUtilizationTextColor(wc.avgUtilization)}`}>
                      {wc.avgUtilization.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Defect Analysis - Pareto Chart */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Defect Analysis (Pareto)
              </h2>
              <p className="text-sm text-gray-600 mt-1">80/20 rule - Focus on top defect types</p>
            </div>
          </div>

          <div className="space-y-2">
            {defectData.map((defect, index) => {
              const isTop80 = defect.cumulativePercentage <= 80;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isTop80 ? 'text-red-700' : 'text-gray-700'}`}>
                      {defect.defectType}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{defect.count}</span>
                      <span className="text-sm text-gray-600">({defect.percentage.toFixed(1)}%)</span>
                      <span className="text-xs text-gray-500">Σ {defect.cumulativePercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                    <div
                      className={`${isTop80 ? 'bg-red-500' : 'bg-gray-400'} flex items-center justify-end px-2`}
                      style={{ width: `${defect.percentage}%` }}
                    >
                      {defect.percentage > 10 && (
                        <span className="text-white text-xs font-semibold">{defect.percentage.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                  {isTop80 && index === defectData.findIndex(d => d.cumulativePercentage > 80) - 1 && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      ↑ Focus on these defects (80% of total issues)
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Defects:</span>
              <span className="font-semibold text-gray-900">
                {defectData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Downtime Analysis - Pie Chart */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Downtime Analysis
              </h2>
              <p className="text-sm text-gray-600 mt-1">Breakdown by reason - Current month</p>
            </div>
          </div>

          {/* Pie Chart Visualization */}
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {(() => {
                  let currentAngle = -90;
                  const colorMap: { [key: string]: string } = {
                    'bg-red-500': '#ef4444',
                    'bg-orange-500': '#f97316',
                    'bg-yellow-500': '#eab308',
                    'bg-blue-500': '#3b82f6',
                    'bg-purple-500': '#a855f7',
                    'bg-gray-500': '#6b7280'
                  };

                  return downtimeData.map((item, index) => {
                    const angle = (item.percentage / 100) * 360;
                    const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    const labelAngle = currentAngle + angle / 2;
                    const labelX = 50 + 50 * Math.cos((labelAngle * Math.PI) / 180);
                    const labelY = 50 + 50 * Math.sin((labelAngle * Math.PI) / 180);

                    currentAngle += angle;

                    return (
                      <g key={index}>
                        <path d={path} fill={colorMap[item.color]} className="hover:opacity-80 cursor-pointer" />
                        {item.percentage > 8 && (
                          <text x={labelX} y={labelY} textAnchor="middle" fill="white" fontSize="4" fontWeight="bold">
                            {item.percentage.toFixed(0)}%
                          </text>
                        )}
                      </g>
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="20" fill="white" />
                <text x="50" y="48" textAnchor="middle" fontSize="6" fill="#374151" fontWeight="bold">
                  Total
                </text>
                <text x="50" y="54" textAnchor="middle" fontSize="5" fill="#374151" fontWeight="bold">
                  {downtimeData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
                </text>
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            {downtimeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${item.color} rounded`}></div>
                  <span className="text-sm text-gray-700">{item.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.hours}h</span>
                  <span className="text-sm text-gray-600">({item.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Performance Comparison */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Shift Performance Comparison
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Shift</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Production</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Target</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Efficiency</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">OEE</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Downtime (hrs)</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {shiftPerformance.map((shift, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{shift.shift}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">{shift.production.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-700">{shift.target.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-semibold ${getEfficiencyColor(shift.efficiency)}`}>
                      {shift.efficiency.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-blue-700">{shift.oee.toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-red-600 font-medium">{shift.downtime.toFixed(1)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${shift.efficiency >= 95 ? 'bg-green-500' : shift.efficiency >= 90 ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${shift.efficiency}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Best Performing Shift</div>
            <div className="text-lg font-bold text-green-900">Morning (6AM-2PM)</div>
            <div className="text-sm text-green-600">97.0% Efficiency</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Total Production (All Shifts)</div>
            <div className="text-lg font-bold text-blue-900">
              {shiftPerformance.reduce((sum, s) => sum + s.production, 0).toLocaleString()} units
            </div>
            <div className="text-sm text-blue-600">vs Target: 15,000 units</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-700 mb-1">Total Downtime (All Shifts)</div>
            <div className="text-lg font-bold text-red-900">
              {shiftPerformance.reduce((sum, s) => sum + s.downtime, 0).toFixed(1)} hours
            </div>
            <div className="text-sm text-red-600">Across 24 hour operation</div>
          </div>
        </div>
      </div>

      {/* Operator Productivity Rankings */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Top Operator Productivity
            </h2>
            <p className="text-sm text-gray-600 mt-1">Top 8 performers based on efficiency and quality</p>
          </div>
          <button
            onClick={handleViewAllOperators}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Operators →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Operator ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Shift</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Produced</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Target</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Efficiency</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quality Rate</th>
              </tr>
            </thead>
            <tbody>
              {operatorProductivity.map((operator, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex justify-center">
                      <div className={`w-8 h-8 ${getRankBadgeColor(operator.rank)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                        {operator.rank}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-700">{operator.operatorId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{operator.operatorName}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {operator.shift}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">{operator.unitsProduced}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm text-gray-700">{operator.target}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-sm font-semibold ${getEfficiencyColor(operator.efficiency)}`}>
                      {operator.efficiency.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-semibold text-green-600">{operator.qualityRate.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            Production Reports
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleReportClick('Daily Production Report')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-blue-700">Daily Production Report</div>
            <div className="text-sm text-gray-600 mt-1">Shift-wise production summary</div>
          </button>

          <button
            onClick={() => handleReportClick('Work Order Status')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-green-700">Work Order Status</div>
            <div className="text-sm text-gray-600 mt-1">Current WO progress tracking</div>
          </button>

          <button
            onClick={() => handleReportClick('Material Consumption')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
          >
            <Package className="w-8 h-8 text-purple-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-purple-700">Material Consumption</div>
            <div className="text-sm text-gray-600 mt-1">Raw material usage analysis</div>
          </button>

          <button
            onClick={() => handleReportClick('Quality Report')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
          >
            <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-orange-700">Quality Report</div>
            <div className="text-sm text-gray-600 mt-1">Defects and rejections</div>
          </button>

          <button
            onClick={() => handleReportClick('Efficiency Report')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
          >
            <Activity className="w-8 h-8 text-blue-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-blue-700">Efficiency Report</div>
            <div className="text-sm text-gray-600 mt-1">OEE and productivity metrics</div>
          </button>

          <button
            onClick={() => handleReportClick('Downtime Analysis')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left group"
          >
            <Clock className="w-8 h-8 text-red-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-red-700">Downtime Analysis</div>
            <div className="text-sm text-gray-600 mt-1">Machine downtime breakdown</div>
          </button>

          <button
            onClick={() => handleReportClick('Cost Variance Report')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
          >
            <Target className="w-8 h-8 text-green-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-green-700">Cost Variance Report</div>
            <div className="text-sm text-gray-600 mt-1">Standard vs actual costing</div>
          </button>

          <button
            onClick={() => handleReportClick('Labor Productivity')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
          >
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <div className="font-semibold text-gray-900 group-hover:text-purple-700">Labor Productivity</div>
            <div className="text-sm text-gray-600 mt-1">Operator efficiency rankings</div>
          </button>
        </div>
      </div>
    </div>
  );
}
