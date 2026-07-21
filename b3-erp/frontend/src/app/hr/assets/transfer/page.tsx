'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArrowLeftRight, User, Calendar, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface AssetTransfer {
  id: string;
  transferId: string;
  assetTag: string;
  assetType: string;
  assetCategory: 'laptop' | 'desktop' | 'mobile' | 'tablet' | 'monitor' | 'printer' | 'furniture' | 'other';
  fromEmployee: string;
  fromEmployeeCode: string;
  fromDepartment: string;
  fromLocation: string;
  toEmployee: string;
  toEmployeeCode: string;
  toDepartment: string;
  toLocation: string;
  initiatedBy: string;
  initiatedDate: string;
  transferReason: 'department_transfer' | 'replacement' | 'location_change' | 'project_requirement' | 'upgrade' | 'other';
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvalDate?: string;
  completionDate?: string;
  handoverNotes?: string;
  condition: 'excellent' | 'good' | 'fair';
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [detailTransfer, setDetailTransfer] = useState<AssetTransfer | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fallbackTransfers: AssetTransfer[] = [
    {
      id: '1',
      transferId: 'TRF-2024-001',
      assetTag: 'LAP-2023-089',
      assetType: 'Dell Latitude 5430',
      assetCategory: 'laptop',
      fromEmployee: 'Rajesh Kumar',
      fromEmployeeCode: 'EMP345',
      fromDepartment: 'Sales',
      fromLocation: 'Mumbai Office',
      toEmployee: 'Amit Patel',
      toEmployeeCode: 'EMP678',
      toDepartment: 'Sales',
      toLocation: 'Mumbai Office',
      initiatedBy: 'HR Admin - Priya Sharma',
      initiatedDate: '2024-10-20',
      transferReason: 'replacement',
      status: 'pending',
      condition: 'good'
    },
    {
      id: '2',
      transferId: 'TRF-2024-002',
      assetTag: 'DESK-2022-156',
      assetType: 'HP ProDesk 600 G6',
      assetCategory: 'desktop',
      fromEmployee: 'Vikram Singh',
      fromEmployeeCode: 'EMP234',
      fromDepartment: 'Marketing',
      fromLocation: 'Bangalore Office',
      toEmployee: 'Neha Gupta',
      toEmployeeCode: 'EMP567',
      toDepartment: 'Marketing',
      toLocation: 'Bangalore Office',
      initiatedBy: 'Marketing Manager - Sunita Reddy',
      initiatedDate: '2024-10-18',
      transferReason: 'project_requirement',
      status: 'completed',
      approvedBy: 'IT Manager - Rajesh Kumar',
      approvalDate: '2024-10-19',
      completionDate: '2024-10-20',
      handoverNotes: 'Asset transferred successfully. All accessories included. System wiped and reconfigured.',
      condition: 'good'
    },
    {
      id: '3',
      transferId: 'TRF-2024-003',
      assetTag: 'MOB-2024-045',
      assetType: 'iPhone 14 Pro',
      assetCategory: 'mobile',
      fromEmployee: 'Sanjay Desai',
      fromEmployeeCode: 'EMP123',
      fromDepartment: 'IT',
      fromLocation: 'Pune Office',
      toEmployee: 'Arjun Kapoor',
      toEmployeeCode: 'EMP890',
      toDepartment: 'Sales',
      toLocation: 'Delhi Office',
      initiatedBy: 'IT Admin - Suresh Kumar',
      initiatedDate: '2024-10-22',
      transferReason: 'department_transfer',
      status: 'approved',
      approvedBy: 'COO - Meera Krishnan',
      approvalDate: '2024-10-23',
      condition: 'excellent'
    },
    {
      id: '4',
      transferId: 'TRF-2024-004',
      assetTag: 'LAP-2022-178',
      assetType: 'MacBook Pro 14"',
      assetCategory: 'laptop',
      fromEmployee: 'Priya Menon',
      fromEmployeeCode: 'EMP456',
      fromDepartment: 'Design',
      fromLocation: 'Chennai Office',
      toEmployee: 'Karthik Iyer',
      toEmployeeCode: 'EMP901',
      toDepartment: 'Design',
      toLocation: 'Mumbai Office',
      initiatedBy: 'Design Lead - Ananya Reddy',
      initiatedDate: '2024-10-15',
      transferReason: 'location_change',
      status: 'in_transit',
      approvedBy: 'IT Manager - Rajesh Kumar',
      approvalDate: '2024-10-16',
      condition: 'excellent'
    },
    {
      id: '5',
      transferId: 'TRF-2024-005',
      assetTag: 'MON-2023-234',
      assetType: 'Dell UltraSharp 32"',
      assetCategory: 'monitor',
      fromEmployee: 'Rahul Sharma',
      fromEmployeeCode: 'EMP789',
      fromDepartment: 'Finance',
      fromLocation: 'Hyderabad Office',
      toEmployee: 'Divya Nair',
      toEmployeeCode: 'EMP234',
      toDepartment: 'Finance',
      toLocation: 'Hyderabad Office',
      initiatedBy: 'Finance Manager - Kavita Singh',
      initiatedDate: '2024-10-10',
      transferReason: 'upgrade',
      status: 'completed',
      approvedBy: 'IT Admin - Suresh Kumar',
      approvalDate: '2024-10-11',
      completionDate: '2024-10-12',
      handoverNotes: 'Monitor transferred in excellent condition. All cables included.',
      condition: 'excellent'
    },
    {
      id: '6',
      transferId: 'TRF-2024-006',
      assetTag: 'TAB-2023-067',
      assetType: 'iPad Pro 11"',
      assetCategory: 'tablet',
      fromEmployee: 'Anjali Patel',
      fromEmployeeCode: 'EMP567',
      fromDepartment: 'Operations',
      fromLocation: 'Pune Office',
      toEmployee: 'Rohan Mehta',
      toEmployeeCode: 'EMP789',
      toDepartment: 'Operations',
      toLocation: 'Bangalore Office',
      initiatedBy: 'Operations Lead - Meera Shah',
      initiatedDate: '2024-10-24',
      transferReason: 'project_requirement',
      status: 'cancelled',
      condition: 'good'
    }
  ];

  const [mockTransfers, setMockTransfers] = useState<AssetTransfer[]>(fallbackTransfers);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const emptyForm = {
    assetTag: '',
    assetType: '',
    assetCategory: 'laptop',
    fromEmployee: '',
    fromEmployeeCode: '',
    fromDepartment: '',
    fromLocation: '',
    toEmployee: '',
    toEmployeeCode: '',
    toDepartment: '',
    toLocation: '',
    initiatedBy: '',
    transferReason: 'department_transfer',
    condition: 'good',
  };
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await HrAssetsService.createAssetTransfer({
        assetTag: form.assetTag,
        assetType: form.assetType,
        assetCategory: form.assetCategory,
        fromEmployee: form.fromEmployee,
        fromEmployeeCode: form.fromEmployeeCode,
        fromDepartment: form.fromDepartment,
        fromLocation: form.fromLocation,
        toEmployee: form.toEmployee,
        toEmployeeCode: form.toEmployeeCode,
        toDepartment: form.toDepartment,
        toLocation: form.toLocation,
        initiatedBy: form.initiatedBy,
        initiatedDate: new Date().toISOString().slice(0, 10),
        transferReason: form.transferReason,
        condition: form.condition,
        status: 'pending',
      });
      setMockTransfers((prev) => [
        {
          id: created.id,
          transferId: created.transferId || '',
          assetTag: created.assetTag || form.assetTag,
          assetType: created.assetType || form.assetType,
          assetCategory: (created.assetCategory as AssetTransfer['assetCategory']) || (form.assetCategory as AssetTransfer['assetCategory']),
          fromEmployee: created.fromEmployee || form.fromEmployee,
          fromEmployeeCode: created.fromEmployeeCode || form.fromEmployeeCode,
          fromDepartment: created.fromDepartment || form.fromDepartment,
          fromLocation: created.fromLocation || form.fromLocation,
          toEmployee: created.toEmployee || form.toEmployee,
          toEmployeeCode: created.toEmployeeCode || form.toEmployeeCode,
          toDepartment: created.toDepartment || form.toDepartment,
          toLocation: created.toLocation || form.toLocation,
          initiatedBy: created.initiatedBy || form.initiatedBy,
          initiatedDate: created.initiatedDate || new Date().toISOString().slice(0, 10),
          transferReason: (created.transferReason as AssetTransfer['transferReason']) || (form.transferReason as AssetTransfer['transferReason']),
          status: (created.status as AssetTransfer['status']) || 'pending',
          approvedBy: created.approvedBy || undefined,
          approvalDate: created.approvalDate || undefined,
          completionDate: created.completionDate || undefined,
          handoverNotes: created.handoverNotes || undefined,
          condition: (created.condition as AssetTransfer['condition']) || (form.condition as AssetTransfer['condition']),
        },
        ...prev,
      ]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetTransfers();
        if (cancelled) return;
        if (rows.length) {
          setMockTransfers(
            rows.map((r) => ({
              id: r.id,
              transferId: r.transferId || '',
              assetTag: r.assetTag || '',
              assetType: r.assetType || '',
              assetCategory: (r.assetCategory as AssetTransfer['assetCategory']) || 'other',
              fromEmployee: r.fromEmployee || '',
              fromEmployeeCode: r.fromEmployeeCode || '',
              fromDepartment: r.fromDepartment || '',
              fromLocation: r.fromLocation || '',
              toEmployee: r.toEmployee || '',
              toEmployeeCode: r.toEmployeeCode || '',
              toDepartment: r.toDepartment || '',
              toLocation: r.toLocation || '',
              initiatedBy: r.initiatedBy || '',
              initiatedDate: r.initiatedDate || '',
              transferReason: (r.transferReason as AssetTransfer['transferReason']) || 'other',
              status: (r.status as AssetTransfer['status']) || 'pending',
              approvedBy: r.approvedBy || undefined,
              approvalDate: r.approvalDate || undefined,
              completionDate: r.completionDate || undefined,
              handoverNotes: r.handoverNotes || undefined,
              condition: (r.condition as AssetTransfer['condition']) || 'good',
            })),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load transfers');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTransfers = mockTransfers.filter(t => {
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedDepartment !== 'all' && t.fromDepartment !== selectedDepartment && t.toDepartment !== selectedDepartment) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: mockTransfers.length,
    pending: mockTransfers.filter(t => t.status === 'pending').length,
    approved: mockTransfers.filter(t => t.status === 'approved').length,
    inTransit: mockTransfers.filter(t => t.status === 'in_transit').length,
    completed: mockTransfers.filter(t => t.status === 'completed').length
  }), [mockTransfers]);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-700'
  };

  const reasonLabels = {
    department_transfer: 'Department Transfer',
    replacement: 'Replacement',
    location_change: 'Location Change',
    project_requirement: 'Project Requirement',
    upgrade: 'Upgrade',
    other: 'Other'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Asset Transfers</h1>
        <p className="text-sm text-gray-600 mt-1">Manage asset transfers between employees</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading transfers…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Transfers</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Approved</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">In Transit</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.inTransit}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => setShowForm(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Initiate Transfer
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTransfers.map(transfer => (
          <div key={transfer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <ArrowLeftRight className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{transfer.assetType}</h3>
                    <p className="text-sm text-gray-600">{transfer.assetTag} • {transfer.transferId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[transfer.status]}`}>
                    {transfer.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                    {reasonLabels[transfer.transferReason]}
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                    {transfer.condition.charAt(0).toUpperCase() + transfer.condition.slice(1)} Condition
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2 py-4 border-y border-gray-200">
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-xs text-red-600 uppercase font-medium">From</p>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{transfer.fromEmployee}</p>
                <p className="text-xs text-gray-600 mb-2">{transfer.fromEmployeeCode} • {transfer.fromDepartment}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {transfer.fromLocation}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-xs text-green-600 uppercase font-medium">To</p>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">{transfer.toEmployee}</p>
                <p className="text-xs text-gray-600 mb-2">{transfer.toEmployeeCode} • {transfer.toDepartment}</p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {transfer.toLocation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Initiated By</p>
                <p className="text-sm font-semibold text-gray-900">{transfer.initiatedBy}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Initiated Date
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(transfer.initiatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              {transfer.completionDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Completion Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(transfer.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {transfer.status === 'approved' && transfer.approvedBy && (
              <div className="bg-blue-50 rounded-lg p-3 mb-2 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700 uppercase font-medium">Approved</p>
                </div>
                <p className="text-sm text-blue-900">
                  Approved by {transfer.approvedBy} on {new Date(transfer.approvalDate!).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}

            {transfer.status === 'in_transit' && (
              <div className="bg-purple-50 rounded-lg p-3 mb-2 border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <p className="text-xs text-purple-700 uppercase font-medium">In Transit</p>
                </div>
                <p className="text-sm text-purple-900">
                  Asset is currently being transferred from {transfer.fromLocation} to {transfer.toLocation}.
                </p>
              </div>
            )}

            {transfer.status === 'completed' && transfer.handoverNotes && (
              <div className="bg-green-50 rounded-lg p-3 mb-2 border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-700 uppercase font-medium">Transfer Completed</p>
                </div>
                <p className="text-sm text-green-900 mb-2">{transfer.handoverNotes}</p>
                {transfer.completionDate && (
                  <p className="text-xs text-green-600">
                    Completed on {new Date(transfer.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            )}

            {transfer.status === 'cancelled' && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-700 uppercase font-medium">Transfer Cancelled</p>
                </div>
                <p className="text-sm text-gray-900">This transfer request has been cancelled.</p>
              </div>
            )}

            {transfer.status === 'pending' && (
              <div className="bg-yellow-50 rounded-lg p-3 mb-2 border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <p className="text-xs text-yellow-700 uppercase font-medium">Awaiting Approval</p>
                </div>
                <p className="text-sm text-yellow-900">This transfer is pending approval from IT department.</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setDetailTransfer(transfer)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
              {transfer.status === 'pending' && (
                <>
                  <button onClick={() => setDetailTransfer(transfer)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                    Approve Transfer
                  </button>
                  <button onClick={() => setDetailTransfer(transfer)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
                    Cancel
                  </button>
                </>
              )}
              {transfer.status === 'approved' && (
                <button onClick={() => setDetailTransfer(transfer)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                  Mark In Transit
                </button>
              )}
              {transfer.status === 'in_transit' && (
                <button onClick={() => setDetailTransfer(transfer)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                  Complete Transfer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {detailTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Transfer Details</h2>
              <button onClick={() => setDetailTransfer(null)} className="text-white hover:text-purple-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Asset Type</p>
                  <p className="font-medium text-gray-900">{detailTransfer.assetType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Asset Tag</p>
                  <p className="font-medium text-gray-900">{detailTransfer.assetTag}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Transfer ID</p>
                  <p className="font-medium text-gray-900">{detailTransfer.transferId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="font-medium text-gray-900">
                    {detailTransfer.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">From Employee</p>
                  <p className="font-medium text-gray-900">{detailTransfer.fromEmployee}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">To Employee</p>
                  <p className="font-medium text-gray-900">{detailTransfer.toEmployee}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">From Department</p>
                  <p className="font-medium text-gray-900">{detailTransfer.fromDepartment}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">To Department</p>
                  <p className="font-medium text-gray-900">{detailTransfer.toDepartment}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">From Location</p>
                  <p className="font-medium text-gray-900">{detailTransfer.fromLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">To Location</p>
                  <p className="font-medium text-gray-900">{detailTransfer.toLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Transfer Reason</p>
                  <p className="font-medium text-gray-900">{reasonLabels[detailTransfer.transferReason]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Initiated By</p>
                  <p className="font-medium text-gray-900">{detailTransfer.initiatedBy}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Condition</p>
                  <p className="font-medium text-gray-900">
                    {detailTransfer.condition.charAt(0).toUpperCase() + detailTransfer.condition.slice(1)}
                  </p>
                </div>
                {detailTransfer.handoverNotes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase">Handover Notes</p>
                    <p className="font-medium text-gray-900">{detailTransfer.handoverNotes}</p>
                  </div>
                )}
              </div>
              <button onClick={() => setDetailTransfer(null)} className="w-full mt-5 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
              <h2 className="text-lg font-bold text-white">Initiate Asset Transfer</h2>
              <button onClick={() => setShowForm(false)} className="text-white hover:text-blue-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              {submitError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag</label>
                  <input value={form.assetTag} onChange={(e) => setForm({ ...form, assetTag: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Type</label>
                  <input value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                  <select value={form.assetCategory} onChange={(e) => setForm({ ...form, assetCategory: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="laptop">Laptop</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="monitor">Monitor</option>
                    <option value="printer">Printer</option>
                    <option value="furniture">Furniture</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Reason</label>
                  <select value={form.transferReason} onChange={(e) => setForm({ ...form, transferReason: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="department_transfer">Department Transfer</option>
                    <option value="replacement">Replacement</option>
                    <option value="location_change">Location Change</option>
                    <option value="project_requirement">Project Requirement</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Employee</label>
                  <input value={form.fromEmployee} onChange={(e) => setForm({ ...form, fromEmployee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Employee Code</label>
                  <input value={form.fromEmployeeCode} onChange={(e) => setForm({ ...form, fromEmployeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Department</label>
                  <input value={form.fromDepartment} onChange={(e) => setForm({ ...form, fromDepartment: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Location</label>
                  <input value={form.fromLocation} onChange={(e) => setForm({ ...form, fromLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Employee</label>
                  <input value={form.toEmployee} onChange={(e) => setForm({ ...form, toEmployee: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Employee Code</label>
                  <input value={form.toEmployeeCode} onChange={(e) => setForm({ ...form, toEmployeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Department</label>
                  <input value={form.toDepartment} onChange={(e) => setForm({ ...form, toDepartment: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Location</label>
                  <input value={form.toLocation} onChange={(e) => setForm({ ...form, toLocation: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initiated By</label>
                  <input value={form.initiatedBy} onChange={(e) => setForm({ ...form, initiatedBy: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-60">
                  {isSubmitting ? 'Creating…' : 'Create Transfer'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
