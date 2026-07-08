'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, IndianRupee, AlertCircle, X, Eye, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface FNFLeaveEncashment {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  lastWorkingDay: string;
  joiningDate: string;
  leaveBalance: {
    earnedLeave: number;
    casualLeave: number;
    sickLeave: number;
    privilegeLeave: number;
  };
  leavePolicy: {
    earnedLeaveEncashable: boolean;
    casualLeaveEncashable: boolean;
    sickLeaveEncashable: boolean;
    privilegeLeaveEncashable: boolean;
    maxEncashableDays?: number;
  };
  encashableDays: number;
  dailyRate: number;
  encashmentAmount: number;
  status: 'pending' | 'calculated' | 'approved' | 'processed';
  calculatedBy?: string;
  calculatedOn?: string;
  approvedBy?: string;
}

export default function FNFLeavePage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'calculated' | 'approved' | 'processed'>('pending');
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEncashment, setSelectedEncashment] = useState<FNFLeaveEncashment | null>(null);
  const [calculateFormData, setCalculateFormData] = useState({
    encashableEL: 0,
    encashablePL: 0,
    dailyRate: 0,
    calculatedBy: '',
    remarks: ''
  });
  const [approveFormData, setApproveFormData] = useState({
    approvedBy: '',
    remarks: ''
  });

  const [mockEncashments, setMockEncashments] = useState<FNFLeaveEncashment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadEncashments = async () => {
    try {
      setLoading(true);
      const records = await OffboardingTasksService.list('fnf-leave');
      const mapped = records.map((r: OffboardingTaskRecord) => ({
        id: r.id,
        employeeCode: r.employeeCode || '',
        employeeName: r.employeeName || '',
        designation: r.designation || '',
        department: r.department || '',
        status: (r.status as any) || 'pending',
        ...(r.data || {}),
      })) as unknown as FNFLeaveEncashment[];
      setMockEncashments(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEncashments();
  }, []);

  const filteredEncashments = useMemo(() => {
    return mockEncashments.filter(encashment => encashment.status === selectedTab);
  }, [selectedTab, mockEncashments]);

  const stats = {
    pending: mockEncashments.filter(e => e.status === 'pending').length,
    calculated: mockEncashments.filter(e => e.status === 'calculated').length,
    approved: mockEncashments.filter(e => e.status === 'approved').length,
    processed: mockEncashments.filter(e => e.status === 'processed').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    calculated: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    processed: 'bg-gray-100 text-gray-700'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    calculated: <Calendar className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    processed: <CheckCircle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const calculateTotalLeaves = (balance: FNFLeaveEncashment['leaveBalance']) => {
    return Object.values(balance).reduce((sum, val) => sum + val, 0);
  };

  const handleCalculate = (encashment: FNFLeaveEncashment) => {
    setSelectedEncashment(encashment);
    const maxEncashableDays = encashment.leavePolicy.maxEncashableDays || 999;
    const encashableEL = encashment.leavePolicy.earnedLeaveEncashable ? encashment.leaveBalance.earnedLeave : 0;
    const encashablePL = encashment.leavePolicy.privilegeLeaveEncashable ? encashment.leaveBalance.privilegeLeave : 0;
    const totalEncashable = Math.min(encashableEL + encashablePL, maxEncashableDays);

    setCalculateFormData({
      encashableEL: encashableEL,
      encashablePL: encashablePL,
      dailyRate: encashment.dailyRate || 0,
      calculatedBy: '',
      remarks: ''
    });
    setShowCalculateModal(true);
  };

  const handleApprove = (encashment: FNFLeaveEncashment) => {
    setSelectedEncashment(encashment);
    setApproveFormData({
      approvedBy: '',
      remarks: ''
    });
    setShowApproveModal(true);
  };

  const handleView = (encashment: FNFLeaveEncashment) => {
    setSelectedEncashment(encashment);
    setShowViewModal(true);
  };

  const handleMarkProcessed = async (encashment: FNFLeaveEncashment) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(encashment.id, {
        status: 'processed',
        data: { ...(encashment as any), processedOn: new Date().toISOString().split('T')[0] },
      });
      toast({
        title: 'Marked as Processed',
        description: `Leave encashment for ${encashment.employeeName} has been marked as processed and added to FNF settlement.`,
      });
      await loadEncashments();
    } catch {
      toast({ title: 'Failed to mark as processed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCalculation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncashment || submitting) return;
    setSubmitting(true);
    const totalDays = calculateFormData.encashableEL + calculateFormData.encashablePL;
    const amount = totalDays * calculateFormData.dailyRate;
    try {
      await OffboardingTasksService.update(selectedEncashment.id, {
        status: 'calculated',
        data: {
          ...(selectedEncashment as any),
          encashableDays: totalDays,
          dailyRate: calculateFormData.dailyRate,
          encashmentAmount: amount,
          calculatedOn: new Date().toISOString().split('T')[0],
          remarks: calculateFormData.remarks,
        },
      });
      toast({
        title: 'Encashment Calculated',
        description: `Leave encashment of ${formatCurrency(amount)} (${totalDays} days) calculated for ${selectedEncashment.employeeName}.`,
      });
      setShowCalculateModal(false);
      await loadEncashments();
    } catch {
      toast({ title: 'Failed to calculate encashment', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncashment || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedEncashment.id, {
        status: 'approved',
        data: {
          ...(selectedEncashment as any),
          approvedOn: new Date().toISOString().split('T')[0],
          remarks: approveFormData.remarks,
        },
      });
      toast({
        title: 'Encashment Approved',
        description: `Leave encashment for ${selectedEncashment.employeeName} has been approved and will be added to FNF settlement.`,
      });
      setShowApproveModal(false);
      await loadEncashments();
    } catch {
      toast({ title: 'Failed to approve encashment', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">FNF - Leave Encashment</h1>
        <p className="text-sm text-gray-600 mt-1">Calculate and process leave encashment for exiting employees</p>
      </div>

      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading encashments…</div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Calculated</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.calculated}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.processed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => setSelectedTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setSelectedTab('calculated')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'calculated'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Calculated ({stats.calculated})
        </button>
        <button
          onClick={() => setSelectedTab('approved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setSelectedTab('processed')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'processed'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Processed ({stats.processed})
        </button>
      </div>

      <div className="space-y-2">
        {filteredEncashments.map(encashment => {
          const totalLeaves = calculateTotalLeaves(encashment.leaveBalance);

          return (
            <div key={encashment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{encashment.employeeName}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[encashment.status]}`}>
                      <span className="inline-flex items-center gap-1">
                        {statusIcons[encashment.status]}
                        {encashment.status.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{encashment.designation} • {encashment.department}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last Working Day: {new Date(encashment.lastWorkingDay).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Leave Balance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Earned Leave (EL)</span>
                      <span className={`font-medium ${encashment.leavePolicy.earnedLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {encashment.leaveBalance.earnedLeave} days
                        {encashment.leavePolicy.earnedLeaveEncashable && ' ✓'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Privilege Leave (PL)</span>
                      <span className={`font-medium ${encashment.leavePolicy.privilegeLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {encashment.leaveBalance.privilegeLeave} days
                        {encashment.leavePolicy.privilegeLeaveEncashable && ' ✓'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Casual Leave (CL)</span>
                      <span className={`font-medium ${encashment.leavePolicy.casualLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {encashment.leaveBalance.casualLeave} days
                        {!encashment.leavePolicy.casualLeaveEncashable && ' ✗'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sick Leave (SL)</span>
                      <span className={`font-medium ${encashment.leavePolicy.sickLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {encashment.leaveBalance.sickLeave} days
                        {!encashment.leavePolicy.sickLeaveEncashable && ' ✗'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Total Leave Balance</span>
                      <span className="font-bold text-gray-900">{totalLeaves} days</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">
                      ✓ = Encashable  •  ✗ = Non-encashable
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Encashment Calculation</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Encashable Days</span>
                      <span className="font-medium text-gray-900">{encashment.encashableDays} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-medium text-gray-900">{formatCurrency(encashment.dailyRate)}</span>
                    </div>
                    {encashment.leavePolicy.maxEncashableDays && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Policy Limit</span>
                        <span className="font-medium text-gray-900">{encashment.leavePolicy.maxEncashableDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Encashment Amount</span>
                      <span className="font-bold text-green-600">{formatCurrency(encashment.encashmentAmount)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Calculated: {encashment.encashableDays} days × {formatCurrency(encashment.dailyRate)}
                    </p>
                  </div>
                  {encashment.leavePolicy.maxEncashableDays &&
                    (encashment.leaveBalance.earnedLeave + encashment.leaveBalance.privilegeLeave) > encashment.leavePolicy.maxEncashableDays && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <p className="text-xs text-yellow-700">
                            Encashable days capped at {encashment.leavePolicy.maxEncashableDays} days as per policy
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border-2 border-green-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Total Leave Encashment</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(encashment.encashmentAmount)}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {encashment.encashableDays} days to be added to FNF settlement
                    </p>
                  </div>
                  <IndianRupee className="h-12 w-12 text-green-600" />
                </div>
              </div>

              {encashment.calculatedBy && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>Calculated by: {encashment.calculatedBy} on {new Date(encashment.calculatedOn!).toLocaleDateString('en-IN')}</p>
                  {encashment.approvedBy && (
                    <p>Approved by: {encashment.approvedBy}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {encashment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleCalculate(encashment)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      <Calculator className="inline h-4 w-4 mr-2" />
                      Calculate Encashment
                    </button>
                    <button
                      onClick={() => handleView(encashment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </>
                )}
                {encashment.status === 'calculated' && (
                  <>
                    <button
                      onClick={() => handleApprove(encashment)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                    >
                      <CheckCircle className="inline h-4 w-4 mr-2" />
                      Approve Calculation
                    </button>
                    <button
                      onClick={() => handleCalculate(encashment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Calculator className="inline h-4 w-4 mr-2" />
                      Recalculate
                    </button>
                    <button
                      onClick={() => handleView(encashment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </>
                )}
                {encashment.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleMarkProcessed(encashment)}
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                    >
                      <CheckCircle className="inline h-4 w-4 mr-2" />
                      Mark as Processed
                    </button>
                    <button
                      onClick={() => handleView(encashment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </>
                )}
                {encashment.status === 'processed' && (
                  <button
                    onClick={() => handleView(encashment)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                  >
                    <Eye className="inline h-4 w-4 mr-2" />
                    View Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculate Encashment Modal */}
      {showCalculateModal && selectedEncashment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6" />
                <h2 className="text-xl font-bold">Calculate Leave Encashment</h2>
              </div>
              <button onClick={() => setShowCalculateModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">{selectedEncashment.employeeName}</h3>
                <p className="text-sm text-blue-700">
                  {selectedEncashment.designation} • {selectedEncashment.department}
                </p>
                <p className="text-xs text-blue-600 mt-1">Employee ID: {selectedEncashment.employeeId}</p>
              </div>

              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Leave Balance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earned Leave (EL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.earnedLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.earnedLeave} days {selectedEncashment.leavePolicy.earnedLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Privilege Leave (PL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.privilegeLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.privilegeLeave} days {selectedEncashment.leavePolicy.privilegeLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Casual Leave (CL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.casualLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.casualLeave} days {selectedEncashment.leavePolicy.casualLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sick Leave (SL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.sickLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.sickLeave} days {selectedEncashment.leavePolicy.sickLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs text-blue-700">✓ = Encashable  •  ✗ = Non-encashable</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Leave Policy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tenure</span>
                      <span className="font-medium text-gray-900">
                        {Math.floor((new Date(selectedEncashment.lastWorkingDay).getTime() - new Date(selectedEncashment.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joining Date</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedEncashment.joiningDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Working Day</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedEncashment.lastWorkingDay).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {selectedEncashment.leavePolicy.maxEncashableDays && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Encashable</span>
                        <span className="font-medium text-orange-600">
                          {selectedEncashment.leavePolicy.maxEncashableDays} days limit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitCalculation} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Encashable EL Days <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={calculateFormData.encashableEL}
                      onChange={(e) => setCalculateFormData({ ...calculateFormData, encashableEL: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={selectedEncashment.leaveBalance.earnedLeave}
                      min={0}
                      required
                      disabled={!selectedEncashment.leavePolicy.earnedLeaveEncashable}
                    />
                    {!selectedEncashment.leavePolicy.earnedLeaveEncashable && (
                      <p className="text-xs text-gray-500 mt-1">Earned Leave not encashable as per policy</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Encashable PL Days <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={calculateFormData.encashablePL}
                      onChange={(e) => setCalculateFormData({ ...calculateFormData, encashablePL: Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      max={selectedEncashment.leaveBalance.privilegeLeave}
                      min={0}
                      required
                      disabled={!selectedEncashment.leavePolicy.privilegeLeaveEncashable}
                    />
                    {!selectedEncashment.leavePolicy.privilegeLeaveEncashable && (
                      <p className="text-xs text-gray-500 mt-1">Privilege Leave not encashable as per policy</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Rate (Per Day Salary) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={calculateFormData.dailyRate}
                      onChange={(e) => setCalculateFormData({ ...calculateFormData, dailyRate: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      min={0}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Usually calculated as: Monthly Gross Salary ÷ 30 days
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculated By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={calculateFormData.calculatedBy}
                    onChange={(e) => setCalculateFormData({ ...calculateFormData, calculatedBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., John Doe - HR Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks / Notes
                  </label>
                  <textarea
                    value={calculateFormData.remarks}
                    onChange={(e) => setCalculateFormData({ ...calculateFormData, remarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Any special notes or adjustments..."
                  />
                </div>

                <div className="bg-gray-100 rounded-lg p-3 border-2 border-gray-300">
                  <h3 className="font-bold text-gray-900 mb-3">Calculation Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Encashable Days:</span>
                      <span className="font-semibold">
                        {calculateFormData.encashableEL + calculateFormData.encashablePL} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily Rate:</span>
                      <span className="font-semibold">{formatCurrency(calculateFormData.dailyRate)}</span>
                    </div>
                    {selectedEncashment.leavePolicy.maxEncashableDays &&
                      (calculateFormData.encashableEL + calculateFormData.encashablePL) > selectedEncashment.leavePolicy.maxEncashableDays && (
                        <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-700">
                              Total days exceed policy limit of {selectedEncashment.leavePolicy.maxEncashableDays} days.
                              Will be capped at {selectedEncashment.leavePolicy.maxEncashableDays} days.
                            </p>
                          </div>
                        </div>
                      )}
                    <div className="flex justify-between pt-2 border-t-2 border-gray-400 text-lg font-bold">
                      <span>Encashment Amount:</span>
                      <span className="text-green-600">
                        {formatCurrency(
                          Math.min(
                            calculateFormData.encashableEL + calculateFormData.encashablePL,
                            selectedEncashment.leavePolicy.maxEncashableDays || 999
                          ) * calculateFormData.dailyRate
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Calculation Note</p>
                      <p className="text-xs text-blue-800 mt-1">
                        This calculated amount will be added to the employee's FNF settlement.
                        Only encashable leave types as per company policy are included in the calculation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Saving…' : 'Calculate & Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCalculateModal(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Approve Encashment Modal */}
      {showApproveModal && selectedEncashment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Approve Leave Encashment</h2>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">{selectedEncashment.employeeName}</h3>
                <p className="text-sm text-green-700">
                  {selectedEncashment.designation} • {selectedEncashment.department}
                </p>
                <p className="text-xs text-green-600 mt-1">Employee ID: {selectedEncashment.employeeId}</p>
              </div>

              <div className="mb-3 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                <p className="text-sm font-medium text-gray-700 mb-2">Leave Encashment Amount</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatCurrency(selectedEncashment.encashmentAmount)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {selectedEncashment.encashableDays} days × {formatCurrency(selectedEncashment.dailyRate)} per day
                </p>
              </div>

              <div className="mb-3 space-y-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Encashment Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Encashable Days</span>
                      <span className="font-medium text-gray-900">{selectedEncashment.encashableDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-medium text-gray-900">{formatCurrency(selectedEncashment.dailyRate)}</span>
                    </div>
                    {selectedEncashment.calculatedBy && (
                      <div className="pt-2 border-t border-gray-300">
                        <p className="text-xs text-gray-500">
                          Calculated by: {selectedEncashment.calculatedBy}
                        </p>
                        {selectedEncashment.calculatedOn && (
                          <p className="text-xs text-gray-500">
                            on {new Date(selectedEncashment.calculatedOn).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Leave Balance Used</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEncashment.leavePolicy.earnedLeaveEncashable && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Earned Leave (EL)</span>
                        <span className="font-medium text-blue-900">{selectedEncashment.leaveBalance.earnedLeave} days</span>
                      </div>
                    )}
                    {selectedEncashment.leavePolicy.privilegeLeaveEncashable && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Privilege Leave (PL)</span>
                        <span className="font-medium text-blue-900">{selectedEncashment.leaveBalance.privilegeLeave} days</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitApproval} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approving Authority <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={approveFormData.approvedBy}
                    onChange={(e) => setApproveFormData({ ...approveFormData, approvedBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., John Doe - CFO"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Remarks
                  </label>
                  <textarea
                    value={approveFormData.remarks}
                    onChange={(e) => setApproveFormData({ ...approveFormData, remarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes or remarks..."
                  />
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Approval Confirmation</p>
                      <p className="text-xs text-green-800 mt-1">
                        By approving this leave encashment, you confirm that the calculation is accurate and this amount
                        will be added to the employee's FNF settlement for payment processing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    Approve Encashment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedEncashment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6" />
                <h2 className="text-xl font-bold">Leave Encashment Details</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEncashment.employeeName}</h3>
                  <p className="text-gray-600">{selectedEncashment.designation} • {selectedEncashment.department}</p>
                  <p className="text-sm text-gray-500 mt-1">Employee ID: {selectedEncashment.employeeId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[selectedEncashment.status]}`}>
                    {selectedEncashment.status.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">ID: {selectedEncashment.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    Service Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Joining Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedEncashment.joiningDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Working Day</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedEncashment.lastWorkingDay).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Tenure</p>
                      <p className="font-medium text-gray-900">
                        {Math.floor((new Date(selectedEncashment.lastWorkingDay).getTime() - new Date(selectedEncashment.joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Complete Leave Balance</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Earned Leave (EL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.earnedLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.earnedLeave} days {selectedEncashment.leavePolicy.earnedLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Privilege Leave (PL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.privilegeLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.privilegeLeave} days {selectedEncashment.leavePolicy.privilegeLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Casual Leave (CL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.casualLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.casualLeave} days {selectedEncashment.leavePolicy.casualLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sick Leave (SL)</span>
                      <span className={`font-medium ${selectedEncashment.leavePolicy.sickLeaveEncashable ? 'text-green-600' : 'text-gray-400'}`}>
                        {selectedEncashment.leaveBalance.sickLeave} days {selectedEncashment.leavePolicy.sickLeaveEncashable ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-300 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Leave Balance</span>
                      <span className="font-bold text-gray-900">{calculateTotalLeaves(selectedEncashment.leaveBalance)} days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Encashment Calculation</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Encashable Days (as per policy)</span>
                    <span className="font-bold text-blue-900">{selectedEncashment.encashableDays} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700">Daily Rate</span>
                    <span className="font-bold text-blue-900">{formatCurrency(selectedEncashment.dailyRate)}</span>
                  </div>
                  {selectedEncashment.leavePolicy.maxEncashableDays && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-700">Policy Limit</span>
                      <span className="font-medium text-orange-600">Max {selectedEncashment.leavePolicy.maxEncashableDays} days</span>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t-2 border-blue-300 flex justify-between items-center">
                    <span className="font-bold text-blue-900 text-lg">Calculation</span>
                    <span className="font-bold text-blue-900">
                      {selectedEncashment.encashableDays} × {formatCurrency(selectedEncashment.dailyRate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-400 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Total Leave Encashment Amount</p>
                    <p className="text-5xl font-bold text-green-700">
                      {formatCurrency(selectedEncashment.encashmentAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      To be added to FNF settlement
                    </p>
                  </div>
                  <IndianRupee className="h-16 w-16 text-green-600" />
                </div>
              </div>

              {(selectedEncashment.calculatedBy || selectedEncashment.approvedBy) && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Approval History</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEncashment.calculatedBy && (
                      <div>
                        <p className="text-gray-600">Calculated by: <span className="font-medium text-gray-900">{selectedEncashment.calculatedBy}</span></p>
                        {selectedEncashment.calculatedOn && (
                          <p className="text-xs text-gray-500">
                            on {new Date(selectedEncashment.calculatedOn).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedEncashment.approvedBy && (
                      <div className="pt-2 border-t border-gray-300">
                        <p className="text-gray-600">Approved by: <span className="font-medium text-green-700">{selectedEncashment.approvedBy}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
