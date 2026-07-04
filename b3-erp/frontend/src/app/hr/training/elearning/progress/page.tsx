'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Download
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Mock Data
const progressHistory = [
  { week: 'Week 1', hours: 2.5 },
  { week: 'Week 2', hours: 4.0 },
  { week: 'Week 3', hours: 3.2 },
  { week: 'Week 4', hours: 5.5 },
  { week: 'Week 5', hours: 4.8 },
  { week: 'Week 6', hours: 6.2 },
];

interface CourseDetail {
  id: number | string;
  name: string;
  progress: number;
  status: string;
  score: number | null;
  cert: string;
  date: string;
}

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [courseDetails, setCourseDetails] = useState<CourseDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.elearningCourses()) as any[];
        const mapped: CourseDetail[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          name: r.name ?? r.title ?? '',
          progress: Number(r.progress ?? 0),
          status: r.status ?? 'Not Started',
          score: r.score !== undefined && r.score !== null ? Number(r.score) : null,
          cert: r.cert ?? 'Locked',
          date: r.date ?? '',
        }));
        if (!cancelled) setCourseDetails(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load courses');
          setCourseDetails([]);
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

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            Course Progress
          </h1>
          <p className="text-gray-500 mt-1">Track your learning milestones and achievements</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>This Year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading courses…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Hours Learned</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">42.5h</h2>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium inline-flex items-center mt-2">
              +12% vs last month
            </span>
          </div>
          <div className="p-4 bg-purple-50 rounded-full">
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Courses Completed</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">12</h2>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium inline-flex items-center mt-2">
              2 Certifications Earned
            </span>
          </div>
          <div className="p-4 bg-blue-50 rounded-full">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg. Quiz Score</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">92%</h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium inline-flex items-center mt-2">
              Top 10% of learners
            </span>
          </div>
          <div className="p-4 bg-amber-50 rounded-full">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Learning Activity</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar/Summary Widget (Simplified as Certifications List for now) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Latest Achievements</h2>
          <div className="space-y-2">
            <div className="p-4 border border-green-200 bg-green-50 rounded-xl flex items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl">🏆</div>
              <div>
                <h3 className="text-sm font-bold text-green-900">Leadership Master</h3>
                <p className="text-xs text-green-700">Completed Jan 15, 2025</p>
              </div>
            </div>
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-xl flex items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-2xl">🥇</div>
              <div>
                <h3 className="text-sm font-bold text-blue-900">Security First</h3>
                <p className="text-xs text-blue-700">Completed Jan 10, 2025</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            View All Certifications
          </button>
        </div>
      </div>

      {/* Detailed Course List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Detailed Course Progress</h2>
          <Filter className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Course Name</th>
                <th className="px-3 py-2">Progress</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Certificate</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courseDetails.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900">{course.name}</td>
                  <td className="px-3 py-2 w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-purple-600'}`} style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <span className="text-xs w-8 text-right">{course.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${course.status === 'Completed' ? 'text-green-700 bg-green-50 ring-green-600/20' :
                        course.status === 'In Progress' ? 'text-blue-700 bg-blue-50 ring-blue-600/20' :
                          'text-gray-600 bg-gray-50 ring-gray-500/10'
                      }`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold">{course.score ? `${course.score}%` : '-'}</td>
                  <td className="px-3 py-2">
                    {course.cert === 'Available' ? (
                      <span className="text-purple-600 flex items-center gap-1 cursor-pointer hover:underline"><Download className="w-3 h-3" /> Download</span>
                    ) : (
                      <span className="text-gray-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Locked</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
