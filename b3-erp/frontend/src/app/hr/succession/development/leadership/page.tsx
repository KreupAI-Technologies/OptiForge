'use client';

import { useState, useEffect } from 'react';
import { Award, Users, BookOpen, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface LeadershipProgram {
  id: string;
  programName: string;
  description: string;
  provider: string;
  level: 'emerging' | 'mid_level' | 'senior' | 'executive';
  duration: string;
  format: 'classroom' | 'online' | 'hybrid' | 'workshop' | 'coaching';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  participants: {
    name: string;
    employeeCode: string;
    department: string;
    status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
    progress: number;
  }[];
  modules: string[];
  budget: number;
  location: string;
  capacity: number;
  coordinator: string;
}

export default function Page() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const mockPrograms: LeadershipProgram[] = [
    {
      id: '1',
      programName: 'Executive Leadership Program',
      description: 'Comprehensive executive leadership development for C-suite preparation',
      provider: 'IIM Bangalore',
      level: 'executive',
      duration: '6 months',
      format: 'hybrid',
      status: 'ongoing',
      startDate: '2024-09-01',
      endDate: '2025-03-31',
      participants: [
        { name: 'Kavita Singh', employeeCode: 'EMP008', department: 'IT', status: 'in_progress', progress: 65 },
        { name: 'Rahul Mehta', employeeCode: 'EMP015', department: 'Finance', status: 'in_progress', progress: 60 }
      ],
      modules: [
        'Strategic Leadership',
        'Board Communication',
        'P&L Management',
        'Organizational Transformation',
        'Executive Presence',
        'Crisis Management'
      ],
      budget: 1000000,
      location: 'Bangalore / Online',
      capacity: 25,
      coordinator: 'Anjali Desai (CHRO)'
    },
    {
      id: '2',
      programName: 'Advanced Sales Leadership',
      description: 'Strategic sales leadership for senior sales roles',
      provider: 'XLRI Jamshedpur',
      level: 'senior',
      duration: '7 months',
      format: 'hybrid',
      status: 'ongoing',
      startDate: '2024-10-01',
      endDate: '2025-04-30',
      participants: [
        { name: 'Arjun Kapoor', employeeCode: 'EMP007', department: 'Sales', status: 'in_progress', progress: 55 },
        { name: 'Priya Sharma', employeeCode: 'EMP021', department: 'Sales', status: 'in_progress', progress: 50 }
      ],
      modules: [
        'Sales Strategy & Planning',
        'Team Leadership',
        'Multi-Regional Management',
        'Business Development',
        'Client Relationship Management',
        'Sales Analytics'
      ],
      budget: 700000,
      location: 'Jamshedpur / Online',
      capacity: 30,
      coordinator: 'Vikram Singh (VP Sales)'
    },
    {
      id: '3',
      programName: 'Senior HR Leadership Program',
      description: 'Strategic HR leadership for CHRO preparation',
      provider: 'SHRM India',
      level: 'senior',
      duration: '11 months',
      format: 'hybrid',
      status: 'ongoing',
      startDate: '2024-07-01',
      endDate: '2025-05-31',
      participants: [
        { name: 'Neha Gupta', employeeCode: 'EMP012', department: 'HR', status: 'in_progress', progress: 50 },
        { name: 'Amit Patel', employeeCode: 'EMP018', department: 'HR', status: 'in_progress', progress: 48 }
      ],
      modules: [
        'Strategic HR Management',
        'Organizational Development',
        'Change Management',
        'Talent Management',
        'HR Analytics',
        'Business Partnering'
      ],
      budget: 800000,
      location: 'Multiple Cities / Online',
      capacity: 20,
      coordinator: 'Anjali Desai (CHRO)'
    },
    {
      id: '4',
      programName: 'Mid-Level Leadership Development',
      description: 'Leadership fundamentals for emerging managers',
      provider: 'Dale Carnegie India',
      level: 'mid_level',
      duration: '3 months',
      format: 'classroom',
      status: 'upcoming',
      startDate: '2025-02-01',
      endDate: '2025-04-30',
      participants: [
        { name: 'Suresh Kumar', employeeCode: 'EMP022', department: 'Operations', status: 'enrolled', progress: 0 },
        { name: 'Anjali Rao', employeeCode: 'EMP023', department: 'Marketing', status: 'enrolled', progress: 0 },
        { name: 'Deepak Verma', employeeCode: 'EMP024', department: 'IT', status: 'enrolled', progress: 0 }
      ],
      modules: [
        'Leadership Fundamentals',
        'Team Management',
        'Communication Skills',
        'Conflict Resolution',
        'Performance Management',
        'Motivation & Engagement'
      ],
      budget: 450000,
      location: 'Mumbai',
      capacity: 40,
      coordinator: 'Neha Gupta (HR Manager)'
    },
    {
      id: '5',
      programName: 'Emerging Leaders Program',
      description: 'First-time manager development program',
      provider: 'Leadership Circle',
      level: 'emerging',
      duration: '2 months',
      format: 'online',
      status: 'completed',
      startDate: '2024-08-01',
      endDate: '2024-10-31',
      participants: [
        { name: 'Rohit Sharma', employeeCode: 'EMP026', department: 'IT', status: 'completed', progress: 100 },
        { name: 'Sneha Joshi', employeeCode: 'EMP027', department: 'Finance', status: 'completed', progress: 100 },
        { name: 'Manish Gupta', employeeCode: 'EMP028', department: 'Sales', status: 'completed', progress: 100 }
      ],
      modules: [
        'Transition to Leadership',
        'Basic Team Management',
        'Effective Communication',
        'Time Management',
        'Delegation Skills',
        'Feedback & Coaching'
      ],
      budget: 300000,
      location: 'Online',
      capacity: 50,
      coordinator: 'Neha Gupta (HR Manager)'
    },
    {
      id: '6',
      programName: 'Strategic Operations Leadership',
      description: 'Operations excellence for senior operations leaders',
      provider: 'ISB Hyderabad',
      level: 'senior',
      duration: '4 months',
      format: 'classroom',
      status: 'upcoming',
      startDate: '2025-03-01',
      endDate: '2025-06-30',
      participants: [
        { name: 'Vikram Singh', employeeCode: 'EMP020', department: 'Operations', status: 'enrolled', progress: 0 }
      ],
      modules: [
        'Strategic Operations Management',
        'Process Optimization',
        'Supply Chain Leadership',
        'Digital Operations',
        'Risk Management',
        'Lean Six Sigma'
      ],
      budget: 600000,
      location: 'Hyderabad',
      capacity: 25,
      coordinator: 'Ramesh Nair (COO)'
    }
  ];

  const [rows, setRows] = useState<LeadershipProgram[]>(mockPrograms);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<LeadershipProgram>('leadership');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPrograms = rows.filter(program => {
    const matchesLevel = selectedLevel === 'all' || program.level === selectedLevel;
    const matchesStatus = selectedStatus === 'all' || program.status === selectedStatus;
    return matchesLevel && matchesStatus;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'executive': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'senior': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'mid_level': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'emerging': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'upcoming': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getParticipantStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'enrolled': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'dropped': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalPrograms = rows.length;
  const ongoingPrograms = rows.filter(p => p.status === 'ongoing').length;
  const totalParticipants = rows.reduce((sum, p) => sum + p.participants.length, 0);
  const totalBudget = rows.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-teal-600" />
          Leadership Programs
        </h1>
        <p className="text-sm text-gray-600 mt-1">Leadership development programs and training</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Programs</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalPrograms}</p>
            </div>
            <Award className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Ongoing</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{ongoingPrograms}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Participants</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{totalParticipants}</p>
            </div>
            <Users className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Budget</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(totalBudget)}</p>
            </div>
            <BookOpen className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Levels</option>
              <option value="executive">Executive</option>
              <option value="senior">Senior</option>
              <option value="mid_level">Mid-Level</option>
              <option value="emerging">Emerging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{program.programName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getLevelColor(program.level)}`}>
                    {program.level.replace('_', '-').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getStatusColor(program.status)}`}>
                    {program.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{program.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Provider</p>
                <p className="text-sm font-bold text-gray-900">{program.provider}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Duration</p>
                <p className="text-sm font-bold text-gray-900">{program.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Format</p>
                <p className="text-sm font-bold text-gray-900">{program.format}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-bold text-gray-900">{program.location}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-bold text-gray-900">Modules</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {program.modules.map((module, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                    {module}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-teal-600" />
                <h4 className="text-sm font-bold text-gray-900">Participants ({program.participants.length}/{program.capacity})</h4>
              </div>
              <div className="space-y-2">
                {program.participants.map((participant, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{participant.name}</p>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getParticipantStatusBadge(participant.status)}`}>
                            {participant.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{participant.employeeCode} • {participant.department}</p>
                      </div>
                      {participant.status === 'in_progress' && (
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Progress</p>
                          <p className="text-sm font-bold text-teal-600">{participant.progress}%</p>
                        </div>
                      )}
                    </div>
                    {participant.status === 'in_progress' && (
                      <div className="bg-gray-200 rounded-full h-2">
                        <div className="bg-teal-500 rounded-full h-2 transition-all" style={{ width: `${participant.progress}%` }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(program.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(program.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-bold text-gray-900 ml-2">{formatCurrency(program.budget)}</span>
                </div>
                <div className="text-gray-600">
                  Coordinator: <span className="font-semibold text-gray-900">{program.coordinator.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
