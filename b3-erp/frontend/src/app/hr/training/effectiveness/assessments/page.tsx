'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  Filter,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import { TrainingDevelopmentService } from '@/services/training-development.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Mock Data
const scoreDistribution = [
  { range: '0-50%', count: 12, color: '#ef4444' },
  { range: '51-70%', count: 45, color: '#f59e0b' },
  { range: '71-85%', count: 128, color: '#3b82f6' },
  { range: '86-100%', count: 86, color: '#22c55e' },
];

const topPerformers = [
  { id: 1, name: 'Emma Wilson', role: 'UX Designer', avgScore: 98, assessments: 12 },
  { id: 2, name: 'David Kim', role: 'Frontend Dev', avgScore: 96, assessments: 8 },
  { id: 3, name: 'Sarah Connor', role: 'Product Manager', avgScore: 95, assessments: 10 },
  { id: 4, name: 'James Rodriguez', role: 'Sales Lead', avgScore: 94, assessments: 15 },
];

interface AssessmentResult {
  id: number | string;
  employee: string;
  test: string;
  date: string;
  score: number;
  status: string;
}

export default function AssessmentsPage() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [recentResults, setRecentResults] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AssessmentResult | null>(null);
  const [form, setForm] = useState({ title: '', assessmentType: 'quiz', passingMarks: 70, totalMarks: 100 });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleCreateTest = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await TrainingDevelopmentService.createTrainingAssessment({
        title: form.title,
        assessmentType: form.assessmentType as any,
        passingMarks: Number(form.passingMarks),
        totalMarks: Number(form.totalMarks),
      } as any);
      setShowCreate(false);
      setForm({ title: '', assessmentType: 'quiz', passingMarks: 70, totalMarks: 100 });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.skillAssessments()) as any[];
        const mapped: AssessmentResult[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          employee: r.employee ?? r.employeeName ?? '',
          test: r.test ?? r.testName ?? r.assessmentName ?? '',
          date: r.date ?? r.completedDate ?? '',
          score: Number(r.score ?? 0),
          status: r.status ?? (Number(r.score ?? 0) >= 70 ? 'Pass' : 'Fail'),
        }));
        if (!cancelled) setRecentResults(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load assessment results');
          setRecentResults([]);
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
            <FileCheck className="h-8 w-8 text-purple-600" />
            Assessments & Tests
          </h1>
          <p className="text-gray-500 mt-1">Evaluate learning outcomes and test results</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>This Month</option>
            <option>Last Quarter</option>
            <option>Last Year</option>
          </select>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            Create Test
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading assessment results…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Score Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Score Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="range"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={50}>
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Needs Attention</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        {/* Top Performers Widget */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Performers
          </h2>
          <div className="space-y-2">
            {topPerformers.map((performer) => (
              <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {performer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{performer.name}</h3>
                    <p className="text-xs text-gray-500">{performer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-600">{performer.avgScore}%</span>
                  <p className="text-xs text-gray-400">{performer.assessments} tests</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="w-full mt-4 text-sm text-purple-600 font-medium hover:text-purple-800 flex items-center justify-center"
          >
            View Leaderboard <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Recent Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Recent Test Results</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees or tests..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Employee</th>
                <th className="px-3 py-2">Test Name</th>
                <th className="px-3 py-2">Date Completed</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900">{result.employee}</td>
                  <td className="px-3 py-2">{result.test}</td>
                  <td className="px-3 py-2">{result.date}</td>
                  <td className="px-3 py-2 font-semibold">{result.score}%</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${result.status === 'Pass' ? 'text-green-700 bg-green-50 ring-green-600/20' :
                        'text-red-700 bg-red-50 ring-red-600/20'
                      }`}>
                      {result.status === 'Pass' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      {result.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create Test</h3>
            {saveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.assessmentType}
                  onChange={(e) => setForm({ ...form, assessmentType: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="practical">Practical</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={form.passingMarks}
                    onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={form.totalMarks}
                    onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTest}
                disabled={saving || !form.title}
                className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Create Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard
              </h3>
              <button onClick={() => setShowLeaderboard(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {topPerformers.map((performer, idx) => (
                <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5">#{idx + 1}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{performer.name}</h4>
                      <p className="text-xs text-gray-500">{performer.role}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">{performer.avgScore}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Result Details</h3>
              <button onClick={() => setSelectedResult(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Employee</dt><dd className="font-medium text-gray-900">{selectedResult.employee}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Test</dt><dd className="font-medium text-gray-900">{selectedResult.test}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd className="font-medium text-gray-900">{selectedResult.date}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Score</dt><dd className="font-medium text-gray-900">{selectedResult.score}%</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium text-gray-900">{selectedResult.status}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
