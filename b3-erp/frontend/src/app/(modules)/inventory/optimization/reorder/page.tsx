'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, TrendingUp, Calculator, Save, RefreshCw, Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import {
  ReorderAnalysisModal,
  ReorderAnalysisData
} from '@/components/inventory/InventoryAnalyticsModals';
import { inventoryService } from '@/services/InventoryService';

interface ReorderPointData {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentROP: number;
  suggestedROP: number;
  variance: number;
  avgDailyDemand: number;
  leadTimeDays: number;
  demandStdDev: number;
  serviceLevel: number;
  safetyStock: number;
  uom: string;
  currentStock: number;
  status: 'optimal' | 'too-high' | 'too-low';
}

export default function ReorderOptimizationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [serviceLevel, setServiceLevel] = useState(95);

  // Modal state
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [reorderResult, setReorderResult] = useState<ReorderAnalysisData | null>(null);

  const [reorderData, setReorderData] = useState<ReorderPointData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Map a raw "item below reorder" record from the API into the page's shape.
  const mapReorderItem = (raw: any): ReorderPointData => {
    const currentQuantity = Number(raw?.currentQuantity) || 0;
    const reorderLevel = Number(raw?.reorderLevel) || 0;
    const shortage = Number(raw?.shortage) || 0;
    // Items returned are below reorder level, so they are "too-low" by definition.
    const status: ReorderPointData['status'] =
      currentQuantity < reorderLevel ? 'too-low' : 'optimal';
    return {
      id: raw?.itemId ?? raw?.itemCode ?? '',
      itemCode: raw?.itemCode ?? '',
      itemName: raw?.itemName ?? '',
      category: raw?.category ?? '',
      currentROP: reorderLevel,
      suggestedROP: reorderLevel + shortage,
      variance: shortage,
      avgDailyDemand: Number(raw?.avgDailyDemand) || 0,
      leadTimeDays: Number(raw?.leadTimeDays) || 0,
      demandStdDev: Number(raw?.demandStdDev) || 0,
      serviceLevel: Number(raw?.serviceLevel) || serviceLevel,
      safetyStock: Number(raw?.safetyStock) || 0,
      uom: raw?.uom ?? '',
      currentStock: currentQuantity,
      status
    };
  };

  const loadReorderData = async (warehouseId?: string) => {
    const res = await inventoryService.getReorderAnalysis(warehouseId);
    const items = Array.isArray(res?.itemsBelowReorder) ? res.itemsBelowReorder : [];
    setReorderData(items.map(mapReorderItem));
  };

  useEffect(() => {
    (async () => {
      try {
        await loadReorderData();
      } catch (err) {
        console.error('Failed to load reorder analysis', err);
        setReorderData([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = reorderData.filter(item => {
    const matchesSearch = item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-700 border-green-200';
      case 'too-low': return 'bg-red-100 text-red-700 border-red-200';
      case 'too-high': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 5) return 'text-red-600';
    if (variance < -5) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleApplyAll = async () => {
    const itemsToUpdate = reorderData.filter(item => item.status !== 'optimal');
    if (itemsToUpdate.length === 0) {
      setActionError(null);
      setActionSuccess('All reorder points are already optimal — nothing to apply.');
      return;
    }
    if (!confirm(`Apply suggested ROP values to ${itemsToUpdate.length} item(s)?`)) {
      return;
    }
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const results = await Promise.allSettled(
        itemsToUpdate.map((item) =>
          inventoryService.updateReorderParameters(item.id, {
            reorderPoint: item.suggestedROP,
            safetyStock: item.safetyStock,
            serviceLevel: item.serviceLevel,
          })
        )
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      await loadReorderData();
      if (failed > 0) {
        setActionError(`Updated ${itemsToUpdate.length - failed} of ${itemsToUpdate.length} item(s); ${failed} failed.`);
      } else {
        setActionSuccess(`Updated ${itemsToUpdate.length} reorder point(s) successfully.`);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to apply reorder points.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await loadReorderData();
      setActionSuccess('Reorder analysis refreshed with the latest data.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to recalculate reorder points.');
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleReorderGenerate = async (config: any) => {
    try {
      const res = await inventoryService.getReorderAnalysis(config?.warehouse);
      const rawItems = Array.isArray(res?.itemsBelowReorder) ? res.itemsBelowReorder : [];
      const mapped = rawItems.map(mapReorderItem);
      setReorderData(mapped);

      const criticalItems = mapped.filter(d => d.status === 'too-low').length;
      const highPriorityItems = mapped.filter(d => d.status !== 'too-low').length;

      setReorderResult({
        analysisDate: config?.analysisDate,
        warehouse: config?.warehouse,
        items: mapped.map((i) => ({
          itemCode: i.itemCode,
          itemName: i.itemName,
          currentStock: i.currentStock,
          reorderLevel: i.currentROP,
          safetyStock: i.safetyStock,
          avgDailyConsumption: i.avgDailyDemand,
          leadTimeDays: i.leadTimeDays,
          daysUntilStockout: i.avgDailyDemand > 0 ? Math.round(i.currentStock / i.avgDailyDemand) : 0,
          recommendedOrderQty: i.variance,
          urgency: i.status === 'too-low' ? 'critical' : 'low'
        })),
        summary: {
          criticalItems,
          highPriorityItems,
          totalReorderValue: mapped.reduce((sum, i) => sum + (i.variance > 0 ? i.variance : 0), 0)
        }
      });
      setIsReorderModalOpen(false);
    } catch (err) {
      console.error('Failed to generate reorder analysis', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {actionSuccess}
        </div>
      )}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reorder Point Optimization</h1>
            <p className="text-sm text-gray-500 mt-1">Optimize reorder points based on demand and lead time analysis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsReorderModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Analysis</span>
          </button>
          <button
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Recalculating…' : 'Recalculate'}</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleApplyAll}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Applying…' : 'Apply Suggestions'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Optimal</p>
              <p className="text-3xl font-bold text-green-900 mt-1">
                {reorderData.filter(d => d.status === 'optimal').length}
              </p>
              <p className="text-xs text-green-600 mt-1">No changes needed</p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Too Low</p>
              <p className="text-3xl font-bold text-red-900 mt-1">
                {reorderData.filter(d => d.status === 'too-low').length}
              </p>
              <p className="text-xs text-red-600 mt-1">Increase recommended</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-red-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Too High</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {reorderData.filter(d => d.status === 'too-high').length}
              </p>
              <p className="text-xs text-orange-600 mt-1">Decrease recommended</p>
            </div>
            <TrendingUp className="w-6 h-6 text-orange-700" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Avg Service Level</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {(reorderData.length ? reorderData.reduce((sum, d) => sum + d.serviceLevel, 0) / reorderData.length : 0).toFixed(0)}%
              </p>
            </div>
            <Calculator className="w-6 h-6 text-blue-700" />
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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="optimal">Optimal</option>
            <option value="too-low">Too Low</option>
            <option value="too-high">Too High</option>
          </select>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Service Level:</label>
            <input
              type="range"
              min="80"
              max="99"
              value={serviceLevel}
              onChange={(e) => setServiceLevel(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-bold text-blue-600 w-12">{serviceLevel}%</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current ROP</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Suggested ROP</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Demand</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Safety Stock</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Service Level</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
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
                    <div className="text-sm font-semibold text-gray-900">{item.currentROP} {item.uom}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-bold text-blue-600">{item.suggestedROP} {item.uom}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`text-sm font-bold ${getVarianceColor(item.variance)}`}>
                      {item.variance > 0 ? '+' : ''}{item.variance} {item.uom}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((Math.abs(item.variance) / item.currentROP) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-semibold text-gray-900">{item.avgDailyDemand} {item.uom}/day</div>
                    <div className="text-xs text-gray-500">� = {item.demandStdDev}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-medium text-gray-900">{item.leadTimeDays} days</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-orange-600">{item.safetyStock} {item.uom}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm font-bold text-green-600">{item.serviceLevel}%</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      {item.status === 'optimal' && <CheckCircle className="w-3 h-3" />}
                      {item.status === 'too-low' && <AlertTriangle className="w-3 h-3" />}
                      {item.status === 'too-high' && <TrendingUp className="w-3 h-3" />}
                      {item.status.replace('-', ' ')}
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
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Reorder Point Calculation Formula:</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p className="font-mono bg-white px-3 py-2 rounded border border-blue-200">
            ROP = (Average Daily Demand � Lead Time) + Safety Stock
          </p>
          <p className="font-mono bg-white px-3 py-2 rounded border border-blue-200">
            Safety Stock = Z-Score � Demand Std Dev � Lead Time
          </p>
          <ul className="list-disc list-inside space-y-1 mt-3">
            <li><strong>Service Level 95%:</strong> Z-Score = 1.65 (5% stockout risk)</li>
            <li><strong>Service Level 99%:</strong> Z-Score = 2.33 (1% stockout risk)</li>
            <li><strong>Variance:</strong> Difference between current and suggested ROP</li>
            <li>Positive variance indicates ROP is too low, negative indicates too high</li>
            <li>System analyzes 90 days of historical demand data for calculations</li>
          </ul>
        </div>
      </div>

      {/* Critical Items View */}
      {reorderResult && reorderResult.summary.criticalItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Critical Items Requiring Immediate Attention</h3>
              <p className="text-sm text-red-700">These items are below their reorder points and need immediate action</p>
            </div>
          </div>
          <div className="text-sm text-red-800">
            <p><strong>{reorderResult.summary.criticalItems}</strong> items require immediate reordering</p>
            <p className="mt-2">Total estimated reorder value: <strong>₹{reorderResult.summary.totalReorderValue.toLocaleString()}</strong></p>
          </div>
        </div>
      )}

      {/* Reorder Analysis Modal */}
      <ReorderAnalysisModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        onGenerate={handleReorderGenerate}
      />
    </div>
  );
}
