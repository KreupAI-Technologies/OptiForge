'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Plus, CheckCircle, Clock, XCircle, AlertTriangle, AlertCircle, Receipt, Eye, Download, X, Calendar, User, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface ExpenseClaim {
  id: string;
  claimNumber: string;
  submissionDate: string;
  category: 'travel' | 'food' | 'accommodation' | 'fuel' | 'supplies' | 'communication' | 'other';
  description: string;
  amount: number;
  billDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  approver: string;
  approvedDate?: string;
  paidDate?: string;
  rejectionReason?: string;
  receiptAttached: boolean;
}

export default function MyExpensesPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseClaim | null>(null);
  const [rows, setRows] = useState<ExpenseClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getExpenseClaims({ kind: 'expense' });
        const mapped: ExpenseClaim[] = raw.map((r) => ({
          id: r.id,
          claimNumber: r.claimNumber ?? '',
          submissionDate: r.submissionDate ?? r.submittedDate ?? '',
          category: (r.category as ExpenseClaim['category']) ?? 'other',
          description: r.description ?? '',
          amount: Number(r.amount ?? 0),
          billDate: r.billDate ?? '',
          status: (r.status as ExpenseClaim['status']) ?? 'submitted',
          approver: r.approver ?? '',
          approvedDate: r.approvedDate ?? undefined,
          paidDate: r.paidDate ?? undefined,
          rejectionReason: r.rejectionReason ?? undefined,
          receiptAttached: r.receiptAttached ?? false,
        }));
        if (!cancelled) setRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load expense claims');
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mockExpenses: ExpenseClaim[] = rows.length ? rows : [
    {
      id: '1', claimNumber: 'EXP-2024-1201', submissionDate: '2024-10-20', category: 'travel',
      description: 'Client visit - Mumbai', amount: 4500, billDate: '2024-10-18',
      status: 'approved', approver: 'Rajesh Kumar', approvedDate: '2024-10-22', receiptAttached: true
    },
    {
      id: '2', claimNumber: 'EXP-2024-1202', submissionDate: '2024-10-22', category: 'fuel',
      description: 'Fuel for factory visit', amount: 2800, billDate: '2024-10-20',
      status: 'submitted', approver: 'Rajesh Kumar', receiptAttached: true
    },
    {
      id: '3', claimNumber: 'EXP-2024-1203', submissionDate: '2024-10-23', category: 'food',
      description: 'Business lunch with client', amount: 1200, billDate: '2024-10-23',
      status: 'submitted', approver: 'Rajesh Kumar', receiptAttached: true
    },
    {
      id: '4', claimNumber: 'EXP-2024-1204', submissionDate: '2024-10-15', category: 'accommodation',
      description: 'Hotel stay - Bangalore trip', amount: 6800, billDate: '2024-10-12',
      status: 'paid', approver: 'Rajesh Kumar', approvedDate: '2024-10-17',
      paidDate: '2024-10-25', receiptAttached: true
    },
    {
      id: '5', claimNumber: 'EXP-2024-1205', submissionDate: '2024-10-18', category: 'supplies',
      description: 'Office supplies purchase', amount: 3200, billDate: '2024-10-17',
      status: 'rejected', approver: 'Rajesh Kumar',
      rejectionReason: 'Receipt not clear - please resubmit with original bill', receiptAttached: true
    },
    {
      id: '6', claimNumber: 'DRAFT-001', submissionDate: '', category: 'communication',
      description: 'Mobile recharge', amount: 599, billDate: '2024-10-24',
      status: 'draft', approver: '', receiptAttached: false
    },
    {
      id: '7', claimNumber: 'EXP-2024-1206', submissionDate: '2024-10-25', category: 'travel',
      description: 'Local conveyance', amount: 850, billDate: '2024-10-24',
      status: 'submitted', approver: 'Rajesh Kumar', receiptAttached: true
    },
    {
      id: '8', claimNumber: 'EXP-2024-1207', submissionDate: '2024-10-10', category: 'fuel',
      description: 'Petrol - Site visit', amount: 1500, billDate: '2024-10-09',
      status: 'paid', approver: 'Rajesh Kumar', approvedDate: '2024-10-12',
      paidDate: '2024-10-20', receiptAttached: true
    },
    {
      id: '9', claimNumber: 'EXP-2024-1208', submissionDate: '2024-11-02', category: 'travel',
      description: 'Airport taxi', amount: 650, billDate: '2024-11-01',
      status: 'approved', approver: 'Rajesh Kumar', approvedDate: '2024-11-04', receiptAttached: true
    },
    {
      id: '10', claimNumber: 'DRAFT-002', submissionDate: '', category: 'food',
      description: 'Team lunch', amount: 1800, billDate: '2024-11-05',
      status: 'draft', approver: '', receiptAttached: false
    }
  ];

  const filteredExpenses = useMemo(() => {
    return mockExpenses.filter(expense => {
      const matchesStatus = selectedStatus === 'all' || expense.status === selectedStatus;
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      return matchesStatus && matchesCategory;
    });
  }, [selectedStatus, selectedCategory]);

  const stats = {
    total: mockExpenses.filter(e => e.status !== 'draft').length,
    draft: mockExpenses.filter(e => e.status === 'draft').length,
    submitted: mockExpenses.filter(e => e.status === 'submitted').length,
    approved: mockExpenses.filter(e => e.status === 'approved').length,
    rejected: mockExpenses.filter(e => e.status === 'rejected').length,
    paid: mockExpenses.filter(e => e.status === 'paid').length,
    totalAmount: mockExpenses.filter(e => e.status !== 'draft').reduce((sum, e) => sum + e.amount, 0),
    approvedAmount: mockExpenses.filter(e => ['approved', 'paid'].includes(e.status)).reduce((sum, e) => sum + e.amount, 0)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      draft: Clock,
      submitted: AlertTriangle,
      approved: CheckCircle,
      rejected: XCircle,
      paid: CheckCircle
    };
    const Icon = icons[status as keyof typeof icons];
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      travel: 'Travel',
      food: 'Food & Dining',
      accommodation: 'Accommodation',
      fuel: 'Fuel',
      supplies: 'Supplies',
      communication: 'Communication',
      other: 'Other'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const handleViewDetails = (expense: ExpenseClaim) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = async (expense: ExpenseClaim) => {
    if (!expense.receiptAttached) {
      toast({
        title: "No Receipt",
        description: "No receipt attached to this expense",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Receipt Downloaded",
        description: `Receipt for ${expense.claimNumber} downloaded successfully`
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download receipt",
        variant: "destructive"
      });
    }
  };

  const handleNewClaim = () => {
    router.push('/hr/expenses/submit');
  };

  const handleEditDraft = (expense: ExpenseClaim) => {
    router.push(`/hr/expenses/submit?draft=${expense.id}`);
  };

  const handleDeleteDraft = async (expense: ExpenseClaim) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Draft Deleted",
        description: `Draft ${expense.claimNumber} has been deleted`
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete draft",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-7 w-7 text-purple-600" />
            My Expenses
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage your expense claims</p>
        </div>
        <button
          onClick={handleNewClaim}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          New Claim
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading expense claims…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>
            <Receipt className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Amt</p>
              <p className="text-xl font-bold text-indigo-600">₹{(stats.totalAmount / 1000).toFixed(1)}k</p>
            </div>
            <Wallet className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Approved</p>
              <p className="text-xl font-bold text-teal-600">₹{(stats.approvedAmount / 1000).toFixed(1)}k</p>
            </div>
            <CheckCircle className="h-8 w-8 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="travel">Travel</option>
              <option value="food">Food & Dining</option>
              <option value="accommodation">Accommodation</option>
              <option value="fuel">Fuel</option>
              <option value="supplies">Supplies</option>
              <option value="communication">Communication</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No expenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim No.</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{expense.claimNumber}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {expense.submissionDate ? new Date(expense.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {getCategoryLabel(expense.category)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm text-gray-900">{expense.description}</div>
                        <div className="text-xs text-gray-500">Bill Date: {new Date(expense.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">₹{expense.amount.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {expense.receiptAttached ? <Receipt className="h-5 w-5 text-green-600" /> : <Receipt className="h-5 w-5 text-gray-300" />}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                        {getStatusIcon(expense.status)}
                        {expense.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(expense)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        {expense.receiptAttached && (
                          <button
                            onClick={() => handleDownloadReceipt(expense)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Expense Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 inline-flex items-center gap-2 text-sm font-semibold rounded-full ${getStatusColor(selectedExpense.status)}`}>
                  {getStatusIcon(selectedExpense.status)}
                  {selectedExpense.status.toUpperCase()}
                </span>
                <span className="text-2xl font-bold text-gray-900">₹{selectedExpense.amount.toLocaleString('en-IN')}</span>
              </div>

              {/* Rejection Alert */}
              {selectedExpense.status === 'rejected' && selectedExpense.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-red-900">Rejection Reason</h3>
                      <p className="text-sm text-red-800 mt-1">{selectedExpense.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Claim Number</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.claimNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900 mt-1">{getCategoryLabel(selectedExpense.category)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Bill Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedExpense.billDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                {selectedExpense.submissionDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Submission Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedExpense.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {selectedExpense.approvedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Approved Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedExpense.approvedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {selectedExpense.paidDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Paid Date</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedExpense.paidDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                )}
                {selectedExpense.approver && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Approver</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedExpense.approver}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Receipt Attached</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.receiptAttached ? 'Yes' : 'No'}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 mt-1">{selectedExpense.description}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedExpense.status === 'draft' ? (
                  <>
                    <button
                      onClick={() => handleEditDraft(selectedExpense)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                    >
                      Continue Editing
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(selectedExpense)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                    >
                      Delete Draft
                    </button>
                  </>
                ) : selectedExpense.receiptAttached ? (
                  <button
                    onClick={() => handleDownloadReceipt(selectedExpense)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </button>
                ) : null}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Expense Claim Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• All expense claims must be submitted within 30 days of bill date</li>
          <li>• Original bills and receipts are mandatory for claims above ₹500</li>
          <li>• Claims are processed and paid by 25th of every month</li>
          <li>• Travel expenses require prior approval from reporting manager</li>
          <li>• Fuel claims must include vehicle number and odometer reading</li>
          <li>• Maximum daily food allowance: ₹1,500 for outstation visits</li>
        </ul>
      </div>
    </div>
  );
}
