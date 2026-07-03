'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TruckIcon,
  Package,
  MapPin,
  User,
  Calendar,
  Search,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react';
import { stockTransferService } from '@/services/stock-transfer.service';

interface PendingTransfer {
  id: number;
  transferNumber: string;
  fromWarehouse: string;
  toWarehouse: string;
  requestedBy: string;
  requestDate: string;
  itemCount: number;
  totalQuantity: number;
  status: 'pending-approval' | 'approved' | 'in-transit' | 'ready-to-ship';
  priority: 'normal' | 'urgent';
  approver: string;
}

export default function PendingTransfersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns the raw StockTransfer ORM shape. Keep only the
        // active (not completed/cancelled/rejected) transfers and map the
        // backend status enum to this page's status union.
        const raw = (await stockTransferService.getAllTransfers()) as any[];
        const dateOnly = (v: any) => (v ? String(v).slice(0, 10) : '');
        const statusMap: Record<string, PendingTransfer['status']> = {
          DRAFT: 'pending-approval',
          SUBMITTED: 'pending-approval',
          APPROVED: 'approved',
          DISPATCHED: 'ready-to-ship',
          IN_TRANSIT: 'in-transit',
        };
        const mapped: PendingTransfer[] = (raw || [])
          .filter((t) => statusMap[String(t?.status ?? '').toUpperCase()])
          .map((t, index) => {
            const s = String(t.status ?? '').toUpperCase();
            const prio = String(t.priority ?? '').toUpperCase();
            return {
              id: t.id ?? index + 1,
              transferNumber: t.transferNumber ?? '',
              fromWarehouse: t.sourceWarehouseName ?? t.sourceWarehouseId ?? '',
              toWarehouse: t.targetWarehouseName ?? t.targetWarehouseId ?? '',
              requestedBy: t.requestedByName ?? t.requestedBy ?? '',
              requestDate: dateOnly(t.requestDate),
              itemCount: Number(t.totalItems ?? (Array.isArray(t.items) ? t.items.length : 0)),
              totalQuantity: Number(t.totalRequestedQuantity ?? 0),
              status: statusMap[s] ?? 'pending-approval',
              priority: prio === 'HIGH' || prio === 'URGENT' ? 'urgent' : 'normal',
              approver: t.approvedByName ?? t.approvedBy ?? '',
            };
          });
        if (!cancelled) setPendingTransfers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load pending transfers');
          setPendingTransfers([]);
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
      case 'pending-approval':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'ready-to-ship':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'in-transit':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending-approval':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'ready-to-ship':
        return <Package className="w-4 h-4" />;
      case 'in-transit':
        return <TruckIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgent'
      ? 'text-red-600 bg-red-50 border-red-200'
      : 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const totalTransfers = pendingTransfers.length;
  const pendingApproval = pendingTransfers.filter(t => t.status === 'pending-approval').length;
  const inTransit = pendingTransfers.filter(t => t.status === 'in-transit').length;
  const approved = pendingTransfers.filter(t => t.status === 'approved').length;

  const filteredTransfers = pendingTransfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.fromWarehouse.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transfer.toWarehouse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || transfer.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span>Pending Transfers</span>
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage active stock transfers</p>
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
          Loading pending transfers…
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
            <TruckIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalTransfers}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Pending</div>
          <div className="text-xs text-blue-600 mt-1">Active Transfers</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{pendingApproval}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Pending Approval</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting Review</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{approved}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Approved</div>
          <div className="text-xs text-green-600 mt-1">Ready to Process</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <TruckIcon className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">{inTransit}</span>
          </div>
          <div className="text-sm font-medium text-purple-700">In Transit</div>
          <div className="text-xs text-purple-600 mt-1">On the Move</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="ready-to-ship">Ready to Ship</option>
            <option value="in-transit">In Transit</option>
          </select>
        </div>
      </div>

      {/* Pending Transfers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From → To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approver</th>
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
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{transfer.requestedBy}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{transfer.requestDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{transfer.itemCount} items</span>
                    </div>
                    <div className="text-xs text-gray-500">{transfer.totalQuantity} units</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(transfer.priority)}`}>
                      <span className="capitalize">{transfer.priority}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      <span className="capitalize">{transfer.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    {transfer.approver}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {transfer.status === 'pending-approval' && (
                        <>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 rounded-lg hover:bg-green-50 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Approve</span>
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !loadError && filteredTransfers.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mb-2 mx-auto" />
            <p className="text-gray-500">No pending transfers found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
