'use client';

import React, { useState, useEffect } from 'react';
import { workflowPendingApprovalService } from '@/services/workflow-pending-approval.service';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Eye,
    ChevronRight,
    FileText,
    ShoppingCart,
    DollarSign,
    Users,
    Package,
    Truck,
    AlertTriangle,
    Calendar,
    User,
    MessageSquare,
    ArrowUpRight,
    CheckSquare
} from 'lucide-react';
import Link from 'next/link';

interface PendingApproval {
    id: string;
    referenceNo: string;
    title: string;
    description: string;
    module: string;
    moduleIcon: React.ElementType;
    moduleUrl: string;
    requestedBy: string;
    requestedAt: string;
    amount?: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string;
    slaStatus: 'on-track' | 'warning' | 'overdue';
    step: string;
    totalSteps: number;
    currentStep: number;
}

const COMPANY_ID = 'company-001';

// Map a module name (string from the API) to its lucide icon.
const moduleIconFor = (module?: string): React.ElementType => {
    switch ((module || '').toLowerCase()) {
        case 'procurement': return ShoppingCart;
        case 'sales': return FileText;
        case 'finance': return DollarSign;
        case 'hr': return Users;
        case 'logistics': return Truck;
        case 'inventory': return Package;
        default: return FileText;
    }
};

