'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    TrendingDown,
    Search,
    Filter,
    Download,
    CheckCircle,
    AlertCircle,
    Clock,
    Eye,
    Calendar,
    DollarSign
} from 'lucide-react';

interface RecoveryRecord {
    id: string;
    loanId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    loanType: string;
    totalLoanAmount: number;
    totalRecovered: number;
    pendingRecovery: number;
    monthlyEMI: number;
    currentMonthDeduction: number;
    recoveryStatus: 'On Track' | 'Delayed' | 'Completed' | 'Defaulted' | 'Waived';
    lastRecoveryDate: string;
    nextRecoveryDate: string;
    missedEMIs: number;
    consecutiveMissed: number;
}

export default function RecoveryTrackingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('February 2025');

    const [records, setRecords] = useState<RecoveryRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getLoanRecoveries('tracking');
          const mapped: RecoveryRecord[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setRecords(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setRecords([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.loanId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.recoveryStatus === statusFilter;
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
            case 'On Track': return 'bg-green-500/20 text-green-400';
            case 'Completed': return 'bg-blue-500/20 text-blue-400';
            case 'Delayed': return 'bg-yellow-500/20 text-yellow-400';
            case 'Defaulted': return 'bg-red-500/20 text-red-400';
            case 'Waived': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'On Track': return <CheckCircle className="w-4 h-4" />;
            case 'Completed': return <CheckCircle className="w-4 h-4" />;
            case 'Delayed': return <Clock className="w-4 h-4" />;
            case 'Defaulted': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const totalPending = records.filter(r => r.recoveryStatus !== 'Completed').reduce((sum, r) => sum + r.pendingRecovery, 0);
    const currentMonthRecovery = records.reduce((sum, r) => sum + r.currentMonthDeduction, 0);
    const onTrackCount = records.filter(r => r.recoveryStatus === 'On Track').length;
    const delayedCount = records.filter(r => r.recoveryStatus === 'Delayed' || r.recoveryStatus === 'Defaulted').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <TrendingDown className="w-8 h-8 text-orange-500" />
                            Recovery Tracking
                        </h1>
                        <p className="text-gray-400 mt-1">Track loan and advance recovery status</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Pending</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalPending)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">This Month Recovery</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(currentMonthRecovery)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">On Track</p>
                        <p className="text-3xl font-bold text-white">{onTrackCount}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Delayed/Defaulted</p>
                        <p className="text-3xl font-bold text-white">{delayedCount}</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Status</option>
                            <option value="On Track">On Track</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Defaulted">Defaulted</option>
                            <option value="Completed">Completed</option>
                            <option value="Waived">Waived</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Loan Details</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Total</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Recovered</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Pending</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">This Month</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{record.employeeId} • {record.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{record.loanId}</p>
                                            <p className="text-xs text-gray-400">{record.loanType}</p>
                                            <p className="text-xs text-gray-500">EMI: {formatCurrency(record.monthlyEMI)}</p>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(record.totalLoanAmount)}</td>
                                        <td className="p-4 text-right text-green-400">{formatCurrency(record.totalRecovered)}</td>
                                        <td className="p-4 text-right">
                                            <span className={record.pendingRecovery > 0 ? 'text-orange-400' : 'text-green-400'}>
                                                {formatCurrency(record.pendingRecovery)}
                                            </span>
                                            {record.pendingRecovery > 0 && (
                                                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                                    <div
                                                        className="bg-green-500 h-1.5 rounded-full"
                                                        style={{ width: `${(record.totalRecovered / record.totalLoanAmount) * 100}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={record.currentMonthDeduction > record.monthlyEMI ? 'text-yellow-400' : 'text-white'}>
                                                {formatCurrency(record.currentMonthDeduction)}
                                            </span>
                                            {record.missedEMIs > 0 && (
                                                <p className="text-xs text-red-400">{record.missedEMIs} missed EMI(s)</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(record.recoveryStatus)}`}>
                                                {getStatusIcon(record.recoveryStatus)}
                                                {record.recoveryStatus}
                                            </span>
                                            {record.recoveryStatus !== 'Completed' && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Next: {record.nextRecoveryDate !== '-' ? new Date(record.nextRecoveryDate).toLocaleDateString() : '-'}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
