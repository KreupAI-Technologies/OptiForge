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

interface PFReturn {
    id: string;
    month: string;
    period: string;
    totalEmployees: number;
    totalWages: number;
    totalContribution: number;
    status: 'Filed' | 'Pending' | 'Draft' | 'Overdue';
    filedDate: string | null;
    dueDate: string;
    trrn: string | null;
    acknowledgement: string | null;
}

export default function PFReturnsPage() {
    const [yearFilter, setYearFilter] = useState('2024-25');

    const [returns, setReturns] = useState<PFReturn[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getStatutoryBy('pf-returns');
                const mapped: PFReturn[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
                            <FileSpreadsheet className="w-8 h-8 text-purple-500" />
                            PF Returns
                        </h1>
                        <p className="text-gray-400 mt-1">Monthly PF return filing and tracking</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="2024-25">FY 2024-25</option>
                            <option value="2023-24">FY 2023-24</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            <Upload className="w-4 h-4" />
                            File Return
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Returns</p>
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
                                    <th className="text-right p-4 text-gray-400 font-medium">Contribution</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Due Date</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">TRRN</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.map((pfReturn) => (
                                    <tr key={pfReturn.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{pfReturn.month}</p>
                                                <p className="text-xs text-gray-400">{pfReturn.period}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-gray-300">{pfReturn.totalEmployees}</td>
                                        <td className="p-4 text-right text-white">{formatCurrency(pfReturn.totalWages)}</td>
                                        <td className="p-4 text-right text-purple-400 font-medium">{formatCurrency(pfReturn.totalContribution)}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(pfReturn.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(pfReturn.status)}`}>
                                                {getStatusIcon(pfReturn.status)}
                                                {pfReturn.status}
                                            </span>
                                            {pfReturn.filedDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Filed: {new Date(pfReturn.filedDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {pfReturn.trrn ? (
                                                <span className="font-mono text-xs text-gray-300">{pfReturn.trrn}</span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {pfReturn.status === 'Filed' && (
                                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {pfReturn.status === 'Pending' && (
                                                    <button className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded">
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
                    <h2 className="text-lg font-semibold text-white mb-4">Filing Instructions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-blue-400 font-medium mb-2">ECR File Generation</p>
                            <p className="text-gray-400">Generate Electronic Challan cum Return (ECR) file for EPFO portal upload</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-green-400 font-medium mb-2">Payment & Filing</p>
                            <p className="text-gray-400">Pay contribution via EPFO portal and file monthly return before 15th</p>
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg">
                            <p className="text-purple-400 font-medium mb-2">Acknowledgement</p>
                            <p className="text-gray-400">Download TRRN and acknowledgement after successful filing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
