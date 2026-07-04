'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Wallet,
    Search,
    Filter,
    Download,
    PlusCircle,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    Calendar,
    FileText,
    AlertTriangle
} from 'lucide-react';

interface TravelAdvance {
    id: string;
    advanceId: string;
    travelRequestId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    purpose: string;
    destination: string;
    travelDates: string;
    requestedAmount: number;
    approvedAmount: number | null;
    disbursedAmount: number | null;
    settledAmount: number | null;
    status: 'Requested' | 'Approved' | 'Disbursed' | 'Partially Settled' | 'Settled' | 'Rejected';
    requestDate: string;
    disbursementDate: string | null;
    settlementDeadline: string | null;
    paymentMode: string | null;
    remarks: string;
}

export default function TravelAdvancesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('February 2025');

    const [advances, setAdvances] = useState<TravelAdvance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getTravelAdvances();
          const mapped: TravelAdvance[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setAdvances(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setAdvances([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredAdvances = advances.filter(advance => {
        const matchesSearch = advance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            advance.advanceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            advance.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || advance.status === statusFilter;
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
            case 'Disbursed': return 'bg-blue-500/20 text-blue-400';
            case 'Approved': return 'bg-cyan-500/20 text-cyan-400';
            case 'Requested': return 'bg-yellow-500/20 text-yellow-400';
            case 'Partially Settled': return 'bg-orange-500/20 text-orange-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Settled': return <CheckCircle className="w-4 h-4" />;
            case 'Disbursed': return <DollarSign className="w-4 h-4" />;
            case 'Approved': return <CheckCircle className="w-4 h-4" />;
            case 'Requested': return <Clock className="w-4 h-4" />;
            case 'Partially Settled': return <AlertTriangle className="w-4 h-4" />;
            case 'Rejected': return <XCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const totalRequested = advances.reduce((sum, a) => sum + a.requestedAmount, 0);
    const totalDisbursed = advances.filter(a => a.disbursedAmount).reduce((sum, a) => sum + (a.disbursedAmount || 0), 0);
    const pendingSettlement = advances.filter(a => a.status === 'Disbursed' || a.status === 'Partially Settled').reduce((sum, a) => sum + ((a.disbursedAmount || 0) - (a.settledAmount || 0)), 0);
    const pendingApproval = advances.filter(a => a.status === 'Requested').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-cyan-500" />
                            Travel Advances
                        </h1>
                        <p className="text-gray-400 mt-1">Request and manage travel advance payments</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            Request Advance
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-400 text-sm">Total Requested</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalRequested)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Disbursed</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalDisbursed)}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Pending Settlement</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(pendingSettlement)}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Approval</p>
                        <p className="text-2xl font-bold text-white">{pendingApproval}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, advance ID, or destination..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Requested">Requested</option>
                            <option value="Approved">Approved</option>
                            <option value="Disbursed">Disbursed</option>
                            <option value="Partially Settled">Partially Settled</option>
                            <option value="Settled">Settled</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="February 2025">February 2025</option>
                            <option value="January 2025">January 2025</option>
                            <option value="March 2025">March 2025</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Travel Details</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Requested</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Approved</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Disbursed</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdvances.map((advance) => (
                                    <tr key={advance.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {advance.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{advance.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{advance.employeeId} • {advance.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{advance.purpose}</p>
                                                <p className="text-xs text-gray-400">{advance.advanceId} • {advance.travelRequestId}</p>
                                                <p className="text-xs text-gray-500">{advance.destination} • {advance.travelDates}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-white">{formatCurrency(advance.requestedAmount)}</td>
                                        <td className="p-4 text-right">
                                            {advance.approvedAmount ? (
                                                <span className="text-cyan-400">{formatCurrency(advance.approvedAmount)}</span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {advance.disbursedAmount ? (
                                                <div>
                                                    <span className="text-blue-400">{formatCurrency(advance.disbursedAmount)}</span>
                                                    {advance.settledAmount && (
                                                        <p className="text-xs text-green-400">Settled: {formatCurrency(advance.settledAmount)}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(advance.status)}`}>
                                                {getStatusIcon(advance.status)}
                                                {advance.status}
                                            </span>
                                            {advance.settlementDeadline && advance.status !== 'Settled' && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Due: {new Date(advance.settlementDeadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {advance.status === 'Disbursed' && (
                                                    <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded" title="Submit Settlement">
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Settlement Policy Info */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Settlement Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-white font-medium mb-1">Settlement Deadline</p>
                            <p className="text-gray-400">Within 14 days of travel completion</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-white font-medium mb-1">Required Documents</p>
                            <p className="text-gray-400">Original receipts, boarding passes, hotel bills</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <p className="text-white font-medium mb-1">Refund Process</p>
                            <p className="text-gray-400">Excess amount deducted from next salary</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
