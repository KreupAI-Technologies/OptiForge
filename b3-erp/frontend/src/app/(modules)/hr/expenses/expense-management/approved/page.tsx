'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    CheckCircle,
    Search,
    Filter,
    Download,
    Eye,
    Calendar,
    DollarSign,
    Users,
    FileText,
    CreditCard
} from 'lucide-react';

interface ApprovedExpense {
    id: string;
    reportId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    title: string;
    type: string;
    submittedDate: string;
    approvedDate: string;
    approvedBy: string;
    totalAmount: number;
    itemCount: number;
    paymentStatus: 'Awaiting Payment' | 'Processing' | 'Paid';
    paymentDate: string | null;
    paymentRef: string | null;
    bankAccount: string;
}

export default function ApprovedExpensesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('February 2025');

    const [expenses, setExpenses] = useState<ApprovedExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getApproved();
          const mapped: ApprovedExpense[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setExpenses(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setExpenses([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.reportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPayment = paymentFilter === 'all' || expense.paymentStatus === paymentFilter;
        return matchesSearch && matchesPayment;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-400';
            case 'Processing': return 'bg-blue-500/20 text-blue-400';
            case 'Awaiting Payment': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const awaitingPayment = expenses.filter(e => e.paymentStatus === 'Awaiting Payment').reduce((sum, e) => sum + e.totalAmount, 0);
    const processing = expenses.filter(e => e.paymentStatus === 'Processing').reduce((sum, e) => sum + e.totalAmount, 0);
    const paidThisMonth = expenses.filter(e => e.paymentStatus === 'Paid').reduce((sum, e) => sum + e.totalAmount, 0);
    const totalApproved = expenses.reduce((sum, e) => sum + e.totalAmount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            Approved Expenses
                        </h1>
                        <p className="text-gray-400 mt-1">Track approved expenses and payment status</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="February 2025">February 2025</option>
                            <option value="January 2025">January 2025</option>
                            <option value="December 2024">December 2024</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total Approved</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalApproved)}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Awaiting Payment</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(awaitingPayment)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Processing</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(processing)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Paid This Month</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(paidThisMonth)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search approved expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Payment Status</option>
                            <option value="Awaiting Payment">Awaiting Payment</option>
                            <option value="Processing">Processing</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Expense Report</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Approved By</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Payment Status</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Payment Details</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                                                    {expense.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{expense.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{expense.employeeId} • {expense.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{expense.title}</p>
                                                <p className="text-xs text-gray-400">{expense.reportId} • {expense.itemCount} items</p>
                                                <p className="text-xs text-gray-500">Submitted: {new Date(expense.submittedDate).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-white font-medium">{formatCurrency(expense.totalAmount)}</span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{expense.approvedBy}</p>
                                            <p className="text-xs text-gray-400">{new Date(expense.approvedDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getPaymentStatusColor(expense.paymentStatus)}`}>
                                                {expense.paymentStatus === 'Paid' && <CheckCircle className="w-3 h-3" />}
                                                {expense.paymentStatus === 'Processing' && <DollarSign className="w-3 h-3" />}
                                                {expense.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {expense.paymentStatus === 'Paid' ? (
                                                <div>
                                                    <p className="text-green-400 text-sm flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {expense.bankAccount}
                                                    </p>
                                                    <p className="text-xs text-gray-400">Ref: {expense.paymentRef}</p>
                                                    <p className="text-xs text-gray-500">{expense.paymentDate && new Date(expense.paymentDate).toLocaleDateString()}</p>
                                                </div>
                                            ) : expense.paymentStatus === 'Processing' ? (
                                                <p className="text-blue-400 text-sm">Payment in progress...</p>
                                            ) : (
                                                <p className="text-yellow-400 text-sm">Queued for next batch</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="Download Receipt">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Upcoming Payment Schedule
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-300 text-sm">Next Payment Run</span>
                                <span className="text-white font-medium">Feb 15, 2025</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-300 text-sm">Expenses Queued</span>
                                <span className="text-white font-medium">{expenses.filter(e => e.paymentStatus === 'Awaiting Payment').length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-300 text-sm">Total Amount</span>
                                <span className="text-green-400 font-medium">{formatCurrency(awaitingPayment)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Payment Method Breakdown
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-300 text-sm">Bank Transfer (NEFT)</span>
                                <span className="text-white font-medium">4 expenses</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-300 text-sm">Salary Credit</span>
                                <span className="text-white font-medium">1 expense</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
