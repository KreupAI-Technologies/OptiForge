'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/projectManagementService';
import { exportToCsv } from '@/lib/export';
import { Package, TrendingUp, AlertTriangle, CheckCircle, Plus, Filter, Download, Calendar, Edit, Eye, BarChart2, CheckSquare, XCircle, Upload, FileDown, RotateCcw, Sliders, MessageSquare, FileBarChart } from 'lucide-react';
import {
 AddConsumptionModal,
 EditConsumptionModal,
 ViewDetailsModal,
 VarianceAnalysisModal,
 ApproveConsumptionModal,
 RejectConsumptionModal,
 BulkUploadModal,
 ExportReportModal,
 MaterialReturnModal,
 AdjustQuantityModal,
 AddCommentsModal,
 GenerateVarianceReportModal,
} from '@/components/project-management/MaterialConsumptionModals';

interface MaterialConsumption {
 id: string;
 date: string;
 projectId: string;
 projectName: string;
 workPackage: string;
 materialCode: string;
 materialName: string;
 category: string;
 unit: string;
 plannedQty: number;
 consumedQty: number;
 variance: number;
 variancePercent: number;
 unitCost: number;
 totalCost: number;
 source: 'Stock' | 'Direct Purchase' | 'Subcontractor';
 issuedBy: string;
 receivedBy: string;
 warehouseLocation: string;
 remarks: string;
 status: 'Within Budget' | 'Overused' | 'Critical';
}

