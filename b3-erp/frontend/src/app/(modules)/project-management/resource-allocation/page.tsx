'use client';

import React, { useState, useEffect } from 'react';
import { exportToCsv } from '@/lib/export';
import { projectManagementService } from '@/services/ProjectManagementService';
import { EmployeeService } from '@/services/employee.service';
import {
 Users,
 Plus,
 Save,
 AlertCircle,
 CheckCircle,
 TrendingUp,
 Calendar,
 Search,
 Edit,
 RefreshCw,
 Eye,
 Filter,
 Download,
 Trash2,
 UserCheck,
 Activity,
 Settings,
} from 'lucide-react';
import {
 AllocateResourceModal,
 EditAllocationModal,
 ReassignResourceModal,
 BulkAllocateModal,
 ViewWorkloadModal,
 SetCapacityModal,
 FilterAllocationModal,
 ExportAllocationModal,
 DeleteAllocationModal,
 ViewDetailsModal,
} from '@/components/project-management/ResourceAllocationModals';

interface Resource {
 id: string;
 name: string;
 role: string;
 currentAllocation: number;
 availability: number;
 costRate: number;
 skills: string[];
}

interface Allocation {
 id: string;
 resourceId: string;
 resourceName: string;
 role: string;
 projectPhase: string;
 allocatedHours: number;
 startDate: string;
 endDate: string;
 allocation: number;
}

