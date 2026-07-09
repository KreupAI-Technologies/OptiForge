'use client';

import React, { useState, useEffect } from 'react';
import {
  Target, Star, MessageSquare, BarChart3, TrendingUp, AlertTriangle,
  Plus, Search, Filter, ChevronRight, CheckCircle, Clock, XCircle,
  Award, Users, Calendar, ThumbsUp, ArrowRight, Eye, Edit,
  FileText, Send, Bookmark, Activity, PieChart, Zap
} from 'lucide-react';
import {
  PerformanceManagementService,
  GoalStatus,
  GoalType,
  GoalCategory,
  GoalPriority,
  ReviewStatus,
  FeedbackType,
  PIPStatus,
  type Goal,
  type PerformanceReviewCycle,
  type PerformanceReview,
  type ContinuousFeedback,
  type Recognition,
  type KPIMaster,
  type KPIAssignment,
  type PerformanceImprovementPlan,
  type PerformanceDashboard,
} from '@/services/performance-management.service';

// ============================================================================
// Types
// ============================================================================

type MainTab = 'goals' | 'reviews' | 'feedback' | 'kpis' | 'pip' | 'reports';
type GoalsSubTab = 'set_goals' | 'my_goals' | 'team_goals' | 'department_goals' | 'alignment' | 'tracking';
type ReviewsSubTab = 'cycles' | 'self_appraisal' | 'manager_review' | 'peer_review' | 'final_rating' | 'meetings';
type FeedbackSubTab = 'give_feedback' | 'received' | 'requests' | 'recognition';
type KPIsSubTab = 'master' | 'assignment' | 'tracking' | 'dashboard';
type PIPSubTab = 'create' | 'tracking' | 'review';
type ReportsSubTab = 'analytics' | 'distribution' | 'department' | 'trends';

// ============================================================================
// Dashboard Component
// ============================================================================

