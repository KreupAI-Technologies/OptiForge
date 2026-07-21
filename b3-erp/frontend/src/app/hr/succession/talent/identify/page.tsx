'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Star, TrendingUp, Award } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface TalentEmployee {
  id: string;
  name: string;
  employeeCode: string;
  currentPosition: string;
  department: string;
  performance: number;
  potential: number;
  classification: 'star' | 'high_potential' | 'core_player' | 'solid_performer';
  readyFor: string[];
  strengths: string[];
  developmentAreas: string[];
  experienceYears: number;
}

export default function Page() {
  const router = useRouter();
  const [selectedClassification, setSelectedClassification] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const [rows, setRows] = useState<TalentEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<TalentEmployee>('talent');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredTalent = rows.filter(emp => {
    if (selectedClassification !== 'all' && emp.classification !== selectedClassification) return false;
    if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: rows.length,
    stars: rows.filter(e => e.classification === 'star').length,
    highPotential: rows.filter(e => e.classification === 'high_potential').length,
    corePlayers: rows.filter(e => e.classification === 'core_player').length
  }), [rows]);

  const classificationColors = {
    star: 'bg-green-100 text-green-700 border-green-300',
    high_potential: 'bg-teal-100 text-teal-700 border-teal-300',
    core_player: 'bg-blue-100 text-blue-700 border-blue-300',
    solid_performer: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="h-6 w-6 text-teal-600" />
          Identify Talent (HiPo)
        </h1>
        <p className="text-sm text-gray-600 mt-1">High potential employee identification and tracking</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Talent</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-600">Stars</p>
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.stars}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            <p className="text-sm font-medium text-teal-600">High Potential</p>
          </div>
          <p className="text-2xl font-bold text-teal-900">{stats.highPotential}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Core Players</p>
          <p className="text-2xl font-bold text-blue-900">{stats.corePlayers}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
            <select value={selectedClassification} onChange={(e) => setSelectedClassification(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Classifications</option>
              <option value="star">Stars</option>
              <option value="high_potential">High Potential</option>
              <option value="core_player">Core Players</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Departments</option>
              <option value="IT">IT</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => router.push('/hr/succession/plans/create')} className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
              Add to Talent Pool
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTalent.map(emp => (
          <div key={emp.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{emp.name}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${classificationColors[emp.classification]}`}>
                    {emp.classification.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{emp.employeeCode} • {emp.currentPosition} • {emp.department} • {emp.experienceYears} years exp</p>
              </div>
              <div className="text-right">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Performance</p>
                    <p className="text-xl font-bold text-blue-600">{emp.performance}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Potential</p>
                    <p className="text-xl font-bold text-teal-600">{emp.potential}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Ready For</h4>
                </div>
                <div className="space-y-1">
                  {emp.readyFor.map((role, idx) => (
                    <div key={idx} className="text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Strengths</h4>
                <div className="flex flex-wrap gap-1">
                  {emp.strengths.map((strength, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Development Areas</h4>
                <div className="flex flex-wrap gap-1">
                  {emp.developmentAreas.map((area, idx) => (
                    <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded border border-orange-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => router.push('/hr/succession/talent/profiles')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Profile
              </button>
              <button onClick={() => router.push('/hr/succession/plans/create')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm">
                Create Development Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
