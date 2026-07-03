'use client';

import { useState, useEffect } from 'react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService, PmChangeOrder } from '@/services/ProjectManagementService';
import { FileEdit, Plus, CheckCircle, Clock, XCircle, AlertTriangle, DollarSign, Calendar, Eye, Download, Edit, History, Upload, TrendingUp, Settings, Users, BarChart3 } from 'lucide-react';
import {
 CreateChangeOrderModal,
 EditChangeOrderModal,
 ApprovalModal,
 ImpactAnalysisModal,
 ImplementationTrackingModal,
 ChangeOrderHistoryModal,
 BulkChangeOrderModal,
 AttachmentManagementModal,
 FinancialImpactDashboardModal,
 ScheduleImpactAnalysisModal,
 ExportChangeOrdersModal,
 StakeholderNotificationModal,
} from '@/components/project-management/ChangeOrderModals';

interface ChangeOrder {
 id: string;
 changeOrderNumber: string;
 projectId: string;
 projectName: string;
 requestDate: string;
 requestedBy: string;
 requestedByRole: 'Client' | 'Project Manager' | 'Engineer' | 'Site Supervisor';
 changeType: 'Scope Change' | 'Design Change' | 'Material Change' | 'Schedule Change' | 'Other';
 priority: 'Critical' | 'High' | 'Medium' | 'Low';
 title: string;
 description: string;
 reason: string;
 impactOnCost: number;
 impactOnSchedule: number;
 originalBudget: number;
 revisedBudget: number;
 originalEndDate: string;
 revisedEndDate: string;
 status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
 approvedBy: string;
 approvalDate: string;
 implementationDate: string;
 completionDate: string;
 attachments: number;
 remarks: string;
}