function PerformanceDashboardView({ dashboard }: { dashboard: PerformanceDashboard | null }) {
  if (!dashboard) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{dashboard.goalsOverview.totalGoals}</span>
          </div>
          <p className="text-sm text-gray-400">Total Goals</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-green-400">{dashboard.goalsOverview.completedGoals} completed</span>
            <span className="text-yellow-400">{dashboard.goalsOverview.inProgressGoals} in progress</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{dashboard.reviewsOverview.averageRating.toFixed(1)}</span>
          </div>
          <p className="text-sm text-gray-400">Avg. Rating</p>
          <div className="mt-2 text-xs text-gray-500">
            {dashboard.reviewsOverview.completedReviews}/{dashboard.reviewsOverview.totalReviews} reviews completed
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{dashboard.feedbackStats.receivedCount}</span>
          </div>
          <p className="text-sm text-gray-400">Feedback Received</p>
          <div className="mt-2 text-xs text-gray-500">
            {dashboard.feedbackStats.pendingRequests} pending requests
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{dashboard.kpiStats.onTrack}</span>
          </div>
          <p className="text-sm text-gray-400">KPIs On Track</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="text-yellow-400">{dashboard.kpiStats.atRisk} at risk</span>
            <span className="text-red-400">{dashboard.kpiStats.offTrack} off track</span>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Goals Progress</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Average Progress</span>
              <span className="text-white">{Math.round(dashboard.goalsOverview.averageProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${dashboard.goalsOverview.averageProgress}%` }}
              />
            </div>
          </div>
          {dashboard.goalsOverview.overdueGoals > 0 && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{dashboard.goalsOverview.overdueGoals} overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {dashboard.recentActivity.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboard.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-700 last:border-0">
                <Activity className="h-4 w-4 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.title}</p>
                  {activity.description && (
                    <p className="text-gray-400 text-xs">{activity.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Goals Component
// ============================================================================

function GoalsSection({ goals, subTab }: { goals: Goal[]; subTab: GoalsSubTab }) {
  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED: return 'bg-green-900 text-green-300';
      case GoalStatus.IN_PROGRESS: return 'bg-blue-900 text-blue-300';
      case GoalStatus.ACTIVE: return 'bg-blue-900 text-blue-300';
      case GoalStatus.PENDING_APPROVAL: return 'bg-yellow-900 text-yellow-300';
      case GoalStatus.DRAFT: return 'bg-gray-700 text-gray-300';
      case GoalStatus.CANCELLED: return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.CRITICAL: return 'text-red-500';
      case GoalPriority.HIGH: return 'text-red-400';
      case GoalPriority.MEDIUM: return 'text-yellow-400';
      case GoalPriority.LOW: return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const filteredGoals = goals.filter(g => {
    switch (subTab) {
      case 'my_goals': return g.goalType === GoalType.INDIVIDUAL;
      case 'team_goals': return g.goalType === GoalType.TEAM;
      case 'department_goals': return g.goalType === GoalType.DEPARTMENT;
      default: return true;
    }
  });

  if (subTab === 'set_goals') {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goal Title</label>
              <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Enter goal title" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goal Type</label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                <option value="individual">Individual</option>
                <option value="team">Team</option>
                <option value="department">Department</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                <option value="performance">Performance</option>
                <option value="development">Development</option>
                <option value="project">Project</option>
                <option value="behavior">Behavior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input type="date" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input type="date" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-24" placeholder="Describe your goal" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save as Draft</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit for Approval</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">{subTab.replace('_', ' ')}</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Goal
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-500">
            No goals found
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div key={goal.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium">{goal.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{goal.description}</p>
                </div>
                <span className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="text-gray-400">Due Date</p>
                  <p className="text-white">{goal.dueDate}</p>
                </div>
              </div>

              {goal.keyResults && goal.keyResults.length > 0 && (
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <p className="text-xs text-gray-400 mb-2">Key Results</p>
                  <div className="space-y-2">
                    {goal.keyResults.map((kr) => (
                      <div key={kr.id} className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">{kr.title}</p>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${kr.progress}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{kr.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
                <button className="text-green-400 hover:text-green-300 text-sm">Update Progress</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Reviews Component
// ============================================================================

function ReviewsSection({ cycles, reviews, subTab }: { cycles: PerformanceReviewCycle[]; reviews: PerformanceReview[]; subTab: ReviewsSubTab }) {
  const getReviewStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.COMPLETED: return 'bg-green-900 text-green-300';
      case ReviewStatus.ACKNOWLEDGED: return 'bg-green-900 text-green-300';
      case ReviewStatus.SELF_APPRAISAL_SUBMITTED: return 'bg-blue-900 text-blue-300';
      case ReviewStatus.MANAGER_REVIEW_SUBMITTED: return 'bg-blue-900 text-blue-300';
      case ReviewStatus.SELF_APPRAISAL_PENDING: return 'bg-yellow-900 text-yellow-300';
      case ReviewStatus.MANAGER_REVIEW_PENDING: return 'bg-yellow-900 text-yellow-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'cycles') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Review Cycles</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Create Cycle
          </button>
        </div>

        <div className="space-y-3">
          {cycles.map((cycle) => (
            <div key={cycle.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{cycle.cycleName}</h4>
                  <p className="text-sm text-gray-400">{cycle.cycleCode}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  cycle.status === 'active' || cycle.status === 'in_progress'
                    ? 'bg-green-900 text-green-300'
                    : cycle.status === 'completed'
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {cycle.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Start Date</p>
                  <p className="text-sm text-white">{cycle.startDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">End Date</p>
                  <p className="text-sm text-white">{cycle.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Goals Weight</p>
                  <p className="text-sm text-white">{cycle.goalsWeightage}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Competencies Weight</p>
                  <p className="text-sm text-white">{cycle.competenciesWeightage}%</p>
                </div>
              </div>

              {cycle.totalReviews && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{cycle.completedReviews}/{cycle.totalReviews} completed</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${((cycle.completedReviews || 0) / cycle.totalReviews) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">{subTab.replace('_', ' ')}</h3>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Self Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Manager Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Final Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white font-medium">{review.employeeName}</p>
                    <p className="text-xs text-gray-500">{review.employeeCode}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{review.department}</td>
                <td className="px-4 py-3">
                  {review.selfRating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white">{review.selfRating}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {review.managerRating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white">{review.managerRating}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {review.finalRating ? (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-green-400 fill-green-400" />
                      <span className="text-white font-medium">{review.finalRating}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getReviewStatusColor(review.status)}`}>
                    {review.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Feedback Component
// ============================================================================

function FeedbackSection({ feedback, recognitions, subTab }: { feedback: ContinuousFeedback[]; recognitions: Recognition[]; subTab: FeedbackSubTab }) {
  const getFeedbackTypeColor = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.PRAISE: return 'bg-green-900 text-green-300';
      case FeedbackType.RECOGNITION: return 'bg-purple-900 text-purple-300';
      case FeedbackType.CONSTRUCTIVE: return 'bg-yellow-900 text-yellow-300';
      case FeedbackType.SUGGESTION: return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'give_feedback') {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Give Feedback</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">To Employee</label>
              <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Search employee..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Feedback Type</label>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-900 text-green-300 rounded-lg text-sm">Praise</button>
                <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm">Constructive</button>
                <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm">Suggestion</button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Subject</label>
              <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Subject of feedback" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Feedback</label>
              <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-32" placeholder="Write your feedback..." />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" className="rounded" />
                Send anonymously
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" className="rounded" />
                Share with manager
              </label>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Send className="h-4 w-4" />
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (subTab === 'recognition') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recognition & Praise</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Award className="h-4 w-4" />
            Give Recognition
          </button>
        </div>

        <div className="space-y-3">
          {recognitions.map((recognition) => (
            <div key={recognition.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-900 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-purple-300" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{recognition.fromEmployeeName}</span>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                    <span className="text-white font-medium">{recognition.toEmployeeName}</span>
                  </div>
                  <h4 className="text-blue-400 font-medium mb-1">{recognition.title}</h4>
                  <p className="text-gray-300 text-sm">{recognition.message}</p>
                  {recognition.badges && recognition.badges.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {recognition.badges.map((badge, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs">
                          {badge.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm">
                      <ThumbsUp className="h-4 w-4" />
                      {recognition.likes || 0}
                    </button>
                    <span className="text-xs text-gray-500">
                      {new Date(recognition.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white capitalize">{subTab.replace('_', ' ')}</h3>
      </div>

      <div className="space-y-3">
        {feedback.map((fb) => (
          <div key={fb.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${getFeedbackTypeColor(fb.feedbackType)}`}>
                  {fb.feedbackType}
                </span>
                <span className="text-sm text-gray-400">
                  {subTab === 'received' ? `From: ${fb.fromEmployeeName}` : `To: ${fb.toEmployeeName}`}
                </span>
              </div>
              <span className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
            </div>
            <h4 className="text-white font-medium mb-1">{fb.subject}</h4>
            <p className="text-gray-300 text-sm">{fb.content}</p>
            {fb.tags && fb.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {fb.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// KPIs Component
// ============================================================================

function KPIsSection({ kpis, assignments, subTab }: { kpis: KPIMaster[]; assignments: KPIAssignment[]; subTab: KPIsSubTab }) {
  if (subTab === 'master') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">KPI Master</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Create KPI
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">KPI Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Measurement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {kpis.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <span className="text-blue-400 font-mono text-sm">{kpi.kpiCode}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white">{kpi.kpiName}</p>
                      {kpi.description && <p className="text-xs text-gray-500">{kpi.description}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{kpi.category}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{kpi.kpiType}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{kpi.measurementUnit}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{kpi.frequency}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${kpi.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
                      {kpi.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (subTab === 'dashboard' || subTab === 'tracking') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">KPI {subTab === 'dashboard' ? 'Dashboard' : 'Tracking'}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{assignment.kpi?.kpiName}</h4>
                  <p className="text-sm text-gray-400">{assignment.employeeName || assignment.departmentName}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  assignment.status === 'on_track' ? 'bg-green-900 text-green-300' :
                  assignment.status === 'at_risk' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {assignment.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Target</p>
                  <p className="text-lg text-white font-semibold">{assignment.targetValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current</p>
                  <p className="text-lg text-white font-semibold">{assignment.currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Achievement</p>
                  <p className={`text-lg font-semibold ${
                    assignment.achievement >= 100 ? 'text-green-400' :
                    assignment.achievement >= 80 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{assignment.achievement.toFixed(1)}%</p>
                </div>
              </div>

              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    assignment.achievement >= 100 ? 'bg-green-500' :
                    assignment.achievement >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(assignment.achievement, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Period: {assignment.periodStart} - {assignment.periodEnd}</span>
                {assignment.lastUpdated && <span>Updated: {assignment.lastUpdated}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-400 text-center py-8">KPI {subTab} section</div>
  );
}

// ============================================================================
// PIP Component
// ============================================================================

function PIPSection({ pips, subTab }: { pips: PerformanceImprovementPlan[]; subTab: PIPSubTab }) {
  const getPIPStatusColor = (status: PIPStatus) => {
    switch (status) {
      case PIPStatus.ACTIVE: return 'bg-yellow-900 text-yellow-300';
      case PIPStatus.COMPLETED_SUCCESS: return 'bg-green-900 text-green-300';
      case PIPStatus.COMPLETED_FAILURE: return 'bg-red-900 text-red-300';
      case PIPStatus.EXTENDED: return 'bg-orange-900 text-orange-300';
      case PIPStatus.DRAFT: return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'create') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Create Performance Improvement Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Employee</label>
            <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Search employee..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">HR Partner</label>
            <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Select HR partner..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Reason for PIP</label>
            <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-20" placeholder="Describe the performance concerns..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input type="date" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Date</label>
            <input type="date" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Areas of Improvement</label>
            <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-20" placeholder="List the areas needing improvement..." />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Draft</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Initiate PIP</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">PIP {subTab === 'tracking' ? 'Tracking' : 'Review'}</h3>
      </div>

      <div className="space-y-4">
        {pips.map((pip) => (
          <div key={pip.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium">{pip.employeeName}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs ${getPIPStatusColor(pip.status)}`}>
                    {pip.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{pip.pipCode} | {pip.department}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Manager</p>
                <p className="text-sm text-white">{pip.managerName}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-sm text-gray-300">{pip.reason}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Start Date</p>
                <p className="text-white">{pip.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">End Date</p>
                <p className="text-white">{pip.currentEndDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Extensions</p>
                <p className="text-white">{pip.extensionCount}</p>
              </div>
            </div>

            {pip.objectives.length > 0 && (
              <div className="border-t border-gray-700 pt-3">
                <p className="text-xs text-gray-400 mb-2">Objectives Progress</p>
                <div className="space-y-2">
                  {pip.objectives.map((obj) => (
                    <div key={obj.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{obj.objective}</p>
                      </div>
                      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            obj.progress >= 80 ? 'bg-green-500' :
                            obj.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${obj.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-10">{obj.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
              <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
              <button className="text-green-400 hover:text-green-300 text-sm">Add Review</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Performance Reports (real aggregate over /hr/performance-reviews)
// ============================================================================

function PerformanceReportsSection({
  reviews,
  subTab,
}: {
  reviews: PerformanceReview[];
  subTab: ReportsSubTab;
}) {
  const rated = reviews.filter((r) => r.finalRating != null);
  const total = reviews.length;
  const avgRating = rated.length
    ? rated.reduce((s, r) => s + Number(r.finalRating || 0), 0) / rated.length
    : 0;

  // Rating distribution (rounded to nearest whole 1-5)
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rated.forEach((r) => {
    const bucket = Math.min(5, Math.max(1, Math.round(Number(r.finalRating))));
    distribution[bucket] += 1;
  });

  // By department
  const byDept: Record<string, { count: number; sum: number; rated: number }> = {};
  reviews.forEach((r) => {
    const d = r.department || 'Unassigned';
    byDept[d] = byDept[d] || { count: 0, sum: 0, rated: 0 };
    byDept[d].count += 1;
    if (r.finalRating != null) {
      byDept[d].sum += Number(r.finalRating);
      byDept[d].rated += 1;
    }
  });

  // By status (trend proxy)
  const byStatus: Record<string, number> = {};
  reviews.forEach((r) => {
    const s = String(r.status || 'unknown');
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  if (total === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-center py-8 text-gray-400">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No performance review data yet</p>
          <p className="text-sm mt-2">Reports aggregate over performance review records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-sm text-gray-400">Total Reviews</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{rated.length}</p>
          <p className="text-sm text-gray-400">Finalised</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{avgRating.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Avg. Final Rating</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-2xl font-bold text-white">{Object.keys(byDept).length}</p>
          <p className="text-sm text-gray-400">Departments</p>
        </div>
      </div>

      {(subTab === 'analytics' || subTab === 'distribution') && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Rating Distribution</p>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = distribution[star];
              const pct = rated.length ? (count / rated.length) * 100 : 0;
              return (
                <div key={star}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 flex items-center gap-1">
                      {star} <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    </span>
                    <span className="text-white">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(subTab === 'analytics' || subTab === 'department') && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reviews</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Avg. Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Object.entries(byDept).map(([dept, v]) => (
                <tr key={dept} className="hover:bg-gray-750">
                  <td className="px-4 py-3 text-white">{dept}</td>
                  <td className="px-4 py-3 text-gray-300">{v.count}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {v.rated ? (v.sum / v.rated).toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'trends' && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Reviews by Status</p>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 capitalize">{status.replace(/_/g, ' ')}</span>
                  <span className="text-white">{count}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function PerformanceManagementPage() {
  const [mainTab, setMainTab] = useState<MainTab>('goals');
  const [goalsSubTab, setGoalsSubTab] = useState<GoalsSubTab>('my_goals');
  const [reviewsSubTab, setReviewsSubTab] = useState<ReviewsSubTab>('cycles');
  const [feedbackSubTab, setFeedbackSubTab] = useState<FeedbackSubTab>('received');
  const [kpisSubTab, setKpisSubTab] = useState<KPIsSubTab>('dashboard');
  const [pipSubTab, setPipSubTab] = useState<PIPSubTab>('tracking');
  const [reportsSubTab, setReportsSubTab] = useState<ReportsSubTab>('analytics');

  const [dashboard, setDashboard] = useState<PerformanceDashboard | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reviewCycles, setReviewCycles] = useState<PerformanceReviewCycle[]>([]);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [feedback, setFeedback] = useState<ContinuousFeedback[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [kpis, setKpis] = useState<KPIMaster[]>([]);
  const [kpiAssignments, setKpiAssignments] = useState<KPIAssignment[]>([]);
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);

  useEffect(() => {
    loadDashboard();
    loadGoals();
    loadReviewCycles();
    loadReviews();
    loadFeedback();
    loadRecognitions();
    loadKPIs();
    loadKPIAssignments();
    loadPIPs();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await PerformanceManagementService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const result = await PerformanceManagementService.getGoals();
      setGoals(result.data);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadReviewCycles = async () => {
    try {
      const data = await PerformanceManagementService.getReviewCycles();
      setReviewCycles(data);
    } catch (error) {
      console.error('Error loading review cycles:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const result = await PerformanceManagementService.getPerformanceReviews();
      setReviews(result.data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const loadFeedback = async () => {
    try {
      const result = await PerformanceManagementService.getFeedback();
      setFeedback(result.data);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  const loadRecognitions = async () => {
    try {
      const result = await PerformanceManagementService.getRecognitions();
      setRecognitions(result.data);
    } catch (error) {
      console.error('Error loading recognitions:', error);
    }
  };

  const loadKPIs = async () => {
    try {
      const data = await PerformanceManagementService.getKPIMasters();
      setKpis(data);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  const loadKPIAssignments = async () => {
    try {
      const result = await PerformanceManagementService.getKPIAssignments();
      setKpiAssignments(result.data);
    } catch (error) {
      console.error('Error loading KPI assignments:', error);
    }
  };

  const loadPIPs = async () => {
    try {
      const result = await PerformanceManagementService.getPIPs();
      setPips(result.data);
    } catch (error) {
      console.error('Error loading PIPs:', error);
    }
  };

  const mainTabs = [
    { id: 'goals' as MainTab, label: 'Goal Setting & OKRs', icon: Target },
    { id: 'reviews' as MainTab, label: 'Performance Reviews', icon: Star },
    { id: 'feedback' as MainTab, label: 'Continuous Feedback', icon: MessageSquare },
    { id: 'kpis' as MainTab, label: 'KPI Management', icon: BarChart3 },
    { id: 'pip' as MainTab, label: 'Performance Improvement', icon: TrendingUp },
    { id: 'reports' as MainTab, label: 'Performance Reports', icon: PieChart },
  ];

  const goalsSubTabs = [
    { id: 'set_goals' as GoalsSubTab, label: 'Set Goals', icon: Plus },
    { id: 'my_goals' as GoalsSubTab, label: 'My Goals', icon: Target },
    { id: 'team_goals' as GoalsSubTab, label: 'Team Goals', icon: Users },
    { id: 'department_goals' as GoalsSubTab, label: 'Department Goals', icon: Users },
    { id: 'alignment' as GoalsSubTab, label: 'Goal Alignment', icon: Zap },
    { id: 'tracking' as GoalsSubTab, label: 'Goal Tracking', icon: Activity },
  ];

  const reviewsSubTabs = [
    { id: 'cycles' as ReviewsSubTab, label: 'Review Cycles', icon: Calendar },
    { id: 'self_appraisal' as ReviewsSubTab, label: 'Self Appraisal', icon: Edit },
    { id: 'manager_review' as ReviewsSubTab, label: 'Manager Review', icon: Eye },
    { id: 'peer_review' as ReviewsSubTab, label: 'Peer Review', icon: Users },
    { id: 'final_rating' as ReviewsSubTab, label: 'Final Rating', icon: Star },
    { id: 'meetings' as ReviewsSubTab, label: 'Review Meetings', icon: Calendar },
  ];

  const feedbackSubTabs = [
    { id: 'give_feedback' as FeedbackSubTab, label: 'Give Feedback', icon: Send },
    { id: 'received' as FeedbackSubTab, label: 'Received Feedback', icon: MessageSquare },
    { id: 'requests' as FeedbackSubTab, label: 'Feedback Requests', icon: FileText },
    { id: 'recognition' as FeedbackSubTab, label: 'Recognition & Praise', icon: Award },
  ];

  const kpisSubTabs = [
    { id: 'master' as KPIsSubTab, label: 'KPI Master', icon: FileText },
    { id: 'assignment' as KPIsSubTab, label: 'KPI Assignment', icon: Users },
    { id: 'tracking' as KPIsSubTab, label: 'KPI Tracking', icon: Activity },
    { id: 'dashboard' as KPIsSubTab, label: 'KPI Dashboard', icon: BarChart3 },
  ];

  const pipSubTabs = [
    { id: 'create' as PIPSubTab, label: 'Create PIP', icon: Plus },
    { id: 'tracking' as PIPSubTab, label: 'PIP Tracking', icon: Activity },
    { id: 'review' as PIPSubTab, label: 'PIP Review', icon: Eye },
  ];

  const reportsSubTabs = [
    { id: 'analytics' as ReportsSubTab, label: 'Performance Analytics', icon: BarChart3 },
    { id: 'distribution' as ReportsSubTab, label: 'Rating Distribution', icon: PieChart },
    { id: 'department' as ReportsSubTab, label: 'Department Performance', icon: Users },
    { id: 'trends' as ReportsSubTab, label: 'Trend Analysis', icon: TrendingUp },
  ];

  const getCurrentSubTabs = () => {
    switch (mainTab) {
      case 'goals': return goalsSubTabs;
      case 'reviews': return reviewsSubTabs;
      case 'feedback': return feedbackSubTabs;
      case 'kpis': return kpisSubTabs;
      case 'pip': return pipSubTabs;
      case 'reports': return reportsSubTabs;
      default: return [];
    }
  };

  const getCurrentSubTab = () => {
    switch (mainTab) {
      case 'goals': return goalsSubTab;
      case 'reviews': return reviewsSubTab;
      case 'feedback': return feedbackSubTab;
      case 'kpis': return kpisSubTab;
      case 'pip': return pipSubTab;
      case 'reports': return reportsSubTab;
      default: return '';
    }
  };

  const setCurrentSubTab = (tab: string) => {
    switch (mainTab) {
      case 'goals': setGoalsSubTab(tab as GoalsSubTab); break;
      case 'reviews': setReviewsSubTab(tab as ReviewsSubTab); break;
      case 'feedback': setFeedbackSubTab(tab as FeedbackSubTab); break;
      case 'kpis': setKpisSubTab(tab as KPIsSubTab); break;
      case 'pip': setPipSubTab(tab as PIPSubTab); break;
      case 'reports': setReportsSubTab(tab as ReportsSubTab); break;
    }
  };

  const renderContent = () => {
    switch (mainTab) {
      case 'goals':
        return <GoalsSection goals={goals} subTab={goalsSubTab} />;
      case 'reviews':
        return <ReviewsSection cycles={reviewCycles} reviews={reviews} subTab={reviewsSubTab} />;
      case 'feedback':
        return <FeedbackSection feedback={feedback} recognitions={recognitions} subTab={feedbackSubTab} />;
      case 'kpis':
        return <KPIsSection kpis={kpis} assignments={kpiAssignments} subTab={kpisSubTab} />;
      case 'pip':
        return <PIPSection pips={pips} subTab={pipSubTab} />;
      case 'reports':
        return <PerformanceReportsSection reviews={reviews} subTab={reportsSubTab} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Performance Management</h1>
            <p className="text-gray-400">Manage goals, reviews, feedback, and performance tracking</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <PerformanceDashboardView dashboard={dashboard} />

        {/* Main Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex gap-1 overflow-x-auto">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  mainTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap gap-2">
          {getCurrentSubTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                getCurrentSubTab() === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
