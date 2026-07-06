'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  Zap,
  TrendingUp,
  Package,
  BarChart3,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface ItemVelocity {
  itemCode: string;
  itemName: string;
  category: string;
  currentStock: number;
  avgDailyUsage: number;
  avgWeeklyUsage: number;
  avgMonthlyUsage: number;
  daysOnHand: number;
  velocityClass: 'A' | 'B' | 'C' | 'D';
  trend: 'up' | 'down' | 'stable';
  lastMovement: string;
}

export default function InventoryVelocityPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('last-90-days');
  const [selectedVelocity, setSelectedVelocity] = useState('all');

  const [velocityData, setVelocityData] = useState<ItemVelocity[]>([]);

  useEffect(() => {
    const loadVelocity = async () => {
      try {
        const res = await inventoryService.getVelocity();
        const items = Array.isArray(res?.items) ? res.items : [];
        const classMap: Record<string, ItemVelocity['velocityClass']> = {
          fast: 'A',
          medium: 'B',
          slow: 'C',
          dead: 'D',
        };
        const mapped: ItemVelocity[] = items.map((it: any) => {
          const velocityClass = classMap[String(it?.velocity ?? it?.abcClass).toLowerCase()] ?? 'C';
          const days = Number(it?.daysSinceMovement) || 0;
          const monthly = days > 0 ? (Number(it?.quantity) || 0) / (days / 30) : 0;
          const daily = monthly / 30;
          return {
            itemCode: it?.itemCode ?? '',
            itemName: it?.itemName ?? '',
            category: it?.category ?? '',
            currentStock: Number(it?.quantity) || 0,
            avgDailyUsage: Number(daily.toFixed(1)),
            avgWeeklyUsage: Number((daily * 7).toFixed(1)),
            avgMonthlyUsage: Math.round(monthly),
            daysOnHand: days,
            velocityClass,
            trend: velocityClass === 'A' ? 'up' : velocityClass === 'D' ? 'down' : 'stable',
            lastMovement: it?.lastMovementDate ?? '',
          };
        });
        setVelocityData(mapped);
      } catch (err) {
        console.error('Failed to load velocity data', err);
      }
    };
    loadVelocity();
  }, []);

  const getVelocityColor = (velocityClass: string) => {
    switch (velocityClass) {
      case 'A':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'B':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVelocityLabel = (velocityClass: string) => {
    switch (velocityClass) {
      case 'A':
        return 'Very Fast';
      case 'B':
        return 'Fast';
      case 'C':
        return 'Slow';
      case 'D':
        return 'Very Slow';
      default:
        return 'Unknown';
    }
  };

  const classACount = velocityData.filter(item => item.velocityClass === 'A').length;
  const classBCount = velocityData.filter(item => item.velocityClass === 'B').length;
  const classCCount = velocityData.filter(item => item.velocityClass === 'C').length;
  const classDCount = velocityData.filter(item => item.velocityClass === 'D').length;

  const filteredData = velocityData.filter(item => {
    const matchesVelocity = selectedVelocity === 'all' || item.velocityClass === selectedVelocity;
    return matchesVelocity;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Zap className="w-8 h-8 text-yellow-600" />
            <span>Inventory Velocity Analysis</span>
          </h1>
          <p className="text-gray-600 mt-1">Analyze item movement speed and usage patterns</p>
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
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{classACount}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Class A - Very Fast</div>
          <div className="text-xs text-green-600 mt-1">High Velocity Items</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{classBCount}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Class B - Fast</div>
          <div className="text-xs text-blue-600 mt-1">Medium Velocity Items</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{classCCount}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Class C - Slow</div>
          <div className="text-xs text-yellow-600 mt-1">Low Velocity Items</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <ArrowDownRight className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{classDCount}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Class D - Very Slow</div>
          <div className="text-xs text-red-600 mt-1">Dead/Obsolete Risk</div>
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
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="last-180-days">Last 180 Days</option>
            <option value="last-year">Last Year</option>
          </select>

          <select
            value={selectedVelocity}
            onChange={(e) => setSelectedVelocity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Velocity Classes</option>
            <option value="A">Class A - Very Fast</option>
            <option value="B">Class B - Fast</option>
            <option value="C">Class C - Slow</option>
            <option value="D">Class D - Very Slow</option>
          </select>
        </div>
      </div>

      {/* Velocity Analysis Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Item-wise Velocity Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Usage</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Usage</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days on Hand</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Velocity Class</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Movement</th>
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
                      <span className="font-medium text-gray-900">{item.currentStock.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">
                    {item.avgDailyUsage.toFixed(1)} units/day
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.avgMonthlyUsage.toLocaleString()} units/mo
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`font-medium ${item.daysOnHand > 90 ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.daysOnHand} days
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVelocityColor(item.velocityClass)}`}>
                      Class {item.velocityClass} - {getVelocityLabel(item.velocityClass)}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {item.trend === 'up' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <ArrowUpRight className="w-5 h-5" />
                        <span className="text-xs font-medium">Increasing</span>
                      </div>
                    )}
                    {item.trend === 'down' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <ArrowDownRight className="w-5 h-5" />
                        <span className="text-xs font-medium">Decreasing</span>
                      </div>
                    )}
                    {item.trend === 'stable' && (
                      <span className="text-xs text-gray-500">Stable</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {item.lastMovement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Classification Reference */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Velocity Classification Guide</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-white p-3 rounded border border-green-200">
            <div className="font-semibold text-green-700 mb-1">Class A - Very Fast</div>
            <div className="text-gray-600">High usage, frequent movement, &lt;30 days on hand</div>
          </div>
          <div className="bg-white p-3 rounded border border-blue-200">
            <div className="font-semibold text-blue-700 mb-1">Class B - Fast</div>
            <div className="text-gray-600">Moderate usage, regular movement, 30-60 days on hand</div>
          </div>
          <div className="bg-white p-3 rounded border border-yellow-200">
            <div className="font-semibold text-yellow-700 mb-1">Class C - Slow</div>
            <div className="text-gray-600">Low usage, infrequent movement, 60-120 days on hand</div>
          </div>
          <div className="bg-white p-3 rounded border border-red-200">
            <div className="font-semibold text-red-700 mb-1">Class D - Very Slow</div>
            <div className="text-gray-600">Minimal/no usage, rare movement, &gt;120 days on hand</div>
          </div>
        </div>
      </div>
    </div>
  );
}
