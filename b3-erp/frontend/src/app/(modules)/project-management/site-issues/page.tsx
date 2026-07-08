'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingUp, Calendar, Users, Eye, Plus, Download, Edit, FileText, Upload, MessageSquare, Shield } from 'lucide-react';
import {
 ReportIssueModal,
 EditIssueModal,
 AssignIssueModal,
 UpdateStatusModal,
 AddRootCauseModal,
 AddSolutionModal,
 AddResolutionModal,
 AddPreventiveMeasuresModal,
 UploadAttachmentsModal,
 AddCommentsModal,
 GenerateReportModal,
 ViewFullDetailsModal,
} from '@/components/project-management/SiteIssuesModals';

interface SiteIssue {
 id: string;
 issueNumber: string;
 projectId: string;
 projectName: string;
 issueTitle: string;
 issueType: 'Safety' | 'Quality' | 'Technical' | 'Material' | 'Resource' | 'Schedule' | 'Client' | 'Other';
 severity: 'Critical' | 'High' | 'Medium' | 'Low';
 priority: 'P1' | 'P2' | 'P3' | 'P4';
 reportedDate: string;
 reportedBy: string;
 reportedByRole: string;
 location: string;
 description: string;
 impactOnWork: string;
 rootCause: string;
 proposedSolution: string;
 assignedTo: string;
 targetDate: string;
 actualResolutionDate: string;
 status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';
 resolutionDetails: string;
 costImpact: number;
 scheduleImpact: number;
 preventiveMeasures: string;
 attachments: number;
 relatedIssues: string[];
}