export default function ResourceAllocationPage() {
 const [resources, setResources] = useState<Resource[]>([]);
 const [allocations, setAllocations] = useState<Allocation[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [loadError, setLoadError] = useState<string | null>(null);
 const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
  let cancelled = false;
  const load = async () => {
   setIsLoading(true);
   setLoadError(null);
   try {
    // Load the resource picker from the real employee master.
    const employees = await EmployeeService.getAllEmployees();
    if (!cancelled) {
     setResources(
      (employees ?? []).map((e) => ({
       id: String(e.id),
       name: `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim() || e.employeeCode || 'Unnamed',
       role: e.designation ?? '',
       currentAllocation: 0,
       availability: 100,
       costRate: Number(e.salary ?? 0),
       skills: [],
      }))
     );
    }
    // Backend returns raw project-resource ORM rows
    // ({ userId, role, allocationPercentage, startDate, endDate }); map them
    // onto the page's Allocation model with defensive access.
    const raw = (await projectManagementService.listAllResources()) as any[];
    const mapped: Allocation[] = raw.map((r, i) => ({
     id: String(r?.id ?? i),
     resourceId: String(r?.userId ?? r?.resourceId ?? ''),
     resourceName: String(r?.user?.name ?? r?.resourceName ?? r?.userId ?? 'Unassigned'),
     role: String(r?.role ?? ''),
     projectPhase: String(r?.projectPhase ?? r?.projectId ?? ''),
     allocatedHours: Number(r?.allocatedHours ?? 0),
     startDate: String(r?.startDate ?? ''),
     endDate: String(r?.endDate ?? ''),
     allocation: Number(r?.allocationPercentage ?? r?.allocation ?? 0),
    }));
    if (!cancelled) setAllocations(mapped);
   } catch (err) {
    if (!cancelled) {
     setLoadError(err instanceof Error ? err.message : 'Failed to load resource allocations');
     setAllocations([]);
    }
   } finally {
    if (!cancelled) setIsLoading(false);
   }
  };
  load();
  return () => {
   cancelled = true;
  };
 }, []);
 const [showAddModal, setShowAddModal] = useState(false);
 const [selectedResource, setSelectedResource] = useState('');
 const [newAllocation, setNewAllocation] = useState({
  projectPhase: '',
  allocatedHours: 0,
  startDate: '',
  endDate: '',
  allocation: 0,
 });

 // Modal states for all 10 modals
 const [showAllocateModal, setShowAllocateModal] = useState(false);
 const [showEditModal, setShowEditModal] = useState(false);
 const [showReassignModal, setShowReassignModal] = useState(false);
 const [showBulkAllocateModal, setShowBulkAllocateModal] = useState(false);
 const [showWorkloadModal, setShowWorkloadModal] = useState(false);
 const [showCapacityModal, setShowCapacityModal] = useState(false);
 const [showFilterModal, setShowFilterModal] = useState(false);
 const [showExportModal, setShowExportModal] = useState(false);
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [showDetailsModal, setShowDetailsModal] = useState(false);
 const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);
 const [selectedResourceForWorkload, setSelectedResourceForWorkload] = useState<Resource | null>(null);

 const filteredResources = resources.filter(r =>
  r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  r.role.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const calculateResourceCost = (resource: Resource, hours: number) => {
  const days = hours / 8;
  return days * resource.costRate;
 };

 const totalAllocatedCost = allocations.reduce((sum, alloc) => {
  const resource = resources.find(r => r.id === alloc.resourceId);
  if (resource) {
   return sum + calculateResourceCost(resource, alloc.allocatedHours);
  }
  return sum;
 }, 0);

 const handleAddAllocation = () => {
  if (!selectedResource || !newAllocation.projectPhase) return;

  const resource = resources.find(r => r.id === selectedResource);
  if (!resource) return;

  const allocation: Allocation = {
   id: Date.now().toString(),
   resourceId: resource.id,
   resourceName: resource.name,
   role: resource.role,
   projectPhase: newAllocation.projectPhase,
   allocatedHours: newAllocation.allocatedHours,
   startDate: newAllocation.startDate,
   endDate: newAllocation.endDate,
   allocation: newAllocation.allocation,
  };

  setAllocations([...allocations, allocation]);
  setShowAddModal(false);
  setSelectedResource('');
  setNewAllocation({
   projectPhase: '',
   allocatedHours: 0,
   startDate: '',
   endDate: '',
   allocation: 0,
  });
 };

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
   style: 'currency',
   currency: 'INR',
   minimumFractionDigits: 0,
  }).format(amount);
 };

 const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
   day: '2-digit',
   month: 'short',
   year: 'numeric',
  });
 };

 const getAvailabilityColor = (availability: number) => {
  if (availability >= 50) return 'text-green-600';
  if (availability >= 20) return 'text-yellow-600';
  return 'text-red-600';
 };

 // Handler functions for all modals
 const handleAllocate = (data: any) => {
  console.log('Allocate:', data);
  setShowAllocateModal(false);
 };

 const handleEdit = (data: any) => {
  console.log('Edit:', data);
  setShowEditModal(false);
  setSelectedAllocation(null);
 };

 const handleReassign = (data: any) => {
  console.log('Reassign:', data);
  setShowReassignModal(false);
  setSelectedAllocation(null);
 };

 const handleBulkAllocate = (data: any) => {
  console.log('Bulk Allocate:', data);
  setShowBulkAllocateModal(false);
 };

 const handleSetCapacity = (data: any) => {
  console.log('Set Capacity:', data);
  setShowCapacityModal(false);
 };

 const handleApplyFilter = (filters: any) => {
  console.log('Apply Filters:', filters);
  setShowFilterModal(false);
 };

 const handleExport = (data: any) => {
  exportToCsv('resource-allocation', filteredResources as unknown as Record<string, unknown>[]);
  setShowExportModal(false);
 };

 const handleDelete = async () => {
  if (selectedAllocation) {
   try {
    await projectManagementService.deleteResource(selectedAllocation.id);
    setAllocations(allocations.filter(a => a.id !== selectedAllocation.id));
   } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to delete allocation');
   }
  }
  setShowDeleteModal(false);
  setSelectedAllocation(null);
 };

 // Helper functions to open modals with context
 const openEditModal = (allocation: Allocation) => {
  setSelectedAllocation(allocation);
  setShowEditModal(true);
 };

 const openReassignModal = (allocation: Allocation) => {
  setSelectedAllocation(allocation);
  setShowReassignModal(true);
 };

 const openDetailsModal = (allocation: Allocation) => {
  setSelectedAllocation(allocation);
  setShowDetailsModal(true);
 };

 const openDeleteModal = (allocation: Allocation) => {
  setSelectedAllocation(allocation);
  setShowDeleteModal(true);
 };

 const openWorkloadModal = (resource: Resource) => {
  setSelectedResourceForWorkload(resource);
  setShowWorkloadModal(true);
 };

 const openAllocateModalForResource = (resource: Resource) => {
  setSelectedResource(resource.id);
  setShowAllocateModal(true);
 };

 return (
  <div className="w-full h-screen overflow-y-auto overflow-x-hidden">
   <div className="px-3 py-2 space-y-3">
   {/* Enhanced Header */}
   <div className="mb-3">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Allocation</h1>
    <p className="text-gray-600">Manage and allocate resources across project phases and tasks</p>
   </div>

   {isLoading && (
    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
     <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
     Loading resource allocations…
    </div>
   )}
   {loadError && !isLoading && (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
     <AlertCircle className="h-4 w-4" />
     {loadError}
    </div>
   )}
   {!isLoading && !loadError && allocations.length === 0 && (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
     No resource allocations found.
    </div>
   )}

   {/* Header Actions */}
   <div className="flex justify-between items-center mb-2">
    <div className="flex gap-3">
     <button
      onClick={() => setShowFilterModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
     >
      <Filter className="w-5 h-5" />
      Filter
     </button>
     <button
      onClick={() => setShowCapacityModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
     >
      <Settings className="w-5 h-5" />
      Set Capacity
     </button>
     <button
      onClick={() => setShowBulkAllocateModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
     >
      <Users className="w-5 h-5" />
      Bulk Allocate
     </button>
     <button
      onClick={() => setShowExportModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
     >
      <Download className="w-5 h-5" />
      Export
     </button>
    </div>
    <button
     onClick={() => setShowAllocateModal(true)}
     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
     <Plus className="w-5 h-5" />
     Allocate Resource
    </button>
   </div>

   {/* Summary Stats */}
   <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Total Resources</p>
      <Users className="w-5 h-5 text-blue-600" />
     </div>
     <p className="text-3xl font-bold text-gray-900">{resources.length}</p>
     <p className="text-sm text-gray-500 mt-1">{allocations.length} allocations</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Fully Allocated</p>
      <AlertCircle className="w-5 h-5 text-red-600" />
     </div>
     <p className="text-3xl font-bold text-red-900">
      {resources.filter(r => r.availability === 0).length}
     </p>
     <p className="text-sm text-gray-500 mt-1">0% available</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Available</p>
      <CheckCircle className="w-5 h-5 text-green-600" />
     </div>
     <p className="text-3xl font-bold text-green-900">
      {resources.filter(r => r.availability > 50).length}
     </p>
     <p className="text-sm text-gray-500 mt-1">50%+ available</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
     <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-600">Total Cost</p>
      <TrendingUp className="w-5 h-5 text-purple-600" />
     </div>
     <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalAllocatedCost)}</p>
     <p className="text-sm text-gray-500 mt-1">Resource cost</p>
    </div>
   </div>

   {/* Resource Availability Table */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
     <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900">Resource Availability</h2>
      <div className="relative w-64">
       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
       <input
        type="text"
        placeholder="Search resources..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
       />
      </div>
     </div>
    </div>

    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
       <tr>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Resource
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Role
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Skills
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Current Allocation
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Availability
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Cost Rate
        </th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Actions
        </th>
       </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
       {filteredResources.map((resource) => (
        <tr key={resource.id} className="hover:bg-gray-50">
         <td className="px-3 py-2">
          <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {resource.name.split(' ').map(n => n[0]).join('')}
           </div>
           <p className="font-medium text-gray-900">{resource.name}</p>
          </div>
         </td>
         <td className="px-3 py-2">
          <p className="text-sm text-gray-900">{resource.role}</p>
         </td>
         <td className="px-3 py-2">
          <div className="flex flex-wrap gap-1">
           {resource.skills.map((skill, idx) => (
            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
             {skill}
            </span>
           ))}
          </div>
         </td>
         <td className="px-3 py-2">
          <div>
           <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 w-24">
             <div className="w-full bg-gray-200 rounded-full h-2">
              <div
               className={`h-2 rounded-full ${
                resource.currentAllocation === 100 ? 'bg-red-500' :
                resource.currentAllocation >= 70 ? 'bg-yellow-500' :
                'bg-green-500'
               }`}
               style={{ width: `${resource.currentAllocation}%` }}
              ></div>
             </div>
            </div>
            <span className="text-sm font-medium text-gray-900">{resource.currentAllocation}%</span>
           </div>
          </div>
         </td>
         <td className="px-3 py-2">
          <p className={`text-sm font-semibold ${getAvailabilityColor(resource.availability)}`}>
           {resource.availability}%
          </p>
         </td>
         <td className="px-3 py-2">
          <p className="text-sm text-gray-900">{formatCurrency(resource.costRate)}/day</p>
         </td>
         <td className="px-3 py-2">
          <div className="flex items-center gap-2">
           <button
            onClick={() => openWorkloadModal(resource)}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
           >
            <Activity className="w-4 h-4" />
            Workload
           </button>
           <button
            onClick={() => openAllocateModalForResource(resource)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
           >
            <UserCheck className="w-4 h-4" />
            Allocate
           </button>
          </div>
         </td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
   </div>

   {/* Current Allocations */}
   <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
     <h2 className="text-xl font-semibold text-gray-900">Current Allocations</h2>
    </div>

    <div className="divide-y divide-gray-200">
     {allocations.map((allocation) => {
      const resource = resources.find(r => r.id === allocation.resourceId);
      const cost = resource ? calculateResourceCost(resource, allocation.allocatedHours) : 0;

      return (
       <div key={allocation.id} className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-start justify-between">
         <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
           <h3 className="text-lg font-semibold text-gray-900">{allocation.resourceName}</h3>
           <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
            {allocation.role}
           </span>
           <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            {allocation.allocation}% allocated
           </span>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-3">
           <div>
            <p className="text-xs text-gray-500">Project Phase</p>
            <p className="text-sm font-medium text-gray-900">{allocation.projectPhase}</p>
           </div>
           <div>
            <p className="text-xs text-gray-500">Duration</p>
            <div className="flex items-center gap-1 mt-1">
             <Calendar className="w-3 h-3 text-gray-400" />
             <p className="text-sm font-medium text-gray-900">
              {formatDate(allocation.startDate)} - {formatDate(allocation.endDate)}
             </p>
            </div>
           </div>
           <div>
            <p className="text-xs text-gray-500">Allocated Hours</p>
            <p className="text-sm font-medium text-gray-900">{allocation.allocatedHours} hours</p>
            <p className="text-xs text-gray-500">{Math.round(allocation.allocatedHours / 8)} days</p>
           </div>
           <div>
            <p className="text-xs text-gray-500">Estimated Cost</p>
            <p className="text-sm font-semibold text-purple-900">{formatCurrency(cost)}</p>
           </div>
          </div>
         </div>

         <div className="flex items-center gap-2">
          <button
           onClick={() => openEditModal(allocation)}
           className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
           <Edit className="w-4 h-4" />
           Edit
          </button>
          <button
           onClick={() => openReassignModal(allocation)}
           className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
           <RefreshCw className="w-4 h-4" />
           Reassign
          </button>
          <button
           onClick={() => openDetailsModal(allocation)}
           className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
           <Eye className="w-4 h-4" />
           Details
          </button>
          <button
           onClick={() => openDeleteModal(allocation)}
           className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
           <Trash2 className="w-4 h-4" />
           Delete
          </button>
         </div>
        </div>
       </div>
      );
     })}
    </div>
   </div>

   {/* Add Allocation Modal */}
   {showAddModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
      <div className="p-6 border-b border-gray-200">
       <h2 className="text-xl font-semibold text-gray-900">Allocate Resource</h2>
      </div>

      <div className="p-6 space-y-2">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Resource</label>
        <select
         value={selectedResource}
         onChange={(e) => setSelectedResource(e.target.value)}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
         <option value="">Choose a resource</option>
         {resources.filter(r => r.availability > 0).map(resource => (
          <option key={resource.id} value={resource.id}>
           {resource.name} - {resource.role} ({resource.availability}% available)
          </option>
         ))}
        </select>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project Phase</label>
        <input
         type="text"
         value={newAllocation.projectPhase}
         onChange={(e) => setNewAllocation({ ...newAllocation, projectPhase: e.target.value })}
         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         placeholder="e.g., Equipment Installation"
        />
       </div>

       <div className="grid grid-cols-2 gap-2">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
         <input
          type="date"
          value={newAllocation.startDate}
          onChange={(e) => setNewAllocation({ ...newAllocation, startDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
         <input
          type="date"
          value={newAllocation.endDate}
          onChange={(e) => setNewAllocation({ ...newAllocation, endDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
         />
        </div>
       </div>

       <div className="grid grid-cols-2 gap-2">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Allocated Hours</label>
         <input
          type="number"
          value={newAllocation.allocatedHours}
          onChange={(e) => setNewAllocation({ ...newAllocation, allocatedHours: parseInt(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Allocation %</label>
         <input
          type="number"
          value={newAllocation.allocation}
          onChange={(e) => setNewAllocation({ ...newAllocation, allocation: parseInt(e.target.value) })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0"
          min="0"
          max="100"
         />
        </div>
       </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
       <button
        onClick={() => setShowAddModal(false)}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
       >
        Cancel
       </button>
       <button
        onClick={handleAddAllocation}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
       >
        <Save className="w-5 h-5" />
        Allocate
       </button>
      </div>
     </div>
    </div>
   )}

   {/* All 10 Modal Components */}
   <AllocateResourceModal
    isOpen={showAllocateModal}
    onClose={() => setShowAllocateModal(false)}
    onAllocate={handleAllocate}
   />

   <EditAllocationModal
    isOpen={showEditModal}
    onClose={() => {
     setShowEditModal(false);
     setSelectedAllocation(null);
    }}
    onEdit={handleEdit}
    allocation={selectedAllocation}
   />

   <ReassignResourceModal
    isOpen={showReassignModal}
    onClose={() => {
     setShowReassignModal(false);
     setSelectedAllocation(null);
    }}
    onReassign={handleReassign}
   />

   <BulkAllocateModal
    isOpen={showBulkAllocateModal}
    onClose={() => setShowBulkAllocateModal(false)}
    onAllocate={handleBulkAllocate}
   />

   <ViewWorkloadModal
    isOpen={showWorkloadModal}
    onClose={() => {
     setShowWorkloadModal(false);
     setSelectedResourceForWorkload(null);
    }}
    resource={selectedResourceForWorkload}
   />

   <SetCapacityModal
    isOpen={showCapacityModal}
    onClose={() => setShowCapacityModal(false)}
    onSet={handleSetCapacity}
   />

   <FilterAllocationModal
    isOpen={showFilterModal}
    onClose={() => setShowFilterModal(false)}
    onApply={handleApplyFilter}
   />

   <ExportAllocationModal
    isOpen={showExportModal}
    onClose={() => setShowExportModal(false)}
    onExport={handleExport}
   />

   <DeleteAllocationModal
    isOpen={showDeleteModal}
    onClose={() => {
     setShowDeleteModal(false);
     setSelectedAllocation(null);
    }}
    onDelete={handleDelete}
   />

   <ViewDetailsModal
    isOpen={showDetailsModal}
    onClose={() => {
     setShowDetailsModal(false);
     setSelectedAllocation(null);
    }}
    allocation={selectedAllocation}
   />
   </div>
  </div>
 );
}
