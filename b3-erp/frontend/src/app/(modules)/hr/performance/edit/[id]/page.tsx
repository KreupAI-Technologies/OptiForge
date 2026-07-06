'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PerformanceManagementService } from '@/services/performance-management.service';
import {
  ArrowLeft,
  Save,
  User,
  Star,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Target,
  Award,
  FileText,
  Plus,
  X,
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
  nextReviewDate: string;
}

export default function EditPerformancePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Mock data - replace with API call
  const [review] = useState<PerformanceReview>({
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
    overallRating: 4.2,
    technicalSkills: 4.5,
    communication: 4.0,
    teamwork: 4.5,
    leadership: 4.0,
    problemSolving: 4.5,
    productivity: 4.0,
    attendance: 5.0,
    punctuality: 4.5,
    strengths: 'Excellent technical knowledge, strong problem-solving abilities, and exceptional team leadership.',
    areasForImprovement: 'Could improve on documentation practices and formal communication with other departments.',
    achievements: [
      'Successfully implemented new production scheduling system',
      'Led team to achieve zero defects for 3 consecutive months',
    ],
    goals: [
      'Complete Six Sigma Green Belt certification',
      'Reduce production downtime by 20%',
    ],
    trainingNeeds: ['Advanced Lean Manufacturing', 'Leadership and People Management'],
    comments: 'Rajesh has shown exceptional performance throughout the review period.',
    nextReviewDate: '2026-01-15',
  });

  const [formData, setFormData] = useState({
    reviewDate: review.reviewDate,
    technicalSkills: review.technicalSkills,
    communication: review.communication,
    teamwork: review.teamwork,
    leadership: review.leadership,
    problemSolving: review.problemSolving,
    productivity: review.productivity,
    attendance: review.attendance,
    punctuality: review.punctuality,
    strengths: review.strengths,
    areasForImprovement: review.areasForImprovement,
    comments: review.comments,
    nextReviewDate: review.nextReviewDate,
  });

  const [achievements, setAchievements] = useState<string[]>(review.achievements);
  const [goals, setGoals] = useState<string[]>(review.goals);
  const [trainingNeeds, setTrainingNeeds] = useState<string[]>(review.trainingNeeds);
  const [newAchievement, setNewAchievement] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newTraining, setNewTraining] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load the real performance review on mount and populate form defensively.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await PerformanceManagementService.getHrPerformanceReviewById(params.id);
        if (cancelled || !data) return;
        const toNum = (v: any, fallback: number): number =>
          v === null || v === undefined || Number.isNaN(Number(v)) ? fallback : Number(v);
        const toStr = (v: any, fallback: string): string =>
          v === null || v === undefined ? fallback : String(v);
        const toArr = (v: any): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);

        setFormData((prev) => ({
          reviewDate: toStr(data.reviewDate, prev.reviewDate),
          technicalSkills: toNum(data.technicalSkills, prev.technicalSkills),
          communication: toNum(data.communication, prev.communication),
          teamwork: toNum(data.teamwork, prev.teamwork),
          leadership: toNum(data.leadership, prev.leadership),
          problemSolving: toNum(data.problemSolving, prev.problemSolving),
          productivity: toNum(data.productivity, prev.productivity),
          attendance: toNum(data.attendance, prev.attendance),
          punctuality: toNum(data.punctuality, prev.punctuality),
          strengths: toStr(data.strengths, prev.strengths),
          areasForImprovement: toStr(
            data.areasForImprovement ?? data.areasOfImprovement,
            prev.areasForImprovement,
          ),
          comments: toStr(data.comments ?? data.finalComments, prev.comments),
          nextReviewDate: toStr(data.nextReviewDate, prev.nextReviewDate),
        }));
        if (Array.isArray(data.achievements)) setAchievements(toArr(data.achievements));
        if (Array.isArray(data.goals)) setGoals(toArr(data.goals));
        if (Array.isArray(data.trainingNeeds)) setTrainingNeeds(toArr(data.trainingNeeds));
      } catch (err) {
        // Keep the existing form defaults if the record can't be loaded.
        console.error('Failed to load performance review', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateOverallRating = () => {
    return (
      (formData.technicalSkills +
        formData.communication +
        formData.teamwork +
        formData.leadership +
        formData.problemSolving +
        formData.productivity +
        formData.attendance +
        formData.punctuality) /
      8
    );
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements(prev => [...prev, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements(prev => prev.filter((_, i) => i !== index));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals(prev => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  const addTraining = () => {
    if (newTraining.trim()) {
      setTrainingNeeds(prev => [...prev, newTraining.trim()]);
      setNewTraining('');
    }
  };

  const removeTraining = (index: number) => {
    setTrainingNeeds(prev => prev.filter((_, i) => i !== index));
  };

  const renderStarRating = (field: string, value: number) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange(field, star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-900">{value.toFixed(1)}</span>
      </div>
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reviewDate) {
      newErrors.reviewDate = 'Review date is required';
    }

    if (!formData.nextReviewDate) {
      newErrors.nextReviewDate = 'Next review date is required';
    }

    if (formData.nextReviewDate && formData.reviewDate && formData.nextReviewDate <= formData.reviewDate) {
      newErrors.nextReviewDate = 'Next review date must be after review date';
    }

    if (!formData.strengths || formData.strengths.trim().length < 20) {
      newErrors.strengths = 'Strengths must be at least 20 characters';
    }

    if (!formData.areasForImprovement || formData.areasForImprovement.trim().length < 20) {
      newErrors.areasForImprovement = 'Areas for improvement must be at least 20 characters';
    }

    if (!formData.comments || formData.comments.trim().length < 20) {
      newErrors.comments = 'Comments must be at least 20 characters';
    }

    if (achievements.length === 0) {
      newErrors.achievements = 'At least one achievement is required';
    }

    if (goals.length === 0) {
      newErrors.goals = 'At least one goal is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix all errors before submitting');
      return;
    }

    const reviewData = {
      companyId: 'default-company-id',
      ...formData,
      overallRating: calculateOverallRating(),
      achievements,
      goals,
      trainingNeeds,
    };

    setSaving(true);
    try {
      await PerformanceManagementService.updateHrPerformanceReview(params.id, reviewData);
      alert('Performance review updated successfully!');
      router.push(`/hr/performance/view/${params.id}`);
    } catch (err) {
      console.error('Failed to update performance review', err);
      alert('Failed to update performance review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const overallRating = calculateOverallRating();

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
              <h1 className="text-3xl font-bold text-gray-900">Edit Performance Review</h1>
              <p className="text-gray-600 mt-1">{review.reviewNumber} - {review.reviewPeriod}</p>
            </div>
          </div>
        </div>

        {/* Overall Rating Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 text-white shadow-lg mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 mb-1">Overall Rating (Auto-calculated)</p>
              <p className="text-4xl font-bold">{overallRating.toFixed(1)}/5.0</p>
            </div>
            <Star className="w-16 h-16 opacity-50" />
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3">
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
              <p className="font-semibold text-gray-900">{review.department}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Position</label>
              <p className="font-semibold text-gray-900">{review.position}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Review Dates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Date *
                </label>
                <input
                  type="date"
                  value={formData.reviewDate}
                  onChange={(e) => handleInputChange('reviewDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reviewDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.reviewDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reviewDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Review Date *
                </label>
                <input
                  type="date"
                  value={formData.nextReviewDate}
                  onChange={(e) => handleInputChange('nextReviewDate', e.target.value)}
                  min={formData.reviewDate}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nextReviewDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nextReviewDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nextReviewDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Ratings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Performance Ratings
            </h3>
            <div className="space-y-3">
              {[
                { field: 'technicalSkills', label: 'Technical Skills', icon: TrendingUp },
                { field: 'communication', label: 'Communication', icon: MessageSquare },
                { field: 'teamwork', label: 'Teamwork', icon: User },
                { field: 'leadership', label: 'Leadership', icon: Award },
                { field: 'problemSolving', label: 'Problem Solving', icon: Target },
                { field: 'productivity', label: 'Productivity', icon: TrendingUp },
                { field: 'attendance', label: 'Attendance', icon: User },
                { field: 'punctuality', label: 'Punctuality', icon: User },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  {renderStarRating(item.field, formData[item.field as keyof typeof formData] as number)}
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Strengths *</h3>
            <textarea
              value={formData.strengths}
              onChange={(e) => handleInputChange('strengths', e.target.value)}
              rows={4}
              placeholder="Describe the employee's key strengths and what they do well"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.strengths ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.strengths && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.strengths}
              </p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas for Improvement *</h3>
            <textarea
              value={formData.areasForImprovement}
              onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
              rows={4}
              placeholder="Describe areas where the employee can improve"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.areasForImprovement ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.areasForImprovement && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.areasForImprovement}
              </p>
            )}
          </div>

          {/* Key Achievements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Key Achievements *
            </h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="flex-1 text-gray-700">{achievement}</span>
                  <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  placeholder="Add achievement"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addAchievement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {errors.achievements && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.achievements}
                </p>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Goals for Next Period *
            </h3>
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="flex-1 text-gray-700">{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeGoal(index)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  placeholder="Add goal"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {errors.goals && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.goals}
                </p>
              )}
            </div>
          </div>

          {/* Training Needs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Training Needs
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {trainingNeeds.map((training, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {training}
                    <button
                      type="button"
                      onClick={() => removeTraining(index)}
                      className="hover:bg-indigo-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTraining}
                  onChange={(e) => setNewTraining(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTraining())}
                  placeholder="Add training need"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTraining}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Overall Comments *
            </h3>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={4}
              placeholder="Provide comprehensive comments about the employee's overall performance"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.comments ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.comments && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.comments}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Updating...' : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
