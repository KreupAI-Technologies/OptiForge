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

 // Resource records loaded from the backend (no seed/mock data).
 const [resources, setResources] = useState<ResourceUtilization[]>([]);
 const [loading, setLoading] = useState(true);
 // Target utilization % shown on the KPI card; adjustable via "Set Targets".
 const [utilizationTarget, setUtilizationTarget] = useState(85);

 const loadResources = () => {
  setLoading(true);
  return projectManagementService.listResourceUtilization()
   .then((rows) => {
    setResources(Array.isArray(rows) ? (rows as unknown as ResourceUtilization[]) : []);
   })
   .catch(() => { setResources([]); })
   .finally(() => setLoading(false));
 };

 useEffect(() => {
  loadResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Department metrics derived from the fetched rows.
 const departmentMetrics: DepartmentMetrics[] = Object.values(
  resources.reduce((acc, r) => {
   const key = r.department || 'Unassigned';
   if (!acc[key]) {
    acc[key] = {
     department: key,
     totalResources: 0,
     avgUtilization: 0,
     totalCapacity: 0,
     allocatedCapacity: 0,
     availableCapacity: 0,
     totalRevenue: 0,
     efficiency: 0,
    };
   }
   const d = acc[key];
   d.totalResources += 1;
   d.avgUtilization += r.utilization || 0;
   d.totalCapacity += r.totalCapacity || 0;
   d.allocatedCapacity += r.allocatedHours || 0;
   d.totalRevenue += r.totalRevenue || 0;
   d.efficiency += r.efficiency || 0;
   return acc;
  }, {} as Record<string, DepartmentMetrics>)
 ).map((d) => ({
  ...d,
  avgUtilization: d.totalResources ? d.avgUtilization / d.totalResources : 0,
  efficiency: d.totalResources ? d.efficiency / d.totalResources : 0,
  availableCapacity: d.totalCapacity - d.allocatedCapacity,
 }));

 // Overall metrics derived from the fetched rows.
 const withEfficiency = resources.filter(r => r.efficiency > 0);
 const overallMetrics = {
  totalResources: resources.filter(r => r.status === 'Active').length,
  avgUtilization: resources.length ? resources.reduce((sum, r) => sum + r.utilization, 0) / resources.length : 0,
  totalCapacity: resources.reduce((sum, r) => sum + r.totalCapacity, 0),
  allocatedCapacity: resources.reduce((sum, r) => sum + r.allocatedHours, 0),
  availableCapacity: resources.reduce((sum, r) => sum + (r.totalCapacity - r.allocatedHours), 0),
  totalRevenue: resources.reduce((sum, r) => sum + r.totalRevenue, 0),
  totalCost: resources.reduce((sum, r) => sum + r.totalCost, 0),
  avgEfficiency: withEfficiency.length ? withEfficiency.reduce((sum, r) => sum + r.efficiency, 0) / withEfficiency.length : 0,
 };

 // Distinct departments present in the data (drives the filter dropdown).
 const departmentOptions = Array.from(new Set(resources.map(r => r.department).filter(Boolean))).sort();

 const filteredResources = resources.filter((resource) => {
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
  // Apply the modal's selections to the page's live filter state, then refetch.
  if (filters?.department) setDepartmentFilter(filters.department);
  setShowFilterModal(false);
  loadResources();
 };

 const handleExportReport = (options: any) => {
  exportToCsv('resource-utilization', filteredResources as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 const handleSetTargets = (target: any) => {
  const value = Number(target?.target);
  if (!Number.isNaN(value) && value > 0) setUtilizationTarget(value);
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
     <button
      onClick={() => loadResources()}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60"
     >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
        <p className="text-xs text-yellow-600 mt-1">Target: {utilizationTarget}%</p>
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
        {departmentMetrics.length === 0 && (
         <tr>
          <td colSpan={8} className="py-6 px-4 text-center text-sm text-gray-500">
           {loading ? 'Loading department metrics…' : 'No department data available'}
          </td>
         </tr>
        )}
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
      {departmentOptions.map((dept) => (
       <option key={dept} value={dept}>{dept}</option>
      ))}
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
      <h3 className="text-lg font-medium text-gray-900 mb-2">
       {loading ? 'Loading resources…' : 'No resources found'}
      </h3>
      <p className="text-gray-600">
       {loading ? 'Please wait while we fetch resource utilization data.' : 'Try adjusting your search or filter criteria'}
      </p>
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
