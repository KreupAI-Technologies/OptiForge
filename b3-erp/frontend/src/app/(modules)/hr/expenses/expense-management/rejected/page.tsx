'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    XCircle,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    MessageSquare,
    AlertTriangle,
    Calendar
} from 'lucide-react';

interface RejectedExpense {
    id: string;
    reportId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    title: string;
    type: string;
    submittedDate: string;
    rejectedDate: string;
    rejectedBy: string;
    totalAmount: number;
    itemCount: number;
    rejectionReason: string;
    rejectionCategory: 'Policy Violation' | 'Missing Documentation' | 'Budget Exceeded' | 'Duplicate Claim' | 'Other';
    canResubmit: boolean;
    resubmissionDeadline: string | null;
    previousSubmissions: number;
}

export default function RejectedExpensesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');

    const [expenses, setExpenses] = useState<RejectedExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getRejected();
          const mapped: RejectedExpense[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
        const matchesCategory = categoryFilter === 'all' || expense.rejectionCategory === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Policy Violation': return 'bg-red-500/20 text-red-400';
            case 'Missing Documentation': return 'bg-yellow-500/20 text-yellow-400';
            case 'Budget Exceeded': return 'bg-orange-500/20 text-orange-400';
            case 'Duplicate Claim': return 'bg-purple-500/20 text-purple-400';
            case 'Other': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const totalRejected = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
    const canResubmitCount = expenses.filter(e => e.canResubmit).length;
    const policyViolationCount = expenses.filter(e => e.rejectionCategory === 'Policy Violation').length;
    const missingDocsCount = expenses.filter(e => e.rejectionCategory === 'Missing Documentation').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <XCircle className="w-8 h-8 text-red-500" />
                            Rejected Expenses
                        </h1>
                        <p className="text-gray-400 mt-1">View rejected expense reports and resubmit if applicable</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">All Time</option>
                            <option value="February 2025">February 2025</option>
                            <option value="January 2025">January 2025</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Total Rejected</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalRejected)}</p>
                        <p className="text-xs text-gray-400 mt-1">{expenses.length} reports</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Can Resubmit</p>
                        <p className="text-2xl font-bold text-white">{canResubmitCount}</p>
                        <p className="text-xs text-gray-400 mt-1">Within deadline</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Policy Violations</p>
                        <p className="text-2xl font-bold text-white">{policyViolationCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Missing Docs</p>
                        <p className="text-2xl font-bold text-white">{missingDocsCount}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search rejected expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="Policy Violation">Policy Violation</option>
                            <option value="Missing Documentation">Missing Documentation</option>
                            <option value="Budget Exceeded">Budget Exceeded</option>
                            <option value="Duplicate Claim">Duplicate Claim</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredExpenses.map((expense) => (
                        <div key={expense.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold">
                                            {expense.employeeName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-white font-medium">{expense.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(expense.rejectionCategory)}`}>
                                                    {expense.rejectionCategory}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{expense.reportId} • {expense.employeeName} • {expense.department}</p>
                                            <p className="text-xs text-gray-500">Submitted: {new Date(expense.submittedDate).toLocaleDateString()} | Rejected: {new Date(expense.rejectedDate).toLocaleDateString()} by {expense.rejectedBy}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{formatCurrency(expense.totalAmount)}</p>
                                            <p className="text-xs text-gray-400">{expense.itemCount} items</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {expense.canResubmit && (
                                                <>
                                                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded" title="Edit & Resubmit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded" title="Quick Resubmit">
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Rejection Reason */}
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-red-400">Rejection Reason</p>
                                            <p className="text-sm text-gray-300 mt-1">{expense.rejectionReason}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resubmission Info */}
                                {expense.canResubmit && expense.resubmissionDeadline && (
                                    <div className="mt-3 flex items-center justify-between p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-green-400">Resubmission allowed until {new Date(expense.resubmissionDeadline).toLocaleDateString()}</span>
                                        </div>
                                        {expense.previousSubmissions > 1 && (
                                            <span className="text-xs text-gray-400">Previously submitted {expense.previousSubmissions} times</span>
                                        )}
                                    </div>
                                )}

                                {!expense.canResubmit && (
                                    <div className="mt-3 flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
                                        <XCircle className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-400">This expense cannot be resubmitted</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tips Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Tips to Avoid Rejection
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-white font-medium mb-1">Attach All Receipts</p>
                            <p className="text-gray-400">Include original receipts for all expenses above ₹500</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-white font-medium mb-1">Check Policy Limits</p>
                            <p className="text-gray-400">Review expense limits before submitting claims</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-white font-medium mb-1">Provide Clear Descriptions</p>
                            <p className="text-gray-400">Add business justification for unusual expenses</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
