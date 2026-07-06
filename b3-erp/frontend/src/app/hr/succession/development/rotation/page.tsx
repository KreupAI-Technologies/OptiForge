'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Calendar, Target, Users, Building2 } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface JobRotation {
  id: string;
  employeeName: string;
  employeeCode: string;
  photo: string;
  currentRole: string;
  currentDepartment: string;
  rotationRole: string;
  rotationDepartment: string;
  rotationType: 'cross_functional' | 'lateral' | 'developmental' | 'international';
  status: 'planned' | 'ongoing' | 'completed' | 'extended' | 'terminated';
  startDate: string;
  endDate: string;
  duration: string;
  objectives: string[];
  learningGoals: string[];
  progress: number;
  currentSupervisor: string;
  rotationSupervisor: string;
  location: string;
  evaluation: {
    skillsGained: string[];
    overallRating?: number;
    feedbackDate?: string;
  };
}

export default function Page() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [rows, setRows] = useState<JobRotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getSuccession<JobRotation>('rotation');
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) { setRows([]); setLoadError(err instanceof Error ? err.message : 'Failed to load data'); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredRotations = rows.filter(rotation => {
    const matchesType = selectedType === 'all' || rotation.rotationType === selectedType;
    const matchesStatus = selectedStatus === 'all' || rotation.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cross_functional': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'lateral': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'developmental': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'international': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'ongoing': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'planned': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'extended': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'terminated': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const totalRotations = rows.length;
  const ongoingRotations = rows.filter(r => r.status === 'ongoing').length;
  const completedRotations = rows.filter(r => r.status === 'completed').length;
  const avgProgress = Math.round(rows.filter(r => r.status !== 'completed').reduce((sum, r) => sum + r.progress, 0) / rows.filter(r => r.status !== 'completed').length) || 0;

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-teal-600" />
          Job Rotation
        </h1>
        <p className="text-sm text-gray-600 mt-1">Cross-functional job rotations and developmental assignments</p>
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
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Rotations</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{totalRotations}</p>
            </div>
            <RefreshCw className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Ongoing</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{ongoingRotations}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{completedRotations}</p>
            </div>
            <Target className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg shadow-sm border border-teal-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Avg. Progress</p>
              <p className="text-3xl font-bold text-teal-900 mt-1">{avgProgress}%</p>
            </div>
            <Users className="h-10 w-10 text-teal-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Rotation Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Types</option>
              <option value="cross_functional">Cross-Functional</option>
              <option value="lateral">Lateral</option>
              <option value="developmental">Developmental</option>
              <option value="international">International</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="extended">Extended</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredRotations.map((rotation) => (
          <div key={rotation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-6xl">{rotation.photo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{rotation.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getTypeColor(rotation.rotationType)}`}>
                    {rotation.rotationType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${getStatusColor(rotation.status)}`}>
                    {rotation.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{rotation.employeeCode}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900 ml-2">{rotation.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="font-semibold text-gray-900 ml-2">{rotation.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-bold text-teal-600 ml-2">{rotation.progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-600 uppercase">Current Assignment</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{rotation.currentRole}</p>
                <p className="text-sm text-gray-700">{rotation.currentDepartment}</p>
                <p className="text-xs text-gray-600 mt-1">{rotation.currentSupervisor}</p>
              </div>

              <div className="bg-teal-50 rounded-lg border border-teal-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-teal-600" />
                  <p className="text-xs font-semibold text-teal-600 uppercase">Rotation Assignment</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{rotation.rotationRole}</p>
                <p className="text-sm text-gray-700">{rotation.rotationDepartment}</p>
                <p className="text-xs text-gray-600 mt-1">{rotation.rotationSupervisor}</p>
              </div>
            </div>

            {rotation.status !== 'planned' && rotation.status !== 'completed' && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-gray-900">Progress</h4>
                  <span className="text-sm font-bold text-teal-600">{rotation.progress}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div className="bg-teal-500 rounded-full h-3 transition-all" style={{ width: `${rotation.progress}%` }}></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-gray-900">Objectives</h4>
                </div>
                <ul className="space-y-2">
                  {rotation.objectives.map((objective, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-gray-900">Learning Goals</h4>
                </div>
                <ul className="space-y-2">
                  {rotation.learningGoals.map((goal, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {rotation.evaluation.skillsGained.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-bold text-gray-900 mb-3">Skills Gained</h4>
                <div className="flex flex-wrap gap-2">
                  {rotation.evaluation.skillsGained.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(rotation.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(rotation.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                {rotation.evaluation.overallRating && (
                  <div className="text-gray-600">
                    Overall Rating: <span className="font-bold text-green-700">{rotation.evaluation.overallRating}/5.0</span>
                    {rotation.evaluation.feedbackDate && <span className="text-xs ml-2">({new Date(rotation.evaluation.feedbackDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
