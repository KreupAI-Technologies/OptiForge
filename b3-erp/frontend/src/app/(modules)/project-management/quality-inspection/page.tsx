'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { ClipboardCheck, CheckCircle, XCircle, AlertTriangle, Plus, Download, Eye, Camera, Edit, FileText, Upload, Users, TrendingUp, Calendar, Shield } from 'lucide-react';
import {
 ScheduleInspectionModal,
 EditInspectionModal,
 UpdateChecklistModal,
 AddDefectModal,
 UploadPhotosModal,
 SignOffModal,
 UpdateStatusModal,
 AssignInspectorModal,
 AddChecklistItemModal,
 GenerateReportModal,
 ExportDataModal,
 ScheduleReInspectionModal,
 ViewFullDetailsModal,
 AddCorrectiveActionModal,
 ScheduleNextInspectionModal,
} from '@/components/project-management/QualityInspectionModals';

interface InspectionItem {
 id: string;
 checkPoint: string;
 criteria: string;
 result: 'Pass' | 'Fail' | 'NA' | 'Pending';
 remarks: string;
}

interface QualityInspection {
 id: string;
 inspectionNumber: string;
 projectId: string;
 projectName: string;
 inspectionDate: string;
 inspectionType: 'Pre-Installation' | 'During Installation' | 'Post-Installation' | 'Final Inspection' | 'Periodic';
 phase: string;
 workPackage: string;
 inspectorName: string;
 inspectorId: string;
 checklist: InspectionItem[];
 totalCheckPoints: number;
 passed: number;
 failed: number;
 notApplicable: number;
 pending: number;
 overallStatus: 'Passed' | 'Failed' | 'Conditional Pass' | 'Pending';
 defects: number;
 criticalDefects: number;
 photos: number;
 signedOff: boolean;
 signOffBy: string;
 signOffDate: string;
 nextInspectionDate: string;
 remarks: string;
}

