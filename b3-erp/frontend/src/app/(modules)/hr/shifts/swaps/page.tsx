'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeftRight,
    Plus,
    Search,
    Filter,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    User
} from 'lucide-react';
import { HrShiftsService } from '@/services/hr-shifts.service';

interface ShiftSwap {
    id: string;
    requesterId: string;
    requesterName: string;
    requesterDepartment: string;
    requesterShift: string;
    requesterDate: string;
    targetId: string;
    targetName: string;
    targetDepartment: string;
    targetShift: string;
    targetDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
    requestDate: string;
    approvedBy?: string;
    approvedDate?: string;
}

export default function ShiftSwapsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actingId, setActingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const handleDecision = async (swap: ShiftSwap, decision: 'Approved' | 'Rejected') => {
        setActingId(swap.id); setActionError(null);
        try {
            const updated = decision === 'Approved'
                ? await HrShiftsService.approveShiftSwap(swap.id)
                : await HrShiftsService.rejectShiftSwap(swap.id);
            setSwaps((prev) => prev.map((s) => (s.id === swap.id
                ? { ...s, status: decision, approvedBy: (updated as any)?.approvedBy ?? s.approvedBy, approvedDate: (updated as any)?.approvedDate ?? new Date().toISOString() }
                : s)));
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Failed to update request');
        } finally {
            setActingId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrShiftsService.getShiftSwaps();
                const mapped: ShiftSwap[] = (raw as any[]).map((r) => ({
                    id: String(r.id ?? ''),
                    requesterId: r.requesterId ?? '',
                    requesterName: r.requesterName ?? '',
                    requesterDepartment: r.requesterDepartment ?? '',
                    requesterShift: r.requesterShift ?? '',
                    requesterDate: r.requesterDate ?? '',
                    targetId: r.targetId ?? '',
                    targetName: r.targetName ?? '',
                    targetDepartment: r.targetDepartment ?? '',
                    targetShift: r.targetShift ?? '',
                    targetDate: r.targetDate ?? '',
                    reason: r.reason ?? '',
                    status: (r.status ?? 'Pending') as ShiftSwap['status'],
                    requestDate: r.requestDate ?? '',
                    approvedBy: r.approvedBy,
                    approvedDate: r.approvedDate,
                }));
                if (!cancelled) setSwaps(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setSwaps([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredSwaps = swaps.filter(swap => {
        const matchesSearch = swap.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            swap.targetName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || swap.status === statusFilter;
        return matchesSearch && matchesStatus;
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
            case 'Approved': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'Rejected': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'Pending': return <Clock className="w-4 h-4 text-yellow-400" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="mb-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                {actionError && (<div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{actionError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ArrowLeftRight className="w-8 h-8 text-blue-500" />
                            Shift Swaps
                        </h1>
                        <p className="text-gray-400 mt-1">Manage shift swap requests</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        Request Swap
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Requests</p>
                        <p className="text-3xl font-bold text-white">{swaps.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{swaps.filter(s => s.status === 'Pending').length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Approved</p>
                        <p className="text-3xl font-bold text-white">{swaps.filter(s => s.status === 'Approved').length}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Rejected</p>
                        <p className="text-3xl font-bold text-white">{swaps.filter(s => s.status === 'Rejected').length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee name..."
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
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredSwaps.map((swap) => (
                        <div key={swap.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(swap.status)}`}>
                                            {getStatusIcon(swap.status)}
                                            {swap.status}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            Requested on {new Date(swap.requestDate).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-gray-700/30 rounded-lg p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {swap.requesterName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{swap.requesterName}</p>
                                                    <p className="text-xs text-gray-400">{swap.requesterDepartment}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">{new Date(swap.requesterDate).toLocaleDateString()}</span>
                                                <span className="text-blue-400">{swap.requesterShift}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <ArrowLeftRight className="w-6 h-6 text-blue-400" />
                                            <span className="text-xs text-gray-500 mt-1">SWAP</span>
                                        </div>

                                        <div className="flex-1 bg-gray-700/30 rounded-lg p-4">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                                    {swap.targetName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{swap.targetName}</p>
                                                    <p className="text-xs text-gray-400">{swap.targetDepartment}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">{new Date(swap.targetDate).toLocaleDateString()}</span>
                                                <span className="text-green-400">{swap.targetShift}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-start gap-2 text-sm">
                                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                        <div>
                                            <span className="text-gray-400">Reason:</span>
                                            <span className="text-gray-300 ml-1">{swap.reason}</span>
                                        </div>
                                    </div>

                                    {swap.approvedBy && (
                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-400">
                                                {swap.status === 'Approved' ? 'Approved' : 'Rejected'} by {swap.approvedBy} on {new Date(swap.approvedDate!).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {swap.status === 'Pending' && (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleDecision(swap, 'Approved')}
                                            disabled={actingId === swap.id}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {actingId === swap.id ? 'Saving…' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleDecision(swap, 'Rejected')}
                                            disabled={actingId === swap.id}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {actingId === swap.id ? 'Saving…' : 'Reject'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
