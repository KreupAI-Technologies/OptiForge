'use client';

import { useState, useMemo, useEffect } from 'react';
import { IndianRupee, TrendingDown, TrendingUp } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface CostSummary {
  category: string;
  purchaseCost: number;
  maintenanceCost: number;
  totalCost: number;
  monthlyAvg: number;
  trend: 'up' | 'down';
}

export default function Page() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reportData, setReportData] = useState<CostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getReportCosts();
        const mapped: CostSummary[] = rows.map((r) => ({
          category: r.category,
          purchaseCost: Number(r.purchaseCost),
          maintenanceCost: Number(r.maintenanceCost),
          totalCost: Number(r.totalCost),
          monthlyAvg: Number(r.monthlyAvg),
          trend: r.trend as CostSummary['trend'],
        }));
        if (!cancelled) setReportData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load asset cost report');
          setReportData([]);
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

  const stats = useMemo(() => {
    const totals = reportData.reduce((acc, item) => ({
      purchase: acc.purchase + item.purchaseCost,
      maintenance: acc.maintenance + item.maintenanceCost,
      total: acc.total + item.totalCost
    }), { purchase: 0, maintenance: 0, total: 0 });

    return {
      ...totals,
      monthlyAvg: reportData.reduce((sum, item) => sum + item.monthlyAvg, 0)
    };
  }, [reportData]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Asset Cost Report</h1>
        <p className="text-sm text-gray-600 mt-1">Comprehensive overview of asset-related costs</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading asset cost report…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Purchase Cost</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">₹{(stats.purchase / 10000000).toFixed(2)}Cr</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Maintenance Cost</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">₹{(stats.maintenance / 100000).toFixed(2)}L</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Cost</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{(stats.total / 10000000).toFixed(2)}Cr</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Monthly Avg</p>
          <p className="text-2xl font-bold text-green-900 mt-1">₹{stats.monthlyAvg.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Export Report
            </button>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {reportData.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.category}</h3>
                  <p className="text-sm text-gray-600">Total Cost: ₹{item.totalCost.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  {item.trend === 'up' ? (
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  )}
                  <span className={`text-sm font-semibold ${item.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {item.trend === 'up' ? 'Increasing' : 'Decreasing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Purchase Cost</p>
                <p className="text-lg font-bold text-blue-700">₹{(item.purchaseCost / 100000).toFixed(2)}L</p>
                <p className="text-xs text-blue-600 mt-1">{((item.purchaseCost / item.totalCost) * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 uppercase font-medium mb-1">Maintenance</p>
                <p className="text-lg font-bold text-orange-700">₹{item.maintenanceCost.toLocaleString('en-IN')}</p>
                <p className="text-xs text-orange-600 mt-1">{((item.maintenanceCost / item.totalCost) * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 uppercase font-medium mb-1">Monthly Avg</p>
                <p className="text-lg font-bold text-green-700">₹{item.monthlyAvg.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Cost Breakdown</span>
                <span>Purchase vs Maintenance</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-blue-500"
                  style={{ width: `${(item.purchaseCost / item.totalCost) * 100}%` }}
                  title={`Purchase: ${((item.purchaseCost / item.totalCost) * 100).toFixed(1)}%`}
                ></div>
                <div
                  className="bg-orange-500"
                  style={{ width: `${(item.maintenanceCost / item.totalCost) * 100}%` }}
                  title={`Maintenance: ${((item.maintenanceCost / item.totalCost) * 100).toFixed(1)}%`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
