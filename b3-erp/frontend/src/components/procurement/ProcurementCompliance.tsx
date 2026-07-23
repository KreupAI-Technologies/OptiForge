'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { procurementPagesService } from '@/services/procurement-pages.service';
import {
  procurementComplianceRecordService,
  ProcurementComplianceRecord,
} from '@/services/procurement-compliance-record.service';
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Clock,
  FileText, Award, Users, Target, Activity, BarChart3,
  Settings, Download, Upload, Eye, Edit3, Plus, Search,
  Filter, Bell, Calendar, Globe, Lock, Key, Database, RefreshCw, Zap
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

interface ProcurementComplianceProps {}

interface ComplianceRequirement {
  id: string;
  requirement: string;
  category: string;
  status: string;
  score: number;
  met: number;
  total: number;
  lastAudit: string;
  nextReview: string;
  owner: string;
}

interface ComplianceViolation {
  id: string;
  date: string;
  category: string;
  severity: string;
  description: string;
  status: string;
  dueDate: string;
}

type ComplianceModal =
  | { type: 'violations' }
  | { type: 'requirement'; req: ComplianceRequirement }
  | { type: 'monitor' }
  | { type: 'training' }
  | { type: 'policies' }
  | { type: 'record' }
  | { type: 'settings' };

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ProcurementCompliance: React.FC<ProcurementComplianceProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Active client-side modal + policy record form.
  const [modal, setModal] = useState<ComplianceModal | null>(null);
  const [policyForm, setPolicyForm] = useState<{ requirement: string; category: string; dueDate: string; evidence: string }>({
    requirement: '', category: '', dueDate: '', evidence: '',
  });
  const [recordForm, setRecordForm] = useState<{ requirement: string; supplierId: string; dueDate: string; evidence: string }>({
    requirement: '', supplierId: '', dueDate: '', evidence: '',
  });
  const closeModal = () => setModal(null);

  // Compliance metrics (defaults render before load; summary fields merged from API)
  const [complianceMetrics, setComplianceMetrics] = useState({
    overallScore: 94.2,
    totalRequirements: 156,
    compliant: 147,
    nonCompliant: 6,
    pending: 3,
    auditScore: 96.8,
    policiesUpdated: 12,
    incidentsThisMonth: 2
  });

  // Compliance requirements (loaded from API)
  const [complianceRequirements, setComplianceRequirements] = useState<ComplianceRequirement[]>([]);
  // Compliance violations (loaded from API)
  const [violationsData, setViolationsData] = useState<ComplianceViolation[]>([]);

  // Compliance records CRUD (loaded from NestJS domain backend)
  const [complianceRecords, setComplianceRecords] = useState<ProcurementComplianceRecord[]>([]);
  const [recordsBusy, setRecordsBusy] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setRecordsBusy(true);
    setRecordsError(null);
    try {
      const data = await procurementComplianceRecordService.getRecords();
      setComplianceRecords(data);
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Failed to load compliance records');
    } finally {
      setRecordsBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    (async () => {
      try {
        const v = await procurementPagesService.getComplianceViolations();
        setViolationsData(
          (Array.isArray(v) ? v : []).map((x: any): ComplianceViolation => ({
            id: String(x?.id ?? ''),
            date: String(x?.date ?? ''),
            category: String(x?.category ?? ''),
            severity: String(x?.severity ?? ''),
            description: String(x?.description ?? ''),
            status: String(x?.status ?? ''),
            dueDate: String(x?.dueDate ?? ''),
          })),
        );
      } catch (err) {
        console.error('Failed to load compliance violations:', err);
        setViolationsData([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await procurementPagesService.getComplianceInsights();
        const requirements = data?.requirements ?? [];
        setComplianceRequirements(
          (requirements as any[]).map((r: any) => {
            const met = r?.met ?? 0;
            const total = r?.total ?? 0;
            return {
              id: r?.id ?? '',
              requirement: r?.name ?? '',
              category: r?.category ?? '',
              status: r?.status ?? '',
              score: total > 0 ? Math.round((met / total) * 100) : 0,
              met,
              total,
              lastAudit: r?.lastAudit ?? '',
              nextReview: r?.nextReview ?? '',
              owner: r?.owner ?? '',
            };
          })
        );
        const s = data?.summary ?? {};
        setComplianceMetrics(prev => ({
          ...prev,
          totalRequirements: s.totalRequirements ?? prev.totalRequirements,
          compliant: s.compliant ?? prev.compliant,
          nonCompliant: s.nonCompliant ?? prev.nonCompliant,
          pending: s.pending ?? prev.pending,
          auditScore: s.auditScore ?? prev.auditScore,
        }));
      } catch (err) {
        console.error('Failed to load compliance insights:', err);
        setComplianceRequirements([]);
      }
    })();
  }, []);

  // Handler Functions
  // Create a new compliance record (via modal form).
  const handleRunAudit = () => {
    setRecordForm({ requirement: '', supplierId: '', dueDate: '', evidence: '' });
    setRecordsError(null);
    setModal({ type: 'record' });
  };

  const submitRecord = async () => {
    if (!recordForm.requirement.trim()) {
      setRecordsError('Requirement is required.');
      return;
    }
    setRecordsBusy(true);
    setRecordsError(null);
    try {
      await procurementComplianceRecordService.createRecord({
        requirement: recordForm.requirement.trim(),
        status: 'pending',
        supplierId: recordForm.supplierId.trim() || undefined,
        dueDate: recordForm.dueDate || undefined,
        evidence: recordForm.evidence.trim() || undefined,
      });
      await loadRecords();
      closeModal();
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Failed to create compliance record');
    } finally {
      setRecordsBusy(false);
    }
  };

  const handleViewViolations = () => setModal({ type: 'violations' });

  const handleGenerateReport = () => {
    // Compliance report -> CSV of the live requirements dataset.
    downloadCsv(
      'compliance-report.csv',
      complianceRequirements.map((r) => ({
        requirement: r.requirement,
        category: r.category,
        status: r.status,
        score: r.score,
        met: r.met,
        total: r.total,
        lastAudit: r.lastAudit,
        nextReview: r.nextReview,
        owner: r.owner,
      })),
    );
  };

  const handleSetPolicies = () => {
    setPolicyForm({ requirement: '', category: '', dueDate: '', evidence: '' });
    setRecordsError(null);
    setModal({ type: 'policies' });
  };

  // Reuse the compliance-record store for policy records (fits the "requirement" model).
  const submitPolicy = async () => {
    if (!policyForm.requirement.trim()) {
      setRecordsError('Policy requirement is required.');
      return;
    }
    setRecordsBusy(true);
    setRecordsError(null);
    try {
      await procurementComplianceRecordService.createRecord({
        requirement: policyForm.requirement.trim(),
        status: 'pending',
        evidence: policyForm.category.trim()
          ? `Policy · ${policyForm.category.trim()}${policyForm.evidence.trim() ? ` — ${policyForm.evidence.trim()}` : ''}`
          : policyForm.evidence.trim() || undefined,
        dueDate: policyForm.dueDate || undefined,
      });
      await loadRecords();
      closeModal();
    } catch (err) {
      setRecordsError(err instanceof Error ? err.message : 'Failed to create policy record');
    } finally {
      setRecordsBusy(false);
    }
  };

  const handleViewRequirement = (req: ComplianceRequirement) => setModal({ type: 'requirement', req });

  const handleRefresh = () => {
    void loadRecords();
  };

  const handleSettings = () => setModal({ type: 'settings' });

  const handleExport = () => {
    // Export live requirements + records to CSV.
    downloadCsv(
      'compliance-export.csv',
      complianceRequirements.map((r) => ({
        requirement: r.requirement,
        category: r.category,
        status: r.status,
        score: r.score,
        nextReview: r.nextReview,
        owner: r.owner,
      })),
    );
  };

  const handleMonitorCompliance = () => setModal({ type: 'monitor' });

  const handleTrainingCompliance = () => setModal({ type: 'training' });

  return (
    <div className="p-6">
      <div className="mb-3 bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Procurement Compliance Management</h2>
              <p className="text-blue-100">Ensure regulatory compliance and policy adherence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAudit}
              disabled={recordsBusy}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Create compliance record"
            >
              <Plus className="h-4 w-4" />
              <span>New Record</span>
            </button>
            <button
              onClick={handleViewViolations}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="View compliance violations"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Violations</span>
            </button>
            <button
              onClick={handleGenerateReport}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Generate compliance report (CSV)"
            >
              <FileText className="h-4 w-4" />
              <span>Report</span>
            </button>
            <button
              onClick={handleSetPolicies}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Add a compliance policy record"
            >
              <Lock className="h-4 w-4" />
              <span>Policies</span>
            </button>
            <button
              onClick={handleMonitorCompliance}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Real-time compliance monitoring"
            >
              <Activity className="h-4 w-4" />
              <span>Monitor</span>
            </button>
            <button
              onClick={handleTrainingCompliance}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Compliance training"
            >
              <Users className="h-4 w-4" />
              <span>Training</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="Export compliance data (CSV)"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={recordsBusy}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh compliance records"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Compliance settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Compliance Monitoring */}
      {showRealTimeMonitoring && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg shadow-lg p-3 mb-3 border border-teal-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-600 rounded-lg relative">
                <Shield className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Real-Time Compliance Monitoring
                  {autoRefreshEnabled && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Live
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-600">Automated compliance tracking and risk alerts • Last scan: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition ${
                  autoRefreshEnabled ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                <Activity className="w-4 h-4" />
                Auto-Refresh
              </button>
              <button
                onClick={() => setShowRealTimeMonitoring(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
            <div className="bg-white rounded-lg p-3 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Compliance Health</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{complianceMetrics.overallScore}%</div>
              <div className="text-xs text-green-600 mt-1">↑ 2.3% improvement</div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${complianceMetrics.overallScore}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Active Monitors</span>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{complianceMetrics.totalRequirements}</div>
              <div className="text-xs text-blue-600 mt-1">{complianceMetrics.compliant} compliant</div>
              <div className="text-xs text-gray-500 mt-1">{complianceMetrics.nonCompliant} need attention</div>
            </div>

            <div className="bg-white rounded-lg p-3 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Risk Alerts</span>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{complianceMetrics.nonCompliant + complianceMetrics.pending}</div>
              <div className="text-xs text-amber-600 mt-1">{complianceMetrics.nonCompliant} critical</div>
              <button onClick={handleMonitorCompliance} className="mt-1 text-xs text-amber-700 hover:text-amber-800 font-medium">
                Review Now →
              </button>
            </div>

            <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Next Audit</span>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">14</div>
              <div className="text-xs text-purple-600 mt-1">Days remaining</div>
              <div className="text-xs text-gray-500 mt-1">Q1 Comprehensive Audit</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Automated Compliance</h4>
                <p className="text-xs text-gray-600 mt-1">{Math.floor(complianceMetrics.compliant * 0.85)} of {complianceMetrics.compliant} compliant items monitored automatically</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Critical Violations</h4>
                <p className="text-xs text-gray-600 mt-1">{complianceMetrics.incidentsThisMonth} incidents reported this month - 2 require immediate action</p>
                <button onClick={handleViewViolations} className="text-xs text-red-600 hover:text-red-700 font-medium mt-1">View Details →</button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">Audit Readiness</h4>
                <p className="text-xs text-gray-600 mt-1">Score: {complianceMetrics.auditScore}% - {complianceMetrics.policiesUpdated} policies updated this quarter</p>
              </div>
            </div>
          </div>

          {/* Predictive Compliance Insights */}
          <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">AI-Powered Compliance Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded p-3">
                <div className="text-xs text-gray-600 mb-1">Predicted Risk Score</div>
                <div className="text-xl font-bold text-indigo-600">Low</div>
                <div className="text-xs text-gray-500 mt-1">Based on 90-day trend analysis</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs text-gray-600 mb-1">Upcoming Renewals</div>
                <div className="text-xl font-bold text-blue-600">8</div>
                <div className="text-xs text-gray-500 mt-1">Certifications due in 30 days</div>
              </div>
              <div className="bg-white rounded p-3">
                <div className="text-xs text-gray-600 mb-1">Compliance Forecast</div>
                <div className="text-xl font-bold text-green-600">96%</div>
                <div className="text-xs text-gray-500 mt-1">Projected Q2 score (high confidence)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-3 border-b">
        {['overview', 'requirements', 'audits', 'policies'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Compliance Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 text-green-500" />
                <span className="text-sm text-green-600">+2.3%</span>
              </div>
              <p className="text-2xl font-bold">{complianceMetrics.overallScore}%</p>
              <p className="text-sm text-gray-600">Overall Compliance</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-8 w-8 text-blue-500" />
                <span className="text-sm text-blue-600">{complianceMetrics.compliant}/{complianceMetrics.totalRequirements}</span>
              </div>
              <p className="text-2xl font-bold">{complianceMetrics.compliant}</p>
              <p className="text-sm text-gray-600">Compliant Items</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
                <span className="text-sm text-yellow-600">Action needed</span>
              </div>
              <p className="text-2xl font-bold">{complianceMetrics.nonCompliant}</p>
              <p className="text-sm text-gray-600">Non-Compliant</p>
            </div>

            <div className="bg-white rounded-lg shadow p-3">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-purple-500" />
                <span className="text-sm text-purple-600">Recent audit</span>
              </div>
              <p className="text-2xl font-bold">{complianceMetrics.auditScore}%</p>
              <p className="text-sm text-gray-600">Audit Score</p>
            </div>
          </div>

          {/* Compliance Requirements Table */}
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-lg font-semibold mb-2">Compliance Requirements Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Requirement</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Score</th>
                    <th className="text-left py-2">Next Review</th>
                    <th className="text-left py-2">Owner</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceRequirements.map((req) => (
                    <tr key={req.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{req.requirement}</td>
                      <td className="py-2">{req.category}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          req.status === 'compliant' ? 'bg-green-100 text-green-800' :
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2">{req.score}%</td>
                      <td className="py-2">{req.nextReview}</td>
                      <td className="py-2">{req.owner}</td>
                      <td className="py-2">
                        <button
                          onClick={() => handleViewRequirement(req)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                          title="View requirement detail"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance Records (live from domain backend) */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">
                Compliance Records ({complianceRecords.length})
              </h3>
              {recordsBusy && <span className="text-sm text-gray-500">Loading…</span>}
            </div>
            {recordsError && (
              <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {recordsError}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Requirement</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Due Date</th>
                    <th className="text-left py-2">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceRecords.length === 0 && !recordsBusy ? (
                    <tr>
                      <td colSpan={4} className="py-3 text-sm text-gray-500">
                        No compliance records yet. Use “New Record” to add one.
                      </td>
                    </tr>
                  ) : (
                    complianceRecords.map((rec) => (
                      <tr key={rec.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{rec.requirement}</td>
                        <td className="py-2">{rec.status}</td>
                        <td className="py-2">{rec.dueDate ?? '—'}</td>
                        <td className="py-2">{rec.completedDate ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {modal && renderModal()}
    </div>
  );

  function renderModal() {
    if (!modal) return null;
    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
    const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

    let title = '';
    let body: React.ReactNode = null;
    let footer: React.ReactNode = (
      <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
    );

    if (modal.type === 'violations') {
      title = 'Compliance Violations';
      body = violationsData.length === 0 ? (
        <p className="text-sm text-gray-500">No violations recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Severity</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Due</th>
              </tr>
            </thead>
            <tbody>
              {violationsData.map((v) => (
                <tr key={v.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-3">{v.date}</td>
                  <td className="py-2 pr-3">{v.category}</td>
                  <td className="py-2 pr-3">{v.severity}</td>
                  <td className="py-2 pr-3">{v.description}</td>
                  <td className="py-2 pr-3">{v.status}</td>
                  <td className="py-2 pr-3">{v.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          {violationsData.length > 0 && (
            <button onClick={() => downloadCsv('compliance-violations.csv', violationsData as unknown as Array<Record<string, unknown>>)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
        </div>
      );
    } else if (modal.type === 'requirement') {
      const r = modal.req;
      title = `Requirement — ${r.requirement}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-500">Category:</span> <span className="font-medium">{r.category}</span></div>
          <div><span className="text-gray-500">Status:</span> <span className="font-medium">{r.status}</span></div>
          <div><span className="text-gray-500">Score:</span> <span className="font-medium">{r.score}%</span></div>
          <div><span className="text-gray-500">Met / Total:</span> <span className="font-medium">{r.met} / {r.total}</span></div>
          <div><span className="text-gray-500">Last Audit:</span> <span className="font-medium">{r.lastAudit || '—'}</span></div>
          <div><span className="text-gray-500">Next Review:</span> <span className="font-medium">{r.nextReview || '—'}</span></div>
          <div><span className="text-gray-500">Owner:</span> <span className="font-medium">{r.owner || '—'}</span></div>
        </div>
      );
    } else if (modal.type === 'monitor') {
      title = 'Real-Time Compliance Monitoring';
      body = (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-gray-500">Overall Score</div><div className="text-2xl font-bold">{complianceMetrics.overallScore}%</div></div>
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-gray-500">Compliant</div><div className="text-2xl font-bold">{complianceMetrics.compliant}</div></div>
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-gray-500">Non-Compliant</div><div className="text-2xl font-bold">{complianceMetrics.nonCompliant}</div></div>
            <div className="bg-gray-50 rounded-lg p-3"><div className="text-gray-500">Pending</div><div className="text-2xl font-bold">{complianceMetrics.pending}</div></div>
          </div>
          <div>
            <div className="font-medium mb-1">Items needing attention</div>
            {complianceRequirements.filter((r) => r.status !== 'compliant').length === 0 ? (
              <p className="text-gray-500">All requirements compliant.</p>
            ) : (
              <ul className="list-disc pl-5">
                {complianceRequirements.filter((r) => r.status !== 'compliant').map((r) => (
                  <li key={r.id}>{r.requirement} — {r.status} ({r.score}%)</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    } else if (modal.type === 'training') {
      title = 'Compliance Training';
      const owners = Array.from(new Set(complianceRequirements.map((r) => r.owner).filter(Boolean)));
      body = (
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">Training coverage derived from requirement owners.</p>
          {owners.length === 0 ? (
            <p className="text-gray-500">No owners assigned to requirements yet.</p>
          ) : (
            <ul className="list-disc pl-5">
              {owners.map((o) => (
                <li key={o}>{o}: owns {complianceRequirements.filter((r) => r.owner === o).length} requirement(s)</li>
              ))}
            </ul>
          )}
        </div>
      );
    } else if (modal.type === 'record') {
      title = 'New Compliance Record';
      body = (
        <div className="space-y-3">
          {recordsError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{recordsError}</div>
          )}
          <div>
            <label className={labelCls}>Requirement *</label>
            <input className={inputCls} value={recordForm.requirement} onChange={(e) => setRecordForm({ ...recordForm, requirement: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Supplier ID</label>
            <input className={inputCls} value={recordForm.supplierId} onChange={(e) => setRecordForm({ ...recordForm, supplierId: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input type="date" className={inputCls} value={recordForm.dueDate} onChange={(e) => setRecordForm({ ...recordForm, dueDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Evidence / Notes</label>
            <textarea className={inputCls} rows={2} value={recordForm.evidence} onChange={(e) => setRecordForm({ ...recordForm, evidence: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={submitRecord} disabled={recordsBusy} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
            {recordsBusy ? 'Saving…' : 'Add Record'}
          </button>
        </div>
      );
    } else if (modal.type === 'settings') {
      title = 'Compliance Settings';
      body = (
        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between">
            <span>Auto-refresh monitoring</span>
            <input type="checkbox" checked={autoRefreshEnabled} onChange={(e) => setAutoRefreshEnabled(e.target.checked)} className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span>Show real-time monitoring panel</span>
            <input type="checkbox" checked={showRealTimeMonitoring} onChange={(e) => setShowRealTimeMonitoring(e.target.checked)} className="rounded" />
          </label>
          <p className="text-gray-500">Display preferences (client-side).</p>
        </div>
      );
    } else if (modal.type === 'policies') {
      title = 'Add Compliance Policy';
      body = (
        <div className="space-y-3">
          {recordsError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{recordsError}</div>
          )}
          <div>
            <label className={labelCls}>Policy Requirement *</label>
            <input className={inputCls} value={policyForm.requirement} onChange={(e) => setPolicyForm({ ...policyForm, requirement: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input className={inputCls} value={policyForm.category} onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input type="date" className={inputCls} value={policyForm.dueDate} onChange={(e) => setPolicyForm({ ...policyForm, dueDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Notes / Evidence</label>
            <textarea className={inputCls} rows={2} value={policyForm.evidence} onChange={(e) => setPolicyForm({ ...policyForm, evidence: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={submitPolicy} disabled={recordsBusy} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
            {recordsBusy ? 'Saving…' : 'Add Policy'}
          </button>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <div className="px-5 py-4">{body}</div>
          <div className="px-5 py-3 border-t flex justify-end">{footer}</div>
        </div>
      </div>
    );
  }
};

export default ProcurementCompliance;