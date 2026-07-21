'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    Lock,
    BarChart,
    History,
    ArrowRight,
    ChevronRight,
    RefreshCw,
    Download
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';
import { exportToCsv } from '@/lib/export';

interface CloseTask {
    id: string;
    task: string;
    category: 'Reconciliation' | 'Accruals' | 'Review' | 'Reporting';
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    assignedTo: string;
    dueDate: string;
}

interface CloseHistory {
    id: string;
    period: string;
    closedBy: string;
    closedDate: string;
    status: 'Closed' | 'Reopened';
    notes: string;
}

export default function PeriodClosePage() {
    const [activeTab, setActiveTab] = useState<'checklist' | 'overview' | 'history'>('checklist');
    const [tasks, setTasks] = useState<CloseTask[]>([]);
    const [history, setHistory] = useState<CloseHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPeriod, setCurrentPeriod] = useState<{ id: string; name: string; status: string } | null>(null);
    const [closing, setClosing] = useState(false);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const periods = await FinanceService.getFinancialPeriods();
            const list = Array.isArray(periods) ? periods : [];
            // Current/most-recent-open period → checklist tasks
            const current =
                list.find((p: any) => p?.isCurrent) ||
                list.find((p: any) => String(p?.status).toLowerCase() === 'open') ||
                list[0];
            setCurrentPeriod(
                current
                    ? {
                        id: String(current.id),
                        name: current.periodName ?? current.periodCode ?? 'Current Period',
                        status: String(current.status ?? ''),
                    }
                    : null,
            );
            const checklist: any[] = Array.isArray(current?.closingChecklist)
                ? current.closingChecklist
                : [];
            const categories: CloseTask['category'][] = ['Reconciliation', 'Accruals', 'Review', 'Reporting'];
            const mappedTasks: CloseTask[] = checklist.map((c: any, i: number) => ({
                id: String(i + 1),
                task: c?.taskName ?? c?.task ?? `Task ${i + 1}`,
                category: categories[i % categories.length],
                status: c?.completed ? 'completed' : 'pending',
                assignedTo: c?.completedBy ?? 'Finance Team',
                dueDate: current?.endDate ?? new Date().toISOString().slice(0, 10),
            }));
            // Closed periods → close history
            const mappedHistory: CloseHistory[] = list
                .filter((p: any) => ['closed', 'locked'].includes(String(p?.status).toLowerCase()))
                .map((p: any, i: number) => ({
                    id: p?.id ?? String(i + 1),
                    period: p?.periodName ?? p?.periodCode ?? 'Period',
                    closedBy: p?.closedBy ?? '—',
                    closedDate: p?.closedAt ?? p?.endDate ?? '',
                    status: 'Closed' as const,
                    notes: p?.description ?? '',
                }));
            setTasks(mappedTasks);
            setHistory(mappedHistory);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load period close data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // No dedicated close endpoint exists; PATCH the period status to Closed
    // via updateFinancialPeriod (status enum: Open | Closed | Locked).
    const handleClosePeriod = async () => {
        if (!currentPeriod) {
            setActionMessage({ type: 'error', text: 'No open period available to close.' });
            return;
        }
        if (!confirm(`Close period "${currentPeriod.name}"? Posted transactions will be locked.`)) return;
        setClosing(true);
        setActionMessage(null);
        try {
            await FinanceService.updateFinancialPeriod(currentPeriod.id, { status: 'Closed' });
            setActionMessage({ type: 'success', text: `Period "${currentPeriod.name}" closed.` });
            await load();
        } catch (e: any) {
            setActionMessage({ type: 'error', text: e?.message ?? 'Failed to close period.' });
        } finally {
            setClosing(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
            case 'blocked': return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default: return <Clock className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'in_progress': return 'bg-blue-100 text-blue-700';
            case 'blocked': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = tasks.length ? (completedTasks / tasks.length) * 100 : 0;

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm z-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Period Close Operations
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">Manage month-end closing procedures for <span className="font-semibold text-gray-900">October 2025</span></p>
                </div>
                <div className="flex items-center gap-3">
                    {actionMessage && (
                        <span className={`text-sm ${actionMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {actionMessage.text}
                        </span>
                    )}
                    <button
                        onClick={handleClosePeriod}
                        disabled={closing || !currentPeriod}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Lock className="w-4 h-4" />
                        {closing ? 'Closing…' : 'Close Period'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                {/* Sidebar Tabs */}
                <div className="w-full sm:w-64 bg-white border-r border-gray-200 flex-shrink-0">
                    <nav className="p-4 space-y-1">
                        <button
                            onClick={() => setActiveTab('checklist')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'checklist' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5" />
                                Checklist
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'checklist' ? 'rotate-90 text-blue-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <BarChart className="w-5 h-5" />
                                Financial Overview
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'overview' ? 'rotate-90 text-blue-500' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <History className="w-5 h-5" />
                                Close History
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === 'history' ? 'rotate-90 text-blue-500' : 'text-gray-400'}`} />
                        </button>
                    </nav>

                    <div className="p-4 mt-auto border-t border-gray-100">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Overall Progress</h4>
                            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-blue-700 flex justify-between">
                                <span>{completedTasks} of {tasks.length} tasks</span>
                                <span>{progress.toFixed(0)}%</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-3">
                    {activeTab === 'checklist' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Closing Checklist</h2>
                                <div className="flex gap-2">
                                    <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500">
                                        <option>All Tasks</option>
                                        <option>Pending</option>
                                        <option>Completed</option>
                                    </select>
                                    <button
                                        onClick={() => void load()}
                                        disabled={loading}
                                        title="Refresh"
                                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex items-start sm:items-center justify-between gap-2">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 sm:mt-0">{getStatusIcon(task.status)}</div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.task}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">{task.category}</span>
                                                        <span>•</span>
                                                        <span>{task.assignedTo}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                                <span className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(task.status)}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                                <button className="text-gray-400 hover:text-blue-600">
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'overview' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-lg font-bold text-gray-900">Period Financial Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">$1,245,300</p>
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +12.5% vs Last Period
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">$845,120</p>
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +5.2% vs Last Period
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Net Income</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-2">$400,180</p>
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> +22.1% vs Last Period
                                    </p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                    <p className="text-sm font-medium text-gray-500">Open Variances</p>
                                    <p className="text-2xl font-bold text-orange-600 mt-2">14</p>
                                    <p className="text-xs text-gray-500 mt-1">Requires reconciliation</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm h-64 flex items-center justify-center">
                                    <p className="text-gray-400">Revenue Trend Chart Placeholder</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm h-64 flex items-center justify-center">
                                    <p className="text-gray-400">Expense Breakdown Chart Placeholder</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900">Close History</h2>
                                <button
                                    onClick={() => exportToCsv('period-close-history', history as unknown as Record<string, unknown>[])}
                                    disabled={history.length === 0}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4" /> Export Log
                                </button>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closed By</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {history.map((record) => (
                                            <tr key={record.id} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{record.period}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{record.closedBy}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{record.closedDate}</td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{record.notes || '-'}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-blue-600 hover:text-blue-900">View Report</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
