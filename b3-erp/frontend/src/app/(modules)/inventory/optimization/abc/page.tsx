'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, BarChart3, Download, RefreshCw, TrendingUp, Package, DollarSign, Percent } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface ABCItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  annualUsageQty: number;
  unitCost: number;
  annualUsageValue: number;
  percentOfTotal: number;
  cumulativePercent: number;
  abcClass: 'A' | 'B' | 'C';
  uom: string;
  turnoverRate: number;
  currentStock: number;
  recommendedPolicy: string;
}

export default function ABCAnalysisPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Per-class summary from GET /inventory/stock-balances/abc-analysis.
  // The endpoint returns aggregate buckets (count/value/percentage) rather than
  // per-item rows, so the summary cards/chart are driven from this while the
  // item table is populated only when item-level rows are available.
  const [abcItems, setAbcItems] = useState<ABCItem[]>([]);
  const [classSummary, setClassSummary] = useState<Record<'A' | 'B' | 'C', { count: number; value: number; percent: number }>>({
    A: { count: 0, value: 0, percent: 0 },
    B: { count: 0, value: 0, percent: 0 },
    C: { count: 0, value: 0, percent: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = (await inventoryService.getABCAnalysis()) as any;
        const summary = {
          A: { count: Number(res?.aClass?.count ?? 0), value: Number(res?.aClass?.value ?? 0), percent: Number(res?.aClass?.percentage ?? 0) },
          B: { count: Number(res?.bClass?.count ?? 0), value: Number(res?.bClass?.value ?? 0), percent: Number(res?.bClass?.percentage ?? 0) },
          C: { count: Number(res?.cClass?.count ?? 0), value: Number(res?.cClass?.value ?? 0), percent: Number(res?.cClass?.percentage ?? 0) },
        };
        // If the endpoint provides item rows, map them; otherwise keep table empty.
        const rawItems: any[] = Array.isArray(res?.items) ? res.items : [];
        const mapped: ABCItem[] = rawItems.map((it: any, i: number) => ({
          id: String(it.id ?? it.itemId ?? i),
          itemCode: it.itemCode ?? '',
          itemName: it.itemName ?? '',
          category: it.category ?? it.itemCategory ?? '',
          annualUsageQty: Number(it.annualUsageQty ?? it.usageQuantity ?? 0),
          unitCost: Number(it.unitCost ?? 0),
          annualUsageValue: Number(it.annualUsageValue ?? it.usageValue ?? 0),
          percentOfTotal: Number(it.percentOfTotal ?? 0),
          cumulativePercent: Number(it.cumulativePercent ?? 0),
          abcClass: (it.abcClass ?? it.class ?? 'C') as 'A' | 'B' | 'C',
          uom: it.uom ?? '',
          turnoverRate: Number(it.turnoverRate ?? 0),
          currentStock: Number(it.currentStock ?? 0),
          recommendedPolicy: it.recommendedPolicy ?? '',
        }));
        if (!cancelled) {
          setClassSummary(summary);
          setAbcItems(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load ABC analysis');
          setAbcItems([]);
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

  const filteredItems = abcItems.filter(item => {
    const matchesSearch = item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'all' || item.abcClass === filterClass;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesClass && matchesCategory;
  });

  const getClassColor = (abcClass: string) => {
    switch (abcClass) {
      case 'A': return 'bg-red-100 text-red-700 border-red-200';
      case 'B': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'C': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTotalValue = () => {
    return abcItems.reduce((sum, item) => sum + item.annualUsageValue, 0);
  };

  const getClassStats = (abcClass: 'A' | 'B' | 'C') => {
    const items = abcItems.filter(item => item.abcClass === abcClass);
    const totalValue = items.reduce((sum, item) => sum + item.annualUsageValue, 0);
    const percentOfTotal = (totalValue / getTotalValue()) * 100;
    return {
      count: items.length,
      value: totalValue,
      percent: percentOfTotal
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ABC Analysis</h1>
            <p className="text-sm text-gray-500 mt-1">Classify inventory by value to prioritize management efforts</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Recalculate</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-red-600">Class A Items</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{getClassStats('A').count}</p>
            </div>
            <BarChart3 className="w-6 h-6 text-red-700" />
          </div>
          <div className="text-xs text-red-700">
            <p className="font-semibold">${(getClassStats('A').value / 1000).toFixed(1)}K value</p>
            <p>{getClassStats('A').percent.toFixed(1)}% of total " High control</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-yellow-600">Class B Items</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{getClassStats('B').count}</p>
            </div>
            <Package className="w-6 h-6 text-yellow-700" />
          </div>
          <div className="text-xs text-yellow-700">
            <p className="font-semibold">${(getClassStats('B').value / 1000).toFixed(1)}K value</p>
            <p>{getClassStats('B').percent.toFixed(1)}% of total " Moderate control</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-green-600">Class C Items</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{getClassStats('C').count}</p>
            </div>
            <TrendingUp className="w-6 h-6 text-green-700" />
          </div>
          <div className="text-xs text-green-700">
            <p className="font-semibold">${(getClassStats('C').value / 1000).toFixed(1)}K value</p>
            <p>{getClassStats('C').percent.toFixed(1)}% of total " Simple control</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Value</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">${(getTotalValue() / 1000).toFixed(0)}K</p>
            </div>
            <DollarSign className="w-6 h-6 text-blue-700" />
          </div>
          <div className="text-xs text-blue-700">
            <p>Annual usage value</p>
            <p>{abcItems.length} total items analyzed</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">ABC Distribution Chart</h3>
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">Class A (High Value)</span>
              <span className="text-sm font-bold text-red-900">{getClassStats('A').percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-red-100 rounded-full h-6">
              <div
                className="bg-red-600 h-6 rounded-full flex items-center justify-end pr-3"
                style={{ width: `${getClassStats('A').percent}%` }}
              >
                <span className="text-xs font-bold text-white">${(getClassStats('A').value / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-yellow-700">Class B (Medium Value)</span>
              <span className="text-sm font-bold text-yellow-900">{getClassStats('B').percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-yellow-100 rounded-full h-6">
              <div
                className="bg-yellow-600 h-6 rounded-full flex items-center justify-end pr-3"
                style={{ width: `${getClassStats('B').percent}%` }}
              >
                <span className="text-xs font-bold text-white">${(getClassStats('B').value / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">Class C (Low Value)</span>
              <span className="text-sm font-bold text-green-900">{getClassStats('C').percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-6">
              <div
                className="bg-green-600 h-6 rounded-full flex items-center justify-end pr-3"
                style={{ width: `${getClassStats('C').percent}%` }}
              >
                <span className="text-xs font-bold text-white">${(getClassStats('C').value / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by item code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Classes</option>
            <option value="A">Class A</option>
            <option value="B">Class B</option>
            <option value="C">Class C</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Raw Material">Raw Material</option>
            <option value="Component">Component</option>
            <option value="Consumable">Consumable</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">% of Total</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cumulative %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Turnover</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{item.itemCode}</div>
                    <div className="text-xs text-gray-500">{item.itemName}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.category}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {item.annualUsageQty.toLocaleString()} {item.uom}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-gray-900">${item.unitCost}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-blue-600">
                      ${item.annualUsageValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-bold text-gray-900">{item.percentOfTotal.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-semibold text-purple-600">{item.cumulativePercent.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-semibold text-green-600">{item.turnoverRate.toFixed(1)}x</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getClassColor(item.abcClass)}`}>
                      {item.abcClass}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{item.recommendedPolicy}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found matching your criteria</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">ABC Classification Guidelines:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-blue-700">
          <div className="bg-white p-3 rounded border border-red-200">
            <h4 className="font-bold text-red-700 mb-2">Class A (Top 20%)</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>~70-80% of annual value</li>
              <li>Daily monitoring required</li>
              <li>Tight inventory control</li>
              <li>Accurate demand forecasting</li>
              <li>Frequent review cycles</li>
              <li>JIT or low safety stock</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <h4 className="font-bold text-yellow-700 mb-2">Class B (Next 30%)</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>~15-25% of annual value</li>
              <li>Weekly monitoring</li>
              <li>Moderate control levels</li>
              <li>Standard forecasting</li>
              <li>Periodic reviews</li>
              <li>Moderate safety stock</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-green-200">
            <h4 className="font-bold text-green-700 mb-2">Class C (Bottom 50%)</h4>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>~5% of annual value</li>
              <li>Monthly or quarterly review</li>
              <li>Simple control methods</li>
              <li>Basic forecasting</li>
              <li>Bulk ordering acceptable</li>
              <li>Higher safety stock OK</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
