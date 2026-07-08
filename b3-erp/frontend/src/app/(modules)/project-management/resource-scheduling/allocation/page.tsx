'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

// ... [Copying the interfaces and mock data from the original file] ...
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

export default function AllocationMatrixPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const refreshAllocations = async () => {
    const rows = await projectManagementService.listResourceAllocations();
    setAllocations((rows ?? []).map((r) => ({
      id: r.id,
      resourceId: r.resourceId || '',
      resourceName: r.resourceName || '',
      role: r.role || '',
      projectPhase: r.projectPhase || '',
      allocatedHours: r.allocatedHours ?? 0,
      startDate: r.startDate || '',
      endDate: r.endDate || '',
      allocation: r.allocation ?? 0,
    })));
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        // Load the resource picker from the real employee master.
        const employees = await EmployeeService.getAllEmployees();
        if (!active) return;
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
        await refreshAllocations();
        if (!active) return;
        setError(null);
      } catch (e) {
        if (active) setError('Failed to load resource allocations');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const runAction = async (fn: () => Promise<void>, success: string, close: () => void) => {
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await fn();
      await refreshAllocations();
      setActionSuccess(success);
      close();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };
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

  const handleAddAllocation = async () => {
    if (!selectedResource || !newAllocation.projectPhase) return;

    const resource = resources.find(r => r.id === selectedResource);
    if (!resource) return;

    await runAction(
      () =>
        projectManagementService.createResourceAllocation({
          resourceId: resource.id,
          resourceName: resource.name,
          role: resource.role,
          projectPhase: newAllocation.projectPhase,
          allocatedHours: newAllocation.allocatedHours,
          startDate: newAllocation.startDate || undefined,
          endDate: newAllocation.endDate || undefined,
          allocation: newAllocation.allocation,
        }).then(() => undefined),
      'Resource allocated successfully',
      () => {
        setShowAddModal(false);
        setSelectedResource('');
        setNewAllocation({
          projectPhase: '',
          allocatedHours: 0,
          startDate: '',
          endDate: '',
          allocation: 0,
        });
      }
    );
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
    const match = resources.find(
      (r) => r.name.toLowerCase() === String(data?.resource ?? '').toLowerCase()
    );
    runAction(
      () =>
        projectManagementService.createResourceAllocation({
          resourceId: match ? match.id : String(data?.resource ?? ''),
          resourceName: match ? match.name : String(data?.resource ?? ''),
          role: match?.role,
          projectPhase: String(data?.task ?? ''),
          allocatedHours: data?.hours ? Number(data.hours) : 0,
        }).then(() => undefined),
      'Resource allocated successfully',
      () => setShowAllocateModal(false)
    );
  };

  const handleEdit = (data: any) => {
    if (!selectedAllocation) return;
    runAction(
      () =>
        projectManagementService.updateResourceAllocation(selectedAllocation.id, {
          allocatedHours: data?.hours != null ? Number(data.hours) : selectedAllocation.allocatedHours,
        }).then(() => undefined),
      'Allocation updated',
      () => {
        setShowEditModal(false);
        setSelectedAllocation(null);
      }
    );
  };

  const handleReassign = (data: any) => {
    if (!selectedAllocation) return;
    const match = resources.find(
      (r) => r.name.toLowerCase() === String(data?.newResource ?? '').toLowerCase()
    );
    runAction(
      () =>
        projectManagementService.updateResourceAllocation(selectedAllocation.id, {
          resourceId: match ? match.id : String(data?.newResource ?? ''),
          resourceName: match ? match.name : String(data?.newResource ?? ''),
          role: match?.role ?? selectedAllocation.role,
        }).then(() => undefined),
      'Resource reassigned',
      () => {
        setShowReassignModal(false);
        setSelectedAllocation(null);
      }
    );
  };

  const handleBulkAllocate = (data: any) => {
    const projectPhase = String(data?.tasks ?? '').split(',')[0]?.trim();
    const names = String(data?.resources ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    runAction(
      async () => {
        for (const name of names) {
          const match = resources.find((r) => r.name.toLowerCase() === name.toLowerCase());
          await projectManagementService.createResourceAllocation({
            resourceId: match ? match.id : name,
            resourceName: match ? match.name : name,
            role: match?.role,
            projectPhase,
          });
        }
      },
      'Resources allocated',
      () => setShowBulkAllocateModal(false)
    );
  };

  const handleSetCapacity = (data: any) => {
    // Capacity setting has no dedicated backend endpoint; reflect it locally.
    const cap = Number(data?.capacity ?? data ?? 0);
    if (cap > 0) {
      setResources((prev) => prev.map((r) => ({ ...r, availability: cap })));
    }
    setShowCapacityModal(false);
  };

  const handleApplyFilter = (filters: any) => {
    if (filters?.resource && filters.resource !== 'all') {
      setSearchTerm(String(filters.resource));
    }
    setShowFilterModal(false);
  };

  const handleExport = (data: any) => {
    exportToCsv('resource-allocation', filteredResources as unknown as Record<string, unknown>[]);
    setShowExportModal(false);
  };

  const handleDelete = async () => {
    if (!selectedAllocation) {
      setShowDeleteModal(false);
      return;
    }
    await runAction(
      () => projectManagementService.deleteResourceAllocation(selectedAllocation.id),
      'Allocation deleted',
      () => {
        setShowDeleteModal(false);
        setSelectedAllocation(null);
      }
    );
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2">{error}</div>
      )}
      {loading && (
        <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2">Loading allocations…</div>
      )}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2">{actionSuccess}</div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className=" px-3 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Allocation Matrix</h1>
                <p className="text-sm text-gray-500">Detailed view of resource assignments and capacity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
        <div className=" space-y-3">
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
                                  className={`h-2 rounded-full ${resource.currentAllocation === 100 ? 'bg-red-500' :
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
              {!loading && allocations.length === 0 && (
                <div className="p-10 text-center text-sm font-bold text-gray-400">No allocations found.</div>
              )}
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
        </div>
      </div>

      {/* Modals */}
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
  );
}
