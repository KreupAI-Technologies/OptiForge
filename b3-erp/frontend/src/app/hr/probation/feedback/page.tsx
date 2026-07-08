'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Star, ThumbsUp, AlertCircle, TrendingUp, Users, Plus, X, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrTalentService } from '@/services/hr-talent.service';

interface Feedback {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  feedbackFrom: string;
  feedbackType: 'manager' | 'peer' | 'self';
  submittedDate: string;
  overallRating: number;
  categories: {
    technicalSkills: number;
    communication: number;
    teamwork: number;
    initiative: number;
    attendance: number;
  };
  strengths: string;
  improvements: string;
  recommendation: 'confirm' | 'extend' | 'terminate';
}

export default function Page() {
  const [selectedType, setSelectedType] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    employeeCode: '',
    employeeName: '',
    feedbackFrom: '',
    feedbackType: '',
    dueDate: '',
    message: ''
  });

  const [rows, setRows] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getProbation<Feedback>('feedback');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredFeedback = rows.filter(f =>
    selectedType === 'all' || f.feedbackType === selectedType
  );

  const stats = {
    total: rows.length,
    avgRating: (rows.reduce((sum, f) => sum + f.overallRating, 0) / rows.length).toFixed(1),
    confirmRecommendations: rows.filter(f => f.recommendation === 'confirm').length,
    extendRecommendations: rows.filter(f => f.recommendation === 'extend').length
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleRequestFeedback = () => {
    setRequestFormData({
      employeeCode: '',
      employeeName: '',
      feedbackFrom: '',
      feedbackType: '',
      dueDate: '',
      message: ''
    });
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await HrTalentService.createProbation(
        {
          employeeCode: requestFormData.employeeCode,
          employeeName: requestFormData.employeeName,
          feedbackFrom: requestFormData.feedbackFrom,
          feedbackType: requestFormData.feedbackType,
          dueDate: requestFormData.dueDate,
          message: requestFormData.message,
          status: 'requested',
        },
        {
          recordType: 'feedback',
          employeeCode: requestFormData.employeeCode,
          status: 'requested',
        },
      );
      toast({
        title: "Feedback Request Sent",
        description: `Feedback request has been sent to ${requestFormData.feedbackFrom} for ${requestFormData.employeeName}.`
      });
      setShowRequestModal(false);
    } catch (err) {
      toast({
        title: "Request Failed",
        description: err instanceof Error ? err.message : 'Could not send the feedback request',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Probation Feedback</h1>
          <p className="text-sm text-gray-600 mt-1">Review feedback collected during probation period</p>
        </div>
        <button
          onClick={handleRequestFeedback}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Request Feedback
        </button>
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Feedback</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgRating}/5</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Confirm</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.confirmRecommendations}</p>
            </div>
            <ThumbsUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Extend</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.extendRecommendations}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          {['all', 'manager', 'peer', 'self'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredFeedback.map(feedback => (
          <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{feedback.employeeName}</h3>
                <p className="text-sm text-gray-600">{feedback.designation} • {feedback.department}</p>
                <p className="text-xs text-gray-500 mt-1">Feedback by: {feedback.feedbackFrom} ({feedback.feedbackType})</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getRatingColor(feedback.overallRating)}`}>
                  {feedback.overallRating}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(feedback.overallRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
              {Object.entries(feedback.categories).map(([category, rating]) => (
                <div key={category} className="text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-900 mb-2">Strengths</p>
                <p className="text-sm text-green-800">{feedback.strengths}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-orange-900 mb-2">Areas for Improvement</p>
                <p className="text-sm text-orange-800">{feedback.improvements}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className={`px-3 py-1 text-sm font-semibold rounded ${
                feedback.recommendation === 'confirm' ? 'bg-green-100 text-green-700' :
                feedback.recommendation === 'extend' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                Recommendation: {feedback.recommendation.charAt(0).toUpperCase() + feedback.recommendation.slice(1)}
              </span>
              <span className="text-xs text-gray-500">Submitted on {feedback.submittedDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Request Feedback Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Probation Feedback</h2>
                <p className="text-sm text-gray-600 mt-1">Request feedback for an employee on probation</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-3">
              {/* Employee Information */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Employee Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requestFormData.employeeCode}
                    onChange={(e) => setRequestFormData({...requestFormData, employeeCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EMP001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Employee Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requestFormData.employeeName}
                    onChange={(e) => setRequestFormData({...requestFormData, employeeName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Feedback Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Request Feedback From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requestFormData.feedbackFrom}
                    onChange={(e) => setRequestFormData({...requestFormData, feedbackFrom: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Reviewer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Feedback Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={requestFormData.feedbackType}
                    onChange={(e) => setRequestFormData({...requestFormData, feedbackType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="manager">Manager Feedback</option>
                    <option value="peer">Peer Feedback</option>
                    <option value="self">Self Assessment</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={requestFormData.dueDate}
                  onChange={(e) => setRequestFormData({...requestFormData, dueDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestFormData.message}
                  onChange={(e) => setRequestFormData({...requestFormData, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add any additional instructions or context for the feedback request..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Feedback Request Guidelines</p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                      <li>The reviewer will receive an email notification with the feedback form</li>
                      <li>They will be asked to rate the employee on multiple criteria</li>
                      <li>Feedback should be constructive and specific</li>
                      <li>All feedback is confidential and used for probation assessment only</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sending…' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
