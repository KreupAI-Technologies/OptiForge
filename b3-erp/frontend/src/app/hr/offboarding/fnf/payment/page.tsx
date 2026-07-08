'use client';

import { useState, useMemo, useEffect } from 'react';
import { Send, CheckCircle, Clock, IndianRupee, Download, AlertCircle, X, Eye, CreditCard, Building2, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface FNFPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  lastWorkingDay: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  fnfComponents: {
    salary: number;
    leaveEncashment: number;
    gratuity: number;
    bonus?: number;
    reimbursements?: number;
  };
  deductions: {
    noticePeriodBuyout?: number;
    loanRecovery?: number;
    advanceRecovery?: number;
    otherDeductions?: number;
  };
  totalGross: number;
  totalDeductions: number;
  netPayable: number;
  status: 'pending' | 'approved' | 'processing' | 'paid';
  approvedBy?: string;
  approvedOn?: string;
  paidOn?: string;
  paymentMode: 'bank_transfer' | 'cheque';
  transactionRef?: string;
}

export default function FNFPaymentPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'approved' | 'processing' | 'paid'>('pending');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FNFPayment | null>(null);
  const [approveFormData, setApproveFormData] = useState({
    approvalRemarks: '',
    approvedBy: ''
  });
  const [initiateFormData, setInitiateFormData] = useState({
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'cheque',
    paymentDate: new Date().toISOString().split('T')[0],
    transactionRef: '',
    chequeNumber: '',
    chequeDate: '',
    bankName: '',
    remarks: ''
  });
  const [confirmFormData, setConfirmFormData] = useState({
    actualPaymentDate: new Date().toISOString().split('T')[0],
    transactionRef: '',
    confirmationRemarks: ''
  });

  const [mockPayments, setMockPayments] = useState<FNFPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const records = await OffboardingTasksService.list('fnf-payment');
      const mapped = records.map((r: OffboardingTaskRecord) => ({
        id: r.id,
        employeeCode: r.employeeCode || '',
        employeeName: r.employeeName || '',
        designation: r.designation || '',
        department: r.department || '',
        status: (r.status as any) || 'pending',
        ...(r.data || {}),
      })) as unknown as FNFPayment[];
      setMockPayments(mapped);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return mockPayments.filter(payment => payment.status === selectedTab);
  }, [selectedTab, mockPayments]);

  const stats = {
    pending: mockPayments.filter(p => p.status === 'pending').length,
    approved: mockPayments.filter(p => p.status === 'approved').length,
    processing: mockPayments.filter(p => p.status === 'processing').length,
    paid: mockPayments.filter(p => p.status === 'paid').length,
    totalPending: mockPayments
      .filter(p => p.status === 'pending' || p.status === 'approved')
      .reduce((sum, p) => sum + p.netPayable, 0),
    totalPaid: mockPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.netPayable, 0)
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    processing: <Send className="h-4 w-4" />,
    paid: <CheckCircle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const handleApprove = (payment: FNFPayment) => {
    setSelectedPayment(payment);
    setApproveFormData({
      approvalRemarks: '',
      approvedBy: ''
    });
    setShowApproveModal(true);
  };

  const handleInitiate = (payment: FNFPayment) => {
    setSelectedPayment(payment);
    setInitiateFormData({
      paymentMethod: payment.paymentMode,
      paymentDate: new Date().toISOString().split('T')[0],
      transactionRef: '',
      chequeNumber: '',
      chequeDate: '',
      bankName: payment.bankDetails.bankName,
      remarks: ''
    });
    setShowInitiateModal(true);
  };

  const handleConfirm = (payment: FNFPayment) => {
    setSelectedPayment(payment);
    setConfirmFormData({
      actualPaymentDate: new Date().toISOString().split('T')[0],
      transactionRef: payment.transactionRef || '',
      confirmationRemarks: ''
    });
    setShowConfirmModal(true);
  };

  const handleView = (payment: FNFPayment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleDownloadStatement = (payment: FNFPayment) => {
    toast({
      title: "Downloading FNF Statement",
      description: `FNF statement for ${payment.employeeName} is being downloaded.`
    });
  };

  const handleDownloadReceipt = (payment: FNFPayment) => {
    toast({
      title: "Downloading Payment Receipt",
      description: `Payment receipt for ${payment.employeeName} is being downloaded.`
    });
  };

  const handleSubmitApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedPayment.id, {
        status: 'approved',
        data: {
          ...(selectedPayment as any),
          approvalRemarks: approveFormData.approvalRemarks,
          approvedOn: new Date().toISOString().split('T')[0],
        },
      });
      toast({
        title: 'Payment Approved',
        description: `FNF payment for ${selectedPayment.employeeName} has been approved and is ready for processing.`,
      });
      setShowApproveModal(false);
      await loadPayments();
    } catch {
      toast({ title: 'Failed to approve payment', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedPayment.id, {
        status: 'processing',
        data: {
          ...(selectedPayment as any),
          paymentMode: initiateFormData.paymentMethod,
          paymentDate: initiateFormData.paymentDate,
          transactionRef: initiateFormData.transactionRef,
          chequeNumber: initiateFormData.chequeNumber,
          remarks: initiateFormData.remarks,
        },
      });
      toast({
        title: 'Payment Initiated',
        description: `FNF payment of ${formatCurrency(selectedPayment.netPayable || 0)} has been initiated for ${selectedPayment.employeeName}.`,
      });
      setShowInitiateModal(false);
      await loadPayments();
    } catch {
      toast({ title: 'Failed to initiate payment', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedPayment.id, {
        status: 'paid',
        data: {
          ...(selectedPayment as any),
          actualPaymentDate: confirmFormData.actualPaymentDate,
          transactionRef: confirmFormData.transactionRef,
          confirmationRemarks: confirmFormData.confirmationRemarks,
        },
      });
      toast({
        title: 'Payment Confirmed',
        description: `FNF payment for ${selectedPayment.employeeName} has been marked as paid.`,
      });
      setShowConfirmModal(false);
      await loadPayments();
    } catch {
      toast({ title: 'Failed to confirm payment', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">FNF - Final Payment & Settlement</h1>
        <p className="text-sm text-gray-600 mt-1">Process and track full & final settlement payments</p>
      </div>

      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading payments…</div>
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
              <p className="text-sm font-medium text-blue-600">Approved</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approved}</p>
              <p className="text-xs text-blue-600 mt-1">{formatCurrency(stats.totalPending)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Processing</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.processing}</p>
            </div>
            <Send className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Paid</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.paid}</p>
              <p className="text-xs text-green-600 mt-1">{formatCurrency(stats.totalPaid)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
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
          onClick={() => setSelectedTab('approved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setSelectedTab('processing')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'processing'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Processing ({stats.processing})
        </button>
        <button
          onClick={() => setSelectedTab('paid')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedTab === 'paid'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Paid ({stats.paid})
        </button>
      </div>

      <div className="space-y-2">
        {filteredPayments.map(payment => {
          return (
            <div key={payment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{payment.employeeName}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[payment.status]}`}>
                      <span className="inline-flex items-center gap-1">
                        {statusIcons[payment.status]}
                        {payment.status.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{payment.designation} • {payment.department}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last Working Day: {new Date(payment.lastWorkingDay).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 mb-3">Bank Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Name</span>
                      <span className="font-medium text-gray-900">{payment.bankDetails.accountName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Number</span>
                      <span className="font-medium text-gray-900">{payment.bankDetails.accountNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bank Name</span>
                      <span className="font-medium text-gray-900">{payment.bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IFSC Code</span>
                      <span className="font-medium text-gray-900">{payment.bankDetails.ifscCode}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Payment Mode</span>
                      <span className="font-medium text-blue-600">
                        {payment.paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Cheque'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">FNF Components (Credits)</h4>
                  <div className="space-y-2">
                    {payment.fnfComponents.salary > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Salary Component</span>
                        <span className="font-medium text-green-900">+{formatCurrency(payment.fnfComponents.salary)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Leave Encashment</span>
                      <span className="font-medium text-green-900">+{formatCurrency(payment.fnfComponents.leaveEncashment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Gratuity</span>
                      <span className="font-medium text-green-900">+{formatCurrency(payment.fnfComponents.gratuity)}</span>
                    </div>
                    {payment.fnfComponents.bonus && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Bonus</span>
                        <span className="font-medium text-green-900">+{formatCurrency(payment.fnfComponents.bonus)}</span>
                      </div>
                    )}
                    {payment.fnfComponents.reimbursements && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Reimbursements</span>
                        <span className="font-medium text-green-900">+{formatCurrency(payment.fnfComponents.reimbursements)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-green-300">
                      <span className="font-semibold text-green-900">Total Gross</span>
                      <span className="font-bold text-green-900">{formatCurrency(payment.totalGross)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {Object.keys(payment.deductions).length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200 mb-2">
                  <h4 className="font-semibold text-red-900 mb-3">Deductions</h4>
                  <div className="space-y-2">
                    {payment.deductions.noticePeriodBuyout && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700">Notice Period Buyout</span>
                        <span className="font-medium text-red-900">-{formatCurrency(payment.deductions.noticePeriodBuyout)}</span>
                      </div>
                    )}
                    {payment.deductions.loanRecovery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700">Loan Recovery</span>
                        <span className="font-medium text-red-900">-{formatCurrency(payment.deductions.loanRecovery)}</span>
                      </div>
                    )}
                    {payment.deductions.advanceRecovery && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700">Advance Recovery</span>
                        <span className="font-medium text-red-900">-{formatCurrency(payment.deductions.advanceRecovery)}</span>
                      </div>
                    )}
                    {payment.deductions.otherDeductions && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-700">Other Deductions</span>
                        <span className="font-medium text-red-900">-{formatCurrency(payment.deductions.otherDeductions)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-red-300">
                      <span className="font-semibold text-red-900">Total Deductions</span>
                      <span className="font-bold text-red-900">-{formatCurrency(payment.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              )}

              {payment.fnfComponents.salary < 0 && (
                <div className="mb-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Note on Salary Component</p>
                      <p className="text-xs text-yellow-800 mt-1">
                        Salary component shows as negative ({formatCurrency(payment.fnfComponents.salary)}) because notice period buyout
                        and other salary-related deductions exceeded the final month salary. Other FNF components (leave encashment, gratuity)
                        compensate for this.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`rounded-lg p-3 border-2 ${payment.netPayable >= 0
                  ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
                  : 'bg-gradient-to-r from-red-50 to-red-100 border-red-300'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Net Payable Amount (FNF)</p>
                    <p className={`text-3xl font-bold ${payment.netPayable >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {payment.netPayable >= 0 ? '' : '-'}{formatCurrency(payment.netPayable)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {payment.netPayable >= 0
                        ? 'Amount to be credited to employee account'
                        : 'Amount recoverable from employee'}
                    </p>
                  </div>
                  <IndianRupee className={`h-12 w-12 ${payment.netPayable >= 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
                </div>
              </div>

              {payment.transactionRef && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700">Transaction Reference</p>
                      <p className="text-sm font-semibold text-blue-900 mt-1">{payment.transactionRef}</p>
                    </div>
                    <span className="text-xs text-blue-700">
                      Paid on: {payment.paidOn && new Date(payment.paidOn).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {payment.approvedBy && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <p>Approved by: {payment.approvedBy} on {payment.approvedOn && new Date(payment.approvedOn).toLocaleDateString('en-IN')}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {payment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(payment)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      <CheckCircle className="inline h-4 w-4 mr-2" />
                      Approve for Payment
                    </button>
                    <button
                      onClick={() => handleView(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </>
                )}
                {payment.status === 'approved' && (
                  <>
                    <button
                      onClick={() => handleInitiate(payment)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm"
                    >
                      <Send className="inline h-4 w-4 mr-2" />
                      Initiate Payment
                    </button>
                    <button
                      onClick={() => handleView(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadStatement(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Download className="inline h-4 w-4 mr-2" />
                      Download FNF Statement
                    </button>
                  </>
                )}
                {payment.status === 'processing' && (
                  <>
                    <button
                      onClick={() => handleConfirm(payment)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                    >
                      <CheckCircle className="inline h-4 w-4 mr-2" />
                      Confirm Payment
                    </button>
                    <button
                      onClick={() => handleView(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </>
                )}
                {payment.status === 'paid' && (
                  <>
                    <button
                      onClick={() => handleDownloadReceipt(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Download className="inline h-4 w-4 mr-2" />
                      Download Receipt
                    </button>
                    <button
                      onClick={() => handleDownloadStatement(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Download className="inline h-4 w-4 mr-2" />
                      Download FNF Statement
                    </button>
                    <button
                      onClick={() => handleView(payment)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                    >
                      <Eye className="inline h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Approve Payment Modal */}
      {showApproveModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Approve FNF Payment</h2>
              </div>
              <button onClick={() => setShowApproveModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">{selectedPayment.employeeName}</h3>
                <p className="text-sm text-blue-700">
                  {selectedPayment.designation} • {selectedPayment.department}
                </p>
                <p className="text-xs text-blue-600 mt-1">Employee ID: {selectedPayment.employeeId}</p>
              </div>

              <div className="mb-3 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                <p className="text-sm font-medium text-gray-700 mb-2">Net Payable Amount</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatCurrency(selectedPayment.netPayable)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  This amount will be transferred to employee's bank account
                </p>
              </div>

              <div className="mb-3 space-y-2">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Bank Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Account Name</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.accountName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Account Number</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bank Name</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">IFSC Code</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.ifscCode}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Payment Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Gross Amount</span>
                      <span className="font-semibold text-green-700">+{formatCurrency(selectedPayment.totalGross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Deductions</span>
                      <span className="font-semibold text-red-700">-{formatCurrency(selectedPayment.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="font-bold text-blue-900">Net Payable</span>
                      <span className="font-bold text-green-700">{formatCurrency(selectedPayment.netPayable)}</span>
                    </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., John Doe - CFO"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Remarks
                  </label>
                  <textarea
                    value={approveFormData.approvalRemarks}
                    onChange={(e) => setApproveFormData({ ...approveFormData, approvalRemarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any additional notes or remarks..."
                  />
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Important</p>
                      <p className="text-xs text-yellow-800 mt-1">
                        By approving this payment, you confirm that all FNF calculations have been verified and the payment
                        is ready to be processed. This action will move the payment to "Approved" status.
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
                    {submitting ? 'Approving…' : 'Approve Payment'}
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

      {/* Initiate Payment Modal */}
      {showInitiateModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Send className="h-6 w-6" />
                <h2 className="text-xl font-bold">Initiate FNF Payment</h2>
              </div>
              <button onClick={() => setShowInitiateModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">{selectedPayment.employeeName}</h3>
                <p className="text-sm text-purple-700">
                  {selectedPayment.designation} • {selectedPayment.department}
                </p>
                <p className="text-xs text-purple-600 mt-1">Payment ID: {selectedPayment.id}</p>
              </div>

              <div className="mb-3 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                <p className="text-sm font-medium text-gray-700 mb-2">Amount to Transfer</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatCurrency(selectedPayment.netPayable)}
                </p>
              </div>

              <form onSubmit={handleSubmitInitiate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInitiateFormData({ ...initiateFormData, paymentMethod: 'bank_transfer' })}
                      className={`p-4 rounded-lg border-2 transition-all ${initiateFormData.paymentMethod === 'bank_transfer'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <Building2 className={`h-8 w-8 mb-2 ${initiateFormData.paymentMethod === 'bank_transfer' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                      <p className="font-semibold text-sm">Bank Transfer</p>
                      <p className="text-xs text-gray-500 mt-1">NEFT/RTGS/IMPS</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInitiateFormData({ ...initiateFormData, paymentMethod: 'cheque' })}
                      className={`p-4 rounded-lg border-2 transition-all ${initiateFormData.paymentMethod === 'cheque'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <CreditCard className={`h-8 w-8 mb-2 ${initiateFormData.paymentMethod === 'cheque' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                      <p className="font-semibold text-sm">Cheque</p>
                      <p className="text-xs text-gray-500 mt-1">Physical Cheque</p>
                    </button>
                  </div>
                </div>

                {initiateFormData.paymentMethod === 'bank_transfer' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={initiateFormData.paymentDate}
                          onChange={(e) => setInitiateFormData({ ...initiateFormData, paymentDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Transaction Reference <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={initiateFormData.transactionRef}
                          onChange={(e) => setInitiateFormData({ ...initiateFormData, transactionRef: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="TXN20251107XXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Recipient Bank Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Account Name</p>
                          <p className="font-medium text-gray-900">{selectedPayment.bankDetails.accountName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Account Number</p>
                          <p className="font-medium text-gray-900">{selectedPayment.bankDetails.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Bank Name</p>
                          <p className="font-medium text-gray-900">{selectedPayment.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">IFSC Code</p>
                          <p className="font-medium text-gray-900">{selectedPayment.bankDetails.ifscCode}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {initiateFormData.paymentMethod === 'cheque' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={initiateFormData.chequeNumber}
                          onChange={(e) => setInitiateFormData({ ...initiateFormData, chequeNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="CHQ123456"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cheque Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={initiateFormData.chequeDate}
                          onChange={(e) => setInitiateFormData({ ...initiateFormData, chequeDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={initiateFormData.bankName}
                        onChange={(e) => setInitiateFormData({ ...initiateFormData, bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter issuing bank name"
                        required
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-3">Payable To</h4>
                      <p className="text-sm text-blue-700">{selectedPayment.bankDetails.accountName}</p>
                      <p className="text-xs text-blue-600 mt-1">{selectedPayment.bankDetails.bankName} - A/C {selectedPayment.bankDetails.accountNumber}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Remarks
                  </label>
                  <textarea
                    value={initiateFormData.remarks}
                    onChange={(e) => setInitiateFormData({ ...initiateFormData, remarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={2}
                    placeholder="Any additional notes..."
                  />
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Payment Initiation</p>
                      <p className="text-xs text-yellow-800 mt-1">
                        After initiating the payment, the status will change to "Processing". Ensure all details are correct
                        before proceeding as this action will trigger the payment process.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
                  >
                    <Send className="inline h-5 w-5 mr-2" />
                    {submitting ? 'Initiating…' : 'Initiate Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInitiateModal(false)}
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

      {/* Confirm Payment Modal */}
      {showConfirmModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Confirm Payment Completion</h2>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">{selectedPayment.employeeName}</h3>
                <p className="text-sm text-green-700">
                  {selectedPayment.designation} • {selectedPayment.department}
                </p>
                <p className="text-xs text-green-600 mt-1">Payment ID: {selectedPayment.id}</p>
              </div>

              <div className="mb-3 p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-300">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Amount</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatCurrency(selectedPayment.netPayable)}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {selectedPayment.paymentMode === 'bank_transfer' ? 'Bank Transfer' : 'Cheque'} to {selectedPayment.bankDetails.bankName}
                </p>
              </div>

              <form onSubmit={handleSubmitConfirm} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={confirmFormData.actualPaymentDate}
                      onChange={(e) => setConfirmFormData({ ...confirmFormData, actualPaymentDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Reference <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={confirmFormData.transactionRef}
                      onChange={(e) => setConfirmFormData({ ...confirmFormData, transactionRef: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Final transaction reference"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmation Remarks
                  </label>
                  <textarea
                    value={confirmFormData.confirmationRemarks}
                    onChange={(e) => setConfirmFormData({ ...confirmFormData, confirmationRemarks: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Confirmation notes, payment receipt details, etc..."
                  />
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Payment Confirmation</p>
                      <p className="text-xs text-green-800 mt-1">
                        By confirming this payment, you acknowledge that the FNF amount has been successfully transferred
                        to the employee's account. The payment status will be marked as "Paid" and this action cannot be undone.
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
                    <CheckCircle className="inline h-5 w-5 mr-2" />
                    {submitting ? 'Confirming…' : 'Confirm Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
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

      {/* View Payment Details Modal */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Eye className="h-6 w-6" />
                <h2 className="text-xl font-bold">FNF Payment Details</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPayment.employeeName}</h3>
                  <p className="text-gray-600">{selectedPayment.designation} • {selectedPayment.department}</p>
                  <p className="text-sm text-gray-500 mt-1">Employee ID: {selectedPayment.employeeId}</p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 text-sm font-semibold rounded-full ${statusColors[selectedPayment.status]}`}>
                    {selectedPayment.status.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">Payment ID: {selectedPayment.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    Bank Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Account Name</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.accountName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Account Number</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Bank Name</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">IFSC Code</p>
                      <p className="font-medium text-gray-900">{selectedPayment.bankDetails.ifscCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Mode</p>
                      <p className="font-medium text-blue-700">
                        {selectedPayment.paymentMode === 'bank_transfer' ? 'Bank Transfer (NEFT/RTGS)' : 'Cheque'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Timeline
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600">Last Working Day</p>
                      <p className="font-medium text-blue-900">
                        {new Date(selectedPayment.lastWorkingDay).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {selectedPayment.approvedOn && (
                      <div>
                        <p className="text-xs text-blue-600">Approved On</p>
                        <p className="font-medium text-blue-900">
                          {new Date(selectedPayment.approvedOn).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        {selectedPayment.approvedBy && (
                          <p className="text-xs text-blue-700 mt-1">By: {selectedPayment.approvedBy}</p>
                        )}
                      </div>
                    )}
                    {selectedPayment.paidOn && (
                      <div>
                        <p className="text-xs text-blue-600">Paid On</p>
                        <p className="font-medium text-blue-900">
                          {new Date(selectedPayment.paidOn).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedPayment.transactionRef && (
                      <div>
                        <p className="text-xs text-blue-600">Transaction Reference</p>
                        <p className="font-medium text-blue-900">{selectedPayment.transactionRef}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3 bg-green-50 rounded-lg p-5 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">FNF Components - Credits</h4>
                <div className="space-y-3">
                  {selectedPayment.fnfComponents.salary > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Salary Component</span>
                      <span className="font-bold text-green-900">+{formatCurrency(selectedPayment.fnfComponents.salary)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Leave Encashment</span>
                    <span className="font-bold text-green-900">+{formatCurrency(selectedPayment.fnfComponents.leaveEncashment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Gratuity</span>
                    <span className="font-bold text-green-900">+{formatCurrency(selectedPayment.fnfComponents.gratuity)}</span>
                  </div>
                  {selectedPayment.fnfComponents.bonus && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Bonus</span>
                      <span className="font-bold text-green-900">+{formatCurrency(selectedPayment.fnfComponents.bonus)}</span>
                    </div>
                  )}
                  {selectedPayment.fnfComponents.reimbursements && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Pending Reimbursements</span>
                      <span className="font-bold text-green-900">+{formatCurrency(selectedPayment.fnfComponents.reimbursements)}</span>
                    </div>
                  )}
                  <div className="pt-3 mt-3 border-t-2 border-green-300 flex justify-between items-center">
                    <span className="font-bold text-green-900 text-lg">Total Gross Amount</span>
                    <span className="font-bold text-green-900 text-xl">+{formatCurrency(selectedPayment.totalGross)}</span>
                  </div>
                </div>
              </div>

              {Object.keys(selectedPayment.deductions).length > 0 && (
                <div className="mb-3 bg-red-50 rounded-lg p-5 border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">Deductions</h4>
                  <div className="space-y-3">
                    {selectedPayment.deductions.noticePeriodBuyout && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-700">Notice Period Buyout</span>
                        <span className="font-bold text-red-900">-{formatCurrency(selectedPayment.deductions.noticePeriodBuyout)}</span>
                      </div>
                    )}
                    {selectedPayment.deductions.loanRecovery && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-700">Loan Recovery</span>
                        <span className="font-bold text-red-900">-{formatCurrency(selectedPayment.deductions.loanRecovery)}</span>
                      </div>
                    )}
                    {selectedPayment.deductions.advanceRecovery && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-700">Advance Recovery</span>
                        <span className="font-bold text-red-900">-{formatCurrency(selectedPayment.deductions.advanceRecovery)}</span>
                      </div>
                    )}
                    {selectedPayment.deductions.otherDeductions && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-700">Other Deductions</span>
                        <span className="font-bold text-red-900">-{formatCurrency(selectedPayment.deductions.otherDeductions)}</span>
                      </div>
                    )}
                    <div className="pt-3 mt-3 border-t-2 border-red-300 flex justify-between items-center">
                      <span className="font-bold text-red-900 text-lg">Total Deductions</span>
                      <span className="font-bold text-red-900 text-xl">-{formatCurrency(selectedPayment.totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-400">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Net Payable Amount</p>
                    <p className="text-5xl font-bold text-green-700">
                      {formatCurrency(selectedPayment.netPayable)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedPayment.status === 'paid'
                        ? `Paid on ${selectedPayment.paidOn && new Date(selectedPayment.paidOn).toLocaleDateString('en-IN')}`
                        : 'Amount to be credited to employee account'}
                    </p>
                  </div>
                  <IndianRupee className="h-16 w-16 text-green-600" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadStatement(selectedPayment)}
                  className="px-3 py-2 border-2 border-gray-600 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  <Download className="inline h-5 w-5 mr-2" />
                  Download Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
