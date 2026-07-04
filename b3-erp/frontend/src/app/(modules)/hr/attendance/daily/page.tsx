'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    UserCheck,
    UserX,
    AlertCircle,
    Search,
    Filter,
    Download,
    Save,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';

const pad2 = (n: number) => String(n).padStart(2, '0');
const fmtTime = (v: any): string | null => {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const mapAttStatus = (s: any): AttendanceRecord['status'] => {
    switch (String(s ?? '').toUpperCase()) {
        case 'PRESENT': return 'Present';
        case 'ABSENT': return 'Absent';
        case 'LATE': return 'Late';
        case 'HALF_DAY': return 'Half Day';
        case 'ON_LEAVE': return 'On Leave';
        default: return 'Present';
    }
};

interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    shift: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
    workHours: string;
    overtime: string;
}

export default function DailyAttendancePage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await AttendanceService.getAttendance();
                const mapped: AttendanceRecord[] = (raw as any[]).map((r) => ({
                    id: String(r?.id ?? ''),
                    employeeId: r?.employeeCode ?? r?.employeeId ?? '',
                    employeeName: r?.employeeName ?? '',
                    department: r?.departmentName ?? '',
                    shift: r?.shift ?? '',
                    checkIn: fmtTime(r?.checkInTime),
                    checkOut: fmtTime(r?.checkOutTime),
                    status: mapAttStatus(r?.status),
                    workHours: r?.totalHours != null ? `${r.totalHours}` : '00:00',
                    overtime: r?.overtimeHours != null ? `${r.overtimeHours}` : '00:00',
                }));
                if (!cancelled) setAttendanceData(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setAttendanceData([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const filteredData = attendanceData.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || record.department === departmentFilter;
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        return matchesSearch && matchesDept && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        const styles = {
            Present: 'bg-green-500/20 text-green-400',
            Absent: 'bg-red-500/20 text-red-400',
            Late: 'bg-orange-500/20 text-orange-400',
            'Half Day': 'bg-yellow-500/20 text-yellow-400',
            'On Leave': 'bg-blue-500/20 text-blue-400'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {status}
            </span>
        );
    };

    // Stats
    const totalEmployees = attendanceData.length;
    const presentCount = attendanceData.filter(r => r.status === 'Present' || r.status === 'Late').length;
    const absentCount = attendanceData.filter(r => r.status === 'Absent').length;
    const leaveCount = attendanceData.filter(r => r.status === 'On Leave').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Clock className="w-8 h-8 text-green-500" />
                            Daily Attendance
                        </h1>
                        <p className="text-gray-400 mt-1">Track employee attendance, check-ins, and work hours.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 p-1">
                            <button className="p-2 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none text-white focus:ring-0 text-sm px-2"
                            />
                            <button className="p-2 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg shadow-green-900/20">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm">Total Employees</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{totalEmployees}</h3>
                            </div>
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <UserCheck className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm">Present Today</p>
                                <h3 className="text-2xl font-bold text-green-400 mt-1">{presentCount}</h3>
                                <p className="text-xs text-gray-500 mt-1">{((presentCount / totalEmployees) * 100).toFixed(0)}% Attendance</p>
                            </div>
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <UserCheck className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm">On Leave</p>
                                <h3 className="text-2xl font-bold text-yellow-400 mt-1">{leaveCount}</h3>
                            </div>
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <CalendarIcon className="w-5 h-5 text-yellow-400" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 text-sm">Absent</p>
                                <h3 className="text-2xl font-bold text-red-400 mt-1">{absentCount}</h3>
                            </div>
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <UserX className="w-5 h-5 text-red-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Employee</th>
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Shift</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Check In</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Check Out</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Work Hours</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredData.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-3 py-2">
                                            <div className="font-medium text-white">{record.employeeName}</div>
                                            <div className="text-xs text-gray-400 font-mono">{record.employeeId} • {record.department}</div>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-300">
                                            {record.shift}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="font-mono text-white">{record.checkIn || '--:--'}</span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="font-mono text-white">{record.checkOut || '--:--'}</span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <div className="font-mono text-white">{record.workHours}</div>
                                            {record.overtime !== '00:00' && (
                                                <div className="text-xs text-green-400">OT: {record.overtime}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            {getStatusBadge(record.status)}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
