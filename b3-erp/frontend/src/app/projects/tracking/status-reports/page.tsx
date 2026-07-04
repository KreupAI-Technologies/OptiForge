'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Search, Filter, PlusCircle, Download, Calendar, User, CheckCircle2, Clock, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';

type StatusReport = {
  id: string;
  reportNumber: string;
  title: string;
  reportType: 'weekly' | 'monthly' | 'milestone' | 'risk-issue' | 'executive' | 'closure';
  project: string;
  projectCode: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'published';
  period: string;
  author: string;
  reviewer: string;
  createdDate: string;
  submittedDate?: string;
  approvedDate?: string;
  publishedDate?: string;
  overallStatus: 'on-track' | 'at-risk' | 'critical';
  scheduleHealth: 'green' | 'yellow' | 'red';
  budgetHealth: 'green' | 'yellow' | 'red';
  qualityHealth: 'green' | 'yellow' | 'red';
  summary: string;
  keyAccomplishments: string[];
  upcomingTasks: string[];
  risks: number;
  issues: number;
  changeRequests: number;
};

function mapReport(r: any, index: number): StatusReport {
  return {
    id: String(r?.id ?? r?.reportId ?? index + 1),
    reportNumber: r?.reportNumber ?? r?.reportName ?? r?.number ?? `RPT-${index + 1}`,
    title: r?.title ?? r?.reportName ?? r?.name ?? 'Untitled Report',
    reportType: (r?.reportType ?? r?.category ?? r?.type ?? 'weekly') as StatusReport['reportType'],
    project: r?.project ?? r?.projectName ?? r?.projectScope ?? '—',
    projectCode: r?.projectCode ?? r?.code ?? '—',
    status: (r?.status ?? 'draft') as StatusReport['status'],
    period: r?.period ?? r?.frequency ?? '—',
    author: r?.author ?? r?.generatedBy ?? '—',
    reviewer: r?.reviewer ?? '—',
    createdDate: r?.createdDate ?? r?.lastGenerated ?? r?.createdAt ?? '',
    submittedDate: r?.submittedDate ?? undefined,
    approvedDate: r?.approvedDate ?? undefined,
    publishedDate: r?.publishedDate ?? undefined,
    overallStatus: (r?.overallStatus ?? 'on-track') as StatusReport['overallStatus'],
    scheduleHealth: (r?.scheduleHealth ?? 'green') as StatusReport['scheduleHealth'],
    budgetHealth: (r?.budgetHealth ?? 'green') as StatusReport['budgetHealth'],
    qualityHealth: (r?.qualityHealth ?? 'green') as StatusReport['qualityHealth'],
    summary: r?.summary ?? r?.description ?? '',
    keyAccomplishments: Array.isArray(r?.keyAccomplishments) ? r.keyAccomplishments : [],
    upcomingTasks: Array.isArray(r?.upcomingTasks) ? r.upcomingTasks : [],
    risks: Number(r?.risks ?? 0),
    issues: Number(r?.issues ?? 0),
    changeRequests: Number(r?.changeRequests ?? 0),
  };
}


