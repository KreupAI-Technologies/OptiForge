'use client';

import { useState, useEffect } from 'react';
import { Shield, FileCheck, AlertTriangle, CheckCircle2, XCircle, TrendingUp, BarChart3, Filter, Download, Eye, Search, Calendar, Award, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService } from '@/services/it-admin.service';

interface ComplianceRequirement {
  id: string;
  category: string;
  requirement: string;
  description: string;
  status: string;
  compliance: number;
  lastChecked: string;
  nextReview: string;
  owner: string;
  priority: string;
  controls: number;
  violations: number;
}

interface ComplianceViolation {
  id: string;
  violationId: string;
  timestamp: string;
  category: string;
  requirement: string;
  severity: string;
  description: string;
  affectedEntity: string;
  detectedBy: string;
  status: string;
  assignedTo: string;
  dueDate: string;
  resolvedDate?: string;
}

interface ComplianceStats {
  overallCompliance: number;
  totalRequirements: number;
  compliant: number;
  partiallyCompliant: number;
  nonCompliant: number;
  openViolations: number;
  criticalViolations: number;
}

const ComplianceAuditPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ComplianceRequirement | ComplianceViolation | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([
    {
      id: '1',
      category: 'GDPR',
      requirement: 'Data Protection',
      description: 'Ensure personal data is processed securely and in compliance with GDPR',
      status: 'Compliant',
      compliance: 95,
      lastChecked: '2025-10-20',
      nextReview: '2025-11-20',
      owner: 'Rajesh Kumar',
      priority: 'High',
      controls: 12,
      violations: 0,
    },
    {
      id: '2',
      category: 'GDPR',
      requirement: 'Right to Access',
      description: 'Users can request access to their personal data',
      status: 'Compliant',
      compliance: 100,
      lastChecked: '2025-10-18',
      nextReview: '2025-11-18',
      owner: 'Priya Sharma',
      priority: 'High',
      controls: 8,
      violations: 0,
    },
    {
      id: '3',
      category: 'SOC 2',
      requirement: 'Access Control',
      description: 'Implement proper access control mechanisms',
      status: 'Partially Compliant',
      compliance: 78,
      lastChecked: '2025-10-19',
      nextReview: '2025-11-19',
      owner: 'Vikram Singh',
      priority: 'Critical',
      controls: 15,
      violations: 3,
    },
    {
      id: '4',
      category: 'SOC 2',
      requirement: 'Encryption',
      description: 'Encrypt sensitive data at rest and in transit',
      status: 'Compliant',
      compliance: 92,
      lastChecked: '2025-10-21',
      nextReview: '2025-11-21',
      owner: 'Sneha Reddy',
      priority: 'High',
      controls: 10,
      violations: 1,
    },
    {
      id: '5',
      category: 'ISO 27001',
      requirement: 'Security Policy',
      description: 'Maintain comprehensive information security policies',
      status: 'Compliant',
      compliance: 88,
      lastChecked: '2025-10-15',
      nextReview: '2025-11-15',
      owner: 'Rajesh Kumar',
      priority: 'High',
      controls: 18,
      violations: 0,
    },
    {
      id: '6',
      category: 'ISO 27001',
      requirement: 'Incident Response',
      description: 'Have documented incident response procedures',
      status: 'Non-Compliant',
      compliance: 45,
      lastChecked: '2025-10-10',
      nextReview: '2025-11-10',
      owner: 'Anjali Desai',
      priority: 'Critical',
      controls: 8,
      violations: 5,
    },
    {
      id: '7',
      category: 'PCI DSS',
      requirement: 'Payment Security',
      description: 'Secure payment card information',
      status: 'Compliant',
      compliance: 96,
      lastChecked: '2025-10-21',
      nextReview: '2025-11-21',
      owner: 'Vikram Singh',
      priority: 'Critical',
      controls: 20,
      violations: 0,
    },
    {
      id: '8',
      category: 'HIPAA',
      requirement: 'Data Privacy',
      description: 'Protect health information privacy',
      status: 'Partially Compliant',
      compliance: 72,
      lastChecked: '2025-10-17',
      nextReview: '2025-11-17',
      owner: 'Deepika Rao',
      priority: 'High',
      controls: 14,
      violations: 2,
    },
  ]);

  // Load the compliance requirements catalog from the backend. The hardcoded
  // array above serves as the initial value until the fetch resolves.
  useEffect(() => {
    let cancelled = false;
    ItAdminService.getComplianceRequirements()
      .then((rows) => {
        if (cancelled || !rows || rows.length === 0) return;
        setRequirements(
          rows.map((dto) => ({
            id: dto.id,
            category: dto.standard,
            requirement: dto.requirement,
            description: dto.description ?? '',
            status: dto.status,
            compliance: dto.compliance,
            lastChecked: dto.lastAssessed ?? '',
            nextReview: dto.nextReview ?? '',
            owner: dto.owner ?? '',
            priority: dto.severity,
            controls: 0,
            violations: 0,
          })),
        );
      })
      .catch(() => {
        // keep the fallback catalog on error
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [violations, setViolations] = useState<ComplianceViolation[]>([]);

  useEffect(() => {
    const loadViolations = async () => {
      try {
        const res = await ItAdminService.getAuditLogs({ limit: '50' });
        const logs = Array.isArray(res?.data) ? res.data : [];
        const mapped: ComplianceViolation[] = logs
          .filter((log) => {
            const sev = (log.severity || '').toLowerCase();
            return sev === 'high' || sev === 'critical';
          })
          .map((log) => ({
            id: log.id,
            violationId: log.entityId || log.id,
            timestamp: log.createdAt || '',
            category: log.module || 'General',
            requirement: log.entityType || log.action || '',
            severity: log.severity || 'High',
            description: log.description || '',
            affectedEntity: log.entityType
              ? `${log.entityType}${log.entityId ? `: ${log.entityId}` : ''}`
              : (log.entityId || ''),
            detectedBy: log.userName || 'System',
            status: log.status || 'Open',
            assignedTo: log.userName || '',
            dueDate: '',
          }));
        setViolations(mapped);
      } catch {
        setViolations([]);
      }
    };
    loadViolations();
  }, []);

  const stats: ComplianceStats = {
    overallCompliance: Math.round(requirements.reduce((acc, req) => acc + req.compliance, 0) / requirements.length),
    totalRequirements: requirements.length,
    compliant: requirements.filter(r => r.status === 'Compliant').length,
    partiallyCompliant: requirements.filter(r => r.status === 'Partially Compliant').length,
    nonCompliant: requirements.filter(r => r.status === 'Non-Compliant').length,
    openViolations: violations.filter(v => v.status === 'Open' || v.status === 'In Progress').length,
    criticalViolations: violations.filter(v => v.severity === 'Critical' && v.status !== 'Resolved').length,
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesCategory = filterCategory === 'all' || req.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = req.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const filteredViolations = violations.filter(vio => {
    const matchesCategory = filterCategory === 'all' || vio.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || vio.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || vio.status === filterStatus;
    const matchesSearch = vio.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vio.violationId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partially compliant':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non-compliant':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-600';
    if (compliance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewDetails = (item: ComplianceRequirement | ComplianceViolation) => {
    setSelectedItem(item);
    showToast('Viewing compliance details', 'info');
  };

  const handleExport = () => {
    exportToCsv('compliance-requirements', filteredRequirements as unknown as Record<string, unknown>[]);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleGenerateReport = async () => {
    showToast('Generating comprehensive compliance report...', 'info');
    try {
      const report = await ItAdminService.generateComplianceReport();
      exportToCsv('compliance-report', [
        report as unknown as Record<string, unknown>,
        ...report.byStandard.map((s) => s as unknown as Record<string, unknown>),
      ]);
      showToast(
        `Report generated — overall compliance ${report.overallCompliance}%`,
        'success',
      );
    } catch {
      showToast('Failed to generate compliance report', 'error');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compliance Audit</h1>
              <p className="text-gray-600">Monitor regulatory compliance and violations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              Generate Report
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Score</span>
            <Award className="w-4 h-4 text-green-600" />
          </div>
          <div className={`text-2xl font-bold ${getComplianceColor(stats.overallCompliance)}`}>
            {stats.overallCompliance}%
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Requirements</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalRequirements}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Compliant</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Partial</span>
            <Clock className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.partiallyCompliant}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Non-Compliant</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.nonCompliant}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Open Issues</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.openViolations}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Critical</span>
            <Shield className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.criticalViolations}</div>
        </div>
      </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200">
          {/* Tabs */}
          <div className="flex-none border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Compliance Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'requirements'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileCheck className="w-4 h-4" />
              Requirements ({requirements.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'violations'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Violations ({violations.length})
            </div>
          </button>
        </div>
      </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-3">
      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="GDPR">GDPR</option>
            <option value="SOC 2">SOC 2</option>
            <option value="ISO 27001">ISO 27001</option>
            <option value="PCI DSS">PCI DSS</option>
            <option value="HIPAA">HIPAA</option>
          </select>
          {activeTab !== 'violations' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Compliant">Compliant</option>
              <option value="Partially Compliant">Partially Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </select>
          )}
          {activeTab === 'violations' && (
            <>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Compliance by Category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance by Regulatory Framework</h3>
            <div className="space-y-2">
              {['GDPR', 'SOC 2', 'ISO 27001', 'PCI DSS', 'HIPAA'].map(category => {
                const categoryReqs = requirements.filter(r => r.category === category);
                const avgCompliance = categoryReqs.length > 0
                  ? Math.round(categoryReqs.reduce((acc, r) => acc + r.compliance, 0) / categoryReqs.length)
                  : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className={`text-sm font-bold ${getComplianceColor(avgCompliance)}`}>
                        {avgCompliance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          avgCompliance >= 90 ? 'bg-green-600' :
                          avgCompliance >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${avgCompliance}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Violations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Critical Violations</h3>
            <div className="space-y-3">
              {violations.filter(v => v.severity === 'Critical' && v.status !== 'Resolved').slice(0, 3).map(violation => (
                <div key={violation.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-medium text-red-800">{violation.violationId}</code>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </div>
                    <p className="text-sm text-red-900">{violation.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-red-700">
                      <span>Category: {violation.category}</span>
                      <span>Assigned: {violation.assignedTo}</span>
                      <span>Due: {violation.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Requirement</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Compliance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Next Review</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((req) => (
                  <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                        {req.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{req.requirement}</div>
                        <div className="text-sm text-gray-500">{req.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className={`text-sm font-bold ${getComplianceColor(req.compliance)}`}>
                          {req.compliance}%
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              req.compliance >= 90 ? 'bg-green-600' :
                              req.compliance >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${req.compliance}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{req.owner}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {req.nextReview}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(req)}
                        className="text-orange-600 hover:text-orange-700 p-1"
                       
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequirements.length === 0 && (
            <div className="text-center py-12">
              <FileCheck className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No requirements found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Violations Tab */}
      {activeTab === 'violations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Violation ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Severity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Assigned To</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViolations.map((vio) => (
                  <tr key={vio.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <code className="text-sm bg-red-50 text-red-800 px-2 py-1 rounded font-medium">
                        {vio.violationId}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {vio.timestamp}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                        {vio.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm text-gray-900 mb-1">{vio.description}</div>
                        <div className="text-xs text-gray-500">{vio.affectedEntity}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(vio.severity)}`}>
                        {vio.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vio.status)}`}>
                        {vio.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{vio.assignedTo}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(vio)}
                        className="text-orange-600 hover:text-orange-700 p-1"
                       
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredViolations.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-gray-600">No violations found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {'violationId' in selectedItem ? 'Violation Details' : 'Requirement Details'}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700">Close</span>
              </button>
            </div>

            <div className="p-6">
              {'violationId' in selectedItem ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Violation ID</label>
                    <code className="text-lg font-bold text-red-800 bg-red-50 px-3 py-2 rounded">{selectedItem.violationId}</code>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.category}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Requirement</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.requirement}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-gray-900">{selectedItem.description}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Severity</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(selectedItem.severity)}`}>
                      {selectedItem.severity}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Assigned To</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.assignedTo}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.dueDate}</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.category}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedItem.priority)}`}>
                      {selectedItem.priority}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Requirement</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900 font-medium">{selectedItem.requirement}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.description}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Compliance Score</label>
                    <div className={`text-2xl font-bold ${getComplianceColor(selectedItem.compliance)}`}>
                      {selectedItem.compliance}%
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Owner</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.owner}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Next Review</label>
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-900">{selectedItem.nextReview}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200">
              <button
                onClick={handleCloseDetails}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceAuditPage;
