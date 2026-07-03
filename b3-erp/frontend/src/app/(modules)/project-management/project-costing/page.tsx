'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3, Eye, Download, Plus, Edit, Calculator, Target, Users, PieChart, FileText, History, Lock, Filter } from 'lucide-react';
import {
 CostBreakdownModal,
 AddCostEntryModal,
 CostVarianceModal,
 ProfitMarginModal,
 CostForecastModal,
 ResourceCostModal,
 CostComparisonModal,
 CostReportModal,
 ExportCostDataModal,
 CostHistoryModal,
 CostApprovalModal,
 CostAlertModal,
} from '@/components/project-management/ProjectCostingModals';

interface CostBreakdown {
 category: string;
 budgeted: number;
 actual: number;
 variance: number;
 variancePercent: number;
 status: 'Under Budget' | 'On Budget' | 'Over Budget';
}

interface ProjectCost {
 id: string;
 projectId: string;
 projectName: string;
 projectType: string;
 customer: string;
 startDate: string;
 endDate: string;
 progress: number;
 status: 'In Progress' | 'Completed' | 'On Hold';
 totalBudget: number;
 actualCost: number;
 committedCost: number;
 forecastedCost: number;
 variance: number;
 variancePercent: number;
 costBreakdown: CostBreakdown[];
 profitMargin: number;
 actualProfit: number;
}

