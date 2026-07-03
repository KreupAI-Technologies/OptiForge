'use client';

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Truck,
  Calendar,
  User,
  Package,
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { stockEntryService, StockEntryType } from '@/services/stock-entry.service';

interface Receipt {
  id: number;
  receiptNumber: string;
  receiptDate: string;
  receiptType: 'purchase' | 'transfer' | 'return' | 'production';
  sourceDocument: string;
  warehouse: string;
  supplier?: string;
  receivedBy: string;
  itemCount: number;
  totalQuantity: number;
  status: 'pending' | 'partially-received' | 'completed' | 'quality-hold';
  qcStatus?: 'pending' | 'passed' | 'failed';
  expectedDate?: string;
}

export default function InventoryReceiptPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Receipts on this page are inbound stock entries. Fetch the raw
        // StockEntry ORM shape (RECEIPT + RETURN types) and map onto Receipt.
        const [receiptEntries, returnEntries] = await Promise.all([
          stockEntryService.getAllStockEntries({ entryType: StockEntryType.RECEIPT }),
          stockEntryService.getAllStockEntries({ entryType: StockEntryType.RETURN }),
        ]);
        const raw = [...(receiptEntries || []), ...(returnEntries || [])] as any[];
        const dateOnly = (v: any) => (v ? String(v).slice(0, 10) : '');
        const refToType: Record<string, Receipt['receiptType']> = {
          PURCHASE_ORDER: 'purchase',
          STOCK_TRANSFER: 'transfer',
          WORK_ORDER: 'production',
        };
        const statusMap: Record<string, Receipt['status']> = {
          DRAFT: 'pending',
          SUBMITTED: 'pending',
          PENDING_POST: 'partially-received',
          POSTED: 'completed',
          CANCELLED: 'quality-hold',
        };
        const mapped: Receipt[] = raw.map((e, index) => {
          const entryType = String(e.entryType ?? '').toUpperCase();
          const refType = String(e.referenceType ?? '').toUpperCase();
          const receiptType: Receipt['receiptType'] =
            entryType === 'RETURN' ? 'return' : refToType[refType] ?? 'purchase';
          return {
            id: e.id ?? index + 1,
            receiptNumber: e.entryNumber ?? '',
            receiptDate: dateOnly(e.entryDate),
            receiptType,
            sourceDocument: e.referenceNumber ?? '',
            warehouse: e.warehouseName ?? e.warehouseId ?? '',
            supplier: e.supplierName ?? undefined,
            receivedBy: e.createdByName ?? e.createdBy ?? '',
            itemCount: Number(e.totalItems ?? (Array.isArray(e.items) ? e.items.length : 0)),
            totalQuantity: Number(e.totalQuantity ?? 0),
            status: statusMap[String(e.status ?? '').toUpperCase()] ?? 'pending',
            qcStatus: undefined,
            expectedDate: e.postingDate ? dateOnly(e.postingDate) : undefined,
          };
        });
        if (!cancelled) setReceipts(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load receipts');
          setReceipts([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partially-received':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'quality-hold':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'transfer':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'return':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'production':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQcStatusColor = (status?: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalReceipts = receipts.length;
  const pendingReceipts = receipts.filter(r => r.status === 'pending').length;
  const completedToday = receipts.filter(r => r.status === 'completed' && r.receiptDate === '2025-01-22').length;
  const qualityHold = receipts.filter(r => r.status === 'quality-hold').length;

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         receipt.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (receipt.supplier && receipt.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || receipt.receiptType === selectedType;
    const matchesStatus = selectedStatus === 'all' || receipt.status === selectedStatus;
    const matchesWarehouse = selectedWarehouse === 'all' || receipt.warehouse.toLowerCase().includes(selectedWarehouse.toLowerCase());
    
    return matchesSearch && matchesType && matchesStatus && matchesWarehouse;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <PackageCheck className="w-8 h-8 text-blue-600" />
            <span>Inventory Receipts</span>
          </h1>
          <p className="text-gray-600 mt-1">Track and manage incoming stock receipts</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading receipts…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <PackageCheck className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalReceipts}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Receipts</div>
          <div className="text-xs text-blue-600 mt-1">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{pendingReceipts}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Pending Receipt</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting Processing</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{completedToday}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Completed Today</div>
          <div className="text-xs text-green-600 mt-1">Receipts Processed</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{qualityHold}</span>
          </div>
          <div className="text-sm font-medium text-red-700">Quality Hold</div>
          <div className="text-xs text-red-600 mt-1">Failed QC</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search receipts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="transfer">Transfer</option>
            <option value="return">Return</option>
            <option value="production">Production</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partially-received">Partially Received</option>
            <option value="completed">Completed</option>
            <option value="quality-hold">Quality Hold</option>
          </select>

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
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Document</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier/Source</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items/Quantity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QC Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receipt.receiptNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{receipt.receiptDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(receipt.receiptType)}`}>
                      {receipt.receiptType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {receipt.sourceDocument}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{receipt.warehouse}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>{receipt.supplier || '-'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{receipt.itemCount} items</div>
                        <div className="text-xs text-gray-500">{receipt.totalQuantity} units</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {receipt.qcStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getQcStatusColor(receipt.qcStatus)}`}>
                        {receipt.qcStatus.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(receipt.status)}`}>
                      {receipt.status.replace('-', ' ').toUpperCase()}
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

        {filteredReceipts.length === 0 && (
          <div className="text-center py-12">
            <PackageCheck className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No receipts found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
