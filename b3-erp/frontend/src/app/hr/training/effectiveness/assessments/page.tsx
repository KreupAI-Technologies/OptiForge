'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
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

interface AssessmentRow {
  id: number | string;
  title: string;
  assessmentType: string;
  totalMarks: number;
  passingMarks: number;
  isActive: boolean;
}

export default function AssessmentsPage() {
  const [timeRange, setTimeRange] = useState('This Month');
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AssessmentRow | null>(null);
  const [form, setForm] = useState({ title: '', assessmentType: 'quiz', passingMarks: 70, totalMarks: 100 });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Derived from fetched assessments: distribution of passing thresholds across tests.
  const scoreDistribution = React.useMemo(() => {
    const buckets = [
      { range: '0-50%', count: 0, color: '#ef4444' },
      { range: '51-70%', count: 0, color: '#f59e0b' },
      { range: '71-85%', count: 0, color: '#3b82f6' },
      { range: '86-100%', count: 0, color: '#22c55e' },
    ];
    assessments.forEach((a) => {
      const pct = a.totalMarks > 0 ? (a.passingMarks / a.totalMarks) * 100 : 0;
      if (pct <= 50) buckets[0].count += 1;
      else if (pct <= 70) buckets[1].count += 1;
      else if (pct <= 85) buckets[2].count += 1;
      else buckets[3].count += 1;
    });
    return buckets;
  }, [assessments]);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = (await TrainingDevelopmentService.getTrainingAssessments()) as any[];
      const mapped: AssessmentRow[] = (Array.isArray(raw) ? raw : []).map((r) => ({
        id: r.id ?? '',
        title: r.assessmentName ?? r.title ?? '',
        assessmentType: r.assessmentType ?? 'quiz',
        totalMarks: Number(r.totalMarks ?? 0),
        passingMarks: Number(r.passingMarks ?? 0),
        isActive: Boolean(r.isActive),
      }));
      setAssessments(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load assessments');
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to create test');
    } finally {
      setSaving(false);
    }
  };

  const handleStartAttempt = async (row: AssessmentRow) => {
    setActionError(null);
    setActionSuccess(null);
    setAttemptId(String(row.id));
    try {
      const attempt = await TrainingDevelopmentService.startAssessmentAttempt(
        String(row.id),
        '',
        '',
      );
      setActionSuccess(`Attempt started for "${row.title}" (attempt #${attempt.attemptNumber}).`);
      setAttemptId(attempt.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to start attempt.');
      setAttemptId(null);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!attemptId) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      const result = await TrainingDevelopmentService.submitAssessmentAttempt(attemptId, []);
      setActionSuccess(
        `Attempt submitted — ${result.obtainedMarks}/${result.totalMarks} (${result.isPassed ? 'Passed' : 'Not passed'}).`,
      );
      setAttemptId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit attempt.');
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}
      {actionSuccess && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{actionSuccess}</span>
          {attemptId && (
            <button
              onClick={handleSubmitAttempt}
              className="ml-3 rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
            >
              Submit Attempt
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* Score Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Passing Threshold Distribution</h2>
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
      </div>

      {/* Recent Results Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">Assessments</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Test Name</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Passing / Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">No assessments yet.</td>
                </tr>
              ) : (
                assessments.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-gray-900">{row.title}</td>
                    <td className="px-3 py-2 capitalize">{row.assessmentType}</td>
                    <td className="px-3 py-2 font-semibold">{row.passingMarks} / {row.totalMarks}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${row.isActive ? 'text-green-700 bg-green-50 ring-green-600/20' :
                          'text-gray-700 bg-gray-50 ring-gray-600/20'
                        }`}>
                        {row.isActive ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleStartAttempt(row)}
                          className="text-xs font-medium text-purple-600 hover:text-purple-800"
                        >
                          Start Attempt
                        </button>
                        <button
                          onClick={() => setSelectedResult(row)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Assessment Details</h3>
              <button onClick={() => setSelectedResult(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Title</dt><dd className="font-medium text-gray-900">{selectedResult.title}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium text-gray-900 capitalize">{selectedResult.assessmentType}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Passing Marks</dt><dd className="font-medium text-gray-900">{selectedResult.passingMarks}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Total Marks</dt><dd className="font-medium text-gray-900">{selectedResult.totalMarks}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium text-gray-900">{selectedResult.isActive ? 'Active' : 'Inactive'}</dd></div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
