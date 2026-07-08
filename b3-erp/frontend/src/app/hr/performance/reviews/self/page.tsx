'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { toast } from '@/hooks/use-toast';
import { User, Save, Send, Calendar, TrendingUp, Target, Award, AlertCircle } from 'lucide-react';

interface ReviewSection {
  id: string;
  title: string;
  description: string;
  rating: number;
  comments: string;
}

interface Goal {
  id: string;
  title: string;
  targetValue: string;
  achievedValue: string;
  status: 'exceeded' | 'achieved' | 'partial' | 'not_achieved';
}

export default function SelfReviewPage() {
  const [reviewPeriod] = useState({ start: '2024-04-01', end: '2024-09-30' });
  const [isDraft, setIsDraft] = useState(true);

  const [reviewSections, setReviewSections] = useState<ReviewSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.performanceReviews<any[]>();
        if (!cancelled) setReviewSections(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setReviewSections([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Reduce Production Defects',
      targetValue: '10% reduction',
      achievedValue: '12% reduction',
      status: 'exceeded'
    },
    {
      id: '2',
      title: 'Complete CNC Certification',
      targetValue: 'Certification by Sept 2024',
      achievedValue: 'Completed in Aug 2024',
      status: 'exceeded'
    },
    {
      id: '3',
      title: 'Improve Team Productivity',
      targetValue: '8% improvement',
      achievedValue: '15% improvement',
      status: 'exceeded'
    },
    {
      id: '4',
      title: 'Mentor Junior Staff',
      targetValue: 'Mentor 2 employees',
      achievedValue: 'Mentored 3 employees',
      status: 'exceeded'
    }
  ]);

  const [achievements, setAchievements] = useState('• Led successful implementation of automated quality inspection system\n• Reduced production defects by 12%, exceeding target of 10%\n• Mentored 3 junior team members, helping them achieve certification\n• Proposed cost-saving initiative that reduced material waste by 8%\n• Maintained 100% safety compliance with zero incidents');

  const [developmentAreas, setDevelopmentAreas] = useState('• Would like to develop advanced data analytics skills for production optimization\n• Interested in learning lean manufacturing principles at expert level\n• Want to improve presentation skills for management reporting');

  const [trainingNeeds, setTrainingNeeds] = useState('• Advanced Data Analytics for Manufacturing\n• Lean Six Sigma Green Belt Certification\n• Leadership and Team Management Training\n• Advanced Quality Management Systems');

  const updateRating = (sectionId: string, rating: number) => {
    setReviewSections(sections =>
      sections.map(s => s.id === sectionId ? { ...s, rating } : s)
    );
  };

  const updateComments = (sectionId: string, comments: string) => {
    setReviewSections(sections =>
      sections.map(s => s.id === sectionId ? { ...s, comments } : s)
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      exceeded: 'bg-green-100 text-green-800',
      achieved: 'bg-blue-100 text-blue-800',
      partial: 'bg-yellow-100 text-yellow-800',
      not_achieved: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      exceeded: 'Exceeded',
      achieved: 'Achieved',
      partial: 'Partially Achieved',
      not_achieved: 'Not Achieved'
    };
    return labels[status as keyof typeof labels];
  };

  const avgRating = (reviewSections.reduce((sum, s) => sum + s.rating, 0) / reviewSections.length).toFixed(1);
  const totalGoals = goals.length;
  const exceededGoals = goals.filter(g => g.status === 'exceeded').length;
  const achievedGoals = goals.filter(g => g.status === 'achieved' || g.status === 'exceeded').length;

  const buildPayload = (status: 'draft' | 'submitted') => ({
    reviewType: 'self',
    status,
    reviewPeriodStart: reviewPeriod.start,
    reviewPeriodEnd: reviewPeriod.end,
    overallRating: Number(avgRating),
    competencies: reviewSections.map((s) => ({
      id: s.id,
      title: s.title,
      rating: s.rating,
      comments: s.comments,
    })),
    achievements,
    developmentAreas,
    trainingNeeds,
  });

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      await HrPagesService.createPerformanceReview(buildPayload('draft'));
      setIsDraft(true);
      toast({ title: 'Self-review saved as draft' });
    } catch (err) {
      toast({
        title: 'Failed to save draft',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your self-review? You will not be able to edit it after submission.')) {
      return;
    }
    setIsSubmitting(true);
    try {
      await HrPagesService.createPerformanceReview(buildPayload('submitted'));
      setIsDraft(false);
      toast({ title: 'Self-review submitted successfully!' });
    } catch (err) {
      toast({
        title: 'Failed to submit self-review',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <User className="h-8 w-8 text-purple-600" />
          Self Appraisal
        </h1>
        <p className="text-gray-600 mt-2">Complete your self-assessment for performance review</p>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-sm text-gray-600">Employee</p>
            <p className="text-lg font-semibold text-gray-900">Rahul Sharma</p>
            <p className="text-sm text-gray-600">KMF2451 • Production Supervisor</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Review Period</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(reviewPeriod.start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(reviewPeriod.end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-sm text-gray-600">H2 2024 (6 months)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${isDraft ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {isDraft ? 'Draft' : 'Submitted'}
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {isDraft ? 'Not yet submitted' : 'Submitted for review'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Rating</p>
              <p className="text-2xl font-bold text-purple-600">{avgRating}/5</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Goals Achieved</p>
              <p className="text-2xl font-bold text-green-600">{achievedGoals}/{totalGoals}</p>
            </div>
            <Target className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Exceeded Goals</p>
              <p className="text-2xl font-bold text-blue-600">{exceededGoals}</p>
            </div>
            <Award className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-orange-600">100%</p>
            </div>
            <Calendar className="h-10 w-10 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Alert */}
      {isDraft && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-900">Draft Status</h3>
              <p className="text-sm text-yellow-700">
                Your self-review is saved as draft. Remember to submit it before the deadline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Achievement */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="h-6 w-6 text-purple-600" />
          Goal Achievement Summary
        </h2>
        <div className="space-y-3">
          {goals.map(goal => (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-gray-600">Target</p>
                      <p className="text-sm text-gray-900">{goal.targetValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Achieved</p>
                      <p className="text-sm font-semibold text-gray-900">{goal.achievedValue}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(goal.status)}`}>
                  {getStatusLabel(goal.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competency Ratings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-600" />
          Competency Self-Assessment
        </h2>
        <div className="space-y-3">
          {reviewSections.map(section => (
            <div key={section.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => isDraft && updateRating(section.id, star)}
                      disabled={!isDraft}
                      className={`text-2xl ${star <= section.rating ? 'text-yellow-500' : 'text-gray-300'} ${isDraft ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-900">{section.rating}/5</span>
                </div>
              </div>
              <textarea
                value={section.comments}
                onChange={(e) => isDraft && updateComments(section.id, e.target.value)}
                disabled={!isDraft}
                rows={2}
                placeholder="Add your comments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm disabled:bg-gray-50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Key Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Award className="h-6 w-6 text-purple-600" />
          Key Achievements & Contributions
        </h2>
        <textarea
          value={achievements}
          onChange={(e) => isDraft && setAchievements(e.target.value)}
          disabled={!isDraft}
          rows={6}
          placeholder="List your key achievements and contributions during this review period..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
        />
      </div>

      {/* Areas for Development */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Areas for Development</h2>
        <textarea
          value={developmentAreas}
          onChange={(e) => isDraft && setDevelopmentAreas(e.target.value)}
          disabled={!isDraft}
          rows={4}
          placeholder="Identify areas where you would like to improve..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
        />
      </div>

      {/* Training Needs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Training & Development Needs</h2>
        <textarea
          value={trainingNeeds}
          onChange={(e) => isDraft && setTrainingNeeds(e.target.value)}
          disabled={!isDraft}
          rows={4}
          placeholder="List training programs or certifications you would like to pursue..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50"
        />
      </div>

      {/* Actions */}
      {isDraft && (
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting…' : 'Submit Self-Review'}
          </button>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">Self-Review Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Be honest and objective in your self-assessment</li>
          <li>• Provide specific examples to support your ratings</li>
          <li>• Focus on accomplishments and measurable outcomes</li>
          <li>• Identify genuine areas for improvement and development</li>
          <li>• Save your review as draft to continue editing later</li>
          <li>• Once submitted, your review will be shared with your manager for discussion</li>
        </ul>
      </div>
    </div>
  );
}
