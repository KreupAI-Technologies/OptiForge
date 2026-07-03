'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, User, MapPin, Shield, Laptop, Key, Coffee, Users } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { OnboardingTasksService, OnboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface FirstDayTask {
  id: string;
  task: string;
  category: 'arrival' | 'documentation' | 'facilities' | 'it' | 'orientation' | 'team';
  time: string;
  owner: string;
  location: string;
  status: 'pending' | 'completed';
}

interface NewJoiner {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  joiningDate: string;
  reportingManager: string;
  firstDayTasks: FirstDayTask[];
  overallProgress: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  buddy?: string;
}

export default function Page() {
  const [selectedDate, setSelectedDate] = useState('2024-12-01');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [mockJoiners, setMockJoiners] = useState<NewJoiner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OnboardingTasksService.list('first-day');
        if (!active) return;
        const mapped = records.map((r: OnboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          joiningDate: r.joiningDate || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
          ...(r.items ? { firstDayTasks: r.items } : {}),
        })) as NewJoiner[];
        setMockJoiners(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockJoiners: NewJoiner[] = [
    {
      id: '1', employeeCode: 'KMF-2024-145', employeeName: 'Arun Verma', designation: 'CNC Operator',
      department: 'Manufacturing', joiningDate: '2024-12-01', reportingManager: 'Rajesh Kumar',
      overallProgress: 75, status: 'in_progress', buddy: 'Vikram Singh',
      firstDayTasks: [
        { id: '1', task: 'Report to reception', category: 'arrival', time: '09:00 AM', owner: 'Reception', location: 'Main Gate', status: 'completed' },
        { id: '2', task: 'Meet HR for welcome & documentation', category: 'documentation', time: '09:15 AM', owner: 'HR Team', location: 'HR Office', status: 'completed' },
        { id: '3', task: 'Collect employee ID card', category: 'facilities', time: '09:45 AM', owner: 'Admin', location: 'Admin Office', status: 'completed' },
        { id: '4', task: 'Assign locker & safety gear', category: 'facilities', time: '10:00 AM', owner: 'Facilities', location: 'Locker Room', status: 'completed' },
        { id: '5', task: 'Setup email & system access', category: 'it', time: '10:30 AM', owner: 'IT Team', location: 'IT Desk', status: 'completed' },
        { id: '6', task: 'Lunch with team & buddy', category: 'team', time: '12:30 PM', owner: 'Manager', location: 'Cafeteria', status: 'completed' },
        { id: '7', task: 'Safety orientation training', category: 'orientation', time: '02:00 PM', owner: 'Safety Officer', location: 'Training Hall', status: 'pending' },
        { id: '8', task: 'Department tour & introduction', category: 'team', time: '03:30 PM', owner: 'Manager', location: 'Production Floor', status: 'pending' }
      ]
    },
    {
      id: '2', employeeCode: 'KMF-2024-146', employeeName: 'Sneha Patil', designation: 'Quality Inspector',
      department: 'Quality Assurance', joiningDate: '2024-12-05', reportingManager: 'Meena Rao',
      overallProgress: 0, status: 'scheduled', buddy: 'Anjali Desai',
      firstDayTasks: [
        { id: '1', task: 'Report to reception', category: 'arrival', time: '09:00 AM', owner: 'Reception', location: 'Main Gate', status: 'pending' },
        { id: '2', task: 'Meet HR for welcome & documentation', category: 'documentation', time: '09:15 AM', owner: 'HR Team', location: 'HR Office', status: 'pending' },
        { id: '3', task: 'Collect employee ID card', category: 'facilities', time: '09:45 AM', owner: 'Admin', location: 'Admin Office', status: 'pending' },
        { id: '4', task: 'Assign locker & safety gear', category: 'facilities', time: '10:00 AM', owner: 'Facilities', location: 'Locker Room', status: 'pending' },
        { id: '5', task: 'Setup email & system access', category: 'it', time: '10:30 AM', owner: 'IT Team', location: 'IT Desk', status: 'pending' },
        { id: '6', task: 'Lunch with team & buddy', category: 'team', time: '12:30 PM', owner: 'Manager', location: 'Cafeteria', status: 'pending' },
        { id: '7', task: 'Safety orientation training', category: 'orientation', time: '02:00 PM', owner: 'Safety Officer', location: 'Training Hall', status: 'pending' },
        { id: '8', task: 'Department tour & introduction', category: 'team', time: '03:30 PM', owner: 'Manager', location: 'QA Lab', status: 'pending' }
      ]
    },
    {
      id: '3', employeeCode: 'KMF-2024-147', employeeName: 'Karthik Reddy', designation: 'Production Supervisor',
      department: 'Manufacturing', joiningDate: '2024-11-25', reportingManager: 'Rajesh Kumar',
      overallProgress: 100, status: 'completed', buddy: 'Ramesh Patel',
      firstDayTasks: [
        { id: '1', task: 'Report to reception', category: 'arrival', time: '09:00 AM', owner: 'Reception', location: 'Main Gate', status: 'completed' },
        { id: '2', task: 'Meet HR for welcome & documentation', category: 'documentation', time: '09:15 AM', owner: 'HR Team', location: 'HR Office', status: 'completed' },
        { id: '3', task: 'Collect employee ID card', category: 'facilities', time: '09:45 AM', owner: 'Admin', location: 'Admin Office', status: 'completed' },
        { id: '4', task: 'Assign locker & safety gear', category: 'facilities', time: '10:00 AM', owner: 'Facilities', location: 'Locker Room', status: 'completed' },
        { id: '5', task: 'Setup email & system access', category: 'it', time: '10:30 AM', owner: 'IT Team', location: 'IT Desk', status: 'completed' },
        { id: '6', task: 'Lunch with team & buddy', category: 'team', time: '12:30 PM', owner: 'Manager', location: 'Cafeteria', status: 'completed' },
        { id: '7', task: 'Safety orientation training', category: 'orientation', time: '02:00 PM', owner: 'Safety Officer', location: 'Training Hall', status: 'completed' },
        { id: '8', task: 'Department tour & introduction', category: 'team', time: '03:30 PM', owner: 'Manager', location: 'Production Floor', status: 'completed' }
      ]
    }
  ];

  const filteredJoiners = useMemo(() => {
    return mockJoiners.filter(joiner => {
      const matchesDate = joiner.joiningDate === selectedDate;
      const matchesStatus = selectedStatus === 'all' || joiner.status === selectedStatus;
      return matchesDate && matchesStatus;
    });
  }, [selectedDate, selectedStatus]);

  const stats = {
    total: mockJoiners.length,
    today: mockJoiners.filter(j => j.joiningDate === selectedDate).length,
    scheduled: mockJoiners.filter(j => j.status === 'scheduled').length,
    inProgress: mockJoiners.filter(j => j.status === 'in_progress').length,
    completed: mockJoiners.filter(j => j.status === 'completed').length,
    avgProgress: Math.round(mockJoiners.reduce((sum, j) => sum + j.overallProgress, 0) / mockJoiners.length)
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      arrival: MapPin,
      documentation: Shield,
      facilities: Key,
      it: Laptop,
      orientation: Users,
      team: Coffee
    };
    const Icon = icons[category as keyof typeof icons] || Clock;
    return <Icon className="h-5 w-5" />;
  };

  const columns = [
    { key: 'employeeCode', label: 'Employee ID', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'employeeName', label: 'Employee', sortable: true,
      render: (v: string, row: NewJoiner) => (
        <div>
          <div className="font-medium text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">{row.designation}</div>
        </div>
      )
    },
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string, row: NewJoiner) => (
        <div>
          <div className="text-sm text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">Manager: {row.reportingManager}</div>
        </div>
      )
    },
    { key: 'buddy', label: 'Buddy Assigned', sortable: true,
      render: (v: string | undefined) => <div className="text-sm text-gray-700">{v || '—'}</div>
    },
    { key: 'overallProgress', label: 'Progress', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
            <div className={`h-2 rounded-full ${getProgressColor(v)}`} style={{ width: `${v}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-900">{v}%</span>
        </div>
      )
    },
    { key: 'firstDayTasks', label: 'Tasks', sortable: false,
      render: (_: any, row: NewJoiner) => {
        const completed = row.firstDayTasks.filter(task => task.status === 'completed').length;
        const total = row.firstDayTasks.length;
        return <div className="text-sm text-gray-700">{completed}/{total}</div>;
      }
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.replace('_', ' ').toUpperCase()}
        </span>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="h-8 w-8 text-blue-600" />
          First Day Setup
        </h1>
        <p className="text-gray-600 mt-2">Ensure smooth first day experience for new joiners</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Joiners</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <User className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
            </div>
            <Calendar className="h-10 w-10 text-purple-400" />
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
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-400" />
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
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.avgProgress}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            </select>
          </div>
        </div>
      </div>

      {/* Joiners Table */}
      <DataTable data={filteredJoiners} columns={columns} />

      {/* First Day Timeline */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard First Day Timeline</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('arrival')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">09:00 AM - Arrival & Reception</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">15 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Report to main gate reception, collect visitor pass</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-600">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('documentation')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">09:15 AM - HR Welcome & Documentation</h4>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">30 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Welcome session, document verification, offer letter signing</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-600">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('facilities')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">09:45 AM - Facilities Setup</h4>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">45 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">ID card issuance, locker assignment, safety gear distribution</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-600">
            <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('it')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">10:30 AM - IT Setup</h4>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">60 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Email account setup, system access, HRMS portal training</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-lg border-l-4 border-teal-600">
            <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('team')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">12:30 PM - Team Lunch</h4>
                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">60 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Lunch with team members and assigned buddy</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border-l-4 border-red-600">
            <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('orientation')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">02:00 PM - Safety Orientation</h4>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">90 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Mandatory safety training and facility emergency procedures</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
              {getCategoryIcon('team')}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900">03:30 PM - Department Tour & Introductions</h4>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">90 min</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Department walkthrough, team introductions, workstation setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">First Day Setup Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• HR must confirm all pre-joining tasks are completed before first day</li>
          <li>• Buddy should be assigned at least 2 days before joining date</li>
          <li>• IT setup must be completed before lunch break</li>
          <li>• Safety orientation is mandatory and must be completed on Day 1</li>
          <li>• Manager should spend quality time with new joiner during department tour</li>
          <li>• End-of-day feedback should be collected from new joiner</li>
        </ul>
      </div>
    </div>
  );
}
