'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { useRouter } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import {
 Users,
 TrendingUp,
 Calendar,
 DollarSign,
 Clock,
 AlertCircle,
 CheckCircle,
 BarChart3,
 PieChart,
 Download,
 Filter,
 RefreshCw,
 Eye,
 TrendingDown,
 Target,
 Sparkles,
} from 'lucide-react';
import {
 ViewUtilizationModal,
 FilterUtilizationModal,
 ExportReportModal,
 ComparePeriodsModal,
 SetTargetsModal,
 ViewTrendsModal,
 OptimizeSuggestionsModal,
 ViewDetailsModal,
} from '@/components/project-management/ResourceUtilizationModals';

interface ResourceUtilization {
 id: string;
 resourceId: string;
 resourceName: string;
 role: string;
 department: string;
 employeeType: 'Permanent' | 'Contract' | 'Consultant';
 totalCapacity: number; // hours per month
 allocatedHours: number;
 actualHours: number;
 utilization: number; // percentage
 efficiency: number; // percentage
 billableHours: number;
 nonBillableHours: number;
 overtimeHours: number;
 leaveHours: number;
 idleHours: number;
 activeProjects: number;
 costPerHour: number;
 totalRevenue: number;
 totalCost: number;
 availability: 'Available' | 'Partially Available' | 'Fully Allocated' | 'Overallocated';
 status: 'Active' | 'On Leave' | 'Resigned' | 'Training';
 currentProjects: ProjectAllocation[];
}

interface ProjectAllocation {
 projectId: string;
 projectName: string;
 allocatedHours: number;
 actualHours: number;
 startDate: string;
 endDate: string;
}

interface DepartmentMetrics {
 department: string;
 totalResources: number;
 avgUtilization: number;
 totalCapacity: number;
 allocatedCapacity: number;
 availableCapacity: number;
 totalRevenue: number;
 efficiency: number;
}