export default function ProjectCostingPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [selectedProject, setSelectedProject] = useState<ProjectCost | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 8;

 // Modal states
 const [showCostBreakdownModal, setShowCostBreakdownModal] = useState(false);
 const [showAddCostEntryModal, setShowAddCostEntryModal] = useState(false);
 const [showCostVarianceModal, setShowCostVarianceModal] = useState(false);
 const [showProfitMarginModal, setShowProfitMarginModal] = useState(false);
 const [showCostForecastModal, setShowCostForecastModal] = useState(false);
 const [showResourceCostModal, setShowResourceCostModal] = useState(false);
 const [showCostComparisonModal, setShowCostComparisonModal] = useState(false);
 const [showCostReportModal, setShowCostReportModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showCostHistoryModal, setShowCostHistoryModal] = useState(false);
 const [showCostApprovalModal, setShowCostApprovalModal] = useState(false);
 const [showCostAlertModal, setShowCostAlertModal] = useState(false);

 const [mockProjectCosts, setMockProjectCosts] = useState<ProjectCost[]>([]);
 useEffect(() => {
   projectManagementService.listProjectCosts().then((rows) => {
     if (Array.isArray(rows)) setMockProjectCosts(rows as unknown as ProjectCost[]);
   });
 }, []);

 const stats = {
  totalProjects: mockProjectCosts.length,
  activeProjects: mockProjectCosts.filter(p => p.status === 'In Progress').length,
  completedProjects: mockProjectCosts.filter(p => p.status === 'Completed').length,
  totalBudget: mockProjectCosts.reduce((sum, p) => sum + p.totalBudget, 0),
  totalActual: mockProjectCosts.reduce((sum, p) => sum + p.actualCost, 0),
  totalVariance: mockProjectCosts.reduce((sum, p) => sum + p.variance, 0),
  overBudgetProjects: mockProjectCosts.filter(p => p.variance < 0).length,
 };

 const filteredProjects = mockProjectCosts.filter((project) => {
  const matchesSearch =
   project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   project.projectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
   project.customer.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
  return matchesSearch && matchesStatus;
 });

 const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

 const getVarianceColor = (variance: number) => {
  if (variance > 0) return 'text-green-600';
  if (variance < -500000) return 'text-red-600';
  return 'text-yellow-600';
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Completed':
    return 'bg-green-100 text-green-800';
   case 'In Progress':
    return 'bg-blue-100 text-blue-800';
   case 'On Hold':
    return 'bg-yellow-100 text-yellow-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getCostStatusColor = (status: string) => {
  switch (status) {
   case 'Under Budget':
    return 'text-green-600';
   case 'On Budget':
    return 'text-blue-600';
   case 'Over Budget':
    return 'text-red-600';
   default:
    return 'text-gray-600';
  }
 };

 // Modal handlers
 const handleCostBreakdown = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowCostBreakdownModal(true);
 };

 const handleAddCost = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowAddCostEntryModal(true);
 };

 const handleVarianceAnalysis = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowCostVarianceModal(true);
 };

 const handleProfitMargin = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowProfitMarginModal(true);
 };

 const handleForecast = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowCostForecastModal(true);
 };

 const handleResourceCost = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowResourceCostModal(true);
 };

 const handleViewHistory = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowCostHistoryModal(true);
 };

 const handleGenerateReport = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowCostReportModal(true);
 };

 const handleSubmitApproval = (project: ProjectCost) => {
  setSelectedProject(project);
  setShowCostApprovalModal(true);
 };

 const handleAddCostEntry = (entry: any) => {
  console.log('New cost entry:', entry);
  setShowAddCostEntryModal(false);
 };

 const handleExport = (format: string) => {
  exportToCsv('project-costing', filteredProjects as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 const handleApprovalSubmit = (data: any) => {
  console.log('Approval submitted:', data);
  setShowCostApprovalModal(false);
 };

 const handleSaveAlerts = (data: any) => {
  console.log('Alert settings saved:', data);
  setShowCostAlertModal(false);
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
    {/* Header Section */}
    <div className="mb-3">
     <h1 className="text-3xl font-bold text-gray-900">Project Costing Management</h1>
     <p className="text-gray-600 mt-2">Track and analyze project costs, budgets, and financial performance across all projects.</p>
    </div>

    {/* Header Actions */}
    <div className="flex justify-end gap-3 mb-2">
     <button
      onClick={() => setShowCostComparisonModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
     >
      <BarChart3 className="h-5 w-5" />
      <span>Compare Projects</span>
     </button>
     <button
      onClick={() => setShowCostAlertModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
     >
      <AlertTriangle className="h-5 w-5" />
      <span>Cost Alerts</span>
     </button>
     <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
      <Filter className="h-5 w-5" />
      <span>Filter</span>
     </button>
     <button
      onClick={() => setShowExportModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
     >
      <Download className="h-5 w-5" />
      <span>Export</span>
     </button>
    </div>

    {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Projects</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
      </div>
      <BarChart3 className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Active</p>
       <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
      </div>
      <TrendingUp className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Completed</p>
       <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Over Budget</p>
       <p className="text-2xl font-bold text-red-600">{stats.overBudgetProjects}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Budget</p>
       <p className="text-2xl font-bold text-gray-900">₹{(stats.totalBudget / 10000000).toFixed(1)}Cr</p>
      </div>
      <DollarSign className="h-8 w-8 text-purple-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Actual Cost</p>
       <p className="text-2xl font-bold text-gray-900">₹{(stats.totalActual / 10000000).toFixed(1)}Cr</p>
      </div>
      <DollarSign className="h-8 w-8 text-cyan-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Variance</p>
       <p className={`text-2xl font-bold ${getVarianceColor(stats.totalVariance)}`}>
        {stats.totalVariance > 0 ? '+' : ''}₹{(Math.abs(stats.totalVariance) / 100000).toFixed(1)}L
       </p>
      </div>
      {stats.totalVariance >= 0 ? (
       <TrendingUp className="h-8 w-8 text-green-600" />
      ) : (
       <TrendingDown className="h-8 w-8 text-red-600" />
      )}
     </div>
    </div>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg border border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
     <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <input
       type="text"
       placeholder="Search by project name, ID, customer..."
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
       <option value="In Progress">In Progress</option>
       <option value="Completed">Completed</option>
       <option value="On Hold">On Hold</option>
      </select>
     </div>
    </div>
   </div>

   {/* Projects Grid */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {paginatedProjects.map((project) => (
     <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
       <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
         <h3 className="text-lg font-bold text-gray-900">{project.projectId}</h3>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status}
         </span>
        </div>
        <p className="text-sm text-gray-600">{project.projectName}</p>
        <p className="text-xs text-gray-500">{project.customer}</p>
       </div>
       <button
        onClick={() => setSelectedProject(project)}
        className="text-blue-600 hover:text-blue-800"
       >
        <Eye className="h-5 w-5" />
       </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
       <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">Progress</span>
        <span className="text-xs font-semibold text-gray-900">{project.progress}%</span>
       </div>
       <div className="w-full bg-gray-200 rounded-full h-2">
        <div
         className="bg-blue-600 h-2 rounded-full"
         style={{ width: `${project.progress}%` }}
        ></div>
       </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-2 gap-2 mb-2">
       <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500">Total Budget</p>
        <p className="text-lg font-bold text-gray-900">₹{(project.totalBudget / 100000).toFixed(2)}L</p>
       </div>
       <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500">Actual Cost</p>
        <p className="text-lg font-bold text-gray-900">₹{(project.actualCost / 100000).toFixed(2)}L</p>
       </div>
       <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500">Forecasted</p>
        <p className="text-lg font-bold text-gray-900">₹{(project.forecastedCost / 100000).toFixed(2)}L</p>
       </div>
       <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-xs text-gray-500">Variance</p>
        <p className={`text-lg font-bold ${getVarianceColor(project.variance)}`}>
         {project.variance > 0 ? '+' : ''}₹{(Math.abs(project.variance) / 100000).toFixed(2)}L
        </p>
        <p className={`text-xs font-semibold ${getVarianceColor(project.variance)}`}>
         ({project.variancePercent > 0 ? '+' : ''}{project.variancePercent.toFixed(1)}%)
        </p>
       </div>
      </div>

      {/* Cost Utilization Bar */}
      <div className="mb-2">
       <p className="text-xs text-gray-600 mb-2">Budget Utilization</p>
       <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
        <div
         className={`absolute inset-y-0 left-0 ${
          project.actualCost / project.totalBudget > 1
           ? 'bg-red-500'
           : project.actualCost / project.totalBudget > 0.9
           ? 'bg-yellow-500'
           : 'bg-green-500'
         }`}
         style={{ width: `${Math.min((project.actualCost / project.totalBudget) * 100, 100)}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
         {((project.actualCost / project.totalBudget) * 100).toFixed(1)}% Utilized
        </div>
       </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
       <div className="text-center p-2 bg-blue-50 rounded">
        <p className="text-gray-600">Committed</p>
        <p className="font-semibold text-gray-900">₹{(project.committedCost / 100000).toFixed(1)}L</p>
       </div>
       <div className="text-center p-2 bg-purple-50 rounded">
        <p className="text-gray-600">Profit Margin</p>
        <p className="font-semibold text-gray-900">{project.profitMargin}%</p>
       </div>
       <div className="text-center p-2 bg-green-50 rounded">
        <p className="text-gray-600">Actual Profit</p>
        <p className={`font-semibold ${project.actualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
         ₹{(Math.abs(project.actualProfit) / 100000).toFixed(1)}L
        </p>
       </div>
      </div>

      {/* Action Buttons - First Row */}
      <div className="grid grid-cols-6 gap-2 mb-2">
       <button
        onClick={() => handleCostBreakdown(project)}
        className="flex flex-col items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        title="Cost Breakdown"
       >
        <PieChart className="h-4 w-4 text-blue-600 mb-1" />
        <span className="text-xs text-blue-700">Breakdown</span>
       </button>
       <button
        onClick={() => handleAddCost(project)}
        className="flex flex-col items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        title="Add Cost"
       >
        <Plus className="h-4 w-4 text-green-600 mb-1" />
        <span className="text-xs text-green-700">Add Cost</span>
       </button>
       <button
        onClick={() => handleVarianceAnalysis(project)}
        className="flex flex-col items-center justify-center p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
        title="Variance Analysis"
       >
        <TrendingUp className="h-4 w-4 text-orange-600 mb-1" />
        <span className="text-xs text-orange-700">Variance</span>
       </button>
       <button
        onClick={() => handleProfitMargin(project)}
        className="flex flex-col items-center justify-center p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        title="Profit Margin"
       >
        <Target className="h-4 w-4 text-indigo-600 mb-1" />
        <span className="text-xs text-indigo-700">Profit</span>
       </button>
       <button
        onClick={() => handleForecast(project)}
        className="flex flex-col items-center justify-center p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        title="Forecast"
       >
        <Calculator className="h-4 w-4 text-purple-600 mb-1" />
        <span className="text-xs text-purple-700">Forecast</span>
       </button>
       <button
        onClick={() => handleResourceCost(project)}
        className="flex flex-col items-center justify-center p-2 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
        title="Resource Cost"
       >
        <Users className="h-4 w-4 text-teal-600 mb-1" />
        <span className="text-xs text-teal-700">Resource</span>
       </button>
      </div>

      {/* Action Buttons - Second Row */}
      <div className="grid grid-cols-3 gap-2">
       <button
        onClick={() => handleViewHistory(project)}
        className="flex items-center justify-center gap-1 p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        title="View History"
       >
        <History className="h-4 w-4 text-indigo-600" />
        <span className="text-xs text-indigo-700">History</span>
       </button>
       <button
        onClick={() => handleGenerateReport(project)}
        className="flex items-center justify-center gap-1 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        title="Generate Report"
       >
        <FileText className="h-4 w-4 text-gray-600" />
        <span className="text-xs text-gray-700">Report</span>
       </button>
       <button
        onClick={() => handleSubmitApproval(project)}
        className="flex items-center justify-center gap-1 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
        title="Submit Approval"
       >
        <Lock className="h-4 w-4 text-purple-600" />
        <span className="text-xs text-purple-700">Approval</span>
       </button>
      </div>
     </div>
    ))}
   </div>

   {/* Pagination */}
   <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
     <div className="text-sm text-gray-700">
      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
      <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredProjects.length)}</span> of{' '}
      <span className="font-medium">{filteredProjects.length}</span> projects
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

   {/* All Modals */}
   <CostBreakdownModal
    isOpen={showCostBreakdownModal}
    onClose={() => setShowCostBreakdownModal(false)}
    project={selectedProject}
   />

   <AddCostEntryModal
    isOpen={showAddCostEntryModal}
    onClose={() => setShowAddCostEntryModal(false)}
    project={selectedProject}
    onAdd={handleAddCostEntry}
   />

   <CostVarianceModal
    isOpen={showCostVarianceModal}
    onClose={() => setShowCostVarianceModal(false)}
    project={selectedProject}
   />

   <ProfitMarginModal
    isOpen={showProfitMarginModal}
    onClose={() => setShowProfitMarginModal(false)}
    project={selectedProject}
   />

   <CostForecastModal
    isOpen={showCostForecastModal}
    onClose={() => setShowCostForecastModal(false)}
    project={selectedProject}
   />

   <ResourceCostModal
    isOpen={showResourceCostModal}
    onClose={() => setShowResourceCostModal(false)}
    project={selectedProject}
   />

   <CostComparisonModal
    isOpen={showCostComparisonModal}
    onClose={() => setShowCostComparisonModal(false)}
    projects={mockProjectCosts}
   />

   <CostReportModal
    isOpen={showCostReportModal}
    onClose={() => setShowCostReportModal(false)}
    project={selectedProject}
   />

   <ExportCostDataModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExport}
   />

   <CostHistoryModal
    isOpen={showCostHistoryModal}
    onClose={() => setShowCostHistoryModal(false)}
    project={selectedProject}
   />

   <CostApprovalModal
    isOpen={showCostApprovalModal}
    onClose={() => setShowCostApprovalModal(false)}
    onSubmit={handleApprovalSubmit}
   />

   <CostAlertModal
    isOpen={showCostAlertModal}
    onClose={() => setShowCostAlertModal(false)}
    onSave={handleSaveAlerts}
   />
   </div>
  </div>
 );
}
