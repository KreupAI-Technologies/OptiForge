'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    FileCheck,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    Plus
} from 'lucide-react';

interface TaxDeclaration {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    fiscalYear: string;
    regime: 'Old' | 'New';
    status: 'Draft' | 'Submitted' | 'Verified' | 'Rejected';
    submittedDate: string | null;
    verifiedDate: string | null;
    section80C: number;
    section80D: number;
    section80G: number;
    hra: number;
    lta: number;
    otherExemptions: number;
    totalDeductions: number;
    proofsPending: number;
}

export default function TaxDeclarationsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fiscalYear] = useState('2024-25');

    const declarations: TaxDeclaration[] = [
        {
            id: '1',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            fiscalYear: '2024-25',
            regime: 'Old',
            status: 'Verified',
            submittedDate: '2024-04-15',
            verifiedDate: '2024-04-20',
            section80C: 150000,
            section80D: 50000,
            section80G: 10000,
            hra: 180000,
            lta: 30000,
            otherExemptions: 30000,
            totalDeductions: 450000,
            proofsPending: 0
        },
        {
            id: '2',
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            fiscalYear: '2024-25',
            regime: 'New',
            status: 'Submitted',
            submittedDate: '2024-04-10',
            verifiedDate: null,
            section80C: 0,
            section80D: 0,
            section80G: 0,
            hra: 0,
            lta: 0,
            otherExemptions: 50000,
            totalDeductions: 50000,
            proofsPending: 0
        },
        {
            id: '3',
            employeeId: 'EMP003',
            employeeName: 'Emily Davis',
            department: 'Quality Assurance',
            fiscalYear: '2024-25',
            regime: 'Old',
            status: 'Submitted',
            submittedDate: '2024-04-18',
            verifiedDate: null,
            section80C: 100000,
            section80D: 25000,
            section80G: 5000,
            hra: 96000,
            lta: 20000,
            otherExemptions: 4000,
            totalDeductions: 250000,
            proofsPending: 3
        },
        {
            id: '4',
            employeeId: 'EMP005',
            employeeName: 'Jennifer Brown',
            department: 'Finance',
            fiscalYear: '2024-25',
            regime: 'Old',
            status: 'Draft',
            submittedDate: null,
            verifiedDate: null,
            section80C: 80000,
            section80D: 30000,
            section80G: 0,
            hra: 144000,
            lta: 0,
            otherExemptions: 20000,
            totalDeductions: 274000,
            proofsPending: 5
        },
        {
            id: '5',
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            fiscalYear: '2024-25',
            regime: 'New',
            status: 'Verified',
            submittedDate: '2024-04-08',
            verifiedDate: '2024-04-12',
            section80C: 0,
            section80D: 0,
            section80G: 0,
            hra: 0,
            lta: 0,
            otherExemptions: 50000,
            totalDeductions: 50000,
            proofsPending: 0
        }
    ];

    const filteredDeclarations = declarations.filter(dec => {
        const matchesSearch = dec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dec.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || dec.status === statusFilter;
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
            case 'Verified': return 'bg-green-500/20 text-green-400';
            case 'Submitted': return 'bg-blue-500/20 text-blue-400';
            case 'Draft': return 'bg-yellow-500/20 text-yellow-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Verified': return <CheckCircle className="w-4 h-4" />;
            case 'Submitted': return <Clock className="w-4 h-4" />;
            case 'Draft': return <Edit className="w-4 h-4" />;
            case 'Rejected': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const draftCount = declarations.filter(d => d.status === 'Draft').length;
    const submittedCount = declarations.filter(d => d.status === 'Submitted').length;
    const verifiedCount = declarations.filter(d => d.status === 'Verified').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileCheck className="w-8 h-8 text-blue-500" />
                            Tax Declarations
                        </h1>
                        <p className="text-gray-400 mt-1">Manage employee investment declarations</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                            FY {fiscalYear}
                        </span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Declarations</p>
                        <p className="text-3xl font-bold text-white">{declarations.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Draft</p>
                        <p className="text-3xl font-bold text-white">{draftCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Pending Verification</p>
                        <p className="text-3xl font-bold text-white">{submittedCount}</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredDeclarations.map((declaration) => (
                        <div key={declaration.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {declaration.employeeName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-white">{declaration.employeeName}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusColor(declaration.status)}`}>
                                                {getStatusIcon(declaration.status)}
                                                {declaration.status}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${declaration.regime === 'Old' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {declaration.regime} Regime
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{declaration.employeeId} • {declaration.department}</p>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                            <div>
                                                <span className="text-gray-400">80C: </span>
                                                <span className="text-white">{formatCurrency(declaration.section80C)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">80D: </span>
                                                <span className="text-white">{formatCurrency(declaration.section80D)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">HRA: </span>
                                                <span className="text-white">{formatCurrency(declaration.hra)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Total: </span>
                                                <span className="text-green-400 font-medium">{formatCurrency(declaration.totalDeductions)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {declaration.submittedDate && (
                                        <div className="flex items-center gap-1 text-sm text-gray-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            Submitted: {new Date(declaration.submittedDate).toLocaleDateString()}
                                        </div>
                                    )}
                                    {declaration.proofsPending > 0 && (
                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                            {declaration.proofsPending} proofs pending
                                        </span>
                                    )}
                                    <div className="flex gap-2 mt-3 justify-end">
                                        <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        {declaration.status === 'Submitted' && (
                                            <button className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm">
                                                <CheckCircle className="w-4 h-4" /> Verify
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
