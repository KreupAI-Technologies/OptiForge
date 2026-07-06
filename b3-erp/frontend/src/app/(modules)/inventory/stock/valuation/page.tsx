'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  DollarSign,
  TrendingUp,
  Package,
  BarChart3,
  PieChart,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  ValuationReportModal,
  ValuationReportData
} from '@/components/inventory/InventoryAnalyticsModals';

interface CategoryValuation {
  category: string;
  items: number;
  quantity: number;
  fifoValue: number;
  lifoValue: number;
  wavgValue: number;
  percentOfTotal: number;
}

interface ValuationHistory {
  date: string;
  fifo: number;
  lifo: number;
  wavg: number;
}

export default function StockValuationPage() {
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'LIFO' | 'WAVG'>('FIFO');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Modal state
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [valuationResult, setValuationResult] = useState<ValuationReportData | null>(null);

  const [categoryData, setCategoryData] = useState<CategoryValuation[]>([]);
  const [valuationHistory, setValuationHistory] = useState<ValuationHistory[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await inventoryService.getValuationReport();
        const total = res?.totalValue ?? 0;
        if (Array.isArray(res?.byCategory)) {
          setCategoryData(res.byCategory.map((cat: any) => {
            const value = cat.value ?? cat.totalValue ?? 0;
            return {
              category: cat.category ?? cat.name ?? '',
              items: cat.items ?? cat.itemCount ?? 0,
              quantity: cat.quantity ?? cat.totalQuantity ?? 0,
              fifoValue: cat.fifoValue ?? value,
              lifoValue: cat.lifoValue ?? value,
              wavgValue: cat.wavgValue ?? value,
              percentOfTotal: cat.percentage ?? cat.percentOfTotal ?? (total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0)
            };
          }));
        }
      } catch { /* keep empty */ }
    })();
  }, []);

  const getCurrentValue = (category: CategoryValuation) => {
    switch (valuationMethod) {
      case 'FIFO':
        return category.fifoValue;
      case 'LIFO':
        return category.lifoValue;
      case 'WAVG':
        return category.wavgValue;
      default:
        return category.fifoValue;
    }
  };

  const totalValuation = categoryData.reduce((sum, cat) => sum + getCurrentValue(cat), 0);
  const totalItems = categoryData.reduce((sum, cat) => sum + cat.items, 0);
  const totalQuantity = categoryData.reduce((sum, cat) => sum + cat.quantity, 0);

  const varianceFromFIFO = ((totalValuation - categoryData.reduce((sum, cat) => sum + cat.fifoValue, 0)) / totalValuation * 100).toFixed(2);

  // Handler function
  const handleValuationGenerate = async (config: any) => {
    try {
      const res = await inventoryService.getValuationReport(config?.warehouse, config?.reportDate);
      const total = res?.totalValue ?? totalValuation;
      const byCategory = Array.isArray(res?.byCategory)
        ? res.byCategory.map((cat: any) => {
            const value = cat.value ?? cat.totalValue ?? 0;
            return {
              category: cat.category ?? cat.name ?? '',
              value,
              percentage: cat.percentage ?? cat.percentOfTotal ?? (total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0)
            };
          })
        : categoryData.map(cat => ({
            category: cat.category,
            value: getCurrentValue(cat),
            percentage: cat.percentOfTotal
          }));
      setValuationResult({
        reportDate: config?.reportDate,
        warehouse: config?.warehouse,
        valuationMethod: config?.valuationMethod,
        items: [],
        summary: {
          totalItems: res?.itemCount ?? totalItems,
          totalQuantity: totalQuantity,
          totalValue: total,
          byCategory
        }
      });
    } catch {
      /* keep existing result */
    }
    setIsValuationModalOpen(false);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span>Stock Valuation</span>
          </h1>
          <p className="text-gray-600 mt-1">Inventory valuation using different costing methods</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsValuationModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Valuation Method Selector */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Valuation Method</h3>
            <p className="text-sm text-gray-600 mt-1">Select the inventory costing method to apply</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setValuationMethod('FIFO')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                valuationMethod === 'FIFO'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              FIFO
            </button>
            <button
              onClick={() => setValuationMethod('LIFO')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                valuationMethod === 'LIFO'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              LIFO
            </button>
            <button
              onClick={() => setValuationMethod('WAVG')}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                valuationMethod === 'WAVG'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Weighted Average
            </button>
          </div>
        </div>

        {/* Method Description */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              {valuationMethod === 'FIFO' && (
                <>
                  <h4 className="font-semibold text-blue-900">First In, First Out (FIFO)</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Assumes oldest inventory is sold first. Generally results in lower COGS during inflationary periods.
                  </p>
                </>
              )}
              {valuationMethod === 'LIFO' && (
                <>
                  <h4 className="font-semibold text-blue-900">Last In, First Out (LIFO)</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Assumes newest inventory is sold first. Results in higher COGS during inflationary periods.
                  </p>
                </>
              )}
              {valuationMethod === 'WAVG' && (
                <>
                  <h4 className="font-semibold text-blue-900">Weighted Average Cost</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Calculates average cost of all units available for sale. Smooths out price fluctuations.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">₹{(totalValuation / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Inventory Value</div>
          <div className="text-xs text-green-600 mt-1">Using {valuationMethod} Method</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalItems}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Items</div>
          <div className="text-xs text-blue-600 mt-1">{totalQuantity.toLocaleString()} Units</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{varianceFromFIFO}%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Variance from FIFO</div>
          <div className="text-xs text-purple-600 mt-1">Method Comparison</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">₹{(totalValuation / totalQuantity).toFixed(0)}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Avg. Unit Value</div>
          <div className="text-xs text-orange-600 mt-1">Across All Stock</div>
        </div>
      </div>

      {/* Category-wise Valuation Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Category-wise Valuation</h3>
          <p className="text-sm text-gray-600 mt-1">Inventory value breakdown by category</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FIFO Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LIFO Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WAVG Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{category.category}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{category.items}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{category.quantity.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{category.fifoValue.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{category.lifoValue.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{category.wavgValue.toLocaleString()}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                      ₹{getCurrentValue(category).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${category.percentOfTotal}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{category.percentOfTotal}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">TOTAL</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{totalItems}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{totalQuantity.toLocaleString()}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  ₹{categoryData.reduce((sum, cat) => sum + cat.fifoValue, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  ₹{categoryData.reduce((sum, cat) => sum + cat.lifoValue, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  ₹{categoryData.reduce((sum, cat) => sum + cat.wavgValue, 0).toLocaleString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-green-600">
                  ₹{totalValuation.toLocaleString()}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Valuation Trend */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Valuation Trend</h3>
            <p className="text-sm text-gray-600 mt-1">Historical inventory valuation comparison</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current">Current Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">FIFO</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">LIFO</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Weighted Avg</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Change</th>
              </tr>
            </thead>
            <tbody>
              {valuationHistory.map((record, index) => {
                const prevRecord = index > 0 ? valuationHistory[index - 1] : null;
                const change = prevRecord
                  ? ((record.fifo - prevRecord.fifo) / prevRecord.fifo * 100).toFixed(2)
                  : '0.00';
                const isPositive = parseFloat(change) >= 0;

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{record.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{record.fifo.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{record.lifo.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">₹{record.wavg.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                        <span>{Math.abs(parseFloat(change))}%</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Method Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">FIFO Total</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">First In First Out</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{categoryData.reduce((sum, cat) => sum + cat.fifoValue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">Highest valuation method</div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">LIFO Total</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Last In First Out</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{categoryData.reduce((sum, cat) => sum + cat.lifoValue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">Lowest valuation method</div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">WAVG Total</h4>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Weighted Average</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₹{categoryData.reduce((sum, cat) => sum + cat.wavgValue, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">Middle valuation method</div>
        </div>
      </div>

      {/* Valuation Modal */}
      <ValuationReportModal
        isOpen={isValuationModalOpen}
        onClose={() => setIsValuationModalOpen(false)}
        onGenerate={handleValuationGenerate}
      />
    </div>
  );
}
