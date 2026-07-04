'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Shield,
    Search,
    Filter,
    Download,
    FileText,
    Users,
    Calendar,
    CheckCircle
} from 'lucide-react';

interface PFReportEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    uan: string;
    pfNumber: string;
    basicWage: number;
    employeeContribution: number;
    employerEPF: number;
    employerEPS: number;
    totalContribution: number;
    adminCharges: number;
    edliCharges: number;
    totalDeposit: number;
}

export default function PFReportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January');
    const [yearFilter, setYearFilter] = useState('2025');

    const [entries, setEntries] = useState<PFReportEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getReportsBy('pf');
                const mapped: PFReportEntry[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
            entry.uan.includes(searchTerm);
        return matchesSearch;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const totals = filteredEntries.reduce((acc, entry) => ({
        basicWage: acc.basicWage + entry.basicWage,
        employeeContribution: acc.employeeContribution + entry.employeeContribution,
        employerEPF: acc.employerEPF + entry.employerEPF,
        employerEPS: acc.employerEPS + entry.employerEPS,
        totalContribution: acc.totalContribution + entry.totalContribution,
        adminCharges: acc.adminCharges + entry.adminCharges,
        edliCharges: acc.edliCharges + entry.edliCharges,
        totalDeposit: acc.totalDeposit + entry.totalDeposit
    }), { basicWage: 0, employeeContribution: 0, employerEPF: 0, employerEPS: 0, totalContribution: 0, adminCharges: 0, edliCharges: 0, totalDeposit: 0 });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Shield className="w-8 h-8 text-blue-500" />
                            PF Report
                        </h1>
                        <p className="text-gray-400 mt-1">Provident Fund contribution details</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate ECR
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Employees</p>
                        <p className="text-2xl font-bold text-white">{filteredEntries.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Employee PF</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.employeeContribution)}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Employer EPF</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.employerEPF)}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Employer EPS</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.employerEPS)}</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                        <p className="text-cyan-400 text-sm">Total Deposit</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totals.totalDeposit)}</p>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Contribution Rates</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Employee PF</span>
                                <span className="text-white">12% of Basic</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Employer EPF</span>
                                <span className="text-white">3.67% of Basic</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Employer EPS</span>
                                <span className="text-white">8.33% of Basic</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Admin Charges</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Admin Charges (0.5%)</span>
                                <span className="text-white">{formatCurrency(totals.adminCharges)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">EDLI Charges (0.5%)</span>
                                <span className="text-white">{formatCurrency(totals.edliCharges)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Filing Status</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Due Date</span>
                                <span className="text-white">15th Feb 2025</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Status</span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                    <Calendar className="w-3 h-3" /> Pending
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, ID, or UAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-3 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-3 text-gray-400 font-medium">UAN / PF No.</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Basic Wage</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Employee PF</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Employer EPF</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Employer EPS</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Total PF</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">Admin</th>
                                    <th className="text-right p-3 text-gray-400 font-medium">EDLI</th>
                                    <th className="text-right p-3 text-cyan-400 font-medium">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry) => (
                                    <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-3">
                                            <p className="text-white font-medium">{entry.employeeName}</p>
                                            <p className="text-xs text-gray-400">{entry.employeeId} • {entry.department}</p>
                                        </td>
                                        <td className="p-3">
                                            <p className="text-white text-xs">{entry.uan}</p>
                                            <p className="text-xs text-gray-500">{entry.pfNumber}</p>
                                        </td>
                                        <td className="p-3 text-right text-gray-300">{formatCurrency(entry.basicWage)}</td>
                                        <td className="p-3 text-right text-green-400">{formatCurrency(entry.employeeContribution)}</td>
                                        <td className="p-3 text-right text-purple-400">{formatCurrency(entry.employerEPF)}</td>
                                        <td className="p-3 text-right text-orange-400">{formatCurrency(entry.employerEPS)}</td>
                                        <td className="p-3 text-right text-white font-medium">{formatCurrency(entry.totalContribution)}</td>
                                        <td className="p-3 text-right text-gray-400">{formatCurrency(entry.adminCharges)}</td>
                                        <td className="p-3 text-right text-gray-400">{formatCurrency(entry.edliCharges)}</td>
                                        <td className="p-3 text-right text-cyan-400 font-medium">{formatCurrency(entry.totalDeposit)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-900/50 border-t border-gray-600">
                                    <td colSpan={2} className="p-3 text-white font-bold">Total</td>
                                    <td className="p-3 text-right text-white font-bold">{formatCurrency(totals.basicWage)}</td>
                                    <td className="p-3 text-right text-green-400 font-bold">{formatCurrency(totals.employeeContribution)}</td>
                                    <td className="p-3 text-right text-purple-400 font-bold">{formatCurrency(totals.employerEPF)}</td>
                                    <td className="p-3 text-right text-orange-400 font-bold">{formatCurrency(totals.employerEPS)}</td>
                                    <td className="p-3 text-right text-white font-bold">{formatCurrency(totals.totalContribution)}</td>
                                    <td className="p-3 text-right text-gray-400 font-bold">{formatCurrency(totals.adminCharges)}</td>
                                    <td className="p-3 text-right text-gray-400 font-bold">{formatCurrency(totals.edliCharges)}</td>
                                    <td className="p-3 text-right text-cyan-400 font-bold">{formatCurrency(totals.totalDeposit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
