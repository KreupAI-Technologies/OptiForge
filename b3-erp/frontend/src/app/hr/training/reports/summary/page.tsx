'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, BookOpen, Award, TrendingUp, Clock, Calendar, BarChart3, IndianRupee, AlertCircle } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { HrPagesService } from '@/services/hr-pages.service';

interface DepartmentTraining {
  department: string;
  employees: number;
  programsCompleted: number;
  programsInProgress: number;
  totalHours: number;
  certifications: number;
  avgCompletion: number;
  budgetSpent: number;
  budgetTotal: number;
}

interface TopTraining {
  program: string;
  enrollments: number;
  completions: number;
  completionRate: number;
}

export default function TrainingSummaryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-q3');
  const [mockDepartmentData, setMockDepartmentData] = useState<DepartmentTraining[]>([]);
  const [topTrainings, setTopTrainings] = useState<TopTraining[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.trainingPrograms()) as any[];
        const programs = Array.isArray(raw) ? raw : [];

        // Aggregate programs into per-department summary rows.
        const byDept = new Map<string, DepartmentTraining>();
        for (const p of programs) {
          const dept = p.department || 'Unassigned';
          let row = byDept.get(dept);
          if (!row) {
            row = {
              department: dept,
              employees: 0,
              programsCompleted: 0,
              programsInProgress: 0,
              totalHours: 0,
              certifications: 0,
              avgCompletion: 0,
              budgetSpent: 0,
              budgetTotal: 0,
            };
            byDept.set(dept, row);
          }
          const enrolled = Number(p.enrolled ?? 0);
          const capacity = Number(p.capacity ?? 0);
          const duration = Number(p.duration ?? 0);
          const cost = Number(p.cost ?? 0);
          const status = String(p.status ?? '').toLowerCase();
          row.employees += enrolled;
          if (status === 'completed') row.programsCompleted += 1;
          else if (status === 'ongoing' || status === 'in_progress' || status === 'active') row.programsInProgress += 1;
          row.totalHours += duration * enrolled;
          if (p.certification) row.certifications += enrolled;
          row.budgetTotal += cost * capacity;
          row.budgetSpent += cost * enrolled;
        }
        const deptRows = Array.from(byDept.values()).map((r) => ({
          ...r,
          avgCompletion: r.employees > 0
            ? Math.round((r.certifications / r.employees) * 100)
            : 0,
        }));

        // Top programs by enrollment.
        const top: TopTraining[] = programs
          .map((p) => {
            const enrollments = Number(p.enrolled ?? 0);
            const completions = String(p.status ?? '').toLowerCase() === 'completed' ? enrollments : 0;
            return {
              program: p.title ?? p.code ?? '',
              enrollments,
              completions,
              completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
            };
          })
          .sort((a, b) => b.enrollments - a.enrollments)
          .slice(0, 5);

        if (!cancelled) {
          setMockDepartmentData(deptRows);
          setTopTrainings(top);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load training summary');
          setMockDepartmentData([]);
          setTopTrainings([]);
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

  const overallStats = {
    totalEmployees: mockDepartmentData.reduce((sum, d) => sum + d.employees, 0),
    totalProgramsCompleted: mockDepartmentData.reduce((sum, d) => sum + d.programsCompleted, 0),
    totalProgramsInProgress: mockDepartmentData.reduce((sum, d) => sum + d.programsInProgress, 0),
    totalHours: mockDepartmentData.reduce((sum, d) => sum + d.totalHours, 0),
    totalCertifications: mockDepartmentData.reduce((sum, d) => sum + d.certifications, 0),
    avgCompletion: mockDepartmentData.length > 0
      ? Math.round(mockDepartmentData.reduce((sum, d) => sum + d.avgCompletion, 0) / mockDepartmentData.length)
      : 0,
    totalBudgetSpent: mockDepartmentData.reduce((sum, d) => sum + d.budgetSpent, 0),
    totalBudget: mockDepartmentData.reduce((sum, d) => sum + d.budgetTotal, 0)
  };

  const avgHoursPerEmployee = overallStats.totalEmployees > 0
    ? Math.round(overallStats.totalHours / overallStats.totalEmployees)
    : 0;
  const budgetUtilPct = overallStats.totalBudget > 0
    ? Math.round((overallStats.totalBudgetSpent / overallStats.totalBudget) * 100)
    : 0;
  const costPerEmployee = overallStats.totalEmployees > 0
    ? Math.round(overallStats.totalBudgetSpent / overallStats.totalEmployees)
    : 0;

  const columns = [
    { key: 'department', label: 'Department', sortable: true,
      render: (v: string) => <div className="font-semibold text-gray-900">{v}</div>
    },
    { key: 'employees', label: 'Employees', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v}</div>
    },
    { key: 'programsCompleted', label: 'Completed', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-green-700">{v}</div>
    },
    { key: 'programsInProgress', label: 'In Progress', sortable: true,
      render: (v: number) => <div className="text-sm text-blue-700">{v}</div>
    },
    { key: 'totalHours', label: 'Total Hours', sortable: true,
      render: (v: number) => <div className="text-sm text-gray-700">{v}h</div>
    },
    { key: 'certifications', label: 'Certifications', sortable: true,
      render: (v: number) => <div className="text-sm font-semibold text-orange-700">{v}</div>
    },
    { key: 'avgCompletion', label: 'Completion %', sortable: true,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
            <div
              className={`h-2 rounded-full ${v >= 85 ? 'bg-green-500' : v >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${v}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900">{v}%</span>
        </div>
      )
    },
    { key: 'budgetSpent', label: 'Budget Used', sortable: true,
      render: (v: number, row: DepartmentTraining) => (
        <div className="text-sm text-gray-700">
          <div>₹{(v / 100000).toFixed(1)}L</div>
          <div className="text-xs text-gray-500">of ₹{(row.budgetTotal / 100000).toFixed(1)}L</div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="h-8 w-8 text-emerald-600" />
          Training Summary Report
        </h1>
        <p className="text-gray-600 mt-2">Comprehensive overview of organizational training activities</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading training summary…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Report Period:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2024-q3">Q3 2024 (Jul - Sep)</option>
            <option value="2024-q2">Q2 2024 (Apr - Jun)</option>
            <option value="2024-q1">Q1 2024 (Jan - Mar)</option>
            <option value="2024-ytd">Year to Date 2024</option>
            <option value="2024-full">Full Year 2024</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-emerald-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees Trained</p>
              <p className="text-2xl font-bold text-emerald-600">{overallStats.totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-emerald-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Programs Completed</p>
              <p className="text-2xl font-bold text-green-600">{overallStats.totalProgramsCompleted}</p>
            </div>
            <BookOpen className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{overallStats.totalProgramsInProgress}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-purple-600">{overallStats.avgCompletion}%</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Training Hours</p>
              <p className="text-2xl font-bold text-orange-600">{overallStats.totalHours}h</p>
            </div>
            <Clock className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certifications Earned</p>
              <p className="text-2xl font-bold text-yellow-600">{overallStats.totalCertifications}</p>
            </div>
            <Award className="h-10 w-10 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Budget Utilized</p>
              <p className="text-xl font-bold text-indigo-600">₹{(overallStats.totalBudgetSpent / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-gray-500">of ₹{(overallStats.totalBudget / 10000000).toFixed(2)}Cr</p>
            </div>
            <IndianRupee className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Hours/Employee</p>
              <p className="text-2xl font-bold text-teal-600">
                {avgHoursPerEmployee}h
              </p>
            </div>
            <Calendar className="h-10 w-10 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Department-wise Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Department-wise Training Summary</h3>
        </div>
        <DataTable data={mockDepartmentData} columns={columns} />
      </div>

      {/* Top Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Top Training Programs
          </h3>
          <div className="space-y-2">
            {topTrainings.map((training, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{training.program}</p>
                    <p className="text-sm text-gray-600">
                      {training.completions} completions / {training.enrollments} enrolled
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {training.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${training.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-indigo-600" />
            Budget Analysis
          </h3>
          <div className="space-y-2">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Budget Allocated</p>
              <p className="text-2xl font-bold text-indigo-900">
                ₹{(overallStats.totalBudget / 10000000).toFixed(2)} Crore
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Budget Spent</p>
              <p className="text-2xl font-bold text-green-900">
                ₹{(overallStats.totalBudgetSpent / 10000000).toFixed(2)} Crore
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${budgetUtilPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {budgetUtilPct}% utilized
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Remaining Budget</p>
              <p className="text-2xl font-bold text-orange-900">
                ₹{((overallStats.totalBudget - overallStats.totalBudgetSpent) / 10000000).toFixed(2)} Crore
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Cost per Employee</p>
              <p className="text-2xl font-bold text-blue-900">
                ₹{costPerEmployee.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">Key Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <h4 className="font-semibold text-gray-900 mb-2">✓ Strengths</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Safety & Compliance dept has highest completion rate (92%)</li>
              <li>• Overall average completion rate is strong at {overallStats.avgCompletion}%</li>
              <li>• {overallStats.totalCertifications} certifications earned this quarter</li>
              <li>• Budget utilization is on track at {budgetUtilPct}%</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-3 border border-orange-200">
            <h4 className="font-semibold text-gray-900 mb-2">⚠ Areas for Improvement</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Warehouse & Logistics has lowest completion rate (78%)</li>
              <li>• {overallStats.totalProgramsInProgress} programs still in progress</li>
              <li>• Recommend increasing budget allocation for high-demand programs</li>
              <li>• Focus on improving engagement in technical training courses</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
