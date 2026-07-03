'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Search, Eye, FileText } from 'lucide-react';
import { HrComplianceDocsService, PolicyViolation as PolicyViolationDto } from '@/services/hr-compliance-docs.service';

interface PolicyViolation {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  violationType: 'code_of_conduct' | 'attendance' | 'safety' | 'security' | 'harassment' | 'other';
  policyViolated: string;
  reportedDate: string;
  incidentDate: string;
  reportedBy: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  status: 'reported' | 'under_investigation' | 'resolved' | 'escalated';
  investigationAssignedTo?: string;
  description: string;
  actionTaken?: string;
  remarks?: string;
}

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [items, setItems] = useState<PolicyViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getPolicyViolations();
        if (!active) return;
        const mapped: PolicyViolation[] = rows.map((r: PolicyViolationDto) => ({
          id: r.id,
          employeeId: r.employeeId || '',
          employeeName: r.employeeName || '',
          department: r.department || '',
          violationType: (r.violationType as PolicyViolation['violationType']) || 'other',
          policyViolated: r.policyName || '',
          reportedDate: r.reportedDate || '',
          incidentDate: r.violationDate || '',
          reportedBy: r.reportedBy || '',
          severity: (r.severity as PolicyViolation['severity']) || 'minor',
          status: (r.status as PolicyViolation['status']) || 'reported',
          investigationAssignedTo: r.meta?.investigationAssignedTo,
          description: r.description || '',
          actionTaken: r.actionTaken,
          remarks: r.remarks,
        }));
        setItems(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load policy violations');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockViolations: PolicyViolation[] = [
    {
      id: '1',
      employeeId: 'EMP015',
      employeeName: 'Karan Malhotra',
      department: 'Manufacturing',
      violationType: 'safety',
      policyViolated: 'Workplace Safety Policy - PPE Requirement',
      reportedDate: '2025-01-20',
      incidentDate: '2025-01-18',
      reportedBy: 'Suresh Mehta (Safety Officer)',
      severity: 'serious',
      status: 'under_investigation',
      investigationAssignedTo: 'Rajesh Kumar',
      description: 'Employee found not wearing safety helmet in high-risk zone',
      remarks: 'First offense - counseling scheduled'
    },
    {
      id: '2',
      employeeId: 'EMP022',
      employeeName: 'Deepak Singh',
      department: 'IT',
      violationType: 'security',
      policyViolated: 'Information Security Policy - Data Access',
      reportedDate: '2025-01-15',
      incidentDate: '2025-01-14',
      reportedBy: 'Amit Patel (IT Manager)',
      severity: 'critical',
      status: 'escalated',
      investigationAssignedTo: 'HR Director',
      description: 'Unauthorized access to confidential employee data',
      actionTaken: 'Immediate suspension pending investigation',
      remarks: 'Escalated to senior management'
    },
    {
      id: '3',
      employeeId: 'EMP033',
      employeeName: 'Pooja Reddy',
      department: 'Sales',
      violationType: 'attendance',
      policyViolated: 'Attendance and Leave Policy',
      reportedDate: '2025-01-10',
      incidentDate: '2025-01-08',
      reportedBy: 'Department Manager',
      severity: 'minor',
      status: 'resolved',
      description: 'Unauthorized absence without prior intimation',
      actionTaken: 'Written warning issued',
      remarks: 'Employee acknowledged and apologized'
    },
    {
      id: '4',
      employeeId: 'EMP044',
      employeeName: 'Sanjay Gupta',
      department: 'Finance',
      violationType: 'code_of_conduct',
      policyViolated: 'Code of Conduct - Professional Behavior',
      reportedDate: '2025-01-22',
      incidentDate: '2025-01-21',
      reportedBy: 'Colleague Report (Anonymous)',
      severity: 'moderate',
      status: 'reported',
      description: 'Inappropriate behavior towards colleague during meeting',
      remarks: 'Investigation to be initiated'
    }
  ];

  const sourceViolations = items.length > 0 ? items : mockViolations;

  const filteredViolations = useMemo(() => {
    return sourceViolations.filter(violation => {
      const matchesSearch = violation.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           violation.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = selectedSeverity === 'all' || violation.severity === selectedSeverity;
      const matchesStatus = selectedStatus === 'all' || violation.status === selectedStatus;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [searchTerm, selectedSeverity, selectedStatus, sourceViolations]);

  const stats = {
    total: sourceViolations.length,
    critical: sourceViolations.filter(v => v.severity === 'critical').length,
    underInvestigation: sourceViolations.filter(v => v.status === 'under_investigation').length,
    resolved: sourceViolations.filter(v => v.status === 'resolved').length
  };

  const severityColors = {
    minor: 'bg-blue-100 text-blue-700 border-blue-300',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    serious: 'bg-orange-100 text-orange-700 border-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-300'
  };

  const statusColors = {
    reported: 'bg-blue-100 text-blue-700',
    under_investigation: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    escalated: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-600" />
          Policy Violations Tracking
        </h1>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage policy violations and misconduct</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading policy violations…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Violations</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Critical</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.critical}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Investigating</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.underInvestigation}</p>
            </div>
            <Eye className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Resolved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.resolved}</p>
            </div>
            <FileText className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employee..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select value={selectedSeverity} onChange={(e) => setSelectedSeverity(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Severity</option>
              <option value="minor">Minor</option>
              <option value="moderate">Moderate</option>
              <option value="serious">Serious</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Status</option>
              <option value="reported">Reported</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredViolations.map((violation) => (
          <div key={violation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{violation.policyViolated}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${severityColors[violation.severity]}`}>
                    {violation.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[violation.status]}`}>
                    {violation.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{violation.employeeName} ({violation.employeeId})</p>
                <p className="text-xs text-gray-600">Department: {violation.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Incident Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(violation.incidentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Reported Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {new Date(violation.reportedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Reported By</p>
                <p className="text-sm font-bold text-gray-900">{violation.reportedBy}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
              <p className="text-xs text-red-600 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-red-900">{violation.description}</p>
            </div>

            {violation.investigationAssignedTo && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-2">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Investigation Assigned To</p>
                <p className="text-sm text-blue-900">{violation.investigationAssignedTo}</p>
              </div>
            )}

            {violation.actionTaken && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-green-600 uppercase font-medium mb-1">Action Taken</p>
                <p className="text-sm text-green-900">{violation.actionTaken}</p>
              </div>
            )}

            {violation.remarks && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                <p className="text-sm text-yellow-900">{violation.remarks}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Full Report
              </button>
              {violation.status === 'reported' && (
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium">
                  Start Investigation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
