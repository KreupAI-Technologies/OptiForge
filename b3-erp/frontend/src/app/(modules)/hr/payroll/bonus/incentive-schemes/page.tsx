'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Target,
    Search,
    Filter,
    Download,
    Plus,
    CheckCircle,
    Edit,
    Eye,
    Trash2,
    Users,
    Calendar,
    Percent
} from 'lucide-react';

interface IncentiveScheme {
    id: string;
    schemeName: string;
    schemeCode: string;
    type: 'Sales' | 'Production' | 'Quality' | 'Attendance' | 'Custom';
    applicableTo: string;
    targetType: 'Revenue' | 'Units' | 'Percentage' | 'Days';
    targetValue: number;
    incentiveType: 'Fixed' | 'Percentage' | 'Slab';
    incentiveValue: number;
    maxPayout: number;
    effectiveFrom: string;
    effectiveTo: string;
    status: 'Active' | 'Draft' | 'Expired' | 'Suspended';
    participants: number;
    totalPayout: number;
}

export default function IncentiveSchemesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [schemes, setSchemes] = useState<IncentiveScheme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getBonusSchemes();
                const mapped: IncentiveScheme[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setSchemes(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setSchemes([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredSchemes = schemes.filter(scheme => {
        const matchesSearch = scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scheme.schemeCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || scheme.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || scheme.status === statusFilter;
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
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'Draft': return 'bg-gray-500/20 text-gray-400';
            case 'Expired': return 'bg-red-500/20 text-red-400';
            case 'Suspended': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Sales': return 'bg-blue-500/20 text-blue-400';
            case 'Production': return 'bg-purple-500/20 text-purple-400';
            case 'Quality': return 'bg-green-500/20 text-green-400';
            case 'Attendance': return 'bg-orange-500/20 text-orange-400';
            case 'Custom': return 'bg-pink-500/20 text-pink-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const activeSchemes = schemes.filter(s => s.status === 'Active').length;
    const totalParticipants = schemes.reduce((sum, s) => sum + s.participants, 0);
    const totalPayout = schemes.reduce((sum, s) => sum + s.totalPayout, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Target className="w-8 h-8 text-green-500" />
                            Incentive Schemes
                        </h1>
                        <p className="text-gray-400 mt-1">Manage incentive programs and reward schemes</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <Plus className="w-4 h-4" />
                            New Scheme
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Active Schemes</p>
                        <p className="text-3xl font-bold text-white">{activeSchemes}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Participants</p>
                        <p className="text-3xl font-bold text-white">{totalParticipants}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Payout</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalPayout)}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Scheme Types</p>
                        <p className="text-3xl font-bold text-white">5</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search schemes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Sales">Sales</option>
                            <option value="Production">Production</option>
                            <option value="Quality">Quality</option>
                            <option value="Attendance">Attendance</option>
                            <option value="Custom">Custom</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Expired">Expired</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredSchemes.map((scheme) => (
                        <div key={scheme.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-white">{scheme.schemeName}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(scheme.status)}`}>
                                            {scheme.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">{scheme.schemeCode}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${getTypeColor(scheme.type)}`}>
                                    {scheme.type}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Applicable To</p>
                                    <p className="text-sm text-white">{scheme.applicableTo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Target</p>
                                    <p className="text-sm text-white">
                                        {scheme.targetType === 'Revenue' ? formatCurrency(scheme.targetValue) :
                                            scheme.targetType === 'Percentage' ? `${scheme.targetValue}%` :
                                                scheme.targetType === 'Days' ? `${scheme.targetValue} days` :
                                                    `${scheme.targetValue} units`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Incentive</p>
                                    <p className="text-sm text-white">
                                        {scheme.incentiveType === 'Fixed' ? formatCurrency(scheme.incentiveValue) :
                                            scheme.incentiveType === 'Percentage' ? `${scheme.incentiveValue}%` :
                                                `${formatCurrency(scheme.incentiveValue)}/unit`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Max Payout</p>
                                    <p className="text-sm text-white">{formatCurrency(scheme.maxPayout)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Users className="w-4 h-4" />
                                        {scheme.participants}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(scheme.effectiveFrom).toLocaleDateString()} - {new Date(scheme.effectiveTo).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {scheme.status === 'Active' && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-400">Payout Progress</span>
                                        <span className="text-green-400">{formatCurrency(scheme.totalPayout)}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-green-500 h-2 rounded-full"
                                            style={{ width: `${Math.min((scheme.totalPayout / scheme.maxPayout) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
