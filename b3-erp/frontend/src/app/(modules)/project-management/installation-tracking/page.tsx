'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { exportToCsv } from '@/lib/export';
import { Wrench, CheckCircle, Clock, AlertTriangle, TrendingUp, Calendar, Users, Eye, Plus, Edit, Upload, Package, Link, FileText, Download } from 'lucide-react';
import {
 AddInstallationActivityModal,
 EditInstallationActivityModal,
 UpdateProgressModal,
 UploadPhotosModal,
 MarkSafetyChecklistModal,
 MarkQualityCheckpointModal,
 ReportIssueModal,
 UpdateStatusModal,
 AssignTeamModal,
 ScheduleActivityModal,
 UpdateMaterialsModal,
 AddDependenciesModal,
 GenerateReportModal,
 ExportDataModal,
 ViewFullDetailsModal,
} from '@/components/project-management/InstallationTrackingModals';

interface InstallationActivity {
 id: string;
 activityNumber: string;
 projectId: string;
 projectName: string;
 equipmentItem: string;
 equipmentCode: string;
 location: string;
 zone: string;
 installationType: 'New Installation' | 'Replacement' | 'Modification' | 'Upgrade';
 plannedStartDate: string;
 plannedEndDate: string;
 actualStartDate: string;
 actualEndDate: string;
 status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Delayed';
 progress: number;
 assignedTeam: string;
 teamSize: number;
 supervisor: string;
 dependencies: string[];
 prerequisitesCompleted: boolean;
 materialAvailability: 'Available' | 'Partial' | 'Not Available';
 toolsRequired: string[];
 safetyChecklist: boolean;
 qualityCheckpoint: boolean;
 photos: number;
 remarks: string;
 issues: string[];
 delayReason: string;
}

