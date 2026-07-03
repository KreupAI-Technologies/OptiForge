'use client';

import React, { useState, useEffect } from 'react';
import {
    Inbox,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronRight,
    Search,
    Filter,
    RefreshCw,
    FileText,
    ShoppingCart,
    Truck,
    Users,
    DollarSign,
    Package,
    ClipboardCheck,
    Calendar,
    User,
    MoreVertical,
    Eye,
    CheckSquare,
    XCircle,
    ArrowUpRight,
    Zap
} from 'lucide-react';
import Link from 'next/link';
import { WorkflowService } from '@/services/workflow.service';
import { useAuth } from '@/context/AuthContext';

// Map a backend module string to a display icon.
const MODULE_ICONS: Record<string, React.ElementType> = {
    procurement: ShoppingCart,
    purchase: ShoppingCart,
    sales: FileText,
    crm: FileText,
    logistics: Truck,
    shipping: Truck,
    hr: Users,
    finance: DollarSign,
    quality: ClipboardCheck,
    inventory: Package,
    project: ClipboardCheck,
};

const iconForModule = (module?: string): React.ElementType => {
    if (!module) return FileText;
    const key = module.toLowerCase();
    return MODULE_ICONS[key] ?? FileText;
};

interface UserTask {
    id: string;
    taskType: 'approval' | 'action' | 'review';
    title: string;
    description: string;
    module: string;
    moduleIcon: React.ElementType;
    moduleUrl: string;
    referenceNumber: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'in-progress' | 'completed';
    createdAt: string;
    dueDate?: string;
    slaStatus?: 'on-track' | 'warning' | 'breached';
    requester: string;
    amount?: number;
}

interface TaskCounts {
    total: number;
    pending: number;
    inProgress: number;
    overdue: number;
    critical: number;
}

const EMPTY_COUNTS: TaskCounts = {
    total: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    critical: 0,
};

