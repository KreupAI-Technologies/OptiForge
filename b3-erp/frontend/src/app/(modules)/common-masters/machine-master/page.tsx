'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Settings, Activity, AlertCircle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Machine } from '@/data/common-masters/machines';
import { manufacturingMastersService, Machine as BackendMachine } from '@/services/manufacturing-masters.service';
import { exportToCsv } from '@/lib/export';

const DEFAULT_COMPANY_ID = '1';

export default function MachineMasterPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    machineCode: '',
    machineName: '',
    machineType: 'cutting',
    manufacturer: '',
    model: '',
    capacity: '',
    status: 'running',
  });

  // Fetch machines from the live backend, mapping the flat API shape into the page's nested Machine model.
  const fetchMachines = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await manufacturingMastersService.getAllMachines(DEFAULT_COMPANY_ID)) as any[];
      const statusToOperational: Record<string, Machine['operationalStatus']> = {
        running: 'running', idle: 'idle', maintenance: 'maintenance',
        breakdown: 'breakdown', retired: 'retired',
      };
      const mapped: Machine[] = raw.map((m) => ({
          id: String(m.id ?? ''),
          machineCode: m.machineCode ?? m.code ?? '',
          machineName: m.machineName ?? m.name ?? '',
          machineType: (m.machineType ?? 'cutting') as Machine['machineType'],
          category: (m.category ?? 'production') as Machine['category'],
          manufacturer: m.manufacturer ?? '',
          model: m.model ?? '',
          serialNumber: m.serialNumber ?? '',
          location: m.location ?? '',
          workCenter: m.workCenter?.name ?? m.workCenter ?? '',
          department: m.department ?? '',
          capacity: {
            unit: m.capacity?.unit ?? 'units',
            perHour: Number(m.capacity?.perHour ?? 0),
            perShift: Number(m.capacity?.perShift ?? 0),
            perDay: Number(m.capacity?.perDay ?? 0),
          },
          specifications: {
            powerRating: m.specifications?.powerRating ?? m.power ?? '',
            voltage: m.specifications?.voltage ?? '',
            dimensions: m.specifications?.dimensions ?? m.dimensions ?? '',
            weight: m.specifications?.weight ?? (m.weight !== null && m.weight !== undefined ? String(m.weight) : ''),
          },
          operatorRequired: Number(m.operatorRequired ?? 0),
          skillLevel: (m.skillLevel ?? 'basic') as Machine['skillLevel'],
          setupTime: Number(m.setupTime ?? 0),
          cycleTime: Number(m.cycleTime ?? 0),
          maintenance: {
            lastDate: m.maintenance?.lastDate ?? '',
            nextDate: m.maintenance?.nextDate ?? '',
            frequency: (m.maintenance?.frequency ?? 'monthly') as Machine['maintenance']['frequency'],
            type: (m.maintenance?.type ?? 'preventive') as Machine['maintenance']['type'],
          },
          purchaseDate: m.purchaseDate ?? '',
          purchaseCost: Number(m.purchaseCost ?? 0),
          currency: m.currency ?? 'INR',
          depreciationRate: Number(m.depreciationRate ?? 0),
          currentValue: Number(m.currentValue ?? 0),
          oee: Number(m.oee ?? 0),
          availability: Number(m.availability ?? 0),
          performance: Number(m.performance ?? m.efficiency ?? 0),
          quality: Number(m.quality ?? 0),
          downtimeHours: Number(m.downtimeHours ?? 0),
          utilizationRate: Number(m.utilizationRate ?? 0),
          safetyInstructions: Array.isArray(m.safetyInstructions) ? m.safetyInstructions : [],
          requiresSafetyTraining: m.requiresSafetyTraining ?? false,
          lastSafetyInspection: m.lastSafetyInspection ?? undefined,
          operationalStatus: statusToOperational[m.status] ?? (m.operationalStatus ?? 'idle') as Machine['operationalStatus'],
          isActive: m.isActive ?? true,
          createdAt: m.createdAt ?? '',
          updatedAt: m.updatedAt ?? '',
          notes: m.notes ?? undefined,
        }));
        setMachines(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load machines');
      setMachines([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleViewMachine = (machine: Machine) => {
    showToast(`Viewing machine: ${machine.machineName}`, 'info');
  };

  const openCreateModal = () => {
    setForm({
      machineCode: '',
      machineName: '',
      machineType: 'cutting',
      manufacturer: '',
      model: '',
      capacity: '',
      status: 'running',
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditMachine = (machine: Machine) => {
    setForm({
      machineCode: machine.machineCode,
      machineName: machine.machineName,
      machineType: machine.machineType,
      manufacturer: machine.manufacturer,
      model: machine.model,
      capacity: machine.capacity?.unit ?? '',
      status: machine.operationalStatus,
    });
    setEditingId(machine.id);
    setIsModalOpen(true);
  };

  const handleSaveMachine = async () => {
    if (!form.machineCode.trim() || !form.machineName.trim()) {
      showToast('Machine Code and Name are required', 'error');
      return;
    }
    try {
      setIsSaving(true);
      const base: Partial<BackendMachine> = {
        machineName: form.machineName,
        manufacturer: form.manufacturer,
        model: form.model,
        capacity: form.capacity,
        status: form.status,
      };
      if (editingId) {
        await manufacturingMastersService.updateMachine(editingId, base);
      } else {
        await manufacturingMastersService.createMachine({
          ...base,
          machineCode: form.machineCode,
          machineName: form.machineName,
          companyId: DEFAULT_COMPANY_ID,
        });
      }
      setIsModalOpen(false);
      await fetchMachines();
      showToast(editingId ? 'Machine updated successfully' : 'Machine created successfully', 'success');
    } catch (error) {
      console.error('Error saving machine:', error);
      showToast('Failed to save machine', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMachine = async (machine: Machine) => {
    if (!confirm(`Delete machine "${machine.machineName}"?`)) {
      return;
    }
    try {
      await manufacturingMastersService.deleteMachine(machine.id);
      await fetchMachines();
      showToast('Machine deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting machine:', error);
      showToast('Failed to delete machine', 'error');
    }
  };

  const handleScheduleMaintenance = (machine: Machine) => {
    showToast(`Scheduling maintenance for: ${machine.machineName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('machine-master', filteredData);
    showToast('Exporting machines data...', 'success');
  };

  const handleAddMachine = () => {
    openCreateModal();
  };

  // Get unique locations
  const locations = useMemo(() => {
    return Array.from(new Set(machines.map(m => m.location))).sort();
  }, [machines]);

  // Filtered data
  const filteredData = useMemo(() => {
    return machines.filter(machine => {
      const matchesSearch =
        machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.machineCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || machine.machineType === filterType;
      const matchesStatus = filterStatus === 'all' || machine.operationalStatus === filterStatus;
      const matchesLocation = filterLocation === 'all' || machine.location === filterLocation;

      return matchesSearch && matchesType && matchesStatus && matchesLocation;
    });
  }, [machines, searchTerm, filterType, filterStatus, filterLocation]);

  const getTypeColor = (type: string) => {
    const colors = {
      'cutting': 'bg-blue-100 text-blue-800',
      'bending': 'bg-purple-100 text-purple-800',
      'welding': 'bg-orange-100 text-orange-800',
      'finishing': 'bg-green-100 text-green-800',
      'assembly': 'bg-yellow-100 text-yellow-800',
      'cnc': 'bg-indigo-100 text-indigo-800',
      'laser': 'bg-red-100 text-red-800',
      'press': 'bg-pink-100 text-pink-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'running': 'bg-green-100 text-green-800',
      'idle': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-blue-100 text-blue-800',
      'breakdown': 'bg-red-100 text-red-800',
      'retired': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getOEEColor = (oee: number) => {
    if (oee >= 85) return 'text-green-600';
    if (oee >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Table columns
  const columns: Column<Machine>[] = [
    {
      id: 'machine',
      header: 'Machine',
      accessor: 'machineName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{row.machineCode}</span>
          </div>
          <div className="text-xs text-gray-500">{row.manufacturer} {row.model}</div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'machineType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      id: 'location',
      header: 'Location',
      accessor: 'location',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{row.workCenter}</div>
        </div>
      )
    },
    {
      id: 'capacity',
      header: 'Capacity',
      accessor: 'capacity',
      sortable: false,
      render: (value) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value.perHour} {value.unit}/hr</div>
          <div className="text-xs text-gray-500">{value.perDay} {value.unit}/day</div>
        </div>
      )
    },
    {
      id: 'oee',
      header: 'OEE',
      accessor: 'oee',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className={`font-bold ${getOEEColor(value)}`}>{value}%</div>
          <div className="text-xs text-gray-500">
            A: {row.availability}% | P: {row.performance}%
          </div>
        </div>
      )
    },
    {
      id: 'utilization',
      header: 'Utilization',
      accessor: 'utilizationRate',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}%</div>
          <div className="text-xs text-gray-500">DT: {row.downtimeHours}h</div>
        </div>
      )
    },
    {
      id: 'maintenance',
      header: 'Next Maintenance',
      accessor: 'maintenance',
      sortable: false,
      render: (value) => (
        <div className="text-xs">
          <div className="text-gray-900">{new Date(value.nextDate).toLocaleDateString()}</div>
          <div className="text-gray-500 capitalize">{value.frequency}</div>
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'operationalStatus',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleViewMachine(row);
            }}
          >
            View
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMachine(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleScheduleMaintenance(row);
            }}
          >
            Maintain
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMachine(row);
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterLocation('all');
  };

  const activeFilterCount = [
    filterType !== 'all',
    filterStatus !== 'all',
    filterLocation !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics — computed from the fetched machine list
  const stats = useMemo(() => {
    const runningMachines = machines.filter(m => m.operationalStatus === 'running');
    const avgOEE = runningMachines.length
      ? runningMachines.reduce((sum, m) => sum + m.oee, 0) / runningMachines.length
      : 0;
    const avgUtilization = machines.length
      ? machines.reduce((sum, m) => sum + m.utilizationRate, 0) / machines.length
      : 0;
    return {
      total: machines.length,
      running: runningMachines.length,
      idle: machines.filter(m => m.operationalStatus === 'idle').length,
      maintenance: machines.filter(m => m.operationalStatus === 'maintenance').length,
      breakdown: machines.filter(m => m.operationalStatus === 'breakdown').length,
      avgOEE: Math.round(avgOEE * 10) / 10,
      avgUtilization: Math.round(avgUtilization * 10) / 10,
      totalValue: machines.reduce((sum, m) => sum + m.currentValue, 0),
    };
  }, [machines]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-3">
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-7 h-7 text-blue-600" />
                Machine Master
              </h1>
              <p className="text-gray-600 mt-1">Manage production machines, capacity, and maintenance schedules</p>
            </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleAddMachine}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Machine</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Machines</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Activity className="w-3 h-3 text-green-600" /> Running
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.running}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">In Maintenance</div>
          <div className="text-2xl font-bold text-blue-600">{stats.maintenance}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-600" /> Breakdown
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.breakdown}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Avg OEE
          </div>
          <div className={`text-2xl font-bold ${getOEEColor(stats.avgOEE)}`}>{stats.avgOEE}%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Utilization</div>
          <div className="text-2xl font-bold text-purple-600">{stats.avgUtilization}%</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by machine name, code, manufacturer, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Machine Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="cutting">Cutting</option>
                <option value="bending">Bending</option>
                <option value="welding">Welding</option>
                <option value="finishing">Finishing</option>
                <option value="assembly">Assembly</option>
                <option value="cnc">CNC</option>
                <option value="laser">Laser</option>
                <option value="press">Press</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operational Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Maintenance</option>
                <option value="breakdown">Breakdown</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading machines…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && machines.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No machines found.
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={{
            enabled: true,
            pageSize: 10
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'machine', direction: 'asc' }
          }}
          emptyMessage="No machines found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Overall Equipment Effectiveness (OEE) Tracking
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ OEE = Availability × Performance × Quality (Target: 85%+)</li>
          <li>✓ Preventive maintenance scheduled based on manufacturer recommendations</li>
          <li>✓ Real-time capacity monitoring for production planning</li>
          <li>✓ Downtime tracking for continuous improvement initiatives</li>
          <li>✓ Safety inspections mandatory before operation of critical equipment</li>
          <li>✓ Machine depreciation calculated using straight-line method</li>
        </ul>
      </div>
        </div>
      </div>

      {/* Add/Edit Machine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Machine' : 'Add Machine'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Code</label>
                <input
                  type="text"
                  value={form.machineCode}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, machineCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name</label>
                <input
                  type="text"
                  value={form.machineName}
                  onChange={(e) => setForm({ ...form, machineName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Type</label>
                <select
                  value={form.machineType}
                  onChange={(e) => setForm({ ...form, machineType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cutting">Cutting</option>
                  <option value="bending">Bending</option>
                  <option value="welding">Welding</option>
                  <option value="finishing">Finishing</option>
                  <option value="assembly">Assembly</option>
                  <option value="cnc">CNC</option>
                  <option value="laser">Laser</option>
                  <option value="press">Press</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="running">Running</option>
                  <option value="idle">Idle</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="breakdown">Breakdown</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="text"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMachine}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
