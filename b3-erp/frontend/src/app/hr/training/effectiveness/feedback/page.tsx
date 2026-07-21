'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Star,
  Download,
  Smile,
  Meh,
  Frown,
  Plus,
  AlertCircle
} from 'lucide-react';
import { TrainingDevelopmentService } from '@/services/training-development.service';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Review {
  id: number | string;
  employee: string;
  role: string;
  course: string;
  rating: number;
  date: string;
  comment: string;
  sentiment: string;
}

export default function FeedbackPage() {
  const [filterPeriod, setFilterPeriod] = useState('Last 6 Months');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    programId: '',
    overallRating: 4,
    contentRating: 4,
    instructorRating: 4,
    relevanceRating: 4,
    paceRating: 4,
    strengths: '',
    improvements: '',
    additionalComments: '',
    wouldRecommend: true,
  });

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await TrainingDevelopmentService.getTrainingFeedback()) as any[];
      const mapped: Review[] = (Array.isArray(raw) ? raw : []).map((r) => ({
        id: r.id ?? '',
        employee: r.employeeName ?? '',
        role: '',
        course: r.programId ?? r.scheduleId ?? '',
        rating: Number(r.overallRating ?? r.rating ?? 0),
        date: (r.createdAt ?? '').toString().split('T')[0] ?? '',
        comment: r.comments ?? r.strengths ?? '',
        sentiment: 'neutral',
      }));
      setReviews(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load feedback');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived aggregates from fetched reviews (real data).
  const avgSatisfaction = React.useMemo(() => {
    const rated = reviews.filter((r) => r.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((s, r) => s + r.rating, 0) / rated.length;
  }, [reviews]);

  const sentimentBreakdown = React.useMemo(() => {
    const rated = reviews.filter((r) => r.rating > 0);
    const total = rated.length || 1;
    const positive = rated.filter((r) => r.rating >= 4).length;
    const neutral = rated.filter((r) => r.rating === 3).length;
    const negative = rated.filter((r) => r.rating <= 2).length;
    return {
      positive: Math.round((positive / total) * 100),
      neutral: Math.round((neutral / total) * 100),
      negative: Math.round((negative / total) * 100),
    };
  }, [reviews]);

  const feedbackTrends = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groups = new Map<string, { sum: number; count: number; order: number }>();
    reviews.forEach((r) => {
      if (!r.date || r.rating <= 0) return;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return;
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      const g = groups.get(key) ?? { sum: 0, count: 0, order: d.getTime() };
      g.sum += r.rating;
      g.count += 1;
      groups.set(key, g);
    });
    return Array.from(groups.entries())
      .sort((a, b) => a[1].order - b[1].order)
      .map(([month, g]) => ({ month, overall: Number((g.sum / g.count).toFixed(2)) }));
  }, [reviews]);

  const handleExportReport = () => {
    const header = ['ID', 'Employee', 'Course/Program', 'Rating', 'Date', 'Comment'];
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = reviews.map((r) => [r.id, r.employee, r.course, r.rating, r.date, r.comment].map(escape).join(','));
    const csv = [header.map(escape).join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `training-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmitFeedback = async () => {
    if (!form.programId) {
      setSubmitError('Please provide a training program.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await TrainingDevelopmentService.submitTrainingFeedback({
        programId: form.programId,
        overallRating: form.overallRating,
        contentRating: form.contentRating,
        instructorRating: form.instructorRating,
        relevanceRating: form.relevanceRating,
        paceRating: form.paceRating,
        strengths: form.strengths || undefined,
        improvements: form.improvements || undefined,
        additionalComments: form.additionalComments || undefined,
        wouldRecommend: form.wouldRecommend,
        isAnonymous: false,
      });
      setShowFeedbackModal(false);
      setForm({
        programId: '',
        overallRating: 4,
        contentRating: 4,
        instructorRating: 4,
        relevanceRating: 4,
        paceRating: 4,
        strengths: '',
        improvements: '',
        additionalComments: '',
        wouldRecommend: true,
      });
      await load();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-purple-600" />
            Training Feedback
          </h1>
          <p className="text-gray-500 mt-1">Review participant feedback and satisfaction scores</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportReport}
            disabled={reviews.length === 0}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Feedback
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading feedback…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* KPI Cards — derived from fetched reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Satisfaction</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900">{avgSatisfaction.toFixed(1)}</h2>
                <span className="text-sm text-gray-400">/ 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-sm ${s <= Math.round(avgSatisfaction) ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Based on {reviews.filter((r) => r.rating > 0).length} rated reviews</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900">{reviews.length}</h2>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-5">Feedback submissions on record</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Positive Sentiment</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900">{sentimentBreakdown.positive}%</h2>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Smile className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-500 h-full" style={{ width: `${sentimentBreakdown.positive}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Ratings of 4★ and above</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Satisfaction Trends</h2>
            <select className="text-sm border-gray-300 rounded-lg">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feedbackTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} domain={[0, 5]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Area type="monotone" dataKey="overall" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOverall)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Sentiment Analysis</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-2"><Smile className="w-4 h-4 text-green-500" /> Positive</span>
                <span className="font-bold text-gray-900">{sentimentBreakdown.positive}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${sentimentBreakdown.positive}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-2"><Meh className="w-4 h-4 text-amber-500" /> Neutral</span>
                <span className="font-bold text-gray-900">{sentimentBreakdown.neutral}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${sentimentBreakdown.neutral}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-2"><Frown className="w-4 h-4 text-red-500" /> Negative</span>
                <span className="font-bold text-gray-900">{sentimentBreakdown.negative}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${sentimentBreakdown.negative}%` }}></div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-400">Sentiment inferred from star ratings (4★+ positive, 3★ neutral, ≤2★ negative).</p>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Recent Reviews</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                    {review.employee.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{review.employee}</h3>
                    <p className="text-xs text-gray-500">{review.role} • {review.course}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
              <div className="pl-13 ml-13 mt-2">
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(review.rating)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"{review.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-3 m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">Submit Training Feedback</h2>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Program</label>
                <input
                  type="text"
                  value={form.programId}
                  onChange={(e) => setForm({ ...form, programId: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Program ID or name"
                />
              </div>

              {([
                ['overallRating', 'Overall'],
                ['contentRating', 'Content'],
                ['instructorRating', 'Instructor'],
                ['relevanceRating', 'Relevance'],
                ['paceRating', 'Pace'],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} Rating (1-5): {form[key]}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strengths</label>
                <textarea
                  rows={2}
                  value={form.strengths}
                  onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Improvements</label>
                <textarea
                  rows={2}
                  value={form.improvements}
                  onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                <textarea
                  rows={2}
                  value={form.additionalComments}
                  onChange={(e) => setForm({ ...form, additionalComments: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                ></textarea>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.wouldRecommend}
                  onChange={(e) => setForm({ ...form, wouldRecommend: e.target.checked })}
                  className="accent-purple-600"
                />
                Would recommend this training
              </label>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
