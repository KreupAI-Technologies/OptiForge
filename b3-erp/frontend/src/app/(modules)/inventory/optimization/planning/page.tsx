'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Calendar, Download, TrendingUp, Package, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface PlanningItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  forecastDemand: number;
  plannedReceipts: number;
  projectedStock: number;
  recommendedAction: 'order' | 'adequate' | 'reduce' | 'critical';
  orderQuantity: number;
  orderDate: string;
  expectedDate: string;
  uom: string;
  minLevel: number;
  maxLevel: number;
  leadTime: number;
}

export default function PlanningOptimizationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [planningHorizon, setPlanningHorizon] = useState(90);
  const [filterAction, setFilterAction] = useState('all');

  // Derived from GET /inventory/reorder/suggestions (reorder plan per item).
  const [planningData, setPlanningData] = useState<PlanningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await inventoryService.getReorderSuggestions()) as any[];
        const mapped: PlanningItem[] = (raw || []).map((s: any, i: number) => {
          const currentStock = Number(s.currentStock ?? 0);
          const reorderPoint = Number(s.reorderPoint ?? 0);
          const orderQuantity = Number(s.suggestedQuantity ?? s.eoqQuantity ?? 0);
          const projectedStock = currentStock - reorderPoint;
          let action: PlanningItem['recommendedAction'];
          if (projectedStock < 0) action = 'critical';
          else if (s.priority === 'high' || currentStock <= reorderPoint) action = 'order';
          else action = 'adequate';
          return {
            id: String(s.id ?? s.itemId ?? i),
            itemCode: s.itemCode ?? '',
            itemName: s.itemName ?? '',
            category: s.category ?? s.itemCategory ?? '',
            currentStock,
            forecastDemand: reorderPoint,
            plannedReceipts: 0,
            projectedStock,
            recommendedAction: action,
            orderQuantity,
            orderDate: s.orderDate ?? s.createdAt ?? '',
            expectedDate: s.expectedDeliveryDate ?? '',
            uom: s.uom ?? '',
            minLevel: reorderPoint,
            maxLevel: reorderPoint + orderQuantity,
            leadTime: Number(s.leadTimeDays ?? 0),
          };
        });
        if (!cancelled) setPlanningData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load planning data');
          setPlanningData([]);
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

  const filteredData = planningData.filter(item => {
    const matchesSearch = item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || item.recommendedAction === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'order': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'adequate': return 'bg-green-100 text-green-700 border-green-200';
      case 'reduce': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'critical': return <AlertTriangle className="w-3 h-3" />;
      case 'order': return <Package className="w-3 h-3" />;
      case 'adequate': return <CheckCircle className="w-3 h-3" />;
      case 'reduce': return <TrendingUp className="w-3 h-3 rotate-180" />;
      default: return null;
    }
  };

  const getStockHealthColor = (projected: number, min: number) => {
    if (projected < 0) return 'text-red-600';
    if (projected < min) return 'text-orange-600';
    return 'text-green-600';
  };

  const getTotalOrderValue = () => {
    return planningData
      .filter(item => item.recommendedAction === 'order' || item.recommendedAction === 'critical')
      .reduce((sum, item) => sum + (item.orderQuantity * 50), 0); // Simplified calc
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading plan…
        </div>
      )}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Planning Optimization</h1>
            <p className="text-sm text-gray-500 mt-1">Plan inventory requirements based on forecast and lead times</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Export Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {planningData.filter(i => i.recommendedAction === 'critical').length}
              </p>
              <p className="text-xs text-red-600 mt-1">Immediate action</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Order Required</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {planningData.filter(i => i.recommendedAction === 'order').length}
              </p>
              <p className="text-xs text-orange-600 mt-1">Plan orders</p>
            </div>
            <Package className="w-6 h-6 text-orange-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Adequate</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {planningData.filter(i => i.recommendedAction === 'adequate').length}
              </p>
              <p className="text-xs text-green-600 mt-1">No action needed</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Order Value</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                ${(getTotalOrderValue() / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-blue-600 mt-1">Planned purchases</p>
            </div>
            <TrendingUp className="w-6 h-6 text-blue-700" />
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
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Actions</option>
            <option value="critical">Critical</option>
            <option value="order">Order Required</option>
            <option value="adequate">Adequate</option>
            <option value="reduce">Reduce</option>
          </select>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Planning Days:</label>
            <input
              type="range"
              min="30"
              max="365"
              step="30"
              value={planningHorizon}
              onChange={(e) => setPlanningHorizon(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-bold text-blue-600 w-12">{planningHorizon}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Forecast Demand</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Planned Receipts</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Projected Stock</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Order Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order/Expected</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-900">{item.itemCode}</div>
                    <div className="text-xs text-gray-500">{item.itemName}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.category}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-gray-900">{item.currentStock} {item.uom}</div>
                    <div className="text-xs text-gray-500">Min: {item.minLevel}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-blue-600">{item.forecastDemand} {item.uom}</div>
                    <div className="text-xs text-gray-500">{planningHorizon} days</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-purple-600">
                      {item.plannedReceipts > 0 ? `${item.plannedReceipts} ${item.uom}` : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`text-sm font-bold ${getStockHealthColor(item.projectedStock, item.minLevel)}`}>
                      {item.projectedStock} {item.uom}
                    </div>
                    {item.projectedStock < 0 && (
                      <div className="text-xs text-red-600">Shortage</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {item.orderQuantity > 0 ? (
                      <div className="text-sm font-bold text-orange-600">
                        {item.orderQuantity} {item.uom}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.orderDate && (
                      <div className="text-xs text-gray-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          <span className="font-semibold">Order: {item.orderDate}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-green-500" />
                          <span>Arrive: {item.expectedDate}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(item.recommendedAction)}`}>
                      {getActionIcon(item.recommendedAction)}
                      {item.recommendedAction}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found matching your criteria</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Inventory Planning Process:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div className="bg-white p-3 rounded border border-blue-200">
            <h4 className="font-bold mb-2">Calculation:</h4>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li>Projected Stock = Current + Planned Receipts - Forecast Demand</li>
              <li>Order Qty = Max Level - Projected Stock (if negative)</li>
              <li>Order Date = Today + (Lead Time Buffer)</li>
              <li>Expected Date = Order Date + Lead Time</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <h4 className="font-bold mb-2">Actions:</h4>
            <ul className="space-y-1 text-xs list-disc list-inside">
              <li><strong>Critical:</strong> Projected &lt; 0, order immediately</li>
              <li><strong>Order:</strong> Projected &lt; Min, plan order</li>
              <li><strong>Adequate:</strong> Projected &gt; Min, no action</li>
              <li><strong>Reduce:</strong> Projected &gt; Max, excess inventory</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
