'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { projectManagementService, PmProjectIssue } from '@/services/ProjectManagementService';
import {
 Search,
 Plus,
 AlertTriangle,
 AlertCircle,
 CheckCircle,
 Clock,
 TrendingUp,
 Eye,
 Edit,
 User,
 Calendar,
 Shield,
 MoreVertical,
 MessageSquare,
 Paperclip,
 Link as LinkIcon,
 ArrowUp,
 XCircle,
 Target,
 FileText,
 BarChart3,
} from 'lucide-react';
import {
 LogIssueModal,
 EditIssueModal,
 AssignIssueModal,
 UpdateStatusModal,
 AddCommentModal,
 AttachFilesModal,
 LinkItemsModal,
 EscalateIssueModal,
 ResolveIssueModal,
 CloseIssueModal,
 ImpactAnalysisModal,
 RootCauseModal,
 IssueReportModal,
 BulkUpdateModal,
 IssueBoardModal,
} from '@/components/project-management/IssueModals';

interface IssueRisk {
 id: string;
 number: string;
 title: string;
 type: 'Issue' | 'Risk';
 category: 'Technical' | 'Financial' | 'Resource' | 'Schedule' | 'Quality' | 'Safety' | 'Client';
 projectNumber: string;
 projectName: string;
 description: string;
 impact: 'Critical' | 'High' | 'Medium' | 'Low';
 probability: 'Very High' | 'High' | 'Medium' | 'Low';
 status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Deferred';
 priority: 'P1' | 'P2' | 'P3' | 'P4';
 raisedBy: string;
 assignedTo: string;
 raisedDate: string;
 targetDate: string;
 resolvedDate?: string;
 mitigationPlan: string;
 costImpact: number;
 scheduleImpact: number;
}