export default function MaterialConsumptionPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterProject, setFilterProject] = useState<string>('all');
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [showAddConsumptionModal, setShowAddConsumptionModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [showVarianceModal, setShowVarianceModal] = useState(false);
 const [showApproveModal, setShowApproveModal] = useState(false);
 const [showRejectModal, setShowRejectModal] = useState(false);
 const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showReturnModal, setShowReturnModal] = useState(false);
 const [showAdjustModal, setShowAdjustModal] = useState(false);
 const [showCommentsModal, setShowCommentsModal] = useState(false);
 const [showVarianceReportModal, setShowVarianceReportModal] = useState(false);
 const [selectedConsumption, setSelectedConsumption] = useState<MaterialConsumption | null>(null);

 const [mockConsumptions, setMockConsumptions] = useState<MaterialConsumption[]>([]);
 useEffect(() => {
   projectManagementService.listMaterialConsumption().then((rows) => {
     if (Array.isArray(rows)) setMockConsumptions(rows as unknown as MaterialConsumption[]);
   });
 }, []);

 const stats = {
  totalConsumptions: mockConsumptions.length,
  withinBudget: mockConsumptions.filter(m => m.status === 'Within Budget').length,
  overused: mockConsumptions.filter(m => m.status === 'Overused').length,
  critical: mockConsumptions.filter(m => m.status === 'Critical').length,
  totalCost: mockConsumptions.reduce((sum, m) => sum + m.totalCost, 0),
  avgVariance: (mockConsumptions.reduce((sum, m) => sum + Math.abs(m.variancePercent), 0) / mockConsumptions.length).toFixed(2),
 };

 const filteredConsumptions = mockConsumptions.filter((consumption) => {
  const matchesSearch =
   consumption.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   consumption.materialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
   consumption.projectName.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || consumption.status === filterStatus;
  const matchesProject = filterProject === 'all' || consumption.projectId === filterProject;
  return matchesSearch && matchesStatus && matchesProject;
 });

 const totalPages = Math.ceil(filteredConsumptions.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedConsumptions = filteredConsumptions.slice(startIndex, startIndex + itemsPerPage);

 const uniqueProjects = Array.from(new Set(mockConsumptions.map(m => m.projectId)));

 // Handler functions
 const handleAddConsumption = (data: any) => {
  console.log('Adding consumption:', data);
  setShowAddConsumptionModal(false);
  // API call would go here
 };

 const handleEditConsumption = (data: any) => {
  console.log('Editing consumption:', data);
  setShowEditModal(false);
  setSelectedConsumption(null);
  // API call would go here
 };

 const handleViewDetails = (consumption: MaterialConsumption) => {
  console.log('Viewing details:', consumption);
 };

 const handleVarianceAnalysis = (consumption: MaterialConsumption) => {
  console.log('Analyzing variance:', consumption);
 };

 const handleApprove = (data: any) => {
  console.log('Approving consumption:', selectedConsumption?.id, data);
  setShowApproveModal(false);
  setSelectedConsumption(null);
  // API call would go here
 };

 const handleReject = (data: any) => {
  console.log('Rejecting consumption:', selectedConsumption?.id, data);
  setShowRejectModal(false);
  setSelectedConsumption(null);
  // API call would go here
 };

 const handleBulkUpload = (data: any) => {
  console.log('Bulk uploading:', data);
  setShowBulkUploadModal(false);
  // API call would go here
 };

 const handleExport = (data: any) => {
  exportToCsv('material-consumption', filteredConsumptions as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
  // API call would go here
 };

 const handleReturn = (data: any) => {
  console.log('Processing return:', selectedConsumption?.id, data);
  setShowReturnModal(false);
  setSelectedConsumption(null);
  // API call would go here
 };

 const handleAdjustQuantity = (data: any) => {
  console.log('Adjusting quantity:', selectedConsumption?.id, data);
  setShowAdjustModal(false);
  setSelectedConsumption(null);
  // API call would go here
 };

 const handleAddComments = (data: any) => {
  console.log('Adding comments:', selectedConsumption?.id, data);
  setShowCommentsModal(false);
  setSelectedConsumption(null);
  // API call would go here
 };

 const handleGenerateVarianceReport = (data: any) => {
  console.log('Generating variance report:', data);
  setShowVarianceReportModal(false);
  // API call would go here
 };

 // Helper functions to open modals with context
 const openEditModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowEditModal(true);
 };

 const openDetailsModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowDetailsModal(true);
 };

 const openVarianceModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowVarianceModal(true);
 };

 const openApproveModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowApproveModal(true);
 };

 const openRejectModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowRejectModal(true);
 };

 const openReturnModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowReturnModal(true);
 };

 const openAdjustModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowAdjustModal(true);
 };

 const openCommentsModal = (consumption: MaterialConsumption) => {
  setSelectedConsumption(consumption);
  setShowCommentsModal(true);
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Within Budget':
    return 'bg-green-100 text-green-800';
   case 'Overused':
    return 'bg-yellow-100 text-yellow-800';
   case 'Critical':
    return 'bg-red-100 text-red-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getVarianceColor = (variance: number) => {
  if (variance > 0) return 'text-green-600';
  if (variance < -10) return 'text-red-600';
  return 'text-yellow-600';
 };

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="space-y-2">
    <div className="flex justify-between items-center">
     <div>
      <h1 className="text-3xl font-bold text-gray-900">Material Consumption Tracking</h1>
      <p className="text-gray-600 mt-1">Track material usage vs planned quantities</p>
     </div>
    </div>

    {/* Action Buttons */}
    <div className="flex flex-wrap gap-3">
     <button
      onClick={() => setShowAddConsumptionModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm"
     >
      <Plus className="h-4 w-4" />
      <span>Add Consumption</span>
     </button>
     <button
      onClick={() => setShowBulkUploadModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-sm"
     >
      <Upload className="h-4 w-4" />
      <span>Bulk Upload</span>
     </button>
     <button
      onClick={() => setShowExportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 shadow-sm"
     >
      <FileDown className="h-4 w-4" />
      <span>Export Report</span>
     </button>
     <button
      onClick={() => setShowVarianceReportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg hover:from-violet-700 hover:to-violet-800 shadow-sm"
     >
      <FileBarChart className="h-4 w-4" />
      <span>Generate Variance Report</span>
     </button>
     <button
      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 shadow-sm"
     >
      <Sliders className="h-4 w-4" />
      <span>More Filters</span>
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Records</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalConsumptions}</p>
      </div>
      <Package className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Within Budget</p>
       <p className="text-2xl font-bold text-green-600">{stats.withinBudget}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Overused</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.overused}</p>
      </div>
      <TrendingUp className="h-8 w-8 text-yellow-600" />
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
       <p className="text-sm text-gray-600">Total Cost</p>
       <p className="text-2xl font-bold text-gray-900">
        ₹{(stats.totalCost / 100000).toFixed(2)}L
       </p>
      </div>
      <TrendingUp className="h-8 w-8 text-purple-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Avg Variance</p>
       <p className="text-2xl font-bold text-gray-900">{stats.avgVariance}%</p>
      </div>
      <TrendingUp className="h-8 w-8 text-indigo-600" />
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
       type="text"
       placeholder="Search material, code, project..."
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
       <option value="Within Budget">Within Budget</option>
       <option value="Overused">Overused</option>
       <option value="Critical">Critical</option>
      </select>
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
      <select
       value={filterProject}
       onChange={(e) => setFilterProject(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
       <option value="all">All Projects</option>
       {uniqueProjects.map((project) => (
        <option key={project} value={project}>
         {project}
        </option>
       ))}
      </select>
     </div>
    </div>
   </div>

   {/* Consumption Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Date / Material
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project / Work Package
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Category
        </th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
         Planned
        </th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
         Consumed
        </th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
         Variance
        </th>
        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
         Total Cost
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
       {paginatedConsumptions.map((consumption) => (
        <tr key={consumption.id} className="hover:bg-gray-50">
         <td className="px-4 py-4">
          <div className="flex items-center space-x-2">
           <Calendar className="h-4 w-4 text-gray-400" />
           <div>
            <div className="text-sm font-medium text-gray-900">{consumption.materialCode}</div>
            <div className="text-sm text-gray-600">{consumption.materialName}</div>
            <div className="text-xs text-gray-500">{consumption.date}</div>
           </div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">{consumption.projectId}</div>
          <div className="text-sm text-gray-600">{consumption.projectName}</div>
          <div className="text-xs text-gray-500">{consumption.workPackage}</div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{consumption.category}</div>
          <div className="text-xs text-gray-500">{consumption.source}</div>
         </td>
         <td className="px-4 py-4 text-right">
          <div className="text-sm font-medium text-gray-900">
           {consumption.plannedQty} {consumption.unit}
          </div>
         </td>
         <td className="px-4 py-4 text-right">
          <div className="text-sm font-medium text-gray-900">
           {consumption.consumedQty} {consumption.unit}
          </div>
         </td>
         <td className="px-4 py-4 text-right">
          <div className={`text-sm font-semibold ${getVarianceColor(consumption.variance)}`}>
           {consumption.variance > 0 ? '+' : ''}{consumption.variance} {consumption.unit}
          </div>
          <div className={`text-xs ${getVarianceColor(consumption.variance)}`}>
           ({consumption.variancePercent > 0 ? '+' : ''}{consumption.variancePercent.toFixed(2)}%)
          </div>
         </td>
         <td className="px-4 py-4 text-right">
          <div className="text-sm font-medium text-gray-900">
           ₹{consumption.totalCost.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-500">
           @ ₹{consumption.unitCost}/{consumption.unit}
          </div>
         </td>
         <td className="px-4 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consumption.status)}`}>
           {consumption.status}
          </span>
         </td>
         <td className="px-4 py-4">
          <div className="flex flex-col gap-2">
           {/* Row 1: View Details, Edit, Variance Analysis, Approve */}
           <div className="flex gap-1 justify-center">
            <button
             onClick={() => openDetailsModal(consumption)}
             className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100"
             title="View Details"
            >
             <Eye className="h-3.5 w-3.5" />
            </button>
            <button
             onClick={() => openEditModal(consumption)}
             className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100"
             title="Edit"
            >
             <Edit className="h-3.5 w-3.5" />
            </button>
            <button
             onClick={() => openVarianceModal(consumption)}
             className="p-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
             title="Variance Analysis"
            >
             <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
             onClick={() => openApproveModal(consumption)}
             className="p-1.5 bg-teal-50 text-teal-600 rounded hover:bg-teal-100"
             title="Approve"
            >
             <CheckSquare className="h-3.5 w-3.5" />
            </button>
           </div>
           {/* Row 2: Reject, Return Material, Adjust Qty, Add Comments */}
           <div className="flex gap-1 justify-center">
            <button
             onClick={() => openRejectModal(consumption)}
             className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
             title="Reject"
            >
             <XCircle className="h-3.5 w-3.5" />
            </button>
            <button
             onClick={() => openReturnModal(consumption)}
             className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100"
             title="Return Material"
            >
             <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
             onClick={() => openAdjustModal(consumption)}
             className="p-1.5 bg-cyan-50 text-cyan-600 rounded hover:bg-cyan-100"
             title="Adjust Quantity"
            >
             <Sliders className="h-3.5 w-3.5" />
            </button>
            <button
             onClick={() => openCommentsModal(consumption)}
             className="p-1.5 bg-pink-50 text-pink-600 rounded hover:bg-pink-100"
             title="Add Comments"
            >
             <MessageSquare className="h-3.5 w-3.5" />
            </button>
           </div>
          </div>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>

    {/* Pagination */}
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
     <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
       Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredConsumptions.length)}</span> of{' '}
       <span className="font-medium">{filteredConsumptions.length}</span> results
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
   <AddConsumptionModal
    isOpen={showAddConsumptionModal}
    onClose={() => setShowAddConsumptionModal(false)}
    onAdd={handleAddConsumption}
   />

   <EditConsumptionModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedConsumption(null);
    }}
    onSave={handleEditConsumption}
    consumption={selectedConsumption}
   />

   <ViewDetailsModal
    isOpen={showDetailsModal}
    onClose={() => {
     setShowDetailsModal(false);
     setSelectedConsumption(null);
    }}
    consumption={selectedConsumption}
   />

   <VarianceAnalysisModal
    isOpen={showVarianceModal}
    onClose={() => {
     setShowVarianceModal(false);
     setSelectedConsumption(null);
    }}
    consumption={selectedConsumption}
   />

   <ApproveConsumptionModal
    isOpen={showApproveModal}
    onClose={() => {
     setShowApproveModal(false);
     setSelectedConsumption(null);
    }}
    onApprove={handleApprove}
    consumption={selectedConsumption}
   />

   <RejectConsumptionModal
    isOpen={showRejectModal}
    onClose={() => {
     setShowRejectModal(false);
     setSelectedConsumption(null);
    }}
    onReject={handleReject}
    consumption={selectedConsumption}
   />

   <BulkUploadModal
    isOpen={showBulkUploadModal}
    onClose={() => setShowBulkUploadModal(false)}
    onUpload={handleBulkUpload}
   />

   <ExportReportModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExport}
   />

   <MaterialReturnModal
    isOpen={showReturnModal}
    onClose={() => {
     setShowReturnModal(false);
     setSelectedConsumption(null);
    }}
    onReturn={handleReturn}
    consumption={selectedConsumption}
   />

   <AdjustQuantityModal
    isOpen={showAdjustModal}
    onClose={() => {
     setShowAdjustModal(false);
     setSelectedConsumption(null);
    }}
    onAdjust={handleAdjustQuantity}
    consumption={selectedConsumption}
   />

   <AddCommentsModal
    isOpen={showCommentsModal}
    onClose={() => {
     setShowCommentsModal(false);
     setSelectedConsumption(null);
    }}
    onAdd={handleAddComments}
    consumption={selectedConsumption}
   />

   <GenerateVarianceReportModal
    isOpen={showVarianceReportModal}
    onClose={() => setShowVarianceReportModal(false)}
    onGenerate={handleGenerateVarianceReport}
   />
  </div>
 );
}
