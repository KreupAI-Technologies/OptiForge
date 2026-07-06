'use client';

import React, { useState, useEffect } from 'react';
import { inventoryService } from '@/services/InventoryService';
import {
  RefreshCw,
  CheckCircle,
  FileText,
  Calendar,
  User,
  TrendingUp,
  AlertCircle,
  Download,
  Send,
  Clock,
  DollarSign
} from 'lucide-react';

interface ReconciliationAction {
  id: number;
  itemCode: string;
  itemName: string;
  variance: number;
  varianceValue: number;
  uom: string;
  action: 'adjust-inventory' | 'recount' | 'investigate' | 'write-off';
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  notes: string;
  dueDate: string;
}

export default function ReconciliationPage() {
  const [reconciliationActions, setReconciliationActions] = useState<ReconciliationAction[]>([]);

  const loadReconciliation = async () => {
    try {
      const rows = await inventoryService.getCycleCounts();
      if (!Array.isArray(rows)) {
        setReconciliationActions([]);
        return;
      }
      // Reconciliation is relevant for completed/reconciled counts or any with variances found.
      const relevant = rows.filter(r =>
        r?.status === 'completed' ||
        r?.status === 'reconciled' ||
        (Number(r?.variancesFound) || 0) > 0
      );
      const source = relevant.length > 0 ? relevant : rows;

      const mapped: ReconciliationAction[] = source.map((r, idx) => {
        const variance = Number(r?.variancesFound) || 0;
        const status: ReconciliationAction['status'] =
          r?.status === 'reconciled' || r?.status === 'completed'
            ? 'completed'
            : r?.status === 'in-progress'
              ? 'in-progress'
              : 'pending';
        const priority: ReconciliationAction['priority'] =
          variance > 10 ? 'high' : variance > 0 ? 'medium' : 'low';
        return {
          id: idx + 1,
          itemCode: r?.countNumber ?? `CC-${idx + 1}`,
          itemName: r?.title ?? [r?.warehouse, r?.zone].filter(Boolean).join(' / ') ?? 'Cycle Count',
          variance,
          varianceValue: 0,
          uom: 'Items',
          action: 'adjust-inventory',
          assignedTo: r?.assignedTo ?? '-',
          priority,
          status,
          notes: `${r?.itemsCounted ?? 0}/${r?.itemsToCount ?? 0} counted, ${variance} variance(s)`,
          dueDate: r?.scheduledDate ?? '-',
        };
      });
      setReconciliationActions(mapped);
    } catch (err) {
      console.error('Failed to load reconciliation data', err);
      setReconciliationActions([]);
    }
  };

  useEffect(() => {
    loadReconciliation();
  }, []);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'adjust-inventory':
        return 'bg-blue-100 text-blue-800';
      case 'recount':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigate':
        return 'bg-orange-100 text-orange-800';
      case 'write-off':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalActions = reconciliationActions.length;
  const completedActions = reconciliationActions.filter(a => a.status === 'completed').length;
  const pendingActions = reconciliationActions.filter(a => a.status === 'pending').length;
  const inProgressActions = reconciliationActions.filter(a => a.status === 'in-progress').length;
  const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  const totalVarianceValue = reconciliationActions.reduce((sum, a) => sum + a.varianceValue, 0);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <span>Reconciliation - CC-2025-002</span>
          </h1>
          <p className="text-gray-600 mt-1">Resolve variances and update inventory records</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => loadReconciliation()} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Finalize Reconciliation</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">{totalActions}</span>
          </div>
          <div className="text-sm font-medium text-blue-700">Total Actions</div>
          <div className="text-xs text-blue-600 mt-1">To Complete</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">{completedActions}</span>
          </div>
          <div className="text-sm font-medium text-green-700">Completed</div>
          <div className="text-xs text-green-600 mt-1">{completionRate.toFixed(0)}% Done</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-900">{inProgressActions}</span>
          </div>
          <div className="text-sm font-medium text-yellow-700">In Progress</div>
          <div className="text-xs text-yellow-600 mt-1">Active Tasks</div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{pendingActions}</span>
          </div>
          <div className="text-sm font-medium text-gray-700">Pending</div>
          <div className="text-xs text-gray-600 mt-1">Not Started</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">
              ₹{Math.abs(totalVarianceValue / 1000).toFixed(1)}K
            </span>
          </div>
          <div className="text-sm font-medium text-purple-700">Net Variance</div>
          <div className="text-xs text-purple-600 mt-1">
            {totalVarianceValue >= 0 ? 'Surplus' : 'Shortage'}
          </div>
        </div>
      </div>

      {/* Action Type Distribution */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reconciliation Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-900">
              {reconciliationActions.filter(a => a.action === 'adjust-inventory').length}
            </div>
            <div className="text-sm text-blue-700 font-medium mt-1">Inventory Adjustments</div>
            <div className="text-xs text-blue-600 mt-1">Update system records</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-900">
              {reconciliationActions.filter(a => a.action === 'recount').length}
            </div>
            <div className="text-sm text-yellow-700 font-medium mt-1">Recount Required</div>
            <div className="text-xs text-yellow-600 mt-1">Verify physical count</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-900">
              {reconciliationActions.filter(a => a.action === 'investigate').length}
            </div>
            <div className="text-sm text-orange-700 font-medium mt-1">Investigation</div>
            <div className="text-xs text-orange-600 mt-1">Root cause analysis</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-900">
              {reconciliationActions.filter(a => a.action === 'write-off').length}
            </div>
            <div className="text-sm text-red-700 font-medium mt-1">Write-offs</div>
            <div className="text-xs text-red-600 mt-1">Loss/damage/theft</div>
          </div>
        </div>
      </div>

      {/* Reconciliation Actions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value Impact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Required</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reconciliationActions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">
                    <div className="font-medium text-gray-900">{action.itemCode}</div>
                    <div className="text-gray-600">{action.itemName}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {action.variance > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                      )}
                      <span className={`text-sm font-semibold ${action.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {action.variance > 0 ? '+' : ''}{action.variance} {action.uom}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${action.varianceValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{Math.abs(action.varianceValue).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(action.action)}`}>
                      {action.action.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{action.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{action.dueDate}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(action.priority)}`}>
                      <span className="capitalize">{action.priority}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(action.status)}`}>
                      <span className="capitalize">{action.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 max-w-xs truncate">
                    {action.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Summary */}
      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reconciliation Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Cycle Count Number:</span>
              <span className="font-semibold text-gray-900">CC-2025-002</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Count Date:</span>
              <span className="font-semibold text-gray-900">2025-01-21</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Total Variances:</span>
              <span className="font-semibold text-gray-900">{totalActions}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Reconciliation Progress:</span>
              <span className="font-semibold text-green-600">{completionRate.toFixed(0)}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Warehouse:</span>
              <span className="font-semibold text-gray-900">Main Warehouse</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Zone:</span>
              <span className="font-semibold text-gray-900">Zone B - Components</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Reconciliation Value:</span>
              <span className={`font-semibold ${totalVarianceValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(totalVarianceValue).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-yellow-600">In Progress</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Complete all pending investigation and recount actions</li>
            <li>Verify all inventory adjustments are accurate</li>
            <li>Obtain necessary approvals for write-offs</li>
            <li>Update system inventory records</li>
            <li>Document root causes and preventive actions</li>
            <li>Finalize and close the cycle count</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
