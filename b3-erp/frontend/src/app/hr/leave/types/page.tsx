'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Calendar, Check, Banknote } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LeaveType } from '@/data/hr/leave-types';
import { LeaveService } from '@/services/leave.service';
import { AddLeaveTypeModal } from '@/components/hr/AddLeaveTypeModal';
import { exportToCsv } from '@/lib/export';

const ACCRUAL_MAP: Record<string, LeaveType['accrualType']> = {
  Monthly: 'monthly',
  Yearly: 'yearly',
  Annual: 'yearly',
  None: 'none',
};

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await LeaveService.getAllLeaveTypesRaw()) as any[];
        const mapped: LeaveType[] = raw.map((r) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          shortName: r.code,
          description: r.description ?? '',
          maxDaysPerYear: Number(r.maxDaysPerYear ?? 0),
          maxConsecutiveDays: r.maxDaysPerApplication != null ? Number(r.maxDaysPerApplication) : undefined,
          carryForward: !!r.allowCarryForward,
          carryForwardLimit: r.maxCarryForward != null ? Number(r.maxCarryForward) : undefined,
          encashable: !!r.allowEncashment,
          encashmentLimit: r.maxEncashmentDays != null ? Number(r.maxEncashmentDays) : undefined,
          paidLeave: !!r.isPaid,
          requiresApproval: !!r.requiresApproval,
          advanceNoticeDays: Number(r.minAdvanceNoticeDays ?? 0),
          applicableFor: 'all',
          color: r.color ?? 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '📅',
          isActive: (r.status ?? 'Active') === 'Active',
          accrualType: ACCRUAL_MAP[r.accrualType] ?? 'none',
          accrualRate: r.accrualRate != null ? Number(r.accrualRate) : undefined,
          createdAt: r.createdAt ?? '',
          updatedAt: r.updatedAt ?? '',
        }));
        if (!cancelled) setLeaveTypes(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load leave types');
          setLeaveTypes([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaidLeave, setFilterPaidLeave] = useState<string>('all');
  const [filterEncashable, setFilterEncashable] = useState<string>('all');
  const [filterCarryForward, setFilterCarryForward] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);

  // Filtered data
  const filteredData = useMemo(() => {
    return leaveTypes.filter(leave => {
      const matchesSearch =
        leave.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPaid = filterPaidLeave === 'all' ||
        (filterPaidLeave === 'paid' && leave.paidLeave) ||
        (filterPaidLeave === 'unpaid' && !leave.paidLeave);

      const matchesEncashable = filterEncashable === 'all' ||
        (filterEncashable === 'yes' && leave.encashable) ||
        (filterEncashable === 'no' && !leave.encashable);

      const matchesCarryForward = filterCarryForward === 'all' ||
        (filterCarryForward === 'yes' && leave.carryForward) ||
        (filterCarryForward === 'no' && !leave.carryForward);

      return matchesSearch && matchesPaid && matchesEncashable && matchesCarryForward;
    });
  }, [leaveTypes, searchTerm, filterPaidLeave, filterEncashable, filterCarryForward]);

  // Table columns
  const columns: Column<LeaveType>[] = [
    {
      id: 'icon',
      header: '',
      accessor: 'icon',
      sortable: false,
      width: 'w-12',
      align: 'center',
      render: (value) => <span className="text-2xl">{value}</span>
    },
    {
      id: 'code',
      header: 'Code',
      accessor: 'code',
      sortable: true,
      width: 'w-20',
      render: (value) => <span className="font-mono font-semibold text-blue-600">{value}</span>
    },
    {
      id: 'name',
      header: 'Leave Type',
      accessor: 'name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      id: 'maxDays',
      header: 'Max Days/Year',
      accessor: 'maxDaysPerYear',
      sortable: true,
      align: 'center',
      render: (value, row) => (
        <div className="text-center">
          <div className="font-semibold text-gray-900">{value}</div>
          {row.maxConsecutiveDays && (
            <div className="text-xs text-gray-500">Max {row.maxConsecutiveDays} consecutive</div>
          )}
        </div>
      )
    },
    {
      id: 'accrual',
      header: 'Accrual',
      accessor: 'accrualType',
      sortable: true,
      render: (value, row) => {
        if (value === 'none') return <span className="text-gray-400">No Accrual</span>;
        return (
          <div className="text-sm">
            <div className="capitalize">{value}</div>
            {row.accrualRate && (
              <div className="text-xs text-gray-500">{row.accrualRate} days/month</div>
            )}
          </div>
        );
      }
    },
    {
      id: 'features',
      header: 'Features',
      accessor: 'id',
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.paidLeave && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Paid
            </span>
          )}
          {row.carryForward && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              CF: {row.carryForwardLimit}
            </span>
          )}
          {row.encashable && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              Encash: {row.encashmentLimit}
            </span>
          )}
        </div>
      )
    },
    {
      id: 'applicableFor',
      header: 'Applicable For',
      accessor: 'applicableFor',
      sortable: true,
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
          {value}
        </span>
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
              setEditingLeaveType(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete ${row.name}?`)) {
                setLeaveTypes(prev => prev.filter(lt => lt.id !== row.id));
              }
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
    setFilterPaidLeave('all');
    setFilterEncashable('all');
    setFilterCarryForward('all');
  };

  const handleAddLeaveType = (data: any) => {
    const newLeaveType: LeaveType = {
      ...data,
      id: `LT${(leaveTypes.length + 1).toString().padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
      modifiedDate: new Date().toISOString().split('T')[0]
    };
    setLeaveTypes([...leaveTypes, newLeaveType]);
    setIsAddModalOpen(false);
  };

  const handleEditLeaveType = (data: any) => {
    setLeaveTypes(leaveTypes.map(lt =>
      lt.id === editingLeaveType?.id
        ? { ...lt, ...data, modifiedDate: new Date().toISOString().split('T')[0] }
        : lt
    ));
    setEditingLeaveType(null);
  };

  const activeFilterCount = [
    filterPaidLeave !== 'all',
    filterEncashable !== 'all',
    filterCarryForward !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-green-600" />
            Leave Types
          </h1>
          <p className="text-gray-600 mt-1">Configure and manage leave categories for kitchen manufacturing workforce</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCsv('leave-types', filteredData)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave Type</span>
          </button>
        </div>
      </div>

      {/* Loading / Error Banners */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm">
          Loading leave types…
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm">
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Leave Types</div>
          <div className="text-2xl font-bold text-gray-900">{leaveTypes.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Paid Leaves</div>
          <div className="text-2xl font-bold text-green-600">
            {leaveTypes.filter(lt => lt.paidLeave).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Encashable</div>
          <div className="text-2xl font-bold text-purple-600">
            {leaveTypes.filter(lt => lt.encashable).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Carry Forward</div>
          <div className="text-2xl font-bold text-blue-600">
            {leaveTypes.filter(lt => lt.carryForward).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Active Types</div>
          <div className="text-2xl font-bold text-indigo-600">
            {leaveTypes.filter(lt => lt.isActive).length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leave types by name, code, or description..."
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
                Leave Category
              </label>
              <select
                value={filterPaidLeave}
                onChange={(e) => setFilterPaidLeave(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Leaves</option>
                <option value="paid">Paid Only</option>
                <option value="unpaid">Unpaid Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Encashable
              </label>
              <select
                value={filterEncashable}
                onChange={(e) => setFilterEncashable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="yes">Encashable</option>
                <option value="no">Not Encashable</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carry Forward
              </label>
              <select
                value={filterCarryForward}
                onChange={(e) => setFilterCarryForward(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="yes">Can Carry Forward</option>
                <option value="no">Cannot Carry Forward</option>
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
            pageSize: 12
          }}
          sorting={{
            enabled: true,
            defaultSort: { column: 'name', direction: 'asc' }
          }}
          emptyMessage="No leave types found"
          emptyDescription="Try adjusting your search or filters to find what you're looking for."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Check className="w-5 h-5" />
          Leave Types Configured for Indian Kitchen Manufacturing
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>✓ Compliant with Factories Act, 1948 (Earned Leave)</li>
          <li>✓ Maternity Benefit Act, 1961 (26 weeks maternity leave)</li>
          <li>✓ Festival Leave for major Indian festivals (Diwali, Holi, Eid, Christmas)</li>
          <li>✓ Shift-based leave management for production workers</li>
          <li>✓ Compensatory Off for overtime/holiday work</li>
        </ul>
      </div>

      {/* Add Leave Type Modal */}
      <AddLeaveTypeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddLeaveType}
      />

      {/* Edit Leave Type Modal */}
      <AddLeaveTypeModal
        isOpen={editingLeaveType !== null}
        onClose={() => setEditingLeaveType(null)}
        onSubmit={handleEditLeaveType}
        editData={editingLeaveType as any}
      />
    </div>
  );
}
