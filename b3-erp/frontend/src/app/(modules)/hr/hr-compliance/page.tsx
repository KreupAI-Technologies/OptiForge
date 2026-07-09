'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, Scale, FileText, Building2, AlertTriangle, Users, ClipboardCheck,
  Plus, Search, Filter, Calendar, Award, Eye, BarChart3, Bell, Clock,
  CheckCircle, XCircle, AlertCircle, FileCheck, Briefcase, ChevronRight,
  TrendingUp, PieChart, Activity, Settings, RefreshCw
} from 'lucide-react';
import {
  HRComplianceService,
  ComplianceStatus,
  RiskLevel,
  ReturnStatus,
  LicenseStatus,
  GrievanceStatus,
  AuditStatus,
  AlertSeverity,
  type ComplianceTracker,
  type LaborRegister,
  type ComplianceCalendarEvent,
  type StatutoryReturn,
  type License,
  type PolicyViolation,
  type DisciplinaryAction,
  type DiversityMetrics,
  type Grievance,
  type ComplianceAudit,
  type AuditFinding,
  type ComplianceAlert,
  type ComplianceDashboard,
  type ComplianceCertificateRecord,
  type PolicyAcknowledgmentRecord,
  type PoshComplaintRecord,
  type RemediationPlanRecord,
  type StatutoryReportSummary,
} from '@/services/hr-compliance.service';

// ============================================================================
// Types
// ============================================================================

type MainTab = 'labor_laws' | 'statutory_returns' | 'licenses' | 'policy' | 'equal_opportunity' | 'audit' | 'reports';
type LaborLawsSubTab = 'tracker' | 'registers' | 'calendar';
type StatutoryReturnsSubTab = 'pf' | 'esi' | 'tds' | 'pt' | 'lwf';
type LicensesSubTab = 'master' | 'renewal' | 'certificates';
type PolicySubTab = 'acknowledgment' | 'violations' | 'disciplinary';
type EqualOpportunitySubTab = 'diversity' | 'eeo_reports' | 'grievance' | 'posh';
type AuditSubTab = 'audits' | 'findings' | 'remediation';
type ReportsSubTab = 'dashboard' | 'statutory' | 'alerts';

// ============================================================================
// Dashboard Component
// ============================================================================