export default function QualityInspectionPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterType, setFilterType] = useState<string>('all');
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showChecklistModal, setShowChecklistModal] = useState(false);
 const [showDefectModal, setShowDefectModal] = useState(false);
 const [showPhotosModal, setShowPhotosModal] = useState(false);
 const [showSignOffModal, setShowSignOffModal] = useState(false);
 const [showStatusModal, setShowStatusModal] = useState(false);
 const [showAssignModal, setShowAssignModal] = useState(false);
 const [showAddItemModal, setShowAddItemModal] = useState(false);
 const [showReportModal, setShowReportModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showReInspectionModal, setShowReInspectionModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [showCorrectiveModal, setShowCorrectiveModal] = useState(false);
 const [showNextInspectionModal, setShowNextInspectionModal] = useState(false);

 const [mockInspections, setMockInspections] = useState<QualityInspection[]>([]);

 useEffect(() => {
  projectManagementService.listQualityInspections()
   .then((rows) => { setMockInspections(Array.isArray(rows) ? (rows as unknown as QualityInspection[]) : []); })
   .catch(() => { setMockInspections([]); });
 }, []);

 const stats = {
  totalInspections: mockInspections.length,
  passed: mockInspections.filter(i => i.overallStatus === 'Passed').length,
  failed: mockInspections.filter(i => i.overallStatus === 'Failed').length,
  conditionalPass: mockInspections.filter(i => i.overallStatus === 'Conditional Pass').length,
  pending: mockInspections.filter(i => i.overallStatus === 'Pending').length,
  totalDefects: mockInspections.reduce((sum, i) => sum + i.defects, 0),
  criticalDefects: mockInspections.reduce((sum, i) => sum + i.criticalDefects, 0),
 };

 const filteredInspections = mockInspections.filter((inspection) => {
  const matchesSearch =
   inspection.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   inspection.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   inspection.workPackage.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || inspection.overallStatus === filterStatus;
  const matchesType = filterType === 'all' || inspection.inspectionType === filterType;
  return matchesSearch && matchesStatus && matchesType;
 });

 const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedInspections = filteredInspections.slice(startIndex, startIndex + itemsPerPage);

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Passed':
    return 'bg-green-100 text-green-800';
   case 'Failed':
    return 'bg-red-100 text-red-800';
   case 'Conditional Pass':
    return 'bg-yellow-100 text-yellow-800';
   case 'Pending':
    return 'bg-blue-100 text-blue-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getResultColor = (result: string) => {
  switch (result) {
   case 'Pass':
    return 'text-green-600';
   case 'Fail':
    return 'text-red-600';
   case 'NA':
    return 'text-gray-400';
   case 'Pending':
    return 'text-blue-600';
   default:
    return 'text-gray-600';
  }
 };

 const getResultIcon = (result: string) => {
  switch (result) {
   case 'Pass':
    return <CheckCircle className="h-5 w-5 text-green-600" />;
   case 'Fail':
    return <XCircle className="h-5 w-5 text-red-600" />;
   case 'Pending':
    return <AlertTriangle className="h-5 w-5 text-blue-600" />;
   default:
    return <span className="h-5 w-5 text-gray-400">N/A</span>;
  }
 };

 // Handler functions for all modals
 const handleSchedule = (data: any) => { console.log('Schedule:', data); setShowScheduleModal(false); };
 const handleEdit = (data: any) => { console.log('Edit:', data); setShowEditModal(false); setSelectedInspection(null); };
 const handleUpdateChecklist = (data: any) => { console.log('Update Checklist:', data); setShowChecklistModal(false); setSelectedInspection(null); };
 const handleAddDefect = (data: any) => { console.log('Add Defect:', data); setShowDefectModal(false); setSelectedInspection(null); };
 const handleUploadPhotos = (data: any) => { console.log('Upload Photos:', data); setShowPhotosModal(false); setSelectedInspection(null); };
 const handleSignOff = (data: any) => { console.log('Sign Off:', data); setShowSignOffModal(false); setSelectedInspection(null); };
 const handleUpdateStatus = (data: any) => { console.log('Update Status:', data); setShowStatusModal(false); setSelectedInspection(null); };
 const handleAssignInspector = (data: any) => { console.log('Assign:', data); setShowAssignModal(false); setSelectedInspection(null); };
 const handleAddItem = (data: any) => { console.log('Add Item:', data); setShowAddItemModal(false); setSelectedInspection(null); };
 const handleGenerateReport = (data: any) => { console.log('Report:', data); setShowReportModal(false); setSelectedInspection(null); };
 const handleExport = (data: any) => { exportToCsv('quality-inspections', filteredInspections as unknown as Record<string, unknown>[]); setShowExportModal(false); };
 const handleScheduleReInspection = (data: any) => { console.log('Re-Inspection:', data); setShowReInspectionModal(false); setSelectedInspection(null); };
 const handleAddCorrective = (data: any) => { console.log('Corrective:', data); setShowCorrectiveModal(false); setSelectedInspection(null); };
 const handleScheduleNext = (data: any) => { console.log('Next:', data); setShowNextInspectionModal(false); setSelectedInspection(null); };

 // Helper functions to open modals
 const openEditModal = (i: QualityInspection) => { setSelectedInspection(i); setShowEditModal(true); };
 const openChecklistModal = (i: QualityInspection) => { setSelectedInspection(i); setShowChecklistModal(true); };
 const openDefectModal = (i: QualityInspection) => { setSelectedInspection(i); setShowDefectModal(true); };
 const openPhotosModal = (i: QualityInspection) => { setSelectedInspection(i); setShowPhotosModal(true); };
 const openSignOffModal = (i: QualityInspection) => { setSelectedInspection(i); setShowSignOffModal(true); };
 const openStatusModal = (i: QualityInspection) => { setSelectedInspection(i); setShowStatusModal(true); };
 const openAssignModal = (i: QualityInspection) => { setSelectedInspection(i); setShowAssignModal(true); };
 const openAddItemModal = (i: QualityInspection) => { setSelectedInspection(i); setShowAddItemModal(true); };
 const openReportModal = (i: QualityInspection) => { setSelectedInspection(i); setShowReportModal(true); };
 const openReInspectionModal = (i: QualityInspection) => { setSelectedInspection(i); setShowReInspectionModal(true); };
 const openDetailsModal = (i: QualityInspection) => { setSelectedInspection(i); setShowDetailsModal(true); };
 const openCorrectiveModal = (i: QualityInspection) => { setSelectedInspection(i); setShowCorrectiveModal(true); };
 const openNextModal = (i: QualityInspection) => { setSelectedInspection(i); setShowNextInspectionModal(true); };

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex justify-between items-start">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Quality Inspection Checklist</h1>
     <p className="text-gray-600 mt-1">Project quality assurance and compliance tracking</p>
    </div>
    <div className="flex items-center space-x-3">
     <button
      onClick={() => setShowReportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
     >
      <FileText className="h-5 w-5" />
      <span>Generate Report</span>
     </button>
     <button
      onClick={() => setShowExportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
     >
      <Download className="h-5 w-5" />
      <span>Export</span>
     </button>
     <button
      onClick={() => setShowScheduleModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
     >
      <Plus className="h-5 w-5" />
      <span>Schedule Inspection</span>
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalInspections}</p>
      </div>
      <ClipboardCheck className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Passed</p>
       <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Failed</p>
       <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
      </div>
      <XCircle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Conditional</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.conditionalPass}</p>
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
      <AlertTriangle className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Defects</p>
       <p className="text-2xl font-bold text-orange-600">{stats.totalDefects}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-orange-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Critical</p>
       <p className="text-2xl font-bold text-red-600">{stats.criticalDefects}</p>
      </div>
      <XCircle className="h-8 w-8 text-red-600" />
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
       placeholder="Search by inspection number, project, work package..."
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
       <option value="Passed">Passed</option>
       <option value="Failed">Failed</option>
       <option value="Conditional Pass">Conditional Pass</option>
       <option value="Pending">Pending</option>
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
       <option value="Pre-Installation">Pre-Installation</option>
       <option value="During Installation">During Installation</option>
       <option value="Post-Installation">Post-Installation</option>
       <option value="Final Inspection">Final Inspection</option>
       <option value="Periodic">Periodic</option>
      </select>
     </div>
    </div>
   </div>

   {/* Inspections Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Inspection Details
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project / Phase
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Type
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Checkpoints
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Results
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Defects
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
       {paginatedInspections.map((inspection) => (
        <tr key={inspection.id} className="hover:bg-gray-50">
         <td className="px-4 py-4">
          <div>
           <div className="text-sm font-medium text-gray-900">{inspection.inspectionNumber}</div>
           <div className="text-sm text-gray-600">{inspection.inspectorName}</div>
           <div className="text-xs text-gray-500">{inspection.inspectionDate}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">{inspection.projectId}</div>
          <div className="text-sm text-gray-600">{inspection.projectName}</div>
          <div className="text-xs text-gray-500">{inspection.phase}</div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{inspection.inspectionType}</div>
         </td>
         <td className="px-4 py-4 text-center">
          <div className="text-sm font-medium text-gray-900">{inspection.totalCheckPoints}</div>
          <div className="text-xs text-gray-500">checkpoints</div>
         </td>
         <td className="px-4 py-4">
          <div className="flex justify-center space-x-2 text-xs">
           <span className="text-green-600 font-medium">✓ {inspection.passed}</span>
           <span className="text-red-600 font-medium">✗ {inspection.failed}</span>
           <span className="text-gray-400 font-medium">- {inspection.notApplicable}</span>
           {inspection.pending > 0 && (
            <span className="text-blue-600 font-medium">⏳ {inspection.pending}</span>
           )}
          </div>
         </td>
         <td className="px-4 py-4 text-center">
          <div className="text-sm font-medium text-gray-900">{inspection.defects}</div>
          {inspection.criticalDefects > 0 && (
           <div className="text-xs text-red-600 font-semibold">
            {inspection.criticalDefects} Critical
           </div>
          )}
         </td>
         <td className="px-4 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.overallStatus)}`}>
           {inspection.overallStatus}
          </span>
          {inspection.signedOff && (
           <div className="flex items-center mt-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed Off
           </div>
          )}
         </td>
         <td className="px-4 py-4 text-center">
          <button
           onClick={() => setSelectedInspection(inspection)}
           className="text-blue-600 hover:text-blue-800"
          >
           <Eye className="h-5 w-5" />
          </button>
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
       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredInspections.length)}</span> of{' '}
       <span className="font-medium">{filteredInspections.length}</span> inspections
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

   {/* View Inspection Details Modal */}
   {selectedInspection && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
       <div>
        <h2 className="text-xl font-bold text-gray-900">{selectedInspection.inspectionNumber}</h2>
        <p className="text-sm text-gray-600">{selectedInspection.projectName} - {selectedInspection.phase}</p>
       </div>
       <button
        onClick={() => setSelectedInspection(null)}
        className="text-gray-400 hover:text-gray-600"
       >
        ✕
       </button>
      </div>

      <div className="p-6 space-y-3">
       {/* Inspection Summary */}
       <div className="grid grid-cols-4 gap-2">
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Inspector</p>
         <p className="font-medium text-gray-900">{selectedInspection.inspectorName}</p>
         <p className="text-xs text-gray-500">{selectedInspection.inspectorId}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Date</p>
         <p className="font-medium text-gray-900">{selectedInspection.inspectionDate}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Type</p>
         <p className="font-medium text-gray-900">{selectedInspection.inspectionType}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
         <p className="text-sm text-gray-600">Status</p>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInspection.overallStatus)}`}>
          {selectedInspection.overallStatus}
         </span>
        </div>
       </div>

       {/* Checklist Items */}
       <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspection Checklist</h3>
        <div className="space-y-3">
         {selectedInspection.checklist.map((item, index) => (
          <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
           <div className="flex items-start justify-between">
            <div className="flex-1">
             <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
               {index + 1}. {item.checkPoint}
              </span>
             </div>
             <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Criteria:</span> {item.criteria}
             </p>
             {item.remarks && (
              <p className="text-sm text-gray-700 mt-1">
               <span className="font-medium">Remarks:</span> {item.remarks}
              </p>
             )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
             {getResultIcon(item.result)}
             <span className={`font-semibold text-sm ${getResultColor(item.result)}`}>
              {item.result}
             </span>
            </div>
           </div>
          </div>
         ))}
        </div>
       </div>

       {/* Overall Remarks */}
       <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Overall Remarks</h3>
        <p className="text-sm text-gray-700">{selectedInspection.remarks}</p>
       </div>

       {/* Sign-off Status */}
       {selectedInspection.signedOff ? (
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
         <div className="flex items-center space-x-2 text-green-800">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Inspection Signed Off</span>
         </div>
         <p className="text-sm text-green-700 mt-1">
          Signed by: {selectedInspection.signOffBy} on {selectedInspection.signOffDate}
         </p>
        </div>
       ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
         <div className="flex items-center space-x-2 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-semibold">Awaiting Sign-off</span>
         </div>
         {selectedInspection.nextInspectionDate && (
          <p className="text-sm text-yellow-700 mt-1">
           Next inspection scheduled: {selectedInspection.nextInspectionDate}
          </p>
         )}
        </div>
       )}

       {/* Actions */}
       <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
         <Download className="h-4 w-4" />
         <span>Download Report</span>
        </button>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
         <Camera className="h-4 w-4" />
         <span>View Photos ({selectedInspection.photos})</span>
        </button>
        <button
         onClick={() => setSelectedInspection(null)}
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
   <ScheduleInspectionModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={handleSchedule} />
   <EditInspectionModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedInspection(null); }} onEdit={handleEdit} inspection={selectedInspection} />
   <UpdateChecklistModal isOpen={showChecklistModal} onClose={() => { setShowChecklistModal(false); setSelectedInspection(null); }} onUpdate={handleUpdateChecklist} inspection={selectedInspection} />
   <AddDefectModal isOpen={showDefectModal} onClose={() => { setShowDefectModal(false); setSelectedInspection(null); }} onAdd={handleAddDefect} inspection={selectedInspection} />
   <UploadPhotosModal isOpen={showPhotosModal} onClose={() => { setShowPhotosModal(false); setSelectedInspection(null); }} onUpload={handleUploadPhotos} inspection={selectedInspection} />
   <SignOffModal isOpen={showSignOffModal} onClose={() => { setShowSignOffModal(false); setSelectedInspection(null); }} onSignOff={handleSignOff} inspection={selectedInspection} />
   <UpdateStatusModal isOpen={showStatusModal} onClose={() => { setShowStatusModal(false); setSelectedInspection(null); }} onUpdate={handleUpdateStatus} inspection={selectedInspection} />
   <AssignInspectorModal isOpen={showAssignModal} onClose={() => { setShowAssignModal(false); setSelectedInspection(null); }} onAssign={handleAssignInspector} inspection={selectedInspection} />
   <AddChecklistItemModal isOpen={showAddItemModal} onClose={() => { setShowAddItemModal(false); setSelectedInspection(null); }} onAdd={handleAddItem} inspection={selectedInspection} />
   <GenerateReportModal isOpen={showReportModal} onClose={() => { setShowReportModal(false); setSelectedInspection(null); }} onGenerate={handleGenerateReport} inspection={selectedInspection} />
   <ExportDataModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} />
   <ScheduleReInspectionModal isOpen={showReInspectionModal} onClose={() => { setShowReInspectionModal(false); setSelectedInspection(null); }} onSchedule={handleScheduleReInspection} inspection={selectedInspection} />
   <ViewFullDetailsModal isOpen={showDetailsModal} onClose={() => { setShowDetailsModal(false); setSelectedInspection(null); }} inspection={selectedInspection} />
   <AddCorrectiveActionModal isOpen={showCorrectiveModal} onClose={() => { setShowCorrectiveModal(false); setSelectedInspection(null); }} onAdd={handleAddCorrective} inspection={selectedInspection} />
   <ScheduleNextInspectionModal isOpen={showNextInspectionModal} onClose={() => { setShowNextInspectionModal(false); setSelectedInspection(null); }} onSchedule={handleScheduleNext} inspection={selectedInspection} />

   {/* Add Inspection Modal */}
   {showAddModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
     <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex justify-between items-center">
       <h2 className="text-xl font-bold text-gray-900">New Quality Inspection</h2>
       <button
        onClick={() => setShowAddModal(false)}
        className="text-gray-400 hover:text-gray-600"
       >
        ✕
       </button>
      </div>

      <div className="p-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
         <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option>Select Project</option>
          <option>PRJ-2025-001 - Taj Hotels</option>
          <option>PRJ-2025-002 - BigBasket</option>
          <option>PRJ-2025-003 - L&T Campus</option>
         </select>
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Date</label>
         <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Type</label>
         <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option>Pre-Installation</option>
          <option>During Installation</option>
          <option>Post-Installation</option>
          <option>Final Inspection</option>
          <option>Periodic</option>
         </select>
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
         <input
          type="text"
          placeholder="e.g., Equipment Installation"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div className="md:col-span-2">
         <label className="block text-sm font-medium text-gray-700 mb-1">Work Package</label>
         <input
          type="text"
          placeholder="e.g., WP-001 - Cooking Equipment"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name</label>
         <input
          type="text"
          placeholder="QC engineer name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">Inspector ID</label>
         <input
          type="text"
          placeholder="e.g., EMP-QC-001"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
         />
        </div>
       </div>

       <div className="flex justify-end space-x-3 mt-6">
        <button
         onClick={() => setShowAddModal(false)}
         className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
         Cancel
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
         Create Inspection
        </button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
