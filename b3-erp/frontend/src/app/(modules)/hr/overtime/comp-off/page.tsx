'use client';

import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    User
} from 'lucide-react';
import { HrSelfServiceService } from '@/services/hr-self-service.service';

interface CompOffBalance {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    earnedHours: number;
    usedHours: number;
    balanceHours: number;
    expiringHours: number;
    expiryDate: string | null;
}

interface CompOffRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    requestDate: string;
    compOffDate: string;
    hours: number;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: string;
}

export default function CompOffPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewType, setViewType] = useState<'balance' | 'requests'>('balance');

    const [balances, setBalances] = useState<CompOffBalance[]>([]);
    const [requests, setRequests] = useState<CompOffRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [actingId, setActingId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [showRequest, setShowRequest] = useState(false);
    const [saving, setSaving] = useState(false);
    const [requestForm, setRequestForm] = useState({ employeeName: '', employeeCode: '', department: '', date: '', overtimeHours: '', reason: '' });

    const loadData = async () => {
        setIsLoading(true); setLoadError(null);
        try {
            const raw = await HrSelfServiceService.getOvertimeRequests();
            const mappedRequests: CompOffRequest[] = (raw as any[]).map((r) => ({
                id: String(r.id ?? r.requestId ?? ''),
                employeeId: r.employeeCode ?? '',
                employeeName: r.employeeName ?? '',
                department: r.department ?? '',
                requestDate: r.requestDate ?? '',
                compOffDate: r.date ?? '',
                hours: Number(r.overtimeHours ?? 0),
                reason: r.reason ?? '',
                status: (r.status ?? 'Pending') as CompOffRequest['status'],
                approvedBy: r.approvedBy,
            }));
            const mappedBalances: CompOffBalance[] = (raw as any[]).map((r) => {
                const earned = Number(r.overtimeHours ?? 0);
                return {
                    id: String(r.id ?? r.requestId ?? ''),
                    employeeId: r.employeeCode ?? '',
                    employeeName: r.employeeName ?? '',
                    department: r.department ?? '',
                    earnedHours: earned,
                    usedHours: 0,
                    balanceHours: earned,
                    expiringHours: 0,
                    expiryDate: null,
                };
            });
            setRequests(mappedRequests); setBalances(mappedBalances);
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRequests([]); setBalances([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        setSaving(true); setActionError(null);
        try {
            await HrSelfServiceService.createOvertimeRequest({
                employeeName: requestForm.employeeName,
                employeeCode: requestForm.employeeCode,
                department: requestForm.department,
                date: requestForm.date,
                overtimeHours: Number(requestForm.overtimeHours) || 0,
                reason: requestForm.reason,
                status: 'Pending',
            });
            setShowRequest(false);
            setRequestForm({ employeeName: '', employeeCode: '', department: '', date: '', overtimeHours: '', reason: '' });
            await loadData();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Failed to create comp-off request');
        } finally {
            setSaving(false);
        }
    };

    const handleDecision = async (request: CompOffRequest, decision: 'Approved' | 'Rejected') => {
        setActingId(request.id); setActionError(null);
        try {
            await HrSelfServiceService.updateOvertimeRequest(request.id, { status: decision });
            setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status: decision } : r)));
        } catch (e) {
            setActionError(e instanceof Error ? e.message : 'Failed to update request');
        } finally {
            setActingId(null);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredBalances = balances.filter(b =>
        b.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRequests = requests.filter(r =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStats = {
        totalEarned: balances.reduce((sum, b) => sum + b.earnedHours, 0),
        totalUsed: balances.reduce((sum, b) => sum + b.usedHours, 0),
        totalBalance: balances.reduce((sum, b) => sum + b.balanceHours, 0),
        expiringThisMonth: balances.reduce((sum, b) => sum + b.expiringHours, 0)
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
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
                            <CalendarCheck className="w-8 h-8 text-purple-500" />
                            Comp-Off Management
                        </h1>
                        <p className="text-gray-400 mt-1">Manage compensatory off balances and requests</p>
                    </div>
                    <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        Request Comp-Off
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total Earned</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalEarned}h</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Used</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalUsed}h</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Available Balance</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalBalance}h</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-red-400 text-sm">Expiring Soon</p>
                            <p className="text-xl font-bold text-white">{totalStats.expiringThisMonth}h</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewType('balance')}
                            className={`px-4 py-2 rounded-lg text-sm ${viewType === 'balance' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Balances
                        </button>
                        <button
                            onClick={() => setViewType('requests')}
                            className={`px-4 py-2 rounded-lg text-sm ${viewType === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Requests
                        </button>
                    </div>
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {viewType === 'balance' ? (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Earned</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Used</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Balance</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Expiring</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Expiry Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBalances.map((balance) => (
                                    <tr key={balance.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                    {balance.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{balance.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{balance.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{balance.department}</td>
                                        <td className="p-4 text-center text-green-400 font-medium">{balance.earnedHours}h</td>
                                        <td className="p-4 text-center text-blue-400 font-medium">{balance.usedHours}h</td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full font-medium">
                                                {balance.balanceHours}h
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {balance.expiringHours > 0 ? (
                                                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full font-medium">
                                                    {balance.expiringHours}h
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            {balance.expiryDate ? new Date(balance.expiryDate).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredRequests.map((request) => (
                            <div key={request.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition-all">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                            {request.employeeName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-white">{request.employeeName}</h3>
                                                <span className="text-xs text-gray-500 font-mono">{request.employeeId}</span>
                                            </div>
                                            <p className="text-sm text-gray-400">{request.department}</p>

                                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    Comp-Off: {new Date(request.compOffDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    {request.hours}h
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-gray-400">Reason: {request.reason}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            Requested: {new Date(request.requestDate).toLocaleDateString()}
                                        </p>
                                        {request.approvedBy && (
                                            <p className="text-xs text-gray-500">Approved by {request.approvedBy}</p>
                                        )}

                                        {request.status === 'Pending' && (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleDecision(request, 'Approved')}
                                                    disabled={actingId === request.id}
                                                    className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> {actingId === request.id ? 'Saving…' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleDecision(request, 'Rejected')}
                                                    disabled={actingId === request.id}
                                                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-sm"
                                                >
                                                    <XCircle className="w-4 h-4" /> {actingId === request.id ? 'Saving…' : 'Reject'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowRequest(false)}>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-3">Request Comp-Off</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Employee Name</label>
                                <input type="text" value={requestForm.employeeName} onChange={(e) => setRequestForm({ ...requestForm, employeeName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Employee Code</label>
                                <input type="text" value={requestForm.employeeCode} onChange={(e) => setRequestForm({ ...requestForm, employeeCode: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                                <input type="text" value={requestForm.department} onChange={(e) => setRequestForm({ ...requestForm, department: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Comp-Off Date</label>
                                <input type="date" value={requestForm.date} onChange={(e) => setRequestForm({ ...requestForm, date: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Hours</label>
                                <input type="number" value={requestForm.overtimeHours} onChange={(e) => setRequestForm({ ...requestForm, overtimeHours: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                                <textarea rows={3} value={requestForm.reason} onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowRequest(false)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 text-sm">Cancel</button>
                            <button onClick={handleCreateRequest} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Submit'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
