'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, CheckCircle, Clock, Calendar, BookOpen, FileText, Video, Award } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface InductionSession {
  id: string;
  sessionDate: string;
  sessionTime: string;
  batchNumber: string;
  venue: string;
  conductor: string;
  capacity: number;
  enrolled: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  attendees: number;
  duration: number;
}

interface InductionAttendee {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  sessionId: string;
  attendance: 'present' | 'absent' | 'pending';
  completionStatus: 'pending' | 'in_progress' | 'completed';
  certificateIssued: boolean;
}

export default function Page() {
  const [selectedView, setSelectedView] = useState<'sessions' | 'attendees'>('sessions');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [mockSessions, setMockSessions] = useState<InductionSession[]>([]);
  const [mockAttendees, setMockAttendees] = useState<InductionAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [sessions, attendees] = await Promise.all([
          OnboardingTasksService.list('induction-sessions'),
          OnboardingTasksService.list('induction-attendees'),
        ]);
        if (!active) return;
        setMockSessions(
          sessions.map((r: OnboardingTaskRecord) => ({
            id: r.id,
            status: (r.status as any) || 'scheduled',
            ...(r.data || {}),
          })) as unknown as InductionSession[],
        );
        setMockAttendees(
          attendees.map((r: OnboardingTaskRecord) => ({
            id: r.id,
            employeeCode: r.employeeCode || '',
            employeeName: r.employeeName || '',
            designation: r.designation || '',
            department: r.department || '',
            joiningDate: r.joiningDate || '',
            ...(r.data || {}),
          })) as unknown as InductionAttendee[],
        );
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const _unusedMockSessions: InductionSession[] = [
    {
      id: '1', sessionDate: '2024-11-25', sessionTime: '09:00 AM - 01:00 PM', batchNumber: 'HR-IND-NOV-01',
      venue: 'Training Hall A', conductor: 'Priya Sharma', capacity: 20, enrolled: 18, status: 'completed',
      attendees: 17, duration: 240
    },
    {
      id: '2', sessionDate: '2024-12-02', sessionTime: '09:00 AM - 01:00 PM', batchNumber: 'HR-IND-DEC-01',
      venue: 'Training Hall A', conductor: 'Priya Sharma', capacity: 20, enrolled: 12, status: 'scheduled',
      attendees: 0, duration: 240
    },
    {
      id: '3', sessionDate: '2024-12-09', sessionTime: '09:00 AM - 01:00 PM', batchNumber: 'HR-IND-DEC-02',
      venue: 'Training Hall B', conductor: 'Anjali Mehta', capacity: 20, enrolled: 8, status: 'scheduled',
      attendees: 0, duration: 240
    },
    {
      id: '4', sessionDate: '2024-11-18', sessionTime: '09:00 AM - 01:00 PM', batchNumber: 'HR-IND-NOV-02',
      venue: 'Training Hall A', conductor: 'Priya Sharma', capacity: 20, enrolled: 15, status: 'completed',
      attendees: 14, duration: 240
    }
  ];

  const _unusedMockAttendees: InductionAttendee[] = [
    {
      id: '1', employeeCode: 'KMF-2024-145', employeeName: 'Arun Verma', designation: 'CNC Operator',
      department: 'Manufacturing', joiningDate: '2024-12-01', sessionId: '2', attendance: 'pending',
      completionStatus: 'pending', certificateIssued: false
    },
    {
      id: '2', employeeCode: 'KMF-2024-146', employeeName: 'Sneha Patil', designation: 'Quality Inspector',
      department: 'Quality Assurance', joiningDate: '2024-12-05', sessionId: '2', attendance: 'pending',
      completionStatus: 'pending', certificateIssued: false
    },
    {
      id: '3', employeeCode: 'KMF-2024-143', employeeName: 'Karthik Reddy', designation: 'Production Supervisor',
      department: 'Manufacturing', joiningDate: '2024-11-25', sessionId: '1', attendance: 'present',
      completionStatus: 'completed', certificateIssued: true
    },
    {
      id: '4', employeeCode: 'KMF-2024-144', employeeName: 'Ramesh Iyer', designation: 'Electrician',
      department: 'Maintenance', joiningDate: '2024-11-26', sessionId: '1', attendance: 'present',
      completionStatus: 'completed', certificateIssued: true
    },
    {
      id: '5', employeeCode: 'KMF-2024-148', employeeName: 'Neha Singh', designation: 'Maintenance Technician',
      department: 'Maintenance', joiningDate: '2024-12-10', sessionId: '3', attendance: 'pending',
      completionStatus: 'pending', certificateIssued: false
    }
  ];

  const filteredSessions = useMemo(() => {
    return mockSessions.filter(session =>
      selectedStatus === 'all' || session.status === selectedStatus
    );
  }, [selectedStatus]);

  const stats = {
    totalSessions: mockSessions.length,
    scheduled: mockSessions.filter(s => s.status === 'scheduled').length,
    completed: mockSessions.filter(s => s.status === 'completed').length,
    totalAttendees: mockAttendees.length,
    certificatesIssued: mockAttendees.filter(a => a.certificateIssued).length,
    avgAttendance: Math.round((mockSessions.reduce((sum, s) => sum + (s.attendees / s.enrolled * 100 || 0), 0) / mockSessions.filter(s => s.status === 'completed').length) || 0)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors];
  };

  const sessionColumns = [
    { key: 'batchNumber', label: 'Batch', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'sessionDate', label: 'Date', sortable: true,
      render: (v: string, row: InductionSession) => (
        <div>
          <div className="text-sm text-gray-900">
            {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">{row.sessionTime}</div>
        </div>
      )
    },
    { key: 'venue', label: 'Venue', sortable: true,
      render: (v: string, row: InductionSession) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">Conductor: {row.conductor}</div>
        </div>
      )
    },
    { key: 'enrolled', label: 'Enrollment', sortable: true,
      render: (v: number, row: InductionSession) => (
        <div className="text-sm text-gray-700">{v}/{row.capacity}</div>
      )
    },
    { key: 'attendees', label: 'Attendance', sortable: true,
      render: (v: number, row: InductionSession) => (
        <div className="text-sm text-gray-700">
          {row.status === 'completed' ? `${v}/${row.enrolled}` : '—'}
        </div>
      )
    },
    { key: 'duration', label: 'Duration', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v / 60}h</div>
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  const attendeeColumns = [
    { key: 'employeeCode', label: 'Employee ID', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: InductionAttendee) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'joiningDate', label: 'Joining Date', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'attendance', label: 'Attendance', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.toUpperCase()}
        </span>
      )
    },
    { key: 'completionStatus', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    { key: 'certificateIssued', label: 'Certificate', sortable: true,
      render: (v: boolean) => (
        v ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-400" />
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          HR Induction Program
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive HR orientation for new employees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalSessions}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalAttendees}</p>
            </div>
            <Users className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificates</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.certificatesIssued}</p>
            </div>
            <Award className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgAttendance}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('sessions')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'sessions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Induction Sessions
          </button>
          <button
            onClick={() => setSelectedView('attendees')}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedView === 'attendees'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Employee Attendance
          </button>
        </div>
      </div>

      {/* Filters */}
      {selectedView === 'sessions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      {selectedView === 'sessions' ? (
        <DataTable data={filteredSessions} columns={sessionColumns} />
      ) : (
        <DataTable data={mockAttendees} columns={attendeeColumns} />
      )}

      {/* Induction Program Content */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">HR Induction Program Agenda (4 Hours)</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Session 1: Welcome & Company Overview (60 min)</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Company history, vision, mission, and values</li>
                <li>• Organization structure and leadership team</li>
                <li>• Product portfolio and manufacturing capabilities</li>
                <li>• Quality certifications and industry standards</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Session 2: HR Policies & Benefits (90 min)</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Employment terms, working hours, and attendance policy</li>
                <li>• Leave policy, holidays, and time-off procedures</li>
                <li>• Compensation structure, allowances, and payroll schedule</li>
                <li>• Health insurance, PF, ESI, and gratuity benefits</li>
                <li>• Performance appraisal and career growth opportunities</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Session 3: Code of Conduct & Compliance (45 min)</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Professional ethics and workplace behavior</li>
                <li>• Anti-harassment and discrimination policy</li>
                <li>• Data security and confidentiality agreements</li>
                <li>• Labor laws and statutory compliance</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Session 4: Systems & Q&A (45 min)</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• HRMS portal walkthrough and self-service features</li>
                <li>• Email, collaboration tools, and communication channels</li>
                <li>• Employee handbook and resource access</li>
                <li>• Open Q&A and certificate distribution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">HR Induction Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• HR induction is mandatory for all new employees</li>
          <li>• Sessions are conducted bi-weekly on Mondays</li>
          <li>• Maximum capacity of 20 employees per session</li>
          <li>• Completion certificate is issued upon 100% attendance</li>
          <li>• Employees must complete HR induction before department orientation</li>
          <li>• All session materials are available on the employee portal</li>
        </ul>
      </div>
    </div>
  );
}
