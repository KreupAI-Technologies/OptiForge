'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { TrainingDevelopmentService } from '@/services/training-development.service';

interface Session {
  id: string;
  title: string;
  trainer: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'workshop' | 'webinar';
  conflict?: boolean;
}

export default function ProgramSchedulePage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentMonth] = useState('April 2024');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ startDate: '', endDate: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data } = await TrainingDevelopmentService.getTrainingSchedules();
      const mapped: Session[] = (Array.isArray(data) ? data : []).map((r: any) => ({
        id: String(r.id ?? ''),
        title: r.title ?? r.batchName ?? '',
        trainer: r.trainer ?? r.instructorName ?? '',
        date: r.startDate ?? '',
        time: r.time ?? '',
        location: r.location ?? '',
        attendees: Number(r.enrolled ?? r.enrolledCount ?? 0),
        type: r.type === 'webinar' ? 'webinar' : 'workshop',
        conflict: Boolean(r.conflict),
      }));
      setSessions(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openReschedule = (session: Session) => {
    setActionError(null);
    setActionSuccess(null);
    setRescheduleForm({ startDate: session.date, endDate: '', location: session.location });
    setRescheduleId(session.id);
  };

  const handleReschedule = async () => {
    if (!rescheduleId) return;
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await TrainingDevelopmentService.updateTrainingSchedule(rescheduleId, {
        startDate: rescheduleForm.startDate || undefined,
        endDate: rescheduleForm.endDate || undefined,
        location: rescheduleForm.location || undefined,
      });
      setActionSuccess('Session rescheduled.');
      setRescheduleId(null);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reschedule session.');
    } finally {
      setSaving(false);
    }
  };

  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="p-6 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            Program Schedule
          </h1>
          <p className="text-gray-500 mt-1">Manage training sessions and availability.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            List View
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading sessions…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{actionSuccess}</div>
      )}

      {view === 'calendar' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{currentMonth}</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-5 w-5 text-gray-500" /></button>
              <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-5 w-5 text-gray-500" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center border-b border-gray-200 bg-gray-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-sm font-medium text-gray-500">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map(day => {
              const daySessions = sessions.filter(s => new Date(s.date).getDate() === day);
              return (
                <div key={day} className="min-h-[120px] p-2 border-b border-r border-gray-100 hover:bg-gray-50 transition-colors relative">
                  <span className="text-sm font-medium text-gray-400 block mb-2">{day}</span>
                  <div className="space-y-1">
                    {daySessions.map(session => (
                      <div
                        key={session.id}
                        className={`text-xs p-1.5 rounded border truncate cursor-pointer ${session.conflict
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                      >
                        {session.conflict && <AlertCircle className="h-3 w-3 inline mr-1" />}
                        {session.time.split(' ')[0]} {session.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {sessions.map(session => (
              <div key={session.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-2">
                  <div className={`p-3 rounded-lg ${session.conflict ? 'bg-red-50' : 'bg-purple-50'}`}>
                    {session.conflict ? (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <Calendar className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {session.title}
                      {session.conflict && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Conflict</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">Trainer: {session.trainer}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.date} • {session.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {session.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-gray-900 font-medium justify-center">
                      <Users className="h-4 w-4 text-gray-400" />
                      {session.attendees}
                    </div>
                    <span className="text-xs text-gray-500">Attendees</span>
                  </div>
                  <button
                    onClick={() => openReschedule(session)}
                    className="px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors bg-white"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rescheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reschedule Session</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={rescheduleForm.startDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, startDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={rescheduleForm.endDate}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, endDate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={rescheduleForm.location}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setRescheduleId(null)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
