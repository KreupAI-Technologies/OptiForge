'use client';

import { useState } from 'react';
import { exportToCsv } from '@/lib/export';
import { Users, Clock, TrendingUp, AlertTriangle, DollarSign, Calendar, Plus, Download, Filter, Upload, FileText, CheckCircle, XCircle, Activity, Calculator, UserPlus, PieChart, FileBarChart, ClipboardCheck } from 'lucide-react';
import {
  AddLaborEntryModal,
  EditLaborEntryModal,
  ViewLaborDetailsModal,
  ApproveHoursModal,
  RejectHoursModal,
  CalculateEfficiencyModal,
  BulkUploadModal,
  ExportReportModal,
  AssignWorkersModal,
  CalculateCostModal,
  ShiftScheduleModal,
  OvertimeAnalysisModal,
  GenerateTimesheetModal,
  LaborProductivityReportModal,
  MarkAttendanceModal,
} from '@/components/project-management/LaborTrackingModals';

interface LaborEntry {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  workPackage: string;
  laborCategory: 'Skilled' | 'Semi-Skilled' | 'Unskilled' | 'Supervisor' | 'Engineer';
  workersDeployed: number;
  hoursWorked: number;
  overtimeHours: number;
  totalManhours: number;
  plannedManhours: number;
  variance: number;
  hourlyRate: number;
  overtimeRate: number;
  totalCost: number;
  workDescription: string;
  shift: 'Day' | 'Night' | 'General';
  efficiency: number;
  supervisor: string;
  remarks: string;
}

