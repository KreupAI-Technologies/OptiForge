'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, BarChart3, PieChart, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface DiversityMetric {
  category: string;
  subcategory: string;
  total: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface DepartmentDiversity {
  department: string;
  totalEmployees: number;
  male: number;
  female: number;
  other: number;
  malePercentage: number;
  femalePercentage: number;
  otherPercentage: number;
}

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [departmentDiversity, setDepartmentDiversity] = useState<DepartmentDiversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getDocuments('diversity');
        const mapped: DepartmentDiversity[] = rows.map((row) => {
          const meta = (row.meta || {}) as any;
          return {
            department: meta.department ?? row.title ?? '',
            totalEmployees: meta.totalEmployees ?? 0,
            male: meta.male ?? 0,
            female: meta.female ?? 0,
            other: meta.other ?? 0,
            malePercentage: meta.malePercentage ?? 0,
            femalePercentage: meta.femalePercentage ?? 0,
            otherPercentage: meta.otherPercentage ?? 0,
          };
        });
        if (!cancelled) setDepartmentDiversity(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load department diversity');
          setDepartmentDiversity([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalEmployees = 450;
  const targetFemalePercentage = 30;
  const currentFemalePercentage = 28.4;

  const genderMetrics: DiversityMetric[] = [
    { category: 'Gender', subcategory: 'Male', total: 318, percentage: 70.7, trend: 'down', trendValue: 2.1 },
    { category: 'Gender', subcategory: 'Female', total: 128, percentage: 28.4, trend: 'up', trendValue: 3.2 },
    { category: 'Gender', subcategory: 'Other', total: 4, percentage: 0.9, trend: 'stable', trendValue: 0 }
  ];

  const ageMetrics: DiversityMetric[] = [
    { category: 'Age', subcategory: '18-25 years', total: 95, percentage: 21.1, trend: 'up', trendValue: 1.8 },
    { category: 'Age', subcategory: '26-35 years', total: 198, percentage: 44.0, trend: 'stable', trendValue: 0.5 },
    { category: 'Age', subcategory: '36-45 years', total: 112, percentage: 24.9, trend: 'down', trendValue: 1.2 },
    { category: 'Age', subcategory: '46-55 years', total: 38, percentage: 8.4, trend: 'down', trendValue: 0.8 },
    { category: 'Age', subcategory: '56+ years', total: 7, percentage: 1.6, trend: 'stable', trendValue: 0.1 }
  ];

  const disabilityMetrics: DiversityMetric[] = [
    { category: 'Disability', subcategory: 'Persons with Disabilities', total: 18, percentage: 4.0, trend: 'up', trendValue: 0.5 },
    { category: 'Disability', subcategory: 'Without Disabilities', total: 432, percentage: 96.0, trend: 'down', trendValue: 0.5 }
  ];

  const educationMetrics: DiversityMetric[] = [
    { category: 'Education', subcategory: 'Post Graduate', total: 112, percentage: 24.9, trend: 'up', trendValue: 2.3 },
    { category: 'Education', subcategory: 'Graduate', total: 248, percentage: 55.1, trend: 'stable', trendValue: 0.3 },
    { category: 'Education', subcategory: 'Diploma', total: 68, percentage: 15.1, trend: 'down', trendValue: 1.5 },
    { category: 'Education', subcategory: 'High School', total: 22, percentage: 4.9, trend: 'down', trendValue: 1.1 }
  ];

  const ethnicityMetrics: DiversityMetric[] = [
    { category: 'Ethnicity', subcategory: 'General', total: 265, percentage: 58.9, trend: 'stable', trendValue: 0.2 },
    { category: 'Ethnicity', subcategory: 'OBC', total: 108, percentage: 24.0, trend: 'up', trendValue: 1.8 },
    { category: 'Ethnicity', subcategory: 'SC', total: 54, percentage: 12.0, trend: 'up', trendValue: 1.2 },
    { category: 'Ethnicity', subcategory: 'ST', total: 23, percentage: 5.1, trend: 'up', trendValue: 0.8 }
  ];

  const leadershipMetrics = {
    totalLeadership: 45,
    maleLeaders: 36,
    femaleLeaders: 9,
    malePercentage: 80.0,
    femalePercentage: 20.0,
    targetFemaleLeadership: 30.0
  };

  const hiringMetrics = {
    totalHired2025: 82,
    maleHired: 54,
    femaleHired: 28,
    maleHiredPercentage: 65.9,
    femaleHiredPercentage: 34.1,
    diverseHires: 18,
    diverseHiresPercentage: 22.0
  };

  const allMetrics = [...genderMetrics, ...ageMetrics, ...disabilityMetrics, ...educationMetrics, ...ethnicityMetrics];

  const filteredMetrics = selectedCategory === 'all'
    ? allMetrics
    : allMetrics.filter(m => m.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          Diversity Metrics Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">Comprehensive workforce diversity analytics and insights</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading department diversity…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Employees</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-sm border border-pink-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Female %</p>
              <p className="text-3xl font-bold text-pink-900 mt-1">{currentFemalePercentage}%</p>
              <p className="text-xs text-pink-700 mt-1">Target: {targetFemalePercentage}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-pink-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Women in Leadership</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{leadershipMetrics.femalePercentage}%</p>
              <p className="text-xs text-purple-700 mt-1">9 of 45 leaders</p>
            </div>
            <Users className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Diverse Hires 2025</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{hiringMetrics.diverseHiresPercentage}%</p>
              <p className="text-xs text-green-700 mt-1">{hiringMetrics.diverseHires} of {hiringMetrics.totalHired2025}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="all">All Categories</option>
              <option value="gender">Gender</option>
              <option value="age">Age</option>
              <option value="disability">Disability</option>
              <option value="education">Education</option>
              <option value="ethnicity">Ethnicity</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Diversity Breakdown</h2>
          </div>
          <div className="space-y-3">
            {filteredMetrics.map((metric, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{metric.subcategory}</span>
                    <span className="text-xs text-gray-500">({metric.category})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{metric.percentage}%</span>
                    {metric.trend === 'up' && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{metric.trendValue}%
                      </span>
                    )}
                    {metric.trend === 'down' && (
                      <span className="text-xs text-red-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 rotate-180" />
                        -{metric.trendValue}%
                      </span>
                    )}
                    {metric.trend === 'stable' && (
                      <span className="text-xs text-gray-500">stable</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">{metric.total} emp</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">2025 Hiring Diversity</h2>
          </div>
          <div className="space-y-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 uppercase font-medium mb-2">Total Hires</p>
              <p className="text-3xl font-bold text-blue-900">{hiringMetrics.totalHired2025}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-600 uppercase font-medium mb-1">Male Hires</p>
                <p className="text-2xl font-bold text-purple-900">{hiringMetrics.maleHired}</p>
                <p className="text-xs text-purple-700 mt-1">{hiringMetrics.maleHiredPercentage}%</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <p className="text-xs text-pink-600 uppercase font-medium mb-1">Female Hires</p>
                <p className="text-2xl font-bold text-pink-900">{hiringMetrics.femaleHired}</p>
                <p className="text-xs text-pink-700 mt-1">{hiringMetrics.femaleHiredPercentage}%</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 uppercase font-medium mb-1">Diverse Background Hires</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-900">{hiringMetrics.diverseHires}</p>
                <p className="text-sm text-green-700">{hiringMetrics.diverseHiresPercentage}%</p>
              </div>
              <p className="text-xs text-green-600 mt-2">Includes SC/ST/OBC/PwD candidates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Department-wise Gender Distribution</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Male</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Female</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Other</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {departmentDiversity.map((dept, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.department}</td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">{dept.totalEmployees}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-blue-700">{dept.male}</span>
                      <span className="text-xs text-blue-600">{dept.malePercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-pink-700">{dept.female}</span>
                      <span className="text-xs text-pink-600">{dept.femalePercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-purple-700">{dept.other}</span>
                      <span className="text-xs text-purple-600">{dept.otherPercentage.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="flex-1 flex h-4 rounded-full overflow-hidden">
                        <div className="bg-blue-500" style={{ width: `${dept.malePercentage}%` }} title={`Male: ${dept.malePercentage.toFixed(1)}%`} />
                        <div className="bg-pink-500" style={{ width: `${dept.femalePercentage}%` }} title={`Female: ${dept.femalePercentage.toFixed(1)}%`} />
                        <div className="bg-purple-500" style={{ width: `${dept.otherPercentage}%` }} title={`Other: ${dept.otherPercentage.toFixed(1)}%`} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-bold text-purple-900">Leadership Diversity</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Leaders</p>
            <p className="text-3xl font-bold text-gray-900">{leadershipMetrics.totalLeadership}</p>
            <p className="text-xs text-gray-600 mt-2">Directors, Managers, Team Leads</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 uppercase font-medium mb-1">Women in Leadership</p>
            <p className="text-3xl font-bold text-pink-700">{leadershipMetrics.femaleLeaders}</p>
            <p className="text-xs text-pink-600 mt-2">{leadershipMetrics.femalePercentage}% of leadership</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600 uppercase font-medium mb-1">Target Achievement</p>
            <p className="text-3xl font-bold text-orange-700">{((leadershipMetrics.femalePercentage / leadershipMetrics.targetFemaleLeadership) * 100).toFixed(1)}%</p>
            <p className="text-xs text-orange-600 mt-2">Target: {leadershipMetrics.targetFemaleLeadership}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
