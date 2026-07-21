'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  PlayCircle,
  Clock,
  Award,
  Calendar,
  CheckCircle,
  MoreVertical,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import { TrainingDevelopmentService } from '@/services/training-development.service';
import { useAuth } from '@/context/AuthContext';

interface ActiveCourse {
  id: number | string;
  title: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  lastAccessed: string;
  image: string;
  icon: string;
  timeLeft: string;
  progressId: string;
  currentLessonId: string;
  timeSpentMinutes: number;
}

const assignedPath = [
  { id: 1, title: 'Company Onboarding', status: 'Completed', date: 'Jan 10, 2025', type: 'Mandatory' },
  { id: 2, title: 'Code of Conduct', status: 'Completed', date: 'Jan 12, 2025', type: 'Mandatory' },
  { id: 3, title: 'Data Security Awareness', status: 'In Progress', date: 'Due: Jan 30, 2025', type: 'Mandatory' },
  { id: 4, title: 'Advanced React Patterns', status: 'Not Started', date: 'Recommended', type: 'Optional' },
  { id: 5, title: 'System Architecture 101', status: 'Locked', date: 'Unlock after #4', type: 'Optional' },
];

const upcomingDeadlines = [
  { id: 1, title: 'Data Security Quiz', due: 'Tomorrow', type: 'Quiz' },
  { id: 2, title: 'Q1 Compliance Training', due: 'In 3 days', type: 'Course' },
];

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState('All');
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  const handleEnrollRecommended = async () => {
    setEnrolling(true);
    setActionError(null);
    setEnrollMessage(null);
    try {
      const { data } = await TrainingDevelopmentService.getELearningCourses({ search: 'Communication' });
      const course = data[0];
      if (!course) {
        setActionError('The recommended course is not available for enrollment right now.');
        return;
      }
      await TrainingDevelopmentService.enrollInCourse(course.id, user?.id ?? '');
      setEnrollMessage(`Enrolled in “${course.courseName}”.`);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to enroll in course.');
    } finally {
      setEnrolling(false);
    }
  };

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await HrPagesService.elearningCourses()) as any[];
      const mapped: ActiveCourse[] = (Array.isArray(raw) ? raw : []).map((r) => ({
        id: r.id ?? '',
        title: r.title ?? '',
        progress: Number(r.progress ?? 0),
        totalModules: Number(r.totalModules ?? r.modules ?? 0),
        completedModules: Number(r.completedModules ?? 0),
        lastAccessed: r.lastAccessed ?? '',
        image: r.image ?? 'bg-blue-100',
        icon: r.icon ?? '📘',
        timeLeft: r.timeLeft ?? '',
        progressId: String(r.progressId ?? r.enrollmentId ?? r.id ?? ''),
        currentLessonId: String(r.currentLessonId ?? r.nextLessonId ?? r.lessonId ?? ''),
        timeSpentMinutes: Number(r.timeSpentMinutes ?? 0),
      }));
      setActiveCourses(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load courses');
      setActiveCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = async (course: ActiveCourse, markComplete: boolean) => {
    if (!course.progressId || !course.currentLessonId) {
      setActionError('This course has no active lesson to update yet.');
      return;
    }
    setUpdatingId(course.id);
    setActionError(null);
    try {
      await TrainingDevelopmentService.updateLessonProgress(course.progressId, course.currentLessonId, {
        isCompleted: markComplete,
        progressPercentage: markComplete ? 100 : Math.min(100, course.progress + 10),
        timeSpentMinutes: course.timeSpentMinutes + 5,
      });
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update progress.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            My Courses
          </h1>
          <p className="text-gray-500 mt-1">Continue your learning journey</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search my courses..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
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
      {actionError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content: Active Courses */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Pick up where you left off</h2>
            <button className="text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="space-y-2">
            {activeCourses.map((course) => (
              <div key={course.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-purple-200 transition-colors flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className={`w-16 h-16 rounded-lg ${course.image} flex items-center justify-center text-3xl shadow-inner flex-shrink-0`}>
                  {course.icon}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{course.title}</h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">{course.lastAccessed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {course.timeLeft} left</span>
                    <span>{course.completedModules}/{course.totalModules} Modules</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>{course.progress}% Complete</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleResume(course, false)}
                    disabled={updatingId === course.id}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-60"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {updatingId === course.id ? 'Saving…' : 'Resume'}
                  </button>
                  <button
                    onClick={() => handleResume(course, true)}
                    disabled={updatingId === course.id}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recommended For You Section */}
          <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-xl p-3 text-white shadow-md relative overflow-hidden mt-8">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold mb-2">Master Communication Skills</h2>
                <p className="text-purple-200 text-sm max-w-md mb-2">Unlock your potential with our new advanced communication workshop. Recommended based on your role.</p>
                <button onClick={handleEnrollRecommended} disabled={enrolling} className="px-4 py-2 bg-white text-purple-900 text-sm font-bold rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-60">
                  {enrolling ? 'Enrolling…' : 'Enroll Now'}
                </button>
                {enrollMessage && <p className="text-xs text-green-200 mt-2">{enrollMessage}</p>}
              </div>
              <div className="text-6xl animate-pulse">🎯</div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>

        {/* Sidebar: Learning Path & Deadlines */}
        <div className="space-y-3">
          {/* Deadlines Widget */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-red-500 font-medium">Due {item.due}</p>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.length === 0 && <p className="text-sm text-gray-500">No upcoming deadlines.</p>}
            </div>
          </div>

          {/* Learning Path Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              My Learning Path
            </h3>
            <div className="relative border-l-2 border-dashed border-gray-200 ml-3 space-y-3 pl-6 pb-2">
              {assignedPath.map((item) => (
                <div key={item.id} className="relative">
                  <div className={`absolute -left-[31px] w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${item.status === 'Completed' ? 'border-green-500 text-green-500' :
                      item.status === 'In Progress' ? 'border-blue-500 text-blue-500' :
                        'border-gray-300 text-gray-300'
                    }`}>
                    {item.status === 'Completed' ? <CheckCircle className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${item.type === 'Mandatory' ? 'text-amber-600' : 'text-gray-400'
                      }`}>{item.type}</p>
                    <h4 className={`text-sm font-medium ${item.status === 'Locked' ? 'text-gray-400' : 'text-gray-900'
                      }`}>{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
