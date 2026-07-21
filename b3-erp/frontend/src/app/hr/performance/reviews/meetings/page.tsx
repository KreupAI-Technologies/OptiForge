'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { HrTalentService } from '@/services/hr-talent.service';
import { Calendar, Clock, MapPin, Users, Plus, Video, Monitor } from 'lucide-react';

interface Meeting {
  id: string;
  employeeName: string;
  role: string;
  date: string;
  time: string;
  duration: string;
  type: 'in_person' | 'remote';
  location: string;
  status: 'scheduled' | 'completed';
}

export default function ReviewMeetingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceReviews<any[]>();
        if (!cancelled) setMeetings(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setMeetings([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [formData, setFormData] = useState({
    employeeName: '',
    date: '',
    time: '',
    duration: '30',
    type: 'remote',
    location: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    const newMeeting: Omit<Meeting, 'id'> = {
      employeeName: formData.employeeName,
      role: 'Team Member',
      date: formData.date,
      time: formData.time,
      duration: `${formData.duration} min`,
      type: formData.type as 'in_person' | 'remote',
      location: formData.location || (formData.type === 'remote' ? 'Google Meet' : 'TBD'),
      status: 'scheduled'
    };

    try {
      const created = await HrTalentService.createPerformance<Meeting>(newMeeting as Meeting, {
        recordType: 'review-meeting',
        status: 'scheduled',
      });

      setMeetings(prev => [...prev, { ...(newMeeting as Meeting), ...created } as Meeting].sort((a, b) =>
        new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
      ));

      setShowModal(false);
      setFormData({
        employeeName: '',
        date: '',
        time: '',
        duration: '30',
        type: 'remote',
        location: ''
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to schedule meeting');
    } finally {
      setIsSaving(false);
    }
  };

  const getMeetingIcon = (type: string) => {
    return type === 'remote' ? <Video className="h-5 w-5" /> : <Users className="h-5 w-5" />;
  };

  return (
    <div className="p-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            Review Meetings
          </h1>
          <p className="text-gray-500 mt-1">Schedule and manage 1:1 performance review discussions.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h2>

          <div className="space-y-2">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="h-12 w-12 bg-purple-50 rounded-xl flex flex-col items-center justify-center min-w-[3rem]">
                      <span className="text-xs font-semibold text-purple-600 uppercase">
                        {new Date(meeting.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-purple-700">
                        {new Date(meeting.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{meeting.employeeName}</h3>
                      <p className="text-sm text-gray-500">{meeting.role}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>{meeting.time} ({meeting.duration})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {meeting.type === 'remote' ? <Monitor className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                          <span>{meeting.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      Reschedule
                    </button>
                    {meeting.type === 'remote' && (
                      <button className="px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                        Join Call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hints / Sidebar */}
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-purple-50 to-white p-3 rounded-xl border border-purple-100">
            <h3 className="font-semibold text-purple-900 mb-2">Meeting Tips</h3>
            <ul className="space-y-3 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Review the employee's self-assessment 24h before the meeting.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Prepare specific examples for feedback.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Focus on future growth and development goals.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>Allow time for the employee to ask questions.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Schedule Review</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSchedule} className="p-6 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.employeeName}
                  onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="remote"
                      checked={formData.type === 'remote'}
                      onChange={e => setFormData({ ...formData, type: 'remote' })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>Remote (Video)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="in_person"
                      checked={formData.type === 'in_person'}
                      onChange={e => setFormData({ ...formData, type: 'in_person' })}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>In Person</span>
                  </label>
                </div>
              </div>

              {formData.type === 'in_person' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g. Conference Room B"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              )}

              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  {isSaving ? 'Scheduling…' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
