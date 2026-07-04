'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Award,
    Search,
    Filter,
    Download,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Star,
    Calendar,
    TrendingUp
} from 'lucide-react';

interface PerformanceIncrement {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    currentCTC: number;
    proposedCTC: number;
    incrementPercentage: number;
    incrementType: 'Exceptional' | 'Outstanding' | 'Merit' | 'Retention';
    effectiveDate: string;
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
    performanceRating: number;
    justification: string;
    recommendedBy: string;
    approvedBy: string | null;
}

export default function PerformanceIncrementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [increments, setIncrements] = useState<PerformanceIncrement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getSalaryRevisionsBy('performance');
                const mapped: PerformanceIncrement[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setIncrements(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setIncrements([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredIncrements = increments.filter(inc => {
        const matchesSearch = inc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inc.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || inc.incrementType === typeFilter;
        return matchesSearch && matchesType;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-400';
            case 'Pending Approval': return 'bg-yellow-500/20 text-yellow-400';
            case 'Draft': return 'bg-blue-500/20 text-blue-400';
            case 'Rejected': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Exceptional': return 'bg-purple-500/20 text-purple-400';
            case 'Outstanding': return 'bg-blue-500/20 text-blue-400';
            case 'Merit': return 'bg-green-500/20 text-green-400';
            case 'Retention': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                />
            );
        }
        return stars;
    };

    const totalBudget = increments.reduce((sum, i) => sum + (i.proposedCTC - i.currentCTC), 0);
    const avgIncrement = increments.reduce((sum, i) => sum + i.incrementPercentage, 0) / increments.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Award className="w-8 h-8 text-purple-500" />
                            Performance Increment
                        </h1>
                        <p className="text-gray-400 mt-1">Special performance-based salary revisions</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Requests</p>
                        <p className="text-3xl font-bold text-white">{increments.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Approved</p>
                        <p className="text-3xl font-bold text-white">{increments.filter(i => i.status === 'Approved').length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Avg. Increment</p>
                        <p className="text-3xl font-bold text-white">{avgIncrement.toFixed(1)}%</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Budget</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalBudget)}</p>
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
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Exceptional">Exceptional</option>
                            <option value="Outstanding">Outstanding</option>
                            <option value="Merit">Merit</option>
                            <option value="Retention">Retention</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredIncrements.map((increment) => (
                        <div key={increment.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                        {increment.employeeName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-white">{increment.employeeName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(increment.incrementType)}`}>
                                                {increment.incrementType}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(increment.status)}`}>
                                                {increment.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{increment.employeeId} • {increment.department} • {increment.designation}</p>

                                        <div className="flex items-center gap-1 mt-2">
                                            {renderStars(increment.performanceRating)}
                                            <span className="text-sm text-gray-400 ml-2">{increment.performanceRating}</span>
                                        </div>

                                        <p className="text-sm text-gray-300 mt-2 italic">&quot;{increment.justification}&quot;</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Current CTC</p>
                                            <p className="text-white font-medium">{formatCurrency(increment.currentCTC)}</p>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Proposed CTC</p>
                                            <p className="text-green-400 font-medium">{formatCurrency(increment.proposedCTC)}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                                        +{increment.incrementPercentage}%
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        Effective: {new Date(increment.effectiveDate).toLocaleDateString()}
                                    </div>
                                    <p className="text-xs text-gray-500">Recommended by: {increment.recommendedBy}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        {increment.status === 'Pending Approval' && (
                                            <button className="flex items-center gap-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm">
                                                <CheckCircle className="w-4 h-4" /> Approve
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
