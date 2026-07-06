'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { printCurrentView } from '@/lib/export';
import { HrMovementsService } from '@/services/hr-movements.service';
import {
  ArrowLeft,
  Edit,
  Download,
  User,
  Building2,
  Briefcase,
  Calendar,
  Star,
  TrendingUp,
  Target,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Clock,
} from 'lucide-react';

interface PerformanceReview {
  id: string;
  reviewNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewerName: string;
  reviewerPosition: string;
  status: 'draft' | 'submitted' | 'approved' | 'completed';
  overallRating: number;
  technicalSkills: number;
  communication: number;
  teamwork: number;
  leadership: number;
  problemSolving: number;
  productivity: number;
  attendance: number;
  punctuality: number;
  strengths: string;
  areasForImprovement: string;
  achievements: string[];
  goals: string[];
  trainingNeeds: string[];
  comments: string;
  employeeComments: string;
  nextReviewDate: string;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export default function ViewPerformancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'feedback' | 'activity'>('overview');

  // Mock data - replace with API call
  const review: PerformanceReview = {
    id: params.id,
    reviewNumber: 'PR-2025-0001',
    employeeId: 'B3-0001',
    employeeName: 'Rajesh Kumar',
    department: 'Production',
    position: 'Production Supervisor',
    reviewPeriod: 'Q3 2025 (Jul - Sep)',
    reviewDate: '2025-10-15',
    reviewerName: 'Anil Mehta',
    reviewerPosition: 'Production Manager',
    status: 'completed',
    overallRating: 4.2,
    technicalSkills: 4.5,
    communication: 4.0,
    teamwork: 4.5,
    leadership: 4.0,
    problemSolving: 4.5,
    productivity: 4.0,
    attendance: 5.0,
    punctuality: 4.5,
    strengths: 'Excellent technical knowledge, strong problem-solving abilities, and exceptional team leadership. Consistently meets deadlines and maintains high quality standards.',
    areasForImprovement: 'Could improve on documentation practices and formal communication with other departments. More focus needed on long-term strategic planning.',
    achievements: [
      'Successfully implemented new production scheduling system, improving efficiency by 15%',
      'Led team of 12 workers to achieve zero defects for 3 consecutive months',
      'Completed advanced manufacturing certification',
      'Mentored 3 junior supervisors, all promoted within review period',
    ],
    goals: [
      'Complete Six Sigma Green Belt certification by Q1 2026',
      'Reduce production downtime by 20% in next quarter',
      'Implement preventive maintenance schedule',
      'Develop cross-training program for team members',
    ],
    trainingNeeds: [
      'Advanced Lean Manufacturing',
      'Leadership and People Management',
      'Technical Documentation',
      'Strategic Planning',
    ],
    comments: 'Rajesh has shown exceptional performance throughout the review period. His technical expertise and leadership capabilities have been instrumental in improving team productivity. Recommended for consideration for Assistant Manager role.',
    employeeComments: 'Thank you for the positive feedback. I am committed to working on the improvement areas identified and look forward to taking on more leadership responsibilities.',
    nextReviewDate: '2026-01-15',
  };

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrMovementsService.getTransfersPromotions();
        const rows: any[] = Array.isArray(raw) ? raw : [];
        const mapped: Activity[] = rows.map((r) => ({
          id: r?.id ?? '',
          action: r?.action ?? r?.type ?? r?.status ?? 'Activity',
          user: r?.user ?? r?.requestedBy ?? r?.approvedBy ?? '',
          timestamp: r?.timestamp ?? r?.effectiveDate ?? r?.createdAt ?? '',
          details: r?.details ?? r?.remarks ?? r?.reason ?? '',
        }));
        if (!cancelled) setActivities(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setActivities([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'approved':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : star - 0.5 <= rating
                ? 'fill-yellow-400 text-yellow-400 opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleDownloadReport = () => {
    printCurrentView();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{review.reviewNumber}</h1>
              <p className="text-gray-600 mt-1">{review.reviewPeriod} Performance Review</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
            <button
              onClick={() => router.push(`/hr/performance/edit/${params.id}`)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{review.overallRating.toFixed(1)}/5.0</div>
            <div className="text-yellow-100 text-sm mt-1">Overall Rating</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{review.achievements.length}</div>
            <div className="text-green-100 text-sm mt-1">Key Achievements</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">{review.goals.length}</div>
            <div className="text-blue-100 text-sm mt-1">Goals Set</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 opacity-80" />
            </div>
            <div className="text-2xl font-bold">
              {new Date(review.nextReviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </div>
            <div className="text-purple-100 text-sm mt-1">Next Review</div>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`px-4 py-3 rounded-lg border mb-3 ${getStatusColor(review.status)}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">
              Status: {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
            </span>
            {review.status === 'completed' && (
              <span className="ml-auto text-sm">
                Completed on {new Date(review.reviewDate).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('ratings')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'ratings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed Ratings
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'feedback'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Feedback & Goals
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Activity
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Employee Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Employee Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Employee ID</label>
                      <p className="font-semibold text-gray-900">{review.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Employee Name</label>
                      <p className="font-semibold text-gray-900">{review.employeeName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Department</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {review.department}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Position</label>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {review.position}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Review Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Review Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-600">Review Period</label>
                      <p className="font-semibold text-gray-900">{review.reviewPeriod}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Review Date</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(review.reviewDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Reviewer Name</label>
                      <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Reviewer Position</label>
                      <p className="font-semibold text-gray-900">{review.reviewerPosition}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Next Review Date</label>
                      <p className="font-semibold text-gray-900">
                        {new Date(review.nextReviewDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overall Rating */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Overall Rating
                  </h3>
                  <div className="flex items-center gap-2">
                    {renderStars(review.overallRating)}
                    <span className="text-2xl font-bold text-gray-900">{review.overallRating.toFixed(1)}</span>
                    <span className="text-gray-500">/ 5.0</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Technical Skills</p>
                    <p className="text-2xl font-bold text-blue-900">{review.technicalSkills.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Teamwork</p>
                    <p className="text-2xl font-bold text-green-900">{review.teamwork.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 mb-1">Leadership</p>
                    <p className="text-2xl font-bold text-purple-900">{review.leadership.toFixed(1)}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700 mb-1">Productivity</p>
                    <p className="text-2xl font-bold text-orange-900">{review.productivity.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Ratings Tab */}
            {activeTab === 'ratings' && (
              <div className="space-y-2">
                {[
                  { label: 'Technical Skills', value: review.technicalSkills, icon: TrendingUp },
                  { label: 'Communication', value: review.communication, icon: MessageSquare },
                  { label: 'Teamwork', value: review.teamwork, icon: ThumbsUp },
                  { label: 'Leadership', value: review.leadership, icon: Award },
                  { label: 'Problem Solving', value: review.problemSolving, icon: Target },
                  { label: 'Productivity', value: review.productivity, icon: TrendingUp },
                  { label: 'Attendance', value: review.attendance, icon: CheckCircle2 },
                  { label: 'Punctuality', value: review.punctuality, icon: Clock },
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{item.label}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{item.value.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(item.value)}
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                          style={{ width: `${(item.value / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback & Goals Tab */}
            {activeTab === 'feedback' && (
              <div className="space-y-3">
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                    Strengths
                  </h3>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-gray-700">{review.strengths}</p>
                  </div>
                </div>

                {/* Areas for Improvement */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Areas for Improvement
                  </h3>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-gray-700">{review.areasForImprovement}</p>
                  </div>
                </div>

                {/* Key Achievements */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Key Achievements
                  </h3>
                  <div className="space-y-2">
                    {review.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals for Next Period */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Goals for Next Period
                  </h3>
                  <div className="space-y-2">
                    {review.goals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{goal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training Needs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Training Needs
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {review.trainingNeeds.map((training, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                      >
                        {training}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Reviewer Comments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Reviewer Comments
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{review.comments}</p>
                  </div>
                </div>

                {/* Employee Comments */}
                {review.employeeComments && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      Employee Comments
                    </h3>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-gray-700">{review.employeeComments}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-300 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{activity.details}</p>
                      <p className="text-sm text-gray-500">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
