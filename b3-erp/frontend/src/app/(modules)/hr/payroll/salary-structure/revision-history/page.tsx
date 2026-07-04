'use client';

import React, { useState, useEffect } from 'react';
import {
    History,
    Search,
    Filter,
    Download,
    Eye,
    TrendingUp,
    Calendar,
    User
} from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface RevisionHistory {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    revisionType: 'Increment' | 'Promotion' | 'Correction' | 'New Joining';
    previousCTC: number;
    newCTC: number;
    incrementPercentage: number;
    previousGrade: string;
    newGrade: string;
    effectiveDate: string;
    approvedBy: string;
    approvedDate: string;
    remarks: string;
}

export default function RevisionHistoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('2025');

    const [revisions, setRevisions] = useState<RevisionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getSalaryRevisionsBy('history');
          const mapped: RevisionHistory[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setRevisions(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setRevisions([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredRevisions = revisions.filter(revision => {
        const matchesSearch = revision.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            revision.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || revision.revisionType === typeFilter;
        const matchesYear = revision.effectiveDate.startsWith(yearFilter);
        return matchesSearch && matchesType && matchesYear;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Increment': return 'bg-green-500/20 text-green-400';
            case 'Promotion': return 'bg-blue-500/20 text-blue-400';
            case 'Correction': return 'bg-yellow-500/20 text-yellow-400';
            case 'New Joining': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const formatCurrency = (value: number) => {
        if (value === 0) return '-';
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const totalIncrements = filteredRevisions.filter(r => r.revisionType === 'Increment' || r.revisionType === 'Promotion').length;
    const avgIncrement = filteredRevisions.filter(r => r.incrementPercentage > 0).reduce((sum, r) => sum + r.incrementPercentage, 0) / (filteredRevisions.filter(r => r.incrementPercentage > 0).length || 1);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <History className="w-8 h-8 text-blue-500" />
                            Revision History
                        </h1>
                        <p className="text-gray-400 mt-1">Track salary structure revisions</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Revisions</p>
                        <p className="text-3xl font-bold text-white">{filteredRevisions.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Increments/Promotions</p>
                        <p className="text-3xl font-bold text-white">{totalIncrements}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">New Joinings</p>
                        <p className="text-3xl font-bold text-white">{filteredRevisions.filter(r => r.revisionType === 'New Joining').length}</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Avg. Increment</p>
                        <p className="text-3xl font-bold text-white">{avgIncrement.toFixed(1)}%</p>
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
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Increment">Increment</option>
                            <option value="Promotion">Promotion</option>
                            <option value="Correction">Correction</option>
                            <option value="New Joining">New Joining</option>
                        </select>
                        <select
                            value={yearFilter}
                            onChange={(e) => setYearFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredRevisions.map((revision) => (
                        <div key={revision.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {revision.employeeName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-white">{revision.employeeName}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs ${getTypeColor(revision.revisionType)}`}>
                                                {revision.revisionType}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">{revision.employeeId} • {revision.department}</p>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400">CTC:</span>
                                                <span className="text-red-400 line-through">{formatCurrency(revision.previousCTC)}</span>
                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                                <span className="text-green-400 font-medium">{formatCurrency(revision.newCTC)}</span>
                                            </div>
                                            {revision.incrementPercentage > 0 && (
                                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                                                    +{revision.incrementPercentage.toFixed(1)}%
                                                </span>
                                            )}
                                            {revision.previousGrade !== revision.newGrade && revision.previousGrade !== '-' && (
                                                <span className="text-gray-400">
                                                    Grade: {revision.previousGrade} → {revision.newGrade}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-sm text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4" />
                                        Effective: {new Date(revision.effectiveDate).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <User className="w-3 h-3" />
                                        Approved by {revision.approvedBy}
                                    </div>
                                    <p className="text-xs text-gray-500 italic mt-2">&quot;{revision.remarks}&quot;</p>
                                    <button className="mt-2 flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm">
                                        <Eye className="w-4 h-4" /> View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
