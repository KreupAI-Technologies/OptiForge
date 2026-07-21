'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingDown,
  Target,
  Users,
  ArrowRight,
  Filter,
  AlertTriangle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import { TrainingDevelopmentService, TrainingSchedule } from '@/services/training-development.service';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

// Mock Data
const gapData = [
  { subject: 'Cloud Arch.', A: 4.2, B: 3.5, fullMark: 5 },
  { subject: 'DevOps', A: 4.5, B: 2.8, fullMark: 5 },
  { subject: 'Cybersecurity', A: 4.8, B: 3.2, fullMark: 5 },
  { subject: 'AI/ML', A: 3.5, B: 2.1, fullMark: 5 },
  { subject: 'Agile', A: 4.5, B: 4.2, fullMark: 5 },
  { subject: 'Communication', A: 5.0, B: 4.5, fullMark: 5 },
];

interface SkillGap {
  id: number | string;
  skill: string;
  dept: string;
  expected: number;
  actual: number;
  gap: number;
  impact: string;
  employees: number;
}

const recommendations = [
  { id: 1, title: 'Advanced Kubernetes Workshop', provider: 'CloudNative Training', duration: '3 Days', type: 'External' },
  { id: 2, title: 'Applied AI for Business', provider: 'Internal Academy', duration: '4 Weeks', type: 'Internal' },
  { id: 3, title: 'Enterprise Sales Mastery', provider: 'SalesPro', duration: '2 Days', type: 'External' },
];

export default function GapAnalysisPage() {
  const [selectedDept, setSelectedDept] = useState('Engineering');
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [enrollFor, setEnrollFor] = useState<{ title: string } | null>(null);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [enrollForm, setEnrollForm] = useState({ scheduleId: '', employeeName: '', employeeCode: '', department: '' });
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollMessage, setEnrollMessage] = useState<string | null>(null);

  const openEnroll = async (rec: { title: string }) => {
    setEnrollFor(rec);
    setEnrollError(null);
    setEnrollMessage(null);
    setEnrollForm({ scheduleId: '', employeeName: '', employeeCode: '', department: '' });
    try {
      const { data } = await TrainingDevelopmentService.getTrainingSchedules();
      setSchedules(data);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Failed to load training schedules');
      setSchedules([]);
    }
  };

  const handleEnroll = async () => {
    if (!enrollForm.scheduleId) {
      setEnrollError('Please select a training schedule.');
      return;
    }
    setEnrolling(true);
    setEnrollError(null);
    try {
      await TrainingDevelopmentService.enrollInTraining({
        scheduleId: enrollForm.scheduleId,
        employeeId: enrollForm.employeeCode,
        employeeName: enrollForm.employeeName,
        employeeCode: enrollForm.employeeCode,
        department: enrollForm.department || undefined,
      });
      setEnrollMessage('Employee enrolled successfully.');
      setEnrollFor(null);
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Failed to enroll employee');
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.get('/hr/skill-gaps')) as any[];
        const mapped: SkillGap[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          skill: r.skill ?? '',
          dept: r.dept ?? r.department ?? '',
          expected: Number(r.expected ?? 0),
          actual: Number(r.actual ?? 0),
          gap: Number(r.gap ?? 0),
          impact: r.impact ?? 'Low',
          employees: Number(r.employees ?? 0),
        }));
        if (!cancelled) setSkillGaps(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load skill gaps');
          setSkillGaps([]);
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
            <TrendingDown className="h-8 w-8 text-purple-600" />
            Skill Gap Analysis
          </h1>
          <p className="text-gray-500 mt-1">Identify and bridge competency gaps across the organization</p>
        </div>
        <div className="flex gap-3">
          <select
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Sales</option>
            <option>Marketing</option>
            <option>Human Resources</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading skill gaps…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {enrollMessage && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {enrollMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Target vs Actual Proficiency ({selectedDept})</h2>
          <p className="text-sm text-gray-500 mb-3">Comparing required skill levels against current employee assessments.</p>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={gapData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                <Radar name="Target Level" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="Actual Level" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <Legend />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  itemStyle={{ fontSize: '12px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-2 text-xs text-gray-500 justify-center">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-500/20 border border-purple-500"></span>
              <span>Target</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></span>
              <span>Actual</span>
            </div>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Recommended Training</h2>
          <p className="text-sm text-gray-500 mb-3">Suggested programs to bridge top skill gaps.</p>

          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">{rec.title}</h3>
                    <p className="text-xs text-gray-500">{rec.provider} • {rec.duration}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${rec.type === 'Internal' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {rec.type}
                  </span>
                </div>
                <button onClick={() => openEnroll(rec)} className="flex items-center text-xs font-medium text-purple-600 mt-2 hover:text-purple-800">
                  Enroll Employees <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-900">Insight</h4>
                <p className="text-xs text-amber-700 mt-1">
                  The largest gap is in <strong>DevOps</strong> (-1.7). Prioritize external training budget for Kubernetes certifications this quarter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gap Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Critical Skill Gaps</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-3 py-2">Skill</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2 text-center">Expected</th>
                <th className="px-3 py-2 text-center">Actual</th>
                <th className="px-3 py-2 text-center">Gap</th>
                <th className="px-3 py-2 text-center">Affected Employees</th>
                <th className="px-3 py-2">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {skillGaps.map((gap) => (
                <tr key={gap.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 font-medium text-gray-900">{gap.skill}</td>
                  <td className="px-3 py-2">{gap.dept}</td>
                  <td className="px-3 py-2 text-center">{gap.expected}</td>
                  <td className="px-3 py-2 text-center text-red-600 font-medium">{gap.actual}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-1 rounded-md text-xs font-bold">
                      {gap.gap}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-gray-900">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      {gap.employees}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${gap.impact === 'High' ? 'bg-red-100 text-red-700' :
                        gap.impact === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                      }`}>
                      {gap.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {enrollFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEnrollFor(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Enroll Employees</h2>
            <p className="text-sm text-gray-500 mb-3">{enrollFor.title}</p>
            {enrollError && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {enrollError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Schedule</label>
                <select value={enrollForm.scheduleId} onChange={(e) => setEnrollForm({ ...enrollForm, scheduleId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select a schedule…</option>
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>{s.batchName} ({s.scheduleCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input type="text" value={enrollForm.employeeName} onChange={(e) => setEnrollForm({ ...enrollForm, employeeName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code</label>
                <input type="text" value={enrollForm.employeeCode} onChange={(e) => setEnrollForm({ ...enrollForm, employeeCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" value={enrollForm.department} onChange={(e) => setEnrollForm({ ...enrollForm, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEnrollFor(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">Cancel</button>
              <button onClick={handleEnroll} disabled={enrolling} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm disabled:opacity-50">{enrolling ? 'Enrolling…' : 'Enroll'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
