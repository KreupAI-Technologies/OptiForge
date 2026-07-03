'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Filter,
    Download,
    Mail,
    Phone,
    MapPin,
    MoreVertical,
    Briefcase,
    Calendar,
    UserCheck,
    UserX,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { hrMastersService } from '@/services/hr-masters.service';

interface Employee {
    id: string;
    employeeId: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    joiningDate: string;
    status: 'Active' | 'Inactive' | 'On Leave' | 'Probation';
    avatar?: string;
}

export default function EmployeeDirectoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                // Backend returns the common-masters Employee shape (firstName/
                // lastName/employeeCode/designation{name}/department{name}/branch/
                // status/createdAt). Map it defensively to this page's model.
                // companyId '1' is the seeded main company (see seed.ts).
                const raw = (await hrMastersService.getAllEmployees('1')) as any[];
                const statusMap: Record<string, Employee['status']> = {
                    active: 'Active',
                    inactive: 'Inactive',
                    on_leave: 'On Leave',
                    onleave: 'On Leave',
                    probation: 'Probation',
                };
                const mapped: Employee[] = (raw ?? []).map((e) => {
                    const first = e.firstName ?? '';
                    const last = e.lastName ?? '';
                    const rawStatus = String(e.status ?? '').toLowerCase();
                    return {
                        id: String(e.id ?? ''),
                        employeeId: e.employeeCode ?? '',
                        name: e.fullName ?? (`${first} ${last}`.trim() || 'Unknown'),
                        designation: e.designation?.name ?? 'Unassigned',
                        department: e.department?.name ?? 'Unassigned',
                        email: e.email ?? '',
                        phone: e.phone ?? '',
                        location: e.branch?.name ?? '',
                        joiningDate: e.createdAt ? String(e.createdAt).split('T')[0] : '',
                        status: statusMap[rawStatus] ?? 'Active',
                    };
                });
                if (!cancelled) setEmployees(mapped);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load employees');
                    setEmployees([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
        const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'Inactive': return 'bg-red-500/20 text-red-400';
            case 'On Leave': return 'bg-yellow-500/20 text-yellow-400';
            case 'Probation': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-500" />
                            Employee Directory
                        </h1>
                        <p className="text-gray-400 mt-1">Manage your workforce, view profiles, and track status.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                            <Plus className="w-4 h-4" />
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or email..."
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
                            <option value="Human Resources">Human Resources</option>
                            <option value="Production">Production</option>
                            <option value="Quality Assurance">Quality Assurance</option>
                            <option value="Procurement">Procurement</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Probation">Probation</option>
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading employees…
                    </div>
                )}
                {error && !loading && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Employee Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredEmployees.map((employee) => (
                        <div key={employee.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-300 group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">{employee.name}</h3>
                                            <p className="text-sm text-gray-400">{employee.designation}</p>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-white">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        {employee.department}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        {employee.email}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        {employee.phone}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        {employee.location}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        Joined: {new Date(employee.joiningDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-700">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                                        {employee.status}
                                    </span>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {employee.employeeId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && !error && filteredEmployees.length === 0 && (
                    <div className="text-center py-12">
                        <UserX className="w-16 h-16 text-gray-600 mb-2" />
                        <p className="text-gray-400 text-lg">No employees found</p>
                        <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
