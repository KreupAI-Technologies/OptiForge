'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, Monitor, Car, Wrench, Warehouse, FileText,
  Plus, Search, Filter, ChevronRight, AlertCircle,
  CheckCircle, Clock, XCircle, ArrowRight, ArrowLeftRight,
  Clipboard, BarChart3, Settings, Users, Building2
} from 'lucide-react';
import {
  AssetManagementService,
  HRAssetStatus,
  HRAssetCondition,
  AssetCategoryType,
  RequestStatus,
  MaintenanceStatus,
  type HRAsset,
  type AssetCategory,
  type AssetAllocation,
  type AssetRequest,
  type MaintenanceRequest,
  type AMCContract,
  type StockAudit,
  type AssetDashboardStats,
} from '@/services/asset-management.service';
import {
  HrAssetsService,
  type AssetTransfer as HrAssetTransfer,
  type AssetReturn as HrAssetReturn,
  type AssetMaintenance as HrAssetMaintenance,
  type PreventiveMaintenance as HrPreventiveMaintenance,
  type AssetInventory as HrAssetInventory,
  type AssetRequest as HrStockRequest,
  type AssetAllocation as HrAssetAllocation,
  type AssetRegisterReport,
  type EmployeeAssetReport,
  type DepartmentAssetReport,
  type CostSummaryReport,
  type AllocationSummaryReport,
} from '@/services/hr-assets.service';

// ============================================================================
// Types
// ============================================================================

type MainTab = 'allocation' | 'maintenance' | 'inventory' | 'reports';
type AllocationSubTab = 'it_assets' | 'office_assets' | 'vehicles' | 'requests' | 'transfer' | 'return';
type MaintenanceSubTab = 'service_requests' | 'preventive' | 'amc' | 'history';
type InventorySubTab = 'stock' | 'requests' | 'allocation' | 'audit';
type ReportsSubTab = 'register' | 'allocation_report' | 'employee_assets' | 'department_assets' | 'maintenance_costs';

// ============================================================================
// Dashboard Component
// ============================================================================

