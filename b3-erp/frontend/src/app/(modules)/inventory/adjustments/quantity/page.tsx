'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService, AdjustmentReason } from '@/services/InventoryService';
import {
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

interface QuantityAdjustment {
  id: number;
  adjustmentNumber: string;
  date: string;
  warehouse: string;
  itemCode: string;
  itemName: string;
  category: string;
  currentQty: number;
  adjustedQty: number;
  adjustment: number;
  adjustmentType: 'increase' | 'decrease';
  unitValue: number;
  valueImpact: number;
  reason: string;
  createdBy: string;
  status: 'draft' | 'approved' | 'rejected';
  batchNumber?: string;
}

export default function QuantityAdjustmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reasons, setReasons] = useState<AdjustmentReason[]>([]);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await inventoryService.getAdjustmentReasons({ status: 'Active' });
        setReasons(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load adjustment reasons', e);
        setReasons([]);
      }
    })();
  }, []);

  // Resolve a fetched reason code by (case-insensitive) name; fall back to the raw name.
  const resolveReasonCode = (name: string): string => {
    if (!reasons || reasons.length === 0) return name;
    const match = reasons.find(
      (r) => r.name?.toLowerCase() === name?.toLowerCase() || r.code?.toLowerCase() === name?.toLowerCase()
    );
    return match?.code ?? name;
  };

  // Create a real stock adjustment for a single quantity-adjustment row.
  const handleCreateAdjustment = async (adj: QuantityAdjustment) => {
    if (submittingId !== null) return;
    setSubmittingId(adj.id);
    try {
      const payload = {
        adjustmentType: 'Physical Inventory' as const,
        adjustmentDate: adj.date || new Date().toISOString().split('T')[0],
        warehouseId: adj.warehouse,
        reason: resolveReasonCode(adj.reason),
        remarks: adj.batchNumber ? `Batch: ${adj.batchNumber}` : '',
        lines: [
          {
            lineNumber: 1,
            itemId: adj.itemCode,
            itemCode: adj.itemCode,
            itemName: adj.itemName,
            systemQuantity: adj.currentQty,
            physicalQuantity: adj.adjustedQty,
            uom: '',
            adjustmentReason: resolveReasonCode(adj.reason),
            remarks: adj.batchNumber ? `Batch: ${adj.batchNumber}` : '',
          },
        ],
      };
      await inventoryService.createStockAdjustment(payload);
      router.push('/inventory/adjustments');
    } catch (e) {
      console.error('Failed to create stock adjustment', e);
      alert('Failed to create stock adjustment. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  const [adjustments, setAdjustments] = useState<QuantityAdjustment[]>([
    {
      id: 1,
      adjustmentNumber: 'QTY-ADJ-001',
      date: '2025-01-15',
      warehouse: 'Main Warehouse',
      itemCode: 'ITM-001',
      itemName: 'Steel Plate 10mm',
      category: 'Raw Material',
      currentQty: 150,
      adjustedQty: 145,
      adjustment: -5,
      adjustmentType: 'decrease',
      unitValue: 2500,
      valueImpact: -12500,
      reason: 'Physical Count Variance',
      createdBy: 'John Smith',
      status: 'approved',
      batchNumber: 'BATCH-2025-001'
    },
    {
      id: 2,
      adjustmentNumber: 'QTY-ADJ-002',
      date: '2025-01-17',
      warehouse: 'Assembly Plant',
      itemCode: 'ITM-005',
      itemName: 'Hydraulic Pump',
      category: 'Component',
      currentQty: 42,
      adjustedQty: 45,
      adjustment: 3,
      adjustmentType: 'increase',
      unitValue: 8500,
      valueImpact: 25500,
      reason: 'System Error Correction',
      createdBy: 'Sarah Johnson',
      status: 'approved',
      batchNumber: 'BATCH-2025-003'
    },
    {
      id: 3,
      adjustmentNumber: 'QTY-ADJ-003',
      date: '2025-01-18',
      warehouse: 'FG Store',
      itemCode: 'FG-008',
      itemName: 'Excavator Model EX200',
      category: 'Finished Goods',
      currentQty: 8,
      adjustedQty: 12,
      adjustment: 4,
      adjustmentType: 'increase',
      unitValue: 450000,
      valueImpact: 1800000,
      reason: 'Cycle Count Adjustment',
      createdBy: 'Robert Lee',
      status: 'approved'
    },
    {
      id: 4,
      adjustmentNumber: 'QTY-ADJ-004',
      date: '2025-01-19',
      warehouse: 'Main Warehouse',
      itemCode: 'ITM-012',
      itemName: 'Bearing Assembly',
      category: 'Component',
      currentQty: 225,
      adjustedQty: 218,
      adjustment: -7,
      adjustmentType: 'decrease',
      unitValue: 1200,
      valueImpact: -8400,
      reason: 'Physical Count Variance',
      createdBy: 'Emily Chen',
      status: 'draft',
      batchNumber: 'BATCH-2025-005'
    },
    {
      id: 5,
      adjustmentNumber: 'QTY-ADJ-005',
      date: '2025-01-20',
      warehouse: 'Assembly Plant',
      itemCode: 'ITM-018',
      itemName: 'Control Panel',
      category: 'Component',
      currentQty: 65,
      adjustedQty: 68,
      adjustment: 3,
      adjustmentType: 'increase',
      unitValue: 12000,
      valueImpact: 36000,
      reason: 'Receipt Not Recorded',
      createdBy: 'Mike Davis',
      status: 'approved',
      batchNumber: 'BATCH-2025-007'
    }
  ]);

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
  const totalIncreases = adjustments.filter(a => a.adjustmentType === 'increase').reduce((sum, a) => sum + a.adjustment, 0);
  const totalDecreases = adjustments.filter(a => a.adjustmentType === 'decrease').reduce((sum, a) => sum + Math.abs(a.adjustment), 0);
  const netValueImpact = adjustments.reduce((sum, a) => sum + a.valueImpact, 0);

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
            <Package className="w-8 h-8 text-blue-600" />
            <span>Quantity Adjustments</span>
          </h1>
          <p className="text-gray-600 mt-1">Track inventory quantity adjustments and variances</p>
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalAdjustments}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Adjustments</div>
          <div className="text-xs text-blue-600 mt-1">All Time</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">+{totalIncreases}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Increases</div>
          <div className="text-xs text-green-600 mt-1">Units Added</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">-{totalDecreases}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Total Decreases</div>
          <div className="text-xs text-red-600 mt-1">Units Removed</div>
        </div>

        <div className={`bg-gradient-to-br ${netValueImpact >= 0 ? 'from-purple-50 to-purple-100 border-purple-200' : 'from-orange-50 to-orange-100 border-orange-200'} rounded-lg p-3 border`}>
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className={`w-8 h-8 ${netValueImpact >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
            <span className={`text-2xl font-bold ${netValueImpact >= 0 ? 'text-purple-900' : 'text-orange-900'}`}>
              ₹{Math.abs(netValueImpact / 100000).toFixed(1)}L
            </span>
          </div>
          <div className={`text-sm font-medium ${netValueImpact >= 0 ? 'text-purple-700' : 'text-orange-700'}`}>Net Value Impact</div>
          <div className={`text-xs ${netValueImpact >= 0 ? 'text-purple-600' : 'text-orange-600'} mt-1`}>
            {netValueImpact >= 0 ? 'Increase' : 'Decrease'}
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjusted Qty</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Impact</th>
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
                    {adj.batchNumber && (
                      <div className="text-xs text-blue-600 mt-1">Batch: {adj.batchNumber}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Warehouse className="w-4 h-4 text-gray-400" />
                      <span>{adj.warehouse}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {adj.currentQty}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {adj.adjustedQty}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className={`flex items-center space-x-1 font-bold ${adj.adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {adj.adjustmentType === 'increase' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span>{adj.adjustment >= 0 ? '+' : ''}{adj.adjustment}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span className={`font-medium ${adj.valueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(adj.valueImpact / 1000).toFixed(1)}K
                    </span>
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
                    <button
                      onClick={() => handleCreateAdjustment(adj)}
                      disabled={submittingId === adj.id}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 disabled:opacity-50"
                    >
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
            <Package className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No quantity adjustments found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
