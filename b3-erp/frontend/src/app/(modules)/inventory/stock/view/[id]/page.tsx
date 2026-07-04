'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, Package, MapPin, Calendar, TrendingUp,
  TrendingDown, AlertTriangle, DollarSign, BarChart3,
  Warehouse, RefreshCw, ShoppingCart, Truck, Clock,
  CheckCircle, XCircle, Activity, FileText, Download,
  PieChart, Target, Zap, ArrowRight, Box, Layers
} from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface StockItem {
  id: string;
  itemCode: string;
  itemName: string;
  description: string;
  category: string;
  subCategory: string;
  uom: string;
  hsnCode: string;
  currentStock: number;
  committedStock: number;
  availableStock: number;
  reorderLevel: number;
  safetyStock: number;
  maxLevel: number;
  leadTimeDays: number;
  unitCost: number;
  avgCost: number;
  totalValue: number;
  location: string;
  warehouse: string;
  bin: string;
  batchEnabled: boolean;
  serialEnabled: boolean;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
  lastReceived: string;
  lastIssued: string;
  lastCounted: string;
  createdBy: string;
  createdDate: string;
  modifiedBy: string;
  modifiedDate: string;
}

interface StockTransaction {
  id: string;
  date: string;
  time: string;
  transactionType: 'receipt' | 'issue' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return';
  referenceNo: string;
  quantity: number;
  balanceAfter: number;
  reason: string;
  performedBy: string;
  remarks?: string;
}

interface StockLocation {
  warehouse: string;
  zone: string;
  aisle: string;
  rack: string;
  bin: string;
  quantity: number;
  lastCounted: string;
}

interface ReorderHistory {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  quantity: number;
  receivedQty: number;
  status: 'pending' | 'partial' | 'received' | 'cancelled';
  unitPrice: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export default function StockViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'locations' | 'activity' | 'analytics'>('overview');

  const defaultStockItem: StockItem = {
    id: params.id,
    itemCode: '',
    itemName: '',
    description: '',
    category: '',
    subCategory: '',
    uom: '',
    hsnCode: '',
    currentStock: 0,
    committedStock: 0,
    availableStock: 0,
    reorderLevel: 0,
    safetyStock: 0,
    maxLevel: 0,
    leadTimeDays: 0,
    unitCost: 0,
    avgCost: 0,
    totalValue: 0,
    location: '',
    warehouse: '',
    bin: '',
    batchEnabled: false,
    serialEnabled: false,
    status: 'in_stock',
    lastReceived: '',
    lastIssued: '',
    lastCounted: '',
    createdBy: '',
    createdDate: '',
    modifiedBy: '',
    modifiedDate: '',
  };