export default function PendingApprovalsPage() {
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setIsLoading(true);
                setLoadError(null);
                const rows = await workflowPendingApprovalService.findAll(COMPANY_ID);
                if (!active) return;
                const mapped: PendingApproval[] = rows.map((r) => ({
                    id: r.id,
                    referenceNo: r.referenceNo ?? '',
                    title: r.title ?? '',
                    description: r.description ?? '',
                    module: r.module ?? '',
                    moduleIcon: moduleIconFor(r.module),
                    moduleUrl: r.moduleUrl ?? '#',
                    requestedBy: r.requestedBy ?? '',
                    requestedAt: r.requestedAt ?? '',
                    amount: r.amount != null ? Number(r.amount) : undefined,
                    priority: (r.priority ?? 'medium') as PendingApproval['priority'],
                    dueDate: r.dueDate ?? undefined,
                    slaStatus: (r.slaStatus ?? 'on-track') as PendingApproval['slaStatus'],
                    step: r.step ?? '',
                    totalSteps: Number(r.totalSteps ?? 1),
                    currentStep: Number(r.currentStep ?? 1),
                }));
                setApprovals(mapped);
            } catch (err) {
                if (!active) return;
                setLoadError(
                    err instanceof Error ? err.message : 'Failed to load approvals',
                );
            } finally {
                if (active) setIsLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const stats = {
        total: approvals.length,
        onTrack: approvals.filter((a) => a.slaStatus === 'on-track').length,
        warning: approvals.filter((a) => a.slaStatus === 'warning').length,
        overdue: approvals.filter((a) => a.slaStatus === 'overdue').length,
        critical: approvals.filter((a) => a.priority === 'critical').length,
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getSLAIndicator = (slaStatus: string) => {
        switch (slaStatus) {
            case 'on-track':
                return <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><CheckCircle2 className="w-3 h-3" /> On Track</span>;
            case 'warning':
                return <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600"><Clock className="w-3 h-3" /> Due Soon</span>;
            case 'overdue':
                return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600"><AlertTriangle className="w-3 h-3" /> Overdue</span>;
            default:
                return null;
        }
    };

    const filteredApprovals = approvals.filter(approval => {
        if (filter === 'critical') return approval.priority === 'critical';
        if (filter === 'overdue') return approval.slaStatus === 'overdue';
        if (filter === 'warning') return approval.slaStatus === 'warning';
        return true;
    });

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                                Review and process approval requests
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                            <CheckSquare className="w-4 h-4" /> Approve Selected
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && (
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
                        Loading pending approvals...
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-sm text-red-700">
                        {loadError}
                    </div>
                )}
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pending</p>
                                <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Clock className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">On Track</p>
                                <p className="text-3xl font-black text-green-600 mt-1 italic tracking-tighter">{stats.onTrack}</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Due Soon</p>
                                <p className="text-3xl font-black text-yellow-600 mt-1 italic tracking-tighter">{stats.warning}</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Overdue</p>
                                <p className="text-3xl font-black text-red-600 mt-1 italic tracking-tighter">{stats.overdue}</p>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Critical</p>
                                <p className="text-3xl font-black text-white mt-1 italic tracking-tighter">{stats.critical}</p>
                            </div>
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { id: 'all', label: 'All', count: stats.total },
                                { id: 'critical', label: 'Critical', count: stats.critical },
                                { id: 'overdue', label: 'Overdue', count: stats.overdue },
                                { id: 'warning', label: 'Due Soon', count: stats.warning }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilter(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${filter === tab.id
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${filter === tab.id ? 'bg-orange-500' : 'bg-gray-200'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search approvals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Approvals List */}
                <div className="space-y-3">
                    {filteredApprovals.map((approval) => {
                        const ModuleIcon = approval.moduleIcon;
                        return (
                            <Link key={approval.id} href={approval.moduleUrl} className="block">
                                <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group ${approval.slaStatus === 'overdue' ? 'border-red-200 bg-red-50/30' :
                                        approval.priority === 'critical' ? 'border-orange-200' : 'border-gray-100'
                                    }`}>
                                    <div className="p-4">
                                        <div className="flex items-start gap-2">
                                            {/* Checkbox */}
                                            <div className="pt-1">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>

                                            {/* Module Icon */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${approval.priority === 'critical' ? 'bg-red-100 text-red-600' :
                                                    approval.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                <ModuleIcon className="w-6 h-6" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getPriorityStyles(approval.priority)}`}>
                                                        {approval.priority}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600">
                                                        {approval.module}
                                                    </span>
                                                    {getSLAIndicator(approval.slaStatus)}
                                                </div>

                                                <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                                                    {approval.title}
                                                </h3>
                                                <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-1">{approval.description}</p>

                                                <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> {approval.referenceNo}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" /> {approval.requestedBy}
                                                    </span>
                                                    {approval.dueDate && (
                                                        <span className={`flex items-center gap-1 ${approval.slaStatus === 'overdue' ? 'text-red-500 font-bold' : ''}`}>
                                                            <Calendar className="w-3 h-3" /> Due: {approval.dueDate}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Approval Progress */}
                                                <div className="mt-3 flex items-center gap-3">
                                                    <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-orange-500 rounded-full"
                                                            style={{ width: `${(approval.currentStep / approval.totalSteps) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        Step {approval.currentStep}/{approval.totalSteps}: {approval.step}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Amount & Actions */}
                                            <div className="text-right flex-shrink-0">
                                                {approval.amount && (
                                                    <p className="text-lg font-black text-gray-900 italic tracking-tighter">
                                                        ${approval.amount.toLocaleString()}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-1.5 bg-green-100 rounded-lg text-green-600 hover:bg-green-200"
                                                        onClick={(e) => { e.preventDefault(); alert('Approved!'); }}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 bg-red-100 rounded-lg text-red-600 hover:bg-red-200"
                                                        onClick={(e) => { e.preventDefault(); alert('Rejected!'); }}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200"
                                                        onClick={(e) => { e.preventDefault(); }}
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Chevron */}
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                        <h4 className="text-xs font-black text-red-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Requires Immediate Action
                        </h4>
                        <p className="text-[11px] text-red-700">
                            1 approval is overdue and 2 are marked as critical priority. Please review these immediately.
                        </p>
                        <button className="mt-3 text-[10px] font-black text-red-800 uppercase tracking-widest flex items-center gap-1 hover:text-red-900">
                            View Critical Items <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> SLA Compliance
                        </h4>
                        <p className="text-[11px] text-blue-700">
                            Average approval time: 1.8 days. 2 items are approaching SLA deadline within 24 hours.
                        </p>
                        <button className="mt-3 text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 hover:text-blue-900">
                            View SLA Report <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
