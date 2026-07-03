'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { FileCheck, CheckCircle, Clock, AlertTriangle, XCircle, Plus, Download, Eye, FileText, Edit, ListChecks, FileStack, Wrench, GraduationCap, Shield, PenTool, RefreshCw, Upload, FileOutput } from 'lucide-react';
import { ScheduleAcceptanceModal, EditAcceptanceModal, UpdateCriteriaModal, UpdateDocumentationModal, AddPunchListItemsModal, UpdateTrainingStatusModal, UpdateWarrantyModal, SignAcceptanceModal, UpdateStatusModal, UploadAttachmentsModal, GenerateReportModal, ViewFullDetailsModal } from '@/components/project-management/CustomerAcceptanceModals';

interface AcceptanceCriteria {
 id: string;
 criterion: string;
 status: 'Met' | 'Not Met' | 'Partially Met' | 'Waived';
 remarks: string;
}

interface Documentation {
 id: string;
 documentName: string;
 status: 'Submitted' | 'Pending' | 'Approved' | 'Rejected';
 submittedDate: string;
}

interface CustomerAcceptance {
 id: string;
 acceptanceNumber: string;
 projectId: string;
 projectName: string;
 projectType: string;
 customer: string;
 customerContact: string;
 customerEmail: string;
 acceptanceDate: string;
 acceptanceType: 'Provisional' | 'Final' | 'Partial' | 'Conditional';
 phase: string;
 deliverables: string[];
 acceptanceCriteria: AcceptanceCriteria[];
 totalCriteria: number;
 criteriaMet: number;
 criteriaPending: number;
 documentation: Documentation[];
 totalDocuments: number;
 docsSubmitted: number;
 docsPending: number;
 defectsList: string[];
 punchListItems: number;
 completedPunchItems: number;
 trainingCompleted: boolean;
 warrantyPeriod: string;
 warrantyStartDate: string;
 amcOffered: boolean;
 amcDuration: string;
 signedBy: string;
 signedByDesignation: string;
 signedDate: string;
 witnessedBy: string;
 overallStatus: 'Accepted' | 'Rejected' | 'Pending' | 'Conditional';
 remarks: string;
 attachments: number;
}

