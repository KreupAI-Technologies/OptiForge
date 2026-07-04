'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    Send,
    CheckCircle,
    Clock,
    Calendar,
    Printer,
    Mail,
    AlertCircle
} from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface Form16Record {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    pan: string;
    fiscalYear: string;
    quartersCovered: string[];
    grossSalary: number;
    taxDeducted: number;
    status: 'Generated' | 'Pending' | 'Sent' | 'Downloaded';
    generatedDate: string | null;
    sentDate: string | null;
    downloadedDate: string | null;
}

export default function Form16Page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fiscalYear] = useState('2023-24');

    const form16Records: Form16Record[] = [
        {
            id: '1',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            pan: 'ABCPJ1234K',
            fiscalYear: '2023-24',
            quartersCovered: ['Q1', 'Q2', 'Q3', 'Q4'],
            grossSalary: 1500000,
            taxDeducted: 115500,
            status: 'Sent',
            generatedDate: '2024-06-01',
            sentDate: '2024-06-05',
            downloadedDate: null
        },
        {
            id: '2',
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            pan: 'DEFPC5678L',
            fiscalYear: '2023-24',
            quartersCovered: ['Q1', 'Q2', 'Q3', 'Q4'],
            grossSalary: 800000,
            taxDeducted: 35000,
            status: 'Downloaded',
            generatedDate: '2024-06-01',
            sentDate: '2024-06-05',
            downloadedDate: '2024-06-10'
        },
        {
            id: '3',
            employeeId: 'EMP003',
            employeeName: 'Emily Davis',
            department: 'Quality Assurance',
            pan: 'GHIPD9012M',
            fiscalYear: '2023-24',
            quartersCovered: ['Q1', 'Q2', 'Q3', 'Q4'],
            grossSalary: 750000,
            taxDeducted: 12500,
            status: 'Generated',
            generatedDate: '2024-06-01',
            sentDate: null,
            downloadedDate: null
        },
        {
            id: '4',
            employeeId: 'EMP005',
            employeeName: 'Jennifer Brown',
            department: 'Finance',
            pan: 'JKLPB3456N',
            fiscalYear: '2023-24',
            quartersCovered: ['Q1', 'Q2', 'Q3', 'Q4'],
            grossSalary: 1200000,
            taxDeducted: 72500,
            status: 'Sent',
            generatedDate: '2024-06-01',
            sentDate: '2024-06-05',
            downloadedDate: null
        },
        {
            id: '5',
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            pan: 'MNOPB7890O',
            fiscalYear: '2023-24',
            quartersCovered: ['Q3', 'Q4'],
            grossSalary: 450000,
            taxDeducted: 15000,
            status: 'Pending',
            generatedDate: null,
            sentDate: null,
            downloadedDate: null
        }
    ];

    const filteredRecords = form16Records.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.pan.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Downloaded': return 'bg-green-500/20 text-green-400';
            case 'Sent': return 'bg-blue-500/20 text-blue-400';
            case 'Generated': return 'bg-purple-500/20 text-purple-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Downloaded': return <CheckCircle className="w-4 h-4" />;
            case 'Sent': return <Mail className="w-4 h-4" />;
            case 'Generated': return <FileText className="w-4 h-4" />;
            case 'Pending': return <Clock className="w-4 h-4" />;
            default: return null;
        }
    };

    const pendingCount = form16Records.filter(r => r.status === 'Pending').length;
    const generatedCount = form16Records.filter(r => r.status === 'Generated').length;
    const sentCount = form16Records.filter(r => r.status === 'Sent' || r.status === 'Downloaded').length;
    const totalTax = form16Records.reduce((sum, r) => sum + r.taxDeducted, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-8 h-8 text-purple-500" />
                            Form 16
                        </h1>
                        <p className="text-gray-400 mt-1">Generate and distribute Form 16 certificates</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                            FY {fiscalYear}
                        </span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate All
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Send className="w-4 h-4" />
                            Send All
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Employees</p>
                        <p className="text-3xl font-bold text-white">{form16Records.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending Generation</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Sent/Downloaded</p>
                        <p className="text-3xl font-bold text-white">{sentCount}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total TDS</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalTax)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or PAN..."
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
                            <option value="Generated">Generated</option>
                            <option value="Sent">Sent</option>
                            <option value="Downloaded">Downloaded</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">PAN</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Quarters</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Gross Salary</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Tax Deducted</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{record.employeeId} • {record.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="font-mono text-gray-300">{record.pan}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {record.quartersCovered.map((q) => (
                                                    <span key={q} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                                        {q}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-white">{formatCurrency(record.grossSalary)}</td>
                                        <td className="p-4 text-right text-orange-400 font-medium">{formatCurrency(record.taxDeducted)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                {record.status}
                                            </span>
                                            {record.generatedDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(record.generatedDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {record.status === 'Pending' ? (
                                                    <button className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded">
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        {record.status === 'Generated' && (
                                                            <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded">
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
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
