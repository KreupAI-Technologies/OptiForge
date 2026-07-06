'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  Clock,
  Package,
  AlertCircle,
  TrendingDown,
  Search,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  Archive,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';
import {
  StockAgingModal,
  StockAgingData
} from '@/components/inventory/InventoryAnalyticsModals';

interface AgingItem {
  id: number;
  itemCode: string;
  itemName: string;
  category: string;
  warehouse: string;
  quantity: number;
  uom: string;
  unitValue: number;
  totalValue: number;
  lastMovementDate: string;
  agingDays: number;
  agingBucket: '0-30' | '31-60' | '61-90' | '91-180' | '180+';
  movementVelocity: 'fast' | 'medium' | 'slow' | 'dead';
  recommendation: string;
}

export default function StockAgingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('all');
  const [selectedVelocity, setSelectedVelocity] = useState('all');

  // Modal state
  const [isAgingModalOpen, setIsAgingModalOpen] = useState(false);
  const [agingResult, setAgingResult] = useState<StockAgingData | null>(null);

  const [agingItems, setAgingItems] = useState<AgingItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await inventoryService.getAgingItems();
        if (res?.items) {
          setAgingItems(res.items.map((it: any, idx: number) => ({
            id: it.id ?? idx,
            itemCode: it.itemCode,
            itemName: it.itemName,
            category: it.category,
            warehouse: it.warehouse,
            quantity: it.quantity ?? 0,
            uom: it.uom ?? '',
            unitValue: it.unitValue ?? 0,
            totalValue: it.totalValue ?? 0,
            lastMovementDate: it.lastMovementDate ?? '',
            agingDays: it.agingDays ?? 0,
            agingBucket: it.agingBucket,
            movementVelocity: it.movementVelocity,
            recommendation: it.recommendation ?? ''
          })));
        }
      } catch { /* keep empty */ }
    })();
  }, []);

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'fast':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'slow':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'dead':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case '0-30':
        return 'text-green-600 bg-green-50';
      case '31-60':
        return 'text-blue-600 bg-blue-50';
      case '61-90':
        return 'text-yellow-600 bg-yellow-50';
      case '91-180':
        return 'text-orange-600 bg-orange-50';
      case '180+':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const totalValue = agingItems.reduce((sum, item) => sum + item.totalValue, 0);
  const deadStockValue = agingItems
    .filter(item => item.movementVelocity === 'dead')
    .reduce((sum, item) => sum + item.totalValue, 0);
  const slowMovingValue = agingItems
    .filter(item => item.movementVelocity === 'slow')
    .reduce((sum, item) => sum + item.totalValue, 0);
  const over180DaysValue = agingItems
    .filter(item => item.agingBucket === '180+')
    .reduce((sum, item) => sum + item.totalValue, 0);

  const bucketDistribution = {
    '0-30': agingItems.filter(item => item.agingBucket === '0-30').length,
    '31-60': agingItems.filter(item => item.agingBucket === '31-60').length,
    '61-90': agingItems.filter(item => item.agingBucket === '61-90').length,
    '91-180': agingItems.filter(item => item.agingBucket === '91-180').length,
    '180+': agingItems.filter(item => item.agingBucket === '180+').length
  };

  const filteredItems = agingItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBucket = selectedBucket === 'all' || item.agingBucket === selectedBucket;
    const matchesVelocity = selectedVelocity === 'all' || item.movementVelocity === selectedVelocity;

    return matchesSearch && matchesBucket && matchesVelocity;
  });

  // Handler function
  const handleAgingGenerate = async (config: any) => {
    try {
      const res = await inventoryService.getAgingItems(config?.warehouse);
      if (res?.summary) {
        setAgingResult({
          reportDate: config?.reportDate,
          warehouse: config?.warehouse,
          items: res.items ?? [],
          summary: res.summary
        });
      } else {
        setAgingResult({
          reportDate: config?.reportDate,
          warehouse: config?.warehouse,
          items: [],
          summary: {
            totalValue: totalValue,
            bucket_0_30: { quantity: 0, value: 0, percentage: 0 },
            bucket_31_60: { quantity: 0, value: 0, percentage: 0 },
            bucket_61_90: { quantity: 0, value: 0, percentage: 0 },
            bucket_91_180: { quantity: 0, value: 0, percentage: 0 },
            bucket_180_plus: { quantity: 0, value: 0, percentage: 0 }
          }
        });
      }
    } catch {
      /* keep existing result */
    }
    setIsAgingModalOpen(false);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Clock className="w-8 h-8 text-orange-600" />
            <span>Stock Aging Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">Inventory aging and movement velocity tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAgingModalOpen(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Analysis</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">₹{(totalValue / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Aging Stock Value</div>
          <div className="text-xs text-blue-600 mt-1">{agingItems.length} Items</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <Archive className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">₹{(deadStockValue / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-red-700">Dead Stock Value</div>
          <div className="text-xs text-red-600 mt-1">No Movement {'>'} 180 Days</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">₹{(slowMovingValue / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Slow Moving</div>
          <div className="text-xs text-orange-600 mt-1">Requires Attention</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">₹{(over180DaysValue / 100000).toFixed(1)}L</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Over 180 Days</div>
          <div className="text-xs text-purple-600 mt-1">Critical Action Needed</div>
        </div>
      </div>

      {/* Aging Buckets Distribution */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aging Buckets Distribution</h3>
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-900">{bucketDistribution['0-30']}</div>
            <div className="text-sm text-green-700 font-medium mt-1">0-30 Days</div>
            <div className="text-xs text-green-600 mt-1">Fresh Stock</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">{bucketDistribution['31-60']}</div>
            <div className="text-sm text-blue-700 font-medium mt-1">31-60 Days</div>
            <div className="text-xs text-blue-600 mt-1">Normal</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-900">{bucketDistribution['61-90']}</div>
            <div className="text-sm text-yellow-700 font-medium mt-1">61-90 Days</div>
            <div className="text-xs text-yellow-600 mt-1">Watch List</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-900">{bucketDistribution['91-180']}</div>
            <div className="text-sm text-orange-700 font-medium mt-1">91-180 Days</div>
            <div className="text-xs text-orange-600 mt-1">Slow Moving</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-900">{bucketDistribution['180+']}</div>
            <div className="text-sm text-red-700 font-medium mt-1">180+ Days</div>
            <div className="text-xs text-red-600 mt-1">Dead Stock</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Aging Buckets</option>
            <option value="0-30">0-30 Days</option>
            <option value="31-60">31-60 Days</option>
            <option value="61-90">61-90 Days</option>
            <option value="91-180">91-180 Days</option>
            <option value="180+">180+ Days</option>
          </select>

          <select
            value={selectedVelocity}
            onChange={(e) => setSelectedVelocity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Movement Velocity</option>
            <option value="fast">Fast Moving</option>
            <option value="medium">Medium Moving</option>
            <option value="slow">Slow Moving</option>
            <option value="dead">Dead Stock</option>
          </select>
        </div>
      </div>

      {/* Aging Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Movement</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aging Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aging Bucket</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Velocity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.itemCode}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{item.category}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity} {item.uom}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{item.totalValue.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{item.lastMovementDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className="text-sm font-semibold text-orange-600">{item.agingDays} days</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getBucketColor(item.agingBucket)}`}>
                      {item.agingBucket} days
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVelocityColor(item.movementVelocity)}`}>
                      <span className="capitalize">{item.movementVelocity}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No aging items found matching your filters</p>
          </div>
        )}
      </div>

      {/* Action Recommendations */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommended Actions</h3>
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
            <Archive className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Dead Stock (180+ days)</h4>
              <p className="text-sm text-red-700 mt-1">
                Consider liquidation, return to supplier, or scrapping for {bucketDistribution['180+']} items worth ₹{(over180DaysValue / 100000).toFixed(1)}L
              </p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start space-x-3">
            <TrendingDown className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-900">Slow Moving Items (91-180 days)</h4>
              <p className="text-sm text-orange-700 mt-1">
                Review usage forecast and consider promotional offers for {bucketDistribution['91-180']} items
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Watch List (61-90 days)</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Monitor consumption patterns for {bucketDistribution['61-90']} items before they become slow-moving
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Aging Modal */}
      <StockAgingModal
        isOpen={isAgingModalOpen}
        onClose={() => setIsAgingModalOpen(false)}
        onGenerate={handleAgingGenerate}
      />
    </div>
  );
}
