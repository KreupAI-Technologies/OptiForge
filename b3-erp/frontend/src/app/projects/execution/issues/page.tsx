'use client';

import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Search, Filter, PlusCircle, Download, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

interface Issue {
  id: string;
  issueNumber: string;
  title: string;
  description: string;
  projectCode: string;
  projectName: string;
  category: 'technical' | 'resource' | 'scope' | 'schedule' | 'quality' | 'stakeholder' | 'risk' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'on-hold' | 'resolved' | 'closed' | 'escalated';
  reportedBy: string;
  reportedDate: string;
  assignedTo: string;
  targetDate: string;
  resolvedDate?: string;
  impact: string;
  resolution?: string;
  daysOpen: number;
  tags: string[];
}

const ISSUE_CATEGORIES: Issue['category'][] = ['technical', 'resource', 'scope', 'schedule', 'quality', 'stakeholder', 'risk', 'other'];
const ISSUE_SEVERITIES: Issue['severity'][] = ['critical', 'high', 'medium', 'low'];
const ISSUE_PRIORITIES: Issue['priority'][] = ['urgent', 'high', 'medium', 'low'];
const ISSUE_STATUSES: Issue['status'][] = ['open', 'in-progress', 'on-hold', 'resolved', 'closed', 'escalated'];

export default function IssueTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [rows, setRows] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await projectManagementService.listProjectIssues();
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const mapped: Issue[] = list.map((r: any) => {
          const category = ISSUE_CATEGORIES.includes(String(r.category) as Issue['category'])
            ? (String(r.category) as Issue['category'])
            : 'other';
          const severityRaw = String(r.severity ?? r.impact ?? '').toLowerCase();
          const severity = ISSUE_SEVERITIES.includes(severityRaw as Issue['severity'])
            ? (severityRaw as Issue['severity'])
            : 'medium';
          const priorityRaw = String(r.priority ?? '').toLowerCase();
          const priority = ISSUE_PRIORITIES.includes(priorityRaw as Issue['priority'])
            ? (priorityRaw as Issue['priority'])
            : 'medium';
          const statusRaw = String(r.status ?? '').toLowerCase().replace(/_/g, '-');
          const status = ISSUE_STATUSES.includes(statusRaw as Issue['status'])
            ? (statusRaw as Issue['status'])
            : 'open';
          return {
            id: String(r.id ?? ''),
            issueNumber: String(r.number ?? r.id ?? ''),
            title: String(r.title ?? ''),
            description: String(r.description ?? ''),
            projectCode: String(r.projectNumber ?? ''),
            projectName: String(r.projectName ?? ''),
            category,
            severity,
            priority,
            status,
            reportedBy: String(r.raisedBy ?? ''),
            reportedDate: String(r.raisedDate ?? ''),
            assignedTo: String(r.assignedTo ?? ''),
            targetDate: String(r.targetDate ?? ''),
            resolvedDate: r.resolvedDate ? String(r.resolvedDate) : undefined,
            impact: String(r.impact ?? ''),
            resolution: r.mitigationPlan ? String(r.mitigationPlan) : undefined,
            daysOpen: Number(r.daysOpen ?? r.scheduleImpact ?? 0),
            tags: Array.isArray(r.tags) ? r.tags.map((t: any) => String(t)) : [],
          };
        });
        setRows(mapped);
      } catch (err) {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load issues');
        setRows([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Get unique values for filters
  const projects = useMemo(() =>
    ['all', ...Array.from(new Set(rows.map(i => i.projectName)))],
    [rows]
  );

  // Filter issues
  const filteredIssues = useMemo(() => {
    return rows.filter(issue => {
      const matchesSearch = searchTerm === '' ||
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProject = projectFilter === 'all' || issue.projectName === projectFilter;
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;

      return matchesSearch && matchesProject && matchesStatus && matchesSeverity && matchesCategory;
    });
  }, [rows, searchTerm, projectFilter, statusFilter, severityFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalIssues = rows.length;
    const openIssues = rows.filter(i => i.status === 'open').length;
    const criticalIssues = rows.filter(i => i.severity === 'critical').length;
    const resolvedIssues = rows.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const escalatedIssues = rows.filter(i => i.status === 'escalated').length;
    const avgResolutionDays = Math.round(
      rows
        .filter(i => i.resolvedDate)
        .reduce((sum, i) => sum + i.daysOpen, 0) /
      rows.filter(i => i.resolvedDate).length || 0
    );

    return {
      totalIssues,
      openIssues,
      criticalIssues,
      resolvedIssues,
      escalatedIssues,
      avgResolutionDays
    };
  }, [rows]);

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'on-hold': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'escalated': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSeverityColor = (severity: Issue['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const isOverdue = (targetDate: string, status: Issue['status']) => {
    return (status === 'open' || status === 'in-progress' || status === 'escalated') &&
           new Date(targetDate) < new Date();
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <AlertCircle className="h-8 w-8 text-teal-600" />
          Issue Tracking
        </h1>
        <p className="text-gray-600 mt-2">Track and resolve project issues with priority and impact assessment</p>
      </div>

      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading issues…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search issues by title, number, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCsv('issue-tracking', filteredIssues as unknown as Record<string, unknown>[])} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              Log Issue
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Issues</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{stats.totalIssues}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.openIssues}</p>
            </div>
            <AlertCircle className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.criticalIssues}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Escalated</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{stats.escalatedIssues}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Resolved</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.resolvedIssues}</p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Resolution</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.avgResolutionDays}d</p>
            </div>
            <Clock className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {projects.map(project => (
              <option key={project} value={project}>
                {project === 'all' ? 'All Projects' : project}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="resource">Resource</option>
            <option value="scope">Scope</option>
            <option value="schedule">Schedule</option>
            <option value="quality">Quality</option>
            <option value="stakeholder">Stakeholder</option>
            <option value="risk">Risk</option>
            <option value="other">Other</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredIssues.length} of {rows.length} issues
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-2">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(issue.severity)}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(issue.status)}`}>
                    {issue.status.replace('-', ' ').toUpperCase()}
                  </span>
                  {isOverdue(issue.targetDate, issue.status) && (
                    <span className="px-2 py-1 text-xs font-medium rounded border bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      OVERDUE
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{issue.issueNumber}</span>
                  <span>•</span>
                  <span>{issue.projectName}</span>
                  <span>•</span>
                  <span className="capitalize">{issue.category}</span>
                  <span>•</span>
                  <span className={`font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority.toUpperCase()} Priority
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Reported By</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{issue.reportedBy}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(issue.reportedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{issue.assignedTo}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Target: {new Date(issue.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Days Open</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{issue.daysOpen} days</span>
                </div>
                {issue.resolvedDate && (
                  <p className="text-xs text-green-600 mt-1">
                    Resolved: {new Date(issue.resolvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Impact</p>
              <p className="text-sm text-gray-700">{issue.impact}</p>
            </div>

            {issue.resolution && (
              <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-medium mb-1">Resolution</p>
                <p className="text-sm text-green-900">{issue.resolution}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {issue.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="h-16 w-16 mb-2 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Issues Found</h3>
            <p className="text-gray-600">No issues match your current filters</p>
          </div>
        )}
      </div>

      {/* Guidelines Section */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Issue Management Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Severity Levels</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium text-red-700">Critical:</span> Work stoppage, safety risk, major contract breach</li>
              <li><span className="font-medium text-orange-700">High:</span> Significant schedule/cost impact, quality issues</li>
              <li><span className="font-medium text-yellow-700">Medium:</span> Moderate impact, requires attention within SLA</li>
              <li><span className="font-medium text-green-700">Low:</span> Minor inconvenience, minimal impact on project</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Issue Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Technical:</span> Design, engineering, technical problems</li>
              <li><span className="font-medium">Resource:</span> Manpower, equipment, material shortages</li>
              <li><span className="font-medium">Scope:</span> Scope creep, changes, unclear requirements</li>
              <li><span className="font-medium">Schedule:</span> Delays, timeline conflicts, dependencies</li>
              <li><span className="font-medium">Quality:</span> Defects, non-conformance, rework</li>
              <li><span className="font-medium">Stakeholder:</span> Communication, approvals, client issues</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Status Workflow</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-medium">Open:</span> Newly logged, awaiting assignment or action</li>
              <li><span className="font-medium">In Progress:</span> Actively being worked on, resolution in progress</li>
              <li><span className="font-medium">On Hold:</span> Blocked or waiting for external dependency</li>
              <li><span className="font-medium">Escalated:</span> Requires senior management intervention</li>
              <li><span className="font-medium">Resolved:</span> Solution implemented, awaiting verification</li>
              <li><span className="font-medium">Closed:</span> Verified and closed, no further action needed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-700 mb-2">Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Log issues immediately when identified</li>
              <li>• Clearly describe impact and root cause</li>
              <li>• Assign ownership and target resolution date</li>
              <li>• Escalate critical issues within 24 hours</li>
              <li>• Update status and resolution notes regularly</li>
              <li>• Link issues to risks, changes, and lessons learned</li>
              <li>• Track resolution time and analyze trends</li>
              <li>• Conduct issue review in weekly project meetings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
