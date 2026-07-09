'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap, BookOpen, Award, Users, Calendar, BarChart3,
  Plus, Search, Filter, Clock, CheckCircle, XCircle, Play,
  FileText, DollarSign, TrendingUp, Briefcase, Star, Video,
  ClipboardList, UserCheck, Building2, Target, Zap, BookMarked
} from 'lucide-react';
import {
  TrainingDevelopmentService,
  TrainingProgramStatus,
  TrainingType,
  TrainingCategory,
  EnrollmentStatus,
  CertificationStatus,
  BudgetStatus,
  CourseProgressStatus,
  type TrainingProgram,
  type TrainingSchedule,
  type TrainingEnrollment,
  type ELearningCourse,
  type CourseProgress,
  type CertificationTracking,
  type TrainingBudget,
  type TrainingDashboard,
  type SkillMatrix,
} from '@/services/training-development.service';
import { HrPagesService } from '@/services/hr-pages.service';

// ============================================================================
// Backend-derived aggregate types (NestJS HR domain backend)
// ============================================================================

interface SkillMatrixRow {
  employee: string;
  skills: Record<string, number>;
}

interface SkillGapRow {
  id: string;
  code?: string;
  name: string;
  priority?: string;
  requiredProficiencyLevel?: number;
  currentAverageProficiency?: number;
  gapPercentage?: number;
  recommendation?: string;
  skill?: { name?: string };
}

interface TrainingEnrollmentRow {
  id: string;
  employeeName?: string;
  programTitle?: string;
  category?: string;
  progress?: number;
  attendance?: number;
  certification?: boolean;
  status?: string;
  duration?: number;
}

interface TrainingProgramRow {
  id: string;
  title?: string;
  category?: string;
  cost?: number;
  enrolled?: number;
  capacity?: number;
  duration?: number;
  status?: string;
}

// ============================================================================
// Types
// ============================================================================

type MainTab = 'programs' | 'enrollment' | 'skills' | 'effectiveness' | 'elearning' | 'budget' | 'reports';
type ProgramsSubTab = 'catalog' | 'create' | 'schedule' | 'external';
type EnrollmentSubTab = 'enroll' | 'my_trainings' | 'attendance' | 'waitlist';
type SkillsSubTab = 'matrix' | 'assessment' | 'gap_analysis' | 'certifications';
type EffectivenessSubTab = 'feedback' | 'assessments' | 'impact';
type ELearningSubTab = 'library' | 'my_courses' | 'progress' | 'certifications';
type BudgetSubTab = 'allocation' | 'tracking' | 'costs';
type ReportsSubTab = 'summary' | 'employee' | 'department' | 'hours';

// ============================================================================
// Dashboard Component
// ============================================================================

