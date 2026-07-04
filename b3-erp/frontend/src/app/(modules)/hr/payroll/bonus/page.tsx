'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Gift,
    Search,
    Filter,
    Download,
    Plus,
    CheckCircle,
    Clock,
    Users,
    Calendar,
    DollarSign,
    Eye,
    Edit
} from 'lucide-react';

interface BonusRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    bonusType: 'Annual Bonus' | 'Performance Bonus' | 'Festival Bonus' | 'Retention Bonus' | 'Spot Award';
    financialYear: string;
    grossSalary: number;
    bonusAmount: number;
    bonusPercentage: number;
    effectiveDate: string;
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Paid' | 'Rejected';
    approvedBy: string | null;
    paidDate: string | null;
}

export default function BonusIncentivesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [bonusRecords, setBonusRecords] = useState<BonusRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getBonusRecords();
                const mapped: BonusRecord[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setBonusRecords(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setBonusRecords([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredRecords = bonusRecords.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || record.bonusType === typeFilter;
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-400';
            case 'Approved': return 'bg-blue-500/20 text-blue-400';
            case 'Pending Approval': return 'bg-yellow-500/20 text-yellow-400';
            case 'Draft': return 'bg-gray-500/20 text-gray-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Annual Bonus': return 'bg-purple-500/20 text-purple-400';
            case 'Performance Bonus': return 'bg-blue-500/20 text-blue-400';
            case 'Festival Bonus': return 'bg-orange-500/20 text-orange-400';
            case 'Retention Bonus': return 'bg-green-500/20 text-green-400';
            case 'Spot Award': return 'bg-pink-500/20 text-pink-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const totalBonus = bonusRecords.reduce((sum, r) => sum + r.bonusAmount, 0);
    const paidBonus = bonusRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.bonusAmount, 0);
    const pendingBonus = bonusRecords.filter(r => r.status === 'Approved' || r.status === 'Pending Approval').reduce((sum, r) => sum + r.bonusAmount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Gift className="w-8 h-8 text-pink-500" />
                            Bonus & Incentives
                        </h1>
                        <p className="text-gray-400 mt-1">Manage employee bonuses and incentive payments</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Bonus
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                        <p className="text-pink-400 text-sm">Total Bonuses</p>
                        <p className="text-3xl font-bold text-white">{bonusRecords.length}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalBonus)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Paid</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(paidBonus)}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(pendingBonus)}</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Annual Bonus">Annual Bonus</option>
                            <option value="Performance Bonus">Performance Bonus</option>
                            <option value="Festival Bonus">Festival Bonus</option>
                            <option value="Retention Bonus">Retention Bonus</option>
                            <option value="Spot Award">Spot Award</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending Approval">Pending Approval</option>
                            <option value="Approved">Approved</option>
                            <option value="Paid">Paid</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Bonus Type</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">FY</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Gross Salary</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Bonus Amount</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">%</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{record.employeeId} • {record.department}</p>
                                                    <p className="text-xs text-gray-500">{record.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(record.bonusType)}`}>
                                                {record.bonusType}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-gray-300 text-sm">{record.financialYear}</td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(record.grossSalary)}</td>
                                        <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(record.bonusAmount)}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
                                                {record.bonusPercentage}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
                                                {record.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                                                {record.status === 'Pending Approval' && <Clock className="w-3 h-3" />}
                                                {record.status}
                                            </span>
                                            {record.paidDate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(record.paidDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {record.status !== 'Paid' && (
                                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                        <Edit className="w-4 h-4" />
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