export default function CustomerAcceptancePage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterType, setFilterType] = useState<string>('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedAcceptance, setSelectedAcceptance] = useState<CustomerAcceptance | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showUpdateCriteriaModal, setShowUpdateCriteriaModal] = useState(false);
 const [showUpdateDocumentationModal, setShowUpdateDocumentationModal] = useState(false);
 const [showAddPunchListModal, setShowAddPunchListModal] = useState(false);
 const [showUpdateTrainingModal, setShowUpdateTrainingModal] = useState(false);
 const [showUpdateWarrantyModal, setShowUpdateWarrantyModal] = useState(false);
 const [showSignModal, setShowSignModal] = useState(false);
 const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
 const [showUploadAttachmentsModal, setShowUploadAttachmentsModal] = useState(false);
 const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
 const [showViewFullDetailsModal, setShowViewFullDetailsModal] = useState(false);

 const [mockAcceptances, setMockAcceptances] = useState<CustomerAcceptance[]>([]);
 useEffect(() => {
   projectManagementService.listCustomerAcceptances().then((rows) => {
     if (Array.isArray(rows)) setMockAcceptances(rows as unknown as CustomerAcceptance[]);
   });
 }, []);

 const stats = {
  totalAcceptances: mockAcceptances.length,
  accepted: mockAcceptances.filter(a => a.overallStatus === 'Accepted').length,
  conditional: mockAcceptances.filter(a => a.overallStatus === 'Conditional').length,
  pending: mockAcceptances.filter(a => a.overallStatus === 'Pending').length,
  rejected: mockAcceptances.filter(a => a.overallStatus === 'Rejected').length,
  totalPunchItems: mockAcceptances.reduce((sum, a) => sum + a.punchListItems, 0),
  completedPunchItems: mockAcceptances.reduce((sum, a) => sum + a.completedPunchItems, 0),
 };

 const filteredAcceptances = mockAcceptances.filter((acceptance) => {
  const matchesSearch =
   acceptance.acceptanceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   acceptance.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   acceptance.customer.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || acceptance.overallStatus === filterStatus;
  const matchesType = filterType === 'all' || acceptance.acceptanceType === filterType;
  return matchesSearch && matchesStatus && matchesType;
 });

 const totalPages = Math.ceil(filteredAcceptances.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedAcceptances = filteredAcceptances.slice(startIndex, startIndex + itemsPerPage);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Accepted':
    return 'bg-green-100 text-green-800';
   case 'Rejected':
    return 'bg-red-100 text-red-800';
   case 'Conditional':
    return 'bg-yellow-100 text-yellow-800';
   case 'Pending':
    return 'bg-blue-100 text-blue-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getCriteriaStatusColor = (status: string) => {
  switch (status) {
   case 'Met':
    return 'text-green-600';
   case 'Not Met':
    return 'text-red-600';
   case 'Partially Met':
    return 'text-yellow-600';
   case 'Waived':
    return 'text-gray-500';
   default:
    return 'text-gray-600';
  }
 };

 const getCriteriaStatusIcon = (status: string) => {
  switch (status) {
   case 'Met':
    return <CheckCircle className="h-5 w-5 text-green-600" />;
   case 'Not Met':
    return <XCircle className="h-5 w-5 text-red-600" />;
   case 'Partially Met':
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
   case 'Waived':
    return <span className="text-gray-400 text-xs">WAIVED</span>;
   default:
    return null;
  }
 };

 const handleSchedule = (data: any) => { console.log('Schedule:', data); setShowScheduleModal(false); };
 const handleEdit = (data: any) => { console.log('Edit:', data); setShowEditModal(false); setSelectedAcceptance(null); };
 const handleUpdateCriteria = (data: any) => { console.log('Update Criteria:', data); setShowUpdateCriteriaModal(false); setSelectedAcceptance(null); };
 const handleUpdateDocumentation = (data: any) => { console.log('Update Documentation:', data); setShowUpdateDocumentationModal(false); setSelectedAcceptance(null); };
 const handleAddPunchList = (data: any) => { console.log('Add Punch List:', data); setShowAddPunchListModal(false); setSelectedAcceptance(null); };
 const handleUpdateTraining = (data: any) => { console.log('Update Training:', data); setShowUpdateTrainingModal(false); setSelectedAcceptance(null); };
 const handleUpdateWarranty = (data: any) => { console.log('Update Warranty:', data); setShowUpdateWarrantyModal(false); setSelectedAcceptance(null); };
 const handleSign = (data: any) => { console.log('Sign:', data); setShowSignModal(false); setSelectedAcceptance(null); };
 const handleUpdateStatus = (data: any) => { console.log('Update Status:', data); setShowUpdateStatusModal(false); setSelectedAcceptance(null); };
 const handleUploadAttachments = (data: any) => { console.log('Upload Attachments:', data); setShowUploadAttachmentsModal(false); setSelectedAcceptance(null); };
 const handleGenerateReport = (data: any) => { console.log('Generate Report:', data); setShowGenerateReportModal(false); };
 const openEditModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowEditModal(true); };
 const openUpdateCriteriaModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowUpdateCriteriaModal(true); };
 const openUpdateDocumentationModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowUpdateDocumentationModal(true); };
 const openAddPunchListModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowAddPunchListModal(true); };
 const openUpdateTrainingModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowUpdateTrainingModal(true); };
 const openUpdateWarrantyModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowUpdateWarrantyModal(true); };
 const openSignModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowSignModal(true); };
 const openUpdateStatusModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowUpdateStatusModal(true); };
 const openUploadAttachmentsModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowUploadAttachmentsModal(true); };
 const openViewFullDetailsModal = (a: CustomerAcceptance) => { setSelectedAcceptance(a); setShowViewFullDetailsModal(true); };

 return (
  <div className="h-screen flex flex-col overflow-hidden">
   <div className="flex-1 overflow-y-auto overflow-x-hidden">
    <div className="px-3 py-2 space-y-3">
     {/* Action Bar */}
     <div className="flex justify-end items-center space-x-3">
      <button onClick={() => setShowGenerateReportModal(true)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50">
       <FileOutput className="h-5 w-5" />
       <span>Generate Report</span>
      </button>
      <button onClick={() => setShowScheduleModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
       <Plus className="h-5 w-5" />
       <span>New Acceptance</span>
      </button>
     </div>

     {/* Statistics Cards */}
     <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalAcceptances}</p>
      </div>
      <FileCheck className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Accepted</p>
       <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Conditional</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.conditional}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-yellow-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Pending</p>
       <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
      </div>
      <Clock className="h-8 w-8 text-blue-600" />
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
       <p className="text-sm text-gray-600">Punch Items</p>
       <p className="text-2xl font-bold text-orange-600">{stats.totalPunchItems}</p>
      </div>
      <FileText className="h-8 w-8 text-orange-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Completed</p>
       <p className="text-2xl font-bold text-green-600">{stats.completedPunchItems}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
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
       placeholder="Search by acceptance number, project, customer..."
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
       <option value="Accepted">Accepted</option>
       <option value="Conditional">Conditional</option>
       <option value="Pending">Pending</option>
       <option value="Rejected">Rejected</option>
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
       <option value="Provisional">Provisional</option>
       <option value="Final">Final</option>
       <option value="Partial">Partial</option>
       <option value="Conditional">Conditional</option>
      </select>
     </div>
    </div>
   </div>

   {/* Acceptances Grid */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {paginatedAcceptances.map((acceptance) => (
     <div key={acceptance.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
       <div>
        <div className="flex items-center space-x-2">
         <h3 className="text-lg font-bold text-gray-900">{acceptance.acceptanceNumber}</h3>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(acceptance.overallStatus)}`}>
          {acceptance.overallStatus}
         </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{acceptance.projectId} - {acceptance.acceptanceType}</p>
       </div>
       <button
        onClick={() => setSelectedAcceptance(acceptance)}
        className="text-blue-600 hover:text-blue-800"
       >
        <Eye className="h-5 w-5" />
       </button>
      </div>

      {/* Project & Customer Info */}
      <div className="mb-2">
       <p className="font-medium text-gray-900">{acceptance.projectName}</p>
       <p className="text-sm text-gray-600">{acceptance.customer}</p>
       <p className="text-xs text-gray-500">{acceptance.customerContact}</p>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 gap-2 mb-2 bg-gray-50 p-3 rounded-lg">
       <div>
        <p className="text-xs text-gray-500">Acceptance Criteria</p>
        <div className="flex items-center space-x-2 mt-1">
         <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
           className="bg-green-600 h-2 rounded-full"
           style={{ width: `${(acceptance.criteriaMet / acceptance.totalCriteria) * 100}%` }}
          ></div>
         </div>
         <span className="text-sm font-semibold text-gray-900">
          {acceptance.criteriaMet}/{acceptance.totalCriteria}
         </span>
        </div>
       </div>
       <div>
        <p className="text-xs text-gray-500">Documentation</p>
        <div className="flex items-center space-x-2 mt-1">
         <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
           className="bg-blue-600 h-2 rounded-full"
           style={{ width: `${(acceptance.docsSubmitted / acceptance.totalDocuments) * 100}%` }}
          ></div>
         </div>
         <span className="text-sm font-semibold text-gray-900">
          {acceptance.docsSubmitted}/{acceptance.totalDocuments}
         </span>
        </div>
       </div>
       <div>
        <p className="text-xs text-gray-500">Punch List</p>
        <div className="flex items-center space-x-2 mt-1">
         <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
           className="bg-orange-600 h-2 rounded-full"
           style={{ width: acceptance.punchListItems > 0 ? `${(acceptance.completedPunchItems / acceptance.punchListItems) * 100}%` : '0%' }}
          ></div>
         </div>
         <span className="text-sm font-semibold text-gray-900">
          {acceptance.completedPunchItems}/{acceptance.punchListItems}
         </span>
        </div>
       </div>
       <div>
        <p className="text-xs text-gray-500">Training</p>
        <div className="flex items-center space-x-2 mt-1">
         {acceptance.trainingCompleted ? (
          <span className="flex items-center text-sm font-semibold text-green-600">
           <CheckCircle className="h-4 w-4 mr-1" />
           Completed
          </span>
         ) : (
          <span className="flex items-center text-sm font-semibold text-gray-500">
           <Clock className="h-4 w-4 mr-1" />
           Pending
          </span>
         )}
        </div>
       </div>
      </div>

      {/* Defects List */}
      {acceptance.defectsList.length > 0 && (
       <div className="mb-2 bg-red-50 border border-red-200 p-3 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
         <AlertTriangle className="h-4 w-4 text-red-600" />
         <span className="text-sm font-medium text-red-800">{acceptance.defectsList.length} Defects</span>
        </div>
        <ul className="space-y-1">
         {acceptance.defectsList.slice(0, 2).map((defect, index) => (
          <li key={index} className="text-xs text-red-700">• {defect}</li>
         ))}
         {acceptance.defectsList.length > 2 && (
          <li className="text-xs text-red-600 font-medium">+ {acceptance.defectsList.length - 2} more...</li>
         )}
        </ul>
       </div>
      )}

      {/* Sign-off Status */}
      {acceptance.signedDate ? (
       <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-2">
        <div className="flex items-center space-x-2 mb-1">
         <CheckCircle className="h-4 w-4 text-green-600" />
         <span className="text-sm font-semibold text-green-800">Signed Off</span>
        </div>
        <p className="text-xs text-green-700">
         By {acceptance.signedBy} ({acceptance.signedByDesignation}) on {acceptance.signedDate}
        </p>
       </div>
      ) : (
       <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-2">
        <div className="flex items-center space-x-2">
         <Clock className="h-4 w-4 text-yellow-600" />
         <span className="text-sm font-semibold text-yellow-800">Awaiting Sign-off</span>
        </div>
       </div>
      )}

      {/* Warranty & AMC */}
      {acceptance.warrantyPeriod && (
       <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="bg-gray-50 p-2 rounded">
         <p className="text-gray-500">Warranty</p>
         <p className="font-medium text-gray-900">{acceptance.warrantyPeriod}</p>
        </div>
        {acceptance.amcOffered && (
         <div className="bg-gray-50 p-2 rounded">
          <p className="text-gray-500">AMC Offered</p>
          <p className="font-medium text-gray-900">{acceptance.amcDuration}</p>
         </div>
        )}
       </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-200">
       <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-600 line-clamp-2 flex-1">{acceptance.remarks}</p>
       </div>
       <div className="flex items-center space-x-1 flex-wrap gap-1">
        <button onClick={() => openViewFullDetailsModal(acceptance)} className="p-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100" title="View Details"><Eye className="h-4 w-4" /></button>
        <button onClick={() => openEditModal(acceptance)} className="p-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100" title="Edit"><Edit className="h-4 w-4" /></button>
        <button onClick={() => openUpdateCriteriaModal(acceptance)} className="p-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100" title="Update Criteria"><ListChecks className="h-4 w-4" /></button>
        <button onClick={() => openUpdateDocumentationModal(acceptance)} className="p-1.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100" title="Documentation"><FileStack className="h-4 w-4" /></button>
        <button onClick={() => openAddPunchListModal(acceptance)} className="p-1.5 bg-red-50 text-red-700 rounded hover:bg-red-100" title="Punch List"><Wrench className="h-4 w-4" /></button>
        <button onClick={() => openUpdateTrainingModal(acceptance)} className="p-1.5 bg-teal-50 text-teal-700 rounded hover:bg-teal-100" title="Training"><GraduationCap className="h-4 w-4" /></button>
        <button onClick={() => openUpdateWarrantyModal(acceptance)} className="p-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100" title="Warranty"><Shield className="h-4 w-4" /></button>
        <button onClick={() => openSignModal(acceptance)} className="p-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100" title="Sign"><PenTool className="h-4 w-4" /></button>
        <button onClick={() => openUpdateStatusModal(acceptance)} className="p-1.5 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100" title="Update Status"><RefreshCw className="h-4 w-4" /></button>
        <button onClick={() => openUploadAttachmentsModal(acceptance)} className="p-1.5 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100" title="Upload"><Upload className="h-4 w-4" /></button>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Pagination */}
   <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
     <div className="text-sm text-gray-700">
      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredAcceptances.length)}</span> of{' '}
      <span className="font-medium">{filteredAcceptances.length}</span> acceptances
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

   {/* View Details Modal */}
   {selectedAcceptance && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
       <div>
        <h2 className="text-xl font-bold text-gray-900">{selectedAcceptance.acceptanceNumber}</h2>
        <p className="text-sm text-gray-600">{selectedAcceptance.projectName}</p>
       </div>
       <button
        onClick={() => setSelectedAcceptance(null)}
        className="text-gray-400 hover:text-gray-600"
       >
        ✕
       </button>
      </div>

      <div className="p-6 space-y-3">
       {/* Deliverables */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Deliverables</h3>
        <div className="grid grid-cols-2 gap-2">
         {selectedAcceptance.deliverables.map((deliverable, index) => (
          <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
           <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
           <span className="text-sm text-gray-900">{deliverable}</span>
          </div>
         ))}
        </div>
       </div>

       {/* Acceptance Criteria */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Acceptance Criteria</h3>
        <div className="space-y-3">
         {selectedAcceptance.acceptanceCriteria.map((criterion, index) => (
          <div key={criterion.id} className="bg-gray-50 p-3 rounded-lg">
           <div className="flex items-start justify-between">
            <div className="flex-1">
             <p className="text-sm font-medium text-gray-900">
              {index + 1}. {criterion.criterion}
             </p>
             {criterion.remarks && (
              <p className="text-sm text-gray-600 mt-1">
               <span className="font-medium">Remarks:</span> {criterion.remarks}
              </p>
             )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
             {getCriteriaStatusIcon(criterion.status)}
             <span className={`font-semibold text-sm ${getCriteriaStatusColor(criterion.status)}`}>
              {criterion.status}
             </span>
            </div>
           </div>
          </div>
         ))}
        </div>
       </div>

       {/* Documentation */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Documentation</h3>
        <div className="overflow-x-auto">
         <table className="w-full text-sm">
          <thead className="bg-gray-50">
           <tr>
            <th className="px-4 py-2 text-left text-gray-600">Document</th>
            <th className="px-4 py-2 text-left text-gray-600">Status</th>
            <th className="px-4 py-2 text-left text-gray-600">Date</th>
           </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
           {selectedAcceptance.documentation.map((doc) => (
            <tr key={doc.id}>
             <td className="px-4 py-2 text-gray-900">{doc.documentName}</td>
             <td className="px-4 py-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
               doc.status === 'Approved' ? 'bg-green-100 text-green-800' :
               doc.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
               doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
               'bg-gray-100 text-gray-800'
              }`}>
               {doc.status}
              </span>
             </td>
             <td className="px-4 py-2 text-gray-600">{doc.submittedDate || '-'}</td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       </div>

       {/* Overall Remarks */}
       <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Overall Remarks</h3>
        <p className="text-sm text-gray-700">{selectedAcceptance.remarks}</p>
       </div>

       {/* Actions */}
       <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
         <Download className="h-4 w-4" />
         <span>Download Certificate</span>
        </button>
        <button
         onClick={() => setSelectedAcceptance(null)}
         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
         Close
        </button>
       </div>
      </div>
     </div>
    </div>
   )}

   <ScheduleAcceptanceModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={handleSchedule} />
   <EditAcceptanceModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedAcceptance(null); }} onEdit={handleEdit} acceptance={selectedAcceptance} />
   <UpdateCriteriaModal isOpen={showUpdateCriteriaModal} onClose={() => { setShowUpdateCriteriaModal(false); setSelectedAcceptance(null); }} onUpdate={handleUpdateCriteria} acceptance={selectedAcceptance} />
   <UpdateDocumentationModal isOpen={showUpdateDocumentationModal} onClose={() => { setShowUpdateDocumentationModal(false); setSelectedAcceptance(null); }} onUpdate={handleUpdateDocumentation} acceptance={selectedAcceptance} />
   <AddPunchListItemsModal isOpen={showAddPunchListModal} onClose={() => { setShowAddPunchListModal(false); setSelectedAcceptance(null); }} onAdd={handleAddPunchList} acceptance={selectedAcceptance} />
   <UpdateTrainingStatusModal isOpen={showUpdateTrainingModal} onClose={() => { setShowUpdateTrainingModal(false); setSelectedAcceptance(null); }} onUpdate={handleUpdateTraining} acceptance={selectedAcceptance} />
   <UpdateWarrantyModal isOpen={showUpdateWarrantyModal} onClose={() => { setShowUpdateWarrantyModal(false); setSelectedAcceptance(null); }} onUpdate={handleUpdateWarranty} acceptance={selectedAcceptance} />
   <SignAcceptanceModal isOpen={showSignModal} onClose={() => { setShowSignModal(false); setSelectedAcceptance(null); }} onSign={handleSign} acceptance={selectedAcceptance} />
   <UpdateStatusModal isOpen={showUpdateStatusModal} onClose={() => { setShowUpdateStatusModal(false); setSelectedAcceptance(null); }} onUpdate={handleUpdateStatus} acceptance={selectedAcceptance} />
   <UploadAttachmentsModal isOpen={showUploadAttachmentsModal} onClose={() => { setShowUploadAttachmentsModal(false); setSelectedAcceptance(null); }} onUpload={handleUploadAttachments} acceptance={selectedAcceptance} />
   <GenerateReportModal isOpen={showGenerateReportModal} onClose={() => setShowGenerateReportModal(false)} onGenerate={handleGenerateReport} />
   <ViewFullDetailsModal isOpen={showViewFullDetailsModal} onClose={() => { setShowViewFullDetailsModal(false); setSelectedAcceptance(null); }} acceptance={selectedAcceptance} />
    </div>
   </div>
  </div>
 );
}
