'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Banknote,
    Search,
    Filter,
    Download,
    Send,
    CheckCircle,
    Clock,
    AlertCircle,
    Building,
    CreditCard,
    FileText,
    Users
} from 'lucide-react';

interface DisbursementRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    netPay: number;
    status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    transactionId: string | null;
    processedAt: string | null;
    failureReason: string | null;
}

export default function SalaryDisbursementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);

    const [disbursements, setDisbursements] = useState<DisbursementRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getDisbursements();
          const mapped: DisbursementRecord[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setDisbursements(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setDisbursements([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredDisbursements = disbursements.filter(d => {
        const matchesSearch = d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-400';
            case 'Processing': return 'bg-blue-500/20 text-blue-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Failed': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return <CheckCircle className="w-4 h-4" />;
            case 'Processing': return <Clock className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            case 'Failed': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecords(filteredDisbursements.filter(d => d.status === 'Pending').map(d => d.id));
        } else {
            setSelectedRecords([]);
        }
    };

    const handleSelectRecord = (id: string) => {
        setSelectedRecords(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const totalAmount = disbursements.reduce((sum, d) => sum + d.netPay, 0);
    const completedAmount = disbursements.filter(d => d.status === 'Completed').reduce((sum, d) => sum + d.netPay, 0);
    const pendingAmount = disbursements.filter(d => d.status === 'Pending' || d.status === 'Processing').reduce((sum, d) => sum + d.netPay, 0);
    const failedAmount = disbursements.filter(d => d.status === 'Failed').reduce((sum, d) => sum + d.netPay, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Banknote className="w-8 h-8 text-green-500" />
                            Salary Disbursement
                        </h1>
                        <p className="text-gray-400 mt-1">Process salary payments to employees</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Bank File
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            disabled={selectedRecords.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Process Selected ({selectedRecords.length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                        <p className="text-xs text-gray-400 mt-1">{disbursements.length} employees</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(completedAmount)}</p>
                        <p className="text-xs text-gray-400 mt-1">{disbursements.filter(d => d.status === 'Completed').length} transfers</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(pendingAmount)}</p>
                        <p className="text-xs text-gray-400 mt-1">{disbursements.filter(d => d.status === 'Pending' || d.status === 'Processing').length} pending</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Failed</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(failedAmount)}</p>
                        <p className="text-xs text-gray-400 mt-1">{disbursements.filter(d => d.status === 'Failed').length} failed</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="p-4">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            checked={selectedRecords.length === filteredDisbursements.filter(d => d.status === 'Pending').length && disbursements.filter(d => d.status === 'Pending').length > 0}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                                        />
                                    </th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Bank Details</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Net Pay</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Transaction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDisbursements.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            {record.status === 'Pending' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRecords.includes(record.id)}
                                                    onChange={() => handleSelectRecord(record.id)}
                                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-500 focus:ring-green-500"
                                                />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{record.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{record.department}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-gray-500" />
                                                <div>
                                                    <p className="text-white text-sm">{record.bankName}</p>
                                                    <p className="text-xs text-gray-400">{record.accountNumber} • {record.ifscCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="text-green-400 font-medium">{formatCurrency(record.netPay)}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                {record.status}
                                            </span>
                                            {record.failureReason && (
                                                <p className="text-xs text-red-400 mt-1">{record.failureReason}</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {record.transactionId ? (
                                                <div>
                                                    <p className="text-white text-sm font-mono">{record.transactionId}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {record.processedAt && new Date(record.processedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">-</span>
                                            )}
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
