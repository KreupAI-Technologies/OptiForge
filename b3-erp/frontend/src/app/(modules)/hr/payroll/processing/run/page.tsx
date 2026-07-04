'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Play,
    Calendar,
    Users,
    CheckCircle,
    AlertCircle,
    Clock,
    RefreshCw,
    FileText,
    DollarSign,
    Building
} from 'lucide-react';

interface PayrollRun {
    id: string;
    period: string;
    month: string;
    year: number;
    status: 'Draft' | 'Processing' | 'Completed' | 'Failed';
    totalEmployees: number;
    processedEmployees: number;
    grossPay: number;
    netPay: number;
    totalDeductions: number;
    startedAt: string | null;
    completedAt: string | null;
    initiatedBy: string;
}

export default function RunPayrollPage() {
    const [selectedMonth, setSelectedMonth] = useState('January');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isRunning, setIsRunning] = useState(false);

    const departments = ['All Departments', 'Human Resources', 'Production', 'Quality Assurance', 'Finance', 'IT'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [recentRuns, setRecentRuns] = useState<PayrollRun[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getPayrollRuns();
          const mapped: PayrollRun[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setRecentRuns(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setRecentRuns([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const pendingChecks = [
        { label: 'Attendance Data', status: 'ready', count: 125 },
        { label: 'Leave Records', status: 'ready', count: 125 },
        { label: 'Overtime Approvals', status: 'pending', count: 8 },
        { label: 'Salary Revisions', status: 'ready', count: 3 },
        { label: 'Loan Deductions', status: 'ready', count: 15 },
        { label: 'Tax Declarations', status: 'pending', count: 2 }
    ];

    const formatCurrency = (value: number) => {
        if (value >= 10000000) {
            return `₹${(value / 10000000).toFixed(2)}Cr`;
        }
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-400';
            case 'Processing': return 'bg-blue-500/20 text-blue-400';
            case 'Draft': return 'bg-gray-500/20 text-gray-400';
            case 'Failed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const handleRunPayroll = () => {
        setIsRunning(true);
        // Simulate payroll processing
        setTimeout(() => setIsRunning(false), 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Play className="w-8 h-8 text-green-500" />
                            Run Payroll
                        </h1>
                        <p className="text-gray-400 mt-1">Process monthly payroll for employees</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Last Payroll</p>
                        <p className="text-3xl font-bold text-white">Dec 2024</p>
                        <p className="text-xs text-gray-400 mt-1">125 employees processed</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">128</p>
                        <p className="text-xs text-gray-400 mt-1">Active employees</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Pending Items</p>
                        <p className="text-3xl font-bold text-white">{pendingChecks.filter(c => c.status === 'pending').length}</p>
                        <p className="text-xs text-gray-400 mt-1">Require attention</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Est. Net Pay</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(10500000)}</p>
                        <p className="text-xs text-gray-400 mt-1">For Jan 2025</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            New Payroll Run
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Month</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Year</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Department</label>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 pt-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Pre-Run Checklist</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {pendingChecks.map((check, index) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${check.status === 'ready'
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-yellow-500/10 border-yellow-500/30'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {check.status === 'ready' ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                            )}
                                            <span className="text-sm text-white">{check.label}</span>
                                        </div>
                                        <p className={`text-xs mt-1 ${check.status === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {check.count} records {check.status === 'ready' ? 'verified' : 'pending'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleRunPayroll}
                                disabled={isRunning}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                            >
                                {isRunning ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-5 h-5" />
                                        Run Payroll
                                    </>
                                )}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                <FileText className="w-5 h-5" />
                                Preview
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            Recent Runs
                        </h2>

                        <div className="space-y-3">
                            {recentRuns.map((run) => (
                                <div
                                    key={run.id}
                                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-white font-medium">{run.period}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(run.status)}`}>
                                            {run.status}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Users className="w-3 h-3" />
                                            {run.totalEmployees} employees
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <DollarSign className="w-3 h-3" />
                                            {formatCurrency(run.netPay)}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        By {run.initiatedBy}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