export default function StatusReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [reports, setReports] = useState<StatusReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await projectManagementService.getProjectsReports();
        const mapped = (Array.isArray(raw) ? raw : []).map((r: any, i: number) => mapReport(r, i));
        if (!cancelled) setReports(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setReports([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const projects = useMemo(() => ['all', ...Array.from(new Set(reports.map(r => r.projectCode)))], [reports]);
  const reportTypes = ['all', 'weekly', 'monthly', 'milestone', 'risk-issue', 'executive', 'closure'];

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = [r.reportNumber, r.title, r.project, r.projectCode, r.author, r.period].some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      const matchesType = reportTypeFilter === 'all' ? true : r.reportType === reportTypeFilter;
      const matchesProject = projectFilter === 'all' ? true : r.projectCode === projectFilter;
      return matchesSearch && matchesStatus && matchesType && matchesProject;
    });
  }, [reports, searchTerm, statusFilter, reportTypeFilter, projectFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Calculate stats (derived from fetched reports)
  const monthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const totalReports = reports.length;
  const thisMonthReports = reports.filter(r => (r.createdDate ?? '').startsWith(monthPrefix)).length;
  const publishedReports = reports.filter(r => r.status === 'published').length;
  const draftReports = reports.filter(r => r.status === 'draft').length;
  const pendingReview = reports.filter(r => r.status === 'submitted' || r.status === 'under-review').length;
  const avgTurnaround = 2.3; // days

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-50 text-green-700';
      case 'approved': return 'bg-blue-50 text-blue-700';
      case 'under-review': return 'bg-purple-50 text-purple-700';
      case 'submitted': return 'bg-indigo-50 text-indigo-700';
      case 'draft': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600';
      case 'at-risk': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-teal-600" />
          Status Reports
        </h1>
        <p className="text-gray-600 mt-2">Project status reports, milestones, and executive summaries</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search reports by number, title, project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button onClick={() => exportToCsv('status-reports', filtered)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              <PlusCircle className="h-4 w-4" />
              Create Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-600 text-sm font-medium">Total Reports</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalReports}</p>
            </div>
            <FileText className="h-12 w-12 text-teal-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{thisMonthReports}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Published</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{publishedReports}</p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Draft</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{draftReports}</p>
            </div>
            <FileText className="h-12 w-12 text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{pendingReview}</p>
            </div>
            <Clock className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-medium">Avg Turnaround</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{avgTurnaround}</p>
              <p className="text-xs text-indigo-600 mt-1">days</p>
            </div>
            <TrendingUp className="h-12 w-12 text-indigo-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 mr-auto">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Filters</span>
          </div>
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {projects.map(p => <option key={p} value={p}>{p === 'all' ? 'All Projects' : p}</option>)}
          </select>
          <select
            value={reportTypeFilter}
            onChange={(e) => { setReportTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {reportTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>
          <button
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => { setStatusFilter('all'); setReportTypeFilter('all'); setProjectFilter('all'); setSearchTerm(''); setPage(1); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Reports table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Report</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Project</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Health</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {pageData.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{r.title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{r.reportNumber}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                          {r.reportType.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-800">{r.project}</span>
                      <span className="text-xs text-gray-500">{r.projectCode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {r.period}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span>{r.author}</span>
                        <span className="text-xs text-gray-500">Rev: {r.reviewer}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(r.scheduleHealth)}`} />
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(r.budgetHealth)}`} />
                      <div className={`w-3 h-3 rounded-full ${getHealthColor(r.qualityHealth)}`} />
                    </div>
                    <div className={`text-xs font-medium mt-1 ${getOverallStatusColor(r.overallStatus)}`}>
                      {r.overallStatus}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-xs text-gray-600">
                      <span>R: {r.risks} | I: {r.issues}</span>
                      <span>CR: {r.changeRequests}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(r.status)}`}>
                      {r.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="text-gray-700 hover:text-gray-900 p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-teal-700 hover:text-teal-900 p-1">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading reports…</td>
                </tr>
              )}
              {!isLoading && loadError && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-red-600">{loadError}</td>
                </tr>
              )}
              {!isLoading && !loadError && pageData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <div className="px-2 text-sm flex items-center">{page} / {totalPages}</div>
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Status Reporting Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Report Types:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="font-medium">Weekly:</span> Progress, accomplishments, next steps</li>
              <li><span className="font-medium">Monthly:</span> Comprehensive status, metrics, trends</li>
              <li><span className="font-medium">Milestone:</span> Key deliverable completion reports</li>
              <li><span className="font-medium">Risk/Issue:</span> Critical items requiring attention</li>
              <li><span className="font-medium">Executive:</span> High-level summaries for leadership</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Best Practices:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Submit reports on time (weekly by Friday)</li>
              <li>Include clear status indicators (RAG)</li>
              <li>Document key accomplishments and blockers</li>
              <li>Review and approve reports within 2 days</li>
              <li>Archive published reports for audit trail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
