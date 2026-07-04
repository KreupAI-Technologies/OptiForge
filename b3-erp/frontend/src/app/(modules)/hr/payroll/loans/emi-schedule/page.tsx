'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface EMISchedule {
    id: string;
    loanId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    loanType: string;
    principalAmount: number;
    outstandingAmount: number;
    emiAmount: number;
    tenure: number;
    remainingTenure: number;
    interestRate: number;
    nextEmiDate: string;
    status: 'Active' | 'Completed' | 'Defaulted' | 'Paused';
    emiHistory: { month: string; principal: number; interest: number; total: number; status: string; paidDate: string | null }[];
}

export default function EMISchedulePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const [schedules, setSchedules] = useState<EMISchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getLoanRecoveries('emi');
          const mapped: EMISchedule[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setSchedules(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setSchedules([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredSchedules = schedules.filter(schedule => {
        const matchesSearch = schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            schedule.loanId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
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
            case 'Active': return 'bg-blue-500/20 text-blue-400';
            case 'Completed': return 'bg-green-500/20 text-green-400';
            case 'Defaulted': return 'bg-red-500/20 text-red-400';
            case 'Paused': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getEmiStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-green-400';
            case 'Upcoming': return 'text-yellow-400';
            case 'Overdue': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const totalOutstanding = schedules.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.outstandingAmount, 0);
    const monthlyCollection = schedules.filter(s => s.status === 'Active').reduce((sum, s) => sum + s.emiAmount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-purple-500" />
                            EMI Schedule
                        </h1>
                        <p className="text-gray-400 mt-1">View and track loan EMI schedules</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Active Loans</p>
                        <p className="text-3xl font-bold text-white">{schedules.filter(s => s.status === 'Active').length}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Outstanding</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalOutstanding)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Monthly Collection</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(monthlyCollection)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-white">{schedules.filter(s => s.status === 'Completed').length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee or loan ID..."
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
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Defaulted">Defaulted</option>
                            <option value="Paused">Paused</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredSchedules.map((schedule) => (
                        <div key={schedule.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                            <div
                                className="p-5 cursor-pointer hover:bg-gray-700/30 transition-all"
                                onClick={() => setExpandedId(expandedId === schedule.id ? null : schedule.id)}
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                            {schedule.employeeName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-white">{schedule.employeeName}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(schedule.status)}`}>
                                                    {schedule.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{schedule.loanId} • {schedule.loanType}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Principal</p>
                                            <p className="text-white font-medium">{formatCurrency(schedule.principalAmount)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Outstanding</p>
                                            <p className="text-orange-400 font-medium">{formatCurrency(schedule.outstandingAmount)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">EMI</p>
                                            <p className="text-white font-medium">{formatCurrency(schedule.emiAmount)}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Tenure</p>
                                            <p className="text-white">{schedule.remainingTenure}/{schedule.tenure}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Next EMI</p>
                                            <p className="text-white">{schedule.nextEmiDate !== '-' ? new Date(schedule.nextEmiDate).toLocaleDateString() : '-'}</p>
                                        </div>
                                        {expandedId === schedule.id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Repayment Progress</span>
                                        <span>{Math.round(((schedule.tenure - schedule.remainingTenure) / schedule.tenure) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-purple-500 h-2 rounded-full"
                                            style={{ width: `${((schedule.tenure - schedule.remainingTenure) / schedule.tenure) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {expandedId === schedule.id && (
                                <div className="border-t border-gray-700 p-5 bg-gray-900/30">
                                    <h4 className="text-sm font-medium text-gray-400 mb-3">EMI History</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="text-left p-2 text-gray-500 text-xs">Month</th>
                                                    <th className="text-right p-2 text-gray-500 text-xs">Principal</th>
                                                    <th className="text-right p-2 text-gray-500 text-xs">Interest</th>
                                                    <th className="text-right p-2 text-gray-500 text-xs">Total</th>
                                                    <th className="text-center p-2 text-gray-500 text-xs">Status</th>
                                                    <th className="text-center p-2 text-gray-500 text-xs">Paid Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedule.emiHistory.map((emi, idx) => (
                                                    <tr key={idx} className="border-b border-gray-700/50">
                                                        <td className="p-2 text-white text-sm">{emi.month}</td>
                                                        <td className="p-2 text-right text-gray-300 text-sm">{formatCurrency(emi.principal)}</td>
                                                        <td className="p-2 text-right text-gray-300 text-sm">{formatCurrency(emi.interest)}</td>
                                                        <td className="p-2 text-right text-white text-sm font-medium">{formatCurrency(emi.total)}</td>
                                                        <td className="p-2 text-center">
                                                            <span className={`inline-flex items-center gap-1 text-xs ${getEmiStatusColor(emi.status)}`}>
                                                                {emi.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                                                                {emi.status === 'Upcoming' && <Clock className="w-3 h-3" />}
                                                                {emi.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-2 text-center text-gray-400 text-sm">
                                                            {emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
