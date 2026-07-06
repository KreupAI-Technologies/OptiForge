'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  AlertTriangle,
  Package,
  Calendar,
  DollarSign,
  Download,
  Trash2,
  Archive,
  TrendingDown
} from 'lucide-react';

interface DeadStockItem {
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  valueAtCost: number;
  lastMovementDate: string;
  daysSinceMovement: number;
  recommendedAction: 'liquidate' | 'write-off' | 'repurpose' | 'monitor';
  agingCategory: '90-180' | '180-365' | '1-2 years' | '>2 years';
  potentialLoss: number;
}

export default function DeadStockPage() {
  const [selectedAging, setSelectedAging] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');

  const [deadStockData, setDeadStockData] = useState<DeadStockItem[]>([]);

  useEffect(() => {
    const loadDeadStock = async () => {
      try {
        const res = await inventoryService.getDeadStock();
        const items = Array.isArray(res?.items) ? res.items : [];
        const mapped: DeadStockItem[] = items.map((it: any) => {
          const days = Number(it?.daysSinceMovement) || 0;
          const value = Number(it?.value) || 0;
          const agingCategory: DeadStockItem['agingCategory'] =
            days > 730 ? '>2 years'
              : days > 365 ? '1-2 years'
                : days > 180 ? '180-365'
                  : '90-180';
          const recommendedAction: DeadStockItem['recommendedAction'] =
            days > 730 ? 'write-off'
              : days > 365 ? 'repurpose'
                : days > 180 ? 'liquidate'
                  : 'monitor';
          return {
            itemCode: it?.itemCode ?? '',
            itemName: it?.itemName ?? '',
            category: it?.category ?? '',
            currentStock: Number(it?.quantity) || 0,
            valueAtCost: value,
            lastMovementDate: it?.lastMovementDate ?? '',
            daysSinceMovement: days,
            recommendedAction,
            agingCategory,
            potentialLoss: Math.round(value * 0.75),
          };
        });
        setDeadStockData(mapped);
      } catch (err) {
        console.error('Failed to load dead stock', err);
      }
    };
    loadDeadStock();
  }, []);

  const getAgingColor = (category: string) => {
    switch (category) {
      case '90-180':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case '180-365':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case '1-2 years':
        return 'text-red-600 bg-red-50 border-red-200';
      case '>2 years':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'liquidate':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'write-off':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'repurpose':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'monitor':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalItems = deadStockData.length;
  const totalValue = deadStockData.reduce((sum, item) => sum + item.valueAtCost, 0);
  const totalPotentialLoss = deadStockData.reduce((sum, item) => sum + item.potentialLoss, 0);
  const criticalItems = deadStockData.filter(item => item.daysSinceMovement > 365).length;

  const filteredData = deadStockData.filter(item => {
    const matchesAging = selectedAging === 'all' || item.agingCategory === selectedAging;
    const matchesAction = selectedAction === 'all' || item.recommendedAction === selectedAction;
    return matchesAging && matchesAction;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span>Dead Stock Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">Identify and manage non-moving or obsolete inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{totalItems}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Dead Stock Items</div>
          <div className="text-xs text-red-600 mt-1">Total Count</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">₹{(totalValue / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Total Value Locked</div>
          <div className="text-xs text-orange-600 mt-1">At Cost Price</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">₹{(totalPotentialLoss / 1000000).toFixed(1)}M</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Potential Loss</div>
          <div className="text-xs text-purple-600 mt-1">Est. Write-off Value</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{criticalItems}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Critical Items</div>
          <div className="text-xs text-yellow-600 mt-1">&gt;1 Year No Movement</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <select
            value={selectedAging}
            onChange={(e) => setSelectedAging(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Aging Categories</option>
            <option value="90-180">90-180 Days</option>
            <option value="180-365">180-365 Days</option>
            <option value="1-2 years">1-2 Years</option>
            <option value=">2 years">&gt;2 Years</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Recommended Actions</option>
            <option value="liquidate">Liquidate</option>
            <option value="write-off">Write-off</option>
            <option value="repurpose">Repurpose</option>
            <option value="monitor">Monitor</option>
          </select>
        </div>
      </div>

      {/* Dead Stock Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Dead Stock Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value at Cost</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Movement</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Idle</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aging</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Action</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Loss</th>
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
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{item.currentStock}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₹{item.valueAtCost.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{item.lastMovementDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`font-bold ${item.daysSinceMovement > 365 ? 'text-red-600' : 'text-orange-600'}`}>
                      {item.daysSinceMovement} days
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getAgingColor(item.agingCategory)}`}>
                      {item.agingCategory}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(item.recommendedAction)}`}>
                      {item.recommendedAction.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-red-600">
                    ₹{item.potentialLoss.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Guidelines */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center space-x-2">
          <Archive className="w-5 h-5" />
          <span>Recommended Action Guidelines</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-white p-3 rounded border border-blue-200">
            <div className="font-semibold text-blue-700 mb-1 flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>Liquidate</span>
            </div>
            <div className="text-gray-600">Sell at discounted price to recover partial value. Market demand exists.</div>
          </div>
          <div className="bg-white p-3 rounded border border-red-200">
            <div className="font-semibold text-red-700 mb-1 flex items-center space-x-1">
              <Trash2 className="w-4 h-4" />
              <span>Write-off</span>
            </div>
            <div className="text-gray-600">Remove from inventory, dispose/scrap. No market value, obsolete.</div>
          </div>
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="font-semibold text-green-700 mb-1 flex items-center space-x-1">
              <Package className="w-4 h-4" />
              <span>Repurpose</span>
            </div>
            <div className="text-gray-600">Modify/adapt for alternate use. Components can be salvaged.</div>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <div className="font-semibold text-yellow-700 mb-1 flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Monitor</span>
            </div>
            <div className="text-gray-600">Watch for movement. Potential demand exists, not yet critical.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
