'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { PlayCircle, CheckCircle, Clock, AlertCircle, Calendar, FileText, Users, Eye, Plus, Edit, Settings, ClipboardList, MessageSquare, Upload, RefreshCw, Award, UserPlus, PlusCircle, Download, CalendarClock, Network } from 'lucide-react';
import { ScheduleCommissioningModal, EditActivityModal, UpdateTestParametersModal, UpdateChecklistModal, AddObservationsModal, UploadDocumentsModal, UpdateStatusModal, IssueCertificateModal, AssignEngineerModal, AddTestParameterModal, GenerateReportModal, ExportDataModal, RescheduleModal, AddDependenciesModal, ViewFullDetailsModal } from '@/components/project-management/CommissioningModals';

interface CommissioningActivity {
 id: string;
 activityNumber: string;
 projectId: string;
 projectName: string;
 equipmentSystem: string;
 systemCode: string;
 commissioningType: 'Pre-Commissioning' | 'Commissioning' | 'Performance Test' | 'Final Acceptance';
 scheduledDate: string;
 actualDate: string;
 duration: number;
 status: 'Scheduled' | 'In Progress' | 'Completed' | 'Failed' | 'Rescheduled';
 progress: number;
 engineer: string;
 clientRep: string;
 testParameters: TestParameter[];
 checklistItems: ChecklistItem[];
 totalChecks: number;
 passedChecks: number;
 failedChecks: number;
 observations: string;
 recommendations: string;
 certificateIssued: boolean;
 certificateNumber: string;
 nextActivity: string;
 dependencies: string[];
 attachments: number;
}

interface TestParameter {
 parameter: string;
 specification: string;
 actualValue: string;
 result: 'Pass' | 'Fail' | 'NA';
}

interface ChecklistItem {
 item: string;
 status: 'Complete' | 'Incomplete' | 'NA';
}

