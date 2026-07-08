'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface ApprovalItem {
  id: number;
  backendId?: string;
  adjustmentNumber: string;
  submittedDate: string;
  submittedBy: string;
  warehouse: string;
  adjustmentType: 'quantity' | 'value' | 'write-off';
  itemsCount: number;
  valueImpact: number;
  impactType: 'increase' | 'decrease';
  reason: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'under-review' | 'approved' | 'rejected';
  approver?: string;
  reviewDate?: string;
  comments?: string;
}

export default function AdjustmentApprovalsPage() {
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('pending');

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  const loadApprovals = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await inventoryService.getStockAdjustments()) as any[];
      const typeMap: Record<string, ApprovalItem['adjustmentType']> = {
        Quantity: 'quantity', QUANTITY: 'quantity', 'Physical Inventory': 'quantity', 'Cycle Count': 'quantity',
        Value: 'value', VALUE: 'value', Revaluation: 'value',
        WriteOff: 'write-off', 'Write-Off': 'write-off', 'Write Off': 'write-off', WRITE_OFF: 'write-off', Damage: 'write-off',
      };
      const statusMap: Record<string, ApprovalItem['status']> = {
        PendingApproval: 'pending', PENDING_APPROVAL: 'pending', Pending: 'pending', Submitted: 'pending',
        UnderReview: 'under-review', 'Under Review': 'under-review',
        Approved: 'approved', APPROVED: 'approved', Posted: 'approved',
        Rejected: 'rejected', REJECTED: 'rejected',
      };
      const toDate = (d: any): string => (d ? String(d).split('T')[0] : '');
      const mapped: ApprovalItem[] = raw
        .map((a, idx) => {
          const total = Number(a.totalAdjustmentValue ?? 0);
          const status = statusMap[a.status] ?? 'pending';
          return {
            id: idx + 1,
            backendId: a.id != null ? String(a.id) : undefined,
            adjustmentNumber: a.adjustmentNumber ?? '',
            submittedDate: toDate(a.submittedAt ?? a.adjustmentDate),
            submittedBy: a.submittedByName ?? a.createdByName ?? a.createdBy ?? '-',
            warehouse: a.warehouseName ?? a.warehouseId ?? '-',
            adjustmentType: typeMap[a.adjustmentType] ?? 'quantity',
            itemsCount: Number(a.itemsCount ?? (Array.isArray(a.lines) ? a.lines.length : Array.isArray(a.items) ? a.items.length : 0)),
            valueImpact: Math.abs(total),
            impactType: total < 0 ? 'decrease' : 'increase',
            reason: a.referenceType ?? a.approvalRemarks ?? '-',
            priority: (Math.abs(total) >= 50000 ? 'high' : Math.abs(total) >= 20000 ? 'medium' : 'low') as ApprovalItem['priority'],
            status,
            approver: a.approvedByName ?? undefined,
            reviewDate: toDate(a.approvedAt) || undefined,
            comments: a.approvalRemarks ?? undefined,
          };
        });
      setApprovals(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load adjustment approvals');
      setApprovals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'under-review':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quantity':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'value':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'write-off':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleApprove = async (id: number) => {
    const target = approvals.find(a => a.id === id);
    if (!target) return;
    if (!target.backendId) {
      alert('Cannot approve: missing adjustment identifier.');
      return;
    }
    if (actioningId !== null) return;
    setActioningId(id);
    try {
      await inventoryService.approveStockAdjustment(target.backendId);
      await loadApprovals();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve adjustment.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id: number) => {
    const target = approvals.find(a => a.id === id);
    if (!target) return;
    if (!target.backendId) {
      alert('Cannot reject: missing adjustment identifier.');
      return;
    }
    if (actioningId !== null) return;
    const reason = window.prompt('Reason for rejection (optional):') ?? undefined;
    setActioningId(id);
    try {
      await inventoryService.rejectStockAdjustment(target.backendId, reason);
      await loadApprovals();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject adjustment.');
    } finally {
      setActioningId(null);
    }
  };

  const totalPending = approvals.filter(a => a.status === 'pending').length;
  const underReview = approvals.filter(a => a.status === 'under-review').length;
  const approvedToday = approvals.filter(a => a.status === 'approved' && a.reviewDate === new Date().toISOString().split('T')[0]).length;
  const highPriority = approvals.filter(a => a.priority === 'high' && a.status === 'pending').length;

  const filteredApprovals = approvals.filter(approval => {
    const matchesPriority = selectedPriority === 'all' || approval.priority === selectedPriority;
    const matchesType = selectedType === 'all' || approval.adjustmentType === selectedType;
    const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus;
    
    return matchesPriority && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <span>Adjustment Approvals</span>
          </h1>
          <p className="text-gray-600 mt-1">Review and approve inventory adjustments</p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading adjustment approvals…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && approvals.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No adjustments awaiting review.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{totalPending}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">Pending Approval</div>
          <div className="text-xs text-yellow-600 mt-1">Awaiting Action</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{underReview}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Under Review</div>
          <div className="text-xs text-blue-600 mt-1">In Progress</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{approvedToday}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Approved Today</div>
          <div className="text-xs text-green-600 mt-1">Today's Actions</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <span className="text-2xl font-bold text-red-900">{highPriority}</span>
          </div>
          <div className="text-sm font-medium text-red-700">High Priority</div>
          <div className="text-xs text-red-600 mt-1">Urgent Actions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="quantity">Quantity</option>
            <option value="value">Value</option>
            <option value="write-off">Write-Off</option>
          </select>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adjustment #</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Impact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.map((approval) => (
                <tr key={approval.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                    {approval.adjustmentNumber}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{approval.submittedDate}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{approval.submittedBy}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {approval.warehouse}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(approval.adjustmentType)}`}>
                      {approval.adjustmentType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{approval.reason}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    {approval.itemsCount} items
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className={`flex items-center space-x-1 ${approval.impactType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {approval.impactType === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-medium">₹{(approval.valueImpact / 1000).toFixed(1)}K</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getPriorityColor(approval.priority)}`}>
                      {approval.priority === 'high' && <AlertCircle className="w-3 h-3" />}
                      <span className="uppercase">{approval.priority}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(approval.status)}`}>
                      {approval.status.replace('-', ' ').toUpperCase()}
                    </span>
                    {approval.approver && (
                      <div className="text-xs text-gray-500 mt-1">
                        By {approval.approver}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    {approval.status === 'pending' || approval.status === 'under-review' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(approval.id)}
                          disabled={actioningId !== null}
                          className="text-green-600 hover:text-green-800 flex items-center space-x-1 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          disabled={actioningId !== null}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApprovals.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-500">No approvals found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
