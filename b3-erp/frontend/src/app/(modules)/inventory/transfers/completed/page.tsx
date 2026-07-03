'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  TruckIcon,
  Calendar,
  User,
  Package,
  Download,
  Search,
  Filter,
  Eye,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { stockTransferService } from '@/services/stock-transfer.service';

interface CompletedTransfer {
  id: number;
  transferNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  requestedBy: string;
  requestDate: string;
  completedDate: string;
  itemCount: number;
  totalQuantity: number;
  receivedBy: string;
  transportMode: string;
  status: 'completed' | 'partially-received';
}

export default function CompletedTransfersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const [completedTransfers, setCompletedTransfers] = useState<CompletedTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the raw StockTransfer ORM shape. Keep only completed
        // transfers and map the fields onto this page's CompletedTransfer model.
        const raw = (await stockTransferService.getAllTransfers()) as any[];
        const dateOnly = (v: any) => (v ? String(v).slice(0, 10) : '');
        const mapped: CompletedTransfer[] = (raw || [])
          .filter((t) => {
            const s = String(t?.status ?? '').toUpperCase();
            return s === 'COMPLETED' || s === 'RECEIVED';
          })
          .map((t, index) => ({
            id: t.id ?? index + 1,
            transferNumber: t.transferNumber ?? '',
            fromWarehouse: t.sourceWarehouseName ?? t.sourceWarehouseId ?? '',
            toWarehouse: t.targetWarehouseName ?? t.targetWarehouseId ?? '',
            requestedBy: t.requestedByName ?? t.requestedBy ?? '',
            requestDate: dateOnly(t.requestDate),
            completedDate: dateOnly(t.receivedAt ?? t.actualArrivalDate ?? t.updatedAt),
            itemCount: Number(t.totalItems ?? (Array.isArray(t.items) ? t.items.length : 0)),
            totalQuantity: Number(t.totalReceivedQuantity ?? t.totalRequestedQuantity ?? 0),
            receivedBy: t.receivedByName ?? t.receivedBy ?? '',
            transportMode: t.shippingMethod ?? '',
            status:
              Number(t.totalReceivedQuantity ?? 0) > 0 &&
              Number(t.totalReceivedQuantity ?? 0) < Number(t.totalRequestedQuantity ?? 0)
                ? 'partially-received'
                : 'completed',
          }));
        if (!cancelled) setCompletedTransfers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load completed transfers');
          setCompletedTransfers([]);
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
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalCompleted = completedTransfers.length;
  const fullyReceived = completedTransfers.filter(t => t.status === 'completed').length;
  const partiallyReceived = completedTransfers.filter(t => t.status === 'partially-received').length;
  const totalItems = completedTransfers.reduce((sum, t) => sum + t.totalQuantity, 0);

  const filteredTransfers = completedTransfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.fromWarehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.toWarehouse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouse === 'all' ||
                           transfer.fromWarehouse.toLowerCase().includes(selectedWarehouse.toLowerCase()) ||
                           transfer.toWarehouse.toLowerCase().includes(selectedWarehouse.toLowerCase());
    
    return matchesSearch && matchesWarehouse;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span>Completed Transfers</span>
          </h1>
          <p className="text-gray-600 mt-1">View history of completed stock transfers</p>
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
          Loading completed transfers…
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
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{totalCompleted}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Total Completed</div>
          <div className="text-xs text-green-600 mt-1">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <TruckIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{fullyReceived}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Fully Received</div>
          <div className="text-xs text-blue-600 mt-1">100% Complete</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{partiallyReceived}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Partial Receipt</div>
          <div className="text-xs text-yellow-600 mt-1">Pending Items</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{totalItems}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Total Units</div>
          <div className="text-xs text-purple-600 mt-1">Transferred</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-quarter">This Quarter</option>
            <option value="this-year">This Year</option>
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

      {/* Completed Transfers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From → To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Transferred</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport Mode</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transfer.transferNumber}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-medium">{transfer.fromWarehouse}</div>
                        <div className="text-xs text-gray-500">↓</div>
                        <div className="font-medium">{transfer.toWarehouse}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{transfer.requestDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{transfer.completedDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{transfer.itemCount} items</span>
                    </div>
                    <div className="text-xs text-gray-500">{transfer.totalQuantity} units</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{transfer.receivedBy}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <TruckIcon className="w-4 h-4 text-gray-400" />
                      <span>{transfer.transportMode}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(transfer.status)}`}>
                      <CheckCircle className="w-4 h-4" />
                      <span className="capitalize">{transfer.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No completed transfers found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
