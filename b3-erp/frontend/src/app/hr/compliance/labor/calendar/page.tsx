'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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

  const load = useCallback(async () => {
    const validFrequency: ComplianceDeadline['frequency'][] = [
      'monthly', 'quarterly', 'half_yearly', 'annual',
    ];
    const validStatus: ComplianceDeadline['status'][] = [
      'upcoming', 'due_today', 'overdue', 'completed',
    ];
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
      setMockDeadlines(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load compliance calendar');
      setMockDeadlines([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const [completingId, setCompletingId] = useState<string | null>(null);
  const [detailDeadline, setDetailDeadline] = useState<ComplianceDeadline | null>(null);

  // ---- Add Event (backed by hr/compliance-returns; an event is a dated return) ----
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const emptyEvent = {
    returnType: 'pf',
    establishment: '',
    registrationNumber: '',
    dueDate: '',
    remarks: '',
  };
  const [eventForm, setEventForm] = useState({ ...emptyEvent });

  const handleCreateEvent = async () => {
    try {
      setSaving(true);
      await HrComplianceDocsService.createReturn({
        returnType: eventForm.returnType || undefined,
        establishment: eventForm.establishment || undefined,
        registrationNumber: eventForm.registrationNumber || undefined,
        dueDate: eventForm.dueDate || undefined,
        remarks: eventForm.remarks || undefined,
        status: 'draft',
      });
      setShowAdd(false);
      setEventForm({ ...emptyEvent });
      await load();
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to add event');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-red-600" />
            Compliance Calendar
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track compliance deadlines and due dates</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
        >
          <CalendarIcon className="h-4 w-4" />
          Add Event
        </button>
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
                <button onClick={() => setDetailDeadline(deadline)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
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

      {detailDeadline && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Compliance Deadline Details</h2>
              <button onClick={() => setDetailDeadline(null)} className="text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div className="col-span-2"><span className="text-gray-500">Title:</span> <span className="font-medium text-gray-900">{detailDeadline.title}</span></div>
              <div><span className="text-gray-500">Act:</span> <span className="font-medium text-gray-900">{detailDeadline.act}</span></div>
              <div><span className="text-gray-500">Due Date:</span> <span className="font-medium text-gray-900">{detailDeadline.dueDate}</span></div>
              <div><span className="text-gray-500">Frequency:</span> <span className="font-medium text-gray-900">{detailDeadline.frequency}</span></div>
              <div><span className="text-gray-500">Responsibility:</span> <span className="font-medium text-gray-900">{detailDeadline.responsibility}</span></div>
              <div><span className="text-gray-500">Priority:</span> <span className="font-medium text-gray-900">{detailDeadline.priority}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className="font-medium text-gray-900">{detailDeadline.status}</span></div>
              <div><span className="text-gray-500">Reminder Days:</span> <span className="font-medium text-gray-900">{detailDeadline.reminderDays}</span></div>
            </div>
            {detailDeadline.description && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
                <p className="text-sm text-gray-900">{detailDeadline.description}</p>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button onClick={() => setDetailDeadline(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-red-600" />
              Add Compliance Event
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Return Type</label>
                <select
                  value={eventForm.returnType}
                  onChange={(e) => setEventForm({ ...eventForm, returnType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="pf">PF</option>
                  <option value="esi">ESI</option>
                  <option value="tds">TDS</option>
                  <option value="pt">PT</option>
                  <option value="lwf">LWF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Establishment</label>
                <input
                  type="text"
                  value={eventForm.establishment}
                  onChange={(e) => setEventForm({ ...eventForm, establishment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                <input
                  type="text"
                  value={eventForm.registrationNumber}
                  onChange={(e) => setEventForm({ ...eventForm, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={eventForm.dueDate}
                  onChange={(e) => setEventForm({ ...eventForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={eventForm.remarks}
                  onChange={(e) => setEventForm({ ...eventForm, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAdd(false)}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
