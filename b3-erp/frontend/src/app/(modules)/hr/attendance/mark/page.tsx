'use client';

import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    Calendar,
    Users,
    MapPin,
    Wifi,
    Save
} from 'lucide-react';
import { EmployeeService } from '@/services/employee.service';

interface Employee {
    id: string;
    employeeId: string;
    name: string;
    department: string;
    designation: string;
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave' | 'Not Marked';
    checkIn?: string;
    checkOut?: string;
    workHours?: string;
}

export default function MarkAttendancePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await EmployeeService.getAllEmployeesRaw();
                const mapped: Employee[] = (raw as any[]).map((r) => {
                    const fullName = r?.fullName ?? [r?.firstName, r?.lastName].filter(Boolean).join(' ').trim();
                    return {
                        id: String(r?.id ?? ''),
                        employeeId: r?.employeeCode ?? '',
                        name: fullName || '',
                        department: r?.departmentName ?? r?.department ?? '',
                        designation: r?.designation ?? '',
                        status: 'Not Marked' as Employee['status'],
                    };
                });
                if (!cancelled) setEmployees(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setEmployees([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const departments = Array.from(new Set(employees.map(e => e.department)));

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-500/20 text-green-400';
            case 'Absent': return 'bg-red-500/20 text-red-400';
            case 'Late': return 'bg-yellow-500/20 text-yellow-400';
            case 'Half Day': return 'bg-orange-500/20 text-orange-400';
            case 'On Leave': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Present': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'Absent': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'Late': return <Clock className="w-4 h-4 text-yellow-400" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const stats = {
        present: employees.filter(e => e.status === 'Present').length,
        absent: employees.filter(e => e.status === 'Absent').length,
        late: employees.filter(e => e.status === 'Late').length,
        onLeave: employees.filter(e => e.status === 'On Leave').length,
        notMarked: employees.filter(e => e.status === 'Not Marked').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            Mark Attendance
                        </h1>
                        <p className="text-gray-400 mt-1">Record daily employee attendance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Save className="w-4 h-4" />
                            Save All
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Present</p>
                        <p className="text-3xl font-bold text-white">{stats.present}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Absent</p>
                        <p className="text-3xl font-bold text-white">{stats.absent}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Late</p>
                        <p className="text-3xl font-bold text-white">{stats.late}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">On Leave</p>
                        <p className="text-3xl font-bold text-white">{stats.onLeave}</p>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Not Marked</p>
                        <p className="text-3xl font-bold text-white">{stats.notMarked}</p>
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
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-4 text-gray-400 font-medium">Employee</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Department</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Check In</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Check Out</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Work Hours</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{emp.name}</p>
                                                <p className="text-sm text-gray-400">{emp.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{emp.department}</td>
                                    <td className="p-4">
                                        <input
                                            type="time"
                                            defaultValue={emp.checkIn}
                                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="time"
                                            defaultValue={emp.checkOut}
                                            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="p-4 text-gray-300">{emp.workHours || '-'}</td>
                                    <td className="p-4">
                                        <select
                                            defaultValue={emp.status}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(emp.status)}`}
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                            <option value="Late">Late</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="On Leave">On Leave</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                                            Save
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
