'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Receipt,
    Search,
    Filter,
    Download,
    FileText,
    Calendar,
    TrendingUp,
    Users
} from 'lucide-react';

interface TDSReportEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    pan: string;
    taxRegime: 'Old' | 'New';
    grossIncome: number;
    exemptions: number;
    deductions: number;
    taxableIncome: number;
    annualTax: number;
    tdsDeducted: number;
    tdsThisMonth: number;
    remainingTax: number;
}

export default function TDSReportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January');
    const [yearFilter, setYearFilter] = useState('2025');
    const [regimeFilter, setRegimeFilter] = useState('all');

    const [entries, setEntries] = useState<TDSReportEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getReportsBy('tds');
                const mapped: TDSReportEntry[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
            entry.pan.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegime = regimeFilter === 'all' || entry.taxRegime === regimeFilter;
        return matchesSearch && matchesRegime;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const totals = filteredEntries.reduce((acc, entry) => ({
        grossIncome: acc.grossIncome + entry.grossIncome,
        taxableIncome: acc.taxableIncome + entry.taxableIncome,
        annualTax: acc.annualTax + entry.annualTax,
        tdsDeducted: acc.tdsDeducted + entry.tdsDeducted,
        tdsThisMonth: acc.tdsThisMonth + entry.tdsThisMonth,
        remainingTax: acc.remainingTax + entry.remainingTax
    }), { grossIncome: 0, taxableIncome: 0, annualTax: 0, tdsDeducted: 0, tdsThisMonth: 0, remainingTax: 0 });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Receipt className="w-8 h-8 text-orange-500" />
                            TDS Report
                        </h1>
                        <p className="text-gray-400 mt-1">Tax Deducted at Source details</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate Form 24Q
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Employees</p>
                        <p className="text-2xl font-bold text-white">{filteredEntries.length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Gross Income</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.grossIncome)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Annual Tax Liability</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.annualTax)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">TDS This Month</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.tdsThisMonth)}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Remaining Tax</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.remainingTax)}</p>
                    </div>
                </div>

                {/* Tax Regime Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Old Tax Regime</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-2xl font-bold text-white">{entries.filter(e => e.taxRegime === 'Old').length}</p>
                                <p className="text-xs text-gray-500">Employees</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{formatCurrency(entries.filter(e => e.taxRegime === 'Old').reduce((s, e) => s + e.annualTax, 0))}</p>
                                <p className="text-xs text-gray-500">Annual Tax</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{formatCurrency(entries.filter(e => e.taxRegime === 'Old').reduce((s, e) => s + e.deductions, 0))}</p>
                                <p className="text-xs text-gray-500">Deductions Claimed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">New Tax Regime</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-2xl font-bold text-white">{entries.filter(e => e.taxRegime === 'New').length}</p>
                                <p className="text-xs text-gray-500">Employees</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{formatCurrency(entries.filter(e => e.taxRegime === 'New').reduce((s, e) => s + e.annualTax, 0))}</p>
                                <p className="text-xs text-gray-500">Annual Tax</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{formatCurrency(entries.filter(e => e.taxRegime === 'New').reduce((s, e) => s + e.tdsThisMonth, 0))}</p>
                                <p className="text-xs text-gray-500">This Month TDS</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, ID, or PAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={regimeFilter}
                            onChange={(e) => setRegimeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Regimes</option>
                            <option value="Old">Old Regime</option>
                            <option value="New">New Regime</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-3 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-3 text-gray-400 font-medium">PAN</th>
                                    <th className="text-center p-3 text-gray-400 font-medium">Regime</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Gross Income</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Exemptions</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Deductions</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Taxable</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Annual Tax</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">TDS Deducted</th>
                                    <th className="text-right p-3 text-green-400 font-medium">This Month</th>
                                    <th className="text-right p-3 text-red-400 font-medium">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-3">
                                            <p className="text-white font-medium">{entry.employeeName}</p>
                                            <p className="text-xs text-gray-400">{entry.employeeId} • {entry.department}</p>
                                        </td>
                                        <td className="p-3 text-gray-300">{entry.pan}</td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${entry.taxRegime === 'Old' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                                {entry.taxRegime}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.grossIncome)}</td>
                                        <td className="p-3 text-right text-gray-300">{entry.exemptions > 0 ? formatCurrency(entry.exemptions) : '-'}</td>
                                        <td className="p-3 text-right text-gray-300">{entry.deductions > 0 ? formatCurrency(entry.deductions) : '-'}</td>
                                        <td className="p-3 text-right text-white">{formatCurrency(entry.taxableIncome)}</td>
                                        <td className="p-3 text-right text-orange-400">{formatCurrency(entry.annualTax)}</td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.tdsDeducted)}</td>
                                        <td className="p-3 text-right text-green-400 font-medium">{formatCurrency(entry.tdsThisMonth)}</td>
                                        <td className="p-3 text-right text-red-400">{formatCurrency(entry.remainingTax)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-900/50 border-t border-gray-600">
                                    <td colSpan={3} className="p-3 text-white font-bold">Total</td>
                                    <td className="p-3 text-right text-white font-bold">{formatCurrency(totals.grossIncome)}</td>
                                    <td colSpan={2} className="p-3"></td>
                                    <td className="p-3 text-right text-white font-bold">{formatCurrency(totals.taxableIncome)}</td>
                                    <td className="p-3 text-right text-orange-400 font-bold">{formatCurrency(totals.annualTax)}</td>
                                    <td className="p-3 text-right text-white font-bold">{formatCurrency(totals.tdsDeducted)}</td>
                                    <td className="p-3 text-right text-green-400 font-bold">{formatCurrency(totals.tdsThisMonth)}</td>
                                    <td className="p-3 text-right text-red-400 font-bold">{formatCurrency(totals.remainingTax)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
