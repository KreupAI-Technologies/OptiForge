'use client';

import React, { useState, useEffect } from 'react';
import { HrPayrollService } from '@/services/hr-payroll.service';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    AlertCircle,
    CheckCircle,
    Bell,
    Settings
} from 'lucide-react';

interface PayrollEvent {
    id: string;
    date: string;
    title: string;
    type: 'payroll-run' | 'deadline' | 'holiday' | 'reminder';
    description: string;
    status?: 'completed' | 'upcoming' | 'overdue';
}

export default function PayrollCalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(0); // January 2025
    const [currentYear, setCurrentYear] = useState(2025);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const [events, setEvents] = useState<PayrollEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrPayrollService.getPayrollCalendar();
          const mapped: PayrollEvent[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setEvents(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setEvents([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const getEventsForDate = (date: string) => {
        return events.filter(e => e.date === date);
    };

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'payroll-run': return 'bg-green-500';
            case 'deadline': return 'bg-red-500';
            case 'holiday': return 'bg-blue-500';
            case 'reminder': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getEventBgColor = (type: string) => {
        switch (type) {
            case 'payroll-run': return 'bg-green-500/20 border-green-500/30';
            case 'deadline': return 'bg-red-500/20 border-red-500/30';
            case 'holiday': return 'bg-blue-500/20 border-blue-500/30';
            case 'reminder': return 'bg-yellow-500/20 border-yellow-500/30';
            default: return 'bg-gray-500/20 border-gray-500/30';
        }
    };

    const navigateMonth = (direction: number) => {
        let newMonth = currentMonth + direction;
        let newYear = currentYear;

        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Day headers
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={`header-${i}`} className="text-center text-gray-400 text-sm py-2 font-medium">
                    {dayNames[i]}
                </div>
            );
        }

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} className="p-2 min-h-[100px] bg-gray-800/30 border border-gray-700/50" />
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = getEventsForDate(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            days.push(
                <div
                    key={day}
                    className={`p-2 min-h-[100px] border border-gray-700/50 ${isToday ? 'bg-blue-500/10 border-blue-500/30' : 'bg-gray-800/50'
                        } hover:bg-gray-700/50 transition-colors`}
                >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-400' : 'text-white'}`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                            <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate border ${getEventBgColor(event.type)}`}
                            >
                                <div className="flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${getEventTypeColor(event.type)}`} />
                                    <span className="text-gray-200 truncate">{event.title}</span>
                                </div>
                            </div>
                        ))}
                        {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">+{dayEvents.length - 2} more</div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const upcomingEvents = events
        .filter(e => e.date >= new Date().toISOString().split('T')[0])
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-blue-500" />
                            Payroll Calendar
                        </h1>
                        <p className="text-gray-400 mt-1">Schedule and track payroll activities</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                        Configure
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Payroll Runs</p>
                        <p className="text-3xl font-bold text-white">{events.filter(e => e.type === 'payroll-run').length}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Deadlines</p>
                        <p className="text-3xl font-bold text-white">{events.filter(e => e.type === 'deadline').length}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Holidays</p>
                        <p className="text-3xl font-bold text-white">{events.filter(e => e.type === 'holiday').length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Reminders</p>
                        <p className="text-3xl font-bold text-white">{events.filter(e => e.type === 'reminder').length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                    <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-400" />
                            </button>
                            <h2 className="text-xl font-semibold text-white">
                                {months[currentMonth]} {currentYear}
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-7 gap-1">
                                {renderCalendar()}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-700 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm text-gray-400">Payroll Run</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm text-gray-400">Deadline</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-sm text-gray-400">Holiday</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-sm text-gray-400">Reminder</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-yellow-400" />
                            Upcoming Events
                        </h2>

                        <div className="space-y-3">
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className={`p-3 rounded-lg border ${getEventBgColor(event.type)}`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 ${getEventTypeColor(event.type)}`} />
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium">{event.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>
                                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
