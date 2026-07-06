'use client';

import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Search,
    Filter,
    Calendar,
    Clock,
    Users,
    TrendingUp,
    Download,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { TimesheetService } from '@/services/timesheet.service';

interface ProjectHours {
    id: string;
    projectName: string;
    projectCode: string;
    client: string;
    status: 'Active' | 'On Hold' | 'Completed';
    budgetHours: number;
    usedHours: number;
    remainingHours: number;
    teamSize: number;
    startDate: string;
    endDate: string;
    tasks: TaskHours[];
}

interface TaskHours {
    taskName: string;
    assignedTo: string;
    hours: number;
}

export default function ProjectHoursPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
    const [selectedMonth, setSelectedMonth] = useState('2025-01');

    const [projects, setProjects] = useState<ProjectHours[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await TimesheetService.getTimesheets();
                const mapped: ProjectHours[] = (Array.isArray(raw) ? raw : []).map((r: any, i: number) => {
                    const budgetHours = r?.budgetHours ?? 0;
                    const usedHours = r?.usedHours ?? 0;
                    return {
                        id: String(r?.id ?? i),
                        projectName: r?.projectName ?? '',
                        projectCode: r?.projectCode ?? '',
                        client: r?.client ?? '',
                        status: (r?.status as ProjectHours['status']) ?? 'Active',
                        budgetHours,
                        usedHours,
                        remainingHours: r?.remainingHours ?? Math.max(0, budgetHours - usedHours),
                        teamSize: r?.teamSize ?? 0,
                        startDate: r?.startDate ?? '',
                        endDate: r?.endDate ?? '',
                        tasks: Array.isArray(r?.tasks) ? r.tasks.map((t: any) => ({
                            taskName: t?.taskName ?? '',
                            assignedTo: t?.assignedTo ?? '',
                            hours: t?.hours ?? 0,
                        })) : [],
                    };
                });
                if (!cancelled) setProjects(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setProjects([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const toggleExpand = (id: string) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'On Hold': return 'bg-yellow-500/20 text-yellow-400';
            case 'Completed': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getProgressColor = (used: number, budget: number) => {
        const percentage = (used / budget) * 100;
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const totalStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'Active').length,
        totalBudgetHours: projects.reduce((sum, p) => sum + p.budgetHours, 0),
        totalUsedHours: projects.reduce((sum, p) => sum + p.usedHours, 0)
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Briefcase className="w-8 h-8 text-blue-500" />
                            Project Hours
                        </h1>
                        <p className="text-gray-400 mt-1">Track time spent on projects</p>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Projects</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalProjects}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Active Projects</p>
                        <p className="text-3xl font-bold text-white">{totalStats.activeProjects}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Budget Hours</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalBudgetHours}h</p>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Hours Used</p>
                        <p className="text-3xl font-bold text-white">{totalStats.totalUsedHours}h</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {totalStats.totalBudgetHours > 0 ? Math.round((totalStats.totalUsedHours / totalStats.totalBudgetHours) * 100) : 0}% of budget
                        </p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredProjects.map((project) => {
                        const isExpanded = expandedProjects.has(project.id);
                        const usagePercentage = Math.round((project.usedHours / project.budgetHours) * 100);

                        return (
                            <div key={project.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all">
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => toggleExpand(project.id)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold text-white">{project.projectName}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="font-mono">{project.projectCode}</span>
                                                    <span>Client: {project.client}</span>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" />
                                                        {project.teamSize} members
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-400">Hours Used</p>
                                                <p className="text-2xl font-bold text-white">
                                                    {project.usedHours}
                                                    <span className="text-sm text-gray-400 font-normal">/{project.budgetHours}h</span>
                                                </p>
                                            </div>
                                            <div className="w-32">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-400">Progress</span>
                                                    <span className={`font-medium ${usagePercentage >= 90 ? 'text-red-400' : usagePercentage >= 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                        {usagePercentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getProgressColor(project.usedHours, project.budgetHours)}`}
                                                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="border-t border-gray-700 p-6 bg-gray-700/20">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    Project Timeline
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Start Date</span>
                                                        <span className="text-white">{new Date(project.startDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">End Date</span>
                                                        <span className="text-white">{new Date(project.endDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-400">Remaining Hours</span>
                                                        <span className="text-green-400 font-medium">{project.remainingHours}h</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                    Task Breakdown
                                                </h4>
                                                <div className="space-y-2">
                                                    {project.tasks.map((task, index) => (
                                                        <div key={index} className="flex items-center justify-between text-sm">
                                                            <div>
                                                                <span className="text-white">{task.taskName}</span>
                                                                <span className="text-gray-500 ml-2">({task.assignedTo})</span>
                                                            </div>
                                                            <span className="text-blue-400 font-medium">{task.hours}h</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
