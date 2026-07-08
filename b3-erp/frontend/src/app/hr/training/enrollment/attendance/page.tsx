'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { CheckSquare, Calendar, Search, UserCheck, UserX, Clock, Save } from 'lucide-react';

interface Attendee {
  id: string;
  name: string;
  role: string;
  status: 'Present' | 'Absent' | 'Late';
}

export default function AttendancePage() {
  const [selectedSession, setSelectedSession] = useState('1');

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.trainingEnrollments<any[]>();
        if (!cancelled) setAttendees(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setAttendees([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const stats = {
    present: attendees.filter(a => a.status === 'Present').length,
    absent: attendees.filter(a => a.status === 'Absent').length,
    late: attendees.filter(a => a.status === 'Late').length,
    total: attendees.length
  };

  const updateStatus = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendees(attendees.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleSave = async () => {
    if (attendees.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const attendanceValue: Record<Attendee['status'], number> = {
        Present: 100,
        Late: 50,
        Absent: 0,
      };
      await Promise.all(
        attendees.map((a) =>
          HrPagesService.updateTrainingEnrollment(a.id, {
            attendance: attendanceValue[a.status],
            status: a.status === 'Absent' ? 'upcoming' : 'in-progress',
          }),
        ),
      );
      setSaveSuccess(`Attendance saved for ${attendees.length} attendee(s).`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-purple-600" />
            Training Attendance
          </h1>
          <p className="text-gray-500 mt-1">Mark and track attendance for training sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Advanced React Patterns • April 10, 2024</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || isLoading || attendees.length === 0}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Records'}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}
      {saveError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
      )}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{saveSuccess}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Stats Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg"><UserCheck className="h-5 w-5 text-green-600" /></div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg"><UserX className="h-5 w-5 text-red-600" /></div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Late</p>
              <p className="text-2xl font-bold text-orange-600">{stats.late}</p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg"><Clock className="h-5 w-5 text-orange-600" /></div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Attendance Rate</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(((stats.present + stats.late) / stats.total) * 100)}%</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg"><CheckSquare className="h-5 w-5 text-purple-600" /></div>
          </div>
        </div>

        {/* Main List */}
        <div className="lg:col-span-4">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Attendee List</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search attendee..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium pl-4">Employee</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendees.map(attendee => (
                    <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-4 font-medium text-gray-900">{attendee.name}</td>
                      <td className="py-4 text-gray-600 text-sm">{attendee.role}</td>
                      <td className="py-4">
                        <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                          <button
                            onClick={() => updateStatus(attendee.id, 'Present')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${attendee.status === 'Present' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => updateStatus(attendee.id, 'Late')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${attendee.status === 'Late' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => updateStatus(attendee.id, 'Absent')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${attendee.status === 'Absent' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-sm text-purple-600 font-medium hover:text-purple-700">Add Note</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
