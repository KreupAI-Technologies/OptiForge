'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Award,
    Search,
    Filter,
    Download,
    Plus,
    CheckCircle,
    Clock,
    Eye,
    Edit,
    Star,
    TrendingUp
} from 'lucide-react';

interface PerformanceBonus {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    reviewPeriod: string;
    performanceRating: number;
    kpiScore: number;
    targetBonus: number;
    multiplier: number;
    calculatedBonus: number;
    managerAdjustment: number;
    finalBonus: number;
    status: 'Draft' | 'Pending Review' | 'Approved' | 'Paid';
    reviewedBy: string | null;
}

export default function PerformanceBonusPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('Q4 2024');

    const [bonusRecords, setBonusRecords] = useState<PerformanceBonus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getBonusRecordsBy('performance');
                const mapped: PerformanceBonus[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        const matchesPeriod = record.reviewPeriod === periodFilter;
        return matchesSearch && matchesStatus && matchesPeriod;
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
            case 'Pending Review': return 'bg-yellow-500/20 text-yellow-400';
            case 'Draft': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-400';
        if (rating >= 4.0) return 'text-blue-400';
        if (rating >= 3.5) return 'text-yellow-400';
        return 'text-orange-400';
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-3 h-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
            );
        }
        return stars;
    };

    const totalBonus = filteredRecords.reduce((sum, r) => sum + r.finalBonus, 0);
    const avgRating = filteredRecords.reduce((sum, r) => sum + r.performanceRating, 0) / filteredRecords.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Award className="w-8 h-8 text-purple-500" />
                            Performance Bonus
                        </h1>
                        <p className="text-gray-400 mt-1">Performance-based bonus calculation and approval</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            Calculate Bonuses
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
                        <p className="text-3xl font-bold text-white">{filteredRecords.length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Bonus</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalBonus)}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Avg. Rating</p>
                        <p className="text-3xl font-bold text-white">{avgRating.toFixed(1)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Paid</p>
                        <p className="text-3xl font-bold text-white">{filteredRecords.filter(r => r.status === 'Paid').length}</p>
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
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="Q4 2024">Q4 2024</option>
                            <option value="Q3 2024">Q3 2024</option>
                            <option value="Q2 2024">Q2 2024</option>
                            <option value="Q1 2024">Q1 2024</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending Review">Pending Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Rating</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">KPI Score</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Target</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Multiplier</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Calculated</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Final</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{record.employeeId} • {record.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-lg font-bold ${getRatingColor(record.performanceRating)}`}>
                                                    {record.performanceRating}
                                                </span>
                                                <div className="flex gap-0.5">
                                                    {renderStars(record.performanceRating)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-sm ${record.kpiScore >= 90 ? 'bg-green-500/20 text-green-400' : record.kpiScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {record.kpiScore}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(record.targetBonus)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-sm ${record.multiplier >= 1 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {record.multiplier}x
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(record.calculatedBonus)}</td>
                                        <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(record.finalBonus)}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(record.status)}`}>
                                                {record.status === 'Paid' && <CheckCircle className="w-3 h-3" />}
                                                {record.status}
                                            </span>
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
