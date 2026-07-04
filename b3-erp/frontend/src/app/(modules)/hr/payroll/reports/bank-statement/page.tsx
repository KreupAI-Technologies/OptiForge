'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Building2,
    Search,
    Filter,
    Download,
    FileText,
    CheckCircle,
    Clock,
    Users
} from 'lucide-react';

interface BankStatement {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    netPay: number;
    transferMode: 'NEFT' | 'RTGS' | 'IMPS';
    status: 'Pending' | 'Processed' | 'Failed';
    transactionId: string | null;
    processedDate: string | null;
}

export default function BankStatementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [monthFilter, setMonthFilter] = useState('January');
    const [yearFilter, setYearFilter] = useState('2025');
    const [bankFilter, setBankFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [statements, setStatements] = useState<BankStatement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getReportsBy('bank-statement');
                const mapped: BankStatement[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setStatements(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setStatements([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const banks = Array.from(new Set(statements.map(s => s.bankName)));

    const filteredStatements = statements.filter(statement => {
        const matchesSearch = statement.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            statement.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            statement.accountNumber.includes(searchTerm);
        const matchesBank = bankFilter === 'all' || statement.bankName === bankFilter;
        const matchesStatus = statusFilter === 'all' || statement.status === statusFilter;
        return matchesSearch && matchesBank && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Processed': return 'bg-green-500/20 text-green-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Failed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const totalAmount = filteredStatements.reduce((sum, s) => sum + s.netPay, 0);
    const processedAmount = filteredStatements.filter(s => s.status === 'Processed').reduce((sum, s) => sum + s.netPay, 0);
    const pendingAmount = filteredStatements.filter(s => s.status === 'Pending').reduce((sum, s) => sum + s.netPay, 0);

    // Group by bank
    const bankSummary = banks.map(bank => ({
        bank,
        count: statements.filter(s => s.bankName === bank).length,
        amount: statements.filter(s => s.bankName === bank).reduce((sum, s) => sum + s.netPay, 0)
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-purple-500" />
                            Bank Statement
                        </h1>
                        <p className="text-gray-400 mt-1">Generate bank payment files for salary disbursement</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate Bank File
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">{filteredStatements.length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Processed</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(processedAmount)}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(pendingAmount)}</p>
                    </div>
                </div>

                {/* Bank Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {bankSummary.map((bs) => (
                        <div key={bs.bank} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                            <p className="text-gray-400 text-sm">{bs.bank}</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(bs.amount)}</p>
                            <p className="text-xs text-gray-500">{bs.count} employees</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employees or account..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={bankFilter}
                            onChange={(e) => setBankFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Banks</option>
                            {banks.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processed">Processed</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Bank Details</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Net Pay</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Mode</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStatements.map((statement) => (
                                    <tr key={statement.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {statement.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{statement.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{statement.employeeId} • {statement.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-white text-sm">{statement.bankName}</p>
                                            <p className="text-xs text-gray-400">{statement.accountNumber}</p>
                                            <p className="text-xs text-gray-500">{statement.ifscCode}</p>
                                        </td>
                                        <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(statement.netPay)}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                                {statement.transferMode}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(statement.status)}`}>
                                                {statement.status === 'Processed' && <CheckCircle className="w-3 h-3" />}
                                                {statement.status === 'Pending' && <Clock className="w-3 h-3" />}
                                                {statement.status}
                                            </span>
                                            {statement.processedDate && (
                                                <p className="text-xs text-gray-500 mt-1">{new Date(statement.processedDate).toLocaleDateString()}</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm">
                                            {statement.transactionId || '-'}
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
