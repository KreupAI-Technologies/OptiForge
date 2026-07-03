'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, GitBranch, Clock, AlertTriangle, Users, CheckCircle, XCircle, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Operation, getOperationStats } from '@/data/common-masters/operations';
import { manufacturingMastersService, Operation as BackendOperation } from '@/services/manufacturing-masters.service';
import { exportToCsv } from '@/lib/export';

export default function OperationMasterPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllOperations('1');
      // Backend returns a subset of the rich display Operation shape.
      const mapped = data.map((op: BackendOperation) => ({
        id: op.id,
        operationCode: op.code,
        operationName: op.name,
        description: op.description || '',
        operationType: 'machining' as any,
        category: 'manufacturing' as any,
        cycleTime: op.runTime || 0,
        setupTime: op.setupTime || 0,
        avgActualCycleTime: op.runTime || 0,
        operatorsRequired: 1,
        helpersRequired: 0,
        requiredSkill: 'intermediate' as any,
        capacityPerHour: 60 / (op.runTime || 1),
        capacityPerShift: (60 / (op.runTime || 1)) * 8,
        efficiencyFactor: 100,
        defectRate: 0,
        requiresInspection: false,
        inspectionType: undefined,
        safetyGear: [],
        riskLevel: 'low' as any,
        laborCostPerHour: 0,
        machineRatePerHour: 0,
        materialWastagePercent: 0,
        isActive: true,
      }));
      setOperations(mapped as unknown as Operation[]);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleViewOperation = (operation: Operation) => {
    showToast(`Viewing operation: ${operation.operationName}`, 'info');
  };

  const handleEditOperation = (operation: Operation) => {
    showToast(`Editing operation: ${operation.operationName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('operation-master', filteredData);
    showToast('Exporting operations data...', 'success');
  };

  const handleAddOperation = () => {
    showToast('Opening add operation form...', 'info');
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return operations.filter(operation => {
      const matchesSearch =
        operation.operationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.operationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        operation.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || operation.operationType === filterType;
      const matchesCategory = filterCategory === 'all' || operation.category === filterCategory;
      const matchesRisk = filterRisk === 'all' || operation.riskLevel === filterRisk;

      return matchesSearch && matchesType && matchesCategory && matchesRisk;
    });
  }, [operations, searchTerm, filterType, filterCategory, filterRisk]);


  const getTypeColor = (type: string) => {
    const colors = {
      'cutting': 'bg-blue-100 text-blue-800',
      'bending': 'bg-purple-100 text-purple-800',
      'welding': 'bg-orange-100 text-orange-800',
      'finishing': 'bg-green-100 text-green-800',
      'assembly': 'bg-yellow-100 text-yellow-800',
      'inspection': 'bg-pink-100 text-pink-800',
      'packaging': 'bg-indigo-100 text-indigo-800',
      'machining': 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDefectColor = (rate: number) => {
    if (rate <= 2) return 'text-green-600';
    if (rate <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Table columns
  const columns: Column<Operation>[] = [
    {
      id: 'operation',
      header: 'Operation',
      accessor: 'operationName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">
            <span className="font-mono font-semibold text-blue-600">{row.operationCode}</span>
          </div>
          <div className="text-xs text-gray-500">{row.description.substring(0, 40)}...</div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'operationType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      id: 'timing',
      header: 'Timing',
      accessor: 'cycleTime',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-900">{value} min</span>
          </div>
          <div className="text-xs text-gray-500">Setup: {row.setupTime}m</div>
          <div className="text-xs text-gray-500">Actual: {row.avgActualCycleTime}m</div>
        </div>
      )
    },
    {
      id: 'capacity',
      header: 'Capacity',
      accessor: 'capacityPerHour',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{value}/hr</div>
          <div className="text-xs text-gray-500">{row.capacityPerShift}/shift</div>
          <div className="text-xs text-gray-500">Eff: {row.efficiencyFactor}%</div>
        </div>
      )
    },
    {
      id: 'manpower',
      header: 'Manpower',
      accessor: 'operatorsRequired',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-gray-400" />
            <span>{value} Op</span>
            {row.helpersRequired > 0 && <span className="text-gray-500">+ {row.helpersRequired} Hlp</span>}
          </div>
          <div className={`text-xs font-medium capitalize ${row.requiredSkill === 'expert' ? 'text-red-600' :
              row.requiredSkill === 'advanced' ? 'text-orange-600' :
                row.requiredSkill === 'intermediate' ? 'text-yellow-600' : 'text-green-600'
            }`}>
            {row.requiredSkill}
          </div>
        </div>
      )
    },
    {
      id: 'quality',
      header: 'Quality',
      accessor: 'defectRate',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className={`font-bold ${getDefectColor(value)}`}>{value}%</div>
          <div className="text-xs text-gray-500">
            {row.requiresInspection ? `✓ ${row.inspectionType}` : '✗ No QC'}
          </div>
        </div>
      )
    },
    {
      id: 'cost',
      header: 'Cost/Hour',
      accessor: 'laborCostPerHour',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">₹{value + row.machineRatePerHour}</div>
          <div className="text-xs text-gray-500">L: ₹{value}</div>
          <div className="text-xs text-gray-500">M: ₹{row.machineRatePerHour}</div>
        </div>
      )
    },
    {
      id: 'risk',
      header: 'Risk',
      accessor: 'riskLevel',
      sortable: true,
      render: (value, row) => (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRiskColor(value)}`}>
            {value === 'high' || value === 'critical' ? '⚠ ' : ''}{value}
          </span>
          {row.safetyGear.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">{row.safetyGear.length} safety items</div>
          )}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          text={value ? 'Active' : 'Inactive'}
        />
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
              handleViewOperation(row);
            }}
          >
            View
          </button>
          <button
            className="text-green-600 hover:text-green-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditOperation(row);
            }}
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterRisk('all');
  };

  const activeFilterCount = [
    filterType !== 'all',
    filterCategory !== 'all',
    filterRisk !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics
  const stats = useMemo(() => getOperationStats(), [operations]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-3">
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircleIcon className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <GitBranch className="w-7 h-7 text-blue-600" />
                Operation Master
              </h1>
              <p className="text-gray-600 mt-1">Manage production operations, routing, and process standards</p>
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
                onClick={handleAddOperation}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Operation</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1">Total Operations</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1">Manufacturing</div>
              <div className="text-2xl font-bold text-blue-600">{stats.manufacturing}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-600" /> High Risk
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.highRisk}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Avg Cycle
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.avgCycleTime}m</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1">Avg Defect</div>
              <div className={`text-2xl font-bold ${getDefectColor(stats.avgDefectRate)}`}>{stats.avgDefectRate}%</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1">Utilization</div>
              <div className="text-2xl font-bold text-green-600">{stats.avgUtilization}%</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by operation name, code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
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
                    Operation Type
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
                    <option value="inspection">Inspection</option>
                    <option value="packaging">Packaging</option>
                    <option value="machining">Machining</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="quality">Quality</option>
                    <option value="material_handling">Material Handling</option>
                    <option value="setup">Setup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            )}
          </div>

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
                defaultSort: { column: 'operation', direction: 'asc' }
              }}
              emptyMessage="No operations found"
              emptyDescription="Try adjusting your search or filters to find what you're looking for."
            />
          </div>

          {/* Information Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Production Routing & Process Standards
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 ml-7">
              <li>✓ Standard cycle times used for production planning and capacity calculations</li>
              <li>✓ Setup and teardown times included in manufacturing lead time estimation</li>
              <li>✓ Quality checkpoints ensure conformance to specifications at each stage</li>
              <li>✓ Safety gear and training requirements mandatory for high-risk operations</li>
              <li>✓ Material wastage percentages factored into BOM and costing</li>
              <li>✓ Operation sequencing defines manufacturing process flow and routing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
