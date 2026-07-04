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
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock Data
const feedbackTrends = [
  { month: 'Jul', overall: 4.2, engagement: 4.0 },
  { month: 'Aug', overall: 4.3, engagement: 4.1 },
  { month: 'Sep', overall: 4.1, engagement: 3.9 },
  { month: 'Oct', overall: 4.4, engagement: 4.2 },
  { month: 'Nov', overall: 4.6, engagement: 4.5 },
  { month: 'Dec', overall: 4.8, engagement: 4.6 },
];

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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.trainingEnrollments()) as any[];
        const mapped: Review[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          employee: r.employee ?? r.employeeName ?? '',
          role: r.role ?? '',
          course: r.course ?? r.courseName ?? r.programName ?? '',
          rating: Number(r.rating ?? 0),
          date: r.date ?? r.createdAt ?? '',
          comment: r.comment ?? r.feedback ?? '',
          sentiment: r.sentiment ?? 'neutral',
        }));
        if (!cancelled) setReviews(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load feedback');
          setReviews([]);
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
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Promoter Score (NPS)</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900">72</h2>
                <span className="text-sm text-green-600 font-medium">+5 pts</span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Smile className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div className="bg-green-500 w-[72%] h-full"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Excellent (Industry Avg: 50)</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Satisfaction</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900">4.7</h2>
                <span className="text-sm text-gray-400">/ 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-sm ${s < 5 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Based on 850 reviews</p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Response Rate</p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-gray-900">88%</h2>
                <span className="text-sm text-red-600 font-medium">-2%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-5 bg-blue-50 inline-block px-2 py-1 rounded">
            Action: Send reminders for "Sales 101"
          </p>
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
                <span className="font-bold text-gray-900">78%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-2"><Meh className="w-4 h-4 text-amber-500" /> Neutral</span>
                <span className="font-bold text-gray-900">14%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-2"><Frown className="w-4 h-4 text-red-500" /> Negative</span>
                <span className="font-bold text-gray-900">8%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">Helpful</span>
              <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">Engaging</span>
              <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">Too Long</span>
              <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">Instructor</span>
            </div>
          </div>
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
    </div>
  );
}
