'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface ComplianceDeadline {
  id: string;
  title: string;
  act: string;
  dueDate: string;
  frequency: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  responsibility: string;
  priority: 'high' | 'medium' | 'low';
  status: 'upcoming' | 'due_today' | 'overdue' | 'completed';
  reminderDays: number;
  description: string;
}

export default function Page() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPriority, setSelectedPriority] = useState('all');

  const [mockDeadlines, setMockDeadlines] = useState<ComplianceDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const validFrequency: ComplianceDeadline['frequency'][] = [
      'monthly', 'quarterly', 'half_yearly', 'annual',
    ];
    const validStatus: ComplianceDeadline['status'][] = [
      'upcoming', 'due_today', 'overdue', 'completed',
    ];
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.complianceReturns()) as any[];
        // Feed compliance returns into the calendar keyed by their due date.
        const mapped: ComplianceDeadline[] = (raw ?? []).map((r, idx) => {
          const status: ComplianceDeadline['status'] = validStatus.includes(r.status)
            ? r.status
            : r.filingDate
              ? 'completed'
              : 'upcoming';
          return {
            id: String(r.id ?? idx),
            title: r.returnName ?? r.name ?? 'Compliance Return',
            act: r.regulator ?? r.act ?? '',
            dueDate: r.dueDate ?? '',
            frequency: validFrequency.includes(r.frequency) ? r.frequency : 'monthly',
            responsibility: r.responsibility ?? r.regulator ?? '',
            priority: r.priority === 'low' || r.priority === 'medium' ? r.priority : 'high',
            status,
            reminderDays: Number(r.reminderDays ?? 0),
            description: r.description ?? '',
          };
        });
        if (!cancelled) setMockDeadlines(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load compliance calendar');
          setMockDeadlines([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleMarkCompleted = async (id: string) => {
    try {
      setCompletingId(id);
      await HrComplianceDocsService.updateReturn(id, {
        status: 'filed',
        filingDate: new Date().toISOString().slice(0, 10),
      });
      setMockDeadlines(prev =>
        prev.map(d => (d.id === id ? { ...d, status: 'completed' } : d)),
      );
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to mark completed');
    } finally {
      setCompletingId(null);
    }
  };

  const filteredDeadlines = useMemo(() => {
    return mockDeadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.dueDate);
      const matchesMonth = deadlineDate.getMonth() === selectedMonth;
      const matchesYear = deadlineDate.getFullYear() === selectedYear;
      const matchesPriority = selectedPriority === 'all' || deadline.priority === selectedPriority;
      return matchesMonth && matchesYear && matchesPriority;
    });
  }, [mockDeadlines, selectedMonth, selectedYear, selectedPriority]);

  const stats = {
    total: mockDeadlines.length,
    upcoming: mockDeadlines.filter(d => d.status === 'upcoming').length,
    dueToday: mockDeadlines.filter(d => d.status === 'due_today').length,
    overdue: mockDeadlines.filter(d => d.status === 'overdue').length
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-300',
    due_today: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    overdue: 'bg-red-100 text-red-700 border-red-300',
    completed: 'bg-green-100 text-green-700 border-green-300'
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-red-600" />
          Compliance Calendar
        </h1>
        <p className="text-sm text-gray-600 mt-1">Track compliance deadlines and due dates</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading compliance calendar…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Deadlines</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <CalendarIcon className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{stats.upcoming}</p>
            </div>
            <Clock className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Due Today</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.dueToday}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdue}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines.map((deadline) => (
            <div key={deadline.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{deadline.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${statusColors[deadline.status]}`}>
                      {deadline.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[deadline.priority]}`}>
                      {deadline.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium mb-1">{deadline.act}</p>
                  <p className="text-sm text-gray-600">{deadline.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Due Date</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(deadline.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Frequency</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{deadline.frequency.replace('_', ' ')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Responsibility</p>
                  <p className="text-sm font-bold text-gray-900">{deadline.responsibility}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Reminder</p>
                  <p className="text-sm font-bold text-gray-900">{deadline.reminderDays} days before</p>
                </div>
              </div>

              <div className="flex gap-2">
                {deadline.status !== 'completed' && (
                  <button
                    onClick={() => handleMarkCompleted(deadline.id)}
                    disabled={completingId === deadline.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {completingId === deadline.id ? 'Marking...' : 'Mark Completed'}
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <CalendarIcon className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No deadlines found</h3>
            <p className="text-gray-600">No compliance deadlines for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
