'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, AlertCircle, TrendingUp, X, FileText, Edit, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HrTalentService } from '@/services/hr-talent.service';

interface Review {
  id: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  reviewNumber: number;
  totalReviews: number;
  scheduledDate: string;
  reviewType: '1_month' | '3_month' | '6_month' | 'final';
  reviewer: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  performanceRating?: number;
  areasStrength?: string[];
  areasImprovement?: string[];
  recommendation?: 'confirm' | 'extend' | 'terminate';
  completedDate?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showConductModal, setShowConductModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [conductFormData, setConductFormData] = useState({
    performanceRating: '',
    areasStrength: '',
    areasImprovement: '',
    recommendation: '',
    comments: ''
  });
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [rows, setRows] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getProbation<Review>('review');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredReviews = rows.filter(r =>
    selectedStatus === 'all' || r.status === selectedStatus
  );

  const stats = {
    total: rows.length,
    scheduled: rows.filter(r => r.status === 'scheduled').length,
    completed: rows.filter(r => r.status === 'completed').length,
    avgRating: Math.round(
      rows.filter(r => r.performanceRating).reduce((sum, r) => sum + (r.performanceRating || 0), 0) /
      rows.filter(r => r.performanceRating).length
    )
  };

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    missed: 'bg-red-100 text-red-700',
    rescheduled: 'bg-orange-100 text-orange-700'
  };

  const reviewTypeLabels = {
    '1_month': '1 Month Review',
    '3_month': '3 Month Review',
    '6_month': '6 Month Review',
    'final': 'Final Review'
  };

  const handleConductReview = (review: Review) => {
    setSelectedReview(review);
    setConductFormData({
      performanceRating: '',
      areasStrength: '',
      areasImprovement: '',
      recommendation: '',
      comments: ''
    });
    setShowConductModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    setIsSubmitting(true);
    const performanceRating = Number(conductFormData.performanceRating);
    const areasStrength = conductFormData.areasStrength.split(',').map((s) => s.trim()).filter(Boolean);
    const areasImprovement = conductFormData.areasImprovement.split(',').map((s) => s.trim()).filter(Boolean);
    const completedDate = new Date().toISOString().split('T')[0];
    const recommendation = conductFormData.recommendation as Review['recommendation'];
    try {
      await HrTalentService.updateProbation<Review>(selectedReview.id, {
        status: 'completed',
        data: {
          status: 'completed',
          performanceRating,
          areasStrength,
          areasImprovement,
          recommendation,
          completedDate,
        },
      });
      toast({
        title: "Review Submitted",
        description: `Performance review for ${selectedReview.employeeName} has been completed and saved.`
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id
            ? { ...r, status: 'completed', performanceRating, areasStrength, areasImprovement, recommendation, completedDate }
            : r,
        ),
      );
      setShowConductModal(false);
      setSelectedReview(null);
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : 'Could not submit the review',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = (review: Review) => {
    setSelectedReview(review);
    setRescheduleDate(review.scheduledDate);
    setShowRescheduleModal(true);
  };

  const handleSubmitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;
    setIsSubmitting(true);
    try {
      await HrTalentService.updateProbation<Review>(selectedReview.id, {
        status: 'rescheduled',
        data: { status: 'rescheduled', scheduledDate: rescheduleDate },
      });
      toast({
        title: "Review Rescheduled",
        description: `Review for ${selectedReview.employeeName} has been rescheduled to ${rescheduleDate}.`
      });
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id
            ? { ...r, status: 'rescheduled', scheduledDate: rescheduleDate }
            : r,
        ),
      );
      setShowRescheduleModal(false);
      setSelectedReview(null);
    } catch (err) {
      toast({
        title: "Reschedule Failed",
        description: err instanceof Error ? err.message : 'Could not reschedule the review',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Probation Reviews</h1>
        <p className="text-sm text-gray-600 mt-1">Schedule and track probation review meetings</p>
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
              <p className="text-sm font-medium text-blue-600">Total Reviews</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.scheduled}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
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

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgRating}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex gap-2">
          {['all', 'scheduled', 'completed', 'missed', 'rescheduled'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filteredReviews.map(review => (
          <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{review.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[review.status]}`}>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{review.designation} • {review.department} • {review.employeeCode}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">{reviewTypeLabels[review.reviewType]}</p>
                <p className="text-xs text-gray-500">Review {review.reviewNumber}/{review.totalReviews}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reviewer</p>
                <p className="text-sm font-semibold text-gray-900">{review.reviewer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Scheduled Date</p>
                <p className="text-sm font-semibold text-gray-900">{review.scheduledDate}</p>
              </div>
              {review.completedDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Completed Date</p>
                  <p className="text-sm font-semibold text-green-600">{review.completedDate}</p>
                </div>
              )}
            </div>

            {review.status === 'completed' && review.performanceRating && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Performance Rating</p>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold text-blue-600">{review.performanceRating}%</div>
                      {review.recommendation && (
                        <span className={`px-3 py-1 text-xs font-semibold rounded ${
                          review.recommendation === 'confirm' ? 'bg-green-100 text-green-700' :
                          review.recommendation === 'extend' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {review.recommendation.charAt(0).toUpperCase() + review.recommendation.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {review.areasStrength && review.areasStrength.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Strengths</p>
                        <div className="flex flex-wrap gap-2">
                          {review.areasStrength.map((strength, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {review.areasImprovement && review.areasImprovement.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-2">Areas for Improvement</p>
                        <div className="flex flex-wrap gap-2">
                          {review.areasImprovement.map((area, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {review.status === 'scheduled' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleConductReview(review)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Conduct Review
                </button>
                <button
                  onClick={() => handleReschedule(review)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm inline-flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Reschedule
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Conduct Review Modal */}
      {showConductModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Conduct Performance Review</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedReview.employeeName} • {selectedReview.designation} • {reviewTypeLabels[selectedReview.reviewType]}
                </p>
              </div>
              <button
                onClick={() => setShowConductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-3">
              {/* Review Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Review Number</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {selectedReview.reviewNumber}/{selectedReview.totalReviews}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Scheduled Date</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedReview.scheduledDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Reviewer</p>
                    <p className="text-sm font-semibold text-blue-900">{selectedReview.reviewer}</p>
                  </div>
                </div>
              </div>

              {/* Performance Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Performance Rating (0-100) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={conductFormData.performanceRating}
                  onChange={(e) => setConductFormData({...conductFormData, performanceRating: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter rating (e.g., 85)"
                  required
                />
              </div>

              {/* Areas of Strength */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Areas of Strength <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={conductFormData.areasStrength}
                  onChange={(e) => setConductFormData({...conductFormData, areasStrength: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter comma-separated strengths (e.g., Communication, Team Collaboration, Learning Agility)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>

              {/* Areas for Improvement */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Areas for Improvement <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={conductFormData.areasImprovement}
                  onChange={(e) => setConductFormData({...conductFormData, areasImprovement: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter comma-separated areas (e.g., Time Management, Initiative)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple items with commas</p>
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Recommendation <span className="text-red-500">*</span>
                </label>
                <select
                  value={conductFormData.recommendation}
                  onChange={(e) => setConductFormData({...conductFormData, recommendation: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select recommendation</option>
                  <option value="confirm">Confirm Employment</option>
                  <option value="extend">Extend Probation</option>
                  <option value="terminate">Terminate Employment</option>
                </select>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={conductFormData.comments}
                  onChange={(e) => setConductFormData({...conductFormData, comments: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter any additional comments or observations..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowConductModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reschedule Review</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedReview.employeeName}</p>
              </div>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitReschedule} className="p-6 space-y-3">
              {/* Current Schedule */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Current Scheduled Date</p>
                <p className="text-sm font-semibold text-gray-900">{selectedReview.scheduledDate}</p>
              </div>

              {/* New Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  New Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  {isSubmitting ? 'Rescheduling…' : 'Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
