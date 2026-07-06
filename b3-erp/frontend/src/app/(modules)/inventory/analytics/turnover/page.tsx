'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Calendar,
  Package,
  BarChart3,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  PieChart,
  RefreshCw
} from 'lucide-react';
import {
  TurnoverAnalysisModal,
  ABCAnalysisModal,
  TurnoverAnalysisData,
  ABCAnalysisData
} from '@/components/inventory/InventoryAnalyticsModals';
import { inventoryService } from '@/services/InventoryService';

interface ItemTurnover {
  itemCode: string;
  itemName: string;
  category: string;
  avgInventory: number;
  cogs: number;
  turnoverRatio: number;
  turnoverDays: number;
  trend: 'up' | 'down' | 'stable';
  salesValue: number;
}

export default function InventoryTurnoverPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-year');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isTurnoverModalOpen, setIsTurnoverModalOpen] = useState(false);
  const [isABCModalOpen, setIsABCModalOpen] = useState(false);
  const [turnoverResult, setTurnoverResult] = useState<TurnoverAnalysisData | null>(null);
  const [abcResult, setABCResult] = useState<ABCAnalysisData | null>(null);

  const [turnoverData, setTurnoverData] = useState<ItemTurnover[]>([]);

  // Map a raw turnover item from the API into the page's ItemTurnover shape.
  const mapTurnoverItem = (raw: any): ItemTurnover => {
    const ratio = Number(raw?.turnoverRatio) || 0;
    return {
      itemCode: raw?.itemCode ?? '',
      itemName: raw?.itemName ?? '',
      category: raw?.category ?? '',
      avgInventory: Number(raw?.value) || 0,
      cogs: Number(raw?.cogs) || 0,
      turnoverRatio: ratio,
      turnoverDays: Number(raw?.daysInStock) || (ratio > 0 ? Math.round(365 / ratio) : 0),
      trend: (raw?.trend as ItemTurnover['trend']) ?? 'stable',
      salesValue: Number(raw?.salesValue) || 0
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await inventoryService.getTurnover();
        const items: any[] = Array.isArray(res?.items) ? res.items : [];
        setTurnoverData(items.map(mapTurnoverItem));
      } catch (err) {
        console.error('Failed to load turnover analysis', err);
        setTurnoverData([]);
      }
    })();
  }, []);

  const getTurnoverColor = (ratio: number) => {
    if (ratio >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (ratio >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTurnoverLabel = (ratio: number) => {
    if (ratio >= 8) return 'Fast Moving';
    if (ratio >= 4) return 'Medium Moving';
    return 'Slow Moving';
  };

  const avgTurnoverRatio = (turnoverData.length ? turnoverData.reduce((sum, item) => sum + item.turnoverRatio, 0) / turnoverData.length : 0).toFixed(1);
  const avgTurnoverDays = turnoverData.length ? Math.round(turnoverData.reduce((sum, item) => sum + item.turnoverDays, 0) / turnoverData.length) : 0;
  const fastMovingCount = turnoverData.filter(item => item.turnoverRatio >= 8).length;
  const slowMovingCount = turnoverData.filter(item => item.turnoverRatio < 4).length;

  const filteredData = turnoverData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesCategory;
  });

  // Handler functions
  const handleTurnoverGenerate = async (config: any) => {
    try {
      const res = await inventoryService.getTurnover(config?.warehouse);
      const items: any[] = Array.isArray(res?.items) ? res.items : [];
      const mapped: ItemTurnover[] = items.map(mapTurnoverItem);
      setTurnoverData(mapped);

      const fastMoving = mapped.filter((i) => i.turnoverRatio >= 8).length;
      const slowMoving = mapped.filter((i) => i.turnoverRatio > 0 && i.turnoverRatio < 4).length;
      const nonMoving = mapped.filter((i) => i.turnoverRatio === 0).length;

      const classify = (ratio: number): TurnoverAnalysisData['items'][number]['classification'] => {
        if (ratio === 0) return 'non-moving';
        if (ratio >= 8) return 'fast-moving';
        if (ratio >= 4) return 'medium-moving';
        return 'slow-moving';
      };

      setTurnoverResult({
        period: config?.period,
        startDate: config?.startDate,
        endDate: config?.endDate,
        warehouse: config?.warehouse,
        category: config?.category,
        items: mapped.map((i) => ({
          itemCode: i.itemCode,
          itemName: i.itemName,
          category: i.category,
          avgInventory: i.avgInventory,
          costOfGoodsSold: i.cogs,
          turnoverRatio: i.turnoverRatio,
          daysInInventory: i.turnoverDays,
          classification: classify(i.turnoverRatio)
        })),
        summary: {
          avgTurnoverRatio: Number(res?.avgTurnoverRatio) || 0,
          fastMovingCount: fastMoving,
          slowMovingCount: slowMoving,
          nonMovingCount: nonMoving
        }
      });
      setIsTurnoverModalOpen(false);
    } catch (err) {
      console.error('Failed to generate turnover analysis', err);
    }
  };

  const handleABCGenerate = (config: any) => {
    console.log('Generating ABC analysis with config:', config);
    // TODO: API call to generate ABC analysis
    // const response = await fetch('/api/inventory/analytics/abc', { method: 'POST', body: JSON.stringify(config) });
    // const data = await response.json();
    // setABCResult(data);

    setABCResult({
      analysisDate: config.analysisDate,
      warehouse: config.warehouse,
      criteria: config.criteria,
      items: [],
      summary: {
        aClassCount: 15,
        bClassCount: 35,
        cClassCount: 78,
        aClassValue: 5600000,
        bClassValue: 1800000,
        cClassValue: 625000
      }
    });
    setIsABCModalOpen(false);
    alert('ABC analysis generated successfully!');
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span>Inventory Turnover Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">Track inventory turnover ratios and stock rotation efficiency</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsTurnoverModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Analysis</span>
          </button>
          <button
            onClick={() => setIsABCModalOpen(true)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center space-x-2"
          >
            <PieChart className="w-4 h-4" />
            <span>ABC Analysis</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{avgTurnoverRatio}x</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Avg Turnover Ratio</div>
          <div className="text-xs text-blue-600 mt-1">Annual Average</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{avgTurnoverDays}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Avg Turnover Days</div>
          <div className="text-xs text-purple-600 mt-1">Days in Inventory</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{fastMovingCount}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Fast Moving Items</div>
          <div className="text-xs text-green-600 mt-1">Turnover ≥ 8x</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <ArrowDownRight className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{slowMovingCount}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Slow Moving Items</div>
          <div className="text-xs text-red-600 mt-1">Turnover &lt; 4x</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
            <option value="last-year">Last Year</option>
            <option value="ytd">Year to Date</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Hydraulics">Hydraulics</option>
            <option value="Electronics">Electronics</option>
            <option value="Raw Materials">Raw Materials</option>
            <option value="Components">Components</option>
            <option value="Finished Goods">Finished Goods</option>
            <option value="Spares">Spares</option>
            <option value="Consumables">Consumables</option>
            <option value="Sub-Assembly">Sub-Assembly</option>
          </select>
        </div>
      </div>

      {/* Turnover Analysis Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Item-wise Turnover Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Inventory</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COGS</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover Ratio</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnover Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">
                    <div className="font-medium text-gray-900">{item.itemCode}</div>
                    <div className="text-xs text-gray-500">{item.itemName}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {item.category}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{item.avgInventory.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{item.cogs.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Percent className="w-4 h-4 text-blue-500" />
                      <span className="text-lg font-bold text-blue-600">{item.turnoverRatio.toFixed(1)}x</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{item.turnoverDays} days</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTurnoverColor(item.turnoverRatio)}`}>
                      {getTurnoverLabel(item.turnoverRatio)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.trend === 'up' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <ArrowUpRight className="w-5 h-5" />
                        <span className="text-xs font-medium">Improving</span>
                      </div>
                    )}
                    {item.trend === 'down' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <ArrowDownRight className="w-5 h-5" />
                        <span className="text-xs font-medium">Declining</span>
                      </div>
                    )}
                    {item.trend === 'stable' && (
                      <span className="text-xs text-gray-500">Stable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Turnover Calculation Formula</span>
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Inventory Turnover Ratio</strong> = Cost of Goods Sold (COGS) ÷ Average Inventory</p>
          <p><strong>Turnover Days</strong> = 365 ÷ Inventory Turnover Ratio</p>
          <p className="mt-3 text-blue-700">
            <strong>Interpretation:</strong> Higher turnover ratio indicates faster inventory movement and better efficiency. 
            Lower turnover days mean stock is sold/used quickly, reducing holding costs.
          </p>
        </div>
      </div>

      {/* Analytics Modals */}
      <TurnoverAnalysisModal
        isOpen={isTurnoverModalOpen}
        onClose={() => setIsTurnoverModalOpen(false)}
        onGenerate={handleTurnoverGenerate}
      />
      <ABCAnalysisModal
        isOpen={isABCModalOpen}
        onClose={() => setIsABCModalOpen(false)}
        onGenerate={handleABCGenerate}
      />
    </div>
  );
}
