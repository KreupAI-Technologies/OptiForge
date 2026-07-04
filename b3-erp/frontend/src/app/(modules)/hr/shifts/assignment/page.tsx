'use client';

import React, { useState, useEffect } from 'react';
import {
    UserCheck,
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    Edit,
    Trash2
} from 'lucide-react';
import { HrShiftsService } from '@/services/hr-shifts.service';

interface ShiftAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    shiftCode: string;
    shiftName: string;
    effectiveFrom: string;
    effectiveTo: string | null;
    status: 'Active' | 'Pending' | 'Expired';
    assignedBy: string;
    assignedDate: string;
}

export default function ShiftAssignmentPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await HrShiftsService.getShiftAssignments();
                const mapped: ShiftAssignment[] = (raw as any[]).map((r) => ({
                    id: String(r.id ?? ''),
                    employeeId: r.employeeId ?? '',
                    employeeName: r.employeeName ?? '',
                    department: r.department ?? '',
                    shiftCode: r.shiftCode ?? '',
                    shiftName: r.shiftName ?? '',
                    effectiveFrom: r.effectiveFrom ?? '',
                    effectiveTo: r.effectiveTo ?? null,
                    status: (r.status ?? 'Active') as ShiftAssignment['status'],
                    assignedBy: r.assignedBy ?? '',
                    assignedDate: r.assignedDate ?? '',
                }));
                if (!cancelled) setAssignments(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setAssignments([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const departments = Array.from(new Set(assignments.map(a => a.department)));

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch = assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            assignment.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || assignment.department === departmentFilter;
        const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Expired': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getShiftColor = (code: string) => {
        switch (code) {
            case 'DAY': return 'bg-blue-500/20 text-blue-400';
            case 'MOR': return 'bg-yellow-500/20 text-yellow-400';
            case 'EVE': return 'bg-purple-500/20 text-purple-400';
            case 'NGT': return 'bg-indigo-500/20 text-indigo-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="mb-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <UserCheck className="w-8 h-8 text-blue-500" />
                            Shift Assignment
                        </h1>
                        <p className="text-gray-400 mt-1">Assign shifts to employees</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        New Assignment
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Assignments</p>
                        <p className="text-3xl font-bold text-white">{assignments.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Active</p>
                        <p className="text-3xl font-bold text-white">{assignments.filter(a => a.status === 'Active').length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{assignments.filter(a => a.status === 'Pending').length}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Expired</p>
                        <p className="text-3xl font-bold text-white">{assignments.filter(a => a.status === 'Expired').length}</p>
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
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Shift</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Effective Period</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Assigned By</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssignments.map((assignment) => (
                                <tr key={assignment.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {assignment.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{assignment.employeeName}</p>
                                                <p className="text-xs text-gray-400">{assignment.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{assignment.department}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getShiftColor(assignment.shiftCode)}`}>
                                                {assignment.shiftCode}
                                            </span>
                                            <span className="text-gray-300">{assignment.shiftName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-300">
                                                {new Date(assignment.effectiveFrom).toLocaleDateString()}
                                                {assignment.effectiveTo ? ` - ${new Date(assignment.effectiveTo).toLocaleDateString()}` : ' - Ongoing'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                            {assignment.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="text-gray-300 text-sm">{assignment.assignedBy}</p>
                                            <p className="text-xs text-gray-500">{new Date(assignment.assignedDate).toLocaleDateString()}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-1">
                                            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
