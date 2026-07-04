'use client';

import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Download
} from 'lucide-react';
import { LeaveService } from '@/services/leave.service';

const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

interface LeaveHistory {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    status: 'Approved' | 'Rejected' | 'Pending' | 'Cancelled';
    reason: string;
    appliedDate: string;
    approvedBy: string;
    approvedDate: string;
    remarks: string;
}

export default function MyLeaveHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('2025');

    const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const fmtDate = (v: any): string => {
            if (!v) return '';
            const d = new Date(v);
            return isNaN(d.getTime()) ? String(v) : d.toISOString().split('T')[0];
        };
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await LeaveService.getAllLeaveApplicationsRaw();
                const mapped: LeaveHistory[] = (raw as any[]).map((r, i) => ({
                    id: String(r?.applicationNumber ?? r?.id ?? i),
                    leaveType: r?.leaveTypeName ?? r?.leaveType ?? '',
                    startDate: fmtDate(r?.startDate),
                    endDate: fmtDate(r?.endDate),
                    days: r?.totalDays ?? r?.days ?? 0,
                    status: (capitalize(String(r?.status ?? 'Pending')) as LeaveHistory['status']),
                    reason: r?.reason ?? '',
                    appliedDate: fmtDate(r?.appliedAt ?? r?.appliedDate),
                    approvedBy: r?.approverName ?? r?.approvedBy ?? '',
                    approvedDate: fmtDate(r?.approvedAt ?? r?.approvedDate),
                    remarks: r?.rejectionReason ?? r?.remarks ?? '',
                }));
                if (!cancelled) setLeaveHistory(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setLeaveHistory([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredHistory = leaveHistory.filter(leave => {
        const matchesSearch = leave.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
        const matchesYear = leave.startDate.startsWith(yearFilter);
        return matchesSearch && matchesStatus && matchesYear;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Cancelled': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Cancelled': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const stats = {
        total: leaveHistory.length,
        approved: leaveHistory.filter(l => l.status === 'Approved').length,
        pending: leaveHistory.filter(l => l.status === 'Pending').length,
        rejected: leaveHistory.filter(l => l.status === 'Rejected').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <History className="w-8 h-8 text-blue-500" />
                            My Leave History
                        </h1>
                        <p className="text-gray-400 mt-1">View your past leave requests</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Requests</p>
                        <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Approved</p>
                        <p className="text-3xl font-bold text-white">{stats.approved}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{stats.pending}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Rejected</p>
                        <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by ID or leave type..."
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
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredHistory.map((leave) => (
                        <div key={leave.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-mono text-gray-400">{leave.id}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(leave.status)}`}>
                                            {getStatusIcon(leave.status)}
                                            {leave.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">{leave.leaveType}</h3>
                                    <p className="text-gray-400 mt-1">{leave.reason}</p>

                                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                        <div className="flex items-center gap-1 text-gray-300">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-300">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            {leave.days} day(s)
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <p className="text-xs text-gray-500">
                                        Applied: {new Date(leave.appliedDate).toLocaleDateString()}
                                    </p>
                                    {leave.approvedBy && (
                                        <p className="text-xs text-gray-500">
                                            {leave.status === 'Rejected' ? 'Rejected' : 'Approved'} by: {leave.approvedBy}
                                        </p>
                                    )}
                                    {leave.remarks && (
                                        <p className="text-xs text-gray-400 italic max-w-xs text-right">
                                            &quot;{leave.remarks}&quot;
                                        </p>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        {leave.status === 'Pending' && (
                                            <button className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                                                <XCircle className="w-4 h-4" /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredHistory.length === 0 && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
                        <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No leave history found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