const mockIssuesRisks: IssueRisk[] = [
 {
  id: '1',
  number: 'ISS-001',
  title: 'Delay in Equipment Delivery from Supplier',
  type: 'Issue',
  category: 'Schedule',
  projectNumber: 'PRJ-2024-001',
  projectName: 'Taj Hotel Commercial Kitchen',
  description: 'Cooking range units delivery delayed by 5 days due to manufacturing issues at supplier end',
  impact: 'High',
  probability: 'Very High',
  status: 'In Progress',
  priority: 'P1',
  raisedBy: 'Rajesh Kumar',
  assignedTo: 'Procurement Team',
  raisedDate: '2024-03-10',
  targetDate: '2024-03-15',
  mitigationPlan: 'Expedite shipping, arrange alternate supplier for critical items, adjust installation schedule',
  costImpact: 150000,
  scheduleImpact: 5,
 },
 {
  id: '2',
  number: 'RISK-001',
  title: 'Potential Monsoon Delays for Civil Work',
  type: 'Risk',
  category: 'Schedule',
  projectNumber: 'PRJ-2024-002',
  projectName: 'BigBasket Cold Storage',
  description: 'Heavy monsoon expected in June which may delay outdoor civil work and foundation',
  impact: 'High',
  probability: 'High',
  status: 'Open',
  priority: 'P2',
  raisedBy: 'Priya Sharma',
  assignedTo: 'Civil Team',
  raisedDate: '2024-03-01',
  targetDate: '2024-05-30',
  mitigationPlan: 'Accelerate civil work before monsoon, arrange rain protection measures, have backup schedule',
  costImpact: 250000,
  scheduleImpact: 10,
 },
 {
  id: '3',
  number: 'ISS-002',
  title: 'Testing Equipment Calibration Issue',
  type: 'Issue',
  category: 'Technical',
  projectNumber: 'PRJ-2024-003',
  projectName: 'L&T Switchgear Panel',
  description: 'HT testing equipment showing calibration errors, FAT cannot proceed without recalibration',
  impact: 'Critical',
  probability: 'Very High',
  status: 'In Progress',
  priority: 'P1',
  raisedBy: 'Amit Patel',
  assignedTo: 'QC Team',
  raisedDate: '2024-03-12',
  targetDate: '2024-03-14',
  mitigationPlan: 'Emergency calibration arranged with OEM, backup testing lab identified',
  costImpact: 80000,
  scheduleImpact: 3,
 },
 {
  id: '4',
  number: 'RISK-002',
  title: 'Client Approval Delays on Design',
  type: 'Risk',
  category: 'Client',
  projectNumber: 'PRJ-2024-004',
  projectName: 'ITC Grand Kitchen',
  description: 'Client feedback cycle taking longer than expected, may impact procurement lead time',
  impact: 'Medium',
  probability: 'High',
  status: 'Open',
  priority: 'P2',
  raisedBy: 'Sunita Reddy',
  assignedTo: 'Project Manager',
  raisedDate: '2024-03-08',
  targetDate: '2024-03-20',
  mitigationPlan: 'Schedule daily review meetings, provide multiple design options, escalate to senior management',
  costImpact: 0,
  scheduleImpact: 7,
 },
 {
  id: '5',
  number: 'ISS-003',
  title: 'Shortage of Installation Technicians',
  type: 'Issue',
  category: 'Resource',
  projectNumber: 'PRJ-2024-001',
  projectName: 'Taj Hotel Commercial Kitchen',
  description: '2 key installation technicians on medical leave, installation pace slowed down',
  impact: 'Medium',
  probability: 'Very High',
  status: 'In Progress',
  priority: 'P2',
  raisedBy: 'Suresh Patel',
  assignedTo: 'HR Department',
  raisedDate: '2024-03-11',
  targetDate: '2024-03-16',
  mitigationPlan: 'Hire temporary contractors, reallocate team from other projects, work overtime',
  costImpact: 120000,
  scheduleImpact: 4,
 },
 {
  id: '6',
  number: 'RISK-003',
  title: 'Material Price Escalation',
  type: 'Risk',
  category: 'Financial',
  projectNumber: 'PRJ-2024-006',
  projectName: 'Siemens Switchgear',
  description: 'Copper and steel prices rising, may exceed budgeted material costs',
  impact: 'High',
  probability: 'Medium',
  status: 'Open',
  priority: 'P2',
  raisedBy: 'Manoj Kumar',
  assignedTo: 'Procurement Team',
  raisedDate: '2024-03-05',
  targetDate: '2024-03-30',
  mitigationPlan: 'Lock prices with suppliers, negotiate fixed-price contracts, include price escalation clause with client',
  costImpact: 500000,
  scheduleImpact: 0,
 },
 {
  id: '7',
  number: 'ISS-004',
  title: 'Site Access Restrictions',
  type: 'Issue',
  category: 'Safety',
  projectNumber: 'PRJ-2024-005',
  projectName: 'Godrej Cold Room',
  description: 'Client facility security restricting after-hours work, limiting work hours',
  impact: 'Medium',
  probability: 'Very High',
  status: 'Open',
  priority: 'P3',
  raisedBy: 'Vikram Singh',
  assignedTo: 'Project Manager',
  raisedDate: '2024-03-09',
  targetDate: '2024-03-18',
  mitigationPlan: 'Negotiate extended work hours with client, increase day shift resources',
  costImpact: 80000,
  scheduleImpact: 6,
 },
 {
  id: '8',
  number: 'RISK-004',
  title: 'Quality Inspection Failure Risk',
  type: 'Risk',
  category: 'Quality',
  projectNumber: 'PRJ-2024-003',
  projectName: 'L&T Switchgear Panel',
  description: 'New testing standards may cause inspection failures, rework required',
  impact: 'High',
  probability: 'Low',
  status: 'Open',
  priority: 'P3',
  raisedBy: 'Test Engineer',
  assignedTo: 'QC Team',
  raisedDate: '2024-03-07',
  targetDate: '2024-03-25',
  mitigationPlan: 'Pre-inspection audits, train team on new standards, engage third-party consultant',
  costImpact: 200000,
  scheduleImpact: 5,
 },
 {
  id: '9',
  number: 'ISS-005',
  title: 'Design Change Request from Client',
  type: 'Issue',
  category: 'Technical',
  projectNumber: 'PRJ-2024-007',
  projectName: 'Prestige Modular Kitchen',
  description: 'Client requested design changes for 15 units after manufacturing started',
  impact: 'Critical',
  probability: 'Very High',
  status: 'In Progress',
  priority: 'P1',
  raisedBy: 'Neha Gupta',
  assignedTo: 'Design Team',
  raisedDate: '2024-03-13',
  targetDate: '2024-03-20',
  mitigationPlan: 'Assess impact, negotiate change order cost, adjust production schedule',
  costImpact: 450000,
  scheduleImpact: 12,
 },
 {
  id: '10',
  number: 'ISS-006',
  title: 'Refrigeration Unit Performance Issue',
  type: 'Issue',
  category: 'Technical',
  projectNumber: 'PRJ-2024-009',
  projectName: 'Reliance Cold Chain',
  description: 'Cold room not reaching target temperature, compressor capacity issue identified',
  impact: 'Critical',
  probability: 'Very High',
  status: 'Open',
  priority: 'P1',
  raisedBy: 'Deepak Joshi',
  assignedTo: 'Technical Team',
  raisedDate: '2024-03-14',
  targetDate: '2024-03-17',
  mitigationPlan: 'Replace compressor unit, engage equipment OEM, conduct thermal audit',
  costImpact: 350000,
  scheduleImpact: 8,
 },
];

