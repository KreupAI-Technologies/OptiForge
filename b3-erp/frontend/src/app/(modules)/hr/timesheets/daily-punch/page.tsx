'use client';

import React, { useState, useEffect } from 'react';
import {
    Clock,
    Search,
    Filter,
    Calendar,
    LogIn,
    LogOut,
    MapPin,
    Wifi,
    AlertCircle,
    CheckCircle,
    Edit
} from 'lucide-react';
import { TimesheetService } from '@/services/timesheet.service';

interface DailyPunch {
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    date: string;
    punchIn: string | null;
    punchOut: string | null;
    totalHours: string | null;
    status: 'Present' | 'Absent' | 'Half Day' | 'Late' | 'Not Punched';
    location: string;
    deviceType: 'Biometric' | 'Web' | 'Mobile';
    breakTime: number;
    overtimeHours: number;
}

export default function DailyPunchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const [punches, setPunches] = useState<DailyPunch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await TimesheetService.getTimesheets();
                const mapped: DailyPunch[] = (Array.isArray(raw) ? raw : []).map((r: any, i: number) => ({
                    id: String(r?.id ?? i),
                    employeeId: r?.employeeCode ?? r?.employeeId ?? '',
                    employeeName: r?.employeeName ?? '',
                    department: r?.department ?? r?.departmentName ?? '',
                    date: r?.date ?? '',
                    punchIn: r?.punchIn ?? r?.checkIn ?? null,
                    punchOut: r?.punchOut ?? r?.checkOut ?? null,
                    totalHours: r?.totalHours ?? null,
                    status: (r?.status as DailyPunch['status']) ?? 'Not Punched',
                    location: r?.location ?? '-',
                    deviceType: (r?.deviceType as DailyPunch['deviceType']) ?? 'Web',
                    breakTime: r?.breakTime ?? 0,
                    overtimeHours: r?.overtimeHours ?? 0,
                }));
                if (!cancelled) setPunches(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setPunches([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const departments = Array.from(new Set(punches.map(p => p.department)));

    const filteredPunches = punches.filter(punch => {
        const matchesSearch = punch.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            punch.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || punch.department === departmentFilter;
        return matchesSearch && matchesDept;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return 'bg-green-500/20 text-green-400';
            case 'Absent': return 'bg-red-500/20 text-red-400';
            case 'Half Day': return 'bg-orange-500/20 text-orange-400';
            case 'Late': return 'bg-yellow-500/20 text-yellow-400';
            case 'Not Punched': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'Biometric': return <Clock className="w-4 h-4" />;
            case 'Web': return <Wifi className="w-4 h-4" />;
            case 'Mobile': return <MapPin className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const stats = {
        present: punches.filter(p => p.status === 'Present').length,
        late: punches.filter(p => p.status === 'Late').length,
        absent: punches.filter(p => p.status === 'Absent').length,
        notPunched: punches.filter(p => p.status === 'Not Punched').length
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                {isLoading && (<div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">Loading…</div>)}
                {loadError && !isLoading && (<div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{loadError}</div>)}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Clock className="w-8 h-8 text-blue-500" />
                            Daily Punch Records
                        </h1>
                        <p className="text-gray-400 mt-1">View and manage daily attendance punches</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <div>
                            <p className="text-green-400 text-sm">Present</p>
                            <p className="text-2xl font-bold text-white">{stats.present}</p>
                        </div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                        <div>
                            <p className="text-yellow-400 text-sm">Late</p>
                            <p className="text-2xl font-bold text-white">{stats.late}</p>
                        </div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                        <LogOut className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-red-400 text-sm">Absent</p>
                            <p className="text-2xl font-bold text-white">{stats.absent}</p>
                        </div>
                    </div>
                    <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-4 flex items-center gap-3">
                        <Clock className="w-8 h-8 text-gray-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Not Punched Out</p>
                            <p className="text-2xl font-bold text-white">{stats.notPunched}</p>
                        </div>
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
                                <th className="text-center p-4 text-gray-400 font-medium">Punch In</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Punch Out</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Total Hours</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Break</th>
                                <th className="text-center p-4 text-gray-400 font-medium">OT</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Device</th>
                                <th className="text-center p-4 text-gray-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPunches.map((punch) => (
                                <tr key={punch.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {punch.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{punch.employeeName}</p>
                                                <p className="text-xs text-gray-400">{punch.employeeId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{punch.department}</td>
                                    <td className="p-4 text-center">
                                        {punch.punchIn ? (
                                            <div className="flex items-center justify-center gap-1 text-green-400">
                                                <LogIn className="w-4 h-4" />
                                                {punch.punchIn}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {punch.punchOut ? (
                                            <div className="flex items-center justify-center gap-1 text-red-400">
                                                <LogOut className="w-4 h-4" />
                                                {punch.punchOut}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center text-white font-medium">
                                        {punch.totalHours || '-'}
                                    </td>
                                    <td className="p-4 text-center text-gray-300">
                                        {punch.breakTime > 0 ? `${punch.breakTime}m` : '-'}
                                    </td>
                                    <td className="p-4 text-center">
                                        {punch.overtimeHours > 0 ? (
                                            <span className="text-orange-400">{punch.overtimeHours}h</span>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(punch.status)}`}>
                                            {punch.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-gray-400">
                                            {getDeviceIcon(punch.deviceType)}
                                            <span className="text-xs">{punch.deviceType}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
                                            <Edit className="w-4 h-4" />
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
