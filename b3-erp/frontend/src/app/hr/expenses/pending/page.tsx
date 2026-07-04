'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Clock, CheckCircle, XCircle, Eye, Download, FileText, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ConfirmationModal from '@/components/payroll/ConfirmationModal';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt: boolean;
}

interface Expense {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  department: string;
  submittedDate: string;
  totalAmount: number;
  itemCount: number;
  status: 'pending' | 'approved' | 'rejected';
  items: ExpenseItem[];
  notes?: string;
}

export default function PendingExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.expenseClaims<any[]>();
        if (!cancelled) setExpenses(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setExpenses([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const departments = ['all', 'Sales', 'Operations', 'Engineering', 'HR', 'Finance'];

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || exp.department === filterDepartment;

    return matchesSearch && matchesDepartment && exp.status === 'pending';
  });

  const handleApprove = async (notes?: string) => {
    if (!selectedExpense) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setExpenses(expenses.map(exp =>
        exp.id === selectedExpense.id
          ? { ...exp, status: 'approved' as const }
          : exp
      ));

      toast({
        title: "Expense Approved",
        description: `${selectedExpense.title} has been approved for ₹${selectedExpense.totalAmount.toLocaleString('en-IN')}`
      });

      setShowApproveModal(false);
      setSelectedExpense(null);
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (reason?: string) => {
    if (!selectedExpense || !reason) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      setExpenses(expenses.map(exp =>
        exp.id === selectedExpense.id
          ? { ...exp, status: 'rejected' as const, notes: reason }
          : exp
      ));

      toast({
        title: "Expense Rejected",
        description: `${selectedExpense.title} has been rejected`
      });

      setShowRejectModal(false);
      setSelectedExpense(null);
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const stats = {
    total: filteredExpenses.length,
    totalAmount: filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0),
    withReceipts: filteredExpenses.filter(exp =>
      exp.items.every(item => item.receipt)
    ).length
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="h-7 w-7 text-yellow-600" />
          Pending Expense Approvals
        </h1>
        <p className="text-sm text-gray-600 mt-1">Review and approve/reject expense claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.total}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Amount</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Complete Documentation</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.withReceipts}/{stats.total}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, employee name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Clock className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">No pending expenses found</p>
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{expense.title}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
                      PENDING APPROVAL
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {expense.employeeName} ({expense.employeeId})
                    </span>
                    <span>•</span>
                    <span>{expense.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Submitted: {new Date(expense.submittedDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {expense.id} • {expense.itemCount} items • {expense.items.filter(i => i.receipt).length}/{expense.itemCount} with receipts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{expense.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Expense Items Preview */}
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Expense Breakdown:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {expense.items.map((item, idx) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {idx + 1}. {item.category} - {item.description}
                        {!item.receipt && <span className="text-red-600 ml-1">*</span>}
                      </span>
                      <span className="font-medium text-gray-900">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                {expense.items.some(item => !item.receipt) && (
                  <p className="text-xs text-red-600 mt-2">* No receipt attached</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(expense)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedExpense(expense);
                    setShowApproveModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedExpense(expense);
                    setShowRejectModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {selectedExpense && (
        <>
          <ConfirmationModal
            isOpen={showApproveModal}
            onClose={() => {
              setShowApproveModal(false);
              setSelectedExpense(null);
            }}
            onConfirm={handleApprove}
            title="Approve Expense"
            message={`Are you sure you want to approve this expense claim?`}
            confirmText="Approve Expense"
            variant="success"
            details={[
              { label: 'Expense ID', value: selectedExpense.id },
              { label: 'Employee', value: selectedExpense.employeeName },
              { label: 'Department', value: selectedExpense.department },
              { label: 'Total Amount', value: `₹${selectedExpense.totalAmount.toLocaleString('en-IN')}` },
              { label: 'Items', value: selectedExpense.itemCount },
              { label: 'Submitted', value: new Date(selectedExpense.submittedDate).toLocaleDateString('en-IN') }
            ]}
          />

          <ConfirmationModal
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedExpense(null);
            }}
            onConfirm={handleReject}
            title="Reject Expense"
            message={`Please provide a reason for rejecting this expense claim.`}
            confirmText="Reject Expense"
            cancelText="Cancel"
            variant="danger"
            requireNotes={true}
            notesLabel="Rejection Reason"
            notesPlaceholder="Enter the reason for rejection..."
            details={[
              { label: 'Expense ID', value: selectedExpense.id },
              { label: 'Employee', value: selectedExpense.employeeName },
              { label: 'Total Amount', value: `₹${selectedExpense.totalAmount.toLocaleString('en-IN')}` }
            ]}
          />

          {/* Details Modal */}
          {showDetailsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white rounded-lg shadow-xl  w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Expense Details</h2>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedExpense(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedExpense.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Expense ID:</span>
                        <span className="ml-2 font-medium">{selectedExpense.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Employee:</span>
                        <span className="ml-2 font-medium">{selectedExpense.employeeName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Department:</span>
                        <span className="ml-2 font-medium">{selectedExpense.department}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Submitted:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedExpense.submittedDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-3">Expense Items:</h4>
                    <div className="space-y-3">
                      {selectedExpense.items.map((item, idx) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">Item {idx + 1}: {item.category}</h5>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Date: {new Date(item.date).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">₹{item.amount.toLocaleString('en-IN')}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.receipt
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {item.receipt ? 'Receipt Attached' : 'No Receipt'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-purple-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-purple-900">
                        ₹{selectedExpense.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowApproveModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