export default function CommissioningPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterProject, setFilterProject] = useState<string>('all');
 const [selectedActivity, setSelectedActivity] = useState<CommissioningActivity | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showUpdateTestParametersModal, setShowUpdateTestParametersModal] = useState(false);
 const [showUpdateChecklistModal, setShowUpdateChecklistModal] = useState(false);
 const [showAddObservationsModal, setShowAddObservationsModal] = useState(false);
 const [showUploadDocumentsModal, setShowUploadDocumentsModal] = useState(false);
 const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
 const [showIssueCertificateModal, setShowIssueCertificateModal] = useState(false);
 const [showAssignEngineerModal, setShowAssignEngineerModal] = useState(false);
 const [showAddTestParameterModal, setShowAddTestParameterModal] = useState(false);
 const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
 const [showExportDataModal, setShowExportDataModal] = useState(false);
 const [showRescheduleModal, setShowRescheduleModal] = useState(false);
 const [showAddDependenciesModal, setShowAddDependenciesModal] = useState(false);
 const [showViewFullDetailsModal, setShowViewFullDetailsModal] = useState(false);

 const [mockActivities, setMockActivities] = useState<CommissioningActivity[]>([]);
 useEffect(() => {
   projectManagementService.listCommissioningActivities().then((rows) => {
     if (Array.isArray(rows)) setMockActivities(rows as unknown as CommissioningActivity[]);
   });
 }, []);

 const stats = {
  totalActivities: mockActivities.length,
  completed: mockActivities.filter(a => a.status === 'Completed').length,
  inProgress: mockActivities.filter(a => a.status === 'In Progress').length,
  scheduled: mockActivities.filter(a => a.status === 'Scheduled').length,
  failed: mockActivities.filter(a => a.status === 'Failed').length,
  certificatesIssued: mockActivities.filter(a => a.certificateIssued).length,
  avgProgress: (mockActivities.reduce((sum, a) => sum + a.progress, 0) / mockActivities.length).toFixed(1),
 };

 const filteredActivities = mockActivities.filter((activity) => {
  const matchesSearch =
   activity.activityNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   activity.equipmentSystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
   activity.projectName.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || activity.status === filterStatus;
  const matchesProject = filterProject === 'all' || activity.projectId === filterProject;
  return matchesSearch && matchesStatus && matchesProject;
 });

 const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

 const uniqueProjects = Array.from(new Set(mockActivities.map(a => a.projectId)));

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Completed':
    return 'bg-green-100 text-green-800';
   case 'In Progress':
    return 'bg-blue-100 text-blue-800';
   case 'Scheduled':
    return 'bg-gray-100 text-gray-800';
   case 'Failed':
    return 'bg-red-100 text-red-800';
   case 'Rescheduled':
    return 'bg-yellow-100 text-yellow-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getTypeColor = (type: string) => {
  switch (type) {
   case 'Pre-Commissioning':
    return 'bg-purple-100 text-purple-800';
   case 'Commissioning':
    return 'bg-blue-100 text-blue-800';
   case 'Performance Test':
    return 'bg-orange-100 text-orange-800';
   case 'Final Acceptance':
    return 'bg-green-100 text-green-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const handleSchedule = (data: any) => { console.log('Schedule:', data); setShowScheduleModal(false); };
 const handleEdit = (data: any) => { console.log('Edit:', data); setShowEditModal(false); setSelectedActivity(null); };
 const handleUpdateTestParameters = (data: any) => { console.log('Update Test Parameters:', data); setShowUpdateTestParametersModal(false); setSelectedActivity(null); };
 const handleUpdateChecklist = (data: any) => { console.log('Update Checklist:', data); setShowUpdateChecklistModal(false); setSelectedActivity(null); };
 const handleAddObservations = (data: any) => { console.log('Add Observations:', data); setShowAddObservationsModal(false); setSelectedActivity(null); };
 const handleUploadDocuments = (data: any) => { console.log('Upload Documents:', data); setShowUploadDocumentsModal(false); setSelectedActivity(null); };
 const handleUpdateStatus = (data: any) => { console.log('Update Status:', data); setShowUpdateStatusModal(false); setSelectedActivity(null); };
 const handleIssueCertificate = (data: any) => { console.log('Issue Certificate:', data); setShowIssueCertificateModal(false); setSelectedActivity(null); };
 const handleAssignEngineer = (data: any) => { console.log('Assign Engineer:', data); setShowAssignEngineerModal(false); setSelectedActivity(null); };
 const handleAddTestParameter = (data: any) => { console.log('Add Test Parameter:', data); setShowAddTestParameterModal(false); setSelectedActivity(null); };
 const handleGenerateReport = (data: any) => { console.log('Generate Report:', data); setShowGenerateReportModal(false); };
 const handleExportData = (data: any) => { exportToCsv('commissioning-activities', filteredActivities as unknown as Record<string, unknown>[]); setShowExportDataModal(false); };
 const handleReschedule = (data: any) => { console.log('Reschedule:', data); setShowRescheduleModal(false); setSelectedActivity(null); };
 const handleAddDependencies = (data: any) => { console.log('Add Dependencies:', data); setShowAddDependenciesModal(false); setSelectedActivity(null); };
 const openEditModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowEditModal(true); };
 const openUpdateTestParametersModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowUpdateTestParametersModal(true); };
 const openUpdateChecklistModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowUpdateChecklistModal(true); };
 const openAddObservationsModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowAddObservationsModal(true); };
 const openUploadDocumentsModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowUploadDocumentsModal(true); };
 const openUpdateStatusModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowUpdateStatusModal(true); };
 const openIssueCertificateModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowIssueCertificateModal(true); };
 const openAssignEngineerModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowAssignEngineerModal(true); };
 const openAddTestParameterModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowAddTestParameterModal(true); };
 const openRescheduleModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowRescheduleModal(true); };
 const openAddDependenciesModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowAddDependenciesModal(true); };
 const openViewFullDetailsModal = (a: CommissioningActivity) => { setSelectedActivity(a); setShowViewFullDetailsModal(true); };

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex justify-between items-center">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Commissioning Schedule</h1>
     <p className="text-gray-600 mt-1">Equipment and system commissioning tracking</p>
    </div>
    <div className="flex space-x-3">
     <button onClick={() => setShowGenerateReportModal(true)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50">
      <FileText className="h-5 w-5" />
      <span>Generate Report</span>
     </button>
     <button onClick={() => setShowExportDataModal(true)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50">
      <Download className="h-5 w-5" />
      <span>Export Data</span>
     </button>
     <button onClick={() => setShowScheduleModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      <Plus className="h-5 w-5" />
      <span>Schedule Activity</span>
     </button>
    </div>
   </div>

   {/* Statistics Cards */}
   <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Total Activities</p>
       <p className="text-2xl font-bold text-gray-900">{stats.totalActivities}</p>
      </div>
      <PlayCircle className="h-8 w-8 text-blue-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Completed</p>
       <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
      </div>
      <CheckCircle className="h-8 w-8 text-green-600" />
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
       <p className="text-sm text-gray-600">Scheduled</p>
       <p className="text-2xl font-bold text-gray-600">{stats.scheduled}</p>
      </div>
      <Calendar className="h-8 w-8 text-gray-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Failed</p>
       <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
      </div>
      <AlertCircle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Certificates</p>
       <p className="text-2xl font-bold text-purple-600">{stats.certificatesIssued}</p>
      </div>
      <FileText className="h-8 w-8 text-purple-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Avg Progress</p>
       <p className="text-2xl font-bold text-indigo-600">{stats.avgProgress}%</p>
      </div>
      <Users className="h-8 w-8 text-indigo-600" />
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
       placeholder="Search by activity, equipment, project..."
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
       <option value="Scheduled">Scheduled</option>
       <option value="In Progress">In Progress</option>
       <option value="Completed">Completed</option>
       <option value="Failed">Failed</option>
       <option value="Rescheduled">Rescheduled</option>
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

   {/* Commissioning Activities Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Activity / System
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Type / Date
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Progress
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Test Results
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
       {paginatedActivities.map((activity) => (
        <tr key={activity.id} className="hover:bg-gray-50">
         <td className="px-4 py-4">
          <div>
           <div className="text-sm font-medium text-gray-900">{activity.activityNumber}</div>
           <div className="text-sm text-gray-600">{activity.equipmentSystem}</div>
           <div className="text-xs text-gray-500">{activity.systemCode}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{activity.projectId}</div>
          <div className="text-xs text-gray-500">{activity.projectName}</div>
         </td>
         <td className="px-4 py-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${getTypeColor(activity.commissioningType)}`}>
           {activity.commissioningType}
          </span>
          <div className="text-xs text-gray-500">
           <div>Scheduled: {activity.scheduledDate}</div>
           {activity.actualDate && <div className="text-blue-600">Actual: {activity.actualDate}</div>}
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="flex flex-col items-center">
           <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
             className={`h-2 rounded-full ${
              activity.status === 'Completed' ? 'bg-green-600' :
              activity.status === 'Failed' ? 'bg-red-600' :
              activity.status === 'In Progress' ? 'bg-blue-600' :
              'bg-gray-400'
             }`}
             style={{ width: `${activity.progress}%` }}
            ></div>
           </div>
           <span className="text-xs font-semibold text-gray-900">{activity.progress}%</span>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-xs">
           <div className="text-green-600">✓ Passed: {activity.passedChecks}</div>
           <div className="text-red-600">✗ Failed: {activity.failedChecks}</div>
           <div className="text-gray-500">Total: {activity.totalChecks}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
           {activity.status}
          </span>
          {activity.certificateIssued && (
           <div className="text-xs text-green-600 mt-1 flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            {activity.certificateNumber}
           </div>
          )}
         </td>
         <td className="px-4 py-4">
          <div className="flex items-center justify-center space-x-1">
           <button onClick={() => openViewFullDetailsModal(activity)} className="p-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100" title="View Details"><Eye className="h-4 w-4" /></button>
           <button onClick={() => openEditModal(activity)} className="p-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100" title="Edit"><Edit className="h-4 w-4" /></button>
           <button onClick={() => openUpdateTestParametersModal(activity)} className="p-1.5 bg-purple-50 text-purple-700 rounded hover:bg-purple-100" title="Test Parameters"><Settings className="h-4 w-4" /></button>
           <button onClick={() => openUpdateChecklistModal(activity)} className="p-1.5 bg-orange-50 text-orange-700 rounded hover:bg-orange-100" title="Checklist"><ClipboardList className="h-4 w-4" /></button>
           <button onClick={() => openAddObservationsModal(activity)} className="p-1.5 bg-teal-50 text-teal-700 rounded hover:bg-teal-100" title="Observations"><MessageSquare className="h-4 w-4" /></button>
           <button onClick={() => openUploadDocumentsModal(activity)} className="p-1.5 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100" title="Upload Documents"><Upload className="h-4 w-4" /></button>
           <button onClick={() => openUpdateStatusModal(activity)} className="p-1.5 bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100" title="Update Status"><RefreshCw className="h-4 w-4" /></button>
           <button onClick={() => openIssueCertificateModal(activity)} className="p-1.5 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100" title="Issue Certificate"><Award className="h-4 w-4" /></button>
           <button onClick={() => openAssignEngineerModal(activity)} className="p-1.5 bg-cyan-50 text-cyan-700 rounded hover:bg-cyan-100" title="Assign Engineer"><UserPlus className="h-4 w-4" /></button>
           <button onClick={() => openRescheduleModal(activity)} className="p-1.5 bg-rose-50 text-rose-700 rounded hover:bg-rose-100" title="Reschedule"><CalendarClock className="h-4 w-4" /></button>
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
       <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredActivities.length)}</span> of{' '}
       <span className="font-medium">{filteredActivities.length}</span> activities
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

   <ScheduleCommissioningModal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} onSchedule={handleSchedule} />
   <EditActivityModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedActivity(null); }} onEdit={handleEdit} activity={selectedActivity} />
   <UpdateTestParametersModal isOpen={showUpdateTestParametersModal} onClose={() => { setShowUpdateTestParametersModal(false); setSelectedActivity(null); }} onUpdate={handleUpdateTestParameters} activity={selectedActivity} />
   <UpdateChecklistModal isOpen={showUpdateChecklistModal} onClose={() => { setShowUpdateChecklistModal(false); setSelectedActivity(null); }} onUpdate={handleUpdateChecklist} activity={selectedActivity} />
   <AddObservationsModal isOpen={showAddObservationsModal} onClose={() => { setShowAddObservationsModal(false); setSelectedActivity(null); }} onAdd={handleAddObservations} activity={selectedActivity} />
   <UploadDocumentsModal isOpen={showUploadDocumentsModal} onClose={() => { setShowUploadDocumentsModal(false); setSelectedActivity(null); }} onUpload={handleUploadDocuments} activity={selectedActivity} />
   <UpdateStatusModal isOpen={showUpdateStatusModal} onClose={() => { setShowUpdateStatusModal(false); setSelectedActivity(null); }} onUpdate={handleUpdateStatus} activity={selectedActivity} />
   <IssueCertificateModal isOpen={showIssueCertificateModal} onClose={() => { setShowIssueCertificateModal(false); setSelectedActivity(null); }} onIssue={handleIssueCertificate} activity={selectedActivity} />
   <AssignEngineerModal isOpen={showAssignEngineerModal} onClose={() => { setShowAssignEngineerModal(false); setSelectedActivity(null); }} onAssign={handleAssignEngineer} activity={selectedActivity} />
   <AddTestParameterModal isOpen={showAddTestParameterModal} onClose={() => { setShowAddTestParameterModal(false); setSelectedActivity(null); }} onAdd={handleAddTestParameter} activity={selectedActivity} />
   <GenerateReportModal isOpen={showGenerateReportModal} onClose={() => setShowGenerateReportModal(false)} onGenerate={handleGenerateReport} />
   <ExportDataModal isOpen={showExportDataModal} onClose={() => setShowExportDataModal(false)} onExport={handleExportData} />
   <RescheduleModal isOpen={showRescheduleModal} onClose={() => { setShowRescheduleModal(false); setSelectedActivity(null); }} onReschedule={handleReschedule} activity={selectedActivity} />
   <AddDependenciesModal isOpen={showAddDependenciesModal} onClose={() => { setShowAddDependenciesModal(false); setSelectedActivity(null); }} onAdd={handleAddDependencies} activity={selectedActivity} />
   <ViewFullDetailsModal isOpen={showViewFullDetailsModal} onClose={() => { setShowViewFullDetailsModal(false); setSelectedActivity(null); }} activity={selectedActivity} />
  </div>
 );
}