export default function ChangeOrdersPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterPriority, setFilterPriority] = useState<string>('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedOrder, setSelectedOrder] = useState<ChangeOrder | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showApprovalModal, setShowApprovalModal] = useState(false);
 const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
 const [showImplementationTracking, setShowImplementationTracking] = useState(false);
 const [showHistory, setShowHistory] = useState(false);
 const [showBulkActions, setShowBulkActions] = useState(false);
 const [showAttachments, setShowAttachments] = useState(false);
 const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);
 const [showScheduleAnalysis, setShowScheduleAnalysis] = useState(false);
 const [showExport, setShowExport] = useState(false);
 const [showNotification, setShowNotification] = useState(false);

 const mockChangeOrders: ChangeOrder[] = [
  {
   id: 'CO-001',
   changeOrderNumber: 'CHG-2025-001',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   requestDate: '2025-01-15',
   requestedBy: 'Mr. Suresh Nair (Client)',
   requestedByRole: 'Client',
   changeType: 'Scope Change',
   priority: 'High',
   title: 'Additional Exhaust Hood Installation',
   description: 'Client requested installation of 2 additional exhaust hoods in the cooking section to enhance ventilation capacity',
   reason: 'Enhanced ventilation requirements based on health department recommendations',
   impactOnCost: 450000,
   impactOnSchedule: 7,
   originalBudget: 8500000,
   revisedBudget: 8950000,
   originalEndDate: '2025-03-15',
   revisedEndDate: '2025-03-22',
   status: 'Approved',
   approvedBy: 'Project Manager',
   approvalDate: '2025-01-16',
   implementationDate: '2025-01-18',
   completionDate: '',
   attachments: 4,
   remarks: 'Approved with cost adjustment. Material procurement in progress.',
  },
  {
   id: 'CO-002',
   changeOrderNumber: 'CHG-2025-002',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   requestDate: '2025-01-18',
   requestedBy: 'Amit Singh (Engineer)',
   requestedByRole: 'Engineer',
   changeType: 'Design Change',
   priority: 'Critical',
   title: 'Upgrade Insulation Thickness',
   description: 'Increase PUF panel thickness from 100mm to 150mm for better temperature retention',
   reason: 'Temperature stability tests show requirement for enhanced insulation in ambient conditions',
   impactOnCost: 380000,
   impactOnSchedule: 10,
   originalBudget: 4200000,
   revisedBudget: 4580000,
   originalEndDate: '2025-02-28',
   revisedEndDate: '2025-03-10',
   status: 'Under Review',
   approvedBy: '',
   approvalDate: '',
   implementationDate: '',
   completionDate: '',
   attachments: 6,
   remarks: 'Technical review in progress. Awaiting client approval on cost impact.',
  },
  {
   id: 'CO-003',
   changeOrderNumber: 'CHG-2025-003',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   requestDate: '2025-01-20',
   requestedBy: 'Ramesh Kumar (Project Manager)',
   requestedByRole: 'Project Manager',
   changeType: 'Material Change',
   priority: 'Medium',
   title: 'Switch to Premium Grade Stainless Steel',
   description: 'Change from SS304 to SS316 grade for all exposed surfaces in dishwashing area',
   reason: 'Client preference for higher corrosion resistance due to high water usage',
   impactOnCost: 250000,
   impactOnSchedule: 0,
   originalBudget: 12000000,
   revisedBudget: 12250000,
   originalEndDate: '2025-04-30',
   revisedEndDate: '2025-04-30',
   status: 'Approved',
   approvedBy: 'Client Representative',
   approvalDate: '2025-01-21',
   implementationDate: '2025-01-23',
   completionDate: '',
   attachments: 2,
   remarks: 'Approved. Material procurement adjusted accordingly.',
  },
  {
   id: 'CO-004',
   changeOrderNumber: 'CHG-2025-004',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   requestDate: '2025-01-22',
   requestedBy: 'Suresh Patel (Site Supervisor)',
   requestedByRole: 'Site Supervisor',
   changeType: 'Design Change',
   priority: 'Low',
   title: 'Relocate Hand Wash Basin',
   description: 'Move hand wash basin 2 meters from original position for better accessibility',
   reason: 'Ergonomic improvement and compliance with FSSAI guidelines',
   impactOnCost: 35000,
   impactOnSchedule: 2,
   originalBudget: 8500000,
   revisedBudget: 8535000,
   originalEndDate: '2025-03-15',
   revisedEndDate: '2025-03-17',
   status: 'Completed',
   approvedBy: 'Project Manager',
   approvalDate: '2025-01-22',
   implementationDate: '2025-01-23',
   completionDate: '2025-01-24',
   attachments: 1,
   remarks: 'Minor change completed successfully.',
  },
  {
   id: 'CO-005',
   changeOrderNumber: 'CHG-2025-005',
   projectId: 'PRJ-2025-004',
   projectName: 'ITC Grand - Bakery Equipment Setup',
   requestDate: '2025-01-10',
   requestedBy: 'Ms. Priya Menon (Client)',
   requestedByRole: 'Client',
   changeType: 'Scope Change',
   priority: 'High',
   title: 'Add Chocolate Tempering Machine',
   description: 'Include one additional chocolate tempering machine in the bakery setup',
   reason: 'Client expanding product line to include premium chocolates',
   impactOnCost: 280000,
   impactOnSchedule: 5,
   originalBudget: 3500000,
   revisedBudget: 3780000,
   originalEndDate: '2025-01-31',
   revisedEndDate: '2025-02-05',
   status: 'Completed',
   approvedBy: 'Management',
   approvalDate: '2025-01-11',
   implementationDate: '2025-01-13',
   completionDate: '2025-01-18',
   attachments: 3,
   remarks: 'Equipment procured and installed successfully.',
  },
  {
   id: 'CO-006',
   changeOrderNumber: 'CHG-2025-006',
   projectId: 'PRJ-2025-005',
   projectName: 'Godrej Properties - Modular Kitchen',
   requestDate: '2025-01-12',
   requestedBy: 'Mr. Anil Desai (Client)',
   requestedByRole: 'Client',
   changeType: 'Material Change',
   priority: 'Medium',
   title: 'Upgrade to Premium Hardware',
   description: 'Change cabinet hardware from standard to premium Blum soft-close fittings',
   reason: 'Client preference for higher quality fittings',
   impactOnCost: 28000,
   impactOnSchedule: 0,
   originalBudget: 450000,
   revisedBudget: 478000,
   originalEndDate: '2025-01-25',
   revisedEndDate: '2025-01-25',
   status: 'Completed',
   approvedBy: 'Project Manager',
   approvalDate: '2025-01-13',
   implementationDate: '2025-01-14',
   completionDate: '2025-01-20',
   attachments: 2,
   remarks: 'Premium hardware installed. Client satisfied.',
  },
  {
   id: 'CO-007',
   changeOrderNumber: 'CHG-2025-007',
   projectId: 'PRJ-2025-006',
   projectName: 'Siemens - Switchgear Manufacturing Unit',
   requestDate: '2025-01-14',
   requestedBy: 'Vijay Sharma (Engineer)',
   requestedByRole: 'Engineer',
   changeType: 'Design Change',
   priority: 'Critical',
   title: 'Upgrade Clean Room Classification',
   description: 'Enhance clean room from Class 10000 to Class 1000 with additional filtration',
   reason: 'Manufacturing process requires stricter contamination control',
   impactOnCost: 1200000,
   impactOnSchedule: 21,
   originalBudget: 15000000,
   revisedBudget: 16200000,
   originalEndDate: '2025-05-31',
   revisedEndDate: '2025-06-21',
   status: 'Approved',
   approvedBy: 'Client Management',
   approvalDate: '2025-01-16',
   implementationDate: '2025-01-20',
   completionDate: '',
   attachments: 8,
   remarks: 'Major change approved. Additional HEPA filtration system being procured.',
  },
  {
   id: 'CO-008',
   changeOrderNumber: 'CHG-2025-008',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   requestDate: '2025-01-16',
   requestedBy: 'Dinesh Kumar (Site Supervisor)',
   requestedByRole: 'Site Supervisor',
   changeType: 'Schedule Change',
   priority: 'High',
   title: 'Expedite Completion Timeline',
   description: 'Accelerate project completion by 15 days to meet campus inauguration date',
   reason: 'Client requested early completion for campus opening ceremony',
   impactOnCost: 420000,
   impactOnSchedule: -15,
   originalBudget: 12000000,
   revisedBudget: 12420000,
   originalEndDate: '2025-04-30',
   revisedEndDate: '2025-04-15',
   status: 'In Progress',
   approvedBy: 'Senior Management',
   approvalDate: '2025-01-17',
   implementationDate: '2025-01-18',
   completionDate: '',
   attachments: 3,
   remarks: 'Approved with additional labor costs. Working on accelerated schedule.',
  },
  {
   id: 'CO-009',
   changeOrderNumber: 'CHG-2025-009',
   projectId: 'PRJ-2025-008',
   projectName: 'Marriott Hotel - Kitchen Renovation',
   requestDate: '2025-01-19',
   requestedBy: 'Ms. Sarah Williams (Client)',
   requestedByRole: 'Client',
   changeType: 'Scope Change',
   priority: 'Medium',
   title: 'Include Pastry Section Renovation',
   description: 'Expand scope to include complete renovation of pastry preparation area',
   reason: 'Client decided to upgrade pastry section along with main kitchen',
   impactOnCost: 1800000,
   impactOnSchedule: 25,
   originalBudget: 9500000,
   revisedBudget: 11300000,
   originalEndDate: '2025-04-30',
   revisedEndDate: '2025-05-25',
   status: 'Pending',
   approvedBy: '',
   approvalDate: '',
   implementationDate: '',
   completionDate: '',
   attachments: 5,
   remarks: 'Under review. Detailed proposal and revised timeline being prepared.',
  },
  {
   id: 'CO-010',
   changeOrderNumber: 'CHG-2025-010',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   requestDate: '2025-01-21',
   requestedBy: 'Prakash Rao (Project Manager)',
   requestedByRole: 'Project Manager',
   changeType: 'Design Change',
   priority: 'Low',
   title: 'Modify Door Opening Direction',
   description: 'Change cold room door swing direction from left to right for operational convenience',
   reason: 'Better alignment with warehouse workflow and forklift movement',
   impactOnCost: 15000,
   impactOnSchedule: 1,
   originalBudget: 4200000,
   revisedBudget: 4215000,
   originalEndDate: '2025-02-28',
   revisedEndDate: '2025-03-01',
   status: 'Rejected',
   approvedBy: 'Project Manager',
   approvalDate: '2025-01-22',
   implementationDate: '',
   completionDate: '',
   attachments: 1,
   remarks: 'Rejected as door installation already completed. Would require rework.',
  },
 ];

 const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  let mounted = true;
  (async () => {
   try {
    setLoading(true);
    const rows = await projectManagementService.listChangeOrders();
    if (!mounted) return;
    const mapped: ChangeOrder[] = (Array.isArray(rows) ? rows : []).map((r: PmChangeOrder) => ({
     id: r.id,
     changeOrderNumber: r.changeOrderNumber ?? '',
     projectId: r.projectId ?? '',
     projectName: r.projectName ?? '',
     requestDate: r.requestDate ?? '',
     requestedBy: r.requestedBy ?? '',
     requestedByRole: (r.requestedByRole as ChangeOrder['requestedByRole']) ?? 'Project Manager',
     changeType: (r.changeType as ChangeOrder['changeType']) ?? 'Other',
     priority: (r.priority as ChangeOrder['priority']) ?? 'Medium',
     title: r.title ?? '',
     description: r.description ?? '',
     reason: r.reason ?? '',
     impactOnCost: Number(r.impactOnCost ?? 0),
     impactOnSchedule: Number(r.impactOnSchedule ?? 0),
     originalBudget: Number(r.originalBudget ?? 0),
     revisedBudget: Number(r.revisedBudget ?? 0),
     originalEndDate: r.originalEndDate ?? '',
     revisedEndDate: r.revisedEndDate ?? '',
     status: (r.status as ChangeOrder['status']) ?? 'Pending',
     approvedBy: r.approvedBy ?? '',
     approvalDate: r.approvalDate ?? '',
     implementationDate: r.implementationDate ?? '',
     completionDate: r.completionDate ?? '',
     attachments: Number(r.attachments ?? 0),
     remarks: r.remarks ?? '',
    }));
    // Fall back to sample data when the backend has no rows yet.
    setChangeOrders(mapped.length > 0 ? mapped : mockChangeOrders);
   } catch (e) {
    if (!mounted) return;
    setError('Failed to load change orders');
    setChangeOrders(mockChangeOrders);
   } finally {
    if (mounted) setLoading(false);
   }
  })();
  return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const stats = {
  totalOrders: changeOrders.length,
  pending: changeOrders.filter(o => o.status === 'Pending').length,
  underReview: changeOrders.filter(o => o.status === 'Under Review').length,
  approved: changeOrders.filter(o => o.status === 'Approved').length,
  rejected: changeOrders.filter(o => o.status === 'Rejected').length,
  totalCostImpact: changeOrders.reduce((sum, o) => sum + o.impactOnCost, 0),
  avgScheduleImpact: (changeOrders.length > 0
   ? changeOrders.reduce((sum, o) => sum + Math.abs(o.impactOnSchedule), 0) / changeOrders.length
   : 0).toFixed(1),
 };

 const filteredOrders = changeOrders.filter((order) => {
  const matchesSearch =
   order.changeOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   order.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   order.title.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
  const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
  return matchesSearch && matchesStatus && matchesPriority;
 });

 const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Pending':
    return 'bg-yellow-100 text-yellow-800';
   case 'Under Review':
    return 'bg-blue-100 text-blue-800';
   case 'Approved':
    return 'bg-green-100 text-green-800';
   case 'Rejected':
    return 'bg-red-100 text-red-800';
   case 'In Progress':
    return 'bg-purple-100 text-purple-800';
   case 'Completed':
    return 'bg-gray-100 text-gray-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getPriorityColor = (priority: string) => {
  switch (priority) {
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
   case 'Approved':
   case 'Completed':
    return <CheckCircle className="h-5 w-5 text-green-600" />;
   case 'Rejected':
    return <XCircle className="h-5 w-5 text-red-600" />;
   case 'Under Review':
   case 'Pending':
    return <Clock className="h-5 w-5 text-blue-600" />;
   case 'In Progress':
    return <AlertTriangle className="h-5 w-5 text-purple-600" />;
   default:
    return null;
  }
 };

 // Modal handlers
 const handleCreateOrder = (data: any) => {
  console.log('Creating change order:', data);
  // Implementation would go here
 };

 const handleUpdateOrder = (data: any) => {
  console.log('Updating change order:', data);
  // Implementation would go here
 };

 const handleApproval = (data: any) => {
  console.log('Approval decision:', data);
  // Implementation would go here
 };

 const handleImplementationUpdate = (data: any) => {
  console.log('Implementation update:', data);
  // Implementation would go here
 };

 const handleBulkAction = (action: string, orders: string[]) => {
  console.log('Bulk action:', action, orders);
  // Implementation would go here
 };

 const handleUploadAttachments = (files: File[]) => {
  console.log('Uploading attachments:', files);
  // Implementation would go here
 };

 const handleExport = (format: string, options: any) => {
  exportToCsv('change-orders', filteredOrders as unknown as Record<string, unknown>[]);
 };

 const handleSendNotification = (data: any) => {
  console.log('Sending notification:', data);
  // Implementation would go here
 };

 // Helper functions to open modals with specific order
 const openEditModal = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowEditModal(true);
 };

 const openApprovalModal = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowApprovalModal(true);
 };

 const openImpactAnalysis = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowImpactAnalysis(true);
 };

 const openImplementationTracking = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowImplementationTracking(true);
 };

 const openHistory = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowHistory(true);
 };

 const openAttachments = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowAttachments(true);
 };

 const openNotification = (order: ChangeOrder) => {
  setSelectedOrder(order);
  setShowNotification(true);
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
    {loading && (
     <div className="text-sm text-gray-500">Loading change orders…</div>
    )}
    {error && (
     <div className="text-sm text-red-600">{error} — showing sample data.</div>
    )}
    {/* Header Actions */}
    <div className="flex justify-between mb-2">
     <div className="flex gap-2">
      <button
       onClick={() => setShowFinancialDashboard(true)}
       className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
       <BarChart3 className="h-5 w-5" />
       <span>Financial Dashboard</span>
      </button>
      <button
       onClick={() => setShowScheduleAnalysis(true)}
       className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
       <Calendar className="h-5 w-5" />
       <span>Schedule Analysis</span>
      </button>
      <button
       onClick={() => setShowBulkActions(true)}
       className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
       <FileEdit className="h-5 w-5" />
       <span>Bulk Actions</span>
      </button>
      <button
       onClick={() => setShowExport(true)}
       className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
       <Download className="h-5 w-5" />
       <span>Export</span>
      </button>
     </div>
     <button
      onClick={() => setShowCreateModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
     >
      <Plus className="h-5 w-5" />
      <span>New Change Order</span>
     </button>
    </div>

    {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Orders</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
      </div>
      <FileEdit className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Pending</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
      </div>
      <Clock className="h-8 w-8 text-yellow-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Under Review</p>
       <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Approved</p>
       <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Rejected</p>
       <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
      </div>
      <XCircle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Cost Impact</p>
       <p className="text-2xl font-bold text-purple-600">₹{(stats.totalCostImpact / 100000).toFixed(1)}L</p>
      </div>
      <DollarSign className="h-8 w-8 text-purple-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Avg Delay</p>
       <p className="text-2xl font-bold text-orange-600">{stats.avgScheduleImpact}d</p>
      </div>
      <Calendar className="h-8 w-8 text-orange-600" />
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
     <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
       type="text"
       placeholder="Search by number, project, title..."
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
       <option value="Pending">Pending</option>
       <option value="Under Review">Under Review</option>
       <option value="Approved">Approved</option>
       <option value="Rejected">Rejected</option>
       <option value="In Progress">In Progress</option>
       <option value="Completed">Completed</option>
      </select>
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
      <select
       value={filterPriority}
       onChange={(e) => setFilterPriority(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Priority</option>
       <option value="Critical">Critical</option>
       <option value="High">High</option>
       <option value="Medium">Medium</option>
       <option value="Low">Low</option>
      </select>
     </div>
    </div>
   </div>

   {/* Change Orders Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Change Order
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project / Title
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Type / Priority
        </th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
         Cost Impact
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Schedule Impact
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
       {paginatedOrders.map((order) => (
        <tr key={order.id} className="hover:bg-gray-50">
         <td className="px-4 py-4">
          <div>
           <div className="text-sm font-medium text-gray-900">{order.changeOrderNumber}</div>
           <div className="text-xs text-gray-500">{order.requestDate}</div>
           <div className="text-xs text-gray-500">{order.requestedBy}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">{order.projectId}</div>
          <div className="text-sm text-gray-600">{order.projectName}</div>
          <div className="text-xs text-gray-500">{order.title}</div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900 mb-1">{order.changeType}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
           {order.priority}
          </span>
         </td>
         <td className="px-4 py-4 text-right">
          <div className="text-sm font-medium text-gray-900">
           ₹{(order.impactOnCost / 100000).toFixed(2)}L
          </div>
         </td>
         <td className="px-4 py-4 text-center">
          <div className={`text-sm font-semibold ${
           order.impactOnSchedule > 0 ? 'text-red-600' :
           order.impactOnSchedule < 0 ? 'text-green-600' :
           'text-gray-600'
          }`}>
           {order.impactOnSchedule > 0 ? '+' : ''}{order.impactOnSchedule} days
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="flex items-center space-x-2">
           {getStatusIcon(order.status)}
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
           </span>
          </div>
         </td>
         <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
           <button
            onClick={() => setSelectedOrder(order)}
            className="text-blue-600 hover:text-blue-800"
            title="View Details"
           >
            <Eye className="h-5 w-5" />
           </button>
           <button
            onClick={() => openEditModal(order)}
            className="text-green-600 hover:text-green-800"
            title="Edit"
           >
            <Edit className="h-5 w-5" />
           </button>
           <button
            onClick={() => openApprovalModal(order)}
            className="text-purple-600 hover:text-purple-800"
            title="Approve/Reject"
           >
            <CheckCircle className="h-5 w-5" />
           </button>
           <button
            onClick={() => openImpactAnalysis(order)}
            className="text-orange-600 hover:text-orange-800"
            title="Impact Analysis"
           >
            <TrendingUp className="h-5 w-5" />
           </button>
           <button
            onClick={() => openImplementationTracking(order)}
            className="text-indigo-600 hover:text-indigo-800"
            title="Implementation"
           >
            <Settings className="h-5 w-5" />
           </button>
           <button
            onClick={() => openHistory(order)}
            className="text-teal-600 hover:text-teal-800"
            title="History"
           >
            <History className="h-5 w-5" />
           </button>
           <button
            onClick={() => openAttachments(order)}
            className="text-pink-600 hover:text-pink-800"
            title="Attachments"
           >
            <Upload className="h-5 w-5" />
           </button>
           <button
            onClick={() => openNotification(order)}
            className="text-cyan-600 hover:text-cyan-800"
            title="Notify Stakeholders"
           >
            <Users className="h-5 w-5" />
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
       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredOrders.length)}</span> of{' '}
       <span className="font-medium">{filteredOrders.length}</span> change orders
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

   {/* View Details Modal */}
   {selectedOrder && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
       <div>
        <h2 className="text-xl font-bold text-gray-900">{selectedOrder.changeOrderNumber}</h2>
        <p className="text-sm text-gray-600">{selectedOrder.projectName}</p>
       </div>
       <button
        onClick={() => setSelectedOrder(null)}
        className="text-gray-400 hover:text-gray-600"
       >
        ✕
       </button>
      </div>

      <div className="p-6 space-y-3">
       {/* Status & Priority */}
       <div className="flex items-center space-x-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
         {selectedOrder.status}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedOrder.priority)}`}>
         {selectedOrder.priority} Priority
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
         {selectedOrder.changeType}
        </span>
       </div>

       {/* Title & Description */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedOrder.title}</h3>
        <p className="text-gray-700">{selectedOrder.description}</p>
       </div>

       {/* Reason */}
       <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">Reason for Change:</p>
        <p className="text-sm text-gray-700">{selectedOrder.reason}</p>
       </div>

       {/* Impact Analysis */}
       <div className="grid grid-cols-2 gap-3">
        <div>
         <h4 className="text-sm font-semibold text-gray-900 mb-3">Cost Impact</h4>
         <div className="space-y-2">
          <div className="flex justify-between text-sm">
           <span className="text-gray-600">Original Budget:</span>
           <span className="font-medium">₹{(selectedOrder.originalBudget / 100000).toFixed(2)}L</span>
          </div>
          <div className="flex justify-between text-sm">
           <span className="text-gray-600">Revised Budget:</span>
           <span className="font-medium">₹{(selectedOrder.revisedBudget / 100000).toFixed(2)}L</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
           <span className="text-gray-900 font-semibold">Impact:</span>
           <span className="font-bold text-red-600">+₹{(selectedOrder.impactOnCost / 100000).toFixed(2)}L</span>
          </div>
         </div>
        </div>
        <div>
         <h4 className="text-sm font-semibold text-gray-900 mb-3">Schedule Impact</h4>
         <div className="space-y-2">
          <div className="flex justify-between text-sm">
           <span className="text-gray-600">Original End Date:</span>
           <span className="font-medium">{selectedOrder.originalEndDate}</span>
          </div>
          <div className="flex justify-between text-sm">
           <span className="text-gray-600">Revised End Date:</span>
           <span className="font-medium">{selectedOrder.revisedEndDate}</span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
           <span className="text-gray-900 font-semibold">Impact:</span>
           <span className={`font-bold ${
            selectedOrder.impactOnSchedule > 0 ? 'text-red-600' :
            selectedOrder.impactOnSchedule < 0 ? 'text-green-600' :
            'text-gray-600'
           }`}>
            {selectedOrder.impactOnSchedule > 0 ? '+' : ''}{selectedOrder.impactOnSchedule} days
           </span>
          </div>
         </div>
        </div>
       </div>

       {/* Timeline */}
       {selectedOrder.approvalDate && (
        <div className="bg-gray-50 p-3 rounded-lg">
         <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h4>
         <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
           <CheckCircle className="h-4 w-4 text-green-600" />
           <span className="text-gray-600">Requested:</span>
           <span className="font-medium">{selectedOrder.requestDate}</span>
          </div>
          {selectedOrder.approvalDate && (
           <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">Approved by {selectedOrder.approvedBy}:</span>
            <span className="font-medium">{selectedOrder.approvalDate}</span>
           </div>
          )}
          {selectedOrder.implementationDate && (
           <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-gray-600">Implementation Started:</span>
            <span className="font-medium">{selectedOrder.implementationDate}</span>
           </div>
          )}
          {selectedOrder.completionDate && (
           <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium">{selectedOrder.completionDate}</span>
           </div>
          )}
         </div>
        </div>
       )}

       {/* Remarks */}
       <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-sm font-semibold text-gray-900 mb-1">Remarks:</p>
        <p className="text-sm text-gray-700">{selectedOrder.remarks}</p>
       </div>

       {/* Actions */}
       <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
         <Download className="h-4 w-4" />
         <span>Download ({selectedOrder.attachments})</span>
        </button>
        <button
         onClick={() => setSelectedOrder(null)}
         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
         Close
        </button>
       </div>
      </div>
     </div>
    </div>
   )}

   {/* All Modals */}
   <CreateChangeOrderModal
    isOpen={showCreateModal}
    onClose={() => setShowCreateModal(false)}
    onCreate={handleCreateOrder}
   />

   <EditChangeOrderModal
    isOpen={showEditModal}
    onClose={() => setShowEditModal(false)}
    order={selectedOrder}
    onUpdate={handleUpdateOrder}
   />

   <ApprovalModal
    isOpen={showApprovalModal}
    onClose={() => setShowApprovalModal(false)}
    order={selectedOrder}
    onApprove={handleApproval}
   />

   <ImpactAnalysisModal
    isOpen={showImpactAnalysis}
    onClose={() => setShowImpactAnalysis(false)}
    order={selectedOrder}
   />

   <ImplementationTrackingModal
    isOpen={showImplementationTracking}
    onClose={() => setShowImplementationTracking(false)}
    order={selectedOrder}
    onUpdateStatus={handleImplementationUpdate}
   />

   <ChangeOrderHistoryModal
    isOpen={showHistory}
    onClose={() => setShowHistory(false)}
    order={selectedOrder}
   />

   <BulkChangeOrderModal
    isOpen={showBulkActions}
    onClose={() => setShowBulkActions(false)}
    onBulkAction={handleBulkAction}
   />

   <AttachmentManagementModal
    isOpen={showAttachments}
    onClose={() => setShowAttachments(false)}
    order={selectedOrder}
    onUpload={handleUploadAttachments}
   />

   <FinancialImpactDashboardModal
    isOpen={showFinancialDashboard}
    onClose={() => setShowFinancialDashboard(false)}
    orders={mockChangeOrders}
   />

   <ScheduleImpactAnalysisModal
    isOpen={showScheduleAnalysis}
    onClose={() => setShowScheduleAnalysis(false)}
    orders={mockChangeOrders}
   />

   <ExportChangeOrdersModal
    isOpen={showExport}
    onClose={() => setShowExport(false)}
    onExport={handleExport}
   />

   <StakeholderNotificationModal
    isOpen={showNotification}
    onClose={() => setShowNotification(false)}
    order={selectedOrder}
    onSendNotification={handleSendNotification}
   />
   </div>
  </div>
 );
}
