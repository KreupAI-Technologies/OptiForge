'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Calendar, Target, MessageCircle, CheckCircle } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface MentoringPair {
  id: string;
  mentor: {
    name: string;
    employeeCode: string;
    role: string;
    department: string;
    yearsOfExperience: number;
    photo: string;
  };
  mentee: {
    name: string;
    employeeCode: string;
    role: string;
    department: string;
    photo: string;
  };
  programType: 'succession' | 'leadership' | 'technical' | 'career_development';
  status: 'active' | 'completed' | 'on_hold' | 'discontinued';
  startDate: string;
  endDate?: string;
  goals: string[];
  progress: number;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly';
  lastMeetingDate: string;
  nextMeetingDate?: string;
  totalMeetings: number;
  completedMilestones: number;
  totalMilestones: number;
}

export default function Page() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [rows, setRows] = useState<MentoringPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<MentoringPair>('mentoring');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredPairs = rows.filter(pair => {
    const matchesType = selectedType === 'all' || pair.programType === selectedType;
    const matchesStatus = selectedStatus === 'all' || pair.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'succession': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'leadership': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'technical': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'career_development': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'discontinued': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const totalPairs = rows.length;
  const activePairs = rows.filter(p => p.status === 'active').length;
  const avgProgress = Math.round(rows.reduce((sum, p) => sum + p.progress, 0) / totalPairs);
  const totalMeetings = rows.reduce((sum, p) => sum + p.totalMeetings, 0);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-teal-600" />
          Mentoring Programs
        </h1>
        <p className="text-sm text-gray-600 mt-1">Mentor-mentee relationships and progress tracking</p>
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
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Pairs</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalPairs}</p>
            </div>
            <Users className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{activePairs}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Avg. Progress</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{avgProgress}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Meetings</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalMeetings}</p>
            </div>
            <MessageCircle className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Program Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Types</option>
              <option value="succession">Succession</option>
              <option value="leadership">Leadership</option>
              <option value="technical">Technical</option>
              <option value="career_development">Career Development</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPairs.map((pair) => (
          <div key={pair.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getTypeColor(pair.programType)}`}>
                  {pair.programType.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getStatusColor(pair.status)}`}>
                  {pair.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Progress: <span className="font-bold text-teal-600">{pair.progress}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-3">Mentor</p>
                <div className="flex items-center gap-2">
                  <div className="text-5xl">{pair.mentor.photo}</div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{pair.mentor.name}</p>
                    <p className="text-sm text-gray-600">{pair.mentor.employeeCode}</p>
                    <p className="text-sm text-gray-700 font-semibold">{pair.mentor.role}</p>
                    <p className="text-xs text-gray-600">{pair.mentor.department} • {pair.mentor.yearsOfExperience} yrs exp</p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg border border-teal-200 p-3">
                <p className="text-xs font-semibold text-teal-600 uppercase mb-3">Mentee</p>
                <div className="flex items-center gap-2">
                  <div className="text-5xl">{pair.mentee.photo}</div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{pair.mentee.name}</p>
                    <p className="text-sm text-gray-600">{pair.mentee.employeeCode}</p>
                    <p className="text-sm text-gray-700 font-semibold">{pair.mentee.role}</p>
                    <p className="text-xs text-gray-600">{pair.mentee.department}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-900">Overall Progress</h4>
                <span className="text-sm font-bold text-teal-600">{pair.progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div className="bg-teal-500 rounded-full h-3 transition-all" style={{ width: `${pair.progress}%` }}></div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-purple-600" />
                <h4 className="text-sm font-bold text-gray-900">Mentoring Goals</h4>
              </div>
              <ul className="space-y-2">
                {pair.goals.map((goal, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Meeting Frequency</p>
                <p className="text-sm font-bold text-gray-900">{pair.meetingFrequency}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Meetings</p>
                <p className="text-sm font-bold text-gray-900">{pair.totalMeetings}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Milestones</p>
                <p className="text-sm font-bold text-gray-900">{pair.completedMilestones}/{pair.totalMilestones}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Milestone Progress</p>
                <p className="text-sm font-bold text-teal-600">{Math.round((pair.completedMilestones / pair.totalMilestones) * 100)}%</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {new Date(pair.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {pair.endDate && <span className="ml-2">• End: {new Date(pair.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
                <div className="text-gray-600">
                  Last Meeting: <span className="font-semibold text-gray-900">{new Date(pair.lastMeetingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {pair.nextMeetingDate && <span className="ml-4">Next: <span className="font-semibold text-teal-700">{new Date(pair.nextMeetingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