export default function ResourceUtilizationPage() {
 const router = useRouter();
 const [searchTerm, setSearchTerm] = useState('');
 const [departmentFilter, setDepartmentFilter] = useState('all');
 const [availabilityFilter, setAvailabilityFilter] = useState('all');
 const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
 const [selectedPeriod, setSelectedPeriod] = useState('current-month');

 // Modal states
 const [showViewUtilizationModal, setShowViewUtilizationModal] = useState(false);
 const [showFilterModal, setShowFilterModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showComparePeriodsModal, setShowComparePeriodsModal] = useState(false);
 const [showSetTargetsModal, setShowSetTargetsModal] = useState(false);
 const [showViewTrendsModal, setShowViewTrendsModal] = useState(false);
 const [showOptimizeSuggestionsModal, setShowOptimizeSuggestionsModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [selectedResource, setSelectedResource] = useState<ResourceUtilization | null>(null);

 // Mock data - 12 resource records
 const [mockResources, setMockResources] = useState<ResourceUtilization[]>([
  {
   id: '1',
   resourceId: 'EMP001',
   resourceName: 'Rajesh Kumar',
   role: 'Project Manager',
   department: 'Project Management',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 168,
   actualHours: 172,
   utilization: 97.7,
   efficiency: 102.4,
   billableHours: 160,
   nonBillableHours: 12,
   overtimeHours: 8,
   leaveHours: 0,
   idleHours: 4,
   activeProjects: 3,
   costPerHour: 1200,
   totalRevenue: 275000,
   totalCost: 206400,
   availability: 'Fully Allocated',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ001', projectName: 'Taj Kitchen Upgrade', allocatedHours: 60, actualHours: 64, startDate: '2024-01-15', endDate: '2024-06-30' },
    { projectId: 'PRJ003', projectName: 'L&T Cold Room', allocatedHours: 56, actualHours: 58, startDate: '2024-02-01', endDate: '2024-07-15' },
    { projectId: 'PRJ007', projectName: 'Reliance Switchgear', allocatedHours: 52, actualHours: 50, startDate: '2024-03-01', endDate: '2024-08-30' },
   ],
  },
  {
   id: '2',
   resourceId: 'EMP015',
   resourceName: 'Priya Sharma',
   role: 'Senior Engineer',
   department: 'Engineering',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 192,
   actualHours: 196,
   utilization: 111.4,
   efficiency: 102.1,
   billableHours: 184,
   nonBillableHours: 12,
   overtimeHours: 20,
   leaveHours: 0,
   idleHours: 0,
   activeProjects: 2,
   costPerHour: 950,
   totalRevenue: 312000,
   totalCost: 186200,
   availability: 'Overallocated',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ002', projectName: 'BigBasket Cold Chain', allocatedHours: 96, actualHours: 98, startDate: '2024-01-20', endDate: '2024-06-15' },
    { projectId: 'PRJ005', projectName: 'Godrej Kitchen', allocatedHours: 96, actualHours: 98, startDate: '2024-02-10', endDate: '2024-07-20' },
   ],
  },
  {
   id: '3',
   resourceId: 'EMP022',
   resourceName: 'Amit Patel',
   role: 'Design Engineer',
   department: 'Design',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 140,
   actualHours: 138,
   utilization: 78.4,
   efficiency: 98.6,
   billableHours: 130,
   nonBillableHours: 8,
   overtimeHours: 0,
   leaveHours: 16,
   idleHours: 22,
   activeProjects: 2,
   costPerHour: 850,
   totalRevenue: 195000,
   totalCost: 117300,
   availability: 'Partially Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ004', projectName: 'ITC Hotel Kitchen', allocatedHours: 72, actualHours: 70, startDate: '2024-02-05', endDate: '2024-06-30' },
    { projectId: 'PRJ008', projectName: 'Marriott Upgrade', allocatedHours: 68, actualHours: 68, startDate: '2024-03-10', endDate: '2024-08-15' },
   ],
  },
  {
   id: '4',
   resourceId: 'CON005',
   resourceName: 'Suresh Reddy',
   role: 'Installation Supervisor',
   department: 'Installation',
   employeeType: 'Contract',
   totalCapacity: 176,
   allocatedHours: 176,
   actualHours: 180,
   utilization: 102.3,
   efficiency: 102.3,
   billableHours: 176,
   nonBillableHours: 4,
   overtimeHours: 4,
   leaveHours: 0,
   idleHours: 0,
   activeProjects: 4,
   costPerHour: 750,
   totalRevenue: 264000,
   totalCost: 135000,
   availability: 'Fully Allocated',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ001', projectName: 'Taj Kitchen Upgrade', allocatedHours: 48, actualHours: 50, startDate: '2024-04-01', endDate: '2024-06-30' },
    { projectId: 'PRJ002', projectName: 'BigBasket Cold Chain', allocatedHours: 44, actualHours: 46, startDate: '2024-04-05', endDate: '2024-06-15' },
    { projectId: 'PRJ003', projectName: 'L&T Cold Room', allocatedHours: 42, actualHours: 42, startDate: '2024-04-10', endDate: '2024-07-15' },
    { projectId: 'PRJ006', projectName: 'Siemens Switchgear', allocatedHours: 42, actualHours: 42, startDate: '2024-04-15', endDate: '2024-07-30' },
   ],
  },
  {
   id: '5',
   resourceId: 'EMP033',
   resourceName: 'Kavita Singh',
   role: 'Quality Inspector',
   department: 'Quality Assurance',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 120,
   actualHours: 115,
   utilization: 65.3,
   efficiency: 95.8,
   billableHours: 110,
   nonBillableHours: 5,
   overtimeHours: 0,
   leaveHours: 24,
   idleHours: 37,
   activeProjects: 3,
   costPerHour: 700,
   totalRevenue: 165000,
   totalCost: 80500,
   availability: 'Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ001', projectName: 'Taj Kitchen Upgrade', allocatedHours: 40, actualHours: 38, startDate: '2024-03-15', endDate: '2024-06-30' },
    { projectId: 'PRJ004', projectName: 'ITC Hotel Kitchen', allocatedHours: 40, actualHours: 39, startDate: '2024-03-20', endDate: '2024-06-30' },
    { projectId: 'PRJ007', projectName: 'Reliance Switchgear', allocatedHours: 40, actualHours: 38, startDate: '2024-03-25', endDate: '2024-08-30' },
   ],
  },
  {
   id: '6',
   resourceId: 'EMP041',
   resourceName: 'Deepak Mehta',
   role: 'Commissioning Engineer',
   department: 'Commissioning',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 160,
   actualHours: 165,
   utilization: 93.8,
   efficiency: 103.1,
   billableHours: 158,
   nonBillableHours: 7,
   overtimeHours: 5,
   leaveHours: 8,
   idleHours: 3,
   activeProjects: 3,
   costPerHour: 900,
   totalRevenue: 237000,
   totalCost: 148500,
   availability: 'Partially Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ002', projectName: 'BigBasket Cold Chain', allocatedHours: 56, actualHours: 58, startDate: '2024-05-01', endDate: '2024-06-15' },
    { projectId: 'PRJ005', projectName: 'Godrej Kitchen', allocatedHours: 52, actualHours: 54, startDate: '2024-05-10', endDate: '2024-07-20' },
    { projectId: 'PRJ006', projectName: 'Siemens Switchgear', allocatedHours: 52, actualHours: 53, startDate: '2024-05-15', endDate: '2024-07-30' },
   ],
  },
  {
   id: '7',
   resourceId: 'CON012',
   resourceName: 'Ravi Krishnan',
   role: 'Site Engineer',
   department: 'Site Operations',
   employeeType: 'Contract',
   totalCapacity: 176,
   allocatedHours: 88,
   actualHours: 85,
   utilization: 48.3,
   efficiency: 96.6,
   billableHours: 80,
   nonBillableHours: 5,
   overtimeHours: 0,
   leaveHours: 0,
   idleHours: 91,
   activeProjects: 1,
   costPerHour: 650,
   totalRevenue: 120000,
   totalCost: 55250,
   availability: 'Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ008', projectName: 'Marriott Upgrade', allocatedHours: 88, actualHours: 85, startDate: '2024-03-10', endDate: '2024-08-15' },
   ],
  },
  {
   id: '8',
   resourceId: 'EMP052',
   resourceName: 'Anjali Gupta',
   role: 'Procurement Specialist',
   department: 'Procurement',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 144,
   actualHours: 148,
   utilization: 84.1,
   efficiency: 102.8,
   billableHours: 135,
   nonBillableHours: 13,
   overtimeHours: 4,
   leaveHours: 8,
   idleHours: 20,
   activeProjects: 5,
   costPerHour: 800,
   totalRevenue: 202500,
   totalCost: 118400,
   availability: 'Partially Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ001', projectName: 'Taj Kitchen Upgrade', allocatedHours: 30, actualHours: 32, startDate: '2024-01-15', endDate: '2024-06-30' },
    { projectId: 'PRJ002', projectName: 'BigBasket Cold Chain', allocatedHours: 28, actualHours: 30, startDate: '2024-01-20', endDate: '2024-06-15' },
    { projectId: 'PRJ003', projectName: 'L&T Cold Room', allocatedHours: 30, actualHours: 30, startDate: '2024-02-01', endDate: '2024-07-15' },
    { projectId: 'PRJ005', projectName: 'Godrej Kitchen', allocatedHours: 28, actualHours: 28, startDate: '2024-02-10', endDate: '2024-07-20' },
    { projectId: 'PRJ007', projectName: 'Reliance Switchgear', allocatedHours: 28, actualHours: 28, startDate: '2024-03-01', endDate: '2024-08-30' },
   ],
  },
  {
   id: '9',
   resourceId: 'CONS003',
   resourceName: 'Dr. Vikram Malhotra',
   role: 'Technical Consultant',
   department: 'Consulting',
   employeeType: 'Consultant',
   totalCapacity: 80,
   allocatedHours: 72,
   actualHours: 68,
   utilization: 85.0,
   efficiency: 94.4,
   billableHours: 68,
   nonBillableHours: 0,
   overtimeHours: 0,
   leaveHours: 0,
   idleHours: 12,
   activeProjects: 2,
   costPerHour: 2500,
   totalRevenue: 255000,
   totalCost: 170000,
   availability: 'Partially Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ003', projectName: 'L&T Cold Room', allocatedHours: 36, actualHours: 34, startDate: '2024-02-01', endDate: '2024-07-15' },
    { projectId: 'PRJ007', projectName: 'Reliance Switchgear', allocatedHours: 36, actualHours: 34, startDate: '2024-03-01', endDate: '2024-08-30' },
   ],
  },
  {
   id: '10',
   resourceId: 'EMP067',
   resourceName: 'Sandeep Yadav',
   role: 'Electrical Engineer',
   department: 'Engineering',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 176,
   actualHours: 174,
   utilization: 98.9,
   efficiency: 98.9,
   billableHours: 168,
   nonBillableHours: 6,
   overtimeHours: 0,
   leaveHours: 0,
   idleHours: 2,
   activeProjects: 2,
   costPerHour: 900,
   totalRevenue: 252000,
   totalCost: 156600,
   availability: 'Fully Allocated',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ006', projectName: 'Siemens Switchgear', allocatedHours: 88, actualHours: 87, startDate: '2024-02-15', endDate: '2024-07-30' },
    { projectId: 'PRJ007', projectName: 'Reliance Switchgear', allocatedHours: 88, actualHours: 87, startDate: '2024-03-01', endDate: '2024-08-30' },
   ],
  },
  {
   id: '11',
   resourceId: 'EMP073',
   resourceName: 'Meera Iyer',
   role: 'Documentation Specialist',
   department: 'Administration',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 0,
   actualHours: 0,
   utilization: 0,
   efficiency: 0,
   billableHours: 0,
   nonBillableHours: 0,
   overtimeHours: 0,
   leaveHours: 176,
   idleHours: 0,
   activeProjects: 0,
   costPerHour: 600,
   totalRevenue: 0,
   totalCost: 0,
   availability: 'Available',
   status: 'On Leave',
   currentProjects: [],
  },
  {
   id: '12',
   resourceId: 'EMP081',
   resourceName: 'Arun Nair',
   role: 'Safety Officer',
   department: 'Safety & Compliance',
   employeeType: 'Permanent',
   totalCapacity: 176,
   allocatedHours: 132,
   actualHours: 128,
   utilization: 72.7,
   efficiency: 97.0,
   billableHours: 120,
   nonBillableHours: 8,
   overtimeHours: 0,
   leaveHours: 8,
   idleHours: 40,
   activeProjects: 4,
   costPerHour: 750,
   totalRevenue: 180000,
   totalCost: 96000,
   availability: 'Available',
   status: 'Active',
   currentProjects: [
    { projectId: 'PRJ001', projectName: 'Taj Kitchen Upgrade', allocatedHours: 32, actualHours: 31, startDate: '2024-01-15', endDate: '2024-06-30' },
    { projectId: 'PRJ002', projectName: 'BigBasket Cold Chain', allocatedHours: 34, actualHours: 33, startDate: '2024-01-20', endDate: '2024-06-15' },
    { projectId: 'PRJ005', projectName: 'Godrej Kitchen', allocatedHours: 33, actualHours: 32, startDate: '2024-02-10', endDate: '2024-07-20' },
    { projectId: 'PRJ008', projectName: 'Marriott Upgrade', allocatedHours: 33, actualHours: 32, startDate: '2024-03-10', endDate: '2024-08-15' },
   ],
  },
 ]);

 useEffect(() => {
  projectManagementService.listResourceUtilization()
   .then((rows) => { if (Array.isArray(rows) && rows.length > 0) setMockResources(rows as unknown as ResourceUtilization[]); })
   .catch(() => { /* keep seed data on error */ });
 }, []);

 // Calculate department metrics
 const departmentMetrics: DepartmentMetrics[] = [
  {
   department: 'Engineering',
   totalResources: 2,
   avgUtilization: 105.1,
   totalCapacity: 352,
   allocatedCapacity: 368,
   availableCapacity: -16,
   totalRevenue: 564000,
   efficiency: 100.5,
  },
  {
   department: 'Project Management',
   totalResources: 1,
   avgUtilization: 97.7,
   totalCapacity: 176,
   allocatedCapacity: 168,
   availableCapacity: 8,
   totalRevenue: 275000,
   efficiency: 102.4,
  },
  {
   department: 'Design',
   totalResources: 1,
   avgUtilization: 78.4,
   totalCapacity: 176,
   allocatedCapacity: 140,
   availableCapacity: 36,
   totalRevenue: 195000,
   efficiency: 98.6,
  },
  {
   department: 'Installation',
   totalResources: 1,
   avgUtilization: 102.3,
   totalCapacity: 176,
   allocatedCapacity: 176,
   availableCapacity: 0,
   totalRevenue: 264000,
   efficiency: 102.3,
  },
  {
   department: 'Quality Assurance',
   totalResources: 1,
   avgUtilization: 65.3,
   totalCapacity: 176,
   allocatedCapacity: 120,
   availableCapacity: 56,
   totalRevenue: 165000,
   efficiency: 95.8,
  },
  {
   department: 'Commissioning',
   totalResources: 1,
   avgUtilization: 93.8,
   totalCapacity: 176,
   allocatedCapacity: 160,
   availableCapacity: 16,
   totalRevenue: 237000,
   efficiency: 103.1,
  },
  {
   department: 'Site Operations',
   totalResources: 1,
   avgUtilization: 48.3,
   totalCapacity: 176,
   allocatedCapacity: 88,
   availableCapacity: 88,
   totalRevenue: 120000,
   efficiency: 96.6,
  },
  {
   department: 'Procurement',
   totalResources: 1,
   avgUtilization: 84.1,
   totalCapacity: 176,
   allocatedCapacity: 144,
   availableCapacity: 32,
   totalRevenue: 202500,
   efficiency: 102.8,
  },
 ];

 // Overall metrics
 const overallMetrics = {
  totalResources: mockResources.filter(r => r.status === 'Active').length,
  avgUtilization: mockResources.reduce((sum, r) => sum + r.utilization, 0) / mockResources.length,
  totalCapacity: mockResources.reduce((sum, r) => sum + r.totalCapacity, 0),
  allocatedCapacity: mockResources.reduce((sum, r) => sum + r.allocatedHours, 0),
  availableCapacity: mockResources.reduce((sum, r) => sum + (r.totalCapacity - r.allocatedHours), 0),
  totalRevenue: mockResources.reduce((sum, r) => sum + r.totalRevenue, 0),
  totalCost: mockResources.reduce((sum, r) => sum + r.totalCost, 0),
  avgEfficiency: mockResources.filter(r => r.efficiency > 0).reduce((sum, r) => sum + r.efficiency, 0) / mockResources.filter(r => r.efficiency > 0).length,
 };

 const filteredResources = mockResources.filter((resource) => {
  const matchesSearch =
   resource.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
   resource.resourceId.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesDepartment = departmentFilter === 'all' || resource.department === departmentFilter;
  const matchesAvailability = availabilityFilter === 'all' || resource.availability === availabilityFilter;
  return matchesSearch && matchesDepartment && matchesAvailability;
 });

 const getUtilizationColor = (utilization: number) => {
  if (utilization >= 100) return 'text-red-600 bg-red-50';
  if (utilization >= 80) return 'text-green-600 bg-green-50';
  if (utilization >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-gray-600 bg-gray-50';
 };

 const getAvailabilityColor = (availability: string) => {
  switch (availability) {
   case 'Available':
    return 'text-green-600 bg-green-50';
   case 'Partially Available':
    return 'text-yellow-600 bg-yellow-50';
   case 'Fully Allocated':
    return 'text-blue-600 bg-blue-50';
   case 'Overallocated':
    return 'text-red-600 bg-red-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'Active':
    return 'text-green-600 bg-green-50';
   case 'On Leave':
    return 'text-yellow-600 bg-yellow-50';
   case 'Resigned':
    return 'text-red-600 bg-red-50';
   case 'Training':
    return 'text-blue-600 bg-blue-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 // Modal handler functions
 const handleViewUtilization = (resource: ResourceUtilization) => {
  setSelectedResource(resource);
  setShowViewUtilizationModal(true);
 };

 const handleViewDetails = (resource: ResourceUtilization) => {
  setSelectedResource(resource);
  setShowDetailsModal(true);
 };

 const handleViewTrends = (resource: ResourceUtilization) => {
  setSelectedResource(resource);
  setShowViewTrendsModal(true);
 };

 const handleApplyFilters = (filters: any) => {
  console.log('Filters applied:', filters);
  setShowFilterModal(false);
 };

 const handleExportReport = (options: any) => {
  exportToCsv('resource-utilization', filteredResources as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 const handleSetTargets = (target: any) => {
  console.log('Target set:', target);
  setShowSetTargetsModal(false);
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2">
    {/* Page Header */}
    <div className="mb-3">
     <h1 className="text-3xl font-bold text-gray-900">Resource Utilization Analytics</h1>
     <p className="mt-2 text-sm text-gray-600">
      Monitor and optimize resource allocation across all departments and projects. Track utilization rates, efficiency metrics, and identify optimization opportunities.
     </p>
    </div>

    {/* Header Actions */}
    <div className="flex flex-wrap justify-end gap-3 mb-2">
     <button
      onClick={() => setShowFilterModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
     >
      <Filter className="w-4 h-4" />
      Filter
     </button>
     <button
      onClick={() => setShowComparePeriodsModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
     >
      <BarChart3 className="w-4 h-4" />
      Compare Periods
     </button>
     <button
      onClick={() => setShowSetTargetsModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
     >
      <Target className="w-4 h-4" />
      Set Targets
     </button>
     <button
      onClick={() => setShowViewTrendsModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
     >
      <TrendingUp className="w-4 h-4" />
      View Trends
     </button>
     <button
      onClick={() => setShowOptimizeSuggestionsModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600"
     >
      <Sparkles className="w-4 h-4" />
      Optimize
     </button>
     <select
      value={selectedPeriod}
      onChange={(e) => setSelectedPeriod(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="current-month">Current Month</option>
      <option value="last-month">Last Month</option>
      <option value="current-quarter">Current Quarter</option>
      <option value="last-quarter">Last Quarter</option>
      <option value="ytd">Year to Date</option>
     </select>
     <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
      <RefreshCw className="w-4 h-4" />
      Refresh
     </button>
     <button
      onClick={() => setShowExportModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
     >
      <Download className="w-4 h-4" />
      Export Report
     </button>
    </div>

    {/* Overall Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Resources</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{overallMetrics.totalResources}</p>
        <p className="text-xs text-green-600 mt-1">Active team members</p>
       </div>
       <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
        <Users className="w-6 h-6 text-cyan-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Avg Utilization</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{overallMetrics.avgUtilization.toFixed(1)}%</p>
        <p className="text-xs text-yellow-600 mt-1">Target: 85%</p>
       </div>
       <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
        <TrendingUp className="w-6 h-6 text-yellow-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Available Capacity</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{overallMetrics.availableCapacity}h</p>
        <p className="text-xs text-gray-600 mt-1">of {overallMetrics.totalCapacity}h total</p>
       </div>
       <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <Clock className="w-6 h-6 text-green-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Revenue</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         ₹{(overallMetrics.totalRevenue / 100000).toFixed(1)}L
        </p>
        <p className="text-xs text-green-600 mt-1">
         Profit: ₹{((overallMetrics.totalRevenue - overallMetrics.totalCost) / 100000).toFixed(1)}L
        </p>
       </div>
       <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <DollarSign className="w-6 h-6 text-purple-600" />
       </div>
      </div>
     </div>
    </div>

    {/* Department Metrics */}
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
     <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
      <BarChart3 className="w-5 h-5 text-cyan-600" />
      Department-wise Utilization
     </h3>
     <div className="overflow-x-auto">
      <table className="min-w-full">
       <thead>
        <tr className="border-b border-gray-200">
         <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
         <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Resources</th>
         <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Utilization</th>
         <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Capacity</th>
         <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Allocated</th>
         <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Available</th>
         <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
         <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Efficiency</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-gray-100">
        {departmentMetrics.map((dept) => (
         <tr key={dept.department} className="hover:bg-gray-50">
          <td className="py-3 px-4 text-sm font-medium text-gray-900">{dept.department}</td>
          <td className="py-3 px-4 text-sm text-gray-600 text-center">{dept.totalResources}</td>
          <td className="py-3 px-4 text-center">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUtilizationColor(dept.avgUtilization)}`}>
            {dept.avgUtilization.toFixed(1)}%
           </span>
          </td>
          <td className="py-3 px-4 text-sm text-gray-600 text-right">{dept.totalCapacity}h</td>
          <td className="py-3 px-4 text-sm text-gray-600 text-right">{dept.allocatedCapacity}h</td>
          <td className="py-3 px-4 text-sm text-right">
           <span className={dept.availableCapacity < 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
            {dept.availableCapacity}h
           </span>
          </td>
          <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
           ₹{(dept.totalRevenue / 100000).toFixed(2)}L
          </td>
          <td className="py-3 px-4 text-center">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.efficiency >= 100 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
            {dept.efficiency.toFixed(1)}%
           </span>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>

    {/* Filters */}
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
    <div className="flex flex-col md:flex-row gap-2">
     <div className="flex-1">
      <input
       type="text"
       placeholder="Search by name, role, or employee ID..."
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
     </div>
     <select
      value={departmentFilter}
      onChange={(e) => setDepartmentFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Departments</option>
      <option value="Engineering">Engineering</option>
      <option value="Project Management">Project Management</option>
      <option value="Design">Design</option>
      <option value="Installation">Installation</option>
      <option value="Quality Assurance">Quality Assurance</option>
      <option value="Commissioning">Commissioning</option>
      <option value="Site Operations">Site Operations</option>
      <option value="Procurement">Procurement</option>
      <option value="Consulting">Consulting</option>
      <option value="Administration">Administration</option>
      <option value="Safety & Compliance">Safety & Compliance</option>
     </select>
     <select
      value={availabilityFilter}
      onChange={(e) => setAvailabilityFilter(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
     >
      <option value="all">All Availability</option>
      <option value="Available">Available</option>
      <option value="Partially Available">Partially Available</option>
      <option value="Fully Allocated">Fully Allocated</option>
      <option value="Overallocated">Overallocated</option>
     </select>
     <div className="flex gap-2">
      <button
       onClick={() => setViewMode('table')}
       className={`px-4 py-2 rounded-lg ${viewMode === 'table' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
       Table
      </button>
      <button
       onClick={() => setViewMode('cards')}
       className={`px-4 py-2 rounded-lg ${viewMode === 'cards' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
       Cards
      </button>
     </div>
    </div>
   </div>

    {/* Resources List - Table View */}
    {viewMode === 'table' && (
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
       <thead className="bg-gray-50">
        <tr>
         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Resource
         </th>
         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Department
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Utilization
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Capacity
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Projects
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Efficiency
         </th>
         <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Revenue
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Availability
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
         </th>
         <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
         </th>
        </tr>
       </thead>
       <tbody className="bg-white divide-y divide-gray-200">
        {filteredResources.map((resource) => (
         <tr key={resource.id} className="hover:bg-gray-50">
          <td className="px-3 py-2 whitespace-nowrap">
           <div>
            <div className="text-sm font-medium text-gray-900">{resource.resourceName}</div>
            <div className="text-sm text-gray-500">{resource.role}</div>
            <div className="text-xs text-gray-400">{resource.resourceId} • {resource.employeeType}</div>
           </div>
          </td>
          <td className="px-3 py-2 whitespace-nowrap">
           <div className="text-sm text-gray-900">{resource.department}</div>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUtilizationColor(resource.utilization)}`}>
            {resource.utilization.toFixed(1)}%
           </span>
           <div className="text-xs text-gray-500 mt-1">
            {resource.allocatedHours}h / {resource.totalCapacity}h
           </div>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <div className="text-sm text-gray-900">{resource.actualHours}h</div>
           <div className="text-xs text-gray-500">Billable: {resource.billableHours}h</div>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {resource.activeProjects}
           </span>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resource.efficiency >= 100 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
            {resource.efficiency.toFixed(1)}%
           </span>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-right">
           <div className="text-sm font-medium text-gray-900">
            ₹{(resource.totalRevenue / 100000).toFixed(2)}L
           </div>
           <div className="text-xs text-gray-500">
            Cost: ₹{(resource.totalCost / 100000).toFixed(2)}L
           </div>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(resource.availability)}`}>
            {resource.availability}
           </span>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
            {resource.status}
           </span>
          </td>
          <td className="px-3 py-2 whitespace-nowrap text-center">
           <div className="flex items-center justify-center gap-2">
            <button
             onClick={() => handleViewDetails(resource)}
             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
             title="View Details"
            >
             <Eye className="w-4 h-4" />
            </button>
            <button
             onClick={() => handleViewTrends(resource)}
             className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
             title="View Trends"
            >
             <TrendingUp className="w-4 h-4" />
            </button>
           </div>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    </div>
    )}

    {/* Resources List - Cards View */}
    {viewMode === 'cards' && (
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
     {filteredResources.map((resource) => (
      <div key={resource.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
       <div className="flex items-start justify-between mb-2">
        <div>
         <h3 className="text-lg font-semibold text-gray-900">{resource.resourceName}</h3>
         <p className="text-sm text-gray-600">{resource.role}</p>
         <p className="text-xs text-gray-500 mt-1">{resource.resourceId} • {resource.employeeType}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
         {resource.status}
        </span>
       </div>

       <div className="space-y-3">
        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Department:</span>
         <span className="text-sm font-medium text-gray-900">{resource.department}</span>
        </div>

        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Utilization:</span>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUtilizationColor(resource.utilization)}`}>
          {resource.utilization.toFixed(1)}%
         </span>
        </div>

        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Hours:</span>
         <span className="text-sm text-gray-900">{resource.allocatedHours}h / {resource.totalCapacity}h</span>
        </div>

        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Active Projects:</span>
         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {resource.activeProjects}
         </span>
        </div>

        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Efficiency:</span>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resource.efficiency >= 100 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
          {resource.efficiency.toFixed(1)}%
         </span>
        </div>

        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Revenue:</span>
         <span className="text-sm font-medium text-gray-900">₹{(resource.totalRevenue / 100000).toFixed(2)}L</span>
        </div>

        <div className="flex items-center justify-between">
         <span className="text-sm text-gray-600">Availability:</span>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(resource.availability)}`}>
          {resource.availability}
         </span>
        </div>
       </div>

       {resource.currentProjects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
         <p className="text-xs font-medium text-gray-700 mb-2">Current Projects:</p>
         <div className="space-y-1">
          {resource.currentProjects.slice(0, 3).map((project, idx) => (
           <div key={idx} className="text-xs text-gray-600 flex items-center justify-between">
            <span className="truncate flex-1">{project.projectName}</span>
            <span className="ml-2 text-gray-500">{project.allocatedHours}h</span>
           </div>
          ))}
          {resource.currentProjects.length > 3 && (
           <p className="text-xs text-cyan-600">+{resource.currentProjects.length - 3} more</p>
          )}
         </div>
        </div>
       )}

       <div className="mt-4 flex gap-2">
        <button
         onClick={() => handleViewDetails(resource)}
         className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
         <Eye className="w-4 h-4" />
         View Details
        </button>
        <button
         onClick={() => handleViewUtilization(resource)}
         className="flex-1 px-3 py-2 text-sm bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors flex items-center justify-center gap-2"
        >
         <BarChart3 className="w-4 h-4" />
         View Utilization
        </button>
       </div>
      </div>
     ))}
    </div>
    )}

    {/* Empty State */}
    {filteredResources.length === 0 && (
     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
      <p className="text-gray-600">Try adjusting your search or filter criteria</p>
     </div>
    )}
   </div>

   {/* Modals */}
   <ViewUtilizationModal
    isOpen={showViewUtilizationModal}
    onClose={() => setShowViewUtilizationModal(false)}
    resource={selectedResource ? { name: selectedResource.resourceName } : null}
   />

   <FilterUtilizationModal
    isOpen={showFilterModal}
    onClose={() => setShowFilterModal(false)}
    onApply={handleApplyFilters}
   />

   <ExportReportModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExportReport}
   />

   <ComparePeriodsModal
    isOpen={showComparePeriodsModal}
    onClose={() => setShowComparePeriodsModal(false)}
   />

   <SetTargetsModal
    isOpen={showSetTargetsModal}
    onClose={() => setShowSetTargetsModal(false)}
    onSet={handleSetTargets}
   />

   <ViewTrendsModal
    isOpen={showViewTrendsModal}
    onClose={() => setShowViewTrendsModal(false)}
   />

   <OptimizeSuggestionsModal
    isOpen={showOptimizeSuggestionsModal}
    onClose={() => setShowOptimizeSuggestionsModal(false)}
   />

   <ViewDetailsModal
    isOpen={showDetailsModal}
    onClose={() => setShowDetailsModal(false)}
    data={selectedResource}
   />
  </div>
 );
}