export default function SiteIssuesPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterSeverity, setFilterSeverity] = useState<string>('all');
 const [filterType, setFilterType] = useState<string>('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedIssue, setSelectedIssue] = useState<SiteIssue | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [showReportModal, setShowReportModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showAssignModal, setShowAssignModal] = useState(false);
 const [showStatusModal, setShowStatusModal] = useState(false);
 const [showRootCauseModal, setShowRootCauseModal] = useState(false);
 const [showSolutionModal, setShowSolutionModal] = useState(false);
 const [showResolutionModal, setShowResolutionModal] = useState(false);
 const [showPreventiveModal, setShowPreventiveModal] = useState(false);
 const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
 const [showCommentsModal, setShowCommentsModal] = useState(false);
 const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);

 const [mockIssues, setMockIssues] = useState<SiteIssue[]>([]);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [submitting, setSubmitting] = useState(false);
 const [actionError, setActionError] = useState<string | null>(null);
 const [actionSuccess, setActionSuccess] = useState<string | null>(null);

 const refreshIssues = async () => {
   const rows = await projectManagementService.listSiteIssues();
   setMockIssues(Array.isArray(rows) ? (rows as unknown as SiteIssue[]) : []);
 };

 useEffect(() => {
   refreshIssues().catch((e) =>
     setLoadError(e instanceof Error ? e.message : 'Failed to load site issues')
   );
 }, []);

 const runAction = async (fn: () => Promise<void>, success: string, close: () => void) => {
   setSubmitting(true);
   setActionError(null);
   setActionSuccess(null);
   try {
     await fn();
     await refreshIssues();
     setActionSuccess(success);
     close();
   } catch (err) {
     setActionError(err instanceof Error ? err.message : 'Action failed');
   } finally {
     setSubmitting(false);
   }
 };

 const updateSelectedIssue = (patch: Partial<SiteIssue>, success: string, close: () => void) => {
   if (!selectedIssue) { close(); return; }
   runAction(
     () => projectManagementService.updateSiteIssue(selectedIssue.id, patch as any).then(() => undefined),
     success,
     close
   );
 };

 const stats = {
  totalIssues: mockIssues.length,
  open: mockIssues.filter(i => i.status === 'Open').length,
  inProgress: mockIssues.filter(i => i.status === 'In Progress').length,
  resolved: mockIssues.filter(i => i.status === 'Resolved').length,
  closed: mockIssues.filter(i => i.status === 'Closed').length,
  critical: mockIssues.filter(i => i.severity === 'Critical').length,
  avgResolutionTime: 2.5,
 };

 const filteredIssues = mockIssues.filter((issue) => {
  const matchesSearch =
   issue.issueNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   issue.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
   issue.projectName.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
  const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
  const matchesType = filterType === 'all' || issue.issueType === filterType;
  return matchesSearch && matchesStatus && matchesSeverity && matchesType;
 });

 const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedIssues = filteredIssues.slice(startIndex, startIndex + itemsPerPage);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Open':
    return 'bg-yellow-100 text-yellow-800';
   case 'In Progress':
    return 'bg-blue-100 text-blue-800';
   case 'Resolved':
    return 'bg-green-100 text-green-800';
   case 'Closed':
    return 'bg-gray-100 text-gray-800';
   case 'Reopened':
    return 'bg-red-100 text-red-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getSeverityColor = (severity: string) => {
  switch (severity) {
   case 'Critical':
    return 'bg-red-100 text-red-800';
   case 'High':
    return 'bg-orange-100 text-orange-800';
   case 'Medium':
    return 'bg-yellow-100 text-yellow-800';
   case 'Low':
    return 'bg-green-100 text-green-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getStatusIcon = (status: string) => {
  switch (status) {
   case 'Closed':
   case 'Resolved':
    return <CheckCircle className="h-5 w-5 text-green-600" />;
   case 'In Progress':
    return <Clock className="h-5 w-5 text-blue-600" />;
   case 'Open':
   case 'Reopened':
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
   default:
    return null;
  }
 };

 // Handler functions
 const handleReportIssue = (data: any) => {
  runAction(
   () => projectManagementService.createSiteIssue({
    ...(data ?? {}),
    reportedDate: data?.reportedDate ?? new Date().toISOString().slice(0, 10),
    status: data?.status ?? 'Open',
   }).then(() => undefined),
   'Issue reported',
   () => setShowReportModal(false)
  );
 };

 const handleEditIssue = (data: any) => {
  updateSelectedIssue(data ?? {}, 'Issue updated', () => { setShowEditModal(false); setSelectedIssue(null); });
 };

 const handleAssignIssue = (data: any) => {
  updateSelectedIssue(
   { assignedTo: String(data?.assignedTo ?? data?.assignee ?? ''), targetDate: data?.targetDate },
   'Issue assigned',
   () => { setShowAssignModal(false); setSelectedIssue(null); }
  );
 };

 const handleUpdateStatus = (data: any) => {
  updateSelectedIssue(
   { status: String(data?.status ?? '') as SiteIssue['status'], actualResolutionDate: data?.actualResolutionDate },
   'Status updated',
   () => { setShowStatusModal(false); setSelectedIssue(null); }
  );
 };

 const handleAddRootCause = (data: any) => {
  updateSelectedIssue(
   { rootCause: String(data?.rootCause ?? data?.text ?? '') },
   'Root cause added',
   () => { setShowRootCauseModal(false); setSelectedIssue(null); }
  );
 };

 const handleAddSolution = (data: any) => {
  updateSelectedIssue(
   { proposedSolution: String(data?.proposedSolution ?? data?.solution ?? data?.text ?? '') },
   'Solution added',
   () => { setShowSolutionModal(false); setSelectedIssue(null); }
  );
 };

 const handleAddResolution = (data: any) => {
  updateSelectedIssue(
   {
    resolutionDetails: String(data?.resolutionDetails ?? data?.resolution ?? data?.text ?? ''),
    actualResolutionDate: data?.actualResolutionDate ?? new Date().toISOString().slice(0, 10),
    status: 'Resolved',
   },
   'Resolution recorded',
   () => { setShowResolutionModal(false); setSelectedIssue(null); }
  );
 };

 const handleAddPreventive = (data: any) => {
  updateSelectedIssue(
   { preventiveMeasures: String(data?.preventiveMeasures ?? data?.text ?? '') },
   'Preventive measures added',
   () => { setShowPreventiveModal(false); setSelectedIssue(null); }
  );
 };

 const handleUploadAttachments = (data: any) => {
  const count = Array.isArray(data?.files) ? data.files.length : Number(data?.attachments ?? 0);
  updateSelectedIssue(
   { attachments: (selectedIssue?.attachments ?? 0) + (count || 1) },
   'Attachments uploaded',
   () => { setShowAttachmentsModal(false); setSelectedIssue(null); }
  );
 };

 const handleAddComment = (data: any) => {
  // No dedicated comments collection endpoint; append to impact/notes on the issue.
  const comment = String(data?.comment ?? data?.text ?? '');
  const existing = selectedIssue?.impactOnWork ?? '';
  updateSelectedIssue(
   { impactOnWork: existing ? `${existing}\n${comment}` : comment },
   'Comment added',
   () => { setShowCommentsModal(false); setSelectedIssue(null); }
  );
 };

 const handleGenerateReport = (data: any) => {
  // Report generation is a client-side export of the current filtered issues.
  setShowGenerateReportModal(false);
  setSelectedIssue(null);
 };

 // Helper functions to open modals with selected issue
 const openEditModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowEditModal(true);
 };

 const openAssignModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowAssignModal(true);
 };

 const openStatusModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowStatusModal(true);
 };

 const openRootCauseModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowRootCauseModal(true);
 };

 const openSolutionModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowSolutionModal(true);
 };

 const openResolutionModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowResolutionModal(true);
 };

 const openPreventiveModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowPreventiveModal(true);
 };

 const openAttachmentsModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowAttachmentsModal(true);
 };

 const openCommentsModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowCommentsModal(true);
 };

 const openDetailsModal = (issue: SiteIssue) => {
  setSelectedIssue(issue);
  setShowDetailsModal(true);
 };

 return (
  <div className="p-6 space-y-3">
   {loadError && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>
   )}
   {actionError && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{actionError}</div>
   )}
   {actionSuccess && (
    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{actionSuccess}</div>
   )}
   {/* Header */}
   <div className="flex justify-between items-start">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Site Issue Tracking</h1>
     <p className="text-gray-600 mt-1">Real-time tracking and resolution of site issues</p>
    </div>
    <div className="flex items-center space-x-3">
     <button
      onClick={() => setShowGenerateReportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
     >
      <FileText className="h-5 w-5" />
      <span>Generate Report</span>
     </button>
     <button
      onClick={() => setShowReportModal(true)}
      disabled={submitting}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
     >
      <Plus className="h-5 w-5" />
      <span>{submitting ? 'Saving…' : 'Report Issue'}</span>
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Issues</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Open</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-yellow-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">In Progress</p>
       <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
      </div>
      <Clock className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Resolved</p>
       <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Closed</p>
       <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
      </div>
      <XCircle className="h-8 w-8 text-gray-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Critical</p>
       <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Avg Resolution</p>
       <p className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime}d</p>
      </div>
      <TrendingUp className="h-8 w-8 text-purple-600" />
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
     <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
       type="text"
       placeholder="Search by issue number, title, project..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
      <select
       value={filterStatus}
       onChange={(e) => setFilterStatus(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Status</option>
       <option value="Open">Open</option>
       <option value="In Progress">In Progress</option>
       <option value="Resolved">Resolved</option>
       <option value="Closed">Closed</option>
       <option value="Reopened">Reopened</option>
      </select>
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
      <select
       value={filterSeverity}
       onChange={(e) => setFilterSeverity(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Severity</option>
       <option value="Critical">Critical</option>
       <option value="High">High</option>
       <option value="Medium">Medium</option>
       <option value="Low">Low</option>
      </select>
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
      <select
       value={filterType}
       onChange={(e) => setFilterType(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Types</option>
       <option value="Safety">Safety</option>
       <option value="Quality">Quality</option>
       <option value="Technical">Technical</option>
       <option value="Material">Material</option>
       <option value="Resource">Resource</option>
       <option value="Schedule">Schedule</option>
       <option value="Client">Client</option>
       <option value="Other">Other</option>
      </select>
     </div>
    </div>
   </div>

   {/* Issues Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Issue Details
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project / Location
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Type / Severity
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Reported By
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Impact
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Status
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Actions
        </th>
       </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
       {paginatedIssues.map((issue) => (
        <tr key={issue.id} className="hover:bg-gray-50">
         <td className="px-4 py-4">
          <div>
           <div className="text-sm font-medium text-gray-900">{issue.issueNumber}</div>
           <div className="text-sm text-gray-600">{issue.issueTitle}</div>
           <div className="text-xs text-gray-500">{issue.reportedDate}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{issue.projectId}</div>
          <div className="text-xs text-gray-600">{issue.projectName}</div>
          <div className="text-xs text-gray-500">{issue.location}</div>
         </td>
         <td className="px-4 py-4">
          <div className="space-y-1">
           <div className="text-sm text-gray-900">{issue.issueType}</div>
           <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
            {issue.severity}
           </span>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{issue.reportedBy}</div>
          <div className="text-xs text-gray-500">{issue.reportedByRole}</div>
         </td>
         <td className="px-4 py-4">
          <div className="text-xs">
           {issue.costImpact > 0 && (
            <div className="text-red-600">Cost: ₹{(issue.costImpact / 1000).toFixed(1)}K</div>
           )}
           {issue.scheduleImpact > 0 && (
            <div className="text-orange-600">Schedule: +{issue.scheduleImpact}d</div>
           )}
           {issue.costImpact === 0 && issue.scheduleImpact === 0 && (
            <div className="text-green-600">No impact</div>
           )}
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="flex items-center space-x-2">
           {getStatusIcon(issue.status)}
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
            {issue.status}
           </span>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="flex flex-wrap gap-1">
           <button
            onClick={() => openDetailsModal(issue)}
            className="p-1.5 bg-slate-50 text-slate-700 rounded hover:bg-slate-100"
            title="View Details"
           >
            <Eye className="h-4 w-4" />
           </button>
           <button
            onClick={() => openEditModal(issue)}
            className="p-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100"
            title="Edit"
           >
            <Edit className="h-4 w-4" />
           </button>
           <button
            onClick={() => openAssignModal(issue)}
            className="p-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
            title="Assign"
           >
            <Users className="h-4 w-4" />
           </button>
           <button
            onClick={() => openStatusModal(issue)}
            className="p-1.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
            title="Update Status"
           >
            <TrendingUp className="h-4 w-4" />
           </button>
           <button
            onClick={() => openRootCauseModal(issue)}
            className="p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100"
            title="Root Cause"
           >
            <AlertTriangle className="h-4 w-4" />
           </button>
           <button
            onClick={() => openSolutionModal(issue)}
            className="p-1.5 bg-teal-50 text-teal-700 rounded hover:bg-teal-100"
            title="Add Solution"
           >
            <CheckCircle className="h-4 w-4" />
           </button>
           <button
            onClick={() => openResolutionModal(issue)}
            className="p-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
            title="Add Resolution"
           >
            <CheckCircle className="h-4 w-4" />
           </button>
           <button
            onClick={() => openPreventiveModal(issue)}
            className="p-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100"
            title="Preventive Measures"
           >
            <Shield className="h-4 w-4" />
           </button>
           <button
            onClick={() => openAttachmentsModal(issue)}
            className="p-1.5 bg-amber-50 text-amber-700 rounded hover:bg-amber-100"
            title="Upload Files"
           >
            <Upload className="h-4 w-4" />
           </button>
           <button
            onClick={() => openCommentsModal(issue)}
            className="p-1.5 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100"
            title="Add Comment"
           >
            <MessageSquare className="h-4 w-4" />
           </button>
          </div>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>

    {/* Pagination */}
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
     <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
       Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredIssues.length)}</span> of{' '}
       <span className="font-medium">{filteredIssues.length}</span> issues
      </div>
      <div className="flex space-x-2">
       <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
       >
        Previous
       </button>
       {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
         key={page}
         onClick={() => setCurrentPage(page)}
         className={`px-3 py-1 border rounded-md text-sm font-medium ${
          currentPage === page
           ? 'bg-blue-600 text-white border-blue-600'
           : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
         }`}
        >
         {page}
        </button>
       ))}
       <button
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
       >
        Next
       </button>
      </div>
     </div>
    </div>
   </div>

   {/* All Modals */}
   <ReportIssueModal
    isOpen={showReportModal}
    onClose={() => setShowReportModal(false)}
    onReport={handleReportIssue}
   />

   <EditIssueModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedIssue(null);
    }}
    onEdit={handleEditIssue}
    issue={selectedIssue}
   />

   <AssignIssueModal
    isOpen={showAssignModal}
    onClose={() => {
     setShowAssignModal(false);
     setSelectedIssue(null);
    }}
    onAssign={handleAssignIssue}
    issue={selectedIssue}
   />

   <UpdateStatusModal
    isOpen={showStatusModal}
    onClose={() => {
     setShowStatusModal(false);
     setSelectedIssue(null);
    }}
    onUpdate={handleUpdateStatus}
    issue={selectedIssue}
   />

   <AddRootCauseModal
    isOpen={showRootCauseModal}
    onClose={() => {
     setShowRootCauseModal(false);
     setSelectedIssue(null);
    }}
    onAdd={handleAddRootCause}
    issue={selectedIssue}
   />

   <AddSolutionModal
    isOpen={showSolutionModal}
    onClose={() => {
     setShowSolutionModal(false);
     setSelectedIssue(null);
    }}
    onAdd={handleAddSolution}
    issue={selectedIssue}
   />

   <AddResolutionModal
    isOpen={showResolutionModal}
    onClose={() => {
     setShowResolutionModal(false);
     setSelectedIssue(null);
    }}
    onAdd={handleAddResolution}
    issue={selectedIssue}
   />

   <AddPreventiveMeasuresModal
    isOpen={showPreventiveModal}
    onClose={() => {
     setShowPreventiveModal(false);
     setSelectedIssue(null);
    }}
    onAdd={handleAddPreventive}
    issue={selectedIssue}
   />

   <UploadAttachmentsModal
    isOpen={showAttachmentsModal}
    onClose={() => {
     setShowAttachmentsModal(false);
     setSelectedIssue(null);
    }}
    onUpload={handleUploadAttachments}
    issue={selectedIssue}
   />

   <AddCommentsModal
    isOpen={showCommentsModal}
    onClose={() => {
     setShowCommentsModal(false);
     setSelectedIssue(null);
    }}
    onAdd={handleAddComment}
    issue={selectedIssue}
   />

   <GenerateReportModal
    isOpen={showGenerateReportModal}
    onClose={() => {
     setShowGenerateReportModal(false);
     setSelectedIssue(null);
    }}
    onGenerate={handleGenerateReport}
    issue={selectedIssue}
   />

   <ViewFullDetailsModal
    isOpen={showDetailsModal}
    onClose={() => {
     setShowDetailsModal(false);
     setSelectedIssue(null);
    }}
    issue={selectedIssue}
   />
  </div>
 );
}
