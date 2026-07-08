'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Search, Filter, Plus, ArrowRight, Award, Building2, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import StatusBadge, { BadgeStatus } from '@/components/StatusBadge';
import { NewTransferPromotionModal } from '@/components/hr/NewTransferPromotionModal';
import { TransferPromotionWorkflowModal } from '@/components/hr/TransferPromotionWorkflowModal';
import { HrMovementsService } from '@/services/hr-movements.service';

interface TransferPromotion {
  id: string;
  employeeCode: string;
  name: string;
  type: 'promotion' | 'transfer' | 'both';
  fromDesignation: string;
  toDesignation: string;
  fromDepartment: string;
  toDepartment: string;
  fromLocation: string;
  toLocation: string;
  effectiveDate: string;
  requestDate: string;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  salaryIncrement?: number;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
}

export default function TransfersPromotionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<TransferPromotion | null>(null);
  const [transfersPromotions, setTransfersPromotions] = useState<TransferPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    HrMovementsService.getTransfersPromotions()
      .then((data) => {
        if (!active) return;
        const rows: TransferPromotion[] = data.map((m) => ({
          id: m.id,
          employeeCode: m.employeeCode,
          name: m.name,
          type: m.type,
          fromDesignation: m.fromDesignation,
          toDesignation: m.toDesignation,
          fromDepartment: m.fromDepartment,
          toDepartment: m.toDepartment,
          fromLocation: m.fromLocation,
          toLocation: m.toLocation,
          effectiveDate: m.effectiveDate,
          requestDate: m.requestDate,
          requestedBy: m.requestedBy,
          approvedBy: m.approvedBy,
          reason: m.reason,
          salaryIncrement:
            m.salaryIncrement != null ? Number(m.salaryIncrement) : undefined,
          status: m.status,
        }));
        setTransfersPromotions(rows);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load records');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const handleCreateRequest = async (data: any) => {
    setActionError(null);
    try {
      await HrMovementsService.createTransferPromotion({
        employeeCode: data.employeeCode,
        name: data.employeeName,
        type: data.type,
        fromDesignation: data.fromDesignation,
        toDesignation: data.toDesignation,
        fromDepartment: data.fromDepartment,
        toDepartment: data.toDepartment,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        effectiveDate: data.effectiveDate,
        requestedBy: data.requestedBy || undefined,
        reason: data.reason,
        salaryIncrement: data.salaryIncrement ? Number(data.salaryIncrement) : undefined,
      });
      setIsNewRequestModalOpen(false);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit request');
    }
  };

  const types = ['all', 'promotion', 'transfer', 'both'];
  const statuses = ['all', 'pending', 'approved', 'rejected', 'implemented'];

  const filteredData = useMemo(() => {
    return transfersPromotions.filter(tp => {
      const matchesSearch = tp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || tp.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || tp.status === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [transfersPromotions, searchTerm, selectedType, selectedStatus]);

  const stats = useMemo(() => {
    const promotions = transfersPromotions.filter(tp => tp.type === 'promotion' || tp.type === 'both').length;
    const transfers = transfersPromotions.filter(tp => tp.type === 'transfer' || tp.type === 'both').length;
    const pending = transfersPromotions.filter(tp => tp.status === 'pending').length;
    const withIncrement = transfersPromotions.filter(tp => tp.salaryIncrement);
    const avgIncrement = withIncrement.length
      ? Math.round(withIncrement.reduce((sum, tp) => sum + (tp.salaryIncrement || 0), 0) / withIncrement.length)
      : 0;
    return { total: transfersPromotions.length, promotions, transfers, pending, avgIncrement };
  }, [transfersPromotions]);

  const columns: Column<TransferPromotion>[] = [
    { id: 'employeeCode', accessor: 'employeeCode', label: 'Employee', sortable: true,
      render: (v: string, row: TransferPromotion) => (
        <div><div className="font-semibold text-gray-900">{v}</div><div className="text-xs text-gray-500">{row.name}</div></div>
      )
    },
    { id: 'type', accessor: 'type', label: 'Type', sortable: true,
      render: (v: string) => {
        const colors = { promotion: 'bg-green-100 text-green-700', transfer: 'bg-blue-100 text-blue-700', both: 'bg-purple-100 text-purple-700' };
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[v as keyof typeof colors]}`}>{v.toUpperCase()}</span>;
      }
    },
    { id: 'fromDesignation', accessor: 'fromDesignation', label: 'From → To', sortable: true,
      render: (v: string, row: TransferPromotion) => (
        <div className="text-sm">
          {row.type !== 'transfer' ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-700">{v}</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="font-semibold text-green-700">{row.toDesignation}</span>
            </div>
          ) : (
            <div className="text-gray-700">{v}</div>
          )}
          {row.type !== 'promotion' && row.fromDepartment !== row.toDepartment && (
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-gray-500">{row.fromDepartment}</span>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="text-blue-600">{row.toDepartment}</span>
            </div>
          )}
        </div>
      )
    },
    { id: 'effectiveDate', accessor: 'effectiveDate', label: 'Effective Date', sortable: true,
      render: (v: string) => (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-400" />
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { id: 'salaryIncrement', accessor: 'salaryIncrement', label: 'Increment', sortable: true,
      render: (v?: number) => v ? (
        <div className="font-semibold text-green-600">+{v}%</div>
      ) : (
        <div className="text-gray-400">-</div>
      )
    },
    { id: 'status', accessor: 'status', label: 'Status', sortable: true,
      render: (v: string) => <StatusBadge status={v as BadgeStatus} />
    },
    { id: 'actions', label: 'Actions',
      render: (_: any, row: TransferPromotion) => (
        <button
          onClick={() => {
            setSelectedRequest(row);
            setIsWorkflowModalOpen(true);
          }}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Workflow
        </button>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="h-8 w-8 text-green-600" />Transfers & Promotions</h1>
        <p className="text-gray-600 mt-2">Manage employee career movements and progressions</p>
      </div>

      {actionError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Activities</p><p className="text-2xl font-bold text-indigo-600">{stats.total}</p></div>
          <TrendingUp className="w-8 h-8 text-indigo-400" /></div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Promotions</p><p className="text-2xl font-bold text-green-600">{stats.promotions}</p></div>
          <Award className="w-8 h-8 text-green-400" /></div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Transfers</p><p className="text-2xl font-bold text-blue-600">{stats.transfers}</p></div>
          <Building2 className="w-8 h-8 text-blue-400" /></div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Pending</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></div>
          <Clock className="w-8 h-8 text-yellow-400" /></div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Avg Increment</p><p className="text-xl font-bold text-purple-600">{stats.avgIncrement}%</p></div>
          <TrendingUp className="w-8 h-8 text-purple-400" /></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-700">All Transfers & Promotions</h2>
            <span className="text-sm text-gray-500">({filteredData.length} records)</span>
          </div>
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-green-50 border-green-300 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            <Filter className="w-5 h-5" />Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {types.map(type => <option key={type} value={type}>{type === 'all' ? 'All Types' : type.toUpperCase()}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                {statuses.map(status => <option key={status} value={status}>{status === 'all' ? 'All Statuses' : status.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
          Loading transfers & promotions...
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center text-red-600">
          {error}
        </div>
      ) : (
        <DataTable data={filteredData} columns={columns} />
      )}

      {/* New Transfer/Promotion Request Modal */}
      <NewTransferPromotionModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
      />

      {/* Workflow Modal */}
      {selectedRequest && (
        <TransferPromotionWorkflowModal
          isOpen={isWorkflowModalOpen}
          onClose={() => {
            setIsWorkflowModalOpen(false);
            setSelectedRequest(null);
          }}
          requestData={{
            id: selectedRequest.id,
            employeeCode: selectedRequest.employeeCode,
            employeeName: selectedRequest.name,
            type: selectedRequest.type,
            fromDesignation: selectedRequest.fromDesignation,
            toDesignation: selectedRequest.toDesignation,
            fromDepartment: selectedRequest.fromDepartment,
            toDepartment: selectedRequest.toDepartment,
            effectiveDate: selectedRequest.effectiveDate,
            salaryIncrement: selectedRequest.salaryIncrement
          }}
        />
      )}
    </div>
  );
}
