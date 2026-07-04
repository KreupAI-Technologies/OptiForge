'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Wallet,
    Search,
    Filter,
    Download,
    Eye,
    Users,
    TrendingUp,
    Calendar
} from 'lucide-react';

interface PFContribution {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    uan: string;
    basicWage: number;
    employeeContribution: number;
    employerEPF: number;
    employerEPS: number;
    totalContribution: number;
    month: string;
}

export default function PFContributionPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January 2025');

    const [contributions, setContributions] = useState<PFContribution[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getStatutoryBy('pf-contribution');
                const mapped: PFContribution[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setContributions(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setContributions([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredContributions = contributions.filter(c => {
        const matchesSearch = c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.uan.includes(searchTerm);
        return matchesSearch;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const totalEmployeeContribution = contributions.reduce((sum, c) => sum + c.employeeContribution, 0);
    const totalEmployerContribution = contributions.reduce((sum, c) => sum + c.employerEPF + c.employerEPS, 0);
    const totalContribution = contributions.reduce((sum, c) => sum + c.totalContribution, 0);

    const months = ['January 2025', 'December 2024', 'November 2024', 'October 2024'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-blue-500" />
                            PF Contribution
                        </h1>
                        <p className="text-gray-400 mt-1">Provident Fund contributions management</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">{contributions.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Employee Contribution</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalEmployeeContribution)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Employer Contribution</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalEmployerContribution)}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Contribution</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalContribution)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or UAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">UAN</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Basic Wage</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employee (12%)</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employer EPF (3.67%)</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employer EPS (8.33%)</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Total</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContributions.map((contribution) => (
                                    <tr key={contribution.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {contribution.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{contribution.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{contribution.employeeId} • {contribution.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-mono text-gray-300">{contribution.uan}</span>
                                        </td>
                                        <td className="p-4 text-right text-white">{formatCurrency(contribution.basicWage)}</td>
                                        <td className="p-4 text-right text-green-400">{formatCurrency(contribution.employeeContribution)}</td>
                                        <td className="p-4 text-right text-purple-400">{formatCurrency(contribution.employerEPF)}</td>
                                        <td className="p-4 text-right text-blue-400">{formatCurrency(contribution.employerEPS)}</td>
                                        <td className="p-4 text-right text-orange-400 font-medium">{formatCurrency(contribution.totalContribution)}</td>
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
                            <tfoot>
                                <tr className="bg-gray-700/30">
                                    <td className="p-4 text-white font-medium" colSpan={2}>Total</td>
                                    <td className="p-4 text-right text-white font-medium">
                                        {formatCurrency(contributions.reduce((sum, c) => sum + c.basicWage, 0))}
                                    </td>
                                    <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(totalEmployeeContribution)}</td>
                                    <td className="p-4 text-right text-purple-400 font-medium">
                                        {formatCurrency(contributions.reduce((sum, c) => sum + c.employerEPF, 0))}
                                    </td>
                                    <td className="p-4 text-right text-blue-400 font-medium">
                                        {formatCurrency(contributions.reduce((sum, c) => sum + c.employerEPS, 0))}
                                    </td>
                                    <td className="p-4 text-right text-orange-400 font-medium">{formatCurrency(totalContribution)}</td>
                                    <td className="p-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
