'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Receipt,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    PlusCircle,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface Expense {
    id: string;
    reportId: string;
    title: string;
    type: string;
    submittedDate: string;
    totalAmount: number;
    itemCount: number;
    status: 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Paid';
    approver: string;
    approverStatus: string;
    paymentDate: string | null;
    comments: string;
}

export default function MyExpensesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getMyExpenses();
          const mapped: Expense[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setExpenses(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setExpenses([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.reportId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-400';
            case 'Approved': return 'bg-blue-500/20 text-blue-400';
            case 'Pending Approval': return 'bg-yellow-500/20 text-yellow-400';
            case 'Submitted': return 'bg-purple-500/20 text-purple-400';
            case 'Draft': return 'bg-gray-500/20 text-gray-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Paid': return <CheckCircle className="w-4 h-4" />;
            case 'Approved': return <CheckCircle className="w-4 h-4" />;
            case 'Pending Approval': return <Clock className="w-4 h-4" />;
            case 'Submitted': return <AlertCircle className="w-4 h-4" />;
            case 'Draft': return <Edit className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const totalPending = expenses.filter(e => e.status === 'Pending Approval' || e.status === 'Submitted').reduce((sum, e) => sum + e.totalAmount, 0);
    const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + e.totalAmount, 0);
    const totalPaid = expenses.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.totalAmount, 0);
    const draftCount = expenses.filter(e => e.status === 'Draft').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Receipt className="w-8 h-8 text-blue-500" />
                            My Expenses
                        </h1>
                        <p className="text-gray-400 mt-1">View and manage your expense reports</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            New Expense
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Approval</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalPending)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Approved (Awaiting Payment)</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalApproved)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Paid (This Month)</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalPaid)}</p>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Drafts</p>
                        <p className="text-2xl font-bold text-white">{draftCount}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Approved">Approved</option>
                            <option value="Paid">Paid</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Time</option>
                            <option value="this-month">This Month</option>
                            <option value="last-month">Last Month</option>
                            <option value="this-quarter">This Quarter</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Report</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Items</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Approver</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{expense.title}</p>
                                                <p className="text-xs text-gray-400">{expense.reportId} • Submitted: {new Date(expense.submittedDate).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                                {expense.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-gray-300">{expense.itemCount}</td>
                                        <td className="p-4 text-right text-white font-medium">{formatCurrency(expense.totalAmount)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(expense.status)}`}>
                                                {getStatusIcon(expense.status)}
                                                {expense.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{expense.approver}</p>
                                            <p className="text-xs text-gray-400">{expense.approverStatus}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {expense.status === 'Draft' && (
                                                    <>
                                                        <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {expense.status === 'Rejected' && (
                                                    <button className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded" title="Resubmit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="Download">
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

                {/* Rejected Expense Notes */}
                {filteredExpenses.some(e => e.status === 'Rejected' && e.comments) && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <h3 className="text-red-400 font-medium mb-2 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Rejection Notes
                        </h3>
                        {filteredExpenses.filter(e => e.status === 'Rejected' && e.comments).map(expense => (
                            <div key={expense.id} className="text-sm text-gray-300 mt-2 p-2 bg-gray-900/50 rounded">
                                <span className="text-white font-medium">{expense.reportId}:</span> {expense.comments}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
