'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    BarChart3,
    Download,
    Calendar,
    TrendingUp,
    FileText,
    Users,
    Filter,
    RefreshCw
} from 'lucide-react';

interface TaxReportSummary {
    month: string;
    employeesWithTDS: number;
    totalTDSDeducted: number;
    totalTDSDeposited: number;
    challanNumber: string;
    depositDate: string;
}

export default function TaxReportsPage() {
    const [fiscalYear, setFiscalYear] = useState('2024-25');
    const [reportType, setReportType] = useState('monthly');

    const [monthlyData, setMonthlyData] = useState<TaxReportSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getTaxRecordsBy('summary');
                const mapped: TaxReportSummary[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setMonthlyData(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setMonthlyData([]); }
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

    const totalTDSDeducted = monthlyData.reduce((sum, m) => sum + m.totalTDSDeducted, 0);
    const totalTDSDeposited = monthlyData.reduce((sum, m) => sum + m.totalTDSDeposited, 0);
    const avgEmployees = Math.round(monthlyData.reduce((sum, m) => sum + m.employeesWithTDS, 0) / monthlyData.length);

    const reports = [
        { id: 'form24q', name: 'Form 24Q', description: 'Quarterly TDS return for salaries', quarters: ['Q1', 'Q2', 'Q3'] },
        { id: 'form16', name: 'Form 16', description: 'Annual salary certificate', status: 'Generated' },
        { id: 'form12ba', name: 'Form 12BA', description: 'Statement of perquisites', status: 'Pending' },
        { id: 'tds-challan', name: 'TDS Challans', description: 'Monthly TDS payment receipts', count: 9 }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-green-500" />
                            Tax Reports
                        </h1>
                        <p className="text-gray-400 mt-1">TDS reports and compliance documents</p>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={fiscalYear}
                            onChange={(e) => setFiscalYear(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="2024-25">FY 2024-25</option>
                            <option value="2023-24">FY 2023-24</option>
                        </select>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total TDS Deducted</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalTDSDeducted)}</p>
                        <p className="text-xs text-gray-400 mt-1">YTD (9 months)</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total TDS Deposited</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalTDSDeposited)}</p>
                        <p className="text-xs text-gray-400 mt-1">All challans cleared</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Avg. Employees</p>
                        <p className="text-3xl font-bold text-white">{avgEmployees}</p>
                        <p className="text-xs text-gray-400 mt-1">With TDS deduction</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Compliance Status</p>
                        <p className="text-3xl font-bold text-white">100%</p>
                        <p className="text-xs text-gray-400 mt-1">All returns filed</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                                Monthly TDS Summary
                            </h2>
                            <button className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left p-3 text-gray-400 font-medium">Month</th>
                                        <th className="text-center p-3 text-gray-400 font-medium">Employees</th>
                                        <th className="text-right p-3 text-gray-400 font-medium">TDS Deducted</th>
                                        <th className="text-right p-3 text-gray-400 font-medium">TDS Deposited</th>
                                        <th className="text-center p-3 text-gray-400 font-medium">Challan</th>
                                        <th className="text-center p-3 text-gray-400 font-medium">Deposit Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyData.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                            <td className="p-3 text-white">{row.month}</td>
                                            <td className="p-3 text-center text-gray-300">{row.employeesWithTDS}</td>
                                            <td className="p-3 text-right text-orange-400">{formatCurrency(row.totalTDSDeducted)}</td>
                                            <td className="p-3 text-right text-green-400">{formatCurrency(row.totalTDSDeposited)}</td>
                                            <td className="p-3 text-center">
                                                <span className="font-mono text-xs text-gray-300">{row.challanNumber}</span>
                                            </td>
                                            <td className="p-3 text-center text-gray-400 text-sm">
                                                {new Date(row.depositDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-700/30">
                                        <td className="p-3 text-white font-medium">Total</td>
                                        <td className="p-3 text-center text-white font-medium">-</td>
                                        <td className="p-3 text-right text-orange-400 font-medium">{formatCurrency(totalTDSDeducted)}</td>
                                        <td className="p-3 text-right text-green-400 font-medium">{formatCurrency(totalTDSDeposited)}</td>
                                        <td className="p-3 text-center">-</td>
                                        <td className="p-3 text-center">-</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Available Reports
                        </h2>

                        <div className="space-y-3">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium">{report.name}</span>
                                        {report.quarters && (
                                            <div className="flex gap-1">
                                                {report.quarters.map(q => (
                                                    <span key={q} className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                                                        {q}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {report.status && (
                                            <span className={`px-2 py-0.5 rounded text-xs ${report.status === 'Generated' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {report.status}
                                            </span>
                                        )}
                                        {report.count && (
                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                {report.count} files
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{report.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
