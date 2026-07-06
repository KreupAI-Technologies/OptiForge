'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, AlertTriangle, CheckCircle, Clock, FileText, Users, Plus } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  CreateRCAModal, ViewRCADetailsModal, AddRootCauseModal,
  AddCorrectiveActionModal, AddPreventiveActionModal,
  UpdateActionStatusModal, VerifyRCAModal,
  CreateRCAData, RCAInvestigation as RCAInvestigationType, AddRootCauseData,
  UpdateActionStatusData, VerifyRCAData
} from '@/components/production/downtime/DowntimeRCAModals';
import { ExportRCAReportModal, ExportRCAConfig } from '@/components/production/downtime/DowntimeExportModals';

// Local interface definitions for page-specific mock data
interface CorrectiveAction {
  id: string;
  action: string;
  assignedTo: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  completionDate: string | null;
}

interface PreventiveAction {
  id: string;
  action: string;
  assignedTo: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  completionDate: string | null;
}

interface RCAInvestigation {
  id: string;
  rcaNumber: string;
  downtimeEvent: string;
  equipment: string;
  incidentDate: string;
  severity: 'critical' | 'high' | 'medium';
  status: 'open' | 'investigating' | 'completed' | 'implemented';
  investigationLead: string;
  teamMembers: string[];
  problemStatement: string;
  immediateActions: string[];
  rootCauses: RootCause[];
  correctiveActions: CorrectiveAction[];
  preventiveActions: PreventiveAction[];
  estimatedCost: number;
  actualCost: number | null;
  targetCloseDate: string;
  actualCloseDate: string | null;
  verifiedBy: string | null;
  verificationDate: string | null;
}

interface RootCause {
  id: string;
  cause: string;
  category: 'equipment' | 'process' | 'people' | 'material' | 'method' | 'environment';
  whyLevel: number;
  contribution: number; // percentage
}

