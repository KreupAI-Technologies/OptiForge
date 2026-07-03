'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, TrendingUp, TrendingDown, Calendar, Package, Filter, BarChart3, Eye, Edit } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { NewForecastModal, ExportForecastModal, ForecastAnalyticsModal } from '@/components/production/DemandPlanningModals';

interface DemandForecast {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  currentMonth?: string;
  currentDemand: number;
  forecastedDemand: number;
  historicalAvg: number;
  historicalDemand?: number[];
  actualDemand?: number[];
  accuracy: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  forecastMethod: string;
  seasonalityFactor: number;
  safetyStock: number;
  reorderPoint: number;
  averageLeadTime?: number;
  uom?: string;
}

interface MonthlyDemand {
  month: string;
  historical: number;
  forecasted: number;
  actual: number;
}

export default function DemandPlanningPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTrend, setFilterTrend] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<DemandForecast | null>(null);

  // Mock data for demand forecasts
  const [forecasts, setForecasts] = useState<DemandForecast[]>([
    {
      id: '1',
      productCode: 'KIT-SINK-001',
      productName: 'Premium Stainless Steel Kitchen Sink - Double Bowl',
      category: 'Kitchen Sinks',
      currentMonth: '2025-10',
      currentDemand: 178,
      forecastedDemand: 180,
      historicalAvg: 155,
      historicalDemand: [145, 152, 138, 165, 158, 172],
      actualDemand: [178, 0, 0, 0, 0, 0],
      accuracy: 94.8,
      trend: 'up',
      lastUpdated: '2024-10-18',
      forecastMethod: 'exponential-smoothing',
      seasonalityFactor: 1.15,
      safetyStock: 45,
      reorderPoint: 120,
      averageLeadTime: 14,
      uom: 'units'
    },
    {
      id: '2',
      productCode: 'KIT-FAUCET-002',
      productName: 'Chrome Kitchen Faucet with Pull-Down Sprayer',
      category: 'Kitchen Faucets',
      currentMonth: '2025-10',
      currentDemand: 315,
      forecastedDemand: 320,
      historicalAvg: 295,
      historicalDemand: [285, 298, 275, 310, 295, 305],
      actualDemand: [315, 0, 0, 0, 0, 0],
      accuracy: 96.2,
      trend: 'up',
      lastUpdated: '2024-10-18',
      forecastMethod: 'moving-average',
      seasonalityFactor: 1.08,
      safetyStock: 80,
      reorderPoint: 220,
      averageLeadTime: 10,
      uom: 'units'
    },
    {
      id: '3',
      productCode: 'KIT-COOKWARE-003',
      productName: 'Non-Stick Cookware Set (7 Pieces)',
      category: 'Cookware',
      currentMonth: '2025-10',
      currentDemand: 402,
      forecastedDemand: 400,
      historicalAvg: 415,
      historicalDemand: [420, 435, 398, 425, 410, 405],
      actualDemand: [402, 0, 0, 0, 0, 0],
      accuracy: 97.5,
      trend: 'down',
      lastUpdated: '2024-10-18',
      forecastMethod: 'linear-regression',
      seasonalityFactor: 0.95,
      safetyStock: 120,
      reorderPoint: 280,
      averageLeadTime: 18,
      uom: 'sets'
    },
    {
      id: '4',
      productCode: 'KIT-CABINET-004',
      productName: 'Modular Kitchen Cabinet - Base Unit (36")',
      category: 'Kitchen Cabinets',
      currentMonth: '2025-10',
      currentDemand: 194,
      forecastedDemand: 195,
      historicalAvg: 191,
      historicalDemand: [185, 192, 188, 195, 190, 193],
      actualDemand: [194, 0, 0, 0, 0, 0],
      accuracy: 98.9,
      trend: 'stable',
      lastUpdated: '2024-10-18',
      forecastMethod: 'moving-average',
      seasonalityFactor: 1.0,
      safetyStock: 50,
      reorderPoint: 135,
      averageLeadTime: 21,
      uom: 'units'
    },
    {
      id: '5',
      productCode: 'KIT-COUNTERTOP-005',
      productName: 'Granite Countertop - Black Galaxy (Linear Ft)',
      category: 'Countertops',
      currentMonth: '2025-10',
      currentDemand: 575,
      forecastedDemand: 580,
      historicalAvg: 540,
      historicalDemand: [520, 548, 512, 565, 538, 555],
      actualDemand: [575, 0, 0, 0, 0, 0],
      accuracy: 95.6,
      trend: 'up',
      lastUpdated: '2024-10-18',
      forecastMethod: 'exponential-smoothing',
      seasonalityFactor: 1.12,
      safetyStock: 150,
      reorderPoint: 400,
      averageLeadTime: 12,
      uom: 'linear ft'
    },
    {
      id: '6',
      productCode: 'KIT-APPLIANCE-006',
      productName: 'Built-in Kitchen Chimney (60cm)',
      category: 'Kitchen Appliances',
      currentMonth: '2025-10',
      currentDemand: 142,
      forecastedDemand: 145,
      historicalAvg: 130,
      historicalDemand: [125, 132, 118, 128, 135, 140],
      actualDemand: [142, 0, 0, 0, 0, 0],
      accuracy: 93.1,
      trend: 'up',
      lastUpdated: '2024-10-18',
      forecastMethod: 'seasonal-decomposition',
      seasonalityFactor: 1.18,
      safetyStock: 35,
      reorderPoint: 95,
      averageLeadTime: 16,
      uom: 'units'
    },
    {
      id: '7',
      productCode: 'KIT-MIXER-007',
      productName: 'Electric Mixer Grinder - 750W',
      category: 'Kitchen Appliances',
      currentMonth: '2025-10',
      currentDemand: 688,
      forecastedDemand: 690,
      historicalAvg: 687,
      historicalDemand: [680, 695, 665, 705, 690, 685],
      actualDemand: [688, 0, 0, 0, 0, 0],
      accuracy: 98.2,
      trend: 'stable',
      lastUpdated: '2024-10-18',
      forecastMethod: 'moving-average',
      seasonalityFactor: 1.02,
      safetyStock: 180,
      reorderPoint: 475,
      averageLeadTime: 8,
      uom: 'units'
    },
    {
      id: '8',
      productCode: 'KIT-STORAGE-008',
      productName: 'Kitchen Storage Container Set (15 Pieces)',
      category: 'Kitchen Accessories',
      currentMonth: '2025-10',
      currentDemand: 705,
      forecastedDemand: 700,
      historicalAvg: 786,
      historicalDemand: [850, 820, 795, 775, 750, 725],
      actualDemand: [705, 0, 0, 0, 0, 0],
      accuracy: 96.8,
      trend: 'down',
      lastUpdated: '2024-10-18',
      forecastMethod: 'linear-regression',
      seasonalityFactor: 0.88,
      safetyStock: 200,
      reorderPoint: 480,
      averageLeadTime: 7,
      uom: 'sets'
    },
    {
      id: '9',
      productCode: 'KIT-HOOD-009',
      productName: 'Range Hood with LED Lighting',
      category: 'Kitchen Appliances',
      currentMonth: '2025-10',
      currentDemand: 118,
      forecastedDemand: 115,
      historicalAvg: 103,
      historicalDemand: [95, 102, 88, 98, 105, 110],
      actualDemand: [118, 0, 0, 0, 0, 0],
      accuracy: 91.5,
      trend: 'up',
      lastUpdated: '2024-10-18',
      forecastMethod: 'arima',
      seasonalityFactor: 1.22,
      safetyStock: 28,
      reorderPoint: 78,
      averageLeadTime: 15,
      uom: 'units'
    },
    {
      id: '10',
      productCode: 'KIT-SINK-010',
      productName: 'Undermount Kitchen Sink - Single Bowl',
      category: 'Kitchen Sinks',
      currentMonth: '2025-10',
      currentDemand: 221,
      forecastedDemand: 220,
      historicalAvg: 218,
      historicalDemand: [215, 225, 210, 220, 218, 222],
      actualDemand: [221, 0, 0, 0, 0, 0],
      accuracy: 99.1,
      trend: 'stable',
      lastUpdated: '2024-10-18',
      forecastMethod: 'moving-average',
      seasonalityFactor: 1.0,
      safetyStock: 60,
      reorderPoint: 155,
      averageLeadTime: 13,
      uom: 'units'
    }
  ]);

  // Handler functions
  const handleCreateForecast = (forecastData: Partial<DemandForecast>) => {
    const newForecast: DemandForecast = {
      id: `DF-${String(forecasts.length + 1).padStart(3, '0')}`,
      productCode: forecastData.productCode || '',
      productName: forecastData.productName || '',
      category: forecastData.category || '',
      currentDemand: forecastData.currentDemand || 0,
      forecastedDemand: forecastData.forecastedDemand || 0,
      historicalAvg: forecastData.historicalAvg || 0,
      accuracy: 0,
      trend: forecastData.trend || 'stable',
      lastUpdated: new Date().toISOString().split('T')[0],
      forecastMethod: forecastData.forecastMethod || 'moving-average',
      seasonalityFactor: forecastData.seasonalityFactor || 1.0,
      safetyStock: forecastData.safetyStock || 0,
      reorderPoint: forecastData.reorderPoint || 0,
    };
    setForecasts([...forecasts, newForecast]);
  };

  const handleEditForecast = (forecastData: Partial<DemandForecast>) => {
    if (!selectedForecast) return;
    setForecasts(forecasts.map((f) =>
      f.id === selectedForecast.id ? { ...f, ...forecastData, lastUpdated: new Date().toISOString().split('T')[0] } : f
    ));
  };

  const handleViewAnalytics = (forecast: DemandForecast) => {
    setSelectedForecast(forecast);
    setIsAnalyticsModalOpen(true);
  };

  const handleExport = (format: string, filters: any) => {
    exportToCsv('demand-forecasts', filteredForecasts as unknown as Record<string, unknown>[]);
  };

  const filteredForecasts = forecasts.filter(forecast => {
    const categoryMatch = filterCategory === 'all' || forecast.category === filterCategory;
    const trendMatch = filterTrend === 'all' || forecast.trend === filterTrend;
    return categoryMatch && trendMatch;
  });

  const totalProducts = forecasts.length;
  const avgForecastAccuracy = forecasts.reduce((sum, f) => sum + f.accuracy, 0) / forecasts.length;
  const increasingTrends = forecasts.filter(f => f.trend === 'up').length;
  const decreasingTrends = forecasts.filter(f => f.trend === 'down').length;

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-700 bg-green-100';
      case 'down': return 'text-red-700 bg-red-100';
      case 'stable': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-700';
    if (accuracy >= 90) return 'text-yellow-700';
    return 'text-red-700';
  };

  const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026'];

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
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
            <h1 className="text-2xl font-bold text-gray-900">Demand Planning</h1>
            <p className="text-sm text-gray-500 mt-1">Forecast and analyze product demand trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Forecast</span>
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Products</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg Forecast Accuracy</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{avgForecastAccuracy.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Increasing Trends</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{increasingTrends}</p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Decreasing Trends</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{decreasingTrends}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Kitchen Sinks">Kitchen Sinks</option>
            <option value="Kitchen Faucets">Kitchen Faucets</option>
            <option value="Cookware">Cookware</option>
            <option value="Kitchen Cabinets">Kitchen Cabinets</option>
            <option value="Countertops">Countertops</option>
            <option value="Kitchen Appliances">Kitchen Appliances</option>
            <option value="Kitchen Accessories">Kitchen Accessories</option>
          </select>
          <select
            value={filterTrend}
            onChange={(e) => setFilterTrend(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Trends</option>
            <option value="up">Increasing</option>
            <option value="stable">Stable</option>
            <option value="down">Decreasing</option>
          </select>
        </div>
      </div>

      {/* Demand Forecasts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Forecasted</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Seasonality</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Safety Stock</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForecasts.map((forecast) => (
                <tr key={forecast.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{forecast.productCode}</div>
                      <div className="text-sm text-gray-500">{forecast.productName}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{forecast.category}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-blue-600">{forecast.forecastedDemand.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{forecast.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm font-medium text-gray-900">{forecast.currentDemand.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{forecast.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`text-sm font-bold ${getAccuracyColor(forecast.accuracy)}`}>
                      {forecast.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getTrendColor(forecast.trend)}`}>
                      {getTrendIcon(forecast.trend)}
                      {forecast.trend}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-700">{forecast.seasonalityFactor.toFixed(2)}x</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <span className="text-sm text-gray-700">{forecast.safetyStock.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-1">{forecast.uom}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAnalytics(forecast);
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        aria-label="View Analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForecast(forecast);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(forecast.id);
                        }}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed View Modal (if product selected) */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-xl p-3  w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const product = forecasts.find(f => f.id === selectedProduct);
              if (!product) return null;

              return (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{product.productCode}</h3>
                      <p className="text-gray-600">{product.productName}</p>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Forecast Accuracy</p>
                      <p className="text-2xl font-bold text-blue-900">{product.accuracy.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Trend</p>
                      <p className="text-lg font-bold text-green-900 capitalize">{product.trend}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600">Lead Time</p>
                      <p className="text-2xl font-bold text-purple-900">{product.averageLeadTime || 'N/A'} {product.averageLeadTime ? 'days' : ''}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600">Seasonality</p>
                      <p className="text-2xl font-bold text-orange-900">{product.seasonalityFactor.toFixed(2)}x</p>
                    </div>
                  </div>

                  {product.historicalDemand && product.actualDemand && (
                    <>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">6-Month Forecast</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Historical</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Forecasted</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {months.map((month, idx) => {
                              const variance = product.actualDemand && product.actualDemand[idx] > 0
                                ? ((product.actualDemand[idx] - product.forecastedDemand) / product.forecastedDemand * 100).toFixed(1)
                                : '-';
                              return (
                                <tr key={idx}>
                                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{month}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700 text-right">{product.historicalDemand?.[idx]?.toLocaleString() || '-'}</td>
                                  <td className="px-4 py-2 text-sm font-medium text-blue-600 text-right">{product.forecastedDemand.toLocaleString()}</td>
                                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                                    {product.actualDemand && product.actualDemand[idx] > 0 ? product.actualDemand[idx].toLocaleString() : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-right">
                                    {variance !== '-' && (
                                      <span className={Number(variance) > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {Number(variance) > 0 ? '+' : ''}{variance}%
                                      </span>
                                    )}
                                    {variance === '-' && <span className="text-gray-400">-</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modals */}
      <NewForecastModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateForecast}
      />
      <NewForecastModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedForecast(null);
        }}
        forecast={selectedForecast}
        onSave={handleEditForecast}
      />
      <ExportForecastModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
      <ForecastAnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => {
          setIsAnalyticsModalOpen(false);
          setSelectedForecast(null);
        }}
        forecast={selectedForecast}
      />
    </div>
  );
}
