'use client';

import React, { useState, useEffect } from 'react';
import {
    Target,
    Plus,
    Search,
    Filter,
    Calendar,
    Users,
    CheckCircle,
    Clock,
    BarChart2,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react';
import { PerformanceManagementService } from '@/services/performance-management.service';

interface ReviewCycle {
    id: string;
    name: string;
    type: 'Annual' | 'Mid-Year' | 'Probation' | 'Project-Based';
    startDate: string;
    endDate: string;
    status: 'Active' | 'Planned' | 'Completed' | 'Archived';
    participants: number;
    completionRate: number;
    description: string;
}

export default function ReviewCyclesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [cycles, setCycles] = useState<ReviewCycle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({ cycleName: '', cycleType: 'quarterly', startDate: '', endDate: '', description: '' });

    const [editCycle, setEditCycle] = useState<ReviewCycle | null>(null);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ cycleName: '', startDate: '', endDate: '', description: '' });

    const openEditCycle = (cycle: ReviewCycle) => {
        setEditCycle(cycle);
        setEditError(null);
        setEditForm({
            cycleName: cycle.name,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            description: cycle.description,
        });
    };

    const handleUpdateCycle = async () => {
        if (!editCycle) return;
        setEditSaving(true);
        setEditError(null);
        try {
            await PerformanceManagementService.updateReviewCycle(editCycle.id, {
                cycleName: editForm.cycleName,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                description: editForm.description,
            });
            setCycles((prev) => prev.map((c) => (c.id === editCycle.id ? {
                ...c,
                name: editForm.cycleName,
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                description: editForm.description,
            } : c)));
            setEditCycle(null);
        } catch (e) {
            setEditError(e instanceof Error ? e.message : 'Failed to update review cycle');
        } finally {
            setEditSaving(false);
        }
    };

    const loadCycles = async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const raw = await PerformanceManagementService.getReviewCycles();
            const rows: any[] = Array.isArray(raw) ? raw : [];
            const typeMap: Record<string, ReviewCycle['type']> = {
                annual: 'Annual', semi_annual: 'Mid-Year', 'half-yearly': 'Mid-Year',
                quarterly: 'Project-Based', monthly: 'Project-Based', probation: 'Probation',
                'project-based': 'Project-Based',
            };
            const statusMap: Record<string, ReviewCycle['status']> = {
                draft: 'Planned', active: 'Active', in_progress: 'Active',
                completed: 'Completed', archived: 'Archived',
            };
            const mapped: ReviewCycle[] = rows.map((r) => ({
                id: r?.id ?? '',
                name: r?.cycleName ?? r?.name ?? 'Review Cycle',
                type: typeMap[r?.cycleType] ?? 'Annual',
                startDate: r?.startDate ?? r?.createdAt ?? '',
                endDate: r?.endDate ?? '',
                status: statusMap[r?.status] ?? 'Planned',
                participants: r?.participants ?? 0,
                completionRate: r?.completionRate ?? 0,
                description: r?.description ?? '',
            }));
            setCycles(mapped);
        } catch (e) {
            setLoadError(e instanceof Error ? e.message : 'Failed to load');
            setCycles([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCycles();
    }, []);

    const handleCreateCycle = async () => {
        setSaving(true);
        setCreateError(null);
        try {
            await PerformanceManagementService.createReviewCycle({
                cycleName: createForm.cycleName,
                cycleType: createForm.cycleType,
                startDate: createForm.startDate,
                endDate: createForm.endDate,
                description: createForm.description,
            });
            setShowCreate(false);
            setCreateForm({ cycleName: '', cycleType: 'quarterly', startDate: '', endDate: '', description: '' });
            await loadCycles();
        } catch (e) {
            setCreateError(e instanceof Error ? e.message : 'Failed to create review cycle');
        } finally {
            setSaving(false);
        }
    };

    const filteredCycles = cycles.filter(cycle => {
        const matchesSearch = cycle.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || cycle.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'Planned': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'Completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
            case 'Archived': return 'bg-gray-700/50 text-gray-500 border-gray-700';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-3">
            <div className="w-full space-y-3">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Target className="w-8 h-8 text-purple-500" />
                            Performance Review Cycles
                        </h1>
                        <p className="text-gray-400 mt-1">Manage appraisal periods, track progress, and view history.</p>
                    </div>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-lg shadow-purple-900/20">
                        <Plus className="w-4 h-4" />
                        Create New Cycle
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search cycles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Planned">Planned</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                </div>

                {isLoading && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                        Loading…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {loadError}
                    </div>
                )}

                {/* Cycles Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {filteredCycles.map((cycle) => (
                        <div key={cycle.id} className="bg-gray-800 rounded-xl border border-gray-700 p-3 hover:border-purple-500/50 transition-all duration-300">
                            <div className="flex flex-col md:flex-row justify-between gap-3">

                                {/* Left Section: Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-white">{cycle.name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cycle.status)}`}>
                                            {cycle.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">{cycle.description}</p>

                                    <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-400" />
                                            {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-400" />
                                            {cycle.participants} Participants
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-green-400" />
                                            {cycle.type}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Progress & Actions */}
                                <div className="flex flex-col justify-between items-end min-w-[250px] gap-2">
                                    <div className="w-full">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Completion</span>
                                            <span className="text-white font-medium">{cycle.completionRate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${cycle.completionRate}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => openEditCycle(cycle)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium">
                                            Settings
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium">
                                            View Details
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

                {filteredCycles.length === 0 && (
                    <div className="text-center py-12">
                        <Target className="w-16 h-16 text-gray-600 mb-2" />
                        <p className="text-gray-400 text-lg">No review cycles found</p>
                    </div>
                )}
            </div>

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-3">Create New Review Cycle</h2>
                        {createError && (
                            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{createError}</div>
                        )}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cycle Name</label>
                                <input type="text" value={createForm.cycleName} onChange={(e) => setCreateForm({ ...createForm, cycleName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cycle Type</label>
                                <select value={createForm.cycleType} onChange={(e) => setCreateForm({ ...createForm, cycleType: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="annual">Annual</option>
                                    <option value="half-yearly">Half-Yearly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="probation">Probation</option>
                                    <option value="project-based">Project-Based</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input type="date" value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 text-sm">Cancel</button>
                            <button onClick={handleCreateCycle} disabled={saving} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving…' : 'Create Cycle'}</button>
                        </div>
                    </div>
                </div>
            )}

            {editCycle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setEditCycle(null)}>
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-white mb-3">Edit Review Cycle</h2>
                        {editError && (
                            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{editError}</div>
                        )}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Cycle Name</label>
                                <input type="text" value={editForm.cycleName} onChange={(e) => setEditForm({ ...editForm, cycleName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                                <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                                <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                                <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setEditCycle(null)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 text-sm">Cancel</button>
                            <button onClick={handleUpdateCycle} disabled={editSaving} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm disabled:opacity-50">{editSaving ? 'Saving…' : 'Save Changes'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
