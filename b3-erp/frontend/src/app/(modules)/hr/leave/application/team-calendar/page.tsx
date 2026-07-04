'use client';

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Users,
    Filter
} from 'lucide-react';
import { LeaveService } from '@/services/leave.service';

const capitalizeStatus = (s: any): TeamLeave['status'] =>
    String(s ?? '').toUpperCase() === 'APPROVED' ? 'Approved' : 'Pending';

interface TeamLeave {
    id: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    status: 'Approved' | 'Pending';
}

export default function TeamLeaveCalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 1, 1));
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const teamLeaves: TeamLeave[] = [
        { id: '1', employeeName: 'Sarah Johnson', leaveType: 'Annual Leave', startDate: '2025-02-03', endDate: '2025-02-05', status: 'Approved' },
        { id: '2', employeeName: 'Michael Chen', leaveType: 'Sick Leave', startDate: '2025-02-10', endDate: '2025-02-10', status: 'Approved' },
        { id: '3', employeeName: 'Emily Davis', leaveType: 'Casual Leave', startDate: '2025-02-14', endDate: '2025-02-14', status: 'Pending' },
        { id: '4', employeeName: 'Robert Martinez', leaveType: 'Annual Leave', startDate: '2025-02-17', endDate: '2025-02-21', status: 'Approved' },
        { id: '5', employeeName: 'Lisa Wong', leaveType: 'Compensatory Off', startDate: '2025-02-24', endDate: '2025-02-24', status: 'Pending' },
        { id: '6', employeeName: 'David Wilson', leaveType: 'Sick Leave', startDate: '2025-02-07', endDate: '2025-02-08', status: 'Approved' }
    ];

    const departments = ['Human Resources', 'Production', 'IT', 'Quality Assurance', 'Finance'];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: number) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    };

    const getLeavesForDate = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return teamLeaves.filter(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const current = new Date(dateStr);
            return current >= start && current <= end;
        });
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getLeaveColor = (leaveType: string) => {
        switch (leaveType) {
            case 'Annual Leave': return 'bg-blue-500';
            case 'Sick Leave': return 'bg-red-500';
            case 'Casual Leave': return 'bg-green-500';
            case 'Compensatory Off': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const upcomingLeaves = teamLeaves.filter(leave => new Date(leave.startDate) >= new Date()).slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-purple-500" />
                            Team Leave Calendar
                        </h1>
                        <p className="text-gray-400 mt-1">View team members&apos; leave schedule</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="all">All Departments</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <p className="text-blue-400 text-sm">Annual Leave</p>
                        </div>
                        <p className="text-3xl font-bold text-white mt-1">{teamLeaves.filter(l => l.leaveType === 'Annual Leave').length}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <p className="text-red-400 text-sm">Sick Leave</p>
                        </div>
                        <p className="text-3xl font-bold text-white mt-1">{teamLeaves.filter(l => l.leaveType === 'Sick Leave').length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <p className="text-green-400 text-sm">Casual Leave</p>
                        </div>
                        <p className="text-3xl font-bold text-white mt-1">{teamLeaves.filter(l => l.leaveType === 'Casual Leave').length}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            <p className="text-purple-400 text-sm">Comp Off</p>
                        </div>
                        <p className="text-3xl font-bold text-white mt-1">{teamLeaves.filter(l => l.leaveType === 'Compensatory Off').length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-semibold text-white">
                                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {weekDays.map(day => (
                                <div key={day} className="p-2 text-center text-gray-400 font-medium text-sm">
                                    {day}
                                </div>
                            ))}

                            {Array.from({ length: firstDay }).map((_, index) => (
                                <div key={`empty-${index}`} className="p-2 min-h-[80px]"></div>
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const day = index + 1;
                                const dayLeaves = getLeavesForDate(day);
                                const isWeekend = (firstDay + index) % 7 === 0 || (firstDay + index) % 7 === 6;

                                return (
                                    <div
                                        key={day}
                                        className={`p-1 min-h-[80px] border border-gray-700 rounded-lg ${isWeekend ? 'bg-gray-800/30' : 'bg-gray-800/50'}`}
                                    >
                                        <p className={`text-sm font-medium ${isWeekend ? 'text-gray-500' : 'text-white'}`}>{day}</p>
                                        <div className="space-y-1 mt-1">
                                            {dayLeaves.slice(0, 2).map(leave => (
                                                <div
                                                    key={leave.id}
                                                    className={`${getLeaveColor(leave.leaveType)} px-1 py-0.5 rounded text-[10px] text-white truncate ${leave.status === 'Pending' ? 'opacity-60' : ''}`}
                                                    title={`${leave.employeeName} - ${leave.leaveType}`}
                                                >
                                                    {leave.employeeName.split(' ')[0]}
                                                </div>
                                            ))}
                                            {dayLeaves.length > 2 && (
                                                <p className="text-[10px] text-gray-400">+{dayLeaves.length - 2} more</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            Upcoming Leaves
                        </h3>
                        <div className="space-y-3">
                            {upcomingLeaves.map(leave => (
                                <div key={leave.id} className="p-3 bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${getLeaveColor(leave.leaveType)}`}></div>
                                        <p className="text-white font-medium text-sm">{leave.employeeName}</p>
                                    </div>
                                    <p className="text-xs text-gray-400">{leave.leaveType}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] ${leave.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {leave.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Legend</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                                    <span className="text-xs text-gray-400">Annual Leave</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-red-500"></div>
                                    <span className="text-xs text-gray-400">Sick Leave</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-green-500"></div>
                                    <span className="text-xs text-gray-400">Casual Leave</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-purple-500"></div>
                                    <span className="text-xs text-gray-400">Comp Off</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