export default function LaborTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAssignWorkersModal, setShowAssignWorkersModal] = useState(false);
  const [showCalculateCostModal, setShowCalculateCostModal] = useState(false);
  const [showShiftScheduleModal, setShowShiftScheduleModal] = useState(false);
  const [showOvertimeAnalysisModal, setShowOvertimeAnalysisModal] = useState(false);
  const [showTimesheetModal, setShowTimesheetModal] = useState(false);
  const [showProductivityReportModal, setShowProductivityReportModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LaborEntry | null>(null);

  const mockLaborEntries: LaborEntry[] = [
    {
      id: 'LT-001',
      date: '2025-01-22',
      projectId: 'PRJ-2025-001',
      projectName: 'Taj Hotels - Commercial Kitchen Setup',
      workPackage: 'WP-001 - Equipment Installation',
      laborCategory: 'Skilled',
      workersDeployed: 8,
      hoursWorked: 64,
      overtimeHours: 8,
      totalManhours: 72,
      plannedManhours: 64,
      variance: 8,
      hourlyRate: 450,
      overtimeRate: 675,
      totalCost: 34200,
      workDescription: 'Installation of cooking ranges and exhaust hoods',
      shift: 'Day',
      efficiency: 88,
      supervisor: 'Ramesh Kumar',
      remarks: 'Overtime due to client requested early completion',
    },
    {
      id: 'LT-002',
      date: '2025-01-22',
      projectId: 'PRJ-2025-002',
      projectName: 'BigBasket - Cold Room Installation',
      workPackage: 'WP-002 - Panel Installation',
      laborCategory: 'Skilled',
      workersDeployed: 6,
      hoursWorked: 48,
      overtimeHours: 0,
      totalManhours: 48,
      plannedManhours: 48,
      variance: 0,
      hourlyRate: 420,
      overtimeRate: 630,
      totalCost: 20160,
      workDescription: 'PUF panel installation and cam-lock fitting',
      shift: 'Day',
      efficiency: 100,
      supervisor: 'Suresh Patel',
      remarks: 'Work completed as per schedule',
    },
    {
      id: 'LT-003',
      date: '2025-01-22',
      projectId: 'PRJ-2025-003',
      projectName: 'L&T Campus - Industrial Kitchen',
      workPackage: 'WP-003 - Civil Work',
      laborCategory: 'Unskilled',
      workersDeployed: 12,
      hoursWorked: 96,
      overtimeHours: 0,
      totalManhours: 96,
      plannedManhours: 80,
      variance: 16,
      hourlyRate: 250,
      overtimeRate: 375,
      totalCost: 24000,
      workDescription: 'Site cleaning and material handling',
      shift: 'Day',
      efficiency: 75,
      supervisor: 'Vijay Sharma',
      remarks: 'Additional workers deployed for faster completion',
    },
    {
      id: 'LT-004',
      date: '2025-01-22',
      projectId: 'PRJ-2025-001',
      projectName: 'Taj Hotels - Commercial Kitchen Setup',
      workPackage: 'WP-004 - Electrical Work',
      laborCategory: 'Skilled',
      workersDeployed: 4,
      hoursWorked: 32,
      overtimeHours: 4,
      totalManhours: 36,
      plannedManhours: 32,
      variance: 4,
      hourlyRate: 480,
      overtimeRate: 720,
      totalCost: 18240,
      workDescription: 'Power wiring and equipment connections',
      shift: 'Day',
      efficiency: 92,
      supervisor: 'Prakash Rao',
      remarks: 'Minor overtime for testing completion',
    },
    {
      id: 'LT-005',
      date: '2025-01-21',
      projectId: 'PRJ-2025-004',
      projectName: 'ITC Grand - Bakery Equipment Setup',
      workPackage: 'WP-005 - Equipment Commissioning',
      laborCategory: 'Engineer',
      workersDeployed: 2,
      hoursWorked: 16,
      overtimeHours: 0,
      totalManhours: 16,
      plannedManhours: 16,
      variance: 0,
      hourlyRate: 800,
      overtimeRate: 1200,
      totalCost: 12800,
      workDescription: 'Oven calibration and testing',
      shift: 'Day',
      efficiency: 100,
      supervisor: 'Amit Singh',
      remarks: 'Commissioning completed successfully',
    },
    {
      id: 'LT-006',
      date: '2025-01-21',
      projectId: 'PRJ-2025-003',
      projectName: 'L&T Campus - Industrial Kitchen',
      workPackage: 'WP-006 - Plumbing Work',
      laborCategory: 'Semi-Skilled',
      workersDeployed: 6,
      hoursWorked: 48,
      overtimeHours: 6,
      totalManhours: 54,
      plannedManhours: 48,
      variance: 6,
      hourlyRate: 350,
      overtimeRate: 525,
      totalCost: 20250,
      workDescription: 'Pipeline installation and drain connections',
      shift: 'Day',
      efficiency: 85,
      supervisor: 'Dinesh Kumar',
      remarks: 'Extended work for leak testing',
    },
    {
      id: 'LT-007',
      date: '2025-01-21',
      projectId: 'PRJ-2025-005',
      projectName: 'Godrej Properties - Modular Kitchen',
      workPackage: 'WP-007 - Cabinet Installation',
      laborCategory: 'Skilled',
      workersDeployed: 4,
      hoursWorked: 32,
      overtimeHours: 0,
      totalManhours: 32,
      plannedManhours: 32,
      variance: 0,
      hourlyRate: 400,
      overtimeRate: 600,
      totalCost: 12800,
      workDescription: 'Base and wall cabinet installation',
      shift: 'Day',
      efficiency: 95,
      supervisor: 'Ravi Shankar',
      remarks: 'Installation progressing smoothly',
    },
    {
      id: 'LT-008',
      date: '2025-01-20',
      projectId: 'PRJ-2025-002',
      projectName: 'BigBasket - Cold Room Installation',
      workPackage: 'WP-008 - Refrigeration Setup',
      laborCategory: 'Skilled',
      workersDeployed: 5,
      hoursWorked: 40,
      overtimeHours: 8,
      totalManhours: 48,
      plannedManhours: 40,
      variance: 8,
      hourlyRate: 500,
      overtimeRate: 750,
      totalCost: 26000,
      workDescription: 'Compressor and evaporator installation',
      shift: 'Day',
      efficiency: 90,
      supervisor: 'Venkat Rao',
      remarks: 'Overtime for gas charging completion',
    },
    {
      id: 'LT-009',
      date: '2025-01-20',
      projectId: 'PRJ-2025-001',
      projectName: 'Taj Hotels - Commercial Kitchen Setup',
      workPackage: 'WP-009 - Finishing Work',
      laborCategory: 'Semi-Skilled',
      workersDeployed: 6,
      hoursWorked: 48,
      overtimeHours: 0,
      totalManhours: 48,
      plannedManhours: 48,
      variance: 0,
      hourlyRate: 320,
      overtimeRate: 480,
      totalCost: 15360,
      workDescription: 'Wall cladding and floor finishing',
      shift: 'Day',
      efficiency: 93,
      supervisor: 'Mahesh Gupta',
      remarks: 'Good quality finish achieved',
    },
    {
      id: 'LT-010',
      date: '2025-01-20',
      projectId: 'PRJ-2025-006',
      projectName: 'Siemens - Switchgear Manufacturing Unit',
      workPackage: 'WP-010 - Assembly Line Setup',
      laborCategory: 'Engineer',
      workersDeployed: 3,
      hoursWorked: 24,
      overtimeHours: 0,
      totalManhours: 24,
      plannedManhours: 24,
      variance: 0,
      hourlyRate: 850,
      overtimeRate: 1275,
      totalCost: 20400,
      workDescription: 'Equipment alignment and testing',
      shift: 'Day',
      efficiency: 100,
      supervisor: 'Deepak Shah',
      remarks: 'Precision work completed as planned',
    },
    {
      id: 'LT-011',
      date: '2025-01-19',
      projectId: 'PRJ-2025-003',
      projectName: 'L&T Campus - Industrial Kitchen',
      workPackage: 'WP-011 - HVAC Installation',
      laborCategory: 'Skilled',
      workersDeployed: 8,
      hoursWorked: 64,
      overtimeHours: 12,
      totalManhours: 76,
      plannedManhours: 64,
      variance: 12,
      hourlyRate: 460,
      overtimeRate: 690,
      totalCost: 37720,
      workDescription: 'Duct installation and fan mounting',
      shift: 'Day',
      efficiency: 82,
      supervisor: 'Anil Joshi',
      remarks: 'Overtime due to duct leakage rectification',
    },
    {
      id: 'LT-012',
      date: '2025-01-19',
      projectId: 'PRJ-2025-008',
      projectName: 'Marriott Hotel - Kitchen Renovation',
      workPackage: 'WP-012 - Demolition Work',
      laborCategory: 'Unskilled',
      workersDeployed: 10,
      hoursWorked: 60,
      overtimeHours: 0,
      totalManhours: 60,
      plannedManhours: 60,
      variance: 0,
      hourlyRate: 280,
      overtimeRate: 420,
      totalCost: 16800,
      workDescription: 'Old equipment removal and debris clearing',
      shift: 'Night',
      efficiency: 88,
      supervisor: 'Naveen Kumar',
      remarks: 'Night shift to avoid hotel operation disruption',
    },
  ];

  const stats = {
    totalEntries: mockLaborEntries.length,
    totalWorkers: mockLaborEntries.reduce((sum, e) => sum + e.workersDeployed, 0),
    totalManhours: mockLaborEntries.reduce((sum, e) => sum + e.totalManhours, 0),
    totalCost: mockLaborEntries.reduce((sum, e) => sum + e.totalCost, 0),
    overtimeHours: mockLaborEntries.reduce((sum, e) => sum + e.overtimeHours, 0),
    avgEfficiency: (mockLaborEntries.reduce((sum, e) => sum + e.efficiency, 0) / mockLaborEntries.length).toFixed(1),
    varianceTotal: mockLaborEntries.reduce((sum, e) => sum + e.variance, 0),
  };

  const filteredEntries = mockLaborEntries.filter((entry) => {
    const matchesSearch =
      entry.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.workPackage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.supervisor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = filterProject === 'all' || entry.projectId === filterProject;
    const matchesCategory = filterCategory === 'all' || entry.laborCategory === filterCategory;
    const matchesDate = !filterDate || entry.date === filterDate;
    return matchesSearch && matchesProject && matchesCategory && matchesDate;
  });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const uniqueProjects = Array.from(new Set(mockLaborEntries.map(e => e.projectId)));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Engineer':
        return 'bg-purple-100 text-purple-800';
      case 'Skilled':
        return 'bg-blue-100 text-blue-800';
      case 'Semi-Skilled':
        return 'bg-green-100 text-green-800';
      case 'Supervisor':
        return 'bg-orange-100 text-orange-800';
      case 'Unskilled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-blue-600';
    if (efficiency >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return 'text-blue-600';
    if (variance > 0) return 'text-red-600';
    return 'text-green-600';
  };

  // Handler functions
  const handleAddEntry = (data: any) => {
    console.log('Adding labor entry:', data);
    setShowAddModal(false);
  };

  const handleEditEntry = (data: any) => {
    console.log('Editing labor entry:', data);
    setShowEditModal(false);
    setSelectedEntry(null);
  };

  const handleApproveHours = (data: any) => {
    console.log('Approving hours:', data);
    setShowApproveModal(false);
    setSelectedEntry(null);
  };

  const handleRejectHours = (reason: string) => {
    console.log('Rejecting hours:', reason);
    setShowRejectModal(false);
    setSelectedEntry(null);
  };

  const handleCalculateEfficiency = (_data: any) => {
    setShowEfficiencyModal(false);
    setSelectedEntry(null);
  };

  const handleBulkUpload = (file: File) => {
    console.log('Uploading file:', file.name);
    setShowBulkUploadModal(false);
  };

  const handleExportReport = (data: any) => {
    exportToCsv('labor-tracking', filteredEntries as unknown as Record<string, unknown>[]);
    setShowExportModal(false);
  };

  const handleAssignWorkers = (data: any) => {
    console.log('Assigning workers:', data);
    setShowAssignWorkersModal(false);
  };

  const handleCalculateCost = (_data: any) => {
    setShowCalculateCostModal(false);
    setSelectedEntry(null);
  };

  const handleShiftSchedule = (data: any) => {
    console.log('Creating shift schedule:', data);
    setShowShiftScheduleModal(false);
  };

  const handleGenerateTimesheet = (data: any) => {
    console.log('Generating timesheet:', data);
    setShowTimesheetModal(false);
  };

  const handleProductivityReport = (data: any) => {
    console.log('Generating productivity report:', data);
    setShowProductivityReportModal(false);
  };

  const handleMarkAttendance = (data: any) => {
    console.log('Marking attendance:', data);
    setShowAttendanceModal(false);
  };

  const openEditModal = (entry: LaborEntry) => {
    setSelectedEntry(entry);
    setShowEditModal(true);
  };

  const openViewModal = (entry: LaborEntry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const openApproveModal = (entry: LaborEntry) => {
    setSelectedEntry(entry);
    setShowApproveModal(true);
  };

  const openRejectModal = (entry: LaborEntry) => {
    setSelectedEntry(entry);
    setShowRejectModal(true);
  };

  const openEfficiencyModal = (entry: LaborEntry) => {
    setSelectedEntry(entry);
    setShowEfficiencyModal(true);
  };

  const openCalculateCostModal = (entry: LaborEntry) => {
    setSelectedEntry(entry);
    setShowCalculateCostModal(true);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Labor & Manhours Tracking</h1>
          <p className="text-gray-600 mt-1">Track workforce deployment and productivity across projects</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowAttendanceModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            <ClipboardCheck className="h-5 w-5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Upload className="h-5 w-5" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={() => setShowShiftScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            <Calendar className="h-5 w-5" />
            <span>Shift Schedule</span>
          </button>
          <button
            onClick={() => setShowOvertimeAnalysisModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            <PieChart className="h-5 w-5" />
            <span>Overtime Analysis</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Workers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Manhours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalManhours}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overtime</p>
              <p className="text-2xl font-bold text-orange-600">{stats.overtimeHours}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">₹{(stats.totalCost / 100000).toFixed(1)}L</p>
            </div>
            <DollarSign className="h-8 w-8 text-cyan-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgEfficiency}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Variance</p>
              <p className={`text-2xl font-bold ${getVarianceColor(stats.varianceTotal)}`}>
                {stats.varianceTotal > 0 ? '+' : ''}{stats.varianceTotal}h
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search project, work package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Engineer">Engineer</option>
              <option value="Skilled">Skilled</option>
              <option value="Semi-Skilled">Semi-Skilled</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Unskilled">Unskilled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => setShowAssignWorkersModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 h-10"
            >
              <UserPlus className="h-4 w-4" />
              <span>Assign Workers</span>
            </button>
            <button
              onClick={() => setShowTimesheetModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 h-10"
            >
              <FileText className="h-4 w-4" />
              <span>Timesheet</span>
            </button>
            <button
              onClick={() => setShowProductivityReportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 h-10"
            >
              <FileBarChart className="h-4 w-4" />
              <span>Productivity</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 h-10"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Labor Entries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date / Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Package
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Workers
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manhours
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Efficiency
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{entry.date}</div>
                      <div className="text-sm text-gray-600">{entry.projectId}</div>
                      <div className="text-xs text-gray-500">{entry.projectName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{entry.workPackage}</div>
                    <div className="text-xs text-gray-500">{entry.workDescription}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(entry.laborCategory)}`}>
                      {entry.laborCategory}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{entry.shift} Shift</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-sm font-medium text-gray-900">{entry.workersDeployed}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-sm font-medium text-gray-900">{entry.totalManhours}h</div>
                    <div className="text-xs text-gray-500">
                      Planned: {entry.plannedManhours}h
                    </div>
                    <div className={`text-xs font-semibold ${getVarianceColor(entry.variance)}`}>
                      {entry.variance > 0 ? '+' : ''}{entry.variance}h
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {entry.overtimeHours > 0 ? (
                      <div className="text-sm font-medium text-orange-600">{entry.overtimeHours}h</div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{entry.totalCost.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-gray-500">
                      @₹{entry.hourlyRate}/hr
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`text-sm font-semibold ${getEfficiencyColor(entry.efficiency)}`}>
                      {entry.efficiency}%
                    </div>
                    <div className="text-xs text-gray-500">{entry.supervisor}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openViewModal(entry)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                          title="View Details"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(entry)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Edit Entry"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openApproveModal(entry)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Approve Hours"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openRejectModal(entry)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Reject Hours"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEfficiencyModal(entry)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                          title="Calculate Efficiency"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openCalculateCostModal(entry)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Calculate Cost"
                        >
                          <Calculator className="h-4 w-4" />
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
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredEntries.length)}</span> of{' '}
              <span className="font-medium">{filteredEntries.length}</span> entries
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
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${currentPage === page
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
      <AddLaborEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddEntry}
      />

      {selectedEntry && (
        <>
          <EditLaborEntryModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedEntry(null);
            }}
            onSave={handleEditEntry}
            entry={selectedEntry}
          />

          <ViewLaborDetailsModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedEntry(null);
            }}
            entry={selectedEntry}
          />

          <ApproveHoursModal
            isOpen={showApproveModal}
            onClose={() => {
              setShowApproveModal(false);
              setSelectedEntry(null);
            }}
            onApprove={handleApproveHours}
            entry={selectedEntry}
          />

          <RejectHoursModal
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedEntry(null);
            }}
            onReject={handleRejectHours}
            entry={selectedEntry}
          />

          <CalculateEfficiencyModal
            isOpen={showEfficiencyModal}
            onClose={() => {
              setShowEfficiencyModal(false);
              setSelectedEntry(null);
            }}
            onCalculate={handleCalculateEfficiency}
            entry={selectedEntry}
          />

          <CalculateCostModal
            isOpen={showCalculateCostModal}
            onClose={() => {
              setShowCalculateCostModal(false);
              setSelectedEntry(null);
            }}
            onCalculate={handleCalculateCost}
            entry={selectedEntry}
          />
        </>
      )}

      <BulkUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUpload={handleBulkUpload}
      />

      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportReport}
      />

      <AssignWorkersModal
        isOpen={showAssignWorkersModal}
        onClose={() => setShowAssignWorkersModal(false)}
        onAssign={handleAssignWorkers}
      />

      <ShiftScheduleModal
        isOpen={showShiftScheduleModal}
        onClose={() => setShowShiftScheduleModal(false)}
        onSchedule={handleShiftSchedule}
      />

      <OvertimeAnalysisModal
        isOpen={showOvertimeAnalysisModal}
        onClose={() => setShowOvertimeAnalysisModal(false)}
        entries={filteredEntries}
      />

      <GenerateTimesheetModal
        isOpen={showTimesheetModal}
        onClose={() => setShowTimesheetModal(false)}
        onGenerate={handleGenerateTimesheet}
      />

      <LaborProductivityReportModal
        isOpen={showProductivityReportModal}
        onClose={() => setShowProductivityReportModal(false)}
        onGenerate={handleProductivityReport}
      />

      <MarkAttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        onMark={handleMarkAttendance}
      />
    </div>
  );
}
