'use client';

import React, { useState, useEffect } from 'react';
import {
    Banknote,
    Search,
    Filter,
    Download,
    Plus,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { AdvanceService } from '@/services/advance.service';

interface AdvanceRequest {
    id: string;
    requestNumber: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    advanceType: 'Salary Advance' | 'Festival Advance' | 'Travel Advance' | 'Medical Advance';
    requestedAmount: number;
    approvedAmount: number | null;
    purpose: string;
    repaymentMonths: number;
    emiAmount: number;
    requestDate: string;
    requiredDate: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed' | 'Recovered';
    approvedBy: string | null;
    monthlyGross: number;
    maxEligible: number;
}

export default function AdvanceRequestsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [requests, setRequests] = useState<AdvanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Backend returns { data, total } of raw SalaryAdvance ORM rows.
                const res = (await AdvanceService.getAdvances('1')) as any;
                const raw = (Array.isArray(res) ? res : res?.data ?? []) as any[];
                const mapped: AdvanceRequest[] = raw.map((a) => ({
                    id: String(a.id ?? ''),
                    requestNumber: a.advanceNumber ?? '',
                    employeeId: a.employeeCode ?? a.employeeId ?? '',
                    employeeName: a.employeeName ?? a.employee?.fullName ?? a.employeeCode ?? '',
                    department: a.department ?? a.employee?.department?.name ?? '',
                    designation: a.designation ?? a.employee?.designation?.name ?? '',
                    advanceType: (a.advanceType ?? 'Salary Advance') as AdvanceRequest['advanceType'],
                    requestedAmount: Number(a.requestedAmount ?? 0),
                    approvedAmount: a.approvedAmount != null ? Number(a.approvedAmount) : null,
                    purpose: a.purpose ?? '',
                    repaymentMonths: Number(a.repaymentMonths ?? 0),
                    emiAmount: Number(a.monthlyDeduction ?? 0),
                    requestDate: a.requestDate ?? '',
                    requiredDate: a.requiredDate ?? a.requestDate ?? '',
                    status: (a.status ?? 'Pending') as AdvanceRequest['status'],
                    approvedBy: a.approvedBy ?? null,
                    monthlyGross: Number(a.monthlyGross ?? 0),
                    maxEligible: Number(a.maxEligible ?? 0),
                }));
                if (!cancelled) setRequests(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load advance requests');
                    setRequests([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || request.advanceType === typeFilter;
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Disbursed': return 'bg-green-500/20 text-green-400';
            case 'Approved': return 'bg-blue-500/20 text-blue-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            case 'Recovered': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Salary Advance': return 'bg-blue-500/20 text-blue-400';
            case 'Festival Advance': return 'bg-orange-500/20 text-orange-400';
            case 'Travel Advance': return 'bg-green-500/20 text-green-400';
            case 'Medical Advance': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const totalPending = requests.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.requestedAmount, 0);
    const totalDisbursed = requests.filter(r => r.status === 'Disbursed' || r.status === 'Approved').reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Banknote className="w-8 h-8 text-green-500" />
                            Advance Requests
                        </h1>
                        <p className="text-gray-400 mt-1">Manage salary and other advance requests</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            New Request
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Requests</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Pending Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalPending)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Disbursed</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalDisbursed)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Recovered</p>
                        <p className="text-3xl font-bold text-white">{requests.filter(r => r.status === 'Recovered').length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Salary Advance">Salary Advance</option>
                            <option value="Festival Advance">Festival Advance</option>
                            <option value="Travel Advance">Travel Advance</option>
                            <option value="Medical Advance">Medical Advance</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Disbursed">Disbursed</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Recovered">Recovered</option>
                        </select>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-400/40 border-t-green-400" />
                        Loading advance requests…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && requests.length === 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-400">
                        No advance requests found.
                    </div>
                )}

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Type</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Purpose</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Requested</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Approved</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Repayment</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Required By</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((request) => (
                                    <tr key={request.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {request.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{request.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{request.employeeId} • {request.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(request.advanceType)}`}>
                                                {request.advanceType}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-300 text-sm max-w-[200px] truncate">{request.purpose}</p>
                                            <p className="text-xs text-gray-500">Max: {formatCurrency(request.maxEligible)}</p>
                                        </td>
                                        <td className="p-4 text-right text-white">{formatCurrency(request.requestedAmount)}</td>
                                        <td className="p-4 text-right">
                                            <span className={request.approvedAmount ? 'text-green-400' : 'text-gray-400'}>
                                                {request.approvedAmount ? formatCurrency(request.approvedAmount) : '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-gray-300 text-sm">
                                            {request.repaymentMonths} months
                                            <p className="text-xs text-gray-500">EMI: {formatCurrency(request.emiAmount)}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-sm text-gray-300">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {new Date(request.requiredDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(request.status)}`}>
                                                {request.status === 'Disbursed' && <CheckCircle className="w-3 h-3" />}
                                                {request.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {request.status === 'Pending' && (
                                                    <>
                                                        <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
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
