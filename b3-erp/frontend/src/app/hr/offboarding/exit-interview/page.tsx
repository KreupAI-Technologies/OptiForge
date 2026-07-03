'use client';

import { useState, useMemo, useEffect } from 'react';
import { MessageSquare, CheckCircle, Clock, FileText, Send, X, Calendar, User, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface ExitInterview {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  lastWorkingDay: string;
  interviewDate?: string;
  status: 'scheduled' | 'completed' | 'pending';
  interviewer?: string;
  feedback?: {
    reasonForLeaving: string;
    workEnvironment: number;
    management: number;
    compensation: number;
    careerGrowth: number;
    workLifeBalance: number;
    wouldRecommend: boolean;
    additionalComments: string;
  };
}

export default function ExitInterviewPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'scheduled' | 'completed'>('pending');
  const [selectedInterview, setSelectedInterview] = useState<ExitInterview | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewer: '',
    venue: '',
    notes: ''
  });
  const [conductFormData, setConductFormData] = useState({
    reasonForLeaving: '',
    workEnvironment: 0,
    management: 0,
    compensation: 0,
    careerGrowth: 0,
    workLifeBalance: 0,
    wouldRecommend: false,
    additionalComments: ''
  });

  const [mockInterviews, setMockInterviews] = useState<ExitInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('exit-interview');
        if (!active) return;
        const mapped = records.map((r: OffboardingTaskRecord) => ({
          id: r.id,
          employeeCode: r.employeeCode || '',
          employeeName: r.employeeName || '',
          designation: r.designation || '',
          department: r.department || '',
          status: (r.status as any) || 'pending',
          ...(r.data || {}),
        })) as unknown as ExitInterview[];
        setMockInterviews(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const _unusedMockInterviews: ExitInterview[] = [
    {
      id: 'EXIT001',
      employeeId: 'EMP001',
      employeeName: 'Rahul Sharma',
      designation: 'Senior Software Engineer',
      department: 'Engineering',
      lastWorkingDay: '2025-12-14',
      status: 'scheduled',
      interviewDate: '2025-12-10',
      interviewer: 'Priya Singh - HR Manager'
    },
    {
      id: 'EXIT002',
      employeeId: 'EMP002',
      employeeName: 'Priya Singh',
      designation: 'Marketing Manager',
      department: 'Marketing',
      lastWorkingDay: '2025-11-19',
      status: 'pending'
    },
    {
      id: 'EXIT003',
      employeeId: 'EMP003',
      employeeName: 'Amit Kumar',
      designation: 'Product Manager',
      department: 'Product',
      lastWorkingDay: '2025-10-20',
      status: 'completed',
      interviewDate: '2025-10-18',
      interviewer: 'Priya Singh - HR Manager',
      feedback: {
        reasonForLeaving: 'Better opportunity with higher compensation and leadership role',
        workEnvironment: 4,
        management: 4,
        compensation: 3,
        careerGrowth: 3,
        workLifeBalance: 5,
        wouldRecommend: true,
        additionalComments: 'Great team culture and work-life balance. However, limited growth opportunities in current role. Would recommend to others for mid-level positions.'
      }
    }
  ];

  const filteredInterviews = useMemo(() => {
    return mockInterviews.filter(interview => interview.status === selectedTab);
  }, [selectedTab]);

  const stats = {
    pending: mockInterviews.filter(i => i.status === 'pending').length,
    scheduled: mockInterviews.filter(i => i.status === 'scheduled').length,
    completed: mockInterviews.filter(i => i.status === 'completed').length
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700'
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4" />,
    scheduled: <FileText className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleSchedule = (interview: ExitInterview) => {
    setSelectedInterview(interview);
    setScheduleFormData({
      interviewDate: '',
      interviewTime: '',
      interviewer: '',
      venue: '',
      notes: ''
    });
    setShowScheduleModal(true);
  };

  const handleConduct = (interview: ExitInterview) => {
    setSelectedInterview(interview);
    setConductFormData({
      reasonForLeaving: '',
      workEnvironment: 0,
      management: 0,
      compensation: 0,
      careerGrowth: 0,
      workLifeBalance: 0,
      wouldRecommend: false,
      additionalComments: ''
    });
    setShowConductModal(true);
  };

  const handleView = (interview: ExitInterview) => {
    setSelectedInterview(interview);
    setShowViewModal(true);
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Interview Scheduled",
      description: `Exit interview for ${selectedInterview?.employeeName} has been scheduled for ${scheduleFormData.interviewDate}.`
    });
    setShowScheduleModal(false);
    setSelectedInterview(null);
  };

  const handleSubmitConduct = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Interview Completed",
      description: `Exit interview for ${selectedInterview?.employeeName} has been completed and feedback recorded.`
    });
    setShowConductModal(false);
    setSelectedInterview(null);
  };

  const handleDownloadReport = (interview: ExitInterview) => {
    toast({
      title: "Downloading Report",
      description: `Exit interview report for ${interview.employeeName} is being downloaded.`
    });
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Exit Interview</h1>
        <p className="text-sm text-gray-600 mt-1">Conduct and track exit interviews with departing employees</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.scheduled}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <button
          onClick={() => setSelectedTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedTab === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setSelectedTab('scheduled')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedTab === 'scheduled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Scheduled ({stats.scheduled})
        </button>
        <button
          onClick={() => setSelectedTab('completed')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            selectedTab === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Completed ({stats.completed})
        </button>
      </div>

      <div className="space-y-2">
        {filteredInterviews.map(interview => (
          <div key={interview.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{interview.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[interview.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[interview.status]}
                      {interview.status.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">{interview.designation} • {interview.department}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last Working Day: {new Date(interview.lastWorkingDay).toLocaleDateString('en-IN')}
                </p>
                {interview.interviewDate && (
                  <p className="text-xs text-gray-500">
                    Interview Date: {new Date(interview.interviewDate).toLocaleDateString('en-IN')}
                  </p>
                )}
                {interview.interviewer && (
                  <p className="text-xs text-gray-500">Interviewer: {interview.interviewer}</p>
                )}
              </div>
            </div>

            {interview.feedback && interview.status === 'completed' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Exit Interview Feedback</h4>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Reason for Leaving</p>
                    <p className="text-sm text-gray-900">{interview.feedback.reasonForLeaving}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Work Environment</p>
                      {renderRating(interview.feedback.workEnvironment)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Management</p>
                      {renderRating(interview.feedback.management)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Compensation</p>
                      {renderRating(interview.feedback.compensation)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Career Growth</p>
                      {renderRating(interview.feedback.careerGrowth)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Work-Life Balance</p>
                      {renderRating(interview.feedback.workLifeBalance)}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Would Recommend</p>
                      <p className={`text-sm font-semibold ${interview.feedback.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                        {interview.feedback.wouldRecommend ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">Additional Comments</p>
                    <p className="text-sm text-gray-900">{interview.feedback.additionalComments}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {interview.status === 'pending' && (
                <button
                  onClick={() => handleSchedule(interview)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule Interview
                </button>
              )}
              {interview.status === 'scheduled' && (
                <button
                  onClick={() => handleConduct(interview)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Conduct Interview
                </button>
              )}
              {interview.status === 'completed' && (
                <>
                  <button
                    onClick={() => handleView(interview)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Feedback
                  </button>
                  <button
                    onClick={() => handleDownloadReport(interview)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Schedule Exit Interview</h2>
                  <p className="text-sm text-blue-700 mt-1">{selectedInterview.employeeName} • {selectedInterview.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setShowScheduleModal(false)} className="text-blue-600 hover:text-blue-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Interview Date <span className="text-red-500">*</span></label>
                  <input type="date" value={scheduleFormData.interviewDate} onChange={(e) => setScheduleFormData({...scheduleFormData, interviewDate: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Interview Time <span className="text-red-500">*</span></label>
                  <input type="time" value={scheduleFormData.interviewTime} onChange={(e) => setScheduleFormData({...scheduleFormData, interviewTime: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Interviewer <span className="text-red-500">*</span></label>
                <input type="text" value={scheduleFormData.interviewer} onChange={(e) => setScheduleFormData({...scheduleFormData, interviewer: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter interviewer name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Venue/Location</label>
                <input type="text" value={scheduleFormData.venue} onChange={(e) => setScheduleFormData({...scheduleFormData, venue: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Conference Room / Virtual Meeting Link" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Notes</label>
                <textarea value={scheduleFormData.notes} onChange={(e) => setScheduleFormData({...scheduleFormData, notes: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Any additional notes or instructions..." />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Schedule Interview</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conduct Interview Modal */}
      {showConductModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-green-50 border-b border-green-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Send className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-900">Conduct Exit Interview</h2>
                  <p className="text-sm text-green-700 mt-1">{selectedInterview.employeeName} • {selectedInterview.designation}</p>
                </div>
              </div>
              <button onClick={() => setShowConductModal(false)} className="text-green-600 hover:text-green-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitConduct} className="p-6 space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Reason for Leaving <span className="text-red-500">*</span></label>
                <textarea value={conductFormData.reasonForLeaving} onChange={(e) => setConductFormData({...conductFormData, reasonForLeaving: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} required />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Rate the following (1-5 stars):</h3>
                {['workEnvironment', 'management', 'compensation', 'careerGrowth', 'workLifeBalance'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button key={rating} type="button" onClick={() => setConductFormData({...conductFormData, [field]: rating})} className={`text-3xl ${(conductFormData[field as keyof typeof conductFormData] as number) >= rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Would Recommend Company?</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={conductFormData.wouldRecommend === true} onChange={() => setConductFormData({...conductFormData, wouldRecommend: true})} className="w-4 h-4" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={conductFormData.wouldRecommend === false} onChange={() => setConductFormData({...conductFormData, wouldRecommend: false})} className="w-4 h-4" />
                    <span>No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Comments</label>
                <textarea value={conductFormData.additionalComments} onChange={(e) => setConductFormData({...conductFormData, additionalComments: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" rows={4} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowConductModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {showViewModal && selectedInterview && selectedInterview.feedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Exit Interview Feedback</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedInterview.employeeName} • {selectedInterview.designation}</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Reason for Leaving</p>
                <p className="text-sm text-gray-900">{selectedInterview.feedback.reasonForLeaving}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Work Environment</p>
                  {renderRating(selectedInterview.feedback.workEnvironment)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Management</p>
                  {renderRating(selectedInterview.feedback.management)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Compensation</p>
                  {renderRating(selectedInterview.feedback.compensation)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Career Growth</p>
                  {renderRating(selectedInterview.feedback.careerGrowth)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Work-Life Balance</p>
                  {renderRating(selectedInterview.feedback.workLifeBalance)}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-2">Would Recommend</p>
                  <p className={`text-lg font-bold ${selectedInterview.feedback.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>{selectedInterview.feedback.wouldRecommend ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Additional Comments</p>
                <p className="text-sm text-gray-900">{selectedInterview.feedback.additionalComments}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setShowViewModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Close</button>
                <button onClick={() => handleDownloadReport(selectedInterview)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
