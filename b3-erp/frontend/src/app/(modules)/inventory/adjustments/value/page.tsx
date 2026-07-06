'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Warehouse,
  Calendar,
  User,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3
} from 'lucide-react';

interface ValueAdjustment {
  id: number;
  adjustmentNumber: string;
  date: string;
  warehouse: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  currentUnitValue: number;
  adjustedUnitValue: number;
  valueChange: number;
  totalImpact: number;
  adjustmentType: 'increase' | 'decrease';
  reason: string;
  createdBy: string;
  status: 'draft' | 'approved' | 'rejected';
  priceReference?: string;
}

export default function ValueAdjustmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [adjustments, setAdjustments] = useState<ValueAdjustment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const records = await inventoryService.getStockAdjustments();
        if (!Array.isArray(records)) {
          setAdjustments([]);
          return;
        }
        // Value/revaluation adjustments only
        const mapped: ValueAdjustment[] = records
          .filter((r: any) => r?.adjustmentType === 'Revaluation')
          .map((r: any, idx: number) => {
            const line = Array.isArray(r?.lines) && r.lines.length > 0 ? r.lines[0] : {};
            const totalImpact = Number(r?.totalAdjustmentValue ?? 0);
            const quantity = Number(line?.physicalQuantity ?? line?.systemQuantity ?? 0);
            const currentUnitValue = Number(line?.systemValue ?? line?.unitCost ?? 0);
            const adjustedUnitValue = Number(line?.physicalValue ?? line?.adjustedUnitCost ?? currentUnitValue);
            const rawStatus = String(r?.status ?? '').toLowerCase();
            const status: ValueAdjustment['status'] =
              rawStatus === 'approved' ? 'approved' : rawStatus === 'rejected' ? 'rejected' : 'draft';
            return {
              id: r?.id ?? idx,
              adjustmentNumber: r?.adjustmentNumber ?? '',
              date: r?.adjustmentDate ? String(r.adjustmentDate).slice(0, 10) : '',
              warehouse: r?.warehouseName ?? r?.warehouseId ?? '',
              itemCode: line?.itemCode ?? '',
              itemName: line?.itemName ?? '',
              category: line?.category ?? '',
              quantity,
              currentUnitValue,
              adjustedUnitValue,
              valueChange: adjustedUnitValue - currentUnitValue,
              totalImpact,
              adjustmentType: totalImpact >= 0 ? 'increase' : 'decrease',
              reason: r?.reason ?? line?.adjustmentReason ?? '',
              createdBy: r?.approvedBy ?? '',
              status,
              priceReference: r?.remarks ?? undefined,
            };
          });
        setAdjustments(mapped);
      } catch (error) {
        console.error('Failed to load value adjustments', error);
        setAdjustments([]);
      }
    };
    load();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalAdjustments = adjustments.length;
  const totalIncreases = adjustments.filter(a => a.adjustmentType === 'increase').length;
  const totalDecreases = adjustments.filter(a => a.adjustmentType === 'decrease').length;
  const netValueImpact = adjustments.reduce((sum, a) => sum + a.totalImpact, 0);

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.adjustmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adj.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         adj.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouse === 'all' || adj.warehouse.toLowerCase().includes(selectedWarehouse.toLowerCase());
    const matchesType = selectedType === 'all' || adj.adjustmentType === selectedType;
    const matchesStatus = selectedStatus === 'all' || adj.status === selectedStatus;
    
    return matchesSearch && matchesWarehouse && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span>Value Adjustments</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage inventory value and price adjustments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalAdjustments}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Adjustments</div>
          <div className="text-xs text-purple-600 mt-1">All Time</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalIncreases}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Value Increases</div>
          <div className="text-xs text-green-600 mt-1">Upward Adjustments</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{totalDecreases}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Value Decreases</div>
          <div className="text-xs text-red-600 mt-1">Downward Adjustments</div>
        </div>

        <div className={`bg-gradient-to-br ${netValueImpact >= 0 ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'} rounded-lg p-3 border`}>
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className={`w-8 h-8 ${netValueImpact >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <span className={`text-2xl font-bold ${netValueImpact >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              ₹{Math.abs(netValueImpact / 1000).toFixed(1)}K
            </span>
          </div>
          <div className={`text-sm font-medium ${netValueImpact >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Net Impact</div>
          <div className={`text-xs ${netValueImpact >= 0 ? 'text-blue-600' : 'text-orange-600'} mt-1`}>
            {netValueImpact >= 0 ? 'Net Increase' : 'Net Decrease'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search adjustments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Warehouses</option>
            <option value="main">Main Warehouse</option>
            <option value="assembly">Assembly Plant</option>
            <option value="fg">FG Store</option>
            <option value="rm">RM Store</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="increase">Increases Only</option>
            <option value="decrease">Decreases Only</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted Value</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Impact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {adj.adjustmentNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{adj.date}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="font-medium">{adj.itemName}</div>
                    <div className="text-xs text-gray-500">{adj.itemCode}</div>
                    {adj.priceReference && (
                      <div className="text-xs text-blue-600 mt-1">{adj.priceReference}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Warehouse className="w-4 h-4 text-gray-400" />
                      <span>{adj.warehouse}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{adj.quantity} units</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ₹{adj.currentUnitValue.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium">₹{adj.adjustedUnitValue.toLocaleString()}</span>
                      <span className={`text-xs ${adj.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        ({adj.adjustmentType === 'increase' ? '+' : ''}₹{adj.valueChange.toLocaleString()})
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className={`flex items-center space-x-1 font-bold ${adj.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.adjustmentType === 'increase' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span>₹{Math.abs(adj.totalImpact / 1000).toFixed(1)}K</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{adj.reason}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(adj.status)}`}>
                      {adj.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdjustments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No value adjustments found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