  const [stockItem, setStockItem] = useState<StockItem>(defaultStockItem);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stockLocations, setStockLocations] = useState<any[]>([]);
  const [reorderHistory, setReorderHistory] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [balance, locations] = await Promise.all([
          inventoryService.getStockBalance(params.id).catch(() => null),
          inventoryService.getStockLocations().catch(() => [] as any[]),
        ]);

        if (balance && typeof balance === 'object') {
          const available = Number(balance.availableQuantity ?? 0);
          const committed = Number(balance.committedQuantity ?? 0);
          const total = Number(balance.totalQuantity ?? available + committed);
          const belowReorder = Boolean(balance.belowReorderLevel);
          const status: StockItem['status'] =
            total <= 0 ? 'out_of_stock' : belowReorder ? 'low_stock' : 'in_stock';
          const mappedItem: StockItem = {
            id: balance.id ?? params.id,
            itemCode: balance.itemCode ?? '',
            itemName: balance.itemName ?? '',
            description: balance.description ?? '',
            category: balance.itemCategory ?? '',
            subCategory: balance.itemGroup ?? '',
            uom: balance.uom ?? '',
            hsnCode: balance.hsnCode ?? '',
            currentStock: total,
            committedStock: committed,
            availableStock: Number(balance.freeQuantity ?? available),
            reorderLevel: Number(balance.reorderLevel ?? 0),
            safetyStock: Number(balance.safetyStock ?? 0),
            maxLevel: Number(balance.maximumOrderQuantity ?? 0),
            leadTimeDays: Number(balance.leadTimeDays ?? 0),
            unitCost: Number(balance.valuationRate ?? 0),
            avgCost: Number(balance.valuationRate ?? 0),
            totalValue: Number(balance.stockValue ?? 0),
            location: balance.locationName ?? '',
            warehouse: balance.warehouseName ?? '',
            bin: balance.locationName ?? '',
            batchEnabled: Boolean(balance.batchNumber),
            serialEnabled: Boolean(balance.serialNumber),
            status,
            lastReceived: balance.lastReceiptDate ?? '',
            lastIssued: balance.lastIssueDate ?? '',
            lastCounted: balance.lastCycleCountDate ?? '',
            createdBy: balance.updatedBy ?? '',
            createdDate: balance.createdAt ?? '',
            modifiedBy: balance.updatedBy ?? '',
            modifiedDate: balance.updatedAt ?? '',
          };
          if (!cancelled) setStockItem(mappedItem);

          // Sub-arrays if the balance detail happens to carry them; else default [].
          if (!cancelled) {
            setTransactions(Array.isArray(balance.transactions) ? balance.transactions : []);
            setReorderHistory(Array.isArray(balance.reorderHistory) ? balance.reorderHistory : []);
            setActivityLog(Array.isArray(balance.activityLog) ? balance.activityLog : []);
          }
        }

        const mappedLocations = (Array.isArray(locations) ? locations : []).map((l: any) => ({
          warehouse: l.locationName ?? l.warehouseId ?? '',
          zone: l.zone ?? '',
          aisle: l.aisle ?? '',
          rack: l.rack ?? '',
          bin: l.bin ?? '',
          quantity: Number(l.currentCapacity ?? 0),
          lastCounted: l.lastStockTakeDate ?? '',
        }));
        if (!cancelled) setStockLocations(mappedLocations);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load stock item');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'overstock': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="w-5 h-5" />;
      case 'low_stock': return <AlertTriangle className="w-5 h-5" />;
      case 'out_of_stock': return <XCircle className="w-5 h-5" />;
      case 'overstock': return <TrendingUp className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'receipt': return 'bg-green-100 text-green-700';
      case 'issue': return 'bg-red-100 text-red-700';
      case 'transfer_in': return 'bg-blue-100 text-blue-700';
      case 'transfer_out': return 'bg-orange-100 text-orange-700';
      case 'adjustment': return 'bg-purple-100 text-purple-700';
      case 'return': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'receipt': return 'Receipt';
      case 'issue': return 'Issue';
      case 'transfer_in': return 'Transfer In';
      case 'transfer_out': return 'Transfer Out';
      case 'adjustment': return 'Adjustment';
      case 'return': return 'Return';
      default: return type;
    }
  };

  const stockUtilization = ((stockItem.currentStock - stockItem.safetyStock) / (stockItem.maxLevel - stockItem.safetyStock) * 100).toFixed(1);
  const turnoverRatio = 12.5; // Mock calculation
  const daysToReorder = Math.ceil((stockItem.currentStock - stockItem.reorderLevel) / (stockItem.currentStock / 30));

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{stockItem.itemName}</h1>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(stockItem.status)}`}>
                {getStatusIcon(stockItem.status)}
                {stockItem.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span className="font-mono font-semibold">{stockItem.itemCode}</span>
              </span>
              <span>•</span>
              <span>{stockItem.category} / {stockItem.subCategory}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {stockItem.location}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => router.push(`/inventory/stock/edit/${params.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Stock Item
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold mb-1">{stockItem.currentStock.toLocaleString()}</div>
          <div className="text-blue-100 text-sm">Current Stock ({stockItem.uom})</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-sm text-green-100">Available</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stockItem.availableStock.toLocaleString()}</div>
          <div className="text-green-100 text-sm">After Commitments</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <span className="text-sm text-orange-100">Reserved</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stockItem.committedStock.toLocaleString()}</div>
          <div className="text-orange-100 text-sm">Committed Stock</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm text-purple-100">INR</span>
          </div>
          <div className="text-3xl font-bold mb-1">₹{(stockItem.totalValue / 1000).toFixed(0)}K</div>
          <div className="text-purple-100 text-sm">Total Value</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-sm text-red-100">Min Level</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stockItem.reorderLevel.toLocaleString()}</div>
          <div className="text-red-100 text-sm">Reorder Level</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Transactions
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Storage Locations
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Stock Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Item Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Item Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Item Code</span>
                  <span className="font-mono font-semibold text-gray-900">{stockItem.itemCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Item Name</span>
                  <span className="font-semibold text-gray-900">{stockItem.itemName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{stockItem.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Sub-Category</span>
                  <span className="font-medium text-gray-900">{stockItem.subCategory}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Unit of Measure</span>
                  <span className="font-medium text-gray-900">{stockItem.uom}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">HSN Code</span>
                  <span className="font-mono font-medium text-gray-900">{stockItem.hsnCode}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Batch/Serial Tracking</span>
                  <span className="font-medium text-gray-900">
                    {stockItem.batchEnabled ? 'Batch Enabled' : ''} {stockItem.serialEnabled ? '• Serial Enabled' : ''}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">Description:</p>
                <p className="text-sm text-gray-700 leading-relaxed">{stockItem.description}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Stock Levels & Planning
              </h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className="text-sm font-bold text-gray-900">{stockItem.currentStock} {stockItem.uom}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ width: `${Math.min((stockItem.currentStock / stockItem.maxLevel) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-green-600 mb-1">Safety Stock</div>
                    <div className="text-lg font-bold text-green-900">{stockItem.safetyStock} {stockItem.uom}</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-xs text-yellow-600 mb-1">Reorder Level</div>
                    <div className="text-lg font-bold text-yellow-900">{stockItem.reorderLevel} {stockItem.uom}</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-600 mb-1">Max Level</div>
                    <div className="text-lg font-bold text-blue-900">{stockItem.maxLevel} {stockItem.uom}</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-xs text-purple-600 mb-1">Lead Time</div>
                    <div className="text-lg font-bold text-purple-900">{stockItem.leadTimeDays} days</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Committed Stock</span>
                    <span className="text-sm font-semibold text-orange-600">{stockItem.committedStock} {stockItem.uom}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-600">Available Stock</span>
                    <span className="text-sm font-semibold text-green-600">{stockItem.availableStock} {stockItem.uom}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Costing & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Costing Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Current Unit Cost</span>
                  <span className="font-semibold text-gray-900">₹{stockItem.unitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Average Cost</span>
                  <span className="font-semibold text-gray-900">₹{stockItem.avgCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Stock Value</span>
                  <span className="font-bold text-lg text-purple-700">₹{stockItem.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Cost Variance</span>
                  <span className="font-semibold text-green-600">
                    +₹{(stockItem.unitCost - stockItem.avgCost).toFixed(2)} ({((stockItem.unitCost - stockItem.avgCost) / stockItem.avgCost * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">Stock Utilization</div>
                  <div className="text-xl font-bold text-blue-900">{stockUtilization}%</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xs text-green-600 mb-1">Turnover Ratio</div>
                  <div className="text-xl font-bold text-green-900">{turnoverRatio}x</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xs text-orange-600 mb-1">Days to Reorder</div>
                  <div className="text-xl font-bold text-orange-900">{daysToReorder}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-orange-600" />
                Storage Location
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Primary Warehouse</span>
                  <span className="font-semibold text-gray-900">{stockItem.warehouse}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Full Location Code</span>
                  <span className="font-mono font-semibold text-gray-900">{stockItem.location}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Bin Number</span>
                  <span className="font-mono font-semibold text-gray-900">{stockItem.bin}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Storage Locations</span>
                  <span className="font-semibold text-blue-600">{stockLocations.length} locations</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Received</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {stockItem.lastReceived}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Issued</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {stockItem.lastIssued}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Counted</span>
                    <span className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {stockItem.lastCounted}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reorder History */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Recent Purchase Orders
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">PO Number</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Supplier</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Expected Date</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Received</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reorderHistory.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium text-blue-600">{order.poNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{order.supplier}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{order.orderDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{order.expectedDate}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-gray-900">{order.quantity}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-green-600">{order.receivedQty}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-gray-900">₹{order.unitPrice.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'received' ? 'bg-green-100 text-green-700' :
                          order.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Stock Transaction History
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export Transactions
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference No</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Balance After</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Performed By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{txn.date}</div>
                      <div className="text-xs text-gray-500">{txn.time}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getTransactionTypeColor(txn.transactionType)}`}>
                        {getTransactionTypeLabel(txn.transactionType)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-blue-600">{txn.referenceNo}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-bold ${txn.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.quantity > 0 ? '+' : ''}{txn.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-gray-900">{txn.balanceAfter}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">{txn.reason}</div>
                      {txn.remarks && <div className="text-xs text-gray-500 mt-1">{txn.remarks}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{txn.performedBy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-orange-600" />
              Storage Locations & Distribution
            </h3>
            <div className="text-sm text-gray-600">
              Total Locations: <span className="font-bold text-gray-900">{stockLocations.length}</span>
            </div>
          </div>
          <div className="space-y-2">
            {stockLocations.map((location, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{location.warehouse}</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2 ml-8">
                      <div>
                        <div className="text-xs text-gray-500">Zone</div>
                        <div className="font-mono font-semibold text-gray-900">{location.zone}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Aisle</div>
                        <div className="font-mono font-semibold text-gray-900">{location.aisle}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Rack</div>
                        <div className="font-mono font-semibold text-gray-900">{location.rack}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Bin</div>
                        <div className="font-mono font-semibold text-gray-900">{location.bin}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{location.quantity}</div>
                    <div className="text-xs text-gray-500">Last Count: {location.lastCounted}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location Code:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      RM-{location.zone}-{location.aisle}-{location.rack}-{location.bin}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Warehouse className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Multi-Location Storage</h4>
                <p className="text-sm text-blue-700">
                  This item is stored across {stockLocations.length} different locations for better accessibility and space optimization.
                  Primary location holds {stockLocations[0]?.quantity ?? 0} {stockItem.uom} ({stockItem.currentStock > 0 ? (((stockLocations[0]?.quantity ?? 0) / stockItem.currentStock) * 100).toFixed(1) : '0.0'}% of total stock).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Activity Timeline
          </h3>
          <div className="space-y-2">
            {activityLog.map((log, index) => (
              <div key={log.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    log.status === 'success' ? 'bg-green-100 text-green-600' :
                    log.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {log.status === 'success' ? <CheckCircle className="w-5 h-5" /> :
                     log.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                     <XCircle className="w-5 h-5" />}
                  </div>
                  {index < activityLog.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{log.action}</h4>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{log.details}</p>
                  <p className="text-xs text-gray-500">by {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-3">
          {/* Stock Aging Analysis */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Stock Aging & Turnover Analysis
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw className="w-8 h-8 text-green-600" />
                  <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">Fast Moving</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Inventory Turnover</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">12.5x</div>
                <div className="text-xs text-gray-500">times per year</div>
                <div className="mt-4 bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Days Inventory Outstanding (DIO)</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">29 days</span>
                    <span className="text-xs text-green-600">Industry: 45 days</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">Average</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Average Stock Age</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">18 days</div>
                <div className="text-xs text-gray-500">current batch</div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">0-30 days:</span>
                    <span className="font-semibold text-green-600">85% (2,082 {stockItem.uom})</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">31-60 days:</span>
                    <span className="font-semibold text-yellow-600">12% (294 {stockItem.uom})</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">60+ days:</span>
                    <span className="font-semibold text-red-600">3% (74 {stockItem.uom})</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">Efficient</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Carrying Cost</div>
                <div className="text-3xl font-bold text-gray-900 mb-1">₹2.8K</div>
                <div className="text-xs text-gray-500">per month</div>
                <div className="mt-4 bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-2">Annual Cost Breakdown</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Storage:</span>
                      <span className="font-semibold">₹18,500</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Insurance:</span>
                      <span className="font-semibold">₹8,200</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Handling:</span>
                      <span className="font-semibold">₹7,100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demand Forecasting & Reorder Optimization */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Demand Forecast & Reorder Planning
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Next 30 Days Forecast</span>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">AI Predicted</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Expected Demand</div>
                      <div className="text-2xl font-bold text-emerald-600">1,850</div>
                      <div className="text-xs text-gray-500">{stockItem.uom}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Confidence</div>
                      <div className="text-2xl font-bold text-blue-600">94%</div>
                      <div className="text-xs text-gray-500">accuracy</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Safety Buffer</div>
                      <div className="text-2xl font-bold text-orange-600">+15%</div>
                      <div className="text-xs text-gray-500">cushion</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Economic Order Quantity (EOQ)</div>
                        <div className="text-xs text-gray-500">Optimal order size</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">625 {stockItem.uom}</div>
                      <div className="text-xs text-green-600">Min cost point</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Reorder Point</div>
                        <div className="text-xs text-gray-500">Trigger threshold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">500 {stockItem.uom}</div>
                      <div className="text-xs text-orange-600">Current: Above ✓</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Next Order Due</div>
                        <div className="text-xs text-gray-500">Based on consumption</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">Nov 22, 2025</div>
                      <div className="text-xs text-gray-600">30 days away</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Smart Recommendations</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Order 625 {stockItem.uom} when stock reaches 500 {stockItem.uom} to minimize costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Consider bulk discount: 10% off on orders above 800 {stockItem.uom} from Tata Steel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Monitor 74 {stockItem.uom} of aging stock (60+ days) for potential write-off</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Stock Valuation & Cost Analysis
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Current Stock Value</span>
                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">At Avg Cost</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Total Value</div>
                      <div className="text-2xl font-bold text-indigo-600">₹4.54L</div>
                      <div className="text-xs text-gray-500">2,450 {stockItem.uom} @ ₹185.50</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Available Value</div>
                      <div className="text-2xl font-bold text-green-600">₹2.97L</div>
                      <div className="text-xs text-gray-500">1,600 {stockItem.uom} uncommitted</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Cost Price Trend (Last 90 Days)</span>
                      <span className="text-sm font-bold text-green-600">+2.1%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        <div>Min: ₹180.00</div>
                        <div>Max: ₹185.50</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 mb-2 font-semibold">Valuation Methods Comparison</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">FIFO (First In First Out)</span>
                        <span className="text-sm font-bold text-gray-900">₹4.54L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">LIFO (Last In First Out)</span>
                        <span className="text-sm font-bold text-gray-900">₹4.48L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Weighted Average</span>
                        <span className="text-sm font-bold text-blue-600">₹4.47L ✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-700">Price Variance Analysis</span>
                      <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">+1.5%</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Standard Cost:</span>
                        <span className="font-semibold">₹182.75</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actual Cost:</span>
                        <span className="font-semibold">₹185.50</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Variance:</span>
                        <span className="font-semibold text-orange-600">+₹2.75 per {stockItem.uom}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700">Cost Savings Opportunities</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Bulk Order Discount</div>
                      <div className="text-lg font-bold text-green-600">₹18.5K</div>
                      <div className="text-xs text-gray-500">10% on 800+ {stockItem.uom}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Reduced Carrying Cost</div>
                      <div className="text-lg font-bold text-blue-600">₹5.2K</div>
                      <div className="text-xs text-gray-500">JIT optimization</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ABC Analysis & Stock Classification */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              ABC Analysis & Stock Classification
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-red-600">A</span>
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">High Value</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">Classification</div>
                <div className="text-xs text-gray-500 mb-3">Tight control, frequent review</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value Contribution:</span>
                    <span className="font-bold text-red-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold">15% of SKUs</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-yellow-600">B</span>
                  <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">Medium Value</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">Classification</div>
                <div className="text-xs text-gray-500 mb-3">Moderate control, regular review</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value Contribution:</span>
                    <span className="font-bold text-yellow-600">17%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold">30% of SKUs</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-green-600">C</span>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">Low Value</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">Classification</div>
                <div className="text-xs text-gray-500 mb-3">Basic control, periodic review</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value Contribution:</span>
                    <span className="font-bold text-green-600">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-semibold">55% of SKUs</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <Box className="w-8 h-8 text-blue-600" />
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm text-gray-600 mb-1">This Item Status</div>
                <div className="text-2xl font-bold text-red-600 mb-1">Class A</div>
                <div className="text-xs text-gray-500 mb-2">Critical item - high value</div>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Fast moving, tight control required</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Created By: </span>
            <span className="font-medium text-gray-900">{stockItem.createdBy}</span>
            <span className="text-gray-500 ml-2">{stockItem.createdDate}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Modified By: </span>
            <span className="font-medium text-gray-900">{stockItem.modifiedBy}</span>
            <span className="text-gray-500 ml-2">{stockItem.modifiedDate}</span>
          </div>
          <div>
            <span className="text-gray-600">Stock ID: </span>
            <span className="font-mono font-medium text-gray-900">{stockItem.id}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-600">Last Sync: </span>
            <span className="font-medium text-gray-900">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
