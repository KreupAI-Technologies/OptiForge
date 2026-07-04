'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
  ArrowLeft, Package, Calendar, User, FileText, MapPin,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Clock, Truck, RefreshCw, Download, Activity,
  BarChart3, PieChart, Target, Zap, History, Eye
} from 'lucide-react';

interface StockMovement {
  id: string;
  movementNumber: string;
  movementType: 'receipt' | 'issue' | 'transfer_in' | 'transfer_out' | 'adjustment' | 'return';
  movementDate: string;
  movementTime: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  uom: string;
  unitCost: number;
  totalValue: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceNumber: string;
  fromLocation?: string;
  toLocation?: string;
  warehouse: string;
  reason: string;
  remarks?: string;
  batchNumber?: string;
  serialNumbers?: string[];
  performedBy: string;
  approvedBy?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'completed' | 'cancelled';
  createdDate: string;
  completedDate?: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedDate: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

export default function StockMovementViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'activity' | 'analytics'>('details');

  const emptyMovement: StockMovement = {
    id: params.id,
    movementNumber: '',
    movementType: 'receipt',
    movementDate: '',
    movementTime: '',
    itemCode: '',
    itemName: '',
    category: '',
    quantity: 0,
    uom: '',
    unitCost: 0,
    totalValue: 0,
    balanceBefore: 0,
    balanceAfter: 0,
    referenceType: '',
    referenceNumber: '',
    warehouse: '',
    reason: '',
    performedBy: '',
    status: 'completed',
    createdDate: '',
    documents: [],
  };

