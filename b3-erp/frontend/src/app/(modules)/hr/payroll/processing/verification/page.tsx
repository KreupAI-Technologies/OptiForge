'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    ClipboardCheck,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
    Download,
    RefreshCw,
    Users
} from 'lucide-react';

interface PayrollVerification {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    grossPay: number;
    deductions: number;
    netPay: number;
    workingDays: number;
    presentDays: number;
    lop: number;
    overtime: number;
    status: 'Pending' | 'Verified' | 'Flagged' | 'Corrected';
    issues: string[];
    verifiedBy: string | null;
    verifiedAt: string | null;
}

export default function PayrollVerificationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    const [verifications, setVerifications] = useState<PayrollVerification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getReportsBy('verification');
          const mapped: PayrollVerification[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setVerifications(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setVerifications([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredVerifications = verifications.filter(v => {
        const matchesSearch = v.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Verified': return 'bg-green-500/20 text-green-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Flagged': return 'bg-red-500/20 text-red-400';
            case 'Corrected': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Verified': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'Pending': return <RefreshCw className="w-4 h-4 text-yellow-400" />;
            case 'Flagged': return <AlertTriangle className="w-4 h-4 text-red-400" />;
            case 'Corrected': return <CheckCircle className="w-4 h-4 text-blue-400" />;
            default: return null;
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedEmployees(filteredVerifications.filter(v => v.status === 'Pending').map(v => v.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (id: string) => {
        setSelectedEmployees(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        );
    };

    const pendingCount = verifications.filter(v => v.status === 'Pending').length;
    const flaggedCount = verifications.filter(v => v.status === 'Flagged').length;
    const verifiedCount = verifications.filter(v => v.status === 'Verified' || v.status === 'Corrected').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ClipboardCheck className="w-8 h-8 text-purple-500" />
                            Payroll Verification
                        </h1>
                        <p className="text-gray-400 mt-1">Review and verify payroll calculations</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            disabled={selectedEmployees.length === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Verify Selected ({selectedEmployees.length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">{verifications.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Review</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Flagged</p>
                        <p className="text-3xl font-bold text-white">{flaggedCount}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Verified</p>
                        <p className="text-3xl font-bold text-white">{verifiedCount}</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Flagged">Flagged</option>
                            <option value="Corrected">Corrected</option>
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
                                            checked={selectedEmployees.length === filteredVerifications.filter(v => v.status === 'Pending').length && pendingCount > 0}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                                        />
                                    </th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Days</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Gross</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Deductions</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Net Pay</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVerifications.map((verification) => (
                                    <tr key={verification.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            {verification.status === 'Pending' && (
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(verification.id)}
                                                    onChange={() => handleSelectEmployee(verification.id)}
                                                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
                                                />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {verification.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{verification.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{verification.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300">{verification.department}</td>
                                        <td className="p-4 text-center">
                                            <div className="text-sm">
                                                <span className="text-white">{verification.presentDays}</span>
                                                <span className="text-gray-500">/{verification.workingDays}</span>
                                                {verification.lop > 0 && (
                                                    <span className="text-red-400 text-xs ml-1">(-{verification.lop} LOP)</span>
                                                )}
                                                {verification.overtime > 0 && (
                                                    <span className="text-green-400 text-xs ml-1">(+{verification.overtime}h OT)</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-white">{formatCurrency(verification.grossPay)}</td>
                                        <td className="p-4 text-right text-red-400">{formatCurrency(verification.deductions)}</td>
                                        <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(verification.netPay)}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusColor(verification.status)}`}>
                                                    {getStatusIcon(verification.status)}
                                                    {verification.status}
                                                </span>
                                                {verification.issues.length > 0 && (
                                                    <span className="text-xs text-red-400">{verification.issues.length} issue(s)</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {verification.status === 'Pending' && (
                                                    <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {verification.status === 'Flagged' && (
                                                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded">
                                                        <RefreshCw className="w-4 h-4" />
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
            </div>
        </div>
    );
}
