'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { CheckCircle, Download, Eye, Calendar, User, FileText, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

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
  approvedDate: string;
  approvedBy: string;
  totalAmount: number;
  itemCount: number;
  status: 'approved';
  items: ExpenseItem[];
  paymentStatus: 'pending' | 'processed' | 'paid';
  paymentDate?: string;
}

export default function ApprovedExpensesPage() {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const departments = ['all', 'Sales', 'Engineering', 'HR', 'Operations', 'Finance'];
  const paymentStatuses = ['all', 'pending', 'processed', 'paid'];

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || exp.department === filterDepartment;
    const matchesPaymentStatus = filterPaymentStatus === 'all' || exp.paymentStatus === filterPaymentStatus;

    let matchesDateRange = true;
    if (dateRange.start) {
      matchesDateRange = matchesDateRange && new Date(exp.approvedDate) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDateRange = matchesDateRange && new Date(exp.approvedDate) <= new Date(dateRange.end);
    }

    return matchesSearch && matchesDepartment && matchesPaymentStatus && matchesDateRange;
  });

  const stats = {
    total: filteredExpenses.length,
    totalAmount: filteredExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0),
    paid: filteredExpenses.filter(exp => exp.paymentStatus === 'paid').length,
    pending: filteredExpenses.filter(exp => exp.paymentStatus === 'pending').length
  };

  const handleExportToExcel = () => {
    try {
      const exportData = filteredExpenses.map(exp => ({
        'Expense ID': exp.id,
        'Title': exp.title,
        'Employee ID': exp.employeeId,
        'Employee Name': exp.employeeName,
        'Department': exp.department,
        'Submitted Date': new Date(exp.submittedDate).toLocaleDateString('en-IN'),
        'Approved Date': new Date(exp.approvedDate).toLocaleDateString('en-IN'),
        'Approved By': exp.approvedBy,
        'Total Amount': exp.totalAmount,
        'Items Count': exp.itemCount,
        'Payment Status': exp.paymentStatus.toUpperCase(),
        'Payment Date': exp.paymentDate ? new Date(exp.paymentDate).toLocaleDateString('en-IN') : 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Approved Expenses');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 15 }, // Expense ID
        { wch: 30 }, // Title
        { wch: 12 }, // Employee ID
        { wch: 20 }, // Employee Name
        { wch: 15 }, // Department
        { wch: 15 }, // Submitted Date
        { wch: 15 }, // Approved Date
        { wch: 20 }, // Approved By
        { wch: 12 }, // Total Amount
        { wch: 12 }, // Items Count
        { wch: 15 }, // Payment Status
        { wch: 15 }  // Payment Date
      ];

      XLSX.writeFile(workbook, `Approved_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: `${filteredExpenses.length} expense records exported to Excel`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export expenses. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    processed: 'bg-blue-100 text-blue-700 border-blue-200',
    paid: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle className="h-7 w-7 text-green-600" />
          Approved Expenses
        </h1>
        <p className="text-sm text-gray-600 mt-1">View and export approved expense claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.total}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
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

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Paid</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.paid}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Payment</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by title, employee name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Payment Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportToExcel}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600">No approved expenses found</p>
          </div>
        ) : (
          filteredExpenses.map(expense => (
            <div key={expense.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{expense.title}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
                      ✓ APPROVED
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${paymentStatusColors[expense.paymentStatus]}`}>
                      {expense.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {expense.employeeName} ({expense.employeeId})
                    </span>
                    <span>•</span>
                    <span>{expense.department}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Approved: {new Date(expense.approvedDate).toLocaleDateString('en-IN')} by {expense.approvedBy}
                    </span>
                  </p>
                  {expense.paymentDate && (
                    <p className="text-xs text-green-600 mt-1">
                      Paid on: {new Date(expense.paymentDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{expense.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 mt-1">{expense.itemCount} items</p>
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
                      </span>
                      <span className="font-medium text-gray-900">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
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
                    toast({
                      title: "Download Started",
                      description: "Expense receipt download started"
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedExpense && showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl  w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Approved Expense Details</h2>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedExpense(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{selectedExpense.title}</h3>
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
                  <div>
                    <span className="text-gray-600">Approved:</span>
                    <span className="ml-2 font-medium text-green-700">
                      {new Date(selectedExpense.approvedDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Approved By:</span>
                    <span className="ml-2 font-medium">{selectedExpense.approvedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`ml-2 font-medium px-2 py-1 rounded text-xs ${paymentStatusColors[selectedExpense.paymentStatus]}`}>
                      {selectedExpense.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  {selectedExpense.paymentDate && (
                    <div>
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="ml-2 font-medium text-green-700">
                        {new Date(selectedExpense.paymentDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 mb-3">Expense Items:</h4>
                <div className="space-y-3">
                  {selectedExpense.items.map((item, idx) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">Item {idx + 1}: {item.category}</h5>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Date: {new Date(item.date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{item.amount.toLocaleString('en-IN')}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                            Receipt Attached
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-green-900">Total Approved Amount:</span>
                  <span className="text-2xl font-bold text-green-900">
                    ₹{selectedExpense.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedExpense(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast({
                    title: "Download Started",
                    description: "Receipt download started"
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="inline h-4 w-4 mr-2" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
