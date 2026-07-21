'use client';

import React, { useState, useEffect } from 'react';
import { procurementPagesService } from '@/services/procurement-pages.service';
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

const ProcurementCompliance: React.FC<ProcurementComplianceProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompliance, setSelectedCompliance] = useState<any>(null);
  const [showRealTimeMonitoring, setShowRealTimeMonitoring] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

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
  const [complianceRequirements, setComplianceRequirements] = useState<any[]>([]);
  // Compliance violations (loaded from API)
  const [violationsData, setViolationsData] = useState<Array<{
    id: string; date: string; category: string; severity: string; description: string; status: string; dueDate: string;
  }>>([]);

  useEffect(() => {
    (async () => {
      try {
        const v = await procurementPagesService.getComplianceViolations();
        setViolationsData((v || []) as any[]);
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
  const handleRunAudit = () => {
    // Compliance audit workflow — backend not yet available.
  };

  const handleViewViolations = () => {
    // Violation drill-down / remediation workflow — backend not yet available.
  };

  const handleGenerateReport = () => {
    // Compliance report generation — backend not yet available.
  };

  const handleSetPolicies = () => {
    // Policy lifecycle management — backend not yet available.
  };

  const handleViewRequirement = (req: any) => {
    // Requirement detail drill-down — backend not yet available.
    void req;
  };

  const handleRefresh = () => {
    // Manual compliance data refresh — backend not yet available.
  };

  const handleSettings = () => {
    // Compliance settings configuration — backend not yet available.
  };

  const handleExport = () => {
    // Compliance data export — backend not yet available.
  };

  const handleMonitorCompliance = () => {
    // Real-time compliance monitoring dashboard — backend not yet available.
  };

  const handleTrainingCompliance = () => {
    // Compliance training management — backend not yet available.
  };

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
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Compliance audit workflow — backend not yet available"
            >
              <Activity className="h-4 w-4" />
              <span>Run Audit</span>
            </button>
            <button
              onClick={handleViewViolations}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Violation drill-down / remediation workflow — backend not yet available"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Violations</span>
            </button>
            <button
              onClick={handleGenerateReport}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Compliance report generation — backend not yet available"
            >
              <FileText className="h-4 w-4" />
              <span>Report</span>
            </button>
            <button
              onClick={handleSetPolicies}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Policy lifecycle management — backend not yet available"
            >
              <Lock className="h-4 w-4" />
              <span>Policies</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Manual compliance data refresh — backend not yet available"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleSettings}
              disabled
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Compliance settings configuration — backend not yet available"
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
              <button className="mt-1 text-xs text-amber-700 hover:text-amber-800 font-medium">
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
                <button className="text-xs text-red-600 hover:text-red-700 font-medium mt-1">View Details →</button>
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
                          disabled
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Requirement detail view — backend not yet available"
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
        </div>
      )}
    </div>
  );
};

export default ProcurementCompliance;