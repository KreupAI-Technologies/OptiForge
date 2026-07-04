'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Calculator,
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle,
    Clock,
    Calendar,
    RefreshCw
} from 'lucide-react';

interface ArrearsCalculation {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    revisionType: string;
    effectiveFrom: string;
    processedFrom: string;
    arrearMonths: number;
    oldCTC: number;
    newCTC: number;
    monthlyDifference: number;
    totalArrears: number;
    taxOnArrears: number;
    netArrears: number;
    status: 'Calculated' | 'Pending' | 'Paid' | 'Processing';
    paidDate: string | null;
}

export default function ArrearsCalculationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [arrearsData, setArrearsData] = useState<ArrearsCalculation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getSalaryRevisionsBy('arrears');
                const mapped: ArrearsCalculation[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setArrearsData(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setArrearsData([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredArrears = arrearsData.filter(arrear => {
        const matchesSearch = arrear.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arrear.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || arrear.status === statusFilter;
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
            case 'Paid': return 'bg-green-500/20 text-green-400';
            case 'Processing': return 'bg-blue-500/20 text-blue-400';
            case 'Calculated': return 'bg-yellow-500/20 text-yellow-400';
            case 'Pending': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Paid': return <CheckCircle className="w-4 h-4" />;
            case 'Processing': return <RefreshCw className="w-4 h-4" />;
            case 'Calculated': return <Calculator className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            default: return null;
        }
    };

    const totalArrears = arrearsData.reduce((sum, a) => sum + a.totalArrears, 0);
    const totalNetArrears = arrearsData.reduce((sum, a) => sum + a.netArrears, 0);
    const paidCount = arrearsData.filter(a => a.status === 'Paid').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calculator className="w-8 h-8 text-blue-500" />
                            Arrears Calculation
                        </h1>
                        <p className="text-gray-400 mt-1">Calculate and process salary arrears</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Calculator className="w-4 h-4" />
                            Recalculate
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Records</p>
                        <p className="text-3xl font-bold text-white">{arrearsData.length}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Arrears</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalArrears)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Net Payable</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalNetArrears)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Paid</p>
                        <p className="text-3xl font-bold text-white">{paidCount}/{arrearsData.length}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
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
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Calculated">Calculated</option>
                            <option value="Processing">Processing</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Revision</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Period</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Difference</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Total Arrears</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Tax</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Net Payable</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredArrears.map((arrear) => (
                                    <tr key={arrear.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {arrear.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{arrear.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{arrear.employeeId} • {arrear.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{arrear.revisionType}</p>
                                            <p className="text-xs text-gray-400">
                                                {formatCurrency(arrear.oldCTC)} → {formatCurrency(arrear.newCTC)}
                                            </p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">{arrear.arrearMonths} months</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {new Date(arrear.effectiveFrom).toLocaleDateString()} - {new Date(arrear.processedFrom).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(arrear.monthlyDifference)}/m</td>
                                        <td className="p-4 text-right text-orange-400">{formatCurrency(arrear.totalArrears)}</td>
                                        <td className="p-4 text-right text-red-400">{formatCurrency(arrear.taxOnArrears)}</td>
                                        <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(arrear.netArrears)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(arrear.status)}`}>
                                                {getStatusIcon(arrear.status)}
                                                {arrear.status}
                                            </span>
                                            {arrear.paidDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(arrear.paidDate).toLocaleDateString()}
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
