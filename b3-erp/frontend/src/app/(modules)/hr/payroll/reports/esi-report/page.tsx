'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Heart,
    Search,
    Filter,
    Download,
    FileText,
    Users,
    Calendar
} from 'lucide-react';

interface ESIReportEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    esiNumber: string;
    grossWage: number;
    eligibleWage: number;
    employeeContribution: number;
    employerContribution: number;
    totalContribution: number;
    isEligible: boolean;
}

export default function ESIReportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January');
    const [yearFilter, setYearFilter] = useState('2025');
    const [eligibilityFilter, setEligibilityFilter] = useState('all');

    const [entries, setEntries] = useState<ESIReportEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getReportsBy('esi');
                const mapped: ESIReportEntry[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setEntries(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setEntries([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.esiNumber.includes(searchTerm);
        const matchesEligibility = eligibilityFilter === 'all' ||
            (eligibilityFilter === 'eligible' && entry.isEligible) ||
            (eligibilityFilter === 'not-eligible' && !entry.isEligible);
        return matchesSearch && matchesEligibility;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const eligibleEntries = filteredEntries.filter(e => e.isEligible);
    const totals = eligibleEntries.reduce((acc, entry) => ({
        eligibleWage: acc.eligibleWage + entry.eligibleWage,
        employeeContribution: acc.employeeContribution + entry.employeeContribution,
        employerContribution: acc.employerContribution + entry.employerContribution,
        totalContribution: acc.totalContribution + entry.totalContribution
    }), { eligibleWage: 0, employeeContribution: 0, employerContribution: 0, totalContribution: 0 });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Heart className="w-8 h-8 text-red-500" />
                            ESI Report
                        </h1>
                        <p className="text-gray-400 mt-1">Employee State Insurance contribution details</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate Return
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Total Employees</p>
                        <p className="text-2xl font-bold text-white">{entries.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">ESI Eligible</p>
                        <p className="text-2xl font-bold text-white">{entries.filter(e => e.isEligible).length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Employee ESI</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.employeeContribution)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Employer ESI</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.employerContribution)}</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-400 text-sm">Total Deposit</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.totalContribution)}</p>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Contribution Rates</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Employee</span>
                                <span className="text-white">0.75% of Gross</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Employer</span>
                                <span className="text-white">3.25% of Gross</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Wage Ceiling</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">ESI Applicable</span>
                                <span className="text-white">≤ ₹21,000/month</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Not Applicable</span>
                                <span className="text-white">&gt; ₹21,000/month</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Contribution Period</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Period</span>
                                <span className="text-white">Apr-Sep / Oct-Mar</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Due Date</span>
                                <span className="text-white">15th of next month</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, ID, or ESI number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={eligibilityFilter}
                            onChange={(e) => setEligibilityFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="all">All Employees</option>
                            <option value="eligible">ESI Eligible</option>
                            <option value="not-eligible">Not Eligible</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">ESI Number</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Gross Wage</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Eligible</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Eligible Wage</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employee (0.75%)</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Employer (3.25%)</th>
                                    <th className="text-right p-4 text-cyan-400 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                    {entry.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{entry.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{entry.employeeId} • {entry.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm">{entry.esiNumber}</td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(entry.grossWage)}</td>
                                        <td className="p-4 text-center">
                                            {entry.isEligible ? (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Yes</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">No</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right text-gray-300">
                                            {entry.isEligible ? formatCurrency(entry.eligibleWage) : '-'}
                                        </td>
                                        <td className="p-4 text-right text-blue-400">
                                            {entry.isEligible ? formatCurrency(entry.employeeContribution) : '-'}
                                        </td>
                                        <td className="p-4 text-right text-purple-400">
                                            {entry.isEligible ? formatCurrency(entry.employerContribution) : '-'}
                                        </td>
                                        <td className="p-4 text-right text-cyan-400 font-medium">
                                            {entry.isEligible ? formatCurrency(entry.totalContribution) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-900/50 border-t border-gray-600">
                                    <td colSpan={4} className="p-4 text-white font-bold">Total (Eligible Only)</td>
                                    <td className="p-4 text-right text-white font-bold">{formatCurrency(totals.eligibleWage)}</td>
                                    <td className="p-4 text-right text-blue-400 font-bold">{formatCurrency(totals.employeeContribution)}</td>
                                    <td className="p-4 text-right text-purple-400 font-bold">{formatCurrency(totals.employerContribution)}</td>
                                    <td className="p-4 text-right text-cyan-400 font-bold">{formatCurrency(totals.totalContribution)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
