'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
    Hammer,
    CheckCircle,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    FileText,
    Image as ImageIcon,
    ArrowLeft,
    TrendingUp,
    XCircle,
} from 'lucide-react';

interface TrialInstallation {
    id: string;
    woNumber: string;
    productName: string;
    installationType: 'Wall Cabinet' | 'Base Cabinet' | 'Full Kitchen' | 'Partition' | 'Other';
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Issues Found';
    scheduledDate: string;
    completionDate?: string;
    supervisor: string;
    location: string;
    checklist: {
        id: string;
        item: string;
        status: 'Pass' | 'Fail' | 'Pending';
        notes?: string;
    }[];
    issuesFound: number;
    approved: boolean;
    notes?: string;
}

export default function TrialInstallationPage() {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedTrial, setSelectedTrial] = useState<TrialInstallation | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Trial installations loaded from the NestJS backend (production/trial-installations).
    const [trials, setTrials] = useState<TrialInstallation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = (await ProductionOrphanService.getTrialInstallations()) as any[];
                const mapped: TrialInstallation[] = (Array.isArray(raw) ? raw : []).map((d: any, i: number) => ({
                    id: String(d?.id ?? i),
                    woNumber: d?.woNumber ?? '',
                    productName: d?.productName ?? '',
                    installationType: d?.installationType ?? 'Other',
                    status: d?.status ?? 'Scheduled',
                    scheduledDate: d?.scheduledDate ?? '',
                    completionDate: d?.completionDate ?? undefined,
                    supervisor: d?.supervisor ?? '',
                    location: d?.location ?? '',
                    checklist: Array.isArray(d?.checklist) ? d.checklist : [],
                    issuesFound: Number(d?.issuesFound ?? 0),
                    approved: Boolean(d?.approved),
                    notes: d?.notes ?? undefined,
                }));
                if (!cancelled) setTrials(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load trial installations');
                    setTrials([]);
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

    const filteredTrials = trials.filter((trial) => {
        return filterStatus === 'all' || trial.status === filterStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'In Progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Scheduled':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Issues Found':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return CheckCircle;
            case 'In Progress':
                return TrendingUp;
            case 'Scheduled':
                return Clock;
            case 'Issues Found':
                return AlertTriangle;
            default:
                return FileText;
        }
    };

    const getCheckStatus = (status: string) => {
        switch (status) {
            case 'Pass':
                return { color: 'text-green-600', icon: CheckCircle };
            case 'Fail':
                return { color: 'text-red-600', icon: XCircle };
            case 'Pending':
                return { color: 'text-gray-500', icon: Clock };
            default:
                return { color: 'text-gray-500', icon: FileText };
        }
    };

    const stats = {
        total: trials.length,
        completed: trials.filter((t) => t.status === 'Completed').length,
        inProgress: trials.filter((t) => t.status === 'In Progress').length,
        issuesFound: trials.reduce((sum, t) => sum + t.issuesFound, 0),
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/production/work-orders"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Trial Wall Installation System</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Trial installation records and quality verification before client delivery
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Trials</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Hammer className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Completed</p>
                                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600">In Progress</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-600">Issues Found</p>
                                <p className="text-2xl font-bold text-red-900">{stats.issuesFound}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Issues Found">Issues Found</option>
                        </select>
                    </div>
                </div>

                {/* Load states */}
                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading trial installations…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && filteredTrials.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        No trial installations found.
                    </div>
                )}

                {/* Trials List */}
                <div className="grid grid-cols-1 gap-2">
                    {filteredTrials.map((trial) => {
                        const StatusIcon = getStatusIcon(trial.status);
                        const passedChecks = trial.checklist.filter((c) => c.status === 'Pass').length;
                        const totalChecks = trial.checklist.length;
                        const progress = (passedChecks / totalChecks) * 100;

                        return (
                            <div key={trial.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow">
                                <div className="flex items-start gap-2">
                                    {/* Icon */}
                                    <div className={`w-16 h-16 rounded-lg ${trial.approved ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center flex-shrink-0`}>
                                        <Hammer className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{trial.productName}</h3>
                                                <p className="text-sm text-gray-600">{trial.woNumber} - {trial.installationType}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 border ${getStatusColor(trial.status)}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {trial.status}
                                                </span>
                                                {trial.approved && (
                                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Approved
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Supervisor</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {trial.supervisor}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="font-medium text-gray-900">{trial.location}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Scheduled Date</p>
                                                <p className="font-medium text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {trial.scheduledDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Issues Found</p>
                                                <p className={`font-medium ${trial.issuesFound > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {trial.issuesFound > 0 ? `${trial.issuesFound} issues` : 'No issues'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Checklist Progress */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    Checklist: {passedChecks} / {totalChecks} passed ({progress.toFixed(0)}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className={`h-2.5 rounded-full ${trial.approved ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-blue-500 to-purple-600'}`}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Checklist Details */}
                                        <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-2">
                                            <p className="text-xs font-semibold text-gray-700 mb-2">Quality Checklist:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {trial.checklist.map((check) => {
                                                    const checkStatus = getCheckStatus(check.status);
                                                    const CheckIcon = checkStatus.icon;
                                                    return (
                                                        <div key={check.id} className="flex items-start gap-2 text-xs">
                                                            <CheckIcon className={`w-4 h-4 ${checkStatus.color} mt-0.5 flex-shrink-0`} />
                                                            <div>
                                                                <span className={checkStatus.color}>{check.item}</span>
                                                                {check.notes && <p className="text-gray-500 italic mt-0.5">{check.notes}</p>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {trial.notes && (
                                            <div className={`border rounded p-2 text-sm ${trial.approved ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                                                <strong>Trial Report:</strong> {trial.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                        <Hammer className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-amber-900">Trial Installation Process (Steps 5.12 & 5.13)</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                <strong>Step 5.12:</strong> Conduct trial wall installation to verify dimensions, fit, finish, and functionality.
                                <br />
                                <strong>Step 5.13:</strong> Report trial results with issues found and supervisor sign-off. All items must pass before client delivery.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
