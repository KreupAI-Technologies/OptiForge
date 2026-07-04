'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';

interface PayrollCalendarEvent {
  id: string;
  monthYear: string;
  cutoffDate: string;
  attendanceFreeze: string;
  salaryProcessing: string;
  verificationDeadline: string;
  approvalDeadline: string;
  disbursementDate: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  notes?: string;
}

export default function PayrollCalendarPage() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PayrollCalendarEvent | null>(null);

  const [calendar, setCalendar] = useState<PayrollCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await PayrollService.getPayrollCalendar()) as any[];
        const mapped: PayrollCalendarEvent[] = raw.map((r) => ({
          id: String(r.id),
          monthYear: r.monthYear ?? '',
          cutoffDate: r.cutoffDate ?? '',
          attendanceFreeze: r.attendanceFreeze ?? '',
          salaryProcessing: r.salaryProcessing ?? '',
          verificationDeadline: r.verificationDeadline ?? '',
          approvalDeadline: r.approvalDeadline ?? '',
          disbursementDate: r.disbursementDate ?? '',
          status: (r.status ?? 'upcoming') as PayrollCalendarEvent['status'],
          notes: r.notes ?? undefined,
        }));
        if (!cancelled) setCalendar(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load payroll calendar');
          setCalendar([]);
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

  const handleAdd = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEdit = (event: PayrollCalendarEvent) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleSave = (event: PayrollCalendarEvent) => {
    if (editingEvent) {
      setCalendar(calendar.map(e => e.id === event.id ? event : e));
    } else {
      const newEvent = {
        ...event,
        id: `CAL-${event.monthYear.replace(' ', '-')}`
      };
      setCalendar([newEvent, ...calendar]);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const filteredCalendar = useMemo(() => {
    return calendar.filter(event => event.monthYear.includes(selectedYear));
  }, [calendar, selectedYear]);

  const stats = {
    upcoming: calendar.filter(e => e.status === 'upcoming').length,
    inProgress: calendar.filter(e => e.status === 'in_progress').length,
    completed: calendar.filter(e => e.status === 'completed').length,
    nextDisbursement: calendar.find(e => e.status === 'upcoming')?.disbursementDate
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    completed: 'bg-green-100 text-green-700 border-green-200'
  };

  const statusIcons = {
    upcoming: <Clock className="h-4 w-4" />,
    in_progress: <AlertCircle className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Calendar</h1>
        <p className="text-sm text-gray-600 mt-1">Monthly payroll processing schedule and deadlines</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading payroll calendar…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.upcoming}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inProgress}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Next Disbursement</p>
              <p className="text-sm font-bold text-purple-900 mt-1">
                {stats.nextDisbursement && new Date(stats.nextDisbursement).toLocaleDateString('en-IN')}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Calendar Entry
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredCalendar.map(event => (
          <div key={event.id} className={`bg-white rounded-lg shadow-sm border-2 ${statusColors[event.status]} p-3`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{event.monthYear}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[event.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[event.status]}
                      {event.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </span>
                </div>
                {event.notes && (
                  <p className="text-sm text-gray-600 mt-1">📝 {event.notes}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Attendance Cutoff</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(event.cutoffDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Attendance Freeze</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(event.attendanceFreeze).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Salary Processing</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(event.salaryProcessing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Verification Deadline</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(event.verificationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Approval Deadline</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(event.approvalDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-1">💰 Disbursement Date</p>
                  <p className="text-sm font-bold text-green-900">
                    {new Date(event.disbursementDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Processing window: {new Date(event.salaryProcessing).toLocaleDateString('en-IN')} - {new Date(event.disbursementDate).toLocaleDateString('en-IN')}
                </div>
                <div className="flex gap-2">
                  {event.status === 'upcoming' && (
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Edit Schedule
                    </button>
                  )}
                  {event.status === 'completed' && (
                    <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
                      View Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Payroll Processing Timeline</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Day 25:</strong> Attendance cutoff - Last day for attendance marking</li>
          <li>• <strong>Day 26:</strong> Attendance freeze - No changes allowed after this date</li>
          <li>• <strong>Day 27:</strong> Salary processing - Payroll team processes salaries</li>
          <li>• <strong>Day 28:</strong> Verification deadline - Finance team verifies calculations</li>
          <li>• <strong>Day 29:</strong> Approval deadline - Management approves payroll</li>
          <li>• <strong>Day 30/31:</strong> Disbursement - Salaries credited to employee accounts</li>
        </ul>
      </div>

      {showModal && (
        <CalendarEntryModal
          event={editingEvent}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
}

interface CalendarEntryModalProps {
  event: PayrollCalendarEvent | null;
  onSave: (event: PayrollCalendarEvent) => void;
  onClose: () => void;
}

function CalendarEntryModal({ event, onSave, onClose }: CalendarEntryModalProps) {
  const [formData, setFormData] = useState<PayrollCalendarEvent>(
    event || {
      id: '',
      monthYear: '',
      cutoffDate: '',
      attendanceFreeze: '',
      salaryProcessing: '',
      verificationDeadline: '',
      approvalDeadline: '',
      disbursementDate: '',
      status: 'upcoming',
      notes: ''
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof PayrollCalendarEvent, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {event ? 'Edit Calendar Entry' : 'Add Calendar Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month/Year *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., January 2025"
                value={formData.monthYear}
                onChange={(e) => handleChange('monthYear', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as PayrollCalendarEvent['status'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Important Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Cutoff Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.cutoffDate}
                  onChange={(e) => handleChange('cutoffDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance Freeze Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.attendanceFreeze}
                  onChange={(e) => handleChange('attendanceFreeze', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Processing Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.salaryProcessing}
                  onChange={(e) => handleChange('salaryProcessing', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formData.verificationDeadline}
                  onChange={(e) => handleChange('verificationDeadline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={formData.approvalDeadline}
                  onChange={(e) => handleChange('approvalDeadline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disbursement Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.disbursementDate}
                  onChange={(e) => handleChange('disbursementDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional information about this payroll cycle..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="border-t border-gray-200 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {event ? 'Update Entry' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
