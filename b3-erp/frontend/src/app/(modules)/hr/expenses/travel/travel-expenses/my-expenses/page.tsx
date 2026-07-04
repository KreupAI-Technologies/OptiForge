'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Briefcase,
    Search,
    Filter,
    Download,
    Eye,
    PlusCircle,
    CheckCircle,
    Clock,
    XCircle,
    Calendar,
    MapPin,
    Receipt
} from 'lucide-react';

interface TravelExpense {
    id: string;
    expenseId: string;
    travelRequestId: string;
    advanceId: string | null;
    employeeId: string;
    employeeName: string;
    department: string;
    purpose: string;
    destination: string;
    travelDates: string;
    totalExpenses: number;
    advanceReceived: number;
    balanceDue: number;
    status: 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Settled';
    submittedDate: string | null;
    expenseCount: number;
    categories: { name: string; amount: number }[];
}

export default function TravelExpensesMyExpensesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [expenses, setExpenses] = useState<TravelExpense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getTravelExpenses();
          const mapped: TravelExpense[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setExpenses(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setExpenses([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.destination.toLowerCase().includes(searchTerm.toLowerCase());
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
            case 'Settled': return 'bg-green-500/20 text-green-400';
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
            case 'Settled': return <CheckCircle className="w-4 h-4" />;
            case 'Approved': return <CheckCircle className="w-4 h-4" />;
            case 'Pending Approval': return <Clock className="w-4 h-4" />;
            case 'Submitted': return <Clock className="w-4 h-4" />;
            case 'Draft': return <Receipt className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.totalExpenses, 0);
    const pendingReimbursement = expenses.filter(e => e.balanceDue > 0 && e.status !== 'Draft').reduce((sum, e) => sum + e.balanceDue, 0);
    const draftCount = expenses.filter(e => e.status === 'Draft').length;
    const pendingCount = expenses.filter(e => e.status === 'Pending Approval' || e.status === 'Submitted').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-purple-500" />
                            My Travel Expenses
                        </h1>
                        <p className="text-gray-400 mt-1">View and manage your travel expense reports</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            New Expense Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Expenses</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Pending Reimbursement</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(pendingReimbursement)}</p>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Drafts</p>
                        <p className="text-2xl font-bold text-white">{draftCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Approval</p>
                        <p className="text-2xl font-bold text-white">{pendingCount}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search travel expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Approved">Approved</option>
                            <option value="Settled">Settled</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredExpenses.map((expense) => (
                        <div key={expense.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left Section - Trip Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-white font-medium text-lg">{expense.purpose}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusColor(expense.status)}`}>
                                                {getStatusIcon(expense.status)}
                                                {expense.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {expense.destination}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {expense.travelDates}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {expense.expenseId} • {expense.travelRequestId}
                                            {expense.advanceId && ` • ${expense.advanceId}`}
                                        </p>
                                    </div>

                                    {/* Right Section - Amounts */}
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Total Expenses</p>
                                            <p className="text-xl font-bold text-white">{formatCurrency(expense.totalExpenses)}</p>
                                            <p className="text-xs text-gray-400">{expense.expenseCount} items</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Advance</p>
                                            <p className="text-lg font-medium text-gray-300">{formatCurrency(expense.advanceReceived)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Balance</p>
                                            <p className={`text-lg font-medium ${expense.balanceDue > 0 ? 'text-green-400' : expense.balanceDue < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                {expense.balanceDue > 0 ? '+' : ''}{formatCurrency(expense.balanceDue)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {expense.balanceDue > 0 ? 'To receive' : expense.balanceDue < 0 ? 'To return' : 'Settled'}
                                            </p>
                                        </div>
                                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Categories Breakdown */}
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                    <div className="flex flex-wrap gap-2">
                                        {expense.categories.map((cat, idx) => (
                                            <div key={idx} className="px-3 py-1.5 bg-gray-900/50 rounded-lg">
                                                <span className="text-gray-400 text-xs">{cat.name}</span>
                                                <span className="text-white text-sm ml-2">{formatCurrency(cat.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