export default function DowntimeRCAPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRCAId, setSelectedRCAId] = useState<string | null>(null);

  // Modal states
  const [isCreateRCAOpen, setIsCreateRCAOpen] = useState(false);
  const [isViewRCAOpen, setIsViewRCAOpen] = useState(false);
  const [isAddRootCauseOpen, setIsAddRootCauseOpen] = useState(false);
  const [isAddCorrectiveActionOpen, setIsAddCorrectiveActionOpen] = useState(false);
  const [isAddPreventiveActionOpen, setIsAddPreventiveActionOpen] = useState(false);
  const [isUpdateActionOpen, setIsUpdateActionOpen] = useState(false);
  const [isVerifyRCAOpen, setIsVerifyRCAOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedRCA, setSelectedRCA] = useState<RCAInvestigationType | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [selectedActionType, setSelectedActionType] = useState<'corrective' | 'preventive'>('corrective');

  // RCA investigations
  const [rcaInvestigations, setRcaInvestigations] = useState<RCAInvestigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshRcas = () => setRefreshKey((k) => k + 1);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true); setLoadError(null);
      try {
        const raw = (await ProductionOrphanService.getRootCauseAnalyses()) as any[];
        const mapped: RCAInvestigation[] = (raw || []).map((r: any, idx: number) => {
          const severityRaw = String(r?.severity ?? 'medium');
          const severity: RCAInvestigation['severity'] =
            severityRaw === 'critical' || severityRaw === 'high' ? severityRaw : 'medium';
          const statusRaw = String(r?.status ?? 'open');
          const status: RCAInvestigation['status'] =
            statusRaw === 'investigating' || statusRaw === 'completed' || statusRaw === 'implemented'
              ? statusRaw
              : 'open';
          const rootCauses: RootCause[] = (Array.isArray(r?.rootCauses) ? r.rootCauses : []).map(
            (rc: any, i: number) => {
              const catRaw = String(rc?.category ?? 'equipment');
              const category: RootCause['category'] =
                catRaw === 'process' || catRaw === 'people' || catRaw === 'material' ||
                catRaw === 'method' || catRaw === 'environment'
                  ? (catRaw as RootCause['category'])
                  : 'equipment';
              return {
                id: String(rc?.id ?? i),
                cause: String(rc?.cause ?? ''),
                category,
                whyLevel: Number(rc?.whyLevel ?? 0),
                contribution: Number(rc?.contribution ?? 0),
              };
            }
          );
          const mapAction = (a: any, i: number): CorrectiveAction => {
            const st = String(a?.status ?? 'pending');
            const actionStatus: CorrectiveAction['status'] =
              st === 'in-progress' || st === 'completed' ? st : 'pending';
            return {
              id: String(a?.id ?? i),
              action: String(a?.action ?? ''),
              assignedTo: String(a?.assignedTo ?? ''),
              targetDate: String(a?.targetDate ?? ''),
              status: actionStatus,
              completionDate: a?.completionDate != null ? String(a.completionDate) : null,
            };
          };
          const correctiveActions: CorrectiveAction[] = (
            Array.isArray(r?.correctiveActions) ? r.correctiveActions : []
          ).map(mapAction);
          const preventiveActions: PreventiveAction[] = (
            Array.isArray(r?.preventiveActions) ? r.preventiveActions : []
          ).map(mapAction);
          return {
            id: String(r?.id ?? idx),
            rcaNumber: String(r?.rcaNumber ?? ''),
            downtimeEvent: String(r?.downtimeEvent ?? ''),
            equipment: String(r?.equipment ?? ''),
            incidentDate: String(r?.incidentDate ?? ''),
            severity,
            status,
            investigationLead: String(r?.investigationLead ?? ''),
            teamMembers: (Array.isArray(r?.teamMembers) ? r.teamMembers : []).map((m: any) => String(m)),
            problemStatement: String(r?.problemStatement ?? ''),
            immediateActions: (Array.isArray(r?.immediateActions) ? r.immediateActions : []).map((a: any) => String(a)),
            rootCauses,
            correctiveActions,
            preventiveActions,
            estimatedCost: Number(r?.estimatedCost ?? 0),
            actualCost: r?.actualCost != null ? Number(r.actualCost) : null,
            targetCloseDate: String(r?.targetCloseDate ?? ''),
            actualCloseDate: r?.actualCloseDate != null ? String(r.actualCloseDate) : null,
            verifiedBy: r?.verifiedBy != null ? String(r.verifiedBy) : null,
            verificationDate: r?.verificationDate != null ? String(r.verificationDate) : null,
          };
        });
        if (!cancelled) setRcaInvestigations(mapped);
      } catch (err) {
        if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setRcaInvestigations([]); }
      } finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filteredInvestigations = rcaInvestigations.filter(rca => {
    return filterStatus === 'all' || rca.status === filterStatus;
  });

  const totalRCAs = rcaInvestigations.length;
  const openRCAs = rcaInvestigations.filter(r => r.status === 'open' || r.status === 'investigating').length;
  const completedRCAs = rcaInvestigations.filter(r => r.status === 'completed' || r.status === 'implemented').length;
  const totalEstimatedCost = rcaInvestigations.reduce((sum, r) => sum + r.estimatedCost, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-700 bg-red-100';
      case 'investigating': return 'text-blue-700 bg-blue-100';
      case 'completed': return 'text-green-700 bg-green-100';
      case 'implemented': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'equipment': return 'text-red-700 bg-red-50';
      case 'process': return 'text-blue-700 bg-blue-50';
      case 'people': return 'text-green-700 bg-green-50';
      case 'material': return 'text-yellow-700 bg-yellow-50';
      case 'method': return 'text-purple-700 bg-purple-50';
      case 'environment': return 'text-orange-700 bg-orange-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-700 bg-gray-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'completed': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Modal handlers
  const handleCreateRCA = () => {
    setIsCreateRCAOpen(true);
  };

  const handleCreateRCASubmit = async (data: CreateRCAData) => {
    try {
      await ProductionOrphanService.createRootCauseAnalysis(data);
      refreshRcas();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to create RCA');
    } finally {
      setIsCreateRCAOpen(false);
    }
  };

  const handleViewRCA = (rca: any) => {
    // Convert to RCAInvestigation format
    const rcaData: RCAInvestigationType = {
      id: rca.id,
      rcaNumber: rca.rcaNumber,
      downtimeEvent: rca.downtimeEvent,
      equipment: rca.equipment,
      incidentDate: rca.incidentDate,
      severity: rca.severity,
      status: rca.status,
      investigationLead: rca.investigationLead,
      teamMembers: rca.teamMembers,
      problemStatement: rca.problemStatement,
      immediateActions: rca.immediateActions,
      // Convert root causes to match modal format
      rootCauses: rca.rootCauses.map((rc: any) => ({
        id: rc.id,
        whyLevels: Array(rc.whyLevel || 5).fill('').map((_, i) =>
          i === (rc.whyLevel || 5) - 1 ? rc.cause : `Why ${i + 1}?`
        ),
        cause: rc.cause,
        category: rc.category,
        contribution: rc.contribution
      })),
      // Add missing fields to corrective actions
      correctiveActions: rca.correctiveActions.map((ca: any) => ({
        ...ca,
        priority: 'high',
        actualCost: null,
        resourcesNeeded: '',
        estimatedCost: 0,
        completionNotes: ''
      })),
      // Add missing fields to preventive actions
      preventiveActions: rca.preventiveActions.map((pa: any) => ({
        ...pa,
        recurrenceType: 'one-time' as const,
        frequency: '',
        priority: 'medium',
        actualCost: null,
        resourcesNeeded: ''
      })),
      estimatedCost: rca.estimatedCost,
      actualCost: rca.actualCost,
      targetCloseDate: rca.targetCloseDate,
      actualCloseDate: rca.actualCloseDate,
      verifiedBy: rca.verifiedBy,
      verificationDate: rca.verificationDate,
      effectivenessRating: rca.effectivenessRating || null,
      lessonsLearned: rca.lessonsLearned || null
    };
    setSelectedRCA(rcaData);
    setIsViewRCAOpen(true);
  };

  const handleAddRootCause = () => {
    setIsViewRCAOpen(false);
    setIsAddRootCauseOpen(true);
  };

  const handleAddRootCauseSubmit = async (data: AddRootCauseData) => {
    const rcaId = selectedRCA?.id;
    try {
      if (rcaId) {
        await ProductionOrphanService.updateRootCauseAnalysis(rcaId, { rootCause: data });
        refreshRcas();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add root cause');
    } finally {
      setIsAddRootCauseOpen(false);
      setIsViewRCAOpen(true);
    }
  };

  const handleAddCorrectiveAction = () => {
    setIsViewRCAOpen(false);
    setIsAddCorrectiveActionOpen(true);
  };

  const handleAddCorrectiveActionSubmit = async (data: Partial<CorrectiveAction>) => {
    const rcaId = selectedRCA?.id;
    try {
      if (rcaId) {
        await ProductionOrphanService.addRcaCorrectiveAction(rcaId, data);
        refreshRcas();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add corrective action');
    }
  };

  const handleAddPreventiveAction = () => {
    setIsViewRCAOpen(false);
    setIsAddPreventiveActionOpen(true);
  };

  const handleAddPreventiveActionSubmit = async (data: Partial<PreventiveAction>) => {
    const rcaId = selectedRCA?.id;
    try {
      if (rcaId) {
        await ProductionOrphanService.updateRootCauseAnalysis(rcaId, { preventiveAction: data });
        refreshRcas();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add preventive action');
    }
  };

  const handleUpdateActionStatus = (action: any, actionType: 'corrective' | 'preventive') => {
    setSelectedAction(action);
    setSelectedActionType(actionType);
    setIsViewRCAOpen(false);
    setIsUpdateActionOpen(true);
  };

  const handleUpdateActionStatusSubmit = async (data: UpdateActionStatusData) => {
    const rcaId = selectedRCA?.id;
    try {
      if (rcaId) {
        await ProductionOrphanService.updateRootCauseAnalysis(rcaId, {
          actionType: selectedActionType,
          actionId: selectedAction?.id,
          actionStatus: data,
        });
        refreshRcas();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update action status');
    } finally {
      setIsUpdateActionOpen(false);
      setIsViewRCAOpen(true);
    }
  };

  const handleVerifyRCA = () => {
    setIsViewRCAOpen(false);
    setIsVerifyRCAOpen(true);
  };

  const handleVerifyRCASubmit = async (data: VerifyRCAData) => {
    const rcaId = selectedRCA?.id;
    try {
      if (rcaId) {
        await ProductionOrphanService.verifyRootCauseAnalysis(rcaId, data);
        refreshRcas();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to verify RCA');
    } finally {
      setIsVerifyRCAOpen(false);
    }
  };

  const handleRequestRevisions = async () => {
    const rcaId = selectedRCA?.id;
    try {
      if (rcaId) {
        await ProductionOrphanService.updateRootCauseAnalysis(rcaId, { status: 'investigating' });
        refreshRcas();
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to request revisions');
    } finally {
      setIsVerifyRCAOpen(false);
      setIsViewRCAOpen(true);
    }
  };

  const handleExport = () => {
    setIsExportOpen(true);
  };

  const handleExportSubmit = async (_config: ExportRCAConfig): Promise<void> => {
    exportToCsv('downtime-rca', filteredInvestigations as unknown as Record<string, unknown>[]);
    setIsExportOpen(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Root Cause Analysis (RCA)</h1>
            <p className="text-sm text-gray-500 mt-1">Investigate and prevent recurring downtime events</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleCreateRCA}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New RCA</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total RCAs</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalRCAs}</p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Open / Investigating</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{openRCAs}</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{completedRCAs}</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Est. Cost</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{(totalEstimatedCost / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="completed">Completed</option>
            <option value="implemented">Implemented</option>
          </select>
        </div>
      </div>

      {/* RCA Investigations */}
      <div className="space-y-3">
        {filteredInvestigations.map((rca) => (
          <div
            key={rca.id}
            className={`bg-white rounded-xl border-2 p-3 cursor-pointer hover:shadow-lg transition-shadow ${getSeverityColor(rca.severity)}`}
            onClick={() => handleViewRCA(rca)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{rca.rcaNumber}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(rca.severity)}`}>
                    {rca.severity}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rca.status)}`}>
                    {rca.status}
                  </span>
                </div>
                <p className="text-gray-700 font-medium mb-2">{rca.equipment}</p>
                <p className="text-sm text-gray-600">Event: {rca.downtimeEvent} | Date: {rca.incidentDate}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRCAId(selectedRCAId === rca.id ? null : rca.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                {selectedRCAId === rca.id ? 'Hide Details' : 'Toggle Inline Details'}
              </button>
            </div>

            {/* Problem Statement */}
            <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 mb-1">Problem Statement</p>
              <p className="text-sm text-gray-700">{rca.problemStatement}</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Investigation Lead</p>
                <p className="text-sm font-semibold text-gray-900">{rca.investigationLead}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Team Size</p>
                <p className="text-sm font-semibold text-blue-900">{rca.teamMembers.length} members</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-600">Est. Cost</p>
                <p className="text-sm font-semibold text-orange-900">₹{(rca.estimatedCost / 1000).toFixed(0)}K</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600">Target Close</p>
                <p className="text-sm font-semibold text-green-900">{rca.targetCloseDate}</p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedRCAId === rca.id && (
              <div className="space-y-2 pt-4 border-t border-gray-200">
                {/* Root Causes */}
                <div>
                  <h4 className="text-md font-bold text-gray-900 mb-3">Root Causes (5 Whys Analysis)</h4>
                  <div className="space-y-2">
                    {rca.rootCauses.map((cause) => (
                      <div key={cause.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(cause.category)}`}>
                                {cause.category}
                              </span>
                              <span className="text-xs text-gray-500">Why Level {cause.whyLevel}</span>
                            </div>
                            <p className="text-sm text-gray-900">{cause.cause}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-red-600">{cause.contribution}%</p>
                            <p className="text-xs text-gray-500">contribution</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Corrective Actions */}
                <div>
                  <h4 className="text-md font-bold text-gray-900 mb-3">Corrective Actions</h4>
                  <div className="space-y-2">
                    {rca.correctiveActions.map((action) => (
                      <div key={action.id} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">{action.action}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>Assigned: {action.assignedTo}</span>
                              <span>Due: {action.targetDate}</span>
                              {action.completionDate && <span className="text-green-600">Completed: {action.completionDate}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionStatusColor(action.status)}`}>
                            {action.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preventive Actions */}
                <div>
                  <h4 className="text-md font-bold text-gray-900 mb-3">Preventive Actions</h4>
                  <div className="space-y-2">
                    {rca.preventiveActions.map((action) => (
                      <div key={action.id} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">{action.action}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>Assigned: {action.assignedTo}</span>
                              <span>Due: {action.targetDate}</span>
                              {action.completionDate && <span className="text-green-600">Completed: {action.completionDate}</span>}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getActionStatusColor(action.status)}`}>
                            {action.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification */}
                {rca.verifiedBy && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-semibold text-green-800">
                        Verified by {rca.verifiedBy} on {rca.verificationDate}
                      </p>
                    </div>
                    {rca.actualCost && (
                      <p className="text-sm text-green-700 mt-1">
                        Actual Cost: ₹{rca.actualCost.toLocaleString()} (vs Estimated: ₹{rca.estimatedCost.toLocaleString()})
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      <CreateRCAModal
        isOpen={isCreateRCAOpen}
        onClose={() => setIsCreateRCAOpen(false)}
        onSubmit={handleCreateRCASubmit}
      />

      <ViewRCADetailsModal
        isOpen={isViewRCAOpen}
        onClose={() => setIsViewRCAOpen(false)}
        investigation={selectedRCA}
        onEdit={() => alert('Edit RCA not implemented')}
        onAddRootCause={handleAddRootCause}
        onAddCorrectiveAction={handleAddCorrectiveAction}
        onAddPreventiveAction={handleAddPreventiveAction}
        onVerifyClose={handleVerifyRCA}
        onExportReport={() => {
          setIsViewRCAOpen(false);
          handleExport();
        }}
      />

      <AddRootCauseModal
        isOpen={isAddRootCauseOpen}
        onClose={() => {
          setIsAddRootCauseOpen(false);
          setIsViewRCAOpen(true);
        }}
        onSubmit={handleAddRootCauseSubmit}
      />

      <AddCorrectiveActionModal
        isOpen={isAddCorrectiveActionOpen}
        onClose={() => {
          setIsAddCorrectiveActionOpen(false);
          setIsViewRCAOpen(true);
        }}
        onSubmit={(data, addAnother) => {
          handleAddCorrectiveActionSubmit(data);
          if (!addAnother) {
            setIsAddCorrectiveActionOpen(false);
            setIsViewRCAOpen(true);
          }
        }}
      />

      <AddPreventiveActionModal
        isOpen={isAddPreventiveActionOpen}
        onClose={() => {
          setIsAddPreventiveActionOpen(false);
          setIsViewRCAOpen(true);
        }}
        onSubmit={(data, addAnother) => {
          handleAddPreventiveActionSubmit(data);
          if (!addAnother) {
            setIsAddPreventiveActionOpen(false);
            setIsViewRCAOpen(true);
          }
        }}
      />

      <UpdateActionStatusModal
        isOpen={isUpdateActionOpen}
        onClose={() => {
          setIsUpdateActionOpen(false);
          setIsViewRCAOpen(true);
        }}
        onSubmit={handleUpdateActionStatusSubmit}
        action={selectedAction}
        actionType={selectedActionType}
      />

      <VerifyRCAModal
        isOpen={isVerifyRCAOpen}
        onClose={() => {
          setIsVerifyRCAOpen(false);
          setIsViewRCAOpen(true);
        }}
        onSubmit={handleVerifyRCASubmit}
        onRequestRevisions={handleRequestRevisions}
        investigation={selectedRCA}
      />

      <ExportRCAReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  );
}
