'use client';

import { useState, useMemo, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { XCircle, Search, Eye, RefreshCw, AlertCircle, Receipt, Calendar, User, Building2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt?: string;
}

interface RejectedExpense {
  id: string;
  title: string;
  employeeId: string;
  employeeName: string;
  department: string;
  submittedDate: string;
  rejectedDate: string;
  rejectedBy: string;
  rejectionReason: string;
  totalAmount: number;
  itemCount: number;
  items: ExpenseItem[];
  canResubmit: boolean;
}

export default function RejectedExpensesPage() {
  const [expenses, setExpenses] = useState<RejectedExpense[]>([]);
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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<RejectedExpense | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const departments = ['all', ...Array.from(new Set(expenses.map(exp => exp.department)))];

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch =
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = selectedDepartment === 'all' || expense.department === selectedDepartment;

      return matchesSearch && matchesDepartment;
    });
  }, [expenses, searchTerm, selectedDepartment]);

  const stats = {
    totalRejected: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.totalAmount, 0),
    canResubmit: expenses.filter(exp => exp.canResubmit).length,
    avgAmount: expenses.length > 0 ? Math.round(expenses.reduce((sum, exp) => sum + exp.totalAmount, 0) / expenses.length) : 0
  };

  const handleViewDetails = (expense: RejectedExpense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const handleResubmit = async (expense: RejectedExpense) => {
    if (!expense.canResubmit) {
      toast({
        title: "Cannot Resubmit",
        description: "This expense cannot be resubmitted. Please create a new expense claim.",
        variant: "destructive"
      });
      return;
    }

    setIsResubmitting(true);

    try {
      // Simulate API call to create new expense from rejected one
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Resubmission Prepared",
        description: `Expense ${expense.id} is ready for resubmission. Please update the required information and resubmit.`,
      });

      // In real implementation, navigate to submit page with pre-filled data
      // router.push(`/hr/expenses/submit?resubmit=${expense.id}`);

      setShowDetailsModal(false);
    } catch (error) {
      toast({
        title: "Resubmission Failed",
        description: "Failed to prepare resubmission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <XCircle className="h-7 w-7 text-red-600" />
          Rejected Expenses
        </h1>
        <p className="text-sm text-gray-600 mt-1">Review and resubmit rejected expense claims</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Total Rejected</p>
              <p className="text-2xl font-bold text-red-900">{stats.totalRejected}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Total Amount</p>
              <p className="text-2xl font-bold text-orange-900">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <Receipt className="h-10 w-10 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Can Resubmit</p>
              <p className="text-2xl font-bold text-blue-900">{stats.canResubmit}</p>
            </div>
            <RefreshCw className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Avg. Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.avgAmount.toLocaleString('en-IN')}</p>
            </div>
            <Receipt className="h-10 w-10 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, employee name, ID, or expense ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rejected Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <XCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">No rejected expenses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense Details</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rejection Reason</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                        <div className="text-xs text-gray-500">{expense.id}</div>
                        <div className="text-xs text-gray-500">{expense.itemCount} items</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.employeeName}</div>
                        <div className="text-xs text-gray-500">{expense.employeeId}</div>
                        <div className="text-xs text-gray-500">{expense.department}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-500">
                        <div>Submitted: {new Date(expense.submittedDate).toLocaleDateString('en-IN')}</div>
                        <div className="text-red-600 font-medium">Rejected: {new Date(expense.rejectedDate).toLocaleDateString('en-IN')}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{expense.totalAmount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700 line-clamp-2">{expense.rejectionReason}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">By: {expense.rejectedBy}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(expense)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {expense.canResubmit && (
                          <button
                            onClick={() => handleResubmit(expense)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Resubmit"
                          >
                            <RefreshCw className="h-4 w-4" />
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
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Rejected Expense Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Rejection Alert */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Rejection Reason</h3>
                    <p className="text-sm text-red-800">{selectedExpense.rejectionReason}</p>
                    <p className="text-xs text-red-700 mt-2">
                      Rejected by {selectedExpense.rejectedBy} on {new Date(selectedExpense.rejectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Expense ID</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <User className="h-4 w-4" /> Employee
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.employeeName}</p>
                  <p className="text-xs text-gray-500">{selectedExpense.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Building2 className="h-4 w-4" /> Department
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{selectedExpense.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Submitted Date
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedExpense.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-lg font-bold text-gray-900 mt-1">₹{selectedExpense.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Expense Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Expense Breakdown ({selectedExpense.itemCount} items)</h3>
                <div className="space-y-2">
                  {selectedExpense.items.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Item {index + 1}: {item.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Category: {item.category} | Date: {new Date(item.date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">₹{item.amount.toLocaleString('en-IN')}</div>
                      </div>
                      {item.receipt && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Receipt className="h-3 w-3" />
                          <span>Receipt: {item.receipt}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedExpense.canResubmit ? (
                  <>
                    <button
                      onClick={() => handleResubmit(selectedExpense)}
                      disabled={isResubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isResubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Resubmit with Corrections
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <div className="flex-1">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        This expense cannot be resubmitted. Please create a new expense claim with the required corrections.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Resubmission Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Review the rejection reason carefully before resubmitting</li>
          <li>• Ensure all required documents are clear and legible</li>
          <li>• If receipts are missing, attach original bills</li>
          <li>• For policy violations, obtain necessary pre-approvals</li>
          <li>• Contact your manager if you need clarification on rejection</li>
          <li>• Expenses can be resubmitted within 15 days of rejection</li>
        </ul>
      </div>
    </div>
  );
}
