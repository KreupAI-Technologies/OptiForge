'use client';

import React, { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
    ClipboardList,
    Plus,
    Save,
    Calendar,
    Clock,
    Briefcase,
    Tag,
    MessageSquare,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface TimesheetEntry {
    id: string;
    date: string;
    project: string;
    task: string;
    hours: number;
    description: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
}

export default function TimesheetEntryPage() {
    const [selectedWeek, setSelectedWeek] = useState(new Date());

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const [entries, setEntries] = useState<TimesheetEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
          const rows = await HrPagesService.timesheets<any[]>();
          if (!cancelled) setEntries(Array.isArray(rows) ? (rows as any) : []);
        } catch (err) {
          if (!cancelled) {
            setLoadError(err instanceof Error ? err.message : 'Failed to load data');
            setEntries([]);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

    const projects = ['ERP Implementation', 'Client Support', 'Training', 'Internal Tools', 'R&D'];
    const tasks = ['Frontend Development', 'Backend Development', 'Testing', 'Bug Fixes', 'Code Review', 'Documentation', 'Team Meeting'];

    const getWeekDates = () => {
        const startOfWeek = new Date(selectedWeek);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);

        return weekDays.map((_, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            return date;
        });
    };

    const weekDates = getWeekDates();

    const navigateWeek = (direction: number) => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + (direction * 7));
        setSelectedWeek(newDate);
    };

    const getDailyTotal = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return entries.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.hours, 0);
    };

    const weeklyTotal = entries.reduce((sum, e) => sum + e.hours, 0);

    const addEntry = () => {
        const newEntry: TimesheetEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            project: '',
            task: '',
            hours: 0,
            description: '',
            status: 'Draft'
        };
        setEntries([...entries, newEntry]);
    };

    const removeEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const updateEntry = (id: string, field: keyof TimesheetEntry, value: string | number) => {
        setEntries(entries.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        ));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ClipboardList className="w-8 h-8 text-blue-500" />
                            Timesheet Entry
                        </h1>
                        <p className="text-gray-400 mt-1">Log your daily work hours</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={addEntry}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Entry
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <Save className="w-4 h-4" />
                            Submit Week
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigateWeek(-1)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white font-medium">
                            Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button
                            onClick={() => navigateWeek(1)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-8 gap-2">
                        <div className="p-3 text-center text-gray-400 font-medium">Day</div>
                        {weekDays.map((day, index) => (
                            <div
                                key={day}
                                className={`p-3 text-center rounded-lg ${weekDates[index].toDateString() === new Date().toDateString() ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-700/30'}`}
                            >
                                <p className="text-gray-400 text-sm">{day}</p>
                                <p className="text-white font-medium">{weekDates[index].getDate()}</p>
                            </div>
                        ))}
                        <div className="p-3 text-center text-gray-400 font-medium">Hours</div>
                        {weekDates.map((date, index) => {
                            const total = getDailyTotal(date);
                            return (
                                <div
                                    key={index}
                                    className={`p-3 text-center rounded-lg ${total >= 8 ? 'text-green-400' : total > 0 ? 'text-yellow-400' : 'text-gray-500'}`}
                                >
                                    <span className="font-bold">{total}h</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total Entries</p>
                        <p className="text-3xl font-bold text-white">{entries.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Weekly Hours</p>
                        <p className="text-3xl font-bold text-white">{weeklyTotal}h</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Status</p>
                        <p className="text-3xl font-bold text-white">Draft</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Date</label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="date"
                                            value={entry.date}
                                            onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Project</label>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        <select
                                            value={entry.project}
                                            onChange={(e) => updateEntry(entry.id, 'project', e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => (
                                                <option key={p} value={p}>{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Task</label>
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-gray-500" />
                                        <select
                                            value={entry.task}
                                            onChange={(e) => updateEntry(entry.id, 'task', e.target.value)}
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Task</option>
                                            {tasks.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Hours</label>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={entry.hours}
                                            onChange={(e) => updateEntry(entry.id, 'hours', parseFloat(e.target.value) || 0)}
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-500 self-start mt-2" />
                                        <input
                                            type="text"
                                            value={entry.description}
                                            onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                                            placeholder="What did you work on?"
                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={() => removeEntry(entry.id)}
                                            className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {entries.length === 0 && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
                        <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">No timesheet entries for this week</p>
                        <button
                            onClick={addEntry}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mx-auto"
                        >
                            <Plus className="w-4 h-4" />
                            Add First Entry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
