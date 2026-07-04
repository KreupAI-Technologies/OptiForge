'use client';

import { useState, useMemo, useEffect } from 'react';
import { Users, Download, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

interface EEOCategory {
  category: string;
  male: number;
  female: number;
  other: number;
  total: number;
  targetFemale: number;
  targetMet: boolean;
}

interface HiringData {
  year: string;
  quarter: string;
  totalApplications: number;
  maleApplicants: number;
  femaleApplicants: number;
  diverseApplicants: number;
  totalHired: number;
  maleHired: number;
  femaleHired: number;
  diverseHired: number;
  selectionRate: number;
}

export default function Page() {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const eeoCategories: EEOCategory[] = [
    { category: 'Executive/Senior Officials', male: 22, female: 6, other: 0, total: 28, targetFemale: 30, targetMet: false },
    { category: 'Managers', male: 52, female: 18, other: 0, total: 70, targetFemale: 30, targetMet: false },
    { category: 'Professionals', male: 85, female: 42, other: 1, total: 128, targetFemale: 35, targetMet: false },
    { category: 'Technicians', male: 64, female: 18, other: 1, total: 83, targetFemale: 25, targetMet: false },
    { category: 'Sales Workers', male: 28, female: 20, other: 0, total: 48, targetFemale: 40, targetMet: true },
    { category: 'Administrative Support', male: 15, female: 22, other: 0, total: 37, targetFemale: 50, targetMet: true },
    { category: 'Craft Workers', male: 32, female: 1, other: 1, total: 34, targetFemale: 10, targetMet: false },
    { category: 'Operatives', male: 20, female: 1, other: 1, total: 22, targetFemale: 10, targetMet: false }
  ];

  const [hiringData2025, setHiringData2025] = useState<HiringData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrComplianceDocsService.getDocuments('diversity');
        const mapped: HiringData[] = rows.map((row) => {
          const meta = (row.meta || {}) as any;
          return {
            year: meta.year ?? '',
            quarter: meta.quarter ?? '',
            totalApplications: meta.totalApplications ?? 0,
            maleApplicants: meta.maleApplicants ?? 0,
            femaleApplicants: meta.femaleApplicants ?? 0,
            diverseApplicants: meta.diverseApplicants ?? 0,
            totalHired: meta.totalHired ?? 0,
            maleHired: meta.maleHired ?? 0,
            femaleHired: meta.femaleHired ?? 0,
            diverseHired: meta.diverseHired ?? 0,
            selectionRate: meta.selectionRate ?? 0,
          };
        });
        if (!cancelled) setHiringData2025(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load EEO hiring data');
          setHiringData2025([]);
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

  const promotionData = {
    totalPromotions: 45,
    malePromoted: 32,
    femalePromoted: 13,
    malePromotionRate: 71.1,
    femalePromotionRate: 28.9,
    targetFemalePromotionRate: 30.0
  };

  const compensationData = {
    avgMaleSalary: 725000,
    avgFemaleSalary: 698000,
    genderPayGap: 3.7,
    targetPayGap: 5.0,
    compliant: true
  };

  const trainingData = {
    totalTrainingHours: 8540,
    maleTrainingHours: 5850,
    femaleTrainingHours: 2690,
    avgMaleTraining: 18.4,
    avgFemaleTraining: 21.0,
    diversityTrainingCompleted: 425,
    diversityTrainingTarget: 450
  };

  const filteredCategories = selectedCategory === 'all'
    ? eeoCategories
    : eeoCategories.filter(c => c.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const totalEmployees = eeoCategories.reduce((sum, cat) => sum + cat.total, 0);
  const totalMale = eeoCategories.reduce((sum, cat) => sum + cat.male, 0);
  const totalFemale = eeoCategories.reduce((sum, cat) => sum + cat.female, 0);
  const totalOther = eeoCategories.reduce((sum, cat) => sum + cat.other, 0);
  const femalePercentage = ((totalFemale / totalEmployees) * 100).toFixed(1);
  const categoriesMeetingTarget = eeoCategories.filter(c => c.targetMet).length;

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Equal Employment Opportunity (EEO) Reports
        </h1>
        <p className="text-sm text-gray-600 mt-1">Comprehensive EEO compliance tracking and reporting</p>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading EEO hiring data…
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
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Workforce</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-sm border border-pink-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Female %</p>
              <p className="text-3xl font-bold text-pink-900 mt-1">{femalePercentage}%</p>
              <p className="text-xs text-pink-700 mt-1">{totalFemale} employees</p>
            </div>
            <TrendingUp className="h-10 w-10 text-pink-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Categories Meeting Target</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{categoriesMeetingTarget}/{eeoCategories.length}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Pay Gap</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{compensationData.genderPayGap}%</p>
              <p className="text-xs text-purple-700 mt-1">Target: &lt;{compensationData.targetPayGap}%</p>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              Download EEO-1 Report
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">EEO Job Categories Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Category</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Male</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Female</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Other</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Female %</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Target</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((cat, index) => {
                const femalePercent = ((cat.female / cat.total) * 100).toFixed(1);
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{cat.category}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">{cat.total}</td>
                    <td className="px-4 py-3 text-sm text-center text-blue-700 font-bold">{cat.male}</td>
                    <td className="px-4 py-3 text-sm text-center text-pink-700 font-bold">{cat.female}</td>
                    <td className="px-4 py-3 text-sm text-center text-purple-700 font-bold">{cat.other}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">{femalePercent}%</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{cat.targetFemale}%</td>
                    <td className="px-4 py-3 text-sm text-center">
                      {cat.targetMet ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 flex items-center justify-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Met
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-700 flex items-center justify-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Below
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200 font-bold">
                <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">{totalEmployees}</td>
                <td className="px-4 py-3 text-sm text-center text-blue-700">{totalMale}</td>
                <td className="px-4 py-3 text-sm text-center text-pink-700">{totalFemale}</td>
                <td className="px-4 py-3 text-sm text-center text-purple-700">{totalOther}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-900">{femalePercentage}%</td>
                <td className="px-4 py-3 text-sm text-center text-gray-600">30%</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">2025 Hiring Statistics</h2>
          <div className="space-y-2">
            {hiringData2025.map((data, index) => (
              <div key={index}>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-900">{data.totalApplications}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Total Hired</p>
                    <p className="text-2xl font-bold text-green-900">{data.totalHired}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-3">Hiring Breakdown</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Male Hired</p>
                      <p className="text-lg font-bold text-blue-700">{data.maleHired}</p>
                      <p className="text-xs text-blue-600">{((data.maleHired / data.totalHired) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Female Hired</p>
                      <p className="text-lg font-bold text-pink-700">{data.femaleHired}</p>
                      <p className="text-xs text-pink-600">{((data.femaleHired / data.totalHired) * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Diverse Hired</p>
                      <p className="text-lg font-bold text-green-700">{data.diverseHired}</p>
                      <p className="text-xs text-green-600">{((data.diverseHired / data.totalHired) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Promotions & Advancement</h2>
          <div className="space-y-2">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 uppercase font-medium mb-2">Total Promotions (2025)</p>
              <p className="text-3xl font-bold text-purple-900">{promotionData.totalPromotions}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Male Promoted</p>
                <p className="text-2xl font-bold text-blue-900">{promotionData.malePromoted}</p>
                <p className="text-xs text-blue-700 mt-1">{promotionData.malePromotionRate}%</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <p className="text-xs text-pink-600 uppercase font-medium mb-1">Female Promoted</p>
                <p className="text-2xl font-bold text-pink-900">{promotionData.femalePromoted}</p>
                <p className="text-xs text-pink-700 mt-1">{promotionData.femalePromotionRate}%</p>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-600 uppercase font-medium">Target Achievement</p>
                  <p className="text-sm text-yellow-900 mt-1">Female promotion target: {promotionData.targetFemalePromotionRate}%</p>
                </div>
                {promotionData.femalePromotionRate >= promotionData.targetFemalePromotionRate ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Compensation Equity</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 uppercase font-medium mb-1">Avg Male Salary</p>
                <p className="text-2xl font-bold text-blue-900">₹{(compensationData.avgMaleSalary / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <p className="text-xs text-pink-600 uppercase font-medium mb-1">Avg Female Salary</p>
                <p className="text-2xl font-bold text-pink-900">₹{(compensationData.avgFemaleSalary / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <div className={`rounded-lg p-3 border ${compensationData.compliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs uppercase font-medium mb-1 ${compensationData.compliant ? 'text-green-600' : 'text-red-600'}`}>Gender Pay Gap</p>
                  <p className={`text-3xl font-bold ${compensationData.compliant ? 'text-green-900' : 'text-red-900'}`}>{compensationData.genderPayGap}%</p>
                  <p className={`text-xs mt-1 ${compensationData.compliant ? 'text-green-700' : 'text-red-700'}`}>Target: &lt;{compensationData.targetPayGap}%</p>
                </div>
                {compensationData.compliant ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
              Pay gap calculated as percentage difference between male and female average salaries for equivalent roles and experience levels.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Training & Development</h2>
          <div className="space-y-2">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 uppercase font-medium mb-1">Total Training Hours (2025)</p>
              <p className="text-3xl font-bold text-blue-900">{trainingData.totalTrainingHours.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-600 uppercase font-medium mb-1">Avg Male Training</p>
                <p className="text-xl font-bold text-purple-900">{trainingData.avgMaleTraining} hrs</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                <p className="text-xs text-pink-600 uppercase font-medium mb-1">Avg Female Training</p>
                <p className="text-xl font-bold text-pink-900">{trainingData.avgFemaleTraining} hrs</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 uppercase font-medium mb-2">Diversity Training Progress</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${(trainingData.diversityTrainingCompleted / trainingData.diversityTrainingTarget) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-green-900">
                  {trainingData.diversityTrainingCompleted}/{trainingData.diversityTrainingTarget}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-2">
                {((trainingData.diversityTrainingCompleted / trainingData.diversityTrainingTarget) * 100).toFixed(1)}% employees completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