function ComplianceDashboardView({ dashboard }: { dashboard: ComplianceDashboard | null }) {
  if (!dashboard) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{dashboard.summary.totalCompliances}</span>
          </div>
          <p className="text-sm text-gray-400">Total Compliances</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{dashboard.summary.compliantCount}</span>
          </div>
          <p className="text-sm text-gray-400">Compliant</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{dashboard.summary.nonCompliantCount}</span>
          </div>
          <p className="text-sm text-gray-400">Non-Compliant</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{dashboard.summary.pendingCount}</span>
          </div>
          <p className="text-sm text-gray-400">Pending</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{dashboard.summary.complianceRate}%</span>
          </div>
          <p className="text-sm text-gray-400">Compliance Rate</p>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-red-400" />
            <span className="text-lg font-semibold text-white">{dashboard.alerts.activeAlerts}</span>
          </div>
          <p className="text-xs text-gray-400">Active Alerts</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-yellow-400" />
            <span className="text-lg font-semibold text-white">{dashboard.alerts.licensesExpiringSoon}</span>
          </div>
          <p className="text-xs text-gray-400">Licenses Expiring</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-orange-400" />
            <span className="text-lg font-semibold text-white">{dashboard.alerts.pendingReturns}</span>
          </div>
          <p className="text-xs text-gray-400">Pending Returns</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-lg font-semibold text-white">{dashboard.alerts.openGrievances}</span>
          </div>
          <p className="text-xs text-gray-400">Open Grievances</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-purple-400" />
            <span className="text-lg font-semibold text-white">{dashboard.alerts.openAuditFindings}</span>
          </div>
          <p className="text-xs text-gray-400">Open Findings</p>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      {dashboard.upcomingDeadlines.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {dashboard.upcomingDeadlines.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-white text-sm">{event.eventTitle}</p>
                    <p className="text-xs text-gray-500">{event.referenceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{event.eventDate}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    event.priority === 'high' ? 'bg-red-900 text-red-300' :
                    event.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {event.priority}
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
// Labor Laws Section
// ============================================================================

function LaborLawsSection({
  trackers,
  registers,
  calendarEvents,
  subTab
}: {
  trackers: ComplianceTracker[];
  registers: LaborRegister[];
  calendarEvents: ComplianceCalendarEvent[];
  subTab: LaborLawsSubTab;
}) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-900 text-red-300';
      case 'high': return 'bg-orange-900 text-orange-300';
      case 'medium': return 'bg-yellow-900 text-yellow-300';
      case 'low': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-900 text-green-300';
      case 'non_compliant': return 'bg-red-900 text-red-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      case 'partially_compliant': return 'bg-orange-900 text-orange-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'tracker') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Compliance Tracker</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="h-4 w-4" />
              Add Compliance
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {trackers.map((tracker) => (
            <div key={tracker.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{tracker.trackerCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(tracker.complianceStatus)}`}>
                      {tracker.complianceStatus.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(tracker.riskLevel)}`}>
                      {tracker.riskLevel} risk
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{tracker.complianceName}</h4>
                  {tracker.description && <p className="text-sm text-gray-400">{tracker.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Due Date</p>
                  <p className="text-white text-sm">{tracker.nextDueDate || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm text-gray-300">{tracker.complianceType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Act</p>
                  <p className="text-sm text-gray-300">{tracker.actName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Frequency</p>
                  <p className="text-sm text-gray-300 capitalize">{tracker.frequency.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Responsible</p>
                  <p className="text-sm text-gray-300">{tracker.responsiblePersonName || 'N/A'}</p>
                </div>
              </div>

              {tracker.penaltyAmount && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Penalty: ₹{tracker.penaltyAmount.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subTab === 'registers') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Labor Registers</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Register
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Register Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Act Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Form No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Entries</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Entry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {registers.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{reg.registerCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{reg.registerName}</p>
                      {reg.description && <p className="text-xs text-gray-500">{reg.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{reg.registerType}</td>
                  <td className="px-4 py-3 text-gray-300">{reg.actReference || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{reg.formNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{reg.maintenanceMode}</td>
                  <td className="px-4 py-3 text-gray-300">{reg.totalEntries.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-300">{reg.lastEntryDate || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      reg.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Calendar view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Compliance Calendar</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calendarEvents.map((event) => (
          <div key={event.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className={`px-2 py-0.5 rounded text-xs ${
                  event.priority === 'high' ? 'bg-red-900 text-red-300' :
                  event.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {event.priority}
                </span>
              </div>
              <span className="text-white font-medium">{event.eventDate}</span>
            </div>
            <h4 className="text-white font-medium mb-1">{event.eventTitle}</h4>
            {event.eventDescription && <p className="text-sm text-gray-400 mb-2">{event.eventDescription}</p>}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{event.referenceName}</span>
              {event.assignedToName && <span className="text-gray-400">Assigned: {event.assignedToName}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Statutory Returns Section
// ============================================================================

function StatutoryReturnsSection({
  returns,
  subTab
}: {
  returns: StatutoryReturn[];
  subTab: StatutoryReturnsSubTab;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-900 text-green-300';
      case 'acknowledged': return 'bg-green-900 text-green-300';
      case 'verified': return 'bg-blue-900 text-blue-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      case 'draft': return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const filteredReturns = returns.filter(r => r.returnType === subTab);

  const returnTypeLabels: Record<string, string> = {
    pf: 'PF Returns',
    esi: 'ESI Returns',
    tds: 'TDS Returns',
    pt: 'PT Returns',
    lwf: 'LWF Returns',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{returnTypeLabels[subTab]}</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            New Return
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReturns.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
            No {returnTypeLabels[subTab]} found
          </div>
        ) : (
          filteredReturns.map((ret) => (
            <div key={ret.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{ret.returnCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ret.status)}`}>
                      {ret.status}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{ret.returnName}</h4>
                  <p className="text-sm text-gray-400">{ret.formNumber ? `Form: ${ret.formNumber}` : ''} | Period: {ret.periodStart} to {ret.periodEnd}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Filing Due</p>
                  <p className="text-white font-medium">{ret.filingDueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                {ret.employeeContribution !== undefined && (
                  <div>
                    <p className="text-xs text-gray-400">Employee Contribution</p>
                    <p className="text-lg text-white font-semibold">₹{ret.employeeContribution.toLocaleString()}</p>
                  </div>
                )}
                {ret.employerContribution !== undefined && (
                  <div>
                    <p className="text-xs text-gray-400">Employer Contribution</p>
                    <p className="text-lg text-white font-semibold">₹{ret.employerContribution.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Total Amount</p>
                  <p className="text-lg text-white font-semibold">₹{ret.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Covered Employees</p>
                  <p className="text-lg text-white font-semibold">{ret.coveredEmployees || ret.totalEmployees || '-'}</p>
                </div>
              </div>

              {ret.acknowledgmentNumber && (
                <div className="flex items-center gap-4 text-sm border-t border-gray-700 pt-3">
                  <span className="text-gray-400">Ack No: <span className="text-green-400">{ret.acknowledgmentNumber}</span></span>
                  {ret.challanNumber && <span className="text-gray-400">Challan: <span className="text-blue-400">{ret.challanNumber}</span></span>}
                  {ret.actualFilingDate && <span className="text-gray-400">Filed: {ret.actualFilingDate}</span>}
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
                {ret.status === 'pending' && (
                  <button className="text-green-400 hover:text-green-300 text-sm">File Return</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Licenses Section
// ============================================================================

function LicensesSection({
  licenses,
  subTab,
  certificates,
  certLoading,
  certError,
  onReloadCertificates,
}: {
  licenses: License[];
  subTab: LicensesSubTab;
  certificates: ComplianceCertificateRecord[];
  certLoading: boolean;
  certError: string | null;
  onReloadCertificates: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-300';
      case 'expired': return 'bg-red-900 text-red-300';
      case 'under_renewal': return 'bg-yellow-900 text-yellow-300';
      case 'suspended': return 'bg-orange-900 text-orange-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getRenewalStatusColor = (status?: string) => {
    switch (status) {
      case 'due_soon': return 'bg-yellow-900 text-yellow-300';
      case 'overdue': return 'bg-red-900 text-red-300';
      case 'not_applicable': return 'bg-gray-700 text-gray-300';
      default: return 'bg-green-900 text-green-300';
    }
  };

  if (subTab === 'master') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">License Master</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="h-4 w-4" />
              Add License
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">License Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Authority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">License No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valid Till</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Renewal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{lic.licenseCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{lic.licenseName}</p>
                      {lic.description && <p className="text-xs text-gray-500">{lic.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{lic.licenseType.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-300">{lic.issuingAuthority}</td>
                  <td className="px-4 py-3 text-gray-300">{lic.licenseNumber || lic.registrationNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{lic.validTo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lic.status)}`}>
                      {lic.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getRenewalStatusColor(lic.renewalStatus)}`}>
                      {lic.renewalStatus?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (subTab === 'renewal') {
    const renewableLicenses = licenses.filter(l => l.renewalStatus !== 'not_applicable');
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Renewal Tracking</h3>
        </div>

        <div className="space-y-3">
          {renewableLicenses.map((lic) => (
            <div key={lic.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{lic.licenseCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getRenewalStatusColor(lic.renewalStatus)}`}>
                      {lic.renewalStatus?.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{lic.licenseName}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Expires On</p>
                  <p className="text-white font-medium">{lic.validTo}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">License Number</p>
                  <p className="text-sm text-gray-300">{lic.licenseNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Issuing Authority</p>
                  <p className="text-sm text-gray-300">{lic.issuingAuthority}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Renewal Fee</p>
                  <p className="text-sm text-gray-300">{lic.renewalFee ? `₹${lic.renewalFee.toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                  <RefreshCw className="h-4 w-4" />
                  Initiate Renewal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Certificates
  const getCertStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900 text-green-300';
      case 'expired': return 'bg-red-900 text-red-300';
      case 'suspended': return 'bg-orange-900 text-orange-300';
      case 'pending': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Compliance Certificates</h3>
        <button
          onClick={onReloadCertificates}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {certLoading ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          Loading certificates...
        </div>
      ) : certError ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-red-800 text-center text-red-400">
          {certError}
          <div className="mt-3">
            <button onClick={onReloadCertificates} className="text-blue-400 hover:text-blue-300 text-sm">Retry</button>
          </div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          No compliance certificates recorded yet.
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Certificate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Authority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Valid Till</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{cert.certificateCode || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{cert.certificateName || '-'}</p>
                      {cert.description && <p className="text-xs text-gray-500">{cert.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{cert.certificateType || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{cert.issuingAuthority || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{cert.certificateNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{cert.validTo || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getCertStatusColor(cert.status)}`}>
                      {cert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Policy Compliance Section
// ============================================================================

function PolicyComplianceSection({
  violations,
  disciplinaryActions,
  subTab,
  acknowledgments,
  ackLoading,
  ackError,
  onReloadAcknowledgments,
}: {
  violations: PolicyViolation[];
  disciplinaryActions: DisciplinaryAction[];
  subTab: PolicySubTab;
  acknowledgments: PolicyAcknowledgmentRecord[];
  ackLoading: boolean;
  ackError: string | null;
  onReloadAcknowledgments: () => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-300';
      case 'high': return 'bg-orange-900 text-orange-300';
      case 'medium': return 'bg-yellow-900 text-yellow-300';
      case 'low': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'acknowledgment') {
    const ackStatusColor = (status: string) => {
      switch (status) {
        case 'acknowledged': return 'bg-green-900 text-green-300';
        case 'pending': return 'bg-yellow-900 text-yellow-300';
        case 'overdue': return 'bg-red-900 text-red-300';
        default: return 'bg-gray-700 text-gray-300';
      }
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Policy Acknowledgment</h3>
          <button
            onClick={onReloadAcknowledgments}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {ackLoading ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
            Loading acknowledgments...
          </div>
        ) : ackError ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-red-800 text-center text-red-400">
            {ackError}
            <div className="mt-3">
              <button onClick={onReloadAcknowledgments} className="text-blue-400 hover:text-blue-300 text-sm">Retry</button>
            </div>
          </div>
        ) : acknowledgments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
            No policy acknowledgments recorded yet.
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Policy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Version</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Acknowledged</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {acknowledgments.map((ack) => (
                  <tr key={ack.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white">{ack.employeeName || '-'}</p>
                        {ack.department && <p className="text-xs text-gray-500">{ack.department}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{ack.policyName || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{ack.policyVersion || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{ack.assignedDate || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{ack.dueDate || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{ack.acknowledgmentDate || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${ackStatusColor(ack.status)}`}>
                        {ack.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (subTab === 'violations') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Policy Violations</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="h-4 w-4" />
              Report Violation
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {violations.map((violation) => (
            <div key={violation.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{violation.violationCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(violation.severity)}`}>
                      {violation.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      violation.status === 'action_taken' ? 'bg-green-900 text-green-300' :
                      violation.status === 'investigating' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {violation.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{violation.policyName}</h4>
                  <p className="text-sm text-gray-400">{violation.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Violation Date</p>
                  <p className="text-white text-sm">{violation.violationDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Employee</p>
                  <p className="text-sm text-gray-300">{violation.employeeName} ({violation.employeeCode})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm text-gray-300">{violation.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Reported By</p>
                  <p className="text-sm text-gray-300">{violation.isAnonymous ? 'Anonymous' : violation.reportedByName}</p>
                </div>
              </div>

              {violation.actionTaken && (
                <div className="flex items-center gap-2 text-sm text-green-400 pt-3 border-t border-gray-700">
                  <CheckCircle className="h-4 w-4" />
                  Action: {violation.actionTaken}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Disciplinary Actions
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Disciplinary Actions</h3>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="h-4 w-4" />
          Initiate Action
        </button>
      </div>

      <div className="space-y-3">
        {disciplinaryActions.map((action) => (
          <div key={action.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 font-mono text-sm">{action.actionCode}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(action.actionSeverity)}`}>
                    {action.actionSeverity}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    action.status === 'completed' ? 'bg-green-900 text-green-300' :
                    action.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {action.status}
                  </span>
                </div>
                <h4 className="text-white font-medium">{action.employeeName} ({action.employeeCode})</h4>
                <p className="text-sm text-gray-400">{action.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Initiated</p>
                <p className="text-white text-sm">{action.initiationDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-400">Action Type</p>
                <p className="text-sm text-gray-300 capitalize">{action.actionType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Department</p>
                <p className="text-sm text-gray-300">{action.department || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Showcause Issued</p>
                <p className="text-sm text-gray-300">{action.showcauseIssued ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Hearing Conducted</p>
                <p className="text-sm text-gray-300">{action.hearingConducted ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {action.decision && (
              <div className="text-sm text-gray-300 pt-3 border-t border-gray-700">
                <span className="text-gray-400">Decision:</span> {action.decision}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Equal Opportunity Section
// ============================================================================

function EqualOpportunitySection({
  diversityMetrics,
  grievances,
  subTab,
  poshComplaints,
  poshLoading,
  poshError,
  onReloadPosh,
}: {
  diversityMetrics: DiversityMetrics[];
  grievances: Grievance[];
  subTab: EqualOpportunitySubTab;
  poshComplaints: PoshComplaintRecord[];
  poshLoading: boolean;
  poshError: string | null;
  onReloadPosh: () => void;
}) {
  if (subTab === 'diversity') {
    const metrics = diversityMetrics[0];
    if (!metrics) {
      return (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          No diversity metrics available
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Diversity Metrics</h3>
          <span className="text-sm text-gray-400">{metrics.periodStart} to {metrics.periodEnd}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Total Employees</p>
            <p className="text-2xl font-bold text-white">{metrics.totalEmployees}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Gender Diversity</p>
            <p className="text-2xl font-bold text-purple-400">{metrics.genderDiversityPercent?.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">PWD Inclusion</p>
            <p className="text-2xl font-bold text-blue-400">{metrics.pwdPercent?.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-1">Pay Gap</p>
            <p className="text-2xl font-bold text-yellow-400">{metrics.payGapPercent?.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-4">Gender Distribution</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Male</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(metrics.maleCount / metrics.totalEmployees) * 100}%` }} />
                  </div>
                  <span className="text-white w-12 text-right">{metrics.maleCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Female</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(metrics.femaleCount / metrics.totalEmployees) * 100}%` }} />
                  </div>
                  <span className="text-white w-12 text-right">{metrics.femaleCount}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Other</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-700 rounded-full">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(metrics.otherGenderCount / metrics.totalEmployees) * 100}%` }} />
                  </div>
                  <span className="text-white w-12 text-right">{metrics.otherGenderCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium mb-4">Age Distribution</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Under 25</span>
                <span className="text-white">{metrics.ageUnder25}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">25-34</span>
                <span className="text-white">{metrics.age25to34}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">35-44</span>
                <span className="text-white">{metrics.age35to44}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">45-54</span>
                <span className="text-white">{metrics.age45to54}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">55+</span>
                <span className="text-white">{metrics.age55plus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (subTab === 'grievance') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Grievance Redressal</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            File Grievance
          </button>
        </div>

        <div className="space-y-3">
          {grievances.map((grievance) => (
            <div key={grievance.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{grievance.grievanceCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      grievance.priority === 'high' ? 'bg-red-900 text-red-300' :
                      grievance.priority === 'normal' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {grievance.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      grievance.status === 'resolved' ? 'bg-green-900 text-green-300' :
                      grievance.status === 'investigating' ? 'bg-yellow-900 text-yellow-300' :
                      grievance.status === 'under_review' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {grievance.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{grievance.subject}</h4>
                  <p className="text-sm text-gray-400">{grievance.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Filed On</p>
                  <p className="text-white text-sm">{grievance.filingDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Complainant</p>
                  <p className="text-sm text-gray-300">{grievance.isAnonymous ? 'Anonymous' : grievance.complainantName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="text-sm text-gray-300 capitalize">{grievance.grievanceType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Assigned To</p>
                  <p className="text-sm text-gray-300">{grievance.assignedToName || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subTab === 'posh') {
    const poshStatusColor = (status: string) => {
      switch (status) {
        case 'resolved': return 'bg-green-900 text-green-300';
        case 'closed': return 'bg-green-900 text-green-300';
        case 'under_inquiry': return 'bg-yellow-900 text-yellow-300';
        case 'registered': return 'bg-blue-900 text-blue-300';
        default: return 'bg-gray-700 text-gray-300';
      }
    };
    const poshSeverityColor = (severity?: string) => {
      switch (severity) {
        case 'high': return 'bg-red-900 text-red-300';
        case 'normal': return 'bg-yellow-900 text-yellow-300';
        case 'low': return 'bg-green-900 text-green-300';
        default: return 'bg-gray-700 text-gray-300';
      }
    };
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">POSH Compliance</h3>
          <button
            onClick={onReloadPosh}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {poshLoading ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
            Loading complaints...
          </div>
        ) : poshError ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-red-800 text-center text-red-400">
            {poshError}
            <div className="mt-3">
              <button onClick={onReloadPosh} className="text-blue-400 hover:text-blue-300 text-sm">Retry</button>
            </div>
          </div>
        ) : poshComplaints.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
            No POSH complaints registered yet.
          </div>
        ) : (
          <div className="space-y-3">
            {poshComplaints.map((c) => (
              <div key={c.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 font-mono text-sm">{c.complaintCode || c.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${poshSeverityColor(c.severity)}`}>
                        {c.severity || 'normal'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${poshStatusColor(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-white font-medium">{c.subject || 'POSH Complaint'}</h4>
                    {c.description && <p className="text-sm text-gray-400">{c.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Filed On</p>
                    <p className="text-white text-sm">{c.filingDate || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Complainant</p>
                    <p className="text-sm text-gray-300">{c.isAnonymous ? 'Anonymous' : c.complainantName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Assigned To</p>
                    <p className="text-sm text-gray-300">{c.assignedToName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Incident Date</p>
                    <p className="text-sm text-gray-300">{c.incidentDate || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // EEO Reports — no backend diversity/EEO data model exists yet, so we keep
  // this section honest rather than fabricating aggregates.
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">EEO Reports</h3>
      </div>

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
        No EEO report data available. EEO reporting requires a diversity data
        source that is not yet configured for this workspace.
      </div>
    </div>
  );
}

// ============================================================================
// Audit Section
// ============================================================================

function AuditSection({
  audits,
  findings,
  subTab,
  remediationPlans,
  remediationLoading,
  remediationError,
  onReloadRemediation,
}: {
  audits: ComplianceAudit[];
  findings: AuditFinding[];
  subTab: AuditSubTab;
  remediationPlans: RemediationPlanRecord[];
  remediationLoading: boolean;
  remediationError: string | null;
  onReloadRemediation: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900 text-green-300';
      case 'in_progress': return 'bg-blue-900 text-blue-300';
      case 'planned': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-300';
      case 'major': return 'bg-orange-900 text-orange-300';
      case 'minor': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'audits') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Compliance Audits</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Schedule Audit
          </button>
        </div>

        <div className="space-y-4">
          {audits.map((audit) => (
            <div key={audit.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{audit.auditCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(audit.status)}`}>
                      {audit.status.replace('_', ' ')}
                    </span>
                    {audit.auditRating && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        audit.auditRating === 'good' ? 'bg-green-900 text-green-300' :
                        audit.auditRating === 'satisfactory' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {audit.auditRating}
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-medium">{audit.auditName}</h4>
                  {audit.description && <p className="text-sm text-gray-400">{audit.description}</p>}
                </div>
                <div className="text-right">
                  {audit.auditScore && (
                    <p className="text-2xl font-bold text-white">{audit.auditScore}%</p>
                  )}
                  <p className="text-xs text-gray-400">Score</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Period</p>
                  <p className="text-sm text-gray-300">{audit.periodStart} - {audit.periodEnd}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Auditor</p>
                  <p className="text-sm text-gray-300">{audit.auditorName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Checkpoints</p>
                  <p className="text-sm text-gray-300">{audit.totalCheckpoints}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Compliant</p>
                  <p className="text-sm text-green-400">{audit.compliantCount} / {audit.totalCheckpoints}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm pt-3 border-t border-gray-700">
                <span className="text-red-400">{audit.criticalFindings} Critical</span>
                <span className="text-orange-400">{audit.majorFindings} Major</span>
                <span className="text-yellow-400">{audit.minorFindings} Minor</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (subTab === 'findings') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Audit Findings</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {findings.map((finding) => (
            <div key={finding.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{finding.findingCode}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      finding.status === 'closed' ? 'bg-green-900 text-green-300' :
                      finding.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                      'bg-yellow-900 text-yellow-300'
                    }`}>
                      {finding.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{finding.findingTitle}</h4>
                  <p className="text-sm text-gray-400">{finding.findingDescription}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Target Closure</p>
                  <p className="text-white text-sm">{finding.targetClosureDate || 'Not set'}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Audit</p>
                  <p className="text-sm text-gray-300">{finding.auditName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Area Affected</p>
                  <p className="text-sm text-gray-300">{finding.areaAffected || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Responsible</p>
                  <p className="text-sm text-gray-300">{finding.responsiblePersonName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Risk Level</p>
                  <p className="text-sm text-gray-300 capitalize">{finding.riskLevel || '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Remediation Plans
  const remediationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900 text-green-300';
      case 'verified': return 'bg-green-900 text-green-300';
      case 'in_progress': return 'bg-blue-900 text-blue-300';
      case 'overdue': return 'bg-red-900 text-red-300';
      case 'open': return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Remediation Plans</h3>
        <button
          onClick={onReloadRemediation}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {remediationLoading ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          Loading remediation plans...
        </div>
      ) : remediationError ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-red-800 text-center text-red-400">
          {remediationError}
          <div className="mt-3">
            <button onClick={onReloadRemediation} className="text-blue-400 hover:text-blue-300 text-sm">Retry</button>
          </div>
        </div>
      ) : remediationPlans.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          No remediation plans recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {remediationPlans.map((plan) => (
            <div key={plan.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400 font-mono text-sm">{plan.planCode || plan.id.slice(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(plan.priority || 'medium')}`}>
                      {plan.priority || 'medium'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${remediationStatusColor(plan.status)}`}>
                      {plan.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-white font-medium">{plan.planTitle || 'Remediation Plan'}</h4>
                  {plan.description && <p className="text-sm text-gray-400">{plan.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Target Completion</p>
                  <p className="text-white text-sm">{plan.targetCompletionDate || 'Not set'}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Finding</p>
                  <p className="text-sm text-gray-300">{plan.findingCode || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Audit</p>
                  <p className="text-sm text-gray-300">{plan.auditName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Responsible</p>
                  <p className="text-sm text-gray-300">{plan.responsiblePersonName || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Progress</p>
                  <p className="text-sm text-gray-300">{plan.progressPercent ?? 0}%</p>
                </div>
              </div>

              {plan.correctiveAction && (
                <div className="text-sm text-gray-300 pt-3 border-t border-gray-700">
                  <span className="text-gray-400">Corrective Action:</span> {plan.correctiveAction}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Reports Section
// ============================================================================

function ReportsSection({
  dashboard,
  alerts,
  subTab,
  statutorySummary,
  statutoryLoading,
  statutoryError,
  onReloadStatutory,
}: {
  dashboard: ComplianceDashboard | null;
  alerts: ComplianceAlert[];
  subTab: ReportsSubTab;
  statutorySummary: StatutoryReportSummary | null;
  statutoryLoading: boolean;
  statutoryError: string | null;
  onReloadStatutory: () => void;
}) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900 text-red-300';
      case 'high': return 'bg-orange-900 text-orange-300';
      case 'medium': return 'bg-yellow-900 text-yellow-300';
      case 'low': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'dashboard') {
    return <ComplianceDashboardView dashboard={dashboard} />;
  }

  if (subTab === 'alerts') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Compliance Alerts</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'critical' ? 'bg-red-900/50' :
                    alert.severity === 'high' ? 'bg-orange-900/50' :
                    alert.severity === 'medium' ? 'bg-yellow-900/50' :
                    'bg-gray-700'
                  }`}>
                    <Bell className={`h-5 w-5 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-orange-400' :
                      alert.severity === 'medium' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue-400 font-mono text-sm">{alert.alertCode}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        alert.status === 'acknowledged' ? 'bg-green-900 text-green-300' :
                        alert.status === 'resolved' ? 'bg-blue-900 text-blue-300' :
                        'bg-yellow-900 text-yellow-300'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                    <h4 className="text-white font-medium">{alert.alertTitle}</h4>
                    <p className="text-sm text-gray-400">{alert.alertMessage}</p>
                  </div>
                </div>
                <div className="text-right">
                  {alert.daysUntilDue && alert.daysUntilDue > 0 ? (
                    <p className="text-yellow-400 font-medium">{alert.daysUntilDue} days</p>
                  ) : alert.daysOverdue && alert.daysOverdue > 0 ? (
                    <p className="text-red-400 font-medium">{alert.daysOverdue} days overdue</p>
                  ) : null}
                  <p className="text-xs text-gray-400">Due: {alert.dueDate}</p>
                </div>
              </div>

              {alert.actionRequired && (
                <div className="flex items-center gap-2 text-sm pt-3 border-t border-gray-700">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">Action Required: {alert.actionRequired}</span>
                </div>
              )}

              {alert.status === 'active' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Acknowledge</button>
                  <button className="text-green-400 hover:text-green-300 text-sm">Mark Resolved</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Statutory Reports — aggregated from real PF/ESI/PT statutory filings.
  const categoryLabel = (c: string) =>
    c.replace(/-/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Statutory Reports</h3>
        <button
          onClick={onReloadStatutory}
          className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {statutoryLoading ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          Generating report...
        </div>
      ) : statutoryError ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-red-800 text-center text-red-400">
          {statutoryError}
          <div className="mt-3">
            <button onClick={onReloadStatutory} className="text-blue-400 hover:text-blue-300 text-sm">Retry</button>
          </div>
        </div>
      ) : !statutorySummary || statutorySummary.totalFilings === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
          No statutory filing data available to report.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Total Filings</p>
              <p className="text-2xl font-bold text-white">{statutorySummary.totalFilings}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-white">₹{statutorySummary.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-1">Categories</p>
              <p className="text-2xl font-bold text-white">{statutorySummary.byCategory.length}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Filings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Pending</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Filed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {statutorySummary.byCategory.map((row) => (
                  <tr key={row.category} className="hover:bg-gray-750">
                    <td className="px-4 py-3 text-white">{categoryLabel(row.category)}</td>
                    <td className="px-4 py-3 text-gray-300">{row.count}</td>
                    <td className="px-4 py-3 text-gray-300">₹{row.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-yellow-400">{row.pending}</td>
                    <td className="px-4 py-3 text-blue-400">{row.filed}</td>
                    <td className="px-4 py-3 text-green-400">{row.paid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            Generated {new Date(statutorySummary.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function HRCompliancePage() {
  const [mainTab, setMainTab] = useState<MainTab>('labor_laws');
  const [laborLawsSubTab, setLaborLawsSubTab] = useState<LaborLawsSubTab>('tracker');
  const [statutoryReturnsSubTab, setStatutoryReturnsSubTab] = useState<StatutoryReturnsSubTab>('pf');
  const [licensesSubTab, setLicensesSubTab] = useState<LicensesSubTab>('master');
  const [policySubTab, setPolicySubTab] = useState<PolicySubTab>('violations');
  const [equalOpportunitySubTab, setEqualOpportunitySubTab] = useState<EqualOpportunitySubTab>('diversity');
  const [auditSubTab, setAuditSubTab] = useState<AuditSubTab>('audits');
  const [reportsSubTab, setReportsSubTab] = useState<ReportsSubTab>('dashboard');

  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [trackers, setTrackers] = useState<ComplianceTracker[]>([]);
  const [registers, setRegisters] = useState<LaborRegister[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<ComplianceCalendarEvent[]>([]);
  const [statutoryReturns, setStatutoryReturns] = useState<StatutoryReturn[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [policyViolations, setPolicyViolations] = useState<PolicyViolation[]>([]);
  const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>([]);
  const [diversityMetrics, setDiversityMetrics] = useState<DiversityMetrics[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);

  // Real-backend sections (compliance certificates, policy acknowledgments,
  // POSH complaints, remediation plans, statutory reports).
  const [certificates, setCertificates] = useState<ComplianceCertificateRecord[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  const [certError, setCertError] = useState<string | null>(null);

  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgmentRecord[]>([]);
  const [ackLoading, setAckLoading] = useState(true);
  const [ackError, setAckError] = useState<string | null>(null);

  const [poshComplaints, setPoshComplaints] = useState<PoshComplaintRecord[]>([]);
  const [poshLoading, setPoshLoading] = useState(true);
  const [poshError, setPoshError] = useState<string | null>(null);

  const [remediationPlans, setRemediationPlans] = useState<RemediationPlanRecord[]>([]);
  const [remediationLoading, setRemediationLoading] = useState(true);
  const [remediationError, setRemediationError] = useState<string | null>(null);

  const [statutorySummary, setStatutorySummary] = useState<StatutoryReportSummary | null>(null);
  const [statutoryLoading, setStatutoryLoading] = useState(true);
  const [statutoryError, setStatutoryError] = useState<string | null>(null);

  const loadCertificates = async () => {
    setCertLoading(true);
    setCertError(null);
    try {
      const data = await HRComplianceService.getComplianceCertificates();
      setCertificates(Array.isArray(data) ? data : []);
    } catch (error) {
      setCertError('Failed to load compliance certificates.');
      console.error('Error loading compliance certificates:', error);
    } finally {
      setCertLoading(false);
    }
  };

  const loadAcknowledgments = async () => {
    setAckLoading(true);
    setAckError(null);
    try {
      const data = await HRComplianceService.getPolicyAcknowledgments();
      setAcknowledgments(Array.isArray(data) ? data : []);
    } catch (error) {
      setAckError('Failed to load policy acknowledgments.');
      console.error('Error loading policy acknowledgments:', error);
    } finally {
      setAckLoading(false);
    }
  };

  const loadPoshComplaints = async () => {
    setPoshLoading(true);
    setPoshError(null);
    try {
      const data = await HRComplianceService.getPoshComplaints();
      setPoshComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      setPoshError('Failed to load POSH complaints.');
      console.error('Error loading POSH complaints:', error);
    } finally {
      setPoshLoading(false);
    }
  };

  const loadRemediationPlans = async () => {
    setRemediationLoading(true);
    setRemediationError(null);
    try {
      const data = await HRComplianceService.getRemediationPlans();
      setRemediationPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      setRemediationError('Failed to load remediation plans.');
      console.error('Error loading remediation plans:', error);
    } finally {
      setRemediationLoading(false);
    }
  };

  const loadStatutorySummary = async () => {
    setStatutoryLoading(true);
    setStatutoryError(null);
    try {
      const data = await HRComplianceService.getStatutoryReportSummary();
      setStatutorySummary(data ?? null);
    } catch (error) {
      setStatutoryError('Failed to load statutory reports.');
      console.error('Error loading statutory reports:', error);
    } finally {
      setStatutoryLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
    loadAcknowledgments();
    loadPoshComplaints();
    loadRemediationPlans();
    loadStatutorySummary();
  }, []);

  useEffect(() => {
    loadDashboard();
    loadTrackers();
    loadRegisters();
    loadCalendarEvents();
    loadStatutoryReturns();
    loadLicenses();
    loadPolicyViolations();
    loadDisciplinaryActions();
    loadDiversityMetrics();
    loadGrievances();
    loadAudits();
    loadAuditFindings();
    loadAlerts();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await HRComplianceService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadTrackers = async () => {
    try {
      const data = await HRComplianceService.getComplianceTrackers();
      setTrackers(data);
    } catch (error) {
      console.error('Error loading trackers:', error);
    }
  };

  const loadRegisters = async () => {
    try {
      const data = await HRComplianceService.getLaborRegisters();
      setRegisters(data);
    } catch (error) {
      console.error('Error loading registers:', error);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const data = await HRComplianceService.getComplianceCalendarEvents();
      setCalendarEvents(data);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  };

  const loadStatutoryReturns = async () => {
    try {
      const data = await HRComplianceService.getStatutoryReturns();
      setStatutoryReturns(data);
    } catch (error) {
      console.error('Error loading statutory returns:', error);
    }
  };

  const loadLicenses = async () => {
    try {
      const data = await HRComplianceService.getLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Error loading licenses:', error);
    }
  };

  const loadPolicyViolations = async () => {
    try {
      const data = await HRComplianceService.getPolicyViolations();
      setPolicyViolations(data);
    } catch (error) {
      console.error('Error loading policy violations:', error);
    }
  };

  const loadDisciplinaryActions = async () => {
    try {
      const data = await HRComplianceService.getDisciplinaryActions();
      setDisciplinaryActions(data);
    } catch (error) {
      console.error('Error loading disciplinary actions:', error);
    }
  };

  const loadDiversityMetrics = async () => {
    try {
      const data = await HRComplianceService.getDiversityMetrics();
      setDiversityMetrics(data);
    } catch (error) {
      console.error('Error loading diversity metrics:', error);
    }
  };

  const loadGrievances = async () => {
    try {
      const data = await HRComplianceService.getGrievances();
      setGrievances(data);
    } catch (error) {
      console.error('Error loading grievances:', error);
    }
  };

  const loadAudits = async () => {
    try {
      const data = await HRComplianceService.getComplianceAudits();
      setAudits(data);
    } catch (error) {
      console.error('Error loading audits:', error);
    }
  };

  const loadAuditFindings = async () => {
    try {
      const data = await HRComplianceService.getAuditFindings();
      setAuditFindings(data);
    } catch (error) {
      console.error('Error loading audit findings:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await HRComplianceService.getComplianceAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const mainTabs = [
    { id: 'labor_laws' as MainTab, label: 'Labor Laws', icon: Scale },
    { id: 'statutory_returns' as MainTab, label: 'Statutory Returns', icon: FileText },
    { id: 'licenses' as MainTab, label: 'Licenses & Registrations', icon: FileCheck },
    { id: 'policy' as MainTab, label: 'Policy Compliance', icon: ClipboardCheck },
    { id: 'equal_opportunity' as MainTab, label: 'Equal Opportunity', icon: Users },
    { id: 'audit' as MainTab, label: 'Audit & Compliance', icon: Shield },
    { id: 'reports' as MainTab, label: 'Compliance Reports', icon: BarChart3 },
  ];

  const laborLawsSubTabs = [
    { id: 'tracker' as LaborLawsSubTab, label: 'Compliance Tracker', icon: Activity },
    { id: 'registers' as LaborLawsSubTab, label: 'Labor Registers', icon: FileText },
    { id: 'calendar' as LaborLawsSubTab, label: 'Compliance Calendar', icon: Calendar },
  ];

  const statutoryReturnsSubTabs = [
    { id: 'pf' as StatutoryReturnsSubTab, label: 'PF Returns', icon: FileText },
    { id: 'esi' as StatutoryReturnsSubTab, label: 'ESI Returns', icon: FileText },
    { id: 'tds' as StatutoryReturnsSubTab, label: 'TDS Returns', icon: FileText },
    { id: 'pt' as StatutoryReturnsSubTab, label: 'PT Returns', icon: FileText },
    { id: 'lwf' as StatutoryReturnsSubTab, label: 'LWF Returns', icon: FileText },
  ];

  const licensesSubTabs = [
    { id: 'master' as LicensesSubTab, label: 'License Master', icon: FileCheck },
    { id: 'renewal' as LicensesSubTab, label: 'Renewal Tracking', icon: RefreshCw },
    { id: 'certificates' as LicensesSubTab, label: 'Compliance Certificates', icon: Award },
  ];

  const policySubTabs = [
    { id: 'acknowledgment' as PolicySubTab, label: 'Policy Acknowledgment', icon: CheckCircle },
    { id: 'violations' as PolicySubTab, label: 'Policy Violations', icon: AlertTriangle },
    { id: 'disciplinary' as PolicySubTab, label: 'Disciplinary Actions', icon: Briefcase },
  ];

  const equalOpportunitySubTabs = [
    { id: 'diversity' as EqualOpportunitySubTab, label: 'Diversity Metrics', icon: PieChart },
    { id: 'eeo_reports' as EqualOpportunitySubTab, label: 'EEO Reports', icon: FileText },
    { id: 'grievance' as EqualOpportunitySubTab, label: 'Grievance Redressal', icon: Users },
    { id: 'posh' as EqualOpportunitySubTab, label: 'POSH Compliance', icon: Shield },
  ];

  const auditSubTabs = [
    { id: 'audits' as AuditSubTab, label: 'Compliance Audits', icon: ClipboardCheck },
    { id: 'findings' as AuditSubTab, label: 'Audit Findings', icon: AlertCircle },
    { id: 'remediation' as AuditSubTab, label: 'Remediation Plans', icon: Activity },
  ];

  const reportsSubTabs = [
    { id: 'dashboard' as ReportsSubTab, label: 'Compliance Dashboard', icon: BarChart3 },
    { id: 'statutory' as ReportsSubTab, label: 'Statutory Reports', icon: FileText },
    { id: 'alerts' as ReportsSubTab, label: 'Compliance Alerts', icon: Bell },
  ];

  const getCurrentSubTabs = () => {
    switch (mainTab) {
      case 'labor_laws': return laborLawsSubTabs;
      case 'statutory_returns': return statutoryReturnsSubTabs;
      case 'licenses': return licensesSubTabs;
      case 'policy': return policySubTabs;
      case 'equal_opportunity': return equalOpportunitySubTabs;
      case 'audit': return auditSubTabs;
      case 'reports': return reportsSubTabs;
      default: return [];
    }
  };

  const getCurrentSubTab = () => {
    switch (mainTab) {
      case 'labor_laws': return laborLawsSubTab;
      case 'statutory_returns': return statutoryReturnsSubTab;
      case 'licenses': return licensesSubTab;
      case 'policy': return policySubTab;
      case 'equal_opportunity': return equalOpportunitySubTab;
      case 'audit': return auditSubTab;
      case 'reports': return reportsSubTab;
      default: return '';
    }
  };

  const setCurrentSubTab = (tab: string) => {
    switch (mainTab) {
      case 'labor_laws': setLaborLawsSubTab(tab as LaborLawsSubTab); break;
      case 'statutory_returns': setStatutoryReturnsSubTab(tab as StatutoryReturnsSubTab); break;
      case 'licenses': setLicensesSubTab(tab as LicensesSubTab); break;
      case 'policy': setPolicySubTab(tab as PolicySubTab); break;
      case 'equal_opportunity': setEqualOpportunitySubTab(tab as EqualOpportunitySubTab); break;
      case 'audit': setAuditSubTab(tab as AuditSubTab); break;
      case 'reports': setReportsSubTab(tab as ReportsSubTab); break;
    }
  };

  const renderContent = () => {
    switch (mainTab) {
      case 'labor_laws':
        return <LaborLawsSection trackers={trackers} registers={registers} calendarEvents={calendarEvents} subTab={laborLawsSubTab} />;
      case 'statutory_returns':
        return <StatutoryReturnsSection returns={statutoryReturns} subTab={statutoryReturnsSubTab} />;
      case 'licenses':
        return (
          <LicensesSection
            licenses={licenses}
            subTab={licensesSubTab}
            certificates={certificates}
            certLoading={certLoading}
            certError={certError}
            onReloadCertificates={loadCertificates}
          />
        );
      case 'policy':
        return (
          <PolicyComplianceSection
            violations={policyViolations}
            disciplinaryActions={disciplinaryActions}
            subTab={policySubTab}
            acknowledgments={acknowledgments}
            ackLoading={ackLoading}
            ackError={ackError}
            onReloadAcknowledgments={loadAcknowledgments}
          />
        );
      case 'equal_opportunity':
        return (
          <EqualOpportunitySection
            diversityMetrics={diversityMetrics}
            grievances={grievances}
            subTab={equalOpportunitySubTab}
            poshComplaints={poshComplaints}
            poshLoading={poshLoading}
            poshError={poshError}
            onReloadPosh={loadPoshComplaints}
          />
        );
      case 'audit':
        return (
          <AuditSection
            audits={audits}
            findings={auditFindings}
            subTab={auditSubTab}
            remediationPlans={remediationPlans}
            remediationLoading={remediationLoading}
            remediationError={remediationError}
            onReloadRemediation={loadRemediationPlans}
          />
        );
      case 'reports':
        return (
          <ReportsSection
            dashboard={dashboard}
            alerts={alerts}
            subTab={reportsSubTab}
            statutorySummary={statutorySummary}
            statutoryLoading={statutoryLoading}
            statutoryError={statutoryError}
            onReloadStatutory={loadStatutorySummary}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">HR Compliance</h1>
            <p className="text-gray-400">Manage labor laws, statutory compliance, licenses, and audits</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
              <Search className="h-4 w-4" />
              Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Dashboard Summary */}
        <ComplianceDashboardView dashboard={dashboard} />

        {/* Main Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex gap-1 overflow-x-auto">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