export default function InstallationTrackingPage() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('all');
 const [filterProject, setFilterProject] = useState<string>('all');
 const [selectedActivity, setSelectedActivity] = useState<InstallationActivity | null>(null);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 10;

 // Modal states
 const [showAddModal, setShowAddModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showProgressModal, setShowProgressModal] = useState(false);
 const [showPhotosModal, setShowPhotosModal] = useState(false);
 const [showSafetyModal, setShowSafetyModal] = useState(false);
 const [showQualityModal, setShowQualityModal] = useState(false);
 const [showIssueModal, setShowIssueModal] = useState(false);
 const [showStatusModal, setShowStatusModal] = useState(false);
 const [showTeamModal, setShowTeamModal] = useState(false);
 const [showScheduleModal, setShowScheduleModal] = useState(false);
 const [showMaterialsModal, setShowMaterialsModal] = useState(false);
 const [showDependenciesModal, setShowDependenciesModal] = useState(false);
 const [showReportModal, setShowReportModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);

 const [mockActivities, setMockActivities] = useState<InstallationActivity[]>([
  {
   id: 'INST-001',
   activityNumber: 'INST-2025-001',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   equipmentItem: 'Gas Cooking Range - 6 Burner',
   equipmentCode: 'EQ-CK-001',
   location: 'Main Kitchen - Cooking Section',
   zone: 'Zone A',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-20',
   plannedEndDate: '2025-01-22',
   actualStartDate: '2025-01-20',
   actualEndDate: '2025-01-22',
   status: 'Completed',
   progress: 100,
   assignedTeam: 'Installation Team A',
   teamSize: 4,
   supervisor: 'Ramesh Kumar',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Wrench Set', 'Gas Leak Detector', 'Spirit Level', 'Pipe Cutter'],
   safetyChecklist: true,
   qualityCheckpoint: true,
   photos: 12,
   remarks: 'Installation completed successfully. Gas connections tested and certified.',
   issues: [],
   delayReason: '',
  },
  {
   id: 'INST-002',
   activityNumber: 'INST-2025-002',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   equipmentItem: 'Exhaust Hood with Filters',
   equipmentCode: 'EQ-EX-001',
   location: 'Main Kitchen - Cooking Section',
   zone: 'Zone A',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-23',
   plannedEndDate: '2025-01-25',
   actualStartDate: '2025-01-23',
   actualEndDate: '',
   status: 'In Progress',
   progress: 65,
   assignedTeam: 'Installation Team A',
   teamSize: 5,
   supervisor: 'Ramesh Kumar',
   dependencies: ['INST-2025-001'],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Ladder', 'Drilling Machine', 'Welding Equipment', 'Safety Harness'],
   safetyChecklist: true,
   qualityCheckpoint: false,
   photos: 8,
   remarks: 'Hood mounting in progress. Ducting installation scheduled for tomorrow.',
   issues: ['Minor delay due to additional anchor points requirement'],
   delayReason: '',
  },
  {
   id: 'INST-003',
   activityNumber: 'INST-2025-003',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   equipmentItem: 'PUF Insulation Panels - Walls',
   equipmentCode: 'EQ-CR-010',
   location: 'Warehouse - Cold Storage Area',
   zone: 'Zone B',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-18',
   plannedEndDate: '2025-01-20',
   actualStartDate: '2025-01-18',
   actualEndDate: '2025-01-21',
   status: 'Completed',
   progress: 100,
   assignedTeam: 'Cold Room Team',
   teamSize: 6,
   supervisor: 'Suresh Patel',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Panel Lifter', 'Cam-lock Tool', 'Sealant Gun', 'Measuring Tape'],
   safetyChecklist: true,
   qualityCheckpoint: true,
   photos: 15,
   remarks: 'Wall panels installed. Minor delay due to additional sealing work required.',
   issues: [],
   delayReason: 'Additional sealing at corner joints required for better insulation',
  },
  {
   id: 'INST-004',
   activityNumber: 'INST-2025-004',
   projectId: 'PRJ-2025-002',
   projectName: 'BigBasket - Cold Room Installation',
   equipmentItem: 'Refrigeration Compressor Unit',
   equipmentCode: 'EQ-CR-020',
   location: 'Warehouse - Compressor Room',
   zone: 'Zone C',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-22',
   plannedEndDate: '2025-01-24',
   actualStartDate: '2025-01-22',
   actualEndDate: '',
   status: 'In Progress',
   progress: 45,
   assignedTeam: 'Refrigeration Specialists',
   teamSize: 3,
   supervisor: 'Venkat Rao',
   dependencies: ['INST-2025-003'],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Refrigerant Charging Kit', 'Vacuum Pump', 'Pressure Gauges', 'Pipe Flaring Tool'],
   safetyChecklist: true,
   qualityCheckpoint: false,
   photos: 6,
   remarks: 'Compressor mounting completed. Piping work in progress.',
   issues: [],
   delayReason: '',
  },
  {
   id: 'INST-005',
   activityNumber: 'INST-2025-005',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   equipmentItem: 'Commercial Dishwasher',
   equipmentCode: 'EQ-DW-001',
   location: 'Cafeteria - Dishwashing Area',
   zone: 'Zone D',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-25',
   plannedEndDate: '2025-01-27',
   actualStartDate: '',
   actualEndDate: '',
   status: 'Not Started',
   progress: 0,
   assignedTeam: 'Installation Team B',
   teamSize: 4,
   supervisor: 'Vijay Sharma',
   dependencies: ['INST-2025-010'],
   prerequisitesCompleted: false,
   materialAvailability: 'Partial',
   toolsRequired: ['Plumbing Tools', 'Electrical Tools', 'Spirit Level'],
   safetyChecklist: false,
   qualityCheckpoint: false,
   photos: 0,
   remarks: 'Awaiting completion of plumbing and electrical rough-in work.',
   issues: ['Dependency not completed', 'Hot water supply pending'],
   delayReason: '',
  },
  {
   id: 'INST-006',
   activityNumber: 'INST-2025-006',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   equipmentItem: 'HVAC Duct Installation',
   equipmentCode: 'EQ-HV-015',
   location: 'Cafeteria - Kitchen Area',
   zone: 'Zone A-D',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-15',
   plannedEndDate: '2025-01-20',
   actualStartDate: '2025-01-15',
   actualEndDate: '2025-01-23',
   status: 'Completed',
   progress: 100,
   assignedTeam: 'HVAC Team',
   teamSize: 8,
   supervisor: 'Anil Joshi',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Sheet Metal Tools', 'Riveting Machine', 'Scaffolding', 'Measuring Tools'],
   safetyChecklist: true,
   qualityCheckpoint: true,
   photos: 20,
   remarks: 'Duct installation completed with leak testing. Delay due to rectification work.',
   issues: ['Initial leakage detected at 2 joints - rectified'],
   delayReason: 'Duct leakage rectification required 3 additional days',
  },
  {
   id: 'INST-007',
   activityNumber: 'INST-2025-007',
   projectId: 'PRJ-2025-004',
   projectName: 'ITC Grand - Bakery Equipment Setup',
   equipmentItem: 'Deck Oven - 3 Deck Electric',
   equipmentCode: 'EQ-BK-005',
   location: 'Bakery - Baking Section',
   zone: 'Zone A',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-12',
   plannedEndDate: '2025-01-14',
   actualStartDate: '2025-01-12',
   actualEndDate: '2025-01-14',
   status: 'Completed',
   progress: 100,
   assignedTeam: 'Bakery Equipment Team',
   teamSize: 3,
   supervisor: 'Amit Singh',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Heavy Lifting Equipment', 'Electrical Tools', 'Calibration Tools'],
   safetyChecklist: true,
   qualityCheckpoint: true,
   photos: 10,
   remarks: 'Oven installed, leveled, and calibrated. Temperature tests completed successfully.',
   issues: [],
   delayReason: '',
  },
  {
   id: 'INST-008',
   activityNumber: 'INST-2025-008',
   projectId: 'PRJ-2025-005',
   projectName: 'Godrej Properties - Modular Kitchen',
   equipmentItem: 'Base Cabinet Units with Drawers',
   equipmentCode: 'EQ-MK-010',
   location: 'Sample Flat - Kitchen',
   zone: 'Zone A',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-18',
   plannedEndDate: '2025-01-20',
   actualStartDate: '2025-01-18',
   actualEndDate: '2025-01-20',
   status: 'Completed',
   progress: 100,
   assignedTeam: 'Carpentry Team',
   teamSize: 4,
   supervisor: 'Ravi Shankar',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Drilling Machine', 'Spirit Level', 'Screwdriver Set', 'Measuring Tape'],
   safetyChecklist: true,
   qualityCheckpoint: true,
   photos: 8,
   remarks: 'Base cabinets installed and leveled. Soft-close mechanisms tested.',
   issues: [],
   delayReason: '',
  },
  {
   id: 'INST-009',
   activityNumber: 'INST-2025-009',
   projectId: 'PRJ-2025-006',
   projectName: 'Siemens - Switchgear Manufacturing Unit',
   equipmentItem: 'Assembly Line Conveyor System',
   equipmentCode: 'EQ-SG-025',
   location: 'Factory - Assembly Bay',
   zone: 'Zone A',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-10',
   plannedEndDate: '2025-01-18',
   actualStartDate: '2025-01-10',
   actualEndDate: '',
   status: 'Delayed',
   progress: 70,
   assignedTeam: 'Industrial Equipment Team',
   teamSize: 10,
   supervisor: 'Deepak Shah',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Partial',
   toolsRequired: ['Heavy Machinery Tools', 'Alignment Tools', 'Electrical Testing Equipment'],
   safetyChecklist: true,
   qualityCheckpoint: false,
   photos: 15,
   remarks: 'Conveyor installation 70% complete. Delay due to alignment issues and missing components.',
   issues: ['Precision alignment taking longer than expected', 'Some components arrived damaged'],
   delayReason: 'Precision alignment issues and component replacement delay',
  },
  {
   id: 'INST-010',
   activityNumber: 'INST-2025-010',
   projectId: 'PRJ-2025-003',
   projectName: 'L&T Campus - Industrial Kitchen',
   equipmentItem: 'Plumbing Rough-in Work',
   equipmentCode: 'WORK-PL-001',
   location: 'Cafeteria - All Areas',
   zone: 'Zone A-D',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-12',
   plannedEndDate: '2025-01-18',
   actualStartDate: '2025-01-12',
   actualEndDate: '',
   status: 'In Progress',
   progress: 85,
   assignedTeam: 'Plumbing Team',
   teamSize: 6,
   supervisor: 'Dinesh Kumar',
   dependencies: [],
   prerequisitesCompleted: true,
   materialAvailability: 'Available',
   toolsRequired: ['Pipe Threading Machine', 'Welding Equipment', 'Pressure Testing Kit'],
   safetyChecklist: true,
   qualityCheckpoint: false,
   photos: 12,
   remarks: 'Main piping 85% complete. Final connections and testing pending.',
   issues: [],
   delayReason: '',
  },
  {
   id: 'INST-011',
   activityNumber: 'INST-2025-011',
   projectId: 'PRJ-2025-008',
   projectName: 'Marriott Hotel - Kitchen Renovation',
   equipmentItem: 'Walk-in Cooler Installation',
   equipmentCode: 'EQ-RF-008',
   location: 'Kitchen - Storage Area',
   zone: 'Zone B',
   installationType: 'Replacement',
   plannedStartDate: '2025-01-20',
   plannedEndDate: '2025-01-25',
   actualStartDate: '',
   actualEndDate: '',
   status: 'On Hold',
   progress: 0,
   assignedTeam: 'Refrigeration Team',
   teamSize: 4,
   supervisor: 'Naveen Kumar',
   dependencies: ['DEMO-2025-001'],
   prerequisitesCompleted: false,
   materialAvailability: 'Available',
   toolsRequired: ['Refrigeration Tools', 'Panel Installation Tools', 'Electrical Tools'],
   safetyChecklist: false,
   qualityCheckpoint: false,
   photos: 0,
   remarks: 'On hold awaiting demolition of old cooler. Hotel operations constraint.',
   issues: ['Demolition delayed due to hotel operational requirements'],
   delayReason: '',
  },
  {
   id: 'INST-012',
   activityNumber: 'INST-2025-012',
   projectId: 'PRJ-2025-001',
   projectName: 'Taj Hotels - Commercial Kitchen Setup',
   equipmentItem: 'Stainless Steel Work Tables',
   equipmentCode: 'EQ-WT-005',
   location: 'Main Kitchen - Prep Area',
   zone: 'Zone B',
   installationType: 'New Installation',
   plannedStartDate: '2025-01-24',
   plannedEndDate: '2025-01-25',
   actualStartDate: '',
   actualEndDate: '',
   status: 'Not Started',
   progress: 0,
   assignedTeam: 'Installation Team A',
   teamSize: 3,
   supervisor: 'Ramesh Kumar',
   dependencies: ['INST-2025-002'],
   prerequisitesCompleted: false,
   materialAvailability: 'Available',
   toolsRequired: ['Basic Hand Tools', 'Spirit Level', 'Adjustable Wrench'],
   safetyChecklist: false,
   qualityCheckpoint: false,
   photos: 0,
   remarks: 'Scheduled to start after exhaust hood installation completion.',
   issues: [],
   delayReason: '',
  },
 ]);

 useEffect(() => {
  projectManagementService.listInstallationActivities()
   .then((rows) => { if (Array.isArray(rows) && rows.length > 0) setMockActivities(rows as unknown as InstallationActivity[]); })
   .catch(() => { /* keep seed data on error */ });
 }, []);

 const stats = {
  totalActivities: mockActivities.length,
  completed: mockActivities.filter(a => a.status === 'Completed').length,
  inProgress: mockActivities.filter(a => a.status === 'In Progress').length,
  notStarted: mockActivities.filter(a => a.status === 'Not Started').length,
  delayed: mockActivities.filter(a => a.status === 'Delayed').length,
  onHold: mockActivities.filter(a => a.status === 'On Hold').length,
  avgProgress: (mockActivities.reduce((sum, a) => sum + a.progress, 0) / mockActivities.length).toFixed(1),
 };

 const filteredActivities = mockActivities.filter((activity) => {
  const matchesSearch =
   activity.activityNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
   activity.equipmentItem.toLowerCase().includes(searchQuery.toLowerCase()) ||
   activity.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
   activity.location.toLowerCase().includes(searchQuery.toLowerCase());
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
   case 'Not Started':
    return 'bg-gray-100 text-gray-800';
   case 'Delayed':
    return 'bg-red-100 text-red-800';
   case 'On Hold':
    return 'bg-yellow-100 text-yellow-800';
   default:
    return 'bg-gray-100 text-gray-800';
  }
 };

 const getStatusIcon = (status: string) => {
  switch (status) {
   case 'Completed':
    return <CheckCircle className="h-5 w-5 text-green-600" />;
   case 'In Progress':
    return <Clock className="h-5 w-5 text-blue-600" />;
   case 'Delayed':
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
   case 'On Hold':
    return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
   default:
    return <Clock className="h-5 w-5 text-gray-600" />;
  }
 };

 // Handler functions
 const handleAddActivity = (data: any) => {
  console.log('Adding activity:', data);
  setShowAddModal(false);
 };

 const handleEditActivity = (data: any) => {
  console.log('Editing activity:', data);
  setShowEditModal(false);
  setSelectedActivity(null);
 };

 const handleUpdateProgress = (data: any) => {
  console.log('Updating progress:', data);
  setShowProgressModal(false);
  setSelectedActivity(null);
 };

 const handleUploadPhotos = (files: FileList) => {
  console.log('Uploading photos:', files.length);
  setShowPhotosModal(false);
  setSelectedActivity(null);
 };

 const handleMarkSafety = (data: any) => {
  console.log('Marking safety checklist:', data);
  setShowSafetyModal(false);
  setSelectedActivity(null);
 };

 const handleMarkQuality = (data: any) => {
  console.log('Marking quality checkpoint:', data);
  setShowQualityModal(false);
  setSelectedActivity(null);
 };

 const handleReportIssue = (data: any) => {
  console.log('Reporting issue:', data);
  setShowIssueModal(false);
  setSelectedActivity(null);
 };

 const handleUpdateStatus = (data: any) => {
  console.log('Updating status:', data);
  setShowStatusModal(false);
  setSelectedActivity(null);
 };

 const handleAssignTeam = (data: any) => {
  console.log('Assigning team:', data);
  setShowTeamModal(false);
  setSelectedActivity(null);
 };

 const handleScheduleActivity = (data: any) => {
  console.log('Scheduling activity:', data);
  setShowScheduleModal(false);
  setSelectedActivity(null);
 };

 const handleUpdateMaterials = (data: any) => {
  console.log('Updating materials:', data);
  setShowMaterialsModal(false);
  setSelectedActivity(null);
 };

 const handleAddDependencies = (data: any) => {
  console.log('Adding dependencies:', data);
  setShowDependenciesModal(false);
  setSelectedActivity(null);
 };

 const handleGenerateReport = (data: any) => {
  console.log('Generating report:', data);
  setShowReportModal(false);
 };

 const handleExportData = (data: any) => {
  exportToCsv('installation-tracking', filteredActivities as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 const openEditModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowEditModal(true);
 };

 const openProgressModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowProgressModal(true);
 };

 const openPhotosModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowPhotosModal(true);
 };

 const openSafetyModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowSafetyModal(true);
 };

 const openQualityModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowQualityModal(true);
 };

 const openIssueModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowIssueModal(true);
 };

 const openStatusModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowStatusModal(true);
 };

 const openTeamModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowTeamModal(true);
 };

 const openScheduleModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowScheduleModal(true);
 };

 const openMaterialsModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowMaterialsModal(true);
 };

 const openDependenciesModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowDependenciesModal(true);
 };

 const openDetailsModal = (activity: InstallationActivity) => {
  setSelectedActivity(activity);
  setShowDetailsModal(true);
 };

 return (
  <div className="p-6 space-y-3">
   {/* Header */}
   <div className="flex justify-between items-center">
    <div>
     <h1 className="text-3xl font-bold text-gray-900">Installation Tracking</h1>
     <p className="text-gray-600 mt-1">Real-time equipment installation progress monitoring</p>
    </div>
    <div className="flex flex-wrap gap-3">
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
      onClick={() => setShowAddModal(true)}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
     >
      <Plus className="h-5 w-5" />
      <span>Add Activity</span>
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
      <Wrench className="h-8 w-8 text-blue-600" />
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
       <p className="text-sm text-gray-600">Not Started</p>
       <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
      </div>
      <Calendar className="h-8 w-8 text-gray-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Delayed</p>
       <p className="text-2xl font-bold text-red-600">{stats.delayed}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-red-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">On Hold</p>
       <p className="text-2xl font-bold text-yellow-600">{stats.onHold}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-yellow-600" />
     </div>
    </div>
    <div className="bg-white p-3 rounded-lg border border-gray-200">
     <div className="flex items-center justify-between">
      <div>
       <p className="text-sm text-gray-600">Avg Progress</p>
       <p className="text-2xl font-bold text-purple-600">{stats.avgProgress}%</p>
      </div>
      <TrendingUp className="h-8 w-8 text-purple-600" />
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
       placeholder="Search by activity, equipment, project, location..."
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
       <option value="Not Started">Not Started</option>
       <option value="In Progress">In Progress</option>
       <option value="Completed">Completed</option>
       <option value="Delayed">Delayed</option>
       <option value="On Hold">On Hold</option>
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

   {/* Installation Activities Table */}
   <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Activity / Equipment
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Project / Location
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Timeline
        </th>
        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
         Progress
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Team
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
           <div className="text-sm text-gray-600">{activity.equipmentItem}</div>
           <div className="text-xs text-gray-500">{activity.equipmentCode}</div>
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="text-sm text-gray-900">{activity.projectId}</div>
          <div className="text-xs text-gray-600">{activity.projectName}</div>
          <div className="text-xs text-gray-500">{activity.location}</div>
         </td>
         <td className="px-4 py-4">
          <div className="text-xs text-gray-600">
           <div>Plan: {activity.plannedStartDate} to {activity.plannedEndDate}</div>
           {activity.actualStartDate && (
            <div className="text-blue-600">Actual: {activity.actualStartDate} {activity.actualEndDate ? `to ${activity.actualEndDate}` : '(ongoing)'}</div>
           )}
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="flex flex-col items-center">
           <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
            <div
             className={`h-2 rounded-full ${
              activity.status === 'Completed' ? 'bg-green-600' :
              activity.status === 'Delayed' ? 'bg-red-600' :
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
          <div className="text-sm text-gray-900">{activity.assignedTeam}</div>
          <div className="text-xs text-gray-500">{activity.supervisor}</div>
          <div className="flex items-center text-xs text-gray-500">
           <Users className="h-3 w-3 mr-1" />
           {activity.teamSize} members
          </div>
         </td>
         <td className="px-4 py-4">
          <div className="flex items-center space-x-2">
           {getStatusIcon(activity.status)}
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
            {activity.status}
           </span>
          </div>
          {activity.issues.length > 0 && (
           <div className="text-xs text-red-600 mt-1">
            {activity.issues.length} issue(s)
           </div>
          )}
         </td>
         <td className="px-4 py-4">
          <div className="flex flex-col gap-1">
           <div className="flex items-center justify-center gap-1">
            <button
             onClick={() => openDetailsModal(activity)}
             className="p-1.5 text-slate-600 hover:bg-slate-50 rounded"
             title="View Details"
            >
             <Eye className="h-4 w-4" />
            </button>
            <button
             onClick={() => openEditModal(activity)}
             className="p-1.5 text-green-600 hover:bg-green-50 rounded"
             title="Edit Activity"
            >
             <Edit className="h-4 w-4" />
            </button>
            <button
             onClick={() => openProgressModal(activity)}
             className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
             title="Update Progress"
            >
             <TrendingUp className="h-4 w-4" />
            </button>
            <button
             onClick={() => openPhotosModal(activity)}
             className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
             title="Upload Photos"
            >
             <Upload className="h-4 w-4" />
            </button>
           </div>
           <div className="flex items-center justify-center gap-1">
            <button
             onClick={() => openSafetyModal(activity)}
             className="p-1.5 text-green-600 hover:bg-green-50 rounded"
             title="Safety Checklist"
            >
             <CheckCircle className="h-4 w-4" />
            </button>
            <button
             onClick={() => openQualityModal(activity)}
             className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
             title="Quality Check"
            >
             <CheckCircle className="h-4 w-4" />
            </button>
            <button
             onClick={() => openIssueModal(activity)}
             className="p-1.5 text-red-600 hover:bg-red-50 rounded"
             title="Report Issue"
            >
             <AlertTriangle className="h-4 w-4" />
            </button>
            <button
             onClick={() => openStatusModal(activity)}
             className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
             title="Update Status"
            >
             <AlertTriangle className="h-4 w-4" />
            </button>
           </div>
           <div className="flex items-center justify-center gap-1">
            <button
             onClick={() => openTeamModal(activity)}
             className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded"
             title="Assign Team"
            >
             <Users className="h-4 w-4" />
            </button>
            <button
             onClick={() => openScheduleModal(activity)}
             className="p-1.5 text-pink-600 hover:bg-pink-50 rounded"
             title="Schedule"
            >
             <Calendar className="h-4 w-4" />
            </button>
            <button
             onClick={() => openMaterialsModal(activity)}
             className="p-1.5 text-teal-600 hover:bg-teal-50 rounded"
             title="Materials"
            >
             <Package className="h-4 w-4" />
            </button>
            <button
             onClick={() => openDependenciesModal(activity)}
             className="p-1.5 text-violet-600 hover:bg-violet-50 rounded"
             title="Dependencies"
            >
             <Link className="h-4 w-4" />
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

   {/* Modals */}
   <AddInstallationActivityModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onAdd={handleAddActivity}
   />

   {selectedActivity && (
    <>
     <EditInstallationActivityModal
      isOpen={showEditModal}
      onClose={() => {
       setShowEditModal(false);
       setSelectedActivity(null);
      }}
      onEdit={handleEditActivity}
      activity={selectedActivity}
     />

     <UpdateProgressModal
      isOpen={showProgressModal}
      onClose={() => {
       setShowProgressModal(false);
       setSelectedActivity(null);
      }}
      onUpdate={handleUpdateProgress}
      activity={selectedActivity}
     />

     <UploadPhotosModal
      isOpen={showPhotosModal}
      onClose={() => {
       setShowPhotosModal(false);
       setSelectedActivity(null);
      }}
      onUpload={handleUploadPhotos}
      activity={selectedActivity}
     />

     <MarkSafetyChecklistModal
      isOpen={showSafetyModal}
      onClose={() => {
       setShowSafetyModal(false);
       setSelectedActivity(null);
      }}
      onMark={handleMarkSafety}
      activity={selectedActivity}
     />

     <MarkQualityCheckpointModal
      isOpen={showQualityModal}
      onClose={() => {
       setShowQualityModal(false);
       setSelectedActivity(null);
      }}
      onMark={handleMarkQuality}
      activity={selectedActivity}
     />

     <ReportIssueModal
      isOpen={showIssueModal}
      onClose={() => {
       setShowIssueModal(false);
       setSelectedActivity(null);
      }}
      onReport={handleReportIssue}
      activity={selectedActivity}
     />

     <UpdateStatusModal
      isOpen={showStatusModal}
      onClose={() => {
       setShowStatusModal(false);
       setSelectedActivity(null);
      }}
      onUpdate={handleUpdateStatus}
      activity={selectedActivity}
     />

     <AssignTeamModal
      isOpen={showTeamModal}
      onClose={() => {
       setShowTeamModal(false);
       setSelectedActivity(null);
      }}
      onAssign={handleAssignTeam}
      activity={selectedActivity}
     />

     <ScheduleActivityModal
      isOpen={showScheduleModal}
      onClose={() => {
       setShowScheduleModal(false);
       setSelectedActivity(null);
      }}
      onSchedule={handleScheduleActivity}
      activity={selectedActivity}
     />

     <UpdateMaterialsModal
      isOpen={showMaterialsModal}
      onClose={() => {
       setShowMaterialsModal(false);
       setSelectedActivity(null);
      }}
      onUpdate={handleUpdateMaterials}
      activity={selectedActivity}
     />

     <AddDependenciesModal
      isOpen={showDependenciesModal}
      onClose={() => {
       setShowDependenciesModal(false);
       setSelectedActivity(null);
      }}
      onAdd={handleAddDependencies}
      activity={selectedActivity}
     />

     <ViewFullDetailsModal
      isOpen={showDetailsModal}
      onClose={() => {
       setShowDetailsModal(false);
       setSelectedActivity(null);
      }}
      activity={selectedActivity}
     />
    </>
   )}

   <GenerateReportModal
    isOpen={showReportModal}
    onClose={() => setShowReportModal(false)}
    onGenerate={handleGenerateReport}
   />

   <ExportDataModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExportData}
   />
  </div>
 );
}
