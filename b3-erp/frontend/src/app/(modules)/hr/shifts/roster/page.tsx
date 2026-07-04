'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Filter,
    Download,
    Users,
    Sun,
    Moon,
    Sunrise,
    Clock
} from 'lucide-react';
import { HrShiftsService } from '@/services/hr-shifts.service';

interface RosterEntry {
    employeeId: string;
    employeeName: string;
    department: string;
    shifts: { [key: string]: string };
}

export default function ShiftRosterPage() {
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const departments = ['Production', 'Quality Assurance', 'Warehouse', 'IT', 'HR'];

    const roster: RosterEntry[] = [
        {
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'HR',
            shifts: { 'Mon': 'DAY', 'Tue': 'DAY', 'Wed': 'DAY', 'Thu': 'DAY', 'Fri': 'DAY', 'Sat': 'OFF', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            shifts: { 'Mon': 'MOR', 'Tue': 'MOR', 'Wed': 'MOR', 'Thu': 'MOR', 'Fri': 'MOR', 'Sat': 'MOR', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP003',
            employeeName: 'Emily Davis',
            department: 'Quality Assurance',
            shifts: { 'Mon': 'DAY', 'Tue': 'DAY', 'Wed': 'DAY', 'Thu': 'DAY', 'Fri': 'DAY', 'Sat': 'OFF', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP004',
            employeeName: 'David Wilson',
            department: 'Production',
            shifts: { 'Mon': 'EVE', 'Tue': 'EVE', 'Wed': 'EVE', 'Thu': 'EVE', 'Fri': 'EVE', 'Sat': 'EVE', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP005',
            employeeName: 'Jennifer Brown',
            department: 'Warehouse',
            shifts: { 'Mon': 'NGT', 'Tue': 'NGT', 'Wed': 'NGT', 'Thu': 'NGT', 'Fri': 'NGT', 'Sat': 'OFF', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            shifts: { 'Mon': 'DAY', 'Tue': 'DAY', 'Wed': 'DAY', 'Thu': 'DAY', 'Fri': 'DAY', 'Sat': 'OFF', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP007',
            employeeName: 'Lisa Wong',
            department: 'Production',
            shifts: { 'Mon': 'MOR', 'Tue': 'MOR', 'Wed': 'EVE', 'Thu': 'EVE', 'Fri': 'MOR', 'Sat': 'OFF', 'Sun': 'OFF' }
        },
        {
            employeeId: 'EMP008',
            employeeName: 'James Taylor',
            department: 'Warehouse',
            shifts: { 'Mon': 'OFF', 'Tue': 'NGT', 'Wed': 'NGT', 'Thu': 'NGT', 'Fri': 'NGT', 'Sat': 'NGT', 'Sun': 'OFF' }
        }
    ];

    const filteredRoster = roster.filter(entry =>
        departmentFilter === 'all' || entry.department === departmentFilter
    );

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getShiftColor = (shift: string) => {
        switch (shift) {
            case 'DAY': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'MOR': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'EVE': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'NGT': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            case 'OFF': return 'bg-gray-700/50 text-gray-500 border-gray-600';
            default: return 'bg-gray-700 text-gray-400 border-gray-600';
        }
    };

    const getShiftIcon = (shift: string) => {
        switch (shift) {
            case 'DAY': return <Sun className="w-3 h-3" />;
            case 'MOR': return <Sunrise className="w-3 h-3" />;
            case 'EVE': return <Clock className="w-3 h-3" />;
            case 'NGT': return <Moon className="w-3 h-3" />;
            default: return null;
        }
    };

    const navigateWeek = (direction: number) => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setSelectedWeek(newDate);
    };

    const getWeekDates = () => {
        const startOfWeek = new Date(selectedWeek);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        return weekDays.map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            return date.getDate();
        });
    };

    const weekDates = getWeekDates();

    const shiftCounts = {
        day: filteredRoster.reduce((sum, r) => sum + Object.values(r.shifts).filter(s => s === 'DAY').length, 0),
        morning: filteredRoster.reduce((sum, r) => sum + Object.values(r.shifts).filter(s => s === 'MOR').length, 0),
        evening: filteredRoster.reduce((sum, r) => sum + Object.values(r.shifts).filter(s => s === 'EVE').length, 0),
        night: filteredRoster.reduce((sum, r) => sum + Object.values(r.shifts).filter(s => s === 'NGT').length, 0)
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-blue-500" />
                            Shift Roster
                        </h1>
                        <p className="text-gray-400 mt-1">Weekly shift schedule overview</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateWeek(-1)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white font-medium px-4 min-w-[200px] text-center">
                            Week of {selectedWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => navigateWeek(1)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg ml-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Employees</p>
                        <p className="text-3xl font-bold text-white">{filteredRoster.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                        <Sunrise className="w-6 h-6 text-yellow-400" />
                        <div>
                            <p className="text-yellow-400 text-sm">Morning Shifts</p>
                            <p className="text-xl font-bold text-white">{shiftCounts.morning}</p>
                        </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                        <Sun className="w-6 h-6 text-blue-400" />
                        <div>
                            <p className="text-blue-400 text-sm">Day Shifts</p>
                            <p className="text-xl font-bold text-white">{shiftCounts.day}</p>
                        </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3">
                        <Clock className="w-6 h-6 text-purple-400" />
                        <div>
                            <p className="text-purple-400 text-sm">Evening Shifts</p>
                            <p className="text-xl font-bold text-white">{shiftCounts.evening}</p>
                        </div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3">
                        <Moon className="w-6 h-6 text-indigo-400" />
                        <div>
                            <p className="text-indigo-400 text-sm">Night Shifts</p>
                            <p className="text-xl font-bold text-white">{shiftCounts.night}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex items-center gap-4">
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
                    <div className="ml-auto flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                                <Sun className="w-3 h-3 text-blue-400" />
                            </div>
                            <span className="text-gray-400">Day</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center">
                                <Sunrise className="w-3 h-3 text-yellow-400" />
                            </div>
                            <span className="text-gray-400">Morning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                                <Clock className="w-3 h-3 text-purple-400" />
                            </div>
                            <span className="text-gray-400">Evening</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-indigo-500/20 flex items-center justify-center">
                                <Moon className="w-3 h-3 text-indigo-400" />
                            </div>
                            <span className="text-gray-400">Night</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-4 text-gray-400 font-medium min-w-[200px]">Employee</th>
                                {weekDays.map((day, index) => (
                                    <th key={day} className="text-center p-4 text-gray-400 font-medium">
                                        <div>{day}</div>
                                        <div className="text-xs text-gray-500">{weekDates[index]}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRoster.map((entry) => (
                                <tr key={entry.employeeId} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                {entry.employeeName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{entry.employeeName}</p>
                                                <p className="text-xs text-gray-400">{entry.department}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {weekDays.map((day) => (
                                        <td key={day} className="p-2 text-center">
                                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded border ${getShiftColor(entry.shifts[day])}`}>
                                                {getShiftIcon(entry.shifts[day])}
                                                <span className="text-sm font-medium">{entry.shifts[day]}</span>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
