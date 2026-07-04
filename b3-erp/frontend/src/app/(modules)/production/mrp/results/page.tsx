'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, Package, Calendar, Filter, Eye } from 'lucide-react';
import { ApproveActionModal, RejectActionModal, ViewActionDetailsModal } from '@/components/production/ActionMessageModals';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface MRPRunResult {
  id: string;
  runNumber: string;
  runDate: string;
  runTime: string;
  runDuration: string;
  planningHorizon: string;
  status: 'completed' | 'in-progress' | 'failed';
  totalMaterialsAnalyzed: number;
  materialsWithShortages: number;
  plannedOrdersGenerated: number;
  actionMessagesCreated: number;
  criticalIssues: number;
  runBy: string;
}

interface ActionMessage {
  id: string;
  messageType: 'expedite' | 'reschedule' | 'cancel' | 'create-order' | 'increase-quantity';
  priority: 'critical' | 'high' | 'medium' | 'low';
  materialCode: string;
  materialName: string;
  currentDate: string;
  suggestedDate: string;
  quantity: number;
  uom: string;
  reason: string;
  affectedWOs: string[];
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
}

export default function MRPResultsPage() {
  const router = useRouter();
  const [selectedRun, setSelectedRun] = useState<string>('MRP-2025-1015');
  const [filterMessageType, setFilterMessageType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Modal state hooks
  const [isApproveActionOpen, setIsApproveActionOpen] = useState(false);
  const [isRejectActionOpen, setIsRejectActionOpen] = useState(false);
  const [isViewActionOpen, setIsViewActionOpen] = useState(false);
  const [selectedActionMessage, setSelectedActionMessage] = useState<ActionMessage | null>(null);

  const [mrpRuns, setMrpRuns] = useState<MRPRunResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getMrpRuns()) as any[];
        const mapped: MRPRunResult[] = (raw || []).map((r: any, idx: number) => ({
          id: String(r?.id ?? idx + 1),
          runNumber: String(r?.runNumber ?? ''),
          runDate: String(r?.runDate ?? ''),
          runTime: String(r?.runTime ?? ''),
          runDuration: String(r?.runDuration ?? ''),
          planningHorizon: String(r?.planningHorizon ?? ''),
          status: (r?.status ?? 'completed') as MRPRunResult['status'],
          totalMaterialsAnalyzed: Number(r?.totalMaterialsAnalyzed ?? 0),
          materialsWithShortages: Number(r?.materialsWithShortages ?? 0),
          plannedOrdersGenerated: Number(r?.plannedOrdersGenerated ?? 0),
          actionMessagesCreated: Number(r?.actionMessagesCreated ?? 0),
          criticalIssues: Number(r?.criticalIssues ?? 0),
          runBy: String(r?.runBy ?? ''),
        }));
        if (!cancelled) setMrpRuns(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load');
          setMrpRuns([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const EMPTY_RUN: MRPRunResult = {
    id: '',
    runNumber: '',
    runDate: '',
    runTime: '',
    runDuration: '',
    planningHorizon: '',
    status: 'completed',
    totalMaterialsAnalyzed: 0,
    materialsWithShortages: 0,
    plannedOrdersGenerated: 0,
    actionMessagesCreated: 0,
    criticalIssues: 0,
    runBy: '',
  };

  // Mock data for action messages
  const [actionMessages, setActionMessages] = useState<ActionMessage[]>([
    {
      id: '1',
      messageType: 'expedite',
      priority: 'critical',
      materialCode: 'RM-BRASS-002',
      materialName: 'Brass Rod (25mm diameter)',
      currentDate: '2025-10-23',
      suggestedDate: '2025-10-21',
      quantity: 500,
      uom: 'meter',
      reason: 'Critical shortage detected - WO-2025-1138 at risk of delay',
      affectedWOs: ['WO-2025-1138', 'WO-2025-1140'],
      status: 'approved'
    },
    {
      id: '2',
      messageType: 'expedite',
      priority: 'critical',
      materialCode: 'CP-GASKET-007',
      materialName: 'Silicone Gasket (Food Grade)',
      currentDate: '2025-10-24',
      suggestedDate: '2025-10-22',
      quantity: 600,
      uom: 'pcs',
      reason: 'Multiple work orders affected - production stoppage risk',
      affectedWOs: ['WO-2025-1135', 'WO-2025-1142', 'WO-2025-1147'],
      status: 'implemented'
    },
    {
      id: '3',
      messageType: 'create-order',
      priority: 'critical',
      materialCode: 'CP-MOTOR-009',
      materialName: 'Electric Motor (250W) - Kitchen Appliance',
      currentDate: '2025-10-22',
      suggestedDate: '2025-10-22',
      quantity: 200,
      uom: 'pcs',
      reason: 'Severe shortage - immediate purchase order required',
      affectedWOs: ['WO-2025-1143'],
      status: 'pending'
    },
    {
      id: '4',
      messageType: 'increase-quantity',
      priority: 'high',
      materialCode: 'RM-GRANITE-004',
      materialName: 'Granite Slab - Black Galaxy',
      currentDate: '2025-10-26',
      suggestedDate: '2025-10-26',
      quantity: 200,
      uom: 'sq.ft',
      reason: 'Increase order quantity to meet safety stock levels',
      affectedWOs: ['WO-2025-1145'],
      status: 'approved'
    },
    {
      id: '5',
      messageType: 'expedite',
      priority: 'high',
      materialCode: 'RM-CERAMIC-010',
      materialName: 'Ceramic Coating Material',
      currentDate: '2025-10-28',
      suggestedDate: '2025-10-26',
      quantity: 100,
      uom: 'liter',
      reason: 'Advance delivery date to avoid production delay',
      affectedWOs: ['WO-2025-1146', 'WO-2025-1148'],
      status: 'implemented'
    },
    {
      id: '6',
      messageType: 'reschedule',
      priority: 'medium',
      materialCode: 'RM-SS304-001',
      materialName: 'Stainless Steel 304 Sheet (2mm)',
      currentDate: '2025-10-25',
      suggestedDate: '2025-10-27',
      quantity: 500,
      uom: 'kg',
      reason: 'Existing inventory sufficient - reschedule to optimize cash flow',
      affectedWOs: ['WO-2025-1135', 'WO-2025-1142'],
      status: 'pending'
    },
    {
      id: '7',
      messageType: 'create-order',
      priority: 'medium',
      materialCode: 'CP-HANDLE-005',
      materialName: 'Chrome Plated Lever Handle',
      currentDate: '2025-10-27',
      suggestedDate: '2025-10-27',
      quantity: 300,
      uom: 'pcs',
      reason: 'Create production order - internal manufacturing required',
      affectedWOs: ['WO-2025-1138', 'WO-2025-1140', 'WO-2025-1142'],
      status: 'approved'
    },
    {
      id: '8',
      messageType: 'cancel',
      priority: 'medium',
      materialCode: 'RM-ALUMINUM-006',
      materialName: 'Aluminum Extrusion Profile',
      currentDate: '2025-10-29',
      suggestedDate: '-',
      quantity: 500,
      uom: 'meter',
      reason: 'Cancel planned order - sufficient inventory with scheduled receipts',
      affectedWOs: ['WO-2025-1147'],
      status: 'pending'
    },
    {
      id: '9',
      messageType: 'reschedule',
      priority: 'low',
      materialCode: 'RM-WOOD-008',
      materialName: 'Hardwood Plywood (18mm)',
      currentDate: '2025-10-30',
      suggestedDate: '2025-11-02',
      quantity: 50,
      uom: 'sheet',
      reason: 'Delay order - work order scheduled later than originally planned',
      affectedWOs: ['WO-2025-1150'],
      status: 'pending'
    },
    {
      id: '10',
      messageType: 'increase-quantity',
      priority: 'low',
      materialCode: 'CP-VALVE-003',
      materialName: 'Ceramic Disc Valve Cartridge',
      currentDate: '2025-11-03',
      suggestedDate: '2025-11-03',
      quantity: 150,
      uom: 'pcs',
      reason: 'Increase production order quantity for better economies of scale',
      affectedWOs: ['WO-2025-1152', 'WO-2025-1153'],
      status: 'rejected'
    }
  ]);

  const currentRun = mrpRuns.find(run => run.runNumber === selectedRun) ?? mrpRuns[0] ?? EMPTY_RUN;

  const filteredMessages = actionMessages.filter(msg => {
    const typeMatch = filterMessageType === 'all' || msg.messageType === filterMessageType;
    const priorityMatch = filterPriority === 'all' || msg.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'failed': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'expedite': return 'text-red-700 bg-red-50';
      case 'reschedule': return 'text-blue-700 bg-blue-50';
      case 'cancel': return 'text-gray-700 bg-gray-50';
      case 'create-order': return 'text-green-700 bg-green-50';
      case 'increase-quantity': return 'text-purple-700 bg-purple-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'approved': return 'text-blue-700 bg-blue-100';
      case 'rejected': return 'text-red-700 bg-red-100';
      case 'implemented': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Handler functions for modals
  const handleApproveAction = (message: ActionMessage) => {
    setSelectedActionMessage(message);
    setIsApproveActionOpen(true);
  };

  const handleRejectAction = (message: ActionMessage) => {
    setSelectedActionMessage(message);
    setIsRejectActionOpen(true);
  };

  const handleViewAction = (message: ActionMessage) => {
    setSelectedActionMessage(message);
    setIsViewActionOpen(true);
  };

  const handleApproveActionSubmit = (data: any) => {
    if (selectedActionMessage) {
      setActionMessages(prev =>
        prev.map(m => (m.id === selectedActionMessage.id ? { ...m, status: 'approved' } : m)),
      );
    }
    setIsApproveActionOpen(false);
    setSelectedActionMessage(null);
  };

  const handleRejectActionSubmit = (data: any) => {
    if (selectedActionMessage) {
      setActionMessages(prev =>
        prev.map(m => (m.id === selectedActionMessage.id ? { ...m, status: 'rejected' } : m)),
      );
    }
    setIsRejectActionOpen(false);
    setSelectedActionMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading…</div>)}
      {loadError && !isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Inline Header */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MRP Results</h1>
            <p className="text-sm text-gray-500 mt-1">MRP run results and action messages</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Run MRP</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Run Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedRun}
            onChange={(e) => setSelectedRun(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {mrpRuns.map(run => (
              <option key={run.id} value={run.runNumber}>
                {run.runNumber} - {run.runDate} {run.runTime} ({run.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Run Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Materials Analyzed</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{currentRun.totalMaterialsAnalyzed}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">With Shortages</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{currentRun.materialsWithShortages}</p>
            </div>
            <div className="p-3 bg-yellow-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Planned Orders</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{currentRun.plannedOrdersGenerated}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{currentRun.criticalIssues}</p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Run Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Run Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div>
            <p className="text-sm text-gray-500">Run Number</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentRun.runNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Run Date & Time</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentRun.runDate} {currentRun.runTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentRun.runDuration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Planning Horizon</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentRun.planningHorizon}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(currentRun.status)}`}>
              {currentRun.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Action Messages</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentRun.actionMessagesCreated}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Run By</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{currentRun.runBy}</p>
          </div>
        </div>
      </div>

      {/* Action Messages Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900">Action Messages</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterMessageType}
              onChange={(e) => setFilterMessageType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="expedite">Expedite</option>
              <option value="reschedule">Reschedule</option>
              <option value="cancel">Cancel</option>
              <option value="create-order">Create Order</option>
              <option value="increase-quantity">Increase Quantity</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Action Messages List */}
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`border-2 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(message.priority)}`}
              onClick={() => handleViewAction(message)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getMessageTypeColor(message.messageType)}`}>
                      {message.messageType}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getMessageStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-bold text-gray-900">{message.materialCode}</p>
                    <p className="text-sm text-gray-700">{message.materialName}</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{message.reason}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Qty: {message.quantity.toLocaleString()} {message.uom}</span>
                    {message.suggestedDate !== '-' && (
                      <>
                        <span>Current: {message.currentDate}</span>
                        <span>Suggested: {message.suggestedDate}</span>
                      </>
                    )}
                    <span>Affected WOs: {message.affectedWOs.length}</span>
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"
                    onClick={() => handleViewAction(message)}
                  >
                    <Eye className="w-3 h-3" />
                    View Details
                  </button>
                  {message.status === 'pending' && (
                    <>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        onClick={() => handleApproveAction(message)}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        onClick={() => handleRejectAction(message)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Components */}
      <ApproveActionModal
        isOpen={isApproveActionOpen}
        onClose={() => {
          setIsApproveActionOpen(false);
          setSelectedActionMessage(null);
        }}
        onApprove={handleApproveActionSubmit}
        actionMessage={selectedActionMessage ? {
          id: selectedActionMessage.id,
          type: selectedActionMessage.messageType === 'expedite' ? 'Expedite' :
                selectedActionMessage.messageType === 'reschedule' ? 'Reschedule' :
                selectedActionMessage.messageType === 'cancel' ? 'Cancel Order' :
                selectedActionMessage.messageType === 'create-order' ? 'Purchase Order' :
                'Transfer',
          priority: (selectedActionMessage.priority.charAt(0).toUpperCase() + selectedActionMessage.priority.slice(1)) as 'Critical' | 'High' | 'Medium' | 'Low',
          materialCode: selectedActionMessage.materialCode,
          materialName: selectedActionMessage.materialName,
          quantity: selectedActionMessage.quantity,
          uom: selectedActionMessage.uom,
          currentDate: selectedActionMessage.currentDate,
          suggestedDate: selectedActionMessage.suggestedDate,
          reason: selectedActionMessage.reason,
          impact: `This action affects ${selectedActionMessage.affectedWOs.length} work order(s): ${selectedActionMessage.affectedWOs.join(', ')}`,
          affectedWorkOrders: selectedActionMessage.affectedWOs,
          currentStatus: selectedActionMessage.status
        } : null}
      />

      <RejectActionModal
        isOpen={isRejectActionOpen}
        onClose={() => {
          setIsRejectActionOpen(false);
          setSelectedActionMessage(null);
        }}
        onReject={handleRejectActionSubmit}
        actionMessage={selectedActionMessage ? {
          id: selectedActionMessage.id,
          type: selectedActionMessage.messageType === 'expedite' ? 'Expedite' :
                selectedActionMessage.messageType === 'reschedule' ? 'Reschedule' :
                selectedActionMessage.messageType === 'cancel' ? 'Cancel Order' :
                selectedActionMessage.messageType === 'create-order' ? 'Purchase Order' :
                'Transfer',
          priority: (selectedActionMessage.priority.charAt(0).toUpperCase() + selectedActionMessage.priority.slice(1)) as 'Critical' | 'High' | 'Medium' | 'Low',
          materialCode: selectedActionMessage.materialCode,
          materialName: selectedActionMessage.materialName,
          quantity: selectedActionMessage.quantity,
          uom: selectedActionMessage.uom,
          currentDate: selectedActionMessage.currentDate,
          suggestedDate: selectedActionMessage.suggestedDate,
          reason: selectedActionMessage.reason,
          impact: `This action affects ${selectedActionMessage.affectedWOs.length} work order(s): ${selectedActionMessage.affectedWOs.join(', ')}`,
          affectedWorkOrders: selectedActionMessage.affectedWOs,
          currentStatus: selectedActionMessage.status
        } : null}
      />

      <ViewActionDetailsModal
        isOpen={isViewActionOpen}
        onClose={() => {
          setIsViewActionOpen(false);
          setSelectedActionMessage(null);
        }}
        actionMessage={selectedActionMessage ? {
          id: selectedActionMessage.id,
          type: selectedActionMessage.messageType === 'expedite' ? 'Expedite' :
                selectedActionMessage.messageType === 'reschedule' ? 'Reschedule' :
                selectedActionMessage.messageType === 'cancel' ? 'Cancel Order' :
                selectedActionMessage.messageType === 'create-order' ? 'Purchase Order' :
                'Transfer',
          priority: (selectedActionMessage.priority.charAt(0).toUpperCase() + selectedActionMessage.priority.slice(1)) as 'Critical' | 'High' | 'Medium' | 'Low',
          materialCode: selectedActionMessage.materialCode,
          materialName: selectedActionMessage.materialName,
          quantity: selectedActionMessage.quantity,
          uom: selectedActionMessage.uom,
          currentDate: selectedActionMessage.currentDate,
          suggestedDate: selectedActionMessage.suggestedDate,
          reason: selectedActionMessage.reason,
          impact: `This action affects ${selectedActionMessage.affectedWOs.length} work order(s): ${selectedActionMessage.affectedWOs.join(', ')}`,
          affectedWorkOrders: selectedActionMessage.affectedWOs,
          currentStatus: selectedActionMessage.status
        } : null}
      />
    </div>
  );
}
