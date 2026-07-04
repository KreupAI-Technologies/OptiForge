'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  ArrowRight,
  FileText,
  Server,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { SkillGap, SkillGapPriority, SkillGapStatus, SkillGapCategory, SkillType } from '@/types/skill';
import { MOCK_SKILLS } from '@/services/skill.service';

const getPriorityConfig = (priority: SkillGapPriority) => {
  switch (priority) {
    case SkillGapPriority.CRITICAL:
      return { color: 'red', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: AlertTriangle };
    case SkillGapPriority.HIGH:
      return { color: 'orange', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: AlertCircle };
    case SkillGapPriority.MEDIUM:
      return { color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: Info };
    case SkillGapPriority.LOW:
      return { color: 'green', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle };
    default:
      return { color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: Info };
  }
};

const getSkillIcon = (skillCode?: string) => {
  switch (skillCode) {
    case 'kreupai-solution-architect':
      return FileText;
    case 'backend-engineer':
      return Server;
    case 'quality-assurance-engineer':
      return CheckCircle;
    default:
      return Target;
  }
};

export default function SkillGapAnalysisPage() {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [expandedGap, setExpandedGap] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        const res = await fetch(`${base}/hr/user-skills`, {
          headers: { 'x-company-id': 'test' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to load skill gaps');
        const raw = await res.json();
        const rows: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
        const mapped: SkillGap[] = rows.map((r) => ({
          id: r.id ?? r.skillId ?? '',
          code: r.code ?? '',
          name: r.name ?? r.skillName ?? 'Skill Gap',
          description: r.description ?? '',
          category: r.category ?? SkillGapCategory.ROLE_REQUIREMENT,
          roleName: r.roleName ?? r.role ?? '',
          departmentName: r.departmentName ?? r.department ?? '',
          skillId: r.skillId ?? r.id ?? '',
          skill: MOCK_SKILLS.find((s) => s.code === (r.skillCode ?? r.code)),
          requiredProficiencyLevel: r.requiredProficiencyLevel ?? 0,
          currentAverageProficiency: r.currentAverageProficiency ?? r.proficiencyLevel ?? 0,
          employeesWithSkill: r.employeesWithSkill ?? 0,
          employeesRequired: r.employeesRequired ?? 0,
          gapPercentage: r.gapPercentage ?? 0,
          priority: r.priority ?? SkillGapPriority.MEDIUM,
          impact: r.impact ?? '',
          recommendation: r.recommendation ?? '',
          trainingPlan: r.trainingPlan ?? '',
          targetDate: r.targetDate ? new Date(r.targetDate) : undefined,
          requiredCompetencies: r.requiredCompetencies ?? [],
          status: r.status ?? SkillGapStatus.ACTIVE,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }));
        if (!cancelled) setSkillGaps(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setSkillGaps([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGaps = filterPriority
    ? skillGaps.filter((g) => g.priority === filterPriority)
    : skillGaps;

  const summary = {
    totalGaps: skillGaps.length,
    criticalGaps: skillGaps.filter((g) => g.priority === SkillGapPriority.CRITICAL).length,
    highPriorityGaps: skillGaps.filter((g) => g.priority === SkillGapPriority.HIGH).length,
    averageGapPercentage: skillGaps.length
      ? skillGaps.reduce((sum, g) => sum + g.gapPercentage, 0) / skillGaps.length
      : 0,
    totalEmployeesNeeded: skillGaps.reduce((sum, g) => sum + (g.employeesRequired - g.employeesWithSkill), 0),
  };

  const toggleExpand = (gapId: string) => {
    setExpandedGap(expandedGap === gapId ? null : gapId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-pink-600" />
          Skill Gap Analysis
        </h1>
        <p className="text-gray-600 mt-2">Identify and address organizational skill gaps</p>
      </div>

      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Gaps</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{summary.totalGaps}</p>
            </div>
            <Target className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{summary.criticalGaps}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">High Priority</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{summary.highPriorityGaps}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Avg Gap %</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{summary.averageGapPercentage.toFixed(0)}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Staff Needed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{summary.totalEmployeesNeeded}</p>
            </div>
            <Users className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            {Object.values(SkillGapPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gap Cards */}
      <div className="space-y-2">
        {filteredGaps.map((gap) => {
          const priorityConfig = getPriorityConfig(gap.priority);
          const SkillIcon = getSkillIcon(gap.skill?.code);
          const PriorityIcon = priorityConfig.icon;
          const isExpanded = expandedGap === gap.id;

          return (
            <div
              key={gap.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 ${priorityConfig.border} overflow-hidden`}
            >
              {/* Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(gap.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${gap.skill?.color || '#3B82F6'}20` }}
                    >
                      <SkillIcon
                        className="h-6 w-6"
                        style={{ color: gap.skill?.color || '#3B82F6' }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{gap.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center gap-1 ${priorityConfig.bg} ${priorityConfig.text}`}>
                          <PriorityIcon className="h-3 w-3" />
                          {gap.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{gap.skill?.name} - {gap.roleName}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Gap:</span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${gap.gapPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{gap.gapPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{gap.employeesWithSkill}/{gap.employeesRequired} staff</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Target className="h-4 w-4" />
                          <span>Level {gap.currentAverageProficiency}/{gap.requiredProficiencyLevel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {gap.targetDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(gap.targetDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                    {/* Description & Impact */}
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Description
                        </h4>
                        <p className="text-sm text-gray-600">{gap.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Business Impact
                        </h4>
                        <p className="text-sm text-gray-600">{gap.impact}</p>
                      </div>
                    </div>

                    {/* Recommendations & Training */}
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <ArrowRight className="h-4 w-4 text-green-500" />
                          Recommendations
                        </h4>
                        <p className="text-sm text-gray-600">{gap.recommendation}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-purple-500" />
                          Training Plan
                        </h4>
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{gap.trainingPlan}</pre>
                      </div>
                    </div>
                  </div>

                  {/* Required Competencies */}
                  {gap.requiredCompetencies && gap.requiredCompetencies.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Required Competencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {gap.requiredCompetencies.map((comp, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <button className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors">
                      Create Action Plan
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      Assign Training
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      View Candidates
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredGaps.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No skill gaps found</h3>
            <p className="text-gray-500">
              {filterPriority ? 'Try adjusting your filters' : 'All skill requirements are being met'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