function AssetDashboard({ stats }: { stats: AssetDashboardStats | null }) {
  if (!stats) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;

  const statCards = [
    { label: 'Total Assets', value: stats.totalAssets, icon: Package, color: 'blue' },
    { label: 'Available', value: stats.assetsByStatus.available || 0, icon: CheckCircle, color: 'green' },
    { label: 'Allocated', value: stats.assetsByStatus.allocated || 0, icon: Users, color: 'purple' },
    { label: 'In Maintenance', value: stats.assetsByStatus.maintenance || 0, icon: Wrench, color: 'orange' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: Clock, color: 'yellow' },
    { label: 'Pending Maintenance', value: stats.pendingMaintenance, icon: AlertCircle, color: 'red' },
    { label: 'Expiring Warranties', value: stats.expiringWarranties, icon: AlertCircle, color: 'amber' },
    { label: 'Expiring AMCs', value: stats.expiringAMCs, icon: FileText, color: 'pink' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats.recentAllocations.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Allocations</h3>
          <div className="space-y-3">
            {stats.recentAllocations.slice(0, 5).map((allocation) => (
              <div key={allocation.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div>
                  <p className="text-white font-medium">{allocation.employeeName}</p>
                  <p className="text-sm text-gray-400">{allocation.allocationNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{allocation.allocatedDate}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    allocation.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {allocation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Asset List Component
// ============================================================================

function AssetList({ categoryType, assets }: { categoryType: AssetCategoryType; assets: HRAsset[] }) {
  const getStatusColor = (status: HRAssetStatus) => {
    switch (status) {
      case HRAssetStatus.AVAILABLE: return 'bg-green-900 text-green-300';
      case HRAssetStatus.ALLOCATED: return 'bg-blue-900 text-blue-300';
      case HRAssetStatus.MAINTENANCE: return 'bg-orange-900 text-orange-300';
      case HRAssetStatus.RETIRED: return 'bg-gray-700 text-gray-300';
      case HRAssetStatus.DISPOSED: return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getConditionColor = (condition: HRAssetCondition) => {
    switch (condition) {
      case HRAssetCondition.NEW: return 'text-green-400';
      case HRAssetCondition.GOOD: return 'text-blue-400';
      case HRAssetCondition.FAIR: return 'text-yellow-400';
      case HRAssetCondition.POOR: return 'text-orange-400';
      case HRAssetCondition.DAMAGED: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">
          {categoryType.replace('_', ' ')}
        </h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Asset
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Brand/Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Assigned To</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No assets found in this category
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{asset.assetCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{asset.assetName}</p>
                      {asset.assetTag && <p className="text-xs text-gray-500">{asset.assetTag}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {asset.brand} {asset.model}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(asset.status)}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${getConditionColor(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {asset.currentEmployeeName || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Asset Requests Component
// ============================================================================

function AssetRequests({ requests }: { requests: AssetRequest[] }) {
  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'bg-yellow-900 text-yellow-300';
      case RequestStatus.APPROVED: return 'bg-green-900 text-green-300';
      case RequestStatus.REJECTED: return 'bg-red-900 text-red-300';
      case RequestStatus.FULFILLED: return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Asset Requests</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Request #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <span className="text-blue-400 font-mono text-sm">{request.requestNumber}</span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white">{request.employeeName}</p>
                    <p className="text-xs text-gray-500">{request.department}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300 capitalize">{request.requestType}</td>
                <td className="px-4 py-3 text-gray-300 capitalize">{request.assetCategory.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm capitalize ${
                    request.priority === 'high' ? 'text-red-400' :
                    request.priority === 'urgent' ? 'text-red-500' :
                    request.priority === 'normal' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {request.status === RequestStatus.PENDING && (
                      <>
                        <button className="text-green-400 hover:text-green-300 text-sm">Approve</button>
                        <button className="text-red-400 hover:text-red-300 text-sm">Reject</button>
                      </>
                    )}
                    <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Maintenance Section Component
// ============================================================================

function MaintenanceSection({ requests }: { requests: MaintenanceRequest[] }) {
  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.OPEN: return 'bg-yellow-900 text-yellow-300';
      case MaintenanceStatus.IN_PROGRESS: return 'bg-blue-900 text-blue-300';
      case MaintenanceStatus.COMPLETED: return 'bg-green-900 text-green-300';
      case MaintenanceStatus.ON_HOLD: return 'bg-orange-900 text-orange-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Service Requests</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Request #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Issue</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reported By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <span className="text-blue-400 font-mono text-sm">{request.requestNumber}</span>
                </td>
                <td className="px-4 py-3 text-gray-300 capitalize">{request.requestType.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span className={`text-sm capitalize ${
                    request.priority === 'critical' ? 'text-red-500' :
                    request.priority === 'high' ? 'text-red-400' :
                    request.priority === 'normal' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm truncate max-w-xs">{request.issueDescription}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{request.reportedByName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// AMC Contracts Component
// ============================================================================

function AMCContractsSection({ contracts }: { contracts: AMCContract[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">AMC Contracts</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          Add Contract
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-medium">{contract.contractName}</h4>
                <p className="text-sm text-gray-400">{contract.contractNumber}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                contract.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
              }`}>
                {contract.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Vendor:</span>
                <span className="text-gray-300">{contract.vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-gray-300 capitalize">{contract.contractType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Value:</span>
                <span className="text-gray-300">₹{contract.contractValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Validity:</span>
                <span className="text-gray-300">{contract.startDate} - {contract.endDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Stock Audit Component
// ============================================================================

function StockAuditSection({ audits }: { audits: StockAudit[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Stock Audits</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          New Audit
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Audit #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {audits.map((audit) => (
              <tr key={audit.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <span className="text-blue-400 font-mono text-sm">{audit.auditNumber}</span>
                </td>
                <td className="px-4 py-3 text-white">{audit.auditName}</td>
                <td className="px-4 py-3 text-gray-300 capitalize">{audit.auditType}</td>
                <td className="px-4 py-3 text-gray-300">{audit.auditDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(audit.itemsAudited / audit.totalItems) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {audit.itemsAudited}/{audit.totalItems}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    audit.status === 'completed' ? 'bg-green-900 text-green-300' :
                    audit.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                    'bg-yellow-900 text-yellow-300'
                  }`}>
                    {audit.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Shared async-section helpers (loading / error / empty)
// ============================================================================

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {action}
    </div>
  );
}

function AsyncTable<T>({
  title,
  state,
  columns,
  emptyText,
  colSpan,
  onRetry,
  children,
}: {
  title: string;
  state: AsyncState<T[]>;
  columns: string[];
  emptyText: string;
  colSpan: number;
  onRetry: () => void;
  children: (rows: T[]) => React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader title={title} />
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {state.loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : state.error ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{state.error}</span>
                    <button onClick={onRetry} className="text-blue-400 hover:text-blue-300 text-sm underline">
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : state.data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              children(state.data)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const money = (v: number | string | undefined | null): string => {
  const n = Number(v);
  return Number.isFinite(n) ? `₹${n.toLocaleString()}` : '-';
};

const statusPill = (status?: string) => (
  <span className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 capitalize">
    {(status || '-').replace(/_/g, ' ')}
  </span>
);

// ============================================================================
// Asset Transfer Section
// ============================================================================

function TransferSection({ state, onRetry }: { state: AsyncState<HrAssetTransfer[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Asset Transfers"
      state={state}
      onRetry={onRetry}
      colSpan={7}
      emptyText="No asset transfers recorded"
      columns={['Transfer #', 'Asset', 'From', 'To', 'Date', 'Reason', 'Status']}
    >
      {(rows) =>
        rows.map((t) => (
          <tr key={t.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{t.transferId || t.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3">
              <p className="text-white">{t.assetTag || '-'}</p>
              <p className="text-xs text-gray-500">{t.assetCategory || t.assetType || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">
              <p>{t.fromEmployee || '-'}</p>
              <p className="text-xs text-gray-500">{t.fromDepartment || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">
              <p>{t.toEmployee || '-'}</p>
              <p className="text-xs text-gray-500">{t.toDepartment || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">{t.initiatedDate || '-'}</td>
            <td className="px-4 py-3 text-gray-300 text-sm truncate max-w-xs">{t.transferReason || '-'}</td>
            <td className="px-4 py-3">{statusPill(t.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Asset Return Section
// ============================================================================

function ReturnSection({ state, onRetry }: { state: AsyncState<HrAssetReturn[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Asset Returns"
      state={state}
      onRetry={onRetry}
      colSpan={7}
      emptyText="No asset returns recorded"
      columns={['Return #', 'Asset', 'Returned By', 'Return Date', 'Condition', 'Damage Charges', 'Status']}
    >
      {(rows) =>
        rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{r.returnId || r.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3">
              <p className="text-white">{r.assetTag || '-'}</p>
              <p className="text-xs text-gray-500">{r.assetCategory || r.assetType || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">
              <p>{r.returnedBy || '-'}</p>
              <p className="text-xs text-gray-500">{r.department || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">{r.returnDate || '-'}</td>
            <td className="px-4 py-3 text-gray-300 capitalize">{r.condition || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.damageCharges)}</td>
            <td className="px-4 py-3">{statusPill(r.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Preventive Maintenance Section
// ============================================================================

function PreventiveSection({ state, onRetry }: { state: AsyncState<HrPreventiveMaintenance[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Preventive Maintenance Schedules"
      state={state}
      onRetry={onRetry}
      colSpan={7}
      emptyText="No preventive maintenance schedules"
      columns={['Schedule #', 'Asset', 'Type', 'Frequency', 'Last', 'Next', 'Status']}
    >
      {(rows) =>
        rows.map((p) => (
          <tr key={p.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{p.scheduleId || p.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3">
              <p className="text-white">{p.assetName || p.assetTag || '-'}</p>
              <p className="text-xs text-gray-500">{p.assetCategory || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300 capitalize">{(p.maintenanceType || '-').replace(/_/g, ' ')}</td>
            <td className="px-4 py-3 text-gray-300 capitalize">{p.frequency || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{p.lastMaintenanceDate || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{p.nextMaintenanceDate || '-'}</td>
            <td className="px-4 py-3">{statusPill(p.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Repair History Section
// ============================================================================

function RepairHistorySection({ state, onRetry }: { state: AsyncState<HrAssetMaintenance[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Repair History"
      state={state}
      onRetry={onRetry}
      colSpan={7}
      emptyText="No repair history records"
      columns={['Ticket #', 'Asset', 'Issue', 'Completed', 'Vendor', 'Cost', 'Status']}
    >
      {(rows) =>
        rows.map((m) => (
          <tr key={m.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{m.ticketId || m.requestId || m.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3">
              <p className="text-white">{m.assetName || m.assetTag || '-'}</p>
              <p className="text-xs text-gray-500">{m.assetCategory || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300 text-sm truncate max-w-xs">
              {m.issueDescription || m.issueType || '-'}
            </td>
            <td className="px-4 py-3 text-gray-300">{m.completionDate || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{m.vendor || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{money(m.cost)}</td>
            <td className="px-4 py-3">{statusPill(m.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Stock Management Section
// ============================================================================

function StockManagementSection({ state, onRetry }: { state: AsyncState<HrAssetInventory[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Stock Management"
      state={state}
      onRetry={onRetry}
      colSpan={8}
      emptyText="No stock records"
      columns={['Code', 'Asset', 'Category', 'Total', 'Allocated', 'Available', 'Value', 'Status']}
    >
      {(rows) =>
        rows.map((s) => (
          <tr key={s.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{s.assetCode || s.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3 text-white">{s.assetName || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{s.category || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{s.totalQuantity ?? 0}</td>
            <td className="px-4 py-3 text-gray-300">{s.allocated ?? 0}</td>
            <td className="px-4 py-3 text-gray-300">{s.available ?? 0}</td>
            <td className="px-4 py-3 text-gray-300">{money(s.totalValue)}</td>
            <td className="px-4 py-3">{statusPill(s.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Stock Requests Section
// ============================================================================

function StockRequestsSection({ state, onRetry }: { state: AsyncState<HrStockRequest[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Stock Requests"
      state={state}
      onRetry={onRetry}
      colSpan={7}
      emptyText="No stock requests"
      columns={['Request #', 'Requester', 'Asset', 'Qty', 'Priority', 'Date', 'Status']}
    >
      {(rows) =>
        rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{r.requestId || r.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3">
              <p className="text-white">{r.requester || '-'}</p>
              <p className="text-xs text-gray-500">{r.department || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">
              <p>{r.assetName || '-'}</p>
              <p className="text-xs text-gray-500">{r.assetCategory || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">{r.quantity ?? 1}</td>
            <td className="px-4 py-3 text-gray-300 capitalize">{r.priority || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{r.requestDate || '-'}</td>
            <td className="px-4 py-3">{statusPill(r.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Stock Allocation Section
// ============================================================================

function StockAllocationSection({ state, onRetry }: { state: AsyncState<HrAssetAllocation[]>; onRetry: () => void }) {
  return (
    <AsyncTable
      title="Stock Allocation"
      state={state}
      onRetry={onRetry}
      colSpan={7}
      emptyText="No allocations recorded"
      columns={['Allocation #', 'Asset', 'Employee', 'Category', 'Allocated', 'Condition', 'Status']}
    >
      {(rows) =>
        rows.map((a) => (
          <tr key={a.id} className="hover:bg-gray-750">
            <td className="px-4 py-3">
              <span className="text-blue-400 font-mono text-sm">{a.allocationId || a.id.slice(0, 8)}</span>
            </td>
            <td className="px-4 py-3">
              <p className="text-white">{a.assetName || a.assetTag || '-'}</p>
              <p className="text-xs text-gray-500">{a.assetTag || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">
              <p>{a.employeeName || '-'}</p>
              <p className="text-xs text-gray-500">{a.department || ''}</p>
            </td>
            <td className="px-4 py-3 text-gray-300">{a.category || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{a.allocationDate || '-'}</td>
            <td className="px-4 py-3 text-gray-300 capitalize">{a.condition || '-'}</td>
            <td className="px-4 py-3">{statusPill(a.status)}</td>
          </tr>
        ))
      }
    </AsyncTable>
  );
}

// ============================================================================
// Reports Section (5 report views over real aggregates)
// ============================================================================

interface ReportsData {
  register: AssetRegisterReport[];
  allocation: AllocationSummaryReport[];
  employee: EmployeeAssetReport[];
  department: DepartmentAssetReport[];
  costs: CostSummaryReport[];
}

function ReportsSection({
  subTab,
  state,
  onRetry,
}: {
  subTab: ReportsSubTab;
  state: AsyncState<ReportsData | null>;
  onRetry: () => void;
}) {
  if (state.loading) {
    return <div className="text-center py-8 text-gray-500">Loading report...</div>;
  }
  if (state.error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-red-400">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">{state.error}</span>
        <button onClick={onRetry} className="text-blue-400 hover:text-blue-300 text-sm underline">
          Retry
        </button>
      </div>
    );
  }
  const d = state.data;
  if (!d) return null;

  const wrap = (title: string, columns: string[], colSpan: number, body: React.ReactNode, empty: boolean) => (
    <div className="space-y-4">
      <SectionHeader title={title} />
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {empty ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              body
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  switch (subTab) {
    case 'register':
      return wrap(
        'Asset Register',
        ['Asset Tag', 'Name', 'Category', 'Serial', 'Purchase Date', 'Cost', 'Status'],
        7,
        d.register.map((r, i) => (
          <tr key={`${r.assetTag}-${i}`} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-blue-400 font-mono text-sm">{r.assetTag}</td>
            <td className="px-4 py-3 text-white">{r.assetName}</td>
            <td className="px-4 py-3 text-gray-300">{r.category}</td>
            <td className="px-4 py-3 text-gray-300">{r.serialNumber || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{r.purchaseDate || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.purchaseCost)}</td>
            <td className="px-4 py-3">{statusPill(r.status)}</td>
          </tr>
        )),
        d.register.length === 0,
      );
    case 'allocation_report':
      return wrap(
        'Allocation Report',
        ['Category', 'Total', 'Allocated', 'Available', 'Maintenance', 'Utilization'],
        6,
        d.allocation.map((r, i) => (
          <tr key={`${r.category}-${i}`} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{r.category}</td>
            <td className="px-4 py-3 text-gray-300">{r.total}</td>
            <td className="px-4 py-3 text-gray-300">{r.allocated}</td>
            <td className="px-4 py-3 text-gray-300">{r.available}</td>
            <td className="px-4 py-3 text-gray-300">{r.maintenance}</td>
            <td className="px-4 py-3 text-gray-300">{r.utilization}%</td>
          </tr>
        )),
        d.allocation.length === 0,
      );
    case 'employee_assets':
      return wrap(
        'Employee Assets',
        ['Employee', 'Code', 'Department', 'Total Assets', 'Total Value', 'Location'],
        6,
        d.employee.map((r, i) => (
          <tr key={`${r.employeeCode}-${i}`} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{r.employeeName}</td>
            <td className="px-4 py-3 text-gray-300">{r.employeeCode || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{r.department || '-'}</td>
            <td className="px-4 py-3 text-gray-300">{r.totalAssets}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.totalValue)}</td>
            <td className="px-4 py-3 text-gray-300">{r.location || '-'}</td>
          </tr>
        )),
        d.employee.length === 0,
      );
    case 'department_assets':
      return wrap(
        'Department Assets',
        ['Department', 'Employees', 'Laptops', 'Desktops', 'Mobiles', 'Value', 'Per Employee'],
        7,
        d.department.map((r, i) => (
          <tr key={`${r.department}-${i}`} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{r.department}</td>
            <td className="px-4 py-3 text-gray-300">{r.employees}</td>
            <td className="px-4 py-3 text-gray-300">{r.laptops}</td>
            <td className="px-4 py-3 text-gray-300">{r.desktops}</td>
            <td className="px-4 py-3 text-gray-300">{r.mobiles}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.totalValue)}</td>
            <td className="px-4 py-3 text-gray-300">{r.assetsPerEmployee}</td>
          </tr>
        )),
        d.department.length === 0,
      );
    case 'maintenance_costs':
      return wrap(
        'Maintenance Costs',
        ['Category', 'Purchase Cost', 'Maintenance Cost', 'Total Cost', 'Monthly Avg', 'Trend'],
        6,
        d.costs.map((r, i) => (
          <tr key={`${r.category}-${i}`} className="hover:bg-gray-750">
            <td className="px-4 py-3 text-white">{r.category}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.purchaseCost)}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.maintenanceCost)}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.totalCost)}</td>
            <td className="px-4 py-3 text-gray-300">{money(r.monthlyAvg)}</td>
            <td className="px-4 py-3 text-gray-300 capitalize">{r.trend}</td>
          </tr>
        )),
        d.costs.length === 0,
      );
    default:
      return null;
  }
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function AssetManagementPage() {
  const [mainTab, setMainTab] = useState<MainTab>('allocation');
  const [allocationSubTab, setAllocationSubTab] = useState<AllocationSubTab>('it_assets');
  const [maintenanceSubTab, setMaintenanceSubTab] = useState<MaintenanceSubTab>('service_requests');
  const [inventorySubTab, setInventorySubTab] = useState<InventorySubTab>('stock');
  const [reportsSubTab, setReportsSubTab] = useState<ReportsSubTab>('register');

  const [dashboardStats, setDashboardStats] = useState<AssetDashboardStats | null>(null);
  const [assets, setAssets] = useState<HRAsset[]>([]);
  const [assetRequests, setAssetRequests] = useState<AssetRequest[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [amcContracts, setAMCContracts] = useState<AMCContract[]>([]);
  const [stockAudits, setStockAudits] = useState<StockAudit[]>([]);

  // Real HR-backend-wired sections (HrAssetsService / NestJS domain backend)
  const [transferState, setTransferState] = useState<AsyncState<HrAssetTransfer[]>>({ data: [], loading: true, error: null });
  const [returnState, setReturnState] = useState<AsyncState<HrAssetReturn[]>>({ data: [], loading: true, error: null });
  const [preventiveState, setPreventiveState] = useState<AsyncState<HrPreventiveMaintenance[]>>({ data: [], loading: true, error: null });
  const [repairState, setRepairState] = useState<AsyncState<HrAssetMaintenance[]>>({ data: [], loading: true, error: null });
  const [stockState, setStockState] = useState<AsyncState<HrAssetInventory[]>>({ data: [], loading: true, error: null });
  const [stockReqState, setStockReqState] = useState<AsyncState<HrStockRequest[]>>({ data: [], loading: true, error: null });
  const [stockAllocState, setStockAllocState] = useState<AsyncState<HrAssetAllocation[]>>({ data: [], loading: true, error: null });
  const [reportsState, setReportsState] = useState<AsyncState<ReportsData | null>>({ data: null, loading: true, error: null });

  const loadTransfers = async () => {
    setTransferState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getAssetTransfers();
      setTransferState({ data, loading: false, error: null });
    } catch {
      setTransferState({ data: [], loading: false, error: 'Failed to load asset transfers' });
    }
  };

  const loadReturns = async () => {
    setReturnState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getAssetReturns();
      setReturnState({ data, loading: false, error: null });
    } catch {
      setReturnState({ data: [], loading: false, error: 'Failed to load asset returns' });
    }
  };

  const loadPreventive = async () => {
    setPreventiveState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getPreventiveMaintenance();
      setPreventiveState({ data, loading: false, error: null });
    } catch {
      setPreventiveState({ data: [], loading: false, error: 'Failed to load preventive maintenance' });
    }
  };

  const loadRepairHistory = async () => {
    setRepairState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getAssetMaintenance('history');
      setRepairState({ data, loading: false, error: null });
    } catch {
      setRepairState({ data: [], loading: false, error: 'Failed to load repair history' });
    }
  };

  const loadStock = async () => {
    setStockState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getAssetInventory();
      setStockState({ data, loading: false, error: null });
    } catch {
      setStockState({ data: [], loading: false, error: 'Failed to load stock' });
    }
  };

  const loadStockRequests = async () => {
    setStockReqState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getAssetRequests();
      setStockReqState({ data, loading: false, error: null });
    } catch {
      setStockReqState({ data: [], loading: false, error: 'Failed to load stock requests' });
    }
  };

  const loadStockAllocations = async () => {
    setStockAllocState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await HrAssetsService.getAssetAllocations();
      setStockAllocState({ data, loading: false, error: null });
    } catch {
      setStockAllocState({ data: [], loading: false, error: 'Failed to load allocations' });
    }
  };

  const loadReports = async () => {
    setReportsState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [register, allocation, employee, department, costs] = await Promise.all([
        HrAssetsService.getReportRegister(),
        HrAssetsService.getReportAllocation(),
        HrAssetsService.getReportEmployee(),
        HrAssetsService.getReportDepartment(),
        HrAssetsService.getReportCosts(),
      ]);
      setReportsState({ data: { register, allocation, employee, department, costs }, loading: false, error: null });
    } catch {
      setReportsState({ data: null, loading: false, error: 'Failed to load reports' });
    }
  };

  useEffect(() => {
    loadDashboard();
    loadAssets();
    loadAssetRequests();
    loadMaintenanceRequests();
    loadAMCContracts();
    loadStockAudits();
    loadTransfers();
    loadReturns();
    loadPreventive();
    loadRepairHistory();
    loadStock();
    loadStockRequests();
    loadStockAllocations();
    loadReports();
  }, []);

  const loadDashboard = async () => {
    try {
      const stats = await AssetManagementService.getDashboard();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadAssets = async (categoryType?: AssetCategoryType) => {
    try {
      const result = await AssetManagementService.getAssets({ categoryType });
      setAssets(result.data);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const loadAssetRequests = async () => {
    try {
      const result = await AssetManagementService.getAssetRequests();
      setAssetRequests(result.data);
    } catch (error) {
      console.error('Error loading asset requests:', error);
    }
  };

  const loadMaintenanceRequests = async () => {
    try {
      const result = await AssetManagementService.getMaintenanceRequests();
      setMaintenanceRequests(result.data);
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
    }
  };

  const loadAMCContracts = async () => {
    try {
      const contracts = await AssetManagementService.getAMCContracts();
      setAMCContracts(contracts);
    } catch (error) {
      console.error('Error loading AMC contracts:', error);
    }
  };

  const loadStockAudits = async () => {
    try {
      const result = await AssetManagementService.getStockAudits();
      setStockAudits(result.data);
    } catch (error) {
      console.error('Error loading stock audits:', error);
    }
  };

  const mainTabs = [
    { id: 'allocation' as MainTab, label: 'Asset Allocation', icon: Users },
    { id: 'maintenance' as MainTab, label: 'Maintenance & Repairs', icon: Wrench },
    { id: 'inventory' as MainTab, label: 'Asset Inventory', icon: Warehouse },
    { id: 'reports' as MainTab, label: 'Asset Reports', icon: BarChart3 },
  ];

  const allocationSubTabs = [
    { id: 'it_assets' as AllocationSubTab, label: 'IT Assets', icon: Monitor },
    { id: 'office_assets' as AllocationSubTab, label: 'Office Assets', icon: Building2 },
    { id: 'vehicles' as AllocationSubTab, label: 'Vehicles', icon: Car },
    { id: 'requests' as AllocationSubTab, label: 'Requests', icon: Clipboard },
    { id: 'transfer' as AllocationSubTab, label: 'Transfer', icon: ArrowLeftRight },
    { id: 'return' as AllocationSubTab, label: 'Return', icon: ArrowRight },
  ];

  const maintenanceSubTabs = [
    { id: 'service_requests' as MaintenanceSubTab, label: 'Service Requests', icon: Clipboard },
    { id: 'preventive' as MaintenanceSubTab, label: 'Preventive Maintenance', icon: Settings },
    { id: 'amc' as MaintenanceSubTab, label: 'AMC Management', icon: FileText },
    { id: 'history' as MaintenanceSubTab, label: 'Repair History', icon: Clock },
  ];

  const inventorySubTabs = [
    { id: 'stock' as InventorySubTab, label: 'Stock Management', icon: Package },
    { id: 'requests' as InventorySubTab, label: 'Stock Requests', icon: Clipboard },
    { id: 'allocation' as InventorySubTab, label: 'Stock Allocation', icon: Users },
    { id: 'audit' as InventorySubTab, label: 'Stock Audit', icon: Search },
  ];

  const reportsSubTabs = [
    { id: 'register' as ReportsSubTab, label: 'Asset Register', icon: FileText },
    { id: 'allocation_report' as ReportsSubTab, label: 'Allocation Report', icon: Users },
    { id: 'employee_assets' as ReportsSubTab, label: 'Employee Assets', icon: Users },
    { id: 'department_assets' as ReportsSubTab, label: 'Department Assets', icon: Building2 },
    { id: 'maintenance_costs' as ReportsSubTab, label: 'Maintenance Costs', icon: BarChart3 },
  ];

  const renderAllocationContent = () => {
    switch (allocationSubTab) {
      case 'it_assets':
        return <AssetList categoryType={AssetCategoryType.IT_ASSETS} assets={assets.filter(a => ['1', '2', '3'].includes(a.categoryId))} />;
      case 'office_assets':
        return <AssetList categoryType={AssetCategoryType.OFFICE_ASSETS} assets={assets.filter(a => ['4', '5'].includes(a.categoryId))} />;
      case 'vehicles':
        return <AssetList categoryType={AssetCategoryType.VEHICLES} assets={assets.filter(a => ['6', '7'].includes(a.categoryId))} />;
      case 'requests':
        return <AssetRequests requests={assetRequests} />;
      case 'transfer':
        return <TransferSection state={transferState} onRetry={loadTransfers} />;
      case 'return':
        return <ReturnSection state={returnState} onRetry={loadReturns} />;
      default:
        return null;
    }
  };

  const renderMaintenanceContent = () => {
    switch (maintenanceSubTab) {
      case 'service_requests':
        return <MaintenanceSection requests={maintenanceRequests} />;
      case 'preventive':
        return <PreventiveSection state={preventiveState} onRetry={loadPreventive} />;
      case 'amc':
        return <AMCContractsSection contracts={amcContracts} />;
      case 'history':
        return <RepairHistorySection state={repairState} onRetry={loadRepairHistory} />;
      default:
        return null;
    }
  };

  const renderInventoryContent = () => {
    switch (inventorySubTab) {
      case 'stock':
        return <StockManagementSection state={stockState} onRetry={loadStock} />;
      case 'requests':
        return <StockRequestsSection state={stockReqState} onRetry={loadStockRequests} />;
      case 'allocation':
        return <StockAllocationSection state={stockAllocState} onRetry={loadStockAllocations} />;
      case 'audit':
        return <StockAuditSection audits={stockAudits} />;
      default:
        return null;
    }
  };

  const renderReportsContent = () => {
    return <ReportsSection subTab={reportsSubTab} state={reportsState} onRetry={loadReports} />;
  };

  const getCurrentSubTabs = () => {
    switch (mainTab) {
      case 'allocation': return allocationSubTabs;
      case 'maintenance': return maintenanceSubTabs;
      case 'inventory': return inventorySubTabs;
      case 'reports': return reportsSubTabs;
      default: return [];
    }
  };

  const getCurrentSubTab = () => {
    switch (mainTab) {
      case 'allocation': return allocationSubTab;
      case 'maintenance': return maintenanceSubTab;
      case 'inventory': return inventorySubTab;
      case 'reports': return reportsSubTab;
      default: return '';
    }
  };

  const setCurrentSubTab = (tab: string) => {
    switch (mainTab) {
      case 'allocation': setAllocationSubTab(tab as AllocationSubTab); break;
      case 'maintenance': setMaintenanceSubTab(tab as MaintenanceSubTab); break;
      case 'inventory': setInventorySubTab(tab as InventorySubTab); break;
      case 'reports': setReportsSubTab(tab as ReportsSubTab); break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Asset Management</h1>
            <p className="text-gray-400">Manage company assets, allocations, and maintenance</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
              <Search className="h-4 w-4" />
              Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <AssetDashboard stats={dashboardStats} />

        {/* Main Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex gap-1">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  mainTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap gap-2">
          {getCurrentSubTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                getCurrentSubTab() === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {mainTab === 'allocation' && renderAllocationContent()}
          {mainTab === 'maintenance' && renderMaintenanceContent()}
          {mainTab === 'inventory' && renderInventoryContent()}
          {mainTab === 'reports' && renderReportsContent()}
        </div>
      </div>
    </div>
  );
}
