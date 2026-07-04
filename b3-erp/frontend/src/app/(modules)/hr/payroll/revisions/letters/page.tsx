'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    Send,
    Printer,
    CheckCircle,
    Clock,
    Mail
} from 'lucide-react';

interface RevisionLetter {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    revisionType: 'Annual Increment' | 'Promotion' | 'Performance' | 'Correction';
    letterDate: string;
    effectiveDate: string;
    previousCTC: number;
    newCTC: number;
    incrementPercentage: number;
    status: 'Draft' | 'Generated' | 'Sent' | 'Acknowledged';
    generatedBy: string;
    sentDate: string | null;
    acknowledgedDate: string | null;
}

export default function RevisionLettersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const [letters, setLetters] = useState<RevisionLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrPayrollService.getSalaryRevisionsBy('letters');
                const mapped: RevisionLetter[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
                if (!cancelled) setLetters(mapped);
            } catch (err) {
                if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setLetters([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredLetters = letters.filter(letter => {
        const matchesSearch = letter.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            letter.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || letter.status === statusFilter;
        const matchesType = typeFilter === 'all' || letter.revisionType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Acknowledged': return 'bg-green-500/20 text-green-400';
            case 'Sent': return 'bg-blue-500/20 text-blue-400';
            case 'Generated': return 'bg-purple-500/20 text-purple-400';
            case 'Draft': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Acknowledged': return <CheckCircle className="w-4 h-4" />;
            case 'Sent': return <Mail className="w-4 h-4" />;
            case 'Generated': return <FileText className="w-4 h-4" />;
            case 'Draft': return <Clock className="w-4 h-4" />;
            default: return null;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Annual Increment': return 'bg-green-500/20 text-green-400';
            case 'Promotion': return 'bg-purple-500/20 text-purple-400';
            case 'Performance': return 'bg-blue-500/20 text-blue-400';
            case 'Correction': return 'bg-orange-500/20 text-orange-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const draftCount = letters.filter(l => l.status === 'Draft').length;
    const sentCount = letters.filter(l => l.status === 'Sent' || l.status === 'Acknowledged').length;
    const acknowledgedCount = letters.filter(l => l.status === 'Acknowledged').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
                {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-8 h-8 text-indigo-500" />
                            Revision Letters
                        </h1>
                        <p className="text-gray-400 mt-1">Generate and manage salary revision letters</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                            <FileText className="w-4 h-4" />
                            Generate Bulk
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                        <p className="text-indigo-400 text-sm">Total Letters</p>
                        <p className="text-3xl font-bold text-white">{letters.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Draft</p>
                        <p className="text-3xl font-bold text-white">{draftCount}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Sent</p>
                        <p className="text-3xl font-bold text-white">{sentCount}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Acknowledged</p>
                        <p className="text-3xl font-bold text-white">{acknowledgedCount}</p>
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Annual Increment">Annual Increment</option>
                            <option value="Promotion">Promotion</option>
                            <option value="Performance">Performance</option>
                            <option value="Correction">Correction</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Generated">Generated</option>
                            <option value="Sent">Sent</option>
                            <option value="Acknowledged">Acknowledged</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Type</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Letter Date</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Previous CTC</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">New CTC</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Increment</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLetters.map((letter) => (
                                    <tr key={letter.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {letter.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{letter.employeeName}</p>
                                                    <p className="text-xs text-gray-400">{letter.employeeId} • {letter.department}</p>
                                                    <p className="text-xs text-gray-500">{letter.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs ${getTypeColor(letter.revisionType)}`}>
                                                {letter.revisionType}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-gray-300 text-sm">
                                            {new Date(letter.letterDate).toLocaleDateString()}
                                            <p className="text-xs text-gray-500">Eff: {new Date(letter.effectiveDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="p-4 text-right text-gray-300">{formatCurrency(letter.previousCTC)}</td>
                                        <td className="p-4 text-right text-green-400 font-medium">{formatCurrency(letter.newCTC)}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
                                                +{letter.incrementPercentage}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(letter.status)}`}>
                                                {getStatusIcon(letter.status)}
                                                {letter.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                {(letter.status === 'Generated' || letter.status === 'Draft') && (
                                                    <button className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded">
                                                        <Send className="w-4 h-4" />
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