function TrainingDashboardView({ dashboard }: { dashboard: TrainingDashboard | null }) {
  if (!dashboard) return <div className="text-center py-8 text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{dashboard.overview.totalPrograms}</span>
          </div>
          <p className="text-sm text-gray-400">Total Programs</p>
          <p className="text-xs text-green-400 mt-1">{dashboard.overview.activePrograms} active</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-yellow-400" />
            <span className="text-2xl font-bold text-white">{dashboard.overview.upcomingTrainings}</span>
          </div>
          <p className="text-sm text-gray-400">Upcoming Trainings</p>
          <p className="text-xs text-gray-500 mt-1">{dashboard.overview.completedTrainings} completed</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{dashboard.enrollments.totalEnrollments}</span>
          </div>
          <p className="text-sm text-gray-400">Total Enrollments</p>
          <p className="text-xs text-yellow-400 mt-1">{dashboard.enrollments.pendingApproval} pending</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-purple-400" />
            <span className="text-2xl font-bold text-white">{dashboard.budget.utilizationPercentage.toFixed(0)}%</span>
          </div>
          <p className="text-sm text-gray-400">Budget Utilized</p>
          <p className="text-xs text-gray-500 mt-1">₹{(dashboard.budget.availableBudget / 100000).toFixed(1)}L available</p>
        </div>
      </div>

      {/* E-Learning Stats */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">E-Learning Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{dashboard.eLearning.totalCourses}</p>
            <p className="text-sm text-gray-400">Total Courses</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dashboard.eLearning.activeEnrollments}</p>
            <p className="text-sm text-gray-400">Active Enrollments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dashboard.eLearning.completedCourses}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{dashboard.eLearning.averageCompletion}%</p>
            <p className="text-sm text-gray-400">Avg. Completion</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboard.recentActivities.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {dashboard.recentActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 py-2 border-b border-gray-700 last:border-0">
                  <GraduationCap className="h-4 w-4 text-gray-400 mt-1" />
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

        {dashboard.upcomingSchedules.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Trainings</h3>
            <div className="space-y-3">
              {dashboard.upcomingSchedules.slice(0, 5).map((schedule) => (
                <div key={schedule.id} className="flex items-start justify-between py-2 border-b border-gray-700 last:border-0">
                  <div>
                    <p className="text-white font-medium">{schedule.batchName}</p>
                    <p className="text-sm text-gray-400">{schedule.program?.programName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{schedule.startDate}</p>
                    <p className="text-xs text-gray-500">{schedule.availableSeats} seats available</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Programs Component
// ============================================================================

function ProgramsSection({ programs, schedules, subTab }: { programs: TrainingProgram[]; schedules: TrainingSchedule[]; subTab: ProgramsSubTab }) {
  const getStatusColor = (status: TrainingProgramStatus) => {
    switch (status) {
      case TrainingProgramStatus.ACTIVE: return 'bg-green-900 text-green-300';
      case TrainingProgramStatus.SCHEDULED: return 'bg-blue-900 text-blue-300';
      case TrainingProgramStatus.IN_PROGRESS: return 'bg-yellow-900 text-yellow-300';
      case TrainingProgramStatus.COMPLETED: return 'bg-gray-700 text-gray-300';
      case TrainingProgramStatus.DRAFT: return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getCategoryColor = (category: TrainingCategory) => {
    switch (category) {
      case TrainingCategory.TECHNICAL: return 'bg-blue-900 text-blue-300';
      case TrainingCategory.LEADERSHIP: return 'bg-purple-900 text-purple-300';
      case TrainingCategory.SOFT_SKILLS: return 'bg-pink-900 text-pink-300';
      case TrainingCategory.COMPLIANCE: return 'bg-red-900 text-red-300';
      case TrainingCategory.SAFETY: return 'bg-orange-900 text-orange-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'create') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Create Training Program</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Program Name</label>
            <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Enter program name" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
              <option value="technical">Technical</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="leadership">Leadership</option>
              <option value="compliance">Compliance</option>
              <option value="safety">Safety</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Training Type</label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
              <option value="classroom">Classroom</option>
              <option value="virtual">Virtual</option>
              <option value="e_learning">E-Learning</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Duration (Hours)</label>
            <input type="number" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="8" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Max Participants</label>
            <input type="number" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="20" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Instructor</label>
            <input type="text" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600" placeholder="Instructor name" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-24" placeholder="Program description..." />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Objectives</label>
            <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-20" placeholder="Learning objectives (one per line)" />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="rounded" />
              Certification Provided
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="rounded" />
              Mandatory
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save as Draft</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Publish</button>
        </div>
      </div>
    );
  }

  if (subTab === 'schedule') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Training Schedule</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Create Schedule
          </button>
        </div>

        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-medium">{schedule.batchName}</h4>
                  <p className="text-sm text-gray-400">{schedule.program?.programName}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  schedule.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                  schedule.status === 'in_progress' ? 'bg-yellow-900 text-yellow-300' :
                  schedule.status === 'completed' ? 'bg-green-900 text-green-300' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {schedule.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Dates</p>
                  <p className="text-white">{schedule.startDate} - {schedule.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-white">{schedule.startTime} - {schedule.endTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-white">{schedule.location || schedule.meetingLink ? 'Virtual' : 'TBD'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Instructor</p>
                  <p className="text-white">{schedule.instructorName || 'TBD'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-400">
                    <Users className="h-4 w-4 inline mr-1" />
                    {schedule.enrolledCount}/{schedule.maxParticipants} enrolled
                  </span>
                  {schedule.waitlistCount > 0 && (
                    <span className="text-yellow-400">
                      {schedule.waitlistCount} on waitlist
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                  <button className="text-green-400 hover:text-green-300 text-sm">Manage</button>
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
        <h3 className="text-lg font-semibold text-white">Program Catalog</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Program
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <div key={program.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(program.category)}`}>
                  {program.category}
                </span>
                {program.isMandatory && (
                  <span className="ml-2 px-2 py-0.5 rounded text-xs bg-red-900 text-red-300">
                    Mandatory
                  </span>
                )}
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(program.status)}`}>
                {program.status}
              </span>
            </div>

            <h4 className="text-white font-medium mb-1">{program.programName}</h4>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">{program.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {program.durationHours}h
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Max {program.maxParticipants}
              </span>
              {program.certificationProvided && (
                <span className="flex items-center gap-1 text-green-400">
                  <Award className="h-3 w-3" />
                  Certificate
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                Enroll
              </button>
              <button className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Enrollment Component
// ============================================================================

function EnrollmentSection({ enrollments, subTab }: { enrollments: TrainingEnrollment[]; subTab: EnrollmentSubTab }) {
  const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.COMPLETED: return 'bg-green-900 text-green-300';
      case EnrollmentStatus.ENROLLED: return 'bg-blue-900 text-blue-300';
      case EnrollmentStatus.IN_PROGRESS: return 'bg-yellow-900 text-yellow-300';
      case EnrollmentStatus.PENDING: return 'bg-gray-700 text-gray-300';
      case EnrollmentStatus.APPROVED: return 'bg-green-900 text-green-300';
      case EnrollmentStatus.REJECTED: return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'enroll') {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Enroll in Training</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Training Program</label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
              <option value="">Select a program...</option>
              <option value="1">Leadership Excellence Program</option>
              <option value="2">Advanced React Development</option>
              <option value="3">Workplace Safety Essentials</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Batch</label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600">
              <option value="">Select a batch...</option>
              <option value="1">Leadership Batch Q1-2024 (Dec 1-5)</option>
              <option value="2">React Advanced Nov 2024 (Nov 18-20)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Justification (Optional)</label>
            <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 h-20" placeholder="Why do you want to attend this training?" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserCheck className="h-4 w-4" />
            Submit Enrollment Request
          </button>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Program</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Batch</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Score</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Certificate</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-gray-750">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-white font-medium">{enrollment.program?.programName}</p>
                    <p className="text-xs text-gray-500">{enrollment.enrollmentCode}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-300">{enrollment.schedule?.batchName}</td>
                <td className="px-4 py-3 text-gray-300 text-sm">
                  {enrollment.schedule?.startDate} - {enrollment.schedule?.endDate}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(enrollment.status)}`}>
                    {enrollment.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {enrollment.score ? (
                    <span className="text-white font-medium">{enrollment.score}%</span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {enrollment.certificateIssued ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Issued
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
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
// Skills Component
// ============================================================================

function SkillsSection({ certifications, subTab }: { certifications: CertificationTracking[]; subTab: SkillsSubTab }) {
  const getCertStatusColor = (status: CertificationStatus) => {
    switch (status) {
      case CertificationStatus.ACTIVE: return 'bg-green-900 text-green-300';
      case CertificationStatus.PENDING_RENEWAL: return 'bg-yellow-900 text-yellow-300';
      case CertificationStatus.EXPIRED: return 'bg-red-900 text-red-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  // Skill Matrix and Gap Analysis are rendered by dedicated backend-wired
  // sections (SkillMatrixSection / SkillGapSection) from renderContent().

  if (subTab === 'certifications') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Certification Tracking</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Add Certification
          </button>
        </div>

        <div className="space-y-3">
          {certifications.map((cert) => (
            <div key={cert.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{cert.certificationName}</h4>
                    <p className="text-sm text-gray-400">{cert.issuingAuthority}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getCertStatusColor(cert.status)}`}>
                  {cert.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Employee</p>
                  <p className="text-white">{cert.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cert Number</p>
                  <p className="text-white">{cert.certificationNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Issue Date</p>
                  <p className="text-white">{cert.issueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expiry Date</p>
                  <p className={`${cert.status === CertificationStatus.PENDING_RENEWAL ? 'text-yellow-400' : 'text-white'}`}>
                    {cert.expiryDate || 'No expiry'}
                  </p>
                </div>
              </div>

              {cert.status === CertificationStatus.PENDING_RENEWAL && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                    Renew Certification
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-400 text-center py-8">Skills: {subTab} section</div>
  );
}

// ============================================================================
// E-Learning Component
// ============================================================================

function ELearningSection({ courses, subTab }: { courses: ELearningCourse[]; subTab: ELearningSubTab }) {
  if (subTab === 'library') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Course Library</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-9 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="h-32 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <Video className="h-12 w-12 text-white opacity-50" />
              </div>
              <div className="p-4">
                <span className="px-2 py-0.5 rounded text-xs bg-blue-900 text-blue-300">
                  {course.category}
                </span>
                <h4 className="text-white font-medium mt-2 mb-1">{course.courseName}</h4>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{course.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.durationHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {course.totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    {course.averageRating}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    <Play className="h-4 w-4" />
                    Start Course
                  </button>
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

      <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-400">
        <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>E-Learning {subTab.replace('_', ' ')} section coming soon</p>
      </div>
    </div>
  );
}

// ============================================================================
// Budget Component
// ============================================================================

function BudgetSection({ budgets, subTab }: { budgets: TrainingBudget[]; subTab: BudgetSubTab }) {
  const getStatusColor = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.ACTIVE: return 'bg-green-900 text-green-300';
      case BudgetStatus.APPROVED: return 'bg-blue-900 text-blue-300';
      case BudgetStatus.EXHAUSTED: return 'bg-red-900 text-red-300';
      case BudgetStatus.DRAFT: return 'bg-gray-700 text-gray-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  if (subTab === 'allocation') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Budget Allocation</h3>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            <Plus className="h-4 w-4" />
            Create Budget
          </button>
        </div>

        <div className="space-y-4">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-white font-medium">{budget.budgetName}</h4>
                  <p className="text-sm text-gray-400">{budget.budgetCode} | FY {budget.fiscalYear}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(budget.status)}`}>
                  {budget.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Total Budget</p>
                  <p className="text-lg text-white font-semibold">₹{(budget.totalBudget / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Allocated</p>
                  <p className="text-lg text-blue-400 font-semibold">₹{(budget.allocatedBudget / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Used</p>
                  <p className="text-lg text-yellow-400 font-semibold">₹{(budget.usedBudget / 100000).toFixed(1)}L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Available</p>
                  <p className="text-lg text-green-400 font-semibold">₹{(budget.availableBudget / 100000).toFixed(1)}L</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Utilization</span>
                  <span className="text-white">{((budget.usedBudget / budget.totalBudget) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(budget.usedBudget / budget.totalBudget) * 100}%` }}
                  />
                </div>
              </div>

              {budget.categories && budget.categories.length > 0 && (
                <div className="border-t border-gray-700 pt-3">
                  <p className="text-xs text-gray-400 mb-2">By Category</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {budget.categories.map((cat, idx) => (
                      <div key={idx} className="bg-gray-700 rounded p-2">
                        <p className="text-xs text-gray-400">{cat.category}</p>
                        <p className="text-sm text-white font-medium">₹{(cat.used / 100000).toFixed(1)}L / ₹{(cat.allocated / 100000).toFixed(1)}L</p>
                      </div>
                    ))}
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
    <div className="text-gray-400 text-center py-8">Budget: {subTab} section coming soon</div>
  );
}

// ============================================================================
// Shared status helpers for backend-derived sections
// ============================================================================

function LoadingBanner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-blue-400" />
      {label}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-red-900 text-red-300 text-sm text-center py-6">
      {message}
    </div>
  );
}

function EmptyBanner({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="text-center py-8 text-gray-400">
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{title}</p>
        {subtitle && <p className="text-sm mt-2">{subtitle}</p>}
      </div>
    </div>
  );
}

// ============================================================================
// Skill Matrix (real — /hr/user-skills/matrix)
// ============================================================================

function SkillMatrixSection({
  rows,
  loading,
  error,
}: {
  rows: SkillMatrixRow[];
  loading: boolean;
  error: string | null;
}) {
  const skillNames = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r.skills || {}))),
  ).sort();

  const levelColor = (lvl: number) => {
    if (lvl >= 4) return 'bg-green-900 text-green-300';
    if (lvl === 3) return 'bg-blue-900 text-blue-300';
    if (lvl === 2) return 'bg-yellow-900 text-yellow-300';
    if (lvl >= 1) return 'bg-orange-900 text-orange-300';
    return 'bg-gray-700 text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Skill Matrix</h3>
      </div>
      {loading && <LoadingBanner label="Loading skill matrix…" />}
      {error && !loading && <ErrorBanner message={error} />}
      {!loading && !error && rows.length === 0 && (
        <EmptyBanner
          icon={Target}
          title="No skill data yet"
          subtitle="Assign skills to employees to populate the matrix."
        />
      )}
      {!loading && !error && rows.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase sticky left-0 bg-gray-900">
                  Employee
                </th>
                {skillNames.map((s) => (
                  <th key={s} className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase whitespace-nowrap">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rows.map((row) => (
                <tr key={row.employee} className="hover:bg-gray-750">
                  <td className="px-4 py-3 text-white font-medium sticky left-0 bg-gray-800 whitespace-nowrap">
                    {row.employee}
                  </td>
                  {skillNames.map((s) => {
                    const lvl = row.skills?.[s];
                    return (
                      <td key={s} className="px-3 py-3 text-center">
                        {lvl != null ? (
                          <span className={`inline-block px-2 py-1 rounded text-xs ${levelColor(lvl)}`}>
                            {lvl}
                          </span>
                        ) : (
                          <span className="text-gray-600">–</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Skill Gap Analysis (real — /hr/skill-gaps)
// ============================================================================

function SkillGapSection({
  gaps,
  loading,
  error,
}: {
  gaps: SkillGapRow[];
  loading: boolean;
  error: string | null;
}) {
  const priorityColor = (p?: string) => {
    switch ((p || '').toLowerCase()) {
      case 'critical': return 'bg-red-900 text-red-300';
      case 'high': return 'bg-orange-900 text-orange-300';
      case 'medium': return 'bg-yellow-900 text-yellow-300';
      case 'low': return 'bg-blue-900 text-blue-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Skill Gap Analysis</h3>
      </div>
      {loading && <LoadingBanner label="Loading skill gaps…" />}
      {error && !loading && <ErrorBanner message={error} />}
      {!loading && !error && gaps.length === 0 && (
        <EmptyBanner
          icon={TrendingUp}
          title="No skill gaps identified"
          subtitle="Recorded skill gaps and recommendations will appear here."
        />
      )}
      {!loading && !error && gaps.length > 0 && (
        <div className="space-y-3">
          {gaps.map((g) => (
            <div key={g.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-medium">{g.skill?.name || g.name}</h4>
                  {g.code && <p className="text-xs text-gray-500">{g.code}</p>}
                </div>
                <span className={`px-2 py-1 rounded text-xs ${priorityColor(g.priority)}`}>
                  {g.priority || 'Medium'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                <div>
                  <p className="text-xs text-gray-400">Required Level</p>
                  <p className="text-white">{g.requiredProficiencyLevel ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current Avg</p>
                  <p className="text-white">{g.currentAverageProficiency ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Gap</p>
                  <p className="text-yellow-400">{Number(g.gapPercentage ?? 0).toFixed(1)}%</p>
                </div>
              </div>
              {g.gapPercentage != null && (
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${Math.min(100, Number(g.gapPercentage))}%` }}
                  />
                </div>
              )}
              {g.recommendation && (
                <p className="text-sm text-gray-400 mt-2">{g.recommendation}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Training Effectiveness (real aggregate — /hr/training-enrollments)
// ============================================================================

function EffectivenessSection({
  enrollments,
  loading,
  error,
}: {
  enrollments: TrainingEnrollmentRow[];
  loading: boolean;
  error: string | null;
}) {
  const total = enrollments.length;
  const completed = enrollments.filter((e) => (e.status || '').toLowerCase() === 'completed').length;
  const certified = enrollments.filter((e) => e.certification).length;
  const avgProgress = total ? enrollments.reduce((s, e) => s + Number(e.progress || 0), 0) / total : 0;
  const avgAttendance = total ? enrollments.reduce((s, e) => s + Number(e.attendance || 0), 0) / total : 0;
  const completionRate = total ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Training Effectiveness</h3>
      {loading && <LoadingBanner label="Loading effectiveness metrics…" />}
      {error && !loading && <ErrorBanner message={error} />}
      {!loading && !error && total === 0 && (
        <EmptyBanner
          icon={Zap}
          title="No enrollment data yet"
          subtitle="Effectiveness metrics are derived from training enrollments."
        />
      )}
      {!loading && !error && total > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{completionRate.toFixed(0)}%</p>
              <p className="text-sm text-gray-400">Completion Rate</p>
              <p className="text-xs text-gray-500 mt-1">{completed}/{total} completed</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{avgProgress.toFixed(0)}%</p>
              <p className="text-sm text-gray-400">Avg. Progress</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{avgAttendance.toFixed(0)}%</p>
              <p className="text-sm text-gray-400">Avg. Attendance</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{certified}</p>
              <p className="text-sm text-gray-400">Certifications Earned</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Program</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Attendance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 text-white">{e.employeeName || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{e.programTitle || '-'}</td>
                    <td className="px-4 py-3 text-gray-300">{Number(e.progress || 0)}%</td>
                    <td className="px-4 py-3 text-gray-300">{Number(e.attendance || 0)}%</td>
                    <td className="px-4 py-3 text-gray-300 capitalize">{e.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Training Budget tracking/costs (real aggregate — /hr/training-programs)
// ============================================================================

function ProgramCostSection({
  programs,
  loading,
  error,
  subTab,
}: {
  programs: TrainingProgramRow[];
  loading: boolean;
  error: string | null;
  subTab: 'tracking' | 'costs';
}) {
  const totalCost = programs.reduce((s, p) => s + Number(p.cost || 0), 0);
  const byCategory: Record<string, number> = {};
  programs.forEach((p) => {
    const c = p.category || 'Uncategorised';
    byCategory[c] = (byCategory[c] || 0) + Number(p.cost || 0);
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        {subTab === 'tracking' ? 'Budget Tracking' : 'Training Costs'}
      </h3>
      {loading && <LoadingBanner label="Loading training cost data…" />}
      {error && !loading && <ErrorBanner message={error} />}
      {!loading && !error && programs.length === 0 && (
        <EmptyBanner
          icon={DollarSign}
          title="No training cost data yet"
          subtitle="Costs are derived from training program records."
        />
      )}
      {!loading && !error && programs.length > 0 && subTab === 'tracking' && (
        <>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400">Total Programme Cost</p>
            <p className="text-2xl font-bold text-white">₹{(totalCost / 100000).toFixed(2)}L</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-3">By Category</p>
            <div className="space-y-3">
              {Object.entries(byCategory).map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{cat}</span>
                    <span className="text-white">₹{(amt / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${totalCost ? (amt / totalCost) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {!loading && !error && programs.length > 0 && subTab === 'costs' && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Program</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Enrolled</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {programs.map((p) => (
                <tr key={p.id} className="hover:bg-gray-750">
                  <td className="px-4 py-3 text-white">{p.title || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{p.category || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">{p.enrolled ?? 0}{p.capacity ? `/${p.capacity}` : ''}</td>
                  <td className="px-4 py-3 text-gray-300">₹{Number(p.cost || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Training Reports (real aggregate — enrollments + programs)
// ============================================================================

function ReportsSection({
  enrollments,
  programs,
  loading,
  error,
  subTab,
}: {
  enrollments: TrainingEnrollmentRow[];
  programs: TrainingProgramRow[];
  loading: boolean;
  error: string | null;
  subTab: string;
}) {
  const total = enrollments.length;
  const completed = enrollments.filter((e) => (e.status || '').toLowerCase() === 'completed').length;
  const totalHours = enrollments.reduce((s, e) => s + Number(e.duration || 0), 0);

  // group by employee
  const byEmployee: Record<string, { trainings: number; hours: number; completed: number }> = {};
  enrollments.forEach((e) => {
    const k = e.employeeName || 'Unknown';
    byEmployee[k] = byEmployee[k] || { trainings: 0, hours: 0, completed: 0 };
    byEmployee[k].trainings += 1;
    byEmployee[k].hours += Number(e.duration || 0);
    if ((e.status || '').toLowerCase() === 'completed') byEmployee[k].completed += 1;
  });

  // group by category
  const byCategory: Record<string, number> = {};
  enrollments.forEach((e) => {
    const c = e.category || 'Uncategorised';
    byCategory[c] = (byCategory[c] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white capitalize">
        {subTab === 'summary' ? 'Training Summary' : subTab === 'employee' ? 'Employee Training' : subTab === 'hours' ? 'Training Hours' : 'Department Training'}
      </h3>
      {loading && <LoadingBanner label="Loading training reports…" />}
      {error && !loading && <ErrorBanner message={error} />}
      {!loading && !error && total === 0 && (
        <EmptyBanner
          icon={BarChart3}
          title="No training report data yet"
          subtitle="Reports aggregate over training enrollment records."
        />
      )}
      {!loading && !error && total > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{programs.length}</p>
              <p className="text-sm text-gray-400">Programs</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{total}</p>
              <p className="text-sm text-gray-400">Enrollments</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{total ? ((completed / total) * 100).toFixed(0) : 0}%</p>
              <p className="text-sm text-gray-400">Completion Rate</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-white">{totalHours.toFixed(0)}h</p>
              <p className="text-sm text-gray-400">Total Hours</p>
            </div>
          </div>

          {(subTab === 'summary' || subTab === 'department') && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-3">Enrollments by Category</p>
              <div className="space-y-3">
                {Object.entries(byCategory).map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{cat}</span>
                      <span className="text-white">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(subTab === 'employee' || subTab === 'hours') && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Trainings</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {Object.entries(byEmployee).map(([emp, v]) => (
                    <tr key={emp} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-white">{emp}</td>
                      <td className="px-4 py-3 text-gray-300">{v.trainings}</td>
                      <td className="px-4 py-3 text-gray-300">{v.completed}</td>
                      <td className="px-4 py-3 text-gray-300">{v.hours.toFixed(0)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function TrainingDevelopmentPage() {
  const [mainTab, setMainTab] = useState<MainTab>('programs');
  const [programsSubTab, setProgramsSubTab] = useState<ProgramsSubTab>('catalog');
  const [enrollmentSubTab, setEnrollmentSubTab] = useState<EnrollmentSubTab>('my_trainings');
  const [skillsSubTab, setSkillsSubTab] = useState<SkillsSubTab>('certifications');
  const [effectivenessSubTab, setEffectivenessSubTab] = useState<EffectivenessSubTab>('feedback');
  const [elearningSubTab, setElearningSubTab] = useState<ELearningSubTab>('library');
  const [budgetSubTab, setBudgetSubTab] = useState<BudgetSubTab>('allocation');
  const [reportsSubTab, setReportsSubTab] = useState<ReportsSubTab>('summary');

  const [dashboard, setDashboard] = useState<TrainingDashboard | null>(null);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [courses, setCourses] = useState<ELearningCourse[]>([]);
  const [certifications, setCertifications] = useState<CertificationTracking[]>([]);
  const [budgets, setBudgets] = useState<TrainingBudget[]>([]);

  // Backend-derived aggregate data (NestJS HR domain backend)
  const [skillMatrixRows, setSkillMatrixRows] = useState<SkillMatrixRow[]>([]);
  const [skillMatrixLoading, setSkillMatrixLoading] = useState(false);
  const [skillMatrixError, setSkillMatrixError] = useState<string | null>(null);

  const [skillGaps, setSkillGaps] = useState<SkillGapRow[]>([]);
  const [skillGapsLoading, setSkillGapsLoading] = useState(false);
  const [skillGapsError, setSkillGapsError] = useState<string | null>(null);

  const [domainEnrollments, setDomainEnrollments] = useState<TrainingEnrollmentRow[]>([]);
  const [domainEnrollmentsLoading, setDomainEnrollmentsLoading] = useState(false);
  const [domainEnrollmentsError, setDomainEnrollmentsError] = useState<string | null>(null);

  const [domainPrograms, setDomainPrograms] = useState<TrainingProgramRow[]>([]);
  const [domainProgramsLoading, setDomainProgramsLoading] = useState(false);
  const [domainProgramsError, setDomainProgramsError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
    loadPrograms();
    loadSchedules();
    loadEnrollments();
    loadCourses();
    loadCertifications();
    loadBudgets();
    loadSkillMatrix();
    loadSkillGaps();
    loadDomainEnrollments();
    loadDomainPrograms();
  }, []);

  const loadSkillMatrix = async () => {
    setSkillMatrixLoading(true);
    setSkillMatrixError(null);
    try {
      const rows = await HrPagesService.get<SkillMatrixRow[]>('/hr/user-skills/matrix');
      setSkillMatrixRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setSkillMatrixError(err instanceof Error ? err.message : 'Failed to load skill matrix');
    } finally {
      setSkillMatrixLoading(false);
    }
  };

  const loadSkillGaps = async () => {
    setSkillGapsLoading(true);
    setSkillGapsError(null);
    try {
      const rows = await HrPagesService.get<SkillGapRow[]>('/hr/skill-gaps');
      setSkillGaps(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setSkillGapsError(err instanceof Error ? err.message : 'Failed to load skill gaps');
    } finally {
      setSkillGapsLoading(false);
    }
  };

  const loadDomainEnrollments = async () => {
    setDomainEnrollmentsLoading(true);
    setDomainEnrollmentsError(null);
    try {
      const rows = await HrPagesService.trainingEnrollments<TrainingEnrollmentRow[]>();
      setDomainEnrollments(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setDomainEnrollmentsError(err instanceof Error ? err.message : 'Failed to load enrollments');
    } finally {
      setDomainEnrollmentsLoading(false);
    }
  };

  const loadDomainPrograms = async () => {
    setDomainProgramsLoading(true);
    setDomainProgramsError(null);
    try {
      const rows = await HrPagesService.trainingPrograms<TrainingProgramRow[]>();
      setDomainPrograms(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setDomainProgramsError(err instanceof Error ? err.message : 'Failed to load programs');
    } finally {
      setDomainProgramsLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const data = await TrainingDevelopmentService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const result = await TrainingDevelopmentService.getTrainingPrograms();
      setPrograms(result.data);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const result = await TrainingDevelopmentService.getTrainingSchedules();
      setSchedules(result.data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadEnrollments = async () => {
    try {
      const result = await TrainingDevelopmentService.getEnrollments();
      setEnrollments(result.data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const result = await TrainingDevelopmentService.getELearningCourses();
      setCourses(result.data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadCertifications = async () => {
    try {
      const result = await TrainingDevelopmentService.getCertifications();
      setCertifications(result.data);
    } catch (error) {
      console.error('Error loading certifications:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      const data = await TrainingDevelopmentService.getTrainingBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const mainTabs = [
    { id: 'programs' as MainTab, label: 'Training Programs', icon: GraduationCap },
    { id: 'enrollment' as MainTab, label: 'Enrollment & Attendance', icon: UserCheck },
    { id: 'skills' as MainTab, label: 'Skill Development', icon: Target },
    { id: 'effectiveness' as MainTab, label: 'Training Effectiveness', icon: TrendingUp },
    { id: 'elearning' as MainTab, label: 'E-Learning', icon: Video },
    { id: 'budget' as MainTab, label: 'Training Budget', icon: DollarSign },
    { id: 'reports' as MainTab, label: 'Training Reports', icon: BarChart3 },
  ];

  const programsSubTabs = [
    { id: 'catalog' as ProgramsSubTab, label: 'Program Catalog', icon: BookOpen },
    { id: 'create' as ProgramsSubTab, label: 'Create Program', icon: Plus },
    { id: 'schedule' as ProgramsSubTab, label: 'Program Schedule', icon: Calendar },
    { id: 'external' as ProgramsSubTab, label: 'External Training', icon: Briefcase },
  ];

  const enrollmentSubTabs = [
    { id: 'enroll' as EnrollmentSubTab, label: 'Enroll in Training', icon: Plus },
    { id: 'my_trainings' as EnrollmentSubTab, label: 'My Trainings', icon: BookMarked },
    { id: 'attendance' as EnrollmentSubTab, label: 'Training Attendance', icon: ClipboardList },
    { id: 'waitlist' as EnrollmentSubTab, label: 'Waiting List', icon: Clock },
  ];

  const skillsSubTabs = [
    { id: 'matrix' as SkillsSubTab, label: 'Skill Matrix', icon: Target },
    { id: 'assessment' as SkillsSubTab, label: 'Skill Assessment', icon: ClipboardList },
    { id: 'gap_analysis' as SkillsSubTab, label: 'Skill Gap Analysis', icon: TrendingUp },
    { id: 'certifications' as SkillsSubTab, label: 'Certification Tracking', icon: Award },
  ];

  const effectivenessSubTabs = [
    { id: 'feedback' as EffectivenessSubTab, label: 'Training Feedback', icon: Star },
    { id: 'assessments' as EffectivenessSubTab, label: 'Assessments & Tests', icon: ClipboardList },
    { id: 'impact' as EffectivenessSubTab, label: 'Training Impact', icon: Zap },
  ];

  const elearningSubTabs = [
    { id: 'library' as ELearningSubTab, label: 'Course Library', icon: BookOpen },
    { id: 'my_courses' as ELearningSubTab, label: 'My Courses', icon: BookMarked },
    { id: 'progress' as ELearningSubTab, label: 'Course Progress', icon: TrendingUp },
    { id: 'certifications' as ELearningSubTab, label: 'Certifications', icon: Award },
  ];

  const budgetSubTabs = [
    { id: 'allocation' as BudgetSubTab, label: 'Budget Allocation', icon: DollarSign },
    { id: 'tracking' as BudgetSubTab, label: 'Budget Tracking', icon: TrendingUp },
    { id: 'costs' as BudgetSubTab, label: 'Training Costs', icon: FileText },
  ];

  const reportsSubTabs = [
    { id: 'summary' as ReportsSubTab, label: 'Training Summary', icon: BarChart3 },
    { id: 'employee' as ReportsSubTab, label: 'Employee Training', icon: Users },
    { id: 'department' as ReportsSubTab, label: 'Department Training', icon: Building2 },
    { id: 'hours' as ReportsSubTab, label: 'Training Hours', icon: Clock },
  ];

  const getCurrentSubTabs = () => {
    switch (mainTab) {
      case 'programs': return programsSubTabs;
      case 'enrollment': return enrollmentSubTabs;
      case 'skills': return skillsSubTabs;
      case 'effectiveness': return effectivenessSubTabs;
      case 'elearning': return elearningSubTabs;
      case 'budget': return budgetSubTabs;
      case 'reports': return reportsSubTabs;
      default: return [];
    }
  };

  const getCurrentSubTab = () => {
    switch (mainTab) {
      case 'programs': return programsSubTab;
      case 'enrollment': return enrollmentSubTab;
      case 'skills': return skillsSubTab;
      case 'effectiveness': return effectivenessSubTab;
      case 'elearning': return elearningSubTab;
      case 'budget': return budgetSubTab;
      case 'reports': return reportsSubTab;
      default: return '';
    }
  };

  const setCurrentSubTab = (tab: string) => {
    switch (mainTab) {
      case 'programs': setProgramsSubTab(tab as ProgramsSubTab); break;
      case 'enrollment': setEnrollmentSubTab(tab as EnrollmentSubTab); break;
      case 'skills': setSkillsSubTab(tab as SkillsSubTab); break;
      case 'effectiveness': setEffectivenessSubTab(tab as EffectivenessSubTab); break;
      case 'elearning': setElearningSubTab(tab as ELearningSubTab); break;
      case 'budget': setBudgetSubTab(tab as BudgetSubTab); break;
      case 'reports': setReportsSubTab(tab as ReportsSubTab); break;
    }
  };

  const renderContent = () => {
    switch (mainTab) {
      case 'programs':
        return <ProgramsSection programs={programs} schedules={schedules} subTab={programsSubTab} />;
      case 'enrollment':
        return <EnrollmentSection enrollments={enrollments} subTab={enrollmentSubTab} />;
      case 'skills':
        if (skillsSubTab === 'matrix') {
          return (
            <SkillMatrixSection
              rows={skillMatrixRows}
              loading={skillMatrixLoading}
              error={skillMatrixError}
            />
          );
        }
        if (skillsSubTab === 'gap_analysis') {
          return (
            <SkillGapSection
              gaps={skillGaps}
              loading={skillGapsLoading}
              error={skillGapsError}
            />
          );
        }
        return <SkillsSection certifications={certifications} subTab={skillsSubTab} />;
      case 'effectiveness':
        return (
          <EffectivenessSection
            enrollments={domainEnrollments}
            loading={domainEnrollmentsLoading}
            error={domainEnrollmentsError}
          />
        );
      case 'elearning':
        return <ELearningSection courses={courses} subTab={elearningSubTab} />;
      case 'budget':
        if (budgetSubTab === 'tracking' || budgetSubTab === 'costs') {
          return (
            <ProgramCostSection
              programs={domainPrograms}
              loading={domainProgramsLoading}
              error={domainProgramsError}
              subTab={budgetSubTab}
            />
          );
        }
        return <BudgetSection budgets={budgets} subTab={budgetSubTab} />;
      case 'reports':
        return (
          <ReportsSection
            enrollments={domainEnrollments}
            programs={domainPrograms}
            loading={domainEnrollmentsLoading || domainProgramsLoading}
            error={domainEnrollmentsError || domainProgramsError}
            subTab={reportsSubTab}
          />
        );
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
            <h1 className="text-2xl font-bold text-white">Training & Development</h1>
            <p className="text-gray-400">Manage training programs, enrollments, skills, and e-learning</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <TrainingDashboardView dashboard={dashboard} />

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
