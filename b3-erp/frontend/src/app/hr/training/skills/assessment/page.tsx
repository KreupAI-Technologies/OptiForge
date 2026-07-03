'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Plus,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  User
} from 'lucide-react';
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
import { HrPagesService } from '@/services/hr-pages.service';

interface Assessment {
  id: number | string;
  employee: string;
  role: string;
  skill: string;
  score: number;
  date: string;
  status: string;
  reviewer: string;
}

export default function AssessmentPage() {
  const [showNewAssessmentModal, setShowNewAssessmentModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [mockAssessments, setMockAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.skillAssessments()) as any[];
        const statusMap: Record<string, string> = {
          completed: 'Completed',
          in_review: 'In Review',
          'in-review': 'In Review',
          pending: 'In Review',
          needs_improvement: 'Needs Improvement',
          'needs-improvement': 'Needs Improvement',
        };
        const mapped: Assessment[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          employee: r.employeeName ?? '',
          role: r.category ?? '',
          skill: r.skillName ?? r.skillCode ?? '',
          score: Number(r.score ?? 0),
          date: r.assessmentDate ?? '',
          status: statusMap[String(r.status ?? '').toLowerCase()] ?? (r.status ?? 'In Review'),
          reviewer: r.assessor ?? 'Pending',
        }));
        if (!cancelled) setMockAssessments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load assessments');
          setMockAssessments([]);
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

  const total = mockAssessments.length;
  const pendingReviews = mockAssessments.filter((a) => a.status !== 'Completed').length;
  const avgScore = total > 0
    ? (mockAssessments.reduce((sum, a) => sum + a.score, 0) / total).toFixed(1)
    : '0.0';
  const certifiedPros = mockAssessments.filter((a) => a.status === 'Completed' && a.score >= 4).length;

  const assessmentStats = [
    { title: 'Total Assessments', value: String(total), change: '', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Pending Reviews', value: String(pendingReviews), change: '', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Avg. Skill Score', value: avgScore, change: '', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Certified Pros', value: String(certifiedPros), change: '', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const skillDistribution = [
    { name: 'Beginner', value: mockAssessments.filter((a) => a.score < 2).length, color: '#94a3b8' },
    { name: 'Intermediate', value: mockAssessments.filter((a) => a.score >= 2 && a.score < 3.5).length, color: '#60a5fa' },
    { name: 'Advanced', value: mockAssessments.filter((a) => a.score >= 3.5 && a.score < 4.5).length, color: '#818cf8' },
    { name: 'Expert', value: mockAssessments.filter((a) => a.score >= 4.5).length, color: '#a78bfa' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600 bg-green-50';
    if (score >= 3.5) return 'text-blue-600 bg-blue-50';
    if (score >= 2.5) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-700 bg-green-50 ring-green-600/20';
      case 'In Review': return 'text-blue-700 bg-blue-50 ring-blue-600/20';
      case 'Needs Improvement': return 'text-red-700 bg-red-50 ring-red-600/20';
      default: return 'text-gray-600 bg-gray-50 ring-gray-500/10';
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8 text-purple-600" />
            Skill Assessment
          </h1>
          <p className="text-gray-500 mt-1">Manage and track employee skill evaluations</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setShowNewAssessmentModal(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading assessments…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {assessmentStats.map((stat, index) => (
          <div key={index} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              {stat.change && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Table Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">Recent Assessments</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                <tr>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Skill Evaluated</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockAssessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs ring-2 ring-white">
                          {assessment.employee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{assessment.employee}</p>
                          <p className="text-xs text-gray-500">{assessment.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-gray-900">{assessment.skill}</span>
                      <p className="text-xs text-gray-500">Evaluator: {assessment.reviewer}</p>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(assessment.score)}`}>
                        {assessment.score} / 5.0
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(assessment.status)}`}>
                        {assessment.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Skill Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Proficiency Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={80}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                  {skillDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Recommended Actions</h3>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">Upskill Intermediate Level</p>
                <p className="text-xs text-purple-700 mt-1">35% of workforce is at intermediate level. Schedule advanced workshops.</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Mentorship Program</p>
                <p className="text-xs text-blue-700 mt-1">Pair Experts (20%) with Beginners (15%) to accelerate learning.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Assessment Modal (Mock) */}
      {showNewAssessmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-3 m-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-900">New Skill Assessment</h2>
              <button
                onClick={() => setShowNewAssessmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                  <option>Select Employee...</option>
                  <option>Sarah Johnson</option>
                  <option>David Smith</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill Category</label>
                <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500">
                  <option>Technical</option>
                  <option>Soft Skills</option>
                  <option>Leadership</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Skill</label>
                <input type="text" className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500" placeholder="e.g. React.js" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proficiency Score (1-5)</label>
                <input type="range" min="1" max="5" step="0.5" className="w-full accent-purple-600" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 (Novice)</span>
                  <span>5 (Expert)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={3} className="w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"></textarea>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setShowNewAssessmentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Assessment Saved!');
                  setShowNewAssessmentModal(false);
                }}
                className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium text-white hover:bg-purple-700"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
