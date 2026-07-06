'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Award, AlertTriangle } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface BenchStrength {
  position: string;
  department: string;
  level: 'executive' | 'senior' | 'mid_level';
  currentHolder: string;
  successors: {
    ready_now: number;
    ready_6months: number;
    ready_1year: number;
    ready_2years: number;
    ready_3plus: number;
  };
  totalSuccessors: number;
  benchDepth: 'strong' | 'adequate' | 'weak' | 'critical';
  avgQuality: number;
  retirementRisk: boolean;
}

export default function Page() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedDepth, setSelectedDepth] = useState<string>('all');

  const [rows, setRows] = useState<BenchStrength[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<BenchStrength>('bench-strength');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredData = rows.filter(item => {
    const matchesLevel = selectedLevel === 'all' || item.level === selectedLevel;
    const matchesDepth = selectedDepth === 'all' || item.benchDepth === selectedDepth;
    return matchesLevel && matchesDepth;
  });

  const getDepthColor = (depth: string) => {
    switch (depth) {
      case 'strong': return 'bg-green-100 text-green-700 border-green-300';
      case 'adequate': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'weak': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 85) return 'text-green-600';
    if (quality >= 75) return 'text-teal-600';
    if (quality >= 65) return 'text-blue-600';
    if (quality >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const strongBench = rows.filter(b => b.benchDepth === 'strong').length;
  const adequateBench = rows.filter(b => b.benchDepth === 'adequate').length;
  const weakBench = rows.filter(b => b.benchDepth === 'weak').length;
  const criticalBench = rows.filter(b => b.benchDepth === 'critical').length;
  const avgQuality = rows.length ? Math.round(rows.reduce((sum, b) => sum + b.avgQuality, 0) / rows.length) : 0;

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-600" />
          Bench Strength
        </h1>
        <p className="text-sm text-gray-600 mt-1">Talent depth and successor pipeline analysis</p>
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Strong</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{strongBench}</p>
            </div>
            <Users className="h-8 w-8 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Adequate</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{adequateBench}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-teal-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Weak</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{weakBench}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Critical</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{criticalBench}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Avg. Quality</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{avgQuality}%</p>
            </div>
            <Award className="h-8 w-8 text-blue-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Level</label>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Levels</option>
              <option value="executive">Executive</option>
              <option value="senior">Senior</option>
              <option value="mid_level">Mid-Level</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Bench Depth</label>
            <select value={selectedDepth} onChange={(e) => setSelectedDepth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Depths</option>
              <option value="strong">Strong</option>
              <option value="adequate">Adequate</option>
              <option value="weak">Weak</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{item.position}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getDepthColor(item.benchDepth)}`}>
                    {item.benchDepth.toUpperCase()}
                  </span>
                  {item.retirementRisk && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full border-2 bg-orange-100 text-orange-700 border-orange-300">
                      RETIREMENT RISK
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.department} • {item.currentHolder} • {item.level.replace('_', '-')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Total Successors</p>
                <p className="text-2xl font-bold text-teal-600">{item.totalSuccessors}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Ready Now</p>
                <p className="text-2xl font-bold text-green-700">{item.successors.ready_now}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">6 Months</p>
                <p className="text-2xl font-bold text-teal-700">{item.successors.ready_6months}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">1 Year</p>
                <p className="text-2xl font-bold text-blue-700">{item.successors.ready_1year}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">2 Years</p>
                <p className="text-2xl font-bold text-purple-700">{item.successors.ready_2years}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">3+ Years</p>
                <p className="text-2xl font-bold text-gray-700">{item.successors.ready_3plus}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Avg. Quality</p>
                <p className={`text-2xl font-bold ${getQualityColor(item.avgQuality)}`}>{item.avgQuality || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-2">Successor Readiness Timeline</p>
              <div className="flex items-center gap-1">
                {item.totalSuccessors > 0 ? (
                  <>
                    {item.successors.ready_now > 0 && <div className="bg-green-500 h-3 rounded" style={{ width: `${(item.successors.ready_now / item.totalSuccessors) * 100}%` }} title={`${item.successors.ready_now} ready now`}></div>}
                    {item.successors.ready_6months > 0 && <div className="bg-teal-500 h-3 rounded" style={{ width: `${(item.successors.ready_6months / item.totalSuccessors) * 100}%` }} title={`${item.successors.ready_6months} in 6 months`}></div>}
                    {item.successors.ready_1year > 0 && <div className="bg-blue-500 h-3 rounded" style={{ width: `${(item.successors.ready_1year / item.totalSuccessors) * 100}%` }} title={`${item.successors.ready_1year} in 1 year`}></div>}
                    {item.successors.ready_2years > 0 && <div className="bg-purple-500 h-3 rounded" style={{ width: `${(item.successors.ready_2years / item.totalSuccessors) * 100}%` }} title={`${item.successors.ready_2years} in 2 years`}></div>}
                    {item.successors.ready_3plus > 0 && <div className="bg-gray-500 h-3 rounded" style={{ width: `${(item.successors.ready_3plus / item.totalSuccessors) * 100}%` }} title={`${item.successors.ready_3plus} in 3+ years`}></div>}
                  </>
                ) : (
                  <div className="bg-red-500 h-3 rounded flex-1"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
