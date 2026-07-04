'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { User, MapPin, Clock, Calendar, TrendingUp, X, Eye, BarChart3, CheckCircle, AlertCircle, Phone, Mail, Wrench, Navigation, Filter } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface EngineerSchedule {
  id: string;
  name: string;
  status: 'Available' | 'On Job' | 'In Transit' | 'Break';
  todayJobs: number;
  completedJobs: number;
  hoursWorked: number;
  currentJob?: {
    jobNumber: string;
    customer: string;
    location: string;
    startTime: string;
    estimatedEnd: string;
  };
  upcomingJobs: Array<{
    jobNumber: string;
    customer: string;
    time: string;
    duration: number;
  }>;
}

export default function EngineerSchedulePage() {
  const [selectedDate, setSelectedDate] = useState('2025-02-18');
  const [showEngineerModal, setShowEngineerModal] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<EngineerSchedule | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEngineerClick = (engineer: EngineerSchedule) => {
    setSelectedEngineer(engineer);
    setShowEngineerModal(true);
  };

  const handleJobClick = (job: any, engineer: EngineerSchedule) => {
    setSelectedJob({ ...job, engineerName: engineer.name });
    setShowJobModal(true);
  };

  // Engineer schedules loaded from the after-sales field-service endpoint.
  const [engineers, setEngineers] = useState<EngineerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.engineersSchedule()) as any[];
        const mapped: EngineerSchedule[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: String(r?.id ?? r?.engineerId ?? ''),
          name: r?.name ?? r?.engineerName ?? '',
          status: (r?.status ?? 'Available') as EngineerSchedule['status'],
          todayJobs: Number(r?.todayJobs ?? 0) || 0,
          completedJobs: Number(r?.completedJobs ?? 0) || 0,
          hoursWorked: Number(r?.hoursWorked ?? 0) || 0,
          currentJob: r?.currentJob,
          upcomingJobs: Array.isArray(r?.upcomingJobs) ? r.upcomingJobs : [],
        }));
        if (!cancelled) setEngineers(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load engineer schedules');
          setEngineers([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'On Job': return 'bg-yellow-100 text-yellow-700';
      case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Break': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Statistics
  const stats = {
    totalEngineers: engineers.length,
    available: engineers.filter(e => e.status === 'Available').length,
    onJob: engineers.filter(e => e.status === 'On Job').length,
    totalJobs: engineers.reduce((sum, e) => sum + e.todayJobs, 0),
    completed: engineers.reduce((sum, e) => sum + e.completedJobs, 0)
  };

  // Filter engineers based on status
  const filteredEngineers = filterStatus === 'all'
    ? engineers
    : engineers.filter(e => e.status === filterStatus);

  return (
    <div className="p-6 space-y-3">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Engineer Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Daily work schedule and availability</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View Analytics</span>
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Engineers</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEngineers}</div>
          <div className="text-xs text-blue-600 mt-1">Click to view all</div>
        </button>

        <button
          onClick={() => setFilterStatus('Available')}
          className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Available</span>
            <User className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-xs text-green-600 mt-1">Filter available</div>
        </button>

        <button
          onClick={() => setFilterStatus('On Job')}
          className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-yellow-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">On Job</span>
            <MapPin className="w-4 h-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.onJob}</div>
          <div className="text-xs text-yellow-600 mt-1">Filter on job</div>
        </button>

        <button
          onClick={() => showToast(`Total ${stats.totalJobs} jobs scheduled for ${selectedDate}`, 'info')}
          className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Jobs</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalJobs}</div>
          <div className="text-xs text-purple-600 mt-1">View details</div>
        </button>

        <button
          onClick={() => showToast(`${stats.completed} of ${stats.totalJobs} jobs completed`, 'success')}
          className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completed</span>
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-green-600 mt-1">View completed</div>
        </button>
      </div>

      {/* Filter indicator */}
      {filterStatus !== 'all' && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-900">
            Showing engineers with status: <span className="font-semibold">{filterStatus}</span>
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Engineer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredEngineers.map(engineer => (
          <div key={engineer.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all">
            {/* Engineer Header */}
            <button
              onClick={() => handleEngineerClick(engineer)}
              className="w-full bg-gray-50 px-3 py-2 border-b border-gray-200 text-left hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {engineer.name}
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(engineer.status)}`}>
                      {engineer.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{engineer.todayJobs}</div>
                  <div className="text-xs text-gray-500">Jobs Today</div>
                </div>
              </div>
            </button>

            {/* Stats */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{engineer.completedJobs}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="text-center border-l border-r border-gray-200">
                <div className="text-sm font-semibold text-gray-900">{engineer.todayJobs - engineer.completedJobs}</div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{engineer.hoursWorked}h</div>
                <div className="text-xs text-gray-500">Hours Worked</div>
              </div>
            </div>

            {/* Current Job */}
            {engineer.currentJob && (
              <button
                onClick={() => handleJobClick(engineer.currentJob, engineer)}
                className="w-full px-3 py-2 bg-yellow-50 border-b border-yellow-100 hover:bg-yellow-100 transition-colors text-left"
              >
                <div className="text-xs font-medium text-yellow-900 mb-2 flex items-center justify-between">
                  <span>CURRENT JOB</span>
                  <Eye className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">{engineer.currentJob.jobNumber}</div>
                  <div className="text-sm text-gray-700">{engineer.currentJob.customer}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    {engineer.currentJob.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    {engineer.currentJob.startTime} - {engineer.currentJob.estimatedEnd}
                  </div>
                </div>
              </button>
            )}

            {/* Upcoming Jobs */}
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-700 mb-3">UPCOMING JOBS</div>
              {engineer.upcomingJobs.length > 0 ? (
                <div className="space-y-2">
                  {engineer.upcomingJobs.map((job, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleJobClick(job, engineer)}
                      className="w-full flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all"
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
                        <div className="text-xs text-gray-600">{job.customer}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{job.time}</div>
                          <div className="text-xs text-gray-500">{job.duration}h</div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No upcoming jobs</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Engineer Details Modal */}
      {showEngineerModal && selectedEngineer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-3 py-2 border-b sticky top-0 z-10 ${
              selectedEngineer.status === 'Available' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
              selectedEngineer.status === 'On Job' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
              selectedEngineer.status === 'In Transit' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
              'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedEngineer.name}</h2>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEngineer.status)}`}>
                        {selectedEngineer.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowEngineerModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Contact Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-blue-600 font-medium">Phone</div>
                      <div className="text-sm text-gray-900 font-semibold">+91 98765 43210</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-blue-600 font-medium">Email</div>
                      <div className="text-sm text-gray-900">{selectedEngineer.name.toLowerCase().replace(' ', '.')}@company.com</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Today's Performance
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900">{selectedEngineer.todayJobs}</div>
                    <div className="text-xs text-purple-600 mt-1">Total Jobs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedEngineer.completedJobs}</div>
                    <div className="text-xs text-purple-600 mt-1">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900">{selectedEngineer.hoursWorked}h</div>
                    <div className="text-xs text-purple-600 mt-1">Hours Worked</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-purple-700 font-medium">Progress</span>
                    <span className="font-semibold text-purple-900">
                      {Math.round((selectedEngineer.completedJobs / selectedEngineer.todayJobs) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{ width: `${(selectedEngineer.completedJobs / selectedEngineer.todayJobs) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Current Job Details */}
              {selectedEngineer.currentJob && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-5 border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Current Job
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-yellow-200">
                      <span className="text-sm text-yellow-700">Job Number</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedEngineer.currentJob.jobNumber}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-yellow-200">
                      <span className="text-sm text-yellow-700">Customer</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedEngineer.currentJob.customer}</span>
                    </div>
                    <div className="flex items-start justify-between py-2 border-b border-yellow-200">
                      <span className="text-sm text-yellow-700">Location</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedEngineer.currentJob.location}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-yellow-700">Time Slot</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedEngineer.currentJob.startTime} - {selectedEngineer.currentJob.estimatedEnd}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Opening navigation...', 'info')}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate to Location
                  </button>
                </div>
              )}

              {/* Upcoming Jobs */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Jobs ({selectedEngineer.upcomingJobs.length})
                </h3>
                {selectedEngineer.upcomingJobs.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEngineer.upcomingJobs.map((job, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{job.jobNumber}</div>
                          <div className="text-sm font-semibold text-blue-600">{job.time}</div>
                        </div>
                        <div className="text-sm text-gray-600">{job.customer}</div>
                        <div className="text-xs text-gray-500 mt-1">Duration: {job.duration} hours</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic py-3">No upcoming jobs scheduled</div>
                )}
              </div>

              {/* Weekly Performance */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Performance
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-1">Jobs This Week</div>
                    <div className="text-2xl font-bold text-green-900">{Math.floor(Math.random() * 10) + 15}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-1">Avg Rating</div>
                    <div className="text-2xl font-bold text-green-900">4.{Math.floor(Math.random() * 3) + 6}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-1">Hours This Week</div>
                    <div className="text-2xl font-bold text-green-900">{Math.floor(Math.random() * 10) + 35}h</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-1">On-Time Rate</div>
                    <div className="text-2xl font-bold text-green-900">{Math.floor(Math.random() * 10) + 85}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => showToast(`Calling ${selectedEngineer.name}...`, 'info')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Engineer
              </button>
              <button
                onClick={() => setShowEngineerModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2 border-b border-blue-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                  </div>
                  <p className="text-sm text-gray-600">{selectedJob.jobNumber}</p>
                </div>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Job Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Job Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-blue-200">
                    <span className="text-sm text-blue-600 font-medium">Job Number</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedJob.jobNumber}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-blue-200">
                    <span className="text-sm text-blue-600 font-medium">Customer</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedJob.customer}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-blue-200">
                    <span className="text-sm text-blue-600 font-medium">Assigned Engineer</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedJob.engineerName}</span>
                  </div>
                  {selectedJob.location && (
                    <div className="flex items-start justify-between py-2 border-b border-blue-200">
                      <span className="text-sm text-blue-600 font-medium">Location</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">{selectedJob.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-blue-600 font-medium">Scheduled Time</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedJob.time || `${selectedJob.startTime} - ${selectedJob.estimatedEnd}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Service Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-purple-200">
                    <span className="text-sm text-purple-600 font-medium">Service Type</span>
                    <span className="text-sm font-semibold text-gray-900">Installation</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-purple-200">
                    <span className="text-sm text-purple-600 font-medium">Duration</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedJob.duration || 2} hours</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-purple-200">
                    <span className="text-sm text-purple-600 font-medium">Priority</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      High
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-purple-600 font-medium">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>

              {/* Equipment/Parts */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Required Equipment
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Standard Tool Kit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Safety Equipment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Testing Instruments</span>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Special Instructions</h3>
                <p className="text-sm text-gray-700">
                  Please arrive 10 minutes early. Parking available at the rear entrance. Contact site manager upon arrival.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  showToast('Opening navigation...', 'info');
                  setShowJobModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <button
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2 border-b border-blue-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Schedule Analytics</h2>
                  </div>
                  <p className="text-sm text-gray-600">Team performance and scheduling efficiency for {selectedDate}</p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Team Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-700">Total Engineers</div>
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900">{stats.totalEngineers}</div>
                  <div className="text-xs text-blue-600 mt-1">Active today</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-700">Utilization</div>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    {Math.round(((stats.onJob + engineers.filter(e => e.status === 'In Transit').length) / stats.totalEngineers) * 100)}%
                  </div>
                  <div className="text-xs text-green-600 mt-1">Engineers working</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-yellow-700">Avg Jobs/Engineer</div>
                    <Wrench className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-900">
                    {(stats.totalJobs / stats.totalEngineers).toFixed(1)}
                  </div>
                  <div className="text-xs text-yellow-600 mt-1">Per engineer today</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-700">Completion Rate</div>
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900">
                    {Math.round((stats.completed / stats.totalJobs) * 100)}%
                  </div>
                  <div className="text-xs text-purple-600 mt-1">Jobs completed</div>
                </div>
              </div>

              {/* Engineer Performance */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Engineer Performance
                </h3>
                <div className="space-y-3">
                  {engineers.map((engineer) => {
                    const completionRate = engineer.todayJobs > 0
                      ? (engineer.completedJobs / engineer.todayJobs) * 100
                      : 0;
                    return (
                      <div key={engineer.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-blue-700 font-medium">{engineer.name}</span>
                          <span className="font-semibold text-blue-900">
                            {engineer.completedJobs}/{engineer.todayJobs} jobs ({Math.round(completionRate)}%)
                          </span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hours Distribution */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Hours Worked Distribution
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="text-sm text-purple-700 font-medium mb-2">Total Hours</div>
                    <div className="text-3xl font-bold text-purple-900">
                      {engineers.reduce((sum, e) => sum + e.hoursWorked, 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Across all engineers</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="text-sm text-purple-700 font-medium mb-2">Average Hours</div>
                    <div className="text-3xl font-bold text-purple-900">
                      {(engineers.reduce((sum, e) => sum + e.hoursWorked, 0) / engineers.length).toFixed(1)}h
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Per engineer</div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Status Distribution
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                    <div className="text-xs text-gray-600 mt-1">Available</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-2xl font-bold text-yellow-600">{stats.onJob}</div>
                    <div className="text-xs text-gray-600 mt-1">On Job</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {engineers.filter(e => e.status === 'In Transit').length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">In Transit</div>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-2xl font-bold text-gray-600">
                      {engineers.filter(e => e.status === 'Break').length}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">On Break</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => { exportToCsv('engineer-schedule', filteredEngineers); showToast('Exporting analytics report...', 'success'); }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Report
              </button>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
