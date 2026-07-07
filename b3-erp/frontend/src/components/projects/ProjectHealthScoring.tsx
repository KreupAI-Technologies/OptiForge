'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, DollarSign, Users, Target, Gauge } from 'lucide-react'
import { projectManagementService, PmProjectPlan } from '@/services/ProjectManagementService'

export type HealthStatus = 'excellent' | 'good' | 'warning' | 'critical' | 'at-risk';
export type HealthCategory = 'schedule' | 'budget' | 'scope' | 'quality' | 'resources' | 'risks';

export interface HealthMetric {
  category: HealthCategory;
  score: number; // 0-100
  weight: number; // Impact weight
  status: HealthStatus;
  trend: 'up' | 'down' | 'stable';
  issues: string[];
  recommendations: string[];
}

export interface ProjectHealth {
  projectId: string;
  projectName: string;
  overallScore: number;
  overallStatus: HealthStatus;
  lastUpdated: string;
  metrics: HealthMetric[];
  predictedCompletion: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
}

function scoreToStatus(score: number): HealthStatus {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'at-risk';
  return 'critical';
}

// Derive a real ProjectHealth object from a persisted project plan. Scores are
// computed from actual plan fields (progress, budget variance, hours variance,
// milestone completion, risk level) rather than hardcoded demo values.
function planToHealth(p: PmProjectPlan): ProjectHealth {
  const progress = Number(p.progressPercentage ?? 0);
  const estBudget = Number(p.estimatedBudget ?? 0);
  const actBudget = Number(p.actualBudget ?? 0);
  const plannedHours = Number(p.plannedHours ?? 0);
  const actualHours = Number(p.actualHours ?? 0);
  const totalMs = Number(p.milestones ?? 0);
  const doneMs = Number(p.completedMilestones ?? 0);
  const riskLevel = (p.riskLevel as ProjectHealth['riskLevel']) ?? 'low';

  // Schedule health: how well milestone completion keeps pace with progress.
  const msRatio = totalMs > 0 ? (doneMs / totalMs) * 100 : progress;
  const scheduleScore = Math.round(Math.max(0, Math.min(100, msRatio)));

  // Budget health: penalise overspend relative to the share of work done.
  const expectedSpend = estBudget * (progress / 100);
  const budgetScore = estBudget > 0
    ? Math.round(Math.max(0, Math.min(100, 100 - Math.max(0, (actBudget - expectedSpend) / estBudget) * 100)))
    : 80;

  // Scope health: proxied by overall progress momentum.
  const scopeScore = Math.round(Math.max(0, Math.min(100, progress)));

  // Quality health: inverse of hours overrun.
  const expectedHours = plannedHours * (progress / 100);
  const qualityScore = plannedHours > 0
    ? Math.round(Math.max(0, Math.min(100, 100 - Math.max(0, (actualHours - expectedHours) / plannedHours) * 100)))
    : 80;

  // Resources health: derived from team size presence + hours efficiency.
  const resourcesScore = Number(p.teamSize ?? 0) > 0 ? Math.round((qualityScore + 100) / 2) : 60;

  // Risk health: mapped from the plan's declared risk level.
  const riskScoreMap: Record<string, number> = { low: 90, medium: 70, high: 45, critical: 25 };
  const riskScore = riskScoreMap[riskLevel] ?? 70;

  const metricDefs: { category: HealthCategory; score: number; weight: number }[] = [
    { category: 'schedule', score: scheduleScore, weight: 25 },
    { category: 'budget', score: budgetScore, weight: 25 },
    { category: 'scope', score: scopeScore, weight: 15 },
    { category: 'quality', score: qualityScore, weight: 20 },
    { category: 'resources', score: resourcesScore, weight: 10 },
    { category: 'risks', score: riskScore, weight: 5 },
  ];

  const metrics: HealthMetric[] = metricDefs.map((m) => {
    const status = scoreToStatus(m.score);
    const issues: string[] = [];
    const recommendations: string[] = [];
    if (m.category === 'budget' && actBudget > expectedSpend && estBudget > 0) {
      issues.push('Actual spend running ahead of planned spend');
      recommendations.push('Review cost drivers and reforecast budget');
    }
    if (m.category === 'schedule' && msRatio < progress - 10) {
      issues.push('Milestone completion lagging behind reported progress');
      recommendations.push('Reassess milestone plan and critical path');
    }
    if (m.category === 'quality' && actualHours > expectedHours && plannedHours > 0) {
      issues.push('Effort (hours) exceeding plan for work completed');
      recommendations.push('Investigate rework or scope creep');
    }
    if (m.category === 'risks' && (riskLevel === 'high' || riskLevel === 'critical')) {
      issues.push(`Declared risk level is ${riskLevel}`);
      recommendations.push('Assign risk owners and mitigation plans');
    }
    return {
      category: m.category,
      score: m.score,
      weight: m.weight,
      status,
      trend: 'stable',
      issues,
      recommendations,
    };
  });

  const overallScore = Math.round(
    metrics.reduce((sum, m) => sum + m.score * m.weight, 0) /
      metrics.reduce((sum, m) => sum + m.weight, 0),
  );

  return {
    projectId: p.projectCode || p.id,
    projectName: p.projectName ?? 'Untitled Project',
    overallScore,
    overallStatus: scoreToStatus(overallScore),
    lastUpdated: new Date().toISOString(),
    predictedCompletion: p.endDate ? String(p.endDate).slice(0, 10) : '—',
    riskLevel,
    confidence: Math.round(Math.max(50, Math.min(99, 50 + progress / 2))),
    metrics,
  };
}