  const [movement, setMovement] = useState<StockMovement>(emptyMovement);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // GET /inventory/stock-entries/:id -> single stock movement entry.
        const e = (await inventoryService.getStockEntry(params.id)) as any;
        const typeMap: Record<string, StockMovement['movementType']> = {
          Receipt: 'receipt', Receive: 'receipt', In: 'receipt', Purchase: 'receipt',
          Issue: 'issue', Out: 'issue', Sale: 'issue',
          TransferIn: 'transfer_in', 'Transfer In': 'transfer_in',
          TransferOut: 'transfer_out', 'Transfer Out': 'transfer_out',
          Transfer: 'transfer_in',
          Adjustment: 'adjustment', Adjust: 'adjustment',
          Return: 'return',
        };
        const statusMap: Record<string, StockMovement['status']> = {
          Draft: 'draft', PendingApproval: 'pending_approval', 'Pending Approval': 'pending_approval',
          Approved: 'approved', Completed: 'completed', Posted: 'completed', Cancelled: 'cancelled',
        };
        const qty = Number(e?.quantity ?? e?.totalQuantity ?? 0);
        const unitCost = Number(e?.unitCost ?? 0);
        const mapped: StockMovement = {
          id: String(e?.id ?? params.id),
          movementNumber: e?.entryNumber ?? e?.movementNumber ?? e?.documentNumber ?? '',
          movementType: typeMap[e?.entryType ?? e?.movementType ?? e?.type] ?? 'receipt',
          movementDate: e?.entryDate ?? e?.movementDate ?? e?.date ?? '',
          movementTime: e?.movementTime ?? '',
          itemCode: e?.itemCode ?? e?.item?.itemCode ?? '',
          itemName: e?.itemName ?? e?.item?.itemName ?? '',
          category: e?.category ?? e?.itemCategory ?? '',
          quantity: qty,
          uom: e?.uom ?? e?.unitOfMeasure ?? '',
          unitCost,
          totalValue: Number(e?.totalValue ?? qty * unitCost),
          balanceBefore: Number(e?.balanceBefore ?? 0),
          balanceAfter: Number(e?.balanceAfter ?? 0),
          referenceType: e?.referenceType ?? '',
          referenceNumber: e?.referenceNumber ?? e?.reference ?? '',
          fromLocation: e?.fromLocation ?? e?.sourceLocation ?? undefined,
          toLocation: e?.toLocation ?? e?.destinationLocation ?? undefined,
          warehouse: e?.warehouseName ?? e?.warehouse ?? '',
          reason: e?.reason ?? '',
          remarks: e?.remarks ?? e?.notes ?? undefined,
          batchNumber: e?.batchNumber ?? undefined,
          serialNumbers: Array.isArray(e?.serialNumbers) ? e.serialNumbers : undefined,
          performedBy: e?.createdBy ?? e?.performedBy ?? '',
          approvedBy: e?.approvedBy ?? undefined,
          status: statusMap[e?.status] ?? 'completed',
          createdDate: e?.createdAt ?? e?.createdDate ?? '',
          completedDate: e?.completedDate ?? e?.completedAt ?? undefined,
          documents: Array.isArray(e?.documents) ? e.documents : [],
        };
        const rawLog: any[] =
          (Array.isArray(e?.activityLog) && e.activityLog) ||
          (Array.isArray(e?.history) && e.history) ||
          (Array.isArray(e?.auditTrail) && e.auditTrail) ||
          (Array.isArray(e?.lines) && e.lines) ||
          [];
        const log: ActivityLog[] = rawLog.map((l: any, i: number) => ({
          id: String(l.id ?? i),
          timestamp: l.timestamp ?? l.createdAt ?? l.date ?? '',
          action: l.action ?? l.event ?? l.description ?? '',
          user: l.user ?? l.performedBy ?? l.createdBy ?? '',
          details: l.details ?? l.description ?? l.remarks ?? '',
          status: (l.status === 'warning' || l.status === 'error') ? l.status : 'success',
        }));
        if (!cancelled) {
          setMovement(mapped);
          setActivityLog(log);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load stock movement');
          setMovement(emptyMovement);
          setActivityLog([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const getMovementTypeConfig = (type: string) => {
    switch (type) {
      case 'receipt':
        return { label: 'Receipt', color: 'bg-green-100 text-green-700', icon: <TrendingUp className="w-5 h-5" />, sign: '+' };
      case 'issue':
        return { label: 'Issue', color: 'bg-red-100 text-red-700', icon: <TrendingDown className="w-5 h-5" />, sign: '-' };
      case 'transfer_in':
        return { label: 'Transfer In', color: 'bg-blue-100 text-blue-700', icon: <TrendingUp className="w-5 h-5" />, sign: '+' };
      case 'transfer_out':
        return { label: 'Transfer Out', color: 'bg-orange-100 text-orange-700', icon: <TrendingDown className="w-5 h-5" />, sign: '-' };
      case 'adjustment':
        return { label: 'Adjustment', color: 'bg-purple-100 text-purple-700', icon: <RefreshCw className="w-5 h-5" />, sign: '±' };
      case 'return':
        return { label: 'Return', color: 'bg-teal-100 text-teal-700', icon: <TrendingUp className="w-5 h-5" />, sign: '+' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-700', icon: <Package className="w-5 h-5" />, sign: '' };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-5 h-5" /> };
      case 'approved':
        return { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-5 h-5" /> };
      case 'pending_approval':
        return { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-5 h-5" /> };
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: <FileText className="w-5 h-5" /> };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-5 h-5" /> };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: <AlertTriangle className="w-5 h-5" /> };
    }
  };

  const movementTypeConfig = getMovementTypeConfig(movement.movementType);
  const statusConfig = getStatusConfig(movement.status);

  return (
    <div className="p-6 space-y-3">
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading movement…
        </div>
      )}
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
              <h1 className="text-3xl font-bold text-gray-900">Stock Movement</h1>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${movementTypeConfig.color}`}>
                {movementTypeConfig.icon}
                {movementTypeConfig.label}
              </span>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span className="font-mono font-semibold">{movement.movementNumber}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {movement.movementDate} {movement.movementTime}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {movement.performedBy}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-2">
        <div className={`p-6 rounded-xl text-white ${
          movement.movementType === 'receipt' || movement.movementType === 'transfer_in' || movement.movementType === 'return'
            ? 'bg-gradient-to-br from-green-500 to-green-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            {movementTypeConfig.icon}
            <span className="text-2xl font-bold">{movementTypeConfig.sign}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{movement.quantity.toLocaleString()}</div>
          <div className="text-sm opacity-90">Quantity ({movement.uom})</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{movement.balanceBefore.toLocaleString()}</div>
          <div className="text-blue-100 text-sm">Balance Before</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{movement.balanceAfter.toLocaleString()}</div>
          <div className="text-purple-100 text-sm">Balance After</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">₹</span>
            <span className="text-sm opacity-90">per {movement.uom}</span>
          </div>
          <div className="text-3xl font-bold mb-1">₹{movement.unitCost.toFixed(2)}</div>
          <div className="text-orange-100 text-sm">Unit Cost</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">₹</span>
          </div>
          <div className="text-3xl font-bold mb-1">₹{(movement.totalValue / 1000).toFixed(0)}K</div>
          <div className="text-indigo-100 text-sm">Total Value</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Movement Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents ({movement.documents.length})
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
            Analytics & Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Movement Information */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Movement Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Movement Number</span>
                  <span className="font-mono font-semibold text-gray-900">{movement.movementNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Movement Type</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${movementTypeConfig.color}`}>
                    {movementTypeConfig.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Movement Date & Time</span>
                  <span className="font-medium text-gray-900">{movement.movementDate} {movement.movementTime}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Reference Type</span>
                  <span className="font-medium text-gray-900">{movement.referenceType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Reference Number</span>
                  <span className="font-mono font-semibold text-blue-600">{movement.referenceNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Item Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Item Code</span>
                  <span className="font-mono font-semibold text-gray-900">{movement.itemCode}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Item Name</span>
                  <span className="font-medium text-gray-900">{movement.itemName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium text-gray-900">{movement.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-bold text-lg text-gray-900">{movement.quantity} {movement.uom}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Unit Cost</span>
                  <span className="font-semibold text-gray-900">₹{movement.unitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-bold text-lg text-green-700">₹{movement.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Balance Information */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Stock Balance Impact
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 mb-1">Balance Before</div>
                <div className="text-3xl font-bold text-blue-900">{movement.balanceBefore}</div>
                <div className="text-xs text-blue-600 mt-1">{movement.uom}</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 flex flex-col justify-center">
                <div className="text-sm text-purple-600 mb-1">Change</div>
                <div className={`text-3xl font-bold ${
                  movement.movementType === 'receipt' || movement.movementType === 'transfer_in' || movement.movementType === 'return'
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}>
                  {movementTypeConfig.sign}{movement.quantity}
                </div>
                <div className="text-xs text-purple-600 mt-1">{movement.uom}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 mb-1">Balance After</div>
                <div className="text-3xl font-bold text-green-900">{movement.balanceAfter}</div>
                <div className="text-xs text-green-600 mt-1">{movement.uom}</div>
              </div>
            </div>
          </div>

          {/* Location & Warehouse */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Location Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Warehouse</span>
                  <span className="font-semibold text-gray-900">{movement.warehouse}</span>
                </div>
                {movement.fromLocation && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">From Location</span>
                    <span className="font-mono font-medium text-gray-900">{movement.fromLocation}</span>
                  </div>
                )}
                {movement.toLocation && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">To Location</span>
                    <span className="font-mono font-medium text-gray-900">{movement.toLocation}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Personnel Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Performed By</span>
                  <span className="font-semibold text-gray-900">{movement.performedBy}</span>
                </div>
                {movement.approvedBy && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Approved By</span>
                    <span className="font-semibold text-gray-900">{movement.approvedBy}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Created Date</span>
                  <span className="font-medium text-gray-900">{movement.createdDate}</span>
                </div>
                {movement.completedDate && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Completed Date</span>
                    <span className="font-medium text-gray-900">{movement.completedDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {(movement.batchNumber || movement.serialNumbers) && (
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tracking Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {movement.batchNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Batch Number</label>
                    <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="font-mono font-bold text-blue-900">{movement.batchNumber}</span>
                    </div>
                  </div>
                )}
                {movement.serialNumbers && movement.serialNumbers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">Serial Numbers</label>
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {movement.serialNumbers.map((serial, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-mono">
                            {serial}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reason & Remarks */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reason & Remarks</h3>
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-2">Reason</label>
                <p className="text-gray-900">{movement.reason}</p>
              </div>
              {movement.remarks && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Additional Remarks</label>
                  <p className="text-gray-700 text-sm leading-relaxed">{movement.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Attached Documents</h3>
            <span className="text-sm text-gray-600">{movement.documents.length} document(s)</span>
          </div>
          {movement.documents.length > 0 ? (
            <div className="space-y-3">
              {movement.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{doc.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {doc.type} • {doc.size} • Uploaded by {doc.uploadedBy} on {doc.uploadedDate}
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No documents attached</p>
            </div>
          )}
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
          {/* Movement Impact Analysis */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Movement Impact Analysis
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">+24.1%</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Stock Level Change</div>
                <div className="text-xs text-gray-500">From 2,075 → 2,575 {movement.uom}</div>
                <div className="mt-4 bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Days of Stock Coverage</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">38 days</span>
                    <span className="text-xs text-green-600">+7 days</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">OPTIMAL</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Inventory Position</div>
                <div className="text-xs text-gray-500 mb-2">After this movement</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Safety Stock:</span>
                    <span className="text-xs font-semibold text-green-600">✓ Maintained</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Reorder Level:</span>
                    <span className="text-xs font-semibold text-green-600">✓ Above</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Max Level:</span>
                    <span className="text-xs font-semibold text-blue-600">51% utilized</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">₹</span>
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-sm text-gray-600 mb-2">Value Impact</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">₹92,750</div>
                <div className="text-xs text-gray-500 mb-2">Movement value</div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Total Stock Value</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹4.77L</span>
                    <span className="text-xs text-green-600">+19.4%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movement Pattern Analysis */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Historical Movement Patterns
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Last 30 Days Activity</span>
                    <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">12 movements</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Receipts</div>
                      <div className="text-lg font-bold text-green-600">5</div>
                      <div className="text-xs text-gray-500">+2,450 {movement.uom}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Issues</div>
                      <div className="text-lg font-bold text-red-600">6</div>
                      <div className="text-xs text-gray-500">-1,875 {movement.uom}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Net Flow</div>
                      <div className="text-lg font-bold text-blue-600">+575</div>
                      <div className="text-xs text-gray-500">{movement.uom}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Average Receipt</div>
                        <div className="text-xs text-gray-500">Per transaction</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">490 {movement.uom}</div>
                      <div className="text-xs text-green-600">+8% vs last month</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Average Issue</div>
                        <div className="text-xs text-gray-500">Per transaction</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">312 {movement.uom}</div>
                      <div className="text-xs text-gray-600">Consistent pattern</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Movement Frequency</div>
                        <div className="text-xs text-gray-500">Average interval</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">2.5 days</div>
                      <div className="text-xs text-gray-600">Between movements</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                Movement Efficiency Metrics
              </h3>
              <div className="space-y-2">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Processing Time</span>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">Excellent</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Request to Complete</div>
                      <div className="text-2xl font-bold text-emerald-600">22.5h</div>
                      <div className="text-xs text-gray-500">vs 28h avg</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Approval Time</div>
                      <div className="text-2xl font-bold text-blue-600">3.2h</div>
                      <div className="text-xs text-gray-500">Fast track</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Documentation Compliance</span>
                      <span className="text-sm font-bold text-emerald-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">3/3 documents attached</span>
                      <span className="text-xs text-emerald-600">✓ Complete</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Quality Check Score</span>
                      <span className="text-sm font-bold text-green-600">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Specifications met</span>
                      <span className="text-xs text-green-600">✓ Passed</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Storage Efficiency</span>
                      <span className="text-sm font-bold text-blue-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Optimal location assignment</span>
                      <span className="text-xs text-blue-600">Zone A - Prime</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100 mt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Accuracy Tracking</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Quantity Accuracy</div>
                      <div className="text-lg font-bold text-blue-600">100%</div>
                      <div className="text-xs text-gray-500">No discrepancy</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Location Accuracy</div>
                      <div className="text-lg font-bold text-green-600">100%</div>
                      <div className="text-xs text-gray-500">Correct bin</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Predictive Insights & Recommendations
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Next Reorder</div>
                    <div className="text-sm font-bold text-gray-900">38 days</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Based on current consumption rate of 68 {movement.uom}/day, next order due by Nov 30</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Optimal Order Qty</div>
                    <div className="text-sm font-bold text-gray-900">625 {movement.uom}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Economic Order Quantity (EOQ) calculated based on usage patterns and carrying costs</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cost Optimization</div>
                    <div className="text-sm font-bold text-gray-900">₹12.5K/year</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600">Potential savings by adjusting reorder levels and reducing emergency purchases</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
