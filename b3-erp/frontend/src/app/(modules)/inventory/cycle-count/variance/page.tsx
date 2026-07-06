'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  MessageSquare,
  Edit,
  BarChart3
} from 'lucide-react';

interface VarianceItem {
  id: number;
  itemCode: string;
  itemName: string;
  location: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  variancePercent: number;
  unitValue: number;
  varianceValue: number;
  uom: string;
  category: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
}

export default function VariancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [varianceItems, setVarianceItems] = useState<VarianceItem[]>([]);

  const loadVariances = async () => {
    try {
      const rows = await inventoryService.getCycleCounts();
      if (!Array.isArray(rows)) {
        setVarianceItems([]);
        return;
      }
      const mapped: VarianceItem[] = rows.map((r, idx) => {
        const systemQty = Number(r?.itemsToCount) || 0;
        const physicalQty = Number(r?.itemsCounted) || 0;
        const variance = Number(r?.variancesFound) || 0;
        const accuracy = Number(r?.accuracy) || 0;
        const variancePercent = systemQty > 0 ? (variance / systemQty) * 100 : 0;
        const absPct = Math.abs(variancePercent);
        const severity: VarianceItem['severity'] =
          absPct > 15 ? 'critical' : absPct > 10 ? 'high' : absPct > 5 ? 'medium' : 'low';
        const status: VarianceItem['status'] =
          r?.status === 'reconciled' || r?.status === 'completed' ? 'approved' : 'pending';
        return {
          id: idx + 1,
          itemCode: r?.countNumber ?? `CC-${idx + 1}`,
          itemName: r?.title ?? r?.countNumber ?? 'Cycle Count',
          location: [r?.warehouse, r?.zone].filter(Boolean).join(' / ') || '-',
          systemQty,
          physicalQty,
          variance,
          variancePercent,
          unitValue: 0,
          varianceValue: 0,
          uom: 'Items',
          category: r?.countType ?? '-',
          reason: `Accuracy ${accuracy.toFixed(1)}%`,
          severity,
          status,
        };
      });
      setVarianceItems(mapped);
    } catch (err) {
      console.error('Failed to load variances', err);
      setVarianceItems([]);
    }
  };

  useEffect(() => {
    loadVariances();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalVariances = varianceItems.length;
  const positiveVariances = varianceItems.filter(item => item.variance > 0).length;
  const negativeVariances = varianceItems.filter(item => item.variance < 0).length;
  const totalVarianceValue = varianceItems.reduce((sum, item) => sum + item.varianceValue, 0);
  const criticalCount = varianceItems.filter(item => item.severity === 'critical').length;

  const filteredItems = varianceItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || item.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span>Variance Analysis - CC-2025-002</span>
          </h1>
          <p className="text-gray-600 mt-1">Review and analyze inventory count variances</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => loadVariances()} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Approve All</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{totalVariances}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Total Variances</div>
          <div className="text-xs text-red-600 mt-1">Items with differences</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{positiveVariances}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Positive Variances</div>
          <div className="text-xs text-green-600 mt-1">Physical {'>'} System</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">{negativeVariances}</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Negative Variances</div>
          <div className="text-xs text-orange-600 mt-1">Physical {'<'} System</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">
              ₹{Math.abs(totalVarianceValue / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="text-sm font-medium text-purple-700">Variance Value</div>
          <div className="text-xs text-purple-600 mt-1">
            {totalVarianceValue >= 0 ? 'Surplus' : 'Shortage'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{criticalCount}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Critical Issues</div>
          <div className="text-xs text-red-600 mt-1">Immediate Action</div>
        </div>
      </div>

      {/* Variance Distribution */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Variance by Severity</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-900">
              {varianceItems.filter(item => item.severity === 'critical').length}
            </div>
            <div className="text-sm text-red-700 font-medium mt-1">Critical</div>
            <div className="text-xs text-red-600 mt-1">{'>'} 15% variance</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-900">
              {varianceItems.filter(item => item.severity === 'high').length}
            </div>
            <div className="text-sm text-orange-700 font-medium mt-1">High</div>
            <div className="text-xs text-orange-600 mt-1">10-15% variance</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-900">
              {varianceItems.filter(item => item.severity === 'medium').length}
            </div>
            <div className="text-sm text-yellow-700 font-medium mt-1">Medium</div>
            <div className="text-xs text-yellow-600 mt-1">5-10% variance</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">
              {varianceItems.filter(item => item.severity === 'low').length}
            </div>
            <div className="text-sm text-blue-700 font-medium mt-1">Low</div>
            <div className="text-xs text-blue-600 mt-1">{'<'} 5% variance</div>
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
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severity Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Variance Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physical Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Impact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.itemCode}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div>{item.itemName}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {item.location}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {item.systemQty} {item.uom}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {item.physicalQty} {item.uom}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {item.variance > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${item.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.variance > 0 ? '+' : ''}{item.variance} {item.uom}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ({item.variancePercent > 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%)
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${item.varianceValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(item.varianceValue).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(item.severity)}`}>
                      <span className="capitalize">{item.severity}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{item.reason}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Approve</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Comment</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