export default function TaskInbox() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [counts, setCounts] = useState<TaskCounts>(EMPTY_COUNTS);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let cancelled = false;
        const userId = user?.id;
        if (!userId) {
            // No authenticated user yet; keep loading until one is available.
            return;
        }
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Backend returns raw UserTask rows (module/moduleUrl/referenceNumber/
                // assignedBy/slaStatus). Map defensively to the page model.
                const [rawTasks, rawCounts] = await Promise.all([
                    WorkflowService.getTaskInbox(userId) as Promise<any[]>,
                    WorkflowService.getTaskCounts(userId) as Promise<Record<string, number>>,
                ]);
                const mapped: UserTask[] = (rawTasks ?? []).map((t) => ({
                    id: String(t.id ?? ''),
                    taskType: (t.taskType ?? 'action') as UserTask['taskType'],
                    title: t.title ?? '',
                    description: t.description ?? '',
                    module: t.module ?? '',
                    moduleIcon: iconForModule(t.module),
                    moduleUrl: t.moduleUrl ?? '#',
                    referenceNumber: t.referenceNumber ?? '',
                    priority: (t.priority ?? 'medium') as UserTask['priority'],
                    status: (t.status ?? 'pending') as UserTask['status'],
                    createdAt: t.createdAt ?? '',
                    dueDate: t.dueDate ?? undefined,
                    slaStatus: t.slaStatus ?? undefined,
                    requester: t.assignedBy ?? t.requester ?? '',
                    amount: t.metadata?.amount ?? t.amount ?? undefined,
                }));
                const c = rawCounts ?? {};
                const derivedCounts: TaskCounts = {
                    total: Number(c.total ?? 0),
                    pending: Number(c.pending ?? 0),
                    inProgress: Number(c.inProgress ?? 0),
                    overdue: Number(c.overdue ?? 0),
                    critical: Number(c.critical ?? 0),
                };
                if (!cancelled) {
                    setTasks(mapped);
                    setCounts(derivedCounts);
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load task inbox');
                    setTasks([]);
                    setCounts(EMPTY_COUNTS);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTaskTypeStyles = (type: string) => {
        switch (type) {
            case 'approval': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'action': return 'bg-green-50 text-green-600 border-green-200';
            case 'review': return 'bg-blue-50 text-blue-600 border-blue-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getSLAIndicator = (slaStatus?: string) => {
        if (!slaStatus) return null;
        switch (slaStatus) {
            case 'on-track':
                return <span className="flex items-center gap-1 text-[10px] font-bold text-green-600"><CheckCircle2 className="w-3 h-3" /> On Track</span>;
            case 'warning':
                return <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600"><Clock className="w-3 h-3" /> Due Soon</span>;
            case 'breached':
                return <span className="flex items-center gap-1 text-[10px] font-bold text-red-600"><AlertTriangle className="w-3 h-3" /> Overdue</span>;
            default:
                return null;
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'pending') return task.status === 'pending';
        if (activeTab === 'overdue') return task.slaStatus === 'breached';
        if (activeTab === 'critical') return task.priority === 'critical';
        return true;
    });

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="px-3 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Inbox className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Task Inbox</h1>
                            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest leading-none">
                                Manage pending tasks and approvals
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                            <Zap className="w-4 h-4" /> Process All
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading task inbox…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertTriangle className="w-4 h-4" />
                        {loadError}
                    </div>
                )}
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Tasks</p>
                                <p className="text-3xl font-black text-gray-900 mt-1 italic tracking-tighter">{counts.total}</p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Inbox className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pending</p>
                                <p className="text-3xl font-black text-blue-600 mt-1 italic tracking-tighter">{counts.pending}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">In Progress</p>
                                <p className="text-3xl font-black text-yellow-600 mt-1 italic tracking-tighter">{counts.inProgress}</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-lg">
                                <RefreshCw className="w-5 h-5 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Overdue</p>
                                <p className="text-3xl font-black text-red-600 mt-1 italic tracking-tighter">{counts.overdue}</p>
                            </div>
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Critical</p>
                                <p className="text-3xl font-black text-white mt-1 italic tracking-tighter">{counts.critical}</p>
                            </div>
                            <div className="p-2 bg-gray-800 rounded-lg">
                                <Zap className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { id: 'all', label: 'All Tasks', count: counts.total },
                                { id: 'pending', label: 'Pending', count: counts.pending },
                                { id: 'overdue', label: 'Overdue', count: counts.overdue },
                                { id: 'critical', label: 'Critical', count: counts.critical }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === tab.id
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] ${activeTab === tab.id ? 'bg-orange-500' : 'bg-gray-200'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-gray-900 font-bold text-lg mb-1">You're all caught up! 🎉</p>
                            <p className="text-gray-500 text-sm">No tasks found in this category</p>
                        </div>
                    ) : (
                        filteredTasks.map((task) => {
                            const ModuleIcon = task.moduleIcon;
                            return (
                                <Link key={task.id} href={task.moduleUrl} className="block">
                                    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer group ${task.slaStatus === 'breached' ? 'border-red-200 bg-red-50/30' :
                                            task.priority === 'critical' ? 'border-orange-200' : 'border-gray-100'
                                        }`}>
                                        <div className="p-4">
                                            <div className="flex items-start gap-2">
                                                {/* Module Icon */}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${task.priority === 'critical' ? 'bg-red-100 text-red-600' :
                                                        task.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    <ModuleIcon className="w-6 h-6" />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getPriorityStyles(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getTaskTypeStyles(task.taskType)}`}>
                                                            {task.taskType}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-600">
                                                            {task.module}
                                                        </span>
                                                        {getSLAIndicator(task.slaStatus)}
                                                    </div>

                                                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-1">{task.description}</p>

                                                    <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> {task.referenceNumber}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" /> {task.requester}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span className={`flex items-center gap-1 ${task.slaStatus === 'breached' ? 'text-red-500 font-bold' : ''}`}>
                                                                <Calendar className="w-3 h-3" /> Due: {task.dueDate}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {task.createdAt}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Amount & Actions */}
                                                <div className="text-right flex-shrink-0">
                                                    {task.amount && (
                                                        <p className="text-lg font-black text-gray-900 italic tracking-tighter">
                                                            ${task.amount.toLocaleString()}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-1.5 bg-green-100 rounded-lg text-green-600 hover:bg-green-200" onClick={(e) => e.preventDefault()}>
                                                            <CheckSquare className="w-3 h-3" />
                                                        </button>
                                                        <button className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:bg-gray-200" onClick={(e) => e.preventDefault()}>
                                                            <Eye className="w-3 h-3" />
                                                        </button>
                                                        <button className="p-1.5 bg-red-100 rounded-lg text-red-600 hover:bg-red-200" onClick={(e) => e.preventDefault()}>
                                                            <XCircle className="w-3 h-3" />
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
                        })
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                        <h4 className="text-xs font-black text-orange-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Urgent Attention
                        </h4>
                        <p className="text-[11px] text-orange-700">
                            2 tasks are overdue and require immediate attention. Customer quotation and quality inspection deadlines have passed.
                        </p>
                        <button className="mt-3 text-[10px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-1 hover:text-orange-900">
                            View Overdue Tasks <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Due Today
                        </h4>
                        <p className="text-[11px] text-blue-700">
                            3 tasks are due today. Review and process them before end of business to maintain SLA compliance.
                        </p>
                        <button className="mt-3 text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 hover:text-blue-900">
                            View Today's Tasks <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