export default function IssuesRisksPage() {
 const [items, setItems] = useState<IssueRisk[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  let mounted = true;
  (async () => {
   try {
    setLoading(true);
    const rows = await projectManagementService.listProjectIssues();
    if (!mounted) return;
    const mapped: IssueRisk[] = (Array.isArray(rows) ? rows : []).map((r: PmProjectIssue) => ({
     id: r.id,
     number: r.number ?? '',
     title: r.title ?? '',
     type: (r.type as IssueRisk['type']) ?? 'Issue',
     category: (r.category as IssueRisk['category']) ?? 'Technical',
     projectNumber: r.projectNumber ?? '',
     projectName: r.projectName ?? '',
     description: r.description ?? '',
     impact: (r.impact as IssueRisk['impact']) ?? 'Medium',
     probability: (r.probability as IssueRisk['probability']) ?? 'Medium',
     status: (r.status as IssueRisk['status']) ?? 'Open',
     priority: (r.priority as IssueRisk['priority']) ?? 'P3',
     raisedBy: r.raisedBy ?? '',
     assignedTo: r.assignedTo ?? '',
     raisedDate: r.raisedDate ?? '',
     targetDate: r.targetDate ?? '',
     resolvedDate: r.resolvedDate,
     mitigationPlan: r.mitigationPlan ?? '',
     costImpact: Number(r.costImpact ?? 0),
     scheduleImpact: Number(r.scheduleImpact ?? 0),
    }));
    // Fall back to sample data when the backend has no rows yet.
    setItems(mapped.length > 0 ? mapped : mockIssuesRisks);
   } catch (e) {
    if (!mounted) return;
    setError('Failed to load issues');
    setItems(mockIssuesRisks);
   } finally {
    if (mounted) setLoading(false);
   }
  })();
  return () => { mounted = false; };
 }, []);
 const [searchTerm, setSearchTerm] = useState('');
 const [typeFilter, setTypeFilter] = useState('All');
 const [statusFilter, setStatusFilter] = useState('All');
 const [impactFilter, setImpactFilter] = useState('All');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [modals, setModals] = useState({
  logIssue: false,
  editIssue: false,
  assignIssue: false,
  updateStatus: false,
  addComment: false,
  attachFiles: false,
  linkItems: false,
  escalateIssue: false,
  resolveIssue: false,
  closeIssue: false,
  impactAnalysis: false,
  rootCause: false,
  issueReport: false,
  bulkUpdate: false,
  issueBoard: false,
 });

 const [selectedIssue, setSelectedIssue] = useState<IssueRisk | null>(null);
 const [selectedIssues, setSelectedIssues] = useState<IssueRisk[]>([]);
 const [showIssueMenu, setShowIssueMenu] = useState<string | null>(null);

 const openModal = (modalName: keyof typeof modals, issue?: IssueRisk) => {
  if (issue) setSelectedIssue(issue);
  setModals({ ...modals, [modalName]: true });
 };

 const closeModal = (modalName: keyof typeof modals) => {
  setModals({ ...modals, [modalName]: false });
  setSelectedIssue(null);
 };

 const handleModalSubmit = (modalName: string, data: any) => {
  console.log(`${modalName} submitted:`, data);
  // Here you would typically make an API call to save the data
 };

 // Calculate statistics
 const stats = {
  total: items.length,
  issues: items.filter(i => i.type === 'Issue').length,
  risks: items.filter(i => i.type === 'Risk').length,
  critical: items.filter(i => i.impact === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed').length,
  open: items.filter(i => i.status === 'Open').length,
  inProgress: items.filter(i => i.status === 'In Progress').length,
  totalCostImpact: items.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').reduce((sum, i) => sum + i.costImpact, 0),
 };

 // Filter items
 const filteredItems = items.filter(item => {
  const matchesSearch =
   item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
   item.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
   item.projectName.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesType = typeFilter === 'All' || item.type === typeFilter;
  const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
  const matchesImpact = impactFilter === 'All' || item.impact === impactFilter;
  return matchesSearch && matchesType && matchesStatus && matchesImpact;
 });

 // Pagination
 const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

 const getTypeColor = (type: string) => {
  return type === 'Issue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700';
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Resolved': return 'bg-green-100 text-green-700';
   case 'Closed': return 'bg-gray-100 text-gray-700';
   case 'In Progress': return 'bg-blue-100 text-blue-700';
   case 'Open': return 'bg-yellow-100 text-yellow-700';
   case 'Deferred': return 'bg-purple-100 text-purple-700';
   default: return 'bg-gray-100 text-gray-700';
  }
 };

 const getImpactColor = (impact: string) => {
  switch (impact) {
   case 'Critical': return 'bg-red-100 text-red-700';
   case 'High': return 'bg-orange-100 text-orange-700';
   case 'Medium': return 'bg-yellow-100 text-yellow-700';
   case 'Low': return 'bg-green-100 text-green-700';
   default: return 'bg-gray-100 text-gray-700';
  }
 };

 const getPriorityColor = (priority: string) => {
  switch (priority) {
   case 'P1': return 'bg-red-100 text-red-700';
   case 'P2': return 'bg-orange-100 text-orange-700';
   case 'P3': return 'bg-yellow-100 text-yellow-700';
   case 'P4': return 'bg-green-100 text-green-700';
   default: return 'bg-gray-100 text-gray-700';
  }
 };

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
   style: 'currency',
   currency: 'INR',
   minimumFractionDigits: 0,
  }).format(amount);
 };

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
   day: '2-digit',
   month: 'short',
   year: 'numeric',
  });
 };

 const isOverdue = (targetDate: string, status: string) => {
  if (status === 'Resolved' || status === 'Closed') return false;
  return new Date(targetDate) < new Date();
 };

 return (
  <div className="p-6 space-y-3">
   {loading && (
    <div className="text-sm text-gray-500">Loading issues…</div>
   )}
   {error && (
    <div className="text-sm text-red-600">{error} — showing sample data.</div>
   )}
   {/* Header */}
   <div className="flex justify-between items-center">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Issues & Risks</h1>
     <p className="text-gray-600 mt-1">Track and manage project issues and risks</p>
    </div>
    <div className="flex gap-2">
     {selectedIssues.length > 0 && (
      <>
       <button
        onClick={() => openModal('bulkUpdate')}
        className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
       >
        <CheckCircle className="w-5 h-5" />
        Bulk Update ({selectedIssues.length})
       </button>
       <button
        onClick={() => setSelectedIssues([])}
        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
       >
        Clear
       </button>
      </>
     )}
     <button
      onClick={() => openModal('issueBoard')}
      className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
     >
      <BarChart3 className="w-5 h-5" />
      Board View
     </button>
     <button
      onClick={() => openModal('issueReport')}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
     >
      <FileText className="w-5 h-5" />
      Generate Report
     </button>
     <button
      onClick={() => openModal('logIssue')}
      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
     >
      <Plus className="w-5 h-5" />
      Log Issue
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Items</p>
       <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
       <AlertTriangle className="w-6 h-6 text-gray-600" />
      </div>
     </div>
     <div className="mt-2">
      <span className="text-sm text-red-600">{stats.issues} issues</span>
      <span className="text-sm text-gray-500 mx-2">·</span>
      <span className="text-sm text-orange-600">{stats.risks} risks</span>
     </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Critical Items</p>
       <p className="text-3xl font-bold text-red-900 mt-1">{stats.critical}</p>
      </div>
      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
       <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
     </div>
     <div className="mt-2">
      <span className="text-sm text-red-600">Requires immediate attention</span>
     </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Active Items</p>
       <p className="text-3xl font-bold text-blue-900 mt-1">{stats.open + stats.inProgress}</p>
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
       <Clock className="w-6 h-6 text-blue-600" />
      </div>
     </div>
     <div className="mt-2">
      <span className="text-sm text-gray-500">{stats.open} open · {stats.inProgress} in progress</span>
     </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Cost Impact</p>
       <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(stats.totalCostImpact)}</p>
      </div>
      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
       <TrendingUp className="w-6 h-6 text-orange-600" />
      </div>
     </div>
     <div className="mt-2">
      <span className="text-sm text-gray-500">Estimated impact</span>
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
     {/* Search */}
     <div className="lg:col-span-2">
      <div className="relative">
       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
       <input
        type="text"
        placeholder="Search issues and risks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       />
      </div>
     </div>

     {/* Type Filter */}
     <select
      value={typeFilter}
      onChange={(e) => setTypeFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     >
      <option value="All">All Types</option>
      <option value="Issue">Issues</option>
      <option value="Risk">Risks</option>
     </select>

     {/* Status Filter */}
     <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     >
      <option value="All">All Status</option>
      <option value="Open">Open</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
      <option value="Closed">Closed</option>
      <option value="Deferred">Deferred</option>
     </select>

     {/* Impact Filter */}
     <select
      value={impactFilter}
      onChange={(e) => setImpactFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
     >
      <option value="All">All Impact</option>
      <option value="Critical">Critical</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
     </select>
    </div>
   </div>

   {/* Issues & Risks List */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="divide-y divide-gray-200">
     {paginatedItems.map((item) => {
      const overdue = isOverdue(item.targetDate, item.status);

      return (
       <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
         <div className="flex items-start gap-2 flex-1">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
           item.impact === 'Critical' ? 'bg-red-100' :
           item.impact === 'High' ? 'bg-orange-100' :
           'bg-yellow-100'
          }`}>
           {item.type === 'Issue' ? (
            <AlertCircle className={`w-6 h-6 ${
             item.impact === 'Critical' ? 'text-red-600' :
             item.impact === 'High' ? 'text-orange-600' :
             'text-yellow-600'
            }`} />
           ) : (
            <Shield className={`w-6 h-6 ${
             item.impact === 'Critical' ? 'text-red-600' :
             item.impact === 'High' ? 'text-orange-600' :
             'text-yellow-600'
            }`} />
           )}
          </div>

          {/* Details */}
          <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
             {item.type}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
             {item.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(item.impact)}`}>
             {item.impact} Impact
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
             {item.priority}
            </span>
            {overdue && (
             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
              <AlertCircle className="w-3 h-3" />
              Overdue
             </span>
            )}
           </div>

           <p className="text-sm text-gray-600 mb-3">{item.description}</p>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div>
             <p className="text-xs text-gray-500">ID</p>
             <p className="text-sm font-medium text-gray-900">{item.number}</p>
            </div>
            <div>
             <p className="text-xs text-gray-500">Project</p>
             <Link href={`/project-management/view/${item.projectNumber}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              {item.projectNumber}
             </Link>
             <p className="text-xs text-gray-500">{item.projectName}</p>
            </div>
            <div>
             <p className="text-xs text-gray-500">Category</p>
             <p className="text-sm font-medium text-gray-900">{item.category}</p>
            </div>
            <div>
             <p className="text-xs text-gray-500">Probability</p>
             <p className="text-sm font-medium text-gray-900">{item.probability}</p>
            </div>
           </div>

           {/* Impact */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3 bg-gray-50 rounded-lg p-3">
            <div>
             <p className="text-xs text-gray-500">Cost Impact</p>
             <p className="text-sm font-semibold text-orange-900">{formatCurrency(item.costImpact)}</p>
            </div>
            <div>
             <p className="text-xs text-gray-500">Schedule Impact</p>
             <p className="text-sm font-semibold text-red-900">{item.scheduleImpact} days</p>
            </div>
            <div>
             <p className="text-xs text-gray-500">Raised By</p>
             <div className="flex items-center gap-1 mt-1">
              <User className="w-3 h-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">{item.raisedBy}</p>
             </div>
            </div>
            <div>
             <p className="text-xs text-gray-500">Assigned To</p>
             <div className="flex items-center gap-1 mt-1">
              <User className="w-3 h-3 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">{item.assignedTo}</p>
             </div>
            </div>
           </div>

           {/* Dates */}
           <div className="flex items-center gap-3 text-sm mb-3">
            <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-gray-400" />
             <span className="text-gray-600">Raised:</span>
             <span className="font-medium text-gray-900">{formatDate(item.raisedDate)}</span>
            </div>
            <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-gray-400" />
             <span className="text-gray-600">Target:</span>
             <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(item.targetDate)}
             </span>
            </div>
            {item.resolvedDate && (
             <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">Resolved:</span>
              <span className="font-medium text-green-900">{formatDate(item.resolvedDate)}</span>
             </div>
            )}
           </div>

           {/* Mitigation Plan */}
           <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Mitigation Plan</p>
            <p className="text-sm text-gray-900">{item.mitigationPlan}</p>
           </div>
          </div>
         </div>

         {/* Actions */}
         <div className="flex items-center gap-2 ml-4">
          <input
           type="checkbox"
           checked={selectedIssues.some(i => i.id === item.id)}
           onChange={(e) => {
            if (e.target.checked) {
             setSelectedIssues([...selectedIssues, item]);
            } else {
             setSelectedIssues(selectedIssues.filter(i => i.id !== item.id));
            }
           }}
           className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
           <button
            onClick={() => setShowIssueMenu(showIssueMenu === item.id ? null : item.id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
           >
            <MoreVertical className="w-4 h-4" />
           </button>
           {showIssueMenu === item.id && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
             <div className="py-1">
              <button
               onClick={() => {
                openModal('editIssue', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <Edit className="w-4 h-4" />
               Edit Issue
              </button>
              <button
               onClick={() => {
                openModal('assignIssue', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <User className="w-4 h-4" />
               Assign
              </button>
              <button
               onClick={() => {
                openModal('updateStatus', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <CheckCircle className="w-4 h-4" />
               Update Status
              </button>
              <button
               onClick={() => {
                openModal('addComment', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <MessageSquare className="w-4 h-4" />
               Add Comment
              </button>
              <button
               onClick={() => {
                openModal('attachFiles', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <Paperclip className="w-4 h-4" />
               Attach Files
              </button>
              <button
               onClick={() => {
                openModal('linkItems', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <LinkIcon className="w-4 h-4" />
               Link Items
              </button>
              <button
               onClick={() => {
                openModal('escalateIssue', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <ArrowUp className="w-4 h-4" />
               Escalate
              </button>
              <button
               onClick={() => {
                openModal('impactAnalysis', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <BarChart3 className="w-4 h-4" />
               Impact Analysis
              </button>
              <button
               onClick={() => {
                openModal('rootCause', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <Target className="w-4 h-4" />
               Root Cause
              </button>
              <button
               onClick={() => {
                openModal('resolveIssue', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
              >
               <CheckCircle className="w-4 h-4" />
               Resolve
              </button>
              <button
               onClick={() => {
                openModal('closeIssue', item);
                setShowIssueMenu(null);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
               <XCircle className="w-4 h-4" />
               Close
              </button>
             </div>
            </div>
           )}
          </div>
         </div>
        </div>
       </div>
      );
     })}
    </div>

    {/* Pagination */}
    <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
     <div className="text-sm text-gray-700">
      Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{' '}
      {filteredItems.length} items
     </div>
     <div className="flex gap-2">
      <button
       onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
       disabled={currentPage === 1}
       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
       Previous
      </button>
      <button
       onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
       disabled={currentPage === totalPages}
       className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
       Next
      </button>
     </div>
    </div>
   </div>

   {/* All Modals */}
   <LogIssueModal
    isOpen={modals.logIssue}
    onClose={() => closeModal('logIssue')}
    onSubmit={(data) => handleModalSubmit('logIssue', data)}
   />

   {selectedIssue && (
    <>
     <EditIssueModal
      isOpen={modals.editIssue}
      onClose={() => closeModal('editIssue')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('editIssue', data)}
     />

     <AssignIssueModal
      isOpen={modals.assignIssue}
      onClose={() => closeModal('assignIssue')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('assignIssue', data)}
     />

     <UpdateStatusModal
      isOpen={modals.updateStatus}
      onClose={() => closeModal('updateStatus')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('updateStatus', data)}
     />

     <AddCommentModal
      isOpen={modals.addComment}
      onClose={() => closeModal('addComment')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('addComment', data)}
     />

     <AttachFilesModal
      isOpen={modals.attachFiles}
      onClose={() => closeModal('attachFiles')}
      issue={selectedIssue}
      onSubmit={(files) => handleModalSubmit('attachFiles', files)}
     />

     <LinkItemsModal
      isOpen={modals.linkItems}
      onClose={() => closeModal('linkItems')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('linkItems', data)}
     />

     <EscalateIssueModal
      isOpen={modals.escalateIssue}
      onClose={() => closeModal('escalateIssue')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('escalateIssue', data)}
     />

     <ResolveIssueModal
      isOpen={modals.resolveIssue}
      onClose={() => closeModal('resolveIssue')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('resolveIssue', data)}
     />

     <CloseIssueModal
      isOpen={modals.closeIssue}
      onClose={() => closeModal('closeIssue')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('closeIssue', data)}
     />

     <ImpactAnalysisModal
      isOpen={modals.impactAnalysis}
      onClose={() => closeModal('impactAnalysis')}
      issue={selectedIssue}
     />

     <RootCauseModal
      isOpen={modals.rootCause}
      onClose={() => closeModal('rootCause')}
      issue={selectedIssue}
      onSubmit={(data) => handleModalSubmit('rootCause', data)}
     />
    </>
   )}

   <IssueReportModal
    isOpen={modals.issueReport}
    onClose={() => closeModal('issueReport')}
    onSubmit={(data) => handleModalSubmit('issueReport', data)}
   />

   <BulkUpdateModal
    isOpen={modals.bulkUpdate}
    onClose={() => closeModal('bulkUpdate')}
    selectedIssues={selectedIssues}
    onSubmit={(data) => handleModalSubmit('bulkUpdate', data)}
   />

   <IssueBoardModal
    isOpen={modals.issueBoard}
    onClose={() => closeModal('issueBoard')}
    issues={items}
   />
  </div>
 );
}
