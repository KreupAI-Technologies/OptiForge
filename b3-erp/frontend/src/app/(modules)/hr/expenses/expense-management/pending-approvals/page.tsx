'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Clock,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    Eye,
    MessageSquare,
    AlertTriangle,
    Calendar,
    Users,
    FileText
} from 'lucide-react';

interface PendingExpense {
    id: string;
    reportId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    title: string;
    type: string;
    submittedDate: string;
    totalAmount: number;
    itemCount: number;
    priority: 'Normal' | 'High' | 'Urgent';
    daysAwaiting: number;
    previousApprovals: string[];
    policyViolations: string[];
    receiptsAttached: boolean;
}

export default function PendingApprovalsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

    const [expenses, setExpenses] = useState<PendingExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getPendingApprovals();
          const mapped: PendingExpense[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
        const matchesPriority = priorityFilter === 'all' || expense.priority === priorityFilter;
        return matchesSearch && matchesPriority;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'bg-red-500/20 text-red-400';
            case 'High': return 'bg-orange-500/20 text-orange-400';
            case 'Normal': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const toggleSelectExpense = (id: string) => {
        setSelectedExpenses(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedExpenses.length === filteredExpenses.length) {
            setSelectedExpenses([]);
        } else {
            setSelectedExpenses(filteredExpenses.map(e => e.id));
        }
    };

    const totalPendingAmount = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
    const urgentCount = expenses.filter(e => e.priority === 'Urgent').length;
    const overdueCount = expenses.filter(e => e.daysAwaiting > 7).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Clock className="w-8 h-8 text-yellow-500" />
                            Pending Approvals
                        </h1>
                        <p className="text-gray-400 mt-1">Review and approve expense reports</p>
                    </div>
                    <div className="flex gap-2">
                        {selectedExpenses.length > 0 && (
                            <>
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                                    <CheckCircle className="w-4 h-4" />
                                    Approve Selected ({selectedExpenses.length})
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                                    <XCircle className="w-4 h-4" />
                                    Reject Selected
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Review</p>
                        <p className="text-3xl font-bold text-white">{expenses.length}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalPendingAmount)}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Urgent</p>
                        <p className="text-3xl font-bold text-white">{urgentCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Overdue (&gt;7 days)</p>
                        <p className="text-3xl font-bold text-white">{overdueCount}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, report ID, or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            <option value="all">All Priority</option>
                            <option value="Urgent">Urgent</option>
                            <option value="High">High</option>
                            <option value="Normal">Normal</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedExpenses.length === filteredExpenses.length && filteredExpenses.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-500 text-yellow-500 focus:ring-yellow-500 bg-gray-600"
                                        />
                                    </th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Expense Report</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Amount</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Priority</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Awaiting</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Flags</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedExpenses.includes(expense.id)}
                                                onChange={() => toggleSelectExpense(expense.id)}
                                                className="w-4 h-4 rounded border-gray-500 text-yellow-500 focus:ring-yellow-500 bg-gray-600"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold">
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
                                                <p className="text-xs text-gray-400">{expense.reportId} • {expense.itemCount} items • {expense.type}</p>
                                                {expense.previousApprovals.length > 0 && (
                                                    <p className="text-xs text-green-400 mt-1">
                                                        ✓ {expense.previousApprovals.join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-white font-medium">{formatCurrency(expense.totalAmount)}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getPriorityColor(expense.priority)}`}>
                                                {expense.priority}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-sm ${expense.daysAwaiting > 7 ? 'text-red-400' : expense.daysAwaiting > 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                                {expense.daysAwaiting} days
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {expense.policyViolations.length > 0 && (
                                                    <span className="p-1 bg-orange-500/20 text-orange-400 rounded" title={expense.policyViolations.join(', ')}>
                                                        <AlertTriangle className="w-4 h-4" />
                                                    </span>
                                                )}
                                                {!expense.receiptsAttached && (
                                                    <span className="p-1 bg-red-500/20 text-red-400 rounded" title="Missing receipts">
                                                        <FileText className="w-4 h-4" />
                                                    </span>
                                                )}
                                                {expense.policyViolations.length === 0 && expense.receiptsAttached && (
                                                    <span className="p-1 bg-green-500/20 text-green-400 rounded" title="All clear">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded" title="Approve">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded" title="Reject">
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded" title="Comment">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Policy Violation Summary */}
                {expenses.some(e => e.policyViolations.length > 0) && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <h3 className="text-orange-400 font-medium mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Policy Violations Requiring Attention
                        </h3>
                        <div className="space-y-2">
                            {expenses.filter(e => e.policyViolations.length > 0).map(expense => (
                                <div key={expense.id} className="flex items-start gap-3 p-2 bg-gray-900/50 rounded">
                                    <span className="text-white font-medium text-sm">{expense.reportId}:</span>
                                    <div className="text-sm text-gray-300">
                                        {expense.policyViolations.map((violation, idx) => (
                                            <span key={idx} className="block">{violation}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
