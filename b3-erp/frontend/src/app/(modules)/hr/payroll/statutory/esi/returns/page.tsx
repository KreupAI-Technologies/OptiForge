'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    FileSpreadsheet,
    Download,
    Upload,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Send,
    Eye
} from 'lucide-react';

interface ESIReturn {
    id: string;
    period: string;
    contributionPeriod: string;
    totalEmployees: number;
    totalWages: number;
    totalContribution: number;
    employeeContribution: number;
    employerContribution: number;
    status: 'Filed' | 'Pending' | 'Draft' | 'Overdue';
    filedDate: string | null;
    dueDate: string;
    challanNumber: string | null;
}

export default function ESIReturnsPage() {
    const [yearFilter, setYearFilter] = useState('2024-25');

    const [returns, setReturns] = useState<ESIReturn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getStatutoryBy('esi-returns');
                const mapped: ESIReturn[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setReturns(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setReturns([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Filed': return 'bg-green-500/20 text-green-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Draft': return 'bg-blue-500/20 text-blue-400';
            case 'Overdue': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Filed': return <CheckCircle className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Draft': return <FileSpreadsheet className="w-4 h-4" />;
            case 'Overdue': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const filedCount = returns.filter(r => r.status === 'Filed').length;
    const pendingCount = returns.filter(r => r.status === 'Pending').length;
    const totalContributions = returns.filter(r => r.status === 'Filed').reduce((sum, r) => sum + r.totalContribution, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileSpreadsheet className="w-8 h-8 text-teal-500" />
                            ESI Returns
                        </h1>
                        <p className="text-gray-400 mt-1">Quarterly ESI return filing and tracking</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="2024-25">FY 2024-25</option>
                            <option value="2023-24">FY 2023-24</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                            <Upload className="w-4 h-4" />
                            File Return
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                        <p className="text-teal-400 text-sm">Total Returns</p>
                        <p className="text-3xl font-bold text-white">{returns.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Filed</p>
                        <p className="text-3xl font-bold text-white">{filedCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Contribution (YTD)</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalContributions)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Period</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Employees</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Total Wages</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employer</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Total</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Due Date</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.map((esiReturn) => (
                                    <tr key={esiReturn.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{esiReturn.period}</p>
                                                <p className="text-xs text-gray-400">{esiReturn.contributionPeriod}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-gray-300">{esiReturn.totalEmployees}</td>
                                        <td className="p-4 text-right text-white">{formatCurrency(esiReturn.totalWages)}</td>
                                        <td className="p-4 text-right text-green-400">{formatCurrency(esiReturn.employeeContribution)}</td>
                                        <td className="p-4 text-right text-purple-400">{formatCurrency(esiReturn.employerContribution)}</td>
                                        <td className="p-4 text-right text-teal-400 font-medium">{formatCurrency(esiReturn.totalContribution)}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(esiReturn.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(esiReturn.status)}`}>
                                                {getStatusIcon(esiReturn.status)}
                                                {esiReturn.status}
                                            </span>
                                            {esiReturn.filedDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Filed: {new Date(esiReturn.filedDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {esiReturn.status === 'Filed' && (
                                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {esiReturn.status === 'Pending' && (
                                                    <button className="p-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded">
                                                        <Send className="w-4 h-4" />
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

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">ESI Filing Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-teal-400 font-medium mb-2">Q1 (Apr-Jun)</p>
                            <p className="text-gray-400">Due: 15th July</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-teal-400 font-medium mb-2">Q2 (Jul-Sep)</p>
                            <p className="text-gray-400">Due: 15th October</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-teal-400 font-medium mb-2">Q3 (Oct-Dec)</p>
                            <p className="text-gray-400">Due: 15th January</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-teal-400 font-medium mb-2">Q4 (Jan-Mar)</p>
                            <p className="text-gray-400">Due: 15th April</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
