'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    MessageSquare,
    User,
    ArrowRight
} from 'lucide-react';
import { LeaveService } from '@/services/leave.service';

interface LeaveRequest {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    status: 'Pending' | 'Level 1 Approved' | 'Level 2 Approved' | 'Approved' | 'Rejected';
    reason: string;
    appliedDate: string;
    approvalSteps: ApprovalStep[];
}

interface ApprovalStep {
    level: number;
    approverName: string;
    approverRole: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
    remarks: string;
}

export default function LeaveStatusPage() {
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Backend (GET /hr/leave-applications) returns raw LeaveApplication rows.
                const raw = (await LeaveService.getLeaveApplications()) as any[];
                const mapped: LeaveRequest[] = (raw ?? []).map((la) => {
                    const approverStep: ApprovalStep | null = la.approverName || la.approvedBy
                        ? {
                            level: 1,
                            approverName: la.approverName ?? la.approvedBy ?? '',
                            approverRole: 'Approver',
                            status: (la.status === 'Approved' ? 'Approved'
                                : la.status === 'Rejected' ? 'Rejected' : 'Pending') as ApprovalStep['status'],
                            date: la.approvedAt ?? '',
                            remarks: la.rejectionReason ?? '',
                        }
                        : null;
                    return {
                        id: String(la.applicationNumber ?? la.id ?? ''),
                        leaveType: la.leaveTypeName ?? la.leaveType?.name ?? '',
                        startDate: la.startDate ?? '',
                        endDate: la.endDate ?? '',
                        days: Number(la.totalDays ?? 0),
                        status: (la.status ?? 'Pending') as LeaveRequest['status'],
                        reason: la.reason ?? '',
                        appliedDate: la.appliedAt ?? la.createdAt ?? '',
                        approvalSteps: approverStep ? [approverStep] : [],
                    };
                });
                if (!cancelled) setLeaveRequests(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load leave requests');
                    setLeaveRequests([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Level 1 Approved':
            case 'Level 2 Approved':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getStepStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-green-500 text-white';
            case 'Rejected': return 'bg-red-500 text-white';
            case 'Pending': return 'bg-gray-600 text-gray-300';
            default: return 'bg-gray-500 text-gray-300';
        }
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <CheckCircle className="w-5 h-5" />;
            case 'Rejected': return <XCircle className="w-5 h-5" />;
            case 'Pending': return <Clock className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
        }
    };

    const stats = {
        pending: leaveRequests.filter(r => r.status === 'Pending' || r.status.includes('Level')).length,
        approved: leaveRequests.filter(r => r.status === 'Approved').length,
        rejected: leaveRequests.filter(r => r.status === 'Rejected').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Clock className="w-8 h-8 text-yellow-500" />
                            Leave Status
                        </h1>
                        <p className="text-gray-400 mt-1">Track your leave request approval status</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">In Progress</p>
                        <p className="text-3xl font-bold text-white">{stats.pending}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Fully Approved</p>
                        <p className="text-3xl font-bold text-white">{stats.approved}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Rejected</p>
                        <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400/40 border-t-yellow-400" />
                        Loading leave requests…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && leaveRequests.length === 0 && (
                    <div className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-sm text-gray-400">
                        No leave requests found.
                    </div>
                )}

                <div className="space-y-3">
                    {leaveRequests.map((request) => (
                        <div key={request.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            <div
                                className="p-6 cursor-pointer hover:bg-gray-700/30 transition-colors"
                                onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-mono text-gray-400">{request.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{request.leaveType}</h3>
                                        <p className="text-gray-400 mt-1">{request.reason}</p>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                            <div className="flex items-center gap-1 text-gray-300">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-300">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                {request.days} day(s)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {request.approvalSteps.map((step, index) => (
                                            <React.Fragment key={step.level}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepStatusColor(step.status)}`}>
                                                    {getStepIcon(step.status)}
                                                </div>
                                                {index < request.approvalSteps.length - 1 && (
                                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {expandedRequest === request.id && (
                                <div className="border-t border-gray-700 p-6 bg-gray-700/20">
                                    <h4 className="text-white font-medium mb-4">Approval Workflow</h4>
                                    <div className="space-y-4">
                                        {request.approvalSteps.map((step, index) => (
                                            <div key={step.level} className="flex items-start gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStepStatusColor(step.status)}`}>
                                                        {getStepIcon(step.status)}
                                                    </div>
                                                    {index < request.approvalSteps.length - 1 && (
                                                        <div className="w-0.5 h-12 bg-gray-600 mt-2"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 pb-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white font-medium">Level {step.level}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs ${getStepStatusColor(step.status)}`}>
                                                            {step.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-300">{step.approverName}</span>
                                                        <span className="text-gray-500">({step.approverRole})</span>
                                                    </div>
                                                    {step.date && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {step.status} on {new Date(step.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {step.remarks && (
                                                        <div className="mt-2 p-3 bg-gray-700/50 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                                                <p className="text-sm text-gray-300 italic">&quot;{step.remarks}&quot;</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
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
