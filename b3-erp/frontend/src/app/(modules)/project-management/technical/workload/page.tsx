'use client';

import React, { useEffect, useState } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Clock,
    User,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    ArrowUpRight,
    Search,
    Filter
} from 'lucide-react';

interface Task {
    id: string;
    name: string;
    project: string;
    assignee: string;
    targetDate: string;
    status: 'In Progress' | 'Completed' | 'Pending Review' | 'Delayed';
    progress: number;
}

const mockTasks: Task[] = [
    {
        id: '1',
        name: 'Main Cabinet Structural Design',
        project: 'Industrial Kitchen 2026-B',
        assignee: 'Alice Engineer',
        targetDate: '2026-02-10',
        status: 'In Progress',
        progress: 65
    },
    {
        id: '2',
        name: 'Ventilation Ducting Specs',
        project: 'Dubai Mall Food Court',
        assignee: 'Bob Designer',
        targetDate: '2026-02-05',
        status: 'Delayed',
        progress: 30
    },
    {
        id: '3',
        name: 'Electrical Layout v2',
        project: 'Hotel Ritz Riyadh',
        assignee: 'Alice Engineer',
        targetDate: '2026-02-12',
        status: 'Pending Review',
        progress: 90
    }
];

export default function DesignerWorkloadPage() {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listDesignerTasks();
                if (!active) return;
                if (rows && rows.length > 0) {
                    setTasks(rows.map((r) => ({
                        id: r.id,
                        name: r.name || '',
                        project: r.project || '',
                        assignee: r.assignee || '',
                        targetDate: r.targetDate || '',
                        status: (r.status as Task['status']) || 'Pending Review',
                        progress: r.progress ?? 0,
                    })));
                }
                setError(null);
            } catch (e) {
                if (active) setError('Failed to load workload tasks');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    return (
        <div className="w-full space-y-4 px-3 py-2">
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg">{error}</div>
            )}
            {loading && (
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading tasks…</div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">Engineering Workload</h1>
                        <p className="text-xs text-gray-400 font-bold mt-1 tracking-widest uppercase">Global Design Capacity | Phase 3.6</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            placeholder="Search tasks or engineers..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border border-gray-100 rounded-lg text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none w-64"
                        />
                    </div>
                    <button className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all border border-gray-200">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Active Tasks', value: '24', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Delayed Milestones', value: '3', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Avg. Load / Designer', value: '4.2', icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Design Velocity', value: '88%', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                            <div className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</div>
                        </div>
                        <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live Task Stream</h2>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-full border border-rose-100 italic">Auto-Sync Active</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-gray-100">
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Task Details</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Assignee</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Progress</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Target Date</th>
                                <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tasks.map(task => (
                                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{task.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold">{task.project}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {task.assignee.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{task.assignee}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 w-48">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-gray-400">
                                                <span>{task.status}</span>
                                                <span>{task.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${task.status === 'Delayed' ? 'bg-rose-500' : 'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`flex items-center gap-2 text-xs font-bold ${task.status === 'Delayed' ? 'text-rose-600 animate-pulse' : 'text-gray-600'}`}>
                                            <Calendar className="w-3.5 h-3.5" />
                                            {task.targetDate}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
