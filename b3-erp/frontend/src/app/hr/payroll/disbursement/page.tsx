'use client';

import { useState, useMemo, useEffect } from 'react';
import { Send, CheckCircle, Clock, Download, FileText, Building2, DollarSign, Calendar, AlertCircle, X, Printer, Mail } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface EmployeeDisbursement {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  netSalary: number;
  disbursementStatus: 'pending' | 'processing' | 'completed' | 'failed';
  disbursedOn?: string;
  transactionId?: string;
  failureReason?: string;
}

interface DisbursementBatch {
  id: string;
  monthYear: string;
  payPeriod: string;
  disbursementDate: string;
  employeeCount: number;
  totalAmount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  status: 'draft' | 'approved' | 'processing' | 'completed';
  approvedBy?: string;
  approvedOn?: string;
  processedBy?: string;
  processedOn?: string;
  records: EmployeeDisbursement[];
}

export default function PayrollDisbursementPage() {
  const [selectedBank, setSelectedBank] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showBankFileModal, setShowBankFileModal] = useState(false);
  const [showPaymentReportModal, setShowPaymentReportModal] = useState(false);
  const [showProcessPaymentModal, setShowProcessPaymentModal] = useState(false);
  const [showUpdateBankModal, setShowUpdateBankModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<EmployeeDisbursement | null>(null);

  const [records, setRecords] = useState<EmployeeDisbursement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadDisbursements = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await HrPayrollService.getDisbursements('disbursement');
      if (Array.isArray(raw)) {
        const mapped: EmployeeDisbursement[] = raw.map((r: any) => ({
          id: r.id ?? '',
          employeeId: r.employeeId ?? r.employeeCode ?? '',
          employeeName: r.employeeName ?? '',
          designation: r.details?.designation ?? '',
          department: r.department ?? '',
          bankName: r.bankName ?? r.details?.bankName ?? '',
          accountNumber: r.accountNumber ?? r.details?.accountNumber ?? '',
          ifscCode: r.details?.ifscCode ?? '',
          netSalary: Number(r.netPay ?? r.details?.netPay ?? r.amount ?? 0),
          disbursementStatus: (r.status ?? 'pending') as EmployeeDisbursement['disbursementStatus'],
          disbursedOn: r.details?.disbursedOn ?? undefined,
          transactionId: r.details?.transactionId ?? undefined,
          failureReason: r.details?.failureReason ?? undefined,
        }));
        setRecords(mapped);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisbursements();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesBank = selectedBank === 'all' || record.bankName === selectedBank;
      const matchesStatus = selectedStatus === 'all' || record.disbursementStatus === selectedStatus;
      return matchesBank && matchesStatus;
    });
  }, [records, selectedBank, selectedStatus]);

  // Batch summary derived from the live disbursement records
  const batch: DisbursementBatch = useMemo(() => ({
    id: '',
    monthYear: '',
    payPeriod: '',
    disbursementDate: '',
    employeeCount: records.length,
    totalAmount: records.reduce((sum, r) => sum + (r.netSalary || 0), 0),
    pendingCount: records.filter(r => r.disbursementStatus === 'pending').length,
    processingCount: records.filter(r => r.disbursementStatus === 'processing').length,
    completedCount: records.filter(r => r.disbursementStatus === 'completed').length,
    failedCount: records.filter(r => r.disbursementStatus === 'failed').length,
    status: 'processing',
    records,
  }), [records]);

  const banks = ['all', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra Bank'];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    processing: <Send className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    failed: <AlertCircle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatCurrencyLakhs = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return 'XXXX' + accountNumber.slice(-4);
  };

  const handleDownloadReceipt = (record: EmployeeDisbursement) => {
    setSelectedRecord(record);
    setShowReceiptModal(true);
  };

  const handleDownloadBankFile = () => {
    setShowBankFileModal(true);
  };

  const handlePaymentReport = () => {
    setShowPaymentReportModal(true);
  };

  const handleProcessPayment = (record: EmployeeDisbursement) => {
    setSelectedRecord(record);
    setShowProcessPaymentModal(true);
  };

  const handleUpdateBankDetails = (record: EmployeeDisbursement) => {
    setSelectedRecord(record);
    setShowUpdateBankModal(true);
  };

  const handleRetryPayment = async (record: EmployeeDisbursement) => {
    if (busyId) return;
    setBusyId(record.id);
    setActionError(null);
    try {
      await HrPayrollService.updateDisbursement(record.id, {
        status: 'processing',
        details: { ...(record as any), retriedAt: new Date().toISOString(), failureReason: null },
      });
      await loadDisbursements();
    } catch {
      setActionError(`Failed to retry payment for ${record.employeeName}. Please try again.`);
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmProcessPayment = async () => {
    if (!selectedRecord || busyId) return;
    setBusyId(selectedRecord.id);
    setActionError(null);
    try {
      await HrPayrollService.updateDisbursement(selectedRecord.id, {
        status: 'completed',
        details: {
          ...(selectedRecord as any),
          disbursedOn: new Date().toISOString(),
        },
      });
      setShowProcessPaymentModal(false);
      setSelectedRecord(null);
      await loadDisbursements();
    } catch {
      setActionError('Failed to process payment. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmUpdateBank = async (bankName: string, accountNumber: string, ifscCode: string) => {
    if (!selectedRecord || busyId) return;
    setBusyId(selectedRecord.id);
    setActionError(null);
    try {
      await HrPayrollService.updateDisbursement(selectedRecord.id, {
        bankName,
        accountNumber,
        details: { ...(selectedRecord as any), bankName, accountNumber, ifscCode },
      });
      setShowUpdateBankModal(false);
      setSelectedRecord(null);
      await loadDisbursements();
    } catch {
      setActionError('Failed to update bank details. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Salary Disbursement</h1>
        <p className="text-sm text-gray-600 mt-1">Process and track salary payments to employee bank accounts</p>
        {isLoading && <p className="text-xs text-gray-400 mt-1">Loading…</p>}
        {loadError && <p className="text-sm text-red-600 mt-1">{loadError}</p>}
        {actionError && <p className="text-sm text-red-600 mt-1">{actionError}</p>}
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{batch.monthYear}</h2>
            <p className="text-sm text-gray-600 mt-1">Pay Period: {batch.payPeriod}</p>
            <p className="text-xs text-gray-500 mt-1">Batch ID: {batch.id}</p>
          </div>
          <div className="text-right">
            <span className="px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 block mb-2">
              {batch.status.toUpperCase()}
            </span>
            <p className="text-xs text-gray-600">
              Disbursement Date: {new Date(batch.disbursementDate).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{batch.employeeCount}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Amount</p>
                <p className="text-lg font-bold text-green-900 mt-1">{formatCurrencyLakhs(batch.totalAmount)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Approved By</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{batch.approvedBy || 'Pending'}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Processed On</p>
                <p className="text-xs font-bold text-gray-900 mt-1">
                  {batch.processedOn && new Date(batch.processedOn).toLocaleDateString('en-IN')}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        {batch.approvedBy && batch.approvedOn && (
          <div className="mt-4 pt-4 border-t border-purple-200 text-xs text-gray-600">
            <p>Approved by: {batch.approvedBy} on {new Date(batch.approvedOn).toLocaleDateString('en-IN')}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{batch.pendingCount}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Processing</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{batch.processingCount}</p>
            </div>
            <Send className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{batch.completedCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{batch.failedCount}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {banks.map(bank => (
                <option key={bank} value={bank}>
                  {bank === 'all' ? 'All Banks' : bank}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <button
            onClick={handleDownloadBankFile}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download Bank File
          </button>
          <button
            onClick={handlePaymentReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText className="h-4 w-4" />
            Payment Report
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRecords.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{record.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {record.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[record.disbursementStatus]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[record.disbursementStatus]}
                      {record.disbursementStatus.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {record.designation} • {record.department}
                </p>
                {record.failureReason && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-xs text-red-700 font-medium">⚠️ {record.failureReason}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Net Salary</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(record.netSalary)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900 text-sm">Bank Details</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-blue-700">Bank Name</p>
                    <p className="text-sm font-medium text-blue-900">{record.bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Account Number</p>
                    <p className="text-sm font-medium text-blue-900">{maskAccountNumber(record.accountNumber)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">IFSC Code</p>
                    <p className="text-sm font-medium text-blue-900">{record.ifscCode}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Send className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 text-sm">Transaction Details</h4>
                </div>
                <div className="space-y-2">
                  {record.transactionId && (
                    <div>
                      <p className="text-xs text-purple-700">Transaction ID</p>
                      <p className="text-sm font-medium text-purple-900">{record.transactionId}</p>
                    </div>
                  )}
                  {record.disbursedOn && (
                    <div>
                      <p className="text-xs text-purple-700">Disbursed On</p>
                      <p className="text-sm font-medium text-purple-900">
                        {new Date(record.disbursedOn).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {!record.transactionId && record.disbursementStatus === 'pending' && (
                    <div className="text-center py-2">
                      <p className="text-xs text-purple-700">Awaiting processing</p>
                    </div>
                  )}
                  {!record.transactionId && record.disbursementStatus === 'processing' && (
                    <div className="text-center py-2">
                      <p className="text-xs text-purple-700">Transaction in progress...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm">Payment Summary</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-green-700">Net Payable</span>
                    <span className="text-sm font-bold text-green-900">{formatCurrency(record.netSalary)}</span>
                  </div>
                  <div className="pt-2 border-t border-green-300">
                    <p className="text-xs text-green-700 mb-1">Payment Mode</p>
                    <p className="text-sm font-medium text-green-900">Bank Transfer (NEFT)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {record.disbursementStatus === 'pending' && (
                <button
                  onClick={() => handleProcessPayment(record)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  <Send className="inline h-4 w-4 mr-2" />
                  Process Payment
                </button>
              )}
              {record.disbursementStatus === 'failed' && (
                <>
                  <button
                    onClick={() => handleRetryPayment(record)}
                    disabled={busyId === record.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                  >
                    {busyId === record.id ? 'Retrying…' : 'Retry Payment'}
                  </button>
                  <button
                    onClick={() => handleUpdateBankDetails(record)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    Update Bank Details
                  </button>
                </>
              )}
              {record.disbursementStatus === 'completed' && (
                <button
                  onClick={() => handleDownloadReceipt(record)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm border border-gray-300"
                >
                  <Download className="inline h-4 w-4 mr-2" />
                  Download Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {batch.completedCount === batch.employeeCount && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-900">All disbursements completed!</h3>
              <p className="text-sm text-green-700 mt-1">
                {batch.employeeCount} payments successfully processed for {batch.monthYear}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
      )}

      {batch.failedCount > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-900">Action Required</h3>
              <p className="text-sm text-red-700 mt-1">
                {batch.failedCount} payment{batch.failedCount > 1 ? 's' : ''} failed. Please review and retry.
              </p>
            </div>
            <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
              Review Failed Payments
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Disbursement Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Verify all bank account details before processing payments</li>
          <li>• Download bank file in the format required by your bank (NEFT/RTGS)</li>
          <li>• Ensure sufficient balance in company account before initiating transfer</li>
          <li>• Failed payments should be retried after correcting bank details</li>
          <li>• Payment receipts are generated automatically for completed transactions</li>
          <li>• Maintain transaction IDs for audit and reconciliation purposes</li>
        </ul>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedRecord && (
        <ReceiptModal
          record={selectedRecord}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedRecord(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Bank File Modal */}
      {showBankFileModal && (
        <BankFileModal
          batch={batch}
          onClose={() => setShowBankFileModal(false)}
        />
      )}

      {/* Payment Report Modal */}
      {showPaymentReportModal && (
        <PaymentReportModal
          batch={batch}
          onClose={() => setShowPaymentReportModal(false)}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Process Payment Modal */}
      {showProcessPaymentModal && selectedRecord && (
        <ProcessPaymentModal
          record={selectedRecord}
          onClose={() => {
            setShowProcessPaymentModal(false);
            setSelectedRecord(null);
          }}
          onConfirm={handleConfirmProcessPayment}
          busy={busyId === selectedRecord.id}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Update Bank Details Modal */}
      {showUpdateBankModal && selectedRecord && (
        <UpdateBankModal
          record={selectedRecord}
          onClose={() => {
            setShowUpdateBankModal(false);
            setSelectedRecord(null);
          }}
          onSave={handleConfirmUpdateBank}
          busy={busyId === selectedRecord.id}
        />
      )}
    </div>
  );
}

// Receipt Modal Component
interface ReceiptModalProps {
  record: EmployeeDisbursement;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

function ReceiptModal({ record, onClose, formatCurrency }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Payment Receipt</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6" id="receipt-content">
          {/* Company Header */}
          <div className="text-center mb-3 pb-4 border-b-2 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">ManufacturingOS</h1>
            <p className="text-sm text-gray-600">Solution to manufacturers System</p>
            <p className="text-xs text-gray-500 mt-1">Salary Payment Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <p className="text-xs text-gray-600">Transaction ID</p>
              <p className="font-semibold text-gray-900">{record.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Payment Date</p>
              <p className="font-semibold text-gray-900">
                {record.disbursedOn && new Date(record.disbursedOn).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Employee ID</p>
              <p className="font-semibold text-gray-900">{record.employeeId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Employee Name</p>
              <p className="font-semibold text-gray-900">{record.employeeName}</p>
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <h3 className="font-semibold text-blue-900 mb-3">Bank Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-700">Bank Name</p>
                <p className="text-sm font-medium text-blue-900">{record.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Account Number</p>
                <p className="text-sm font-medium text-blue-900">{record.accountNumber}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">IFSC Code</p>
                <p className="text-sm font-medium text-blue-900">{record.ifscCode}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Payment Mode</p>
                <p className="text-sm font-medium text-blue-900">NEFT</p>
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="bg-green-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-green-700">Net Salary Paid</p>
                <p className="text-xs text-green-600 mt-1">For the month of November 2025</p>
              </div>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(record.netSalary)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p>This is a computer-generated receipt and does not require a signature.</p>
            <p className="mt-1">For queries, contact HR Department</p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Bank File Modal Component
interface BankFileModalProps {
  batch: DisbursementBatch;
  onClose: () => void;
}

function BankFileModal({ batch, onClose }: BankFileModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Download Bank File</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-3">
            Select the format for your bank's bulk payment processing system
          </p>

          <div className="space-y-3">
            <button className="w-full p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">NEFT Format (CSV)</p>
                  <p className="text-xs text-gray-600 mt-1">Compatible with HDFC, ICICI, SBI</p>
                </div>
                <Download className="h-5 w-5 text-blue-600" />
              </div>
            </button>

            <button className="w-full p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">RTGS Format (Excel)</p>
                  <p className="text-xs text-gray-600 mt-1">For high-value transactions</p>
                </div>
                <Download className="h-5 w-5 text-blue-600" />
              </div>
            </button>

            <button className="w-full p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Generic Format (TXT)</p>
                  <p className="text-xs text-gray-600 mt-1">Universal format for all banks</p>
                </div>
                <Download className="h-5 w-5 text-blue-600" />
              </div>
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Ensure you have sufficient balance before uploading to your bank portal
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Report Modal Component
interface PaymentReportModalProps {
  batch: DisbursementBatch;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

function PaymentReportModal({ batch, onClose, formatCurrency }: PaymentReportModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-white">Payment Summary Report</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Report Header */}
          <div className="text-center mb-3">
            <h1 className="text-2xl font-bold text-gray-900">ManufacturingOS</h1>
            <p className="text-sm text-gray-600">Salary Disbursement Report</p>
            <p className="text-xs text-gray-500 mt-1">{batch.monthYear}</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900">{batch.employeeCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-900">{batch.completedCount}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-700">Processing</p>
              <p className="text-2xl font-bold text-yellow-900">{batch.processingCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-700">Failed</p>
              <p className="text-2xl font-bold text-red-900">{batch.failedCount}</p>
            </div>
          </div>

          {/* Payment Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">Employee</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Bank</th>
                  <th className="text-right p-3 font-semibold text-gray-700">Amount</th>
                  <th className="text-center p-3 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {batch.records.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{record.employeeName}</p>
                      <p className="text-xs text-gray-600">{record.employeeId}</p>
                    </td>
                    <td className="p-3 text-gray-700">{record.bankName}</td>
                    <td className="p-3 text-right font-semibold text-gray-900">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.disbursementStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        record.disbursementStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                        record.disbursementStatus === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.disbursementStatus.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={2} className="p-3 text-gray-900">Total Amount Disbursed</td>
                  <td className="p-3 text-right text-green-900">{formatCurrency(batch.totalAmount)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </button>
        </div>
      </div>
    </div>
  );
}

// Process Payment Modal Component
interface ProcessPaymentModalProps {
  record: EmployeeDisbursement;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  formatCurrency: (amount: number) => string;
}

function ProcessPaymentModal({ record, onClose, onConfirm, busy, formatCurrency }: ProcessPaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Process Payment</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-2">{record.employeeName}</h3>
            <p className="text-sm text-gray-600">{record.designation} • {record.department}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-blue-900 mb-3">Payment Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Amount</span>
                <span className="font-bold text-blue-900">{formatCurrency(record.netSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Bank</span>
                <span className="font-medium text-blue-900">{record.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Account</span>
                <span className="font-medium text-blue-900">{record.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">IFSC</span>
                <span className="font-medium text-blue-900">{record.ifscCode}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-yellow-800">
              <strong>Confirm:</strong> Please verify all details before processing the payment. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {busy ? 'Processing…' : 'Process Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Update Bank Details Modal Component
interface UpdateBankModalProps {
  record: EmployeeDisbursement;
  onClose: () => void;
  onSave: (bankName: string, accountNumber: string, ifscCode: string) => void;
  busy: boolean;
}

function UpdateBankModal({ record, onClose, onSave, busy }: UpdateBankModalProps) {
  const [bankName, setBankName] = useState(record.bankName);
  const [accountNumber, setAccountNumber] = useState(record.accountNumber);
  const [ifscCode, setIfscCode] = useState(record.ifscCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Update Bank Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-2">{record.employeeName}</h3>
            <p className="text-sm text-gray-600">{record.employeeId}</p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Changes will be saved immediately and reflected in the next payment.
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(bankName, accountNumber, ifscCode)}
            disabled={busy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