export default function ProjectHealthScoring() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [projectHealthData, setProjectHealthData] = useState<ProjectHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await projectManagementService.listProjectPlans();
        if (!cancelled) setProjectHealthData((rows ?? []).map(planToHealth));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load project health data');
          setProjectHealthData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const getHealthStatusColor = (status: HealthStatus) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'at-risk':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: HealthCategory) => {
    switch (category) {
      case 'schedule':
        return <Clock className="h-5 w-5" />;
      case 'budget':
        return <DollarSign className="h-5 w-5" />;
      case 'scope':
        return <Target className="h-5 w-5" />;
      case 'quality':
        return <CheckCircle className="h-5 w-5" />;
      case 'resources':
        return <Users className="h-5 w-5" />;
      case 'risks':
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const filteredProjects = selectedProject === 'all'
    ? projectHealthData
    : projectHealthData.filter(p => p.projectId === selectedProject);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white shadow-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Gauge className="h-8 w-8 text-blue-600" />
              Real-Time Project Health Scoring
            </h2>
            <p className="text-gray-600 mt-1">AI-powered health monitoring with predictive analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Loading project health data...</div>
      )}
      {loadError && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>
      )}
      {!isLoading && !loadError && projectHealthData.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-4 text-sm text-gray-600 text-center">No project plans available to score yet.</div>
      )}

      {/* Project Filter */}
      <div className="bg-white shadow-md p-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by Project:</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Projects</option>
            {projectHealthData.map((project) => (
              <option key={project.projectId} value={project.projectId}>
                {project.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Health Cards */}
      <div className="space-y-3">
        {filteredProjects.map((project) => (
          <div key={project.projectId} className="bg-white shadow-lg border border-gray-200">
            {/* Project Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{project.projectName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{project.projectId}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <span className={`text-4xl font-bold ${getScoreColor(project.overallScore)}`}>
                      {project.overallScore}
                    </span>
                    <span className="text-gray-500">/100</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getHealthStatusColor(project.overallStatus)}`}>
                    {project.overallStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Overall Health Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getScoreBarColor(project.overallScore)}`}
                    style={{ width: `${project.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Risk Level</p>
                  <p className={`text-sm font-bold mt-1 ${
                    project.riskLevel === 'critical' ? 'text-red-600' :
                    project.riskLevel === 'high' ? 'text-orange-600' :
                    project.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {project.riskLevel.toUpperCase()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Confidence</p>
                  <p className="text-sm font-bold text-blue-600 mt-1">{project.confidence}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Predicted Completion</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{project.predictedCompletion}</p>
                </div>
              </div>
            </div>

            {/* Health Metrics Grid */}
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Health Metrics Breakdown</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {project.metrics.map((metric) => (
                  <div key={metric.category} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getHealthStatusColor(metric.status)}`}>
                          {getCategoryIcon(metric.category)}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 capitalize">{metric.category}</h5>
                          <p className="text-xs text-gray-600">Weight: {metric.weight}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-xl font-bold ${getScoreColor(metric.score)}`}>
                          {metric.score}
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(metric.score)}`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>

                    {/* Issues */}
                    {metric.issues.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-red-600 mb-1">Issues:</p>
                        <ul className="space-y-1">
                          {metric.issues.map((issue, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                              <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {metric.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-blue-600 mb-1">Recommendations:</p>
                        <ul className="space-y-1">
                          {metric.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
