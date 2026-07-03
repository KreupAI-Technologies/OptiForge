'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Filter, AlertTriangle, CheckCircle, Clock, FileText, Users, Plus } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
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

  // Mock RCA investigations
  const rcaInvestigations: RCAInvestigation[] = [
    {
      id: '1',
      rcaNumber: 'RCA-2025-015',
      downtimeEvent: 'DT-2025-0156',
      equipment: 'ASSY-LINE-01 - Assembly Conveyor Line #1',
      incidentDate: '2025-10-20',
      severity: 'critical',
      status: 'investigating',
      investigationLead: 'Maintenance Manager',
      teamMembers: ['Maintenance Technician', 'Production Supervisor', 'Quality Engineer'],
      problemStatement: 'Assembly conveyor line #1 experienced complete motor failure resulting in 165 minutes of unplanned downtime, affecting 2 work orders and causing production loss of 85 units valued at ₹425,000.',
      immediateActions: [
        'Isolated power supply to prevent safety hazards',
        'Redirected work orders to Assembly Line #2',
        'Ordered replacement motor from supplier',
        'Initiated emergency maintenance protocol'
      ],
      rootCauses: [
        {
          id: '1',
          cause: 'Motor bearing seized due to inadequate lubrication',
          category: 'equipment',
          whyLevel: 5,
          contribution: 60
        },
        {
          id: '2',
          cause: 'Preventive maintenance schedule not followed consistently',
          category: 'process',
          whyLevel: 4,
          contribution: 30
        },
        {
          id: '3',
          cause: 'Vibration monitoring system not detecting early warning signs',
          category: 'equipment',
          whyLevel: 3,
          contribution: 10
        }
      ],
      correctiveActions: [
        {
          id: '1',
          action: 'Replace failed motor with new unit',
          assignedTo: 'Maintenance Team Lead',
          targetDate: '2025-10-22',
          status: 'in-progress',
          completionDate: null
        },
        {
          id: '2',
          action: 'Lubricate all conveyor motors as per specification',
          assignedTo: 'Maintenance Technician',
          targetDate: '2025-10-23',
          status: 'pending',
          completionDate: null
        },
        {
          id: '3',
          action: 'Calibrate vibration sensors on all assembly lines',
          assignedTo: 'Instrumentation Team',
          targetDate: '2025-10-25',
          status: 'pending',
          completionDate: null
        }
      ],
      preventiveActions: [
        {
          id: '1',
          action: 'Implement automated lubrication reminder system',
          assignedTo: 'Maintenance Planner',
          targetDate: '2025-11-15',
          status: 'pending',
          completionDate: null
        },
        {
          id: '2',
          action: 'Upgrade vibration monitoring to predictive maintenance platform',
          assignedTo: 'Engineering Manager',
          targetDate: '2025-12-01',
          status: 'pending',
          completionDate: null
        },
        {
          id: '3',
          action: 'Conduct maintenance team training on PM importance',
          assignedTo: 'HR Training',
          targetDate: '2025-11-10',
          status: 'pending',
          completionDate: null
        }
      ],
      estimatedCost: 550000,
      actualCost: null,
      targetCloseDate: '2025-11-05',
      actualCloseDate: null,
      verifiedBy: null,
      verificationDate: null
    },
    {
      id: '2',
      rcaNumber: 'RCA-2025-014',
      downtimeEvent: 'DT-2025-0150',
      equipment: 'CNC-CUT-01 - CNC Cutting Machine #1',
      incidentDate: '2025-10-18',
      severity: 'high',
      status: 'completed',
      investigationLead: 'Quality Manager',
      teamMembers: ['Calibration Engineer', 'CNC Operator', 'Production Manager'],
      problemStatement: 'CNC cutting machine #1 produced parts with dimensional non-conformance, requiring 165 minutes of calibration downtime and scrapping of 50 units valued at ₹245,000.',
      immediateActions: [
        'Stopped production immediately upon detection',
        'Quarantined all parts produced in last 4 hours',
        'Performed emergency calibration',
        'Verified calibration with test parts'
      ],
      rootCauses: [
        {
          id: '1',
          cause: 'Cutting tool worn beyond tolerance limits',
          category: 'equipment',
          whyLevel: 5,
          contribution: 50
        },
        {
          id: '2',
          cause: 'Tool wear monitoring system deactivated by operator',
          category: 'people',
          whyLevel: 4,
          contribution: 35
        },
        {
          id: '3',
          cause: 'Inadequate operator training on tool monitoring',
          category: 'method',
          whyLevel: 3,
          contribution: 15
        }
      ],
      correctiveActions: [
        {
          id: '1',
          action: 'Replaced worn cutting tools with new set',
          assignedTo: 'Maintenance Technician',
          targetDate: '2025-10-18',
          status: 'completed',
          completionDate: '2025-10-18'
        },
        {
          id: '2',
          action: 'Recalibrated CNC machine to specifications',
          assignedTo: 'Calibration Team',
          targetDate: '2025-10-18',
          status: 'completed',
          completionDate: '2025-10-18'
        },
        {
          id: '3',
          action: 'Inspected and approved first article after calibration',
          assignedTo: 'Quality Inspector',
          targetDate: '2025-10-18',
          status: 'completed',
          completionDate: '2025-10-18'
        }
      ],
      preventiveActions: [
        {
          id: '1',
          action: 'Implement automatic tool wear alerts - cannot be disabled',
          assignedTo: 'IT Department',
          targetDate: '2025-10-25',
          status: 'completed',
          completionDate: '2025-10-24'
        },
        {
          id: '2',
          action: 'Conduct refresher training for all CNC operators',
          assignedTo: 'Training Coordinator',
          targetDate: '2025-10-30',
          status: 'completed',
          completionDate: '2025-10-28'
        },
        {
          id: '3',
          action: 'Update work instruction with tool monitoring mandatory step',
          assignedTo: 'Process Engineer',
          targetDate: '2025-10-22',
          status: 'completed',
          completionDate: '2025-10-21'
        }
      ],
      estimatedCost: 285000,
      actualCost: 268000,
      targetCloseDate: '2025-10-30',
      actualCloseDate: '2025-10-29',
      verifiedBy: 'Operations Head',
      verificationDate: '2025-10-29'
    },
    {
      id: '3',
      rcaNumber: 'RCA-2025-013',
      downtimeEvent: 'DT-2025-0148',
      equipment: 'POLISH-01 - Polishing Machine #1',
      incidentDate: '2025-10-16',
      severity: 'high',
      status: 'implemented',
      investigationLead: 'Production Manager',
      teamMembers: ['Maintenance Supervisor', 'Safety Officer', 'Operator'],
      problemStatement: 'Polishing machine motor overheated and triggered safety shutdown, resulting in 185 minutes of downtime and quality issues on 25 units.',
      immediateActions: [
        'Activated safety shutdown protocol',
        'Allowed motor to cool down completely',
        'Inspected motor and cooling system',
        'Cleaned air intake filters'
      ],
      rootCauses: [
        {
          id: '1',
          cause: 'Air intake filters clogged with dust - 80% blockage',
          category: 'equipment',
          whyLevel: 5,
          contribution: 70
        },
        {
          id: '2',
          cause: 'Filter cleaning not included in daily checklist',
          category: 'process',
          whyLevel: 4,
          contribution: 20
        },
        {
          id: '3',
          cause: 'Environmental dust levels higher than design specification',
          category: 'environment',
          whyLevel: 2,
          contribution: 10
        }
      ],
      correctiveActions: [
        {
          id: '1',
          action: 'Replaced all air intake filters',
          assignedTo: 'Maintenance Team',
          targetDate: '2025-10-16',
          status: 'completed',
          completionDate: '2025-10-16'
        },
        {
          id: '2',
          action: 'Deep cleaned motor cooling system',
          assignedTo: 'Maintenance Team',
          targetDate: '2025-10-16',
          status: 'completed',
          completionDate: '2025-10-16'
        }
      ],
      preventiveActions: [
        {
          id: '1',
          action: 'Added daily filter inspection to operator checklist',
          assignedTo: 'Production Supervisor',
          targetDate: '2025-10-18',
          status: 'completed',
          completionDate: '2025-10-17'
        },
        {
          id: '2',
          action: 'Installed automatic filter pressure sensors with alerts',
          assignedTo: 'Engineering Team',
          targetDate: '2025-10-28',
          status: 'completed',
          completionDate: '2025-10-26'
        },
        {
          id: '3',
          action: 'Improved ventilation in finishing department',
          assignedTo: 'Facilities Team',
          targetDate: '2025-11-15',
          status: 'completed',
          completionDate: '2025-11-12'
        }
      ],
      estimatedCost: 165000,
      actualCost: 148000,
      targetCloseDate: '2025-11-15',
      actualCloseDate: '2025-11-12',
      verifiedBy: 'Maintenance Manager',
      verificationDate: '2025-11-13'
    }
  ];

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

  const handleCreateRCASubmit = (data: CreateRCAData) => {
    console.log('Creating RCA:', data);
    // TODO: Implement API call
    setIsCreateRCAOpen(false);
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

  const handleAddRootCauseSubmit = (data: AddRootCauseData) => {
    console.log('Adding root cause:', data);
    // TODO: Implement API call
    setIsAddRootCauseOpen(false);
    setIsViewRCAOpen(true);
  };

  const handleAddCorrectiveAction = () => {
    setIsViewRCAOpen(false);
    setIsAddCorrectiveActionOpen(true);
  };

  const handleAddCorrectiveActionSubmit = (data: Partial<CorrectiveAction>) => {
    console.log('Adding corrective action:', data);
    // TODO: Implement API call
  };

  const handleAddPreventiveAction = () => {
    setIsViewRCAOpen(false);
    setIsAddPreventiveActionOpen(true);
  };

  const handleAddPreventiveActionSubmit = (data: Partial<PreventiveAction>) => {
    console.log('Adding preventive action:', data);
    // TODO: Implement API call
  };

  const handleUpdateActionStatus = (action: any, actionType: 'corrective' | 'preventive') => {
    setSelectedAction(action);
    setSelectedActionType(actionType);
    setIsViewRCAOpen(false);
    setIsUpdateActionOpen(true);
  };

  const handleUpdateActionStatusSubmit = (data: UpdateActionStatusData) => {
    console.log('Updating action status:', data);
    // TODO: Implement API call
    setIsUpdateActionOpen(false);
    setIsViewRCAOpen(true);
  };

  const handleVerifyRCA = () => {
    setIsViewRCAOpen(false);
    setIsVerifyRCAOpen(true);
  };

  const handleVerifyRCASubmit = (data: VerifyRCAData) => {
    console.log('Verifying RCA:', data);
    // TODO: Implement API call
    setIsVerifyRCAOpen(false);
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
        onRequestRevisions={() => {
          console.log('Revisions requested');
          setIsVerifyRCAOpen(false);
          setIsViewRCAOpen(true);
        }}
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
