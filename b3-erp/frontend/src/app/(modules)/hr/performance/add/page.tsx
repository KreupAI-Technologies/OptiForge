'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmployeeService } from '@/services/employee.service';
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
  Search,
  ChevronDown,
  Building2,
  Briefcase,
} from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
}

interface FormData {
  employeeId: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewerName: string;
  reviewerPosition: string;
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
  comments: string;
  nextReviewDate: string;
}

export default function AddPerformancePage() {
  const router = useRouter();

  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    reviewPeriod: '',
    reviewDate: '',
    reviewerName: '',
    reviewerPosition: '',
    technicalSkills: 0,
    communication: 0,
    teamwork: 0,
    leadership: 0,
    problemSolving: 0,
    productivity: 0,
    attendance: 0,
    punctuality: 0,
    strengths: '',
    areasForImprovement: '',
    comments: '',
    nextReviewDate: '',
  });

  const [achievements, setAchievements] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [trainingNeeds, setTrainingNeeds] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newTraining, setNewTraining] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await EmployeeService.getAllEmployeesRaw();
        const mapped: Employee[] = (raw as any[]).map((r) => ({
          id: r?.id ?? '',
          employeeId: r?.employeeCode ?? r?.employeeId ?? '',
          name:
            r?.fullName ??
            [r?.firstName, r?.lastName].filter(Boolean).join(' ').trim() ??
            '',
          department: r?.departmentName ?? r?.department ?? '',
          position: r?.designation ?? r?.position ?? '',
          email: r?.email ?? '',
          phone: r?.phone ?? r?.mobile ?? '',
        }));
        if (!cancelled) setAllEmployees(mapped);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load');
          setAllEmployees([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEmployees = allEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(employeeSearchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearchQuery.toLowerCase())
  );

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData((prev) => ({ ...prev, employeeId: employee.employeeId }));
    setShowEmployeeSearch(false);
    setEmployeeSearchQuery('');
    if (errors.employeeId) {
      setErrors((prev) => ({ ...prev, employeeId: '' }));
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const calculateOverallRating = () => {
    const ratings = [
      formData.technicalSkills,
      formData.communication,
      formData.teamwork,
      formData.leadership,
      formData.problemSolving,
      formData.productivity,
      formData.attendance,
      formData.punctuality,
    ];
    const validRatings = ratings.filter((r) => r > 0);
    if (validRatings.length === 0) return 0;
    return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements((prev) => [...prev, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals((prev) => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  };

  const addTraining = () => {
    if (newTraining.trim()) {
      setTrainingNeeds((prev) => [...prev, newTraining.trim()]);
      setNewTraining('');
    }
  };

  const removeTraining = (index: number) => {
    setTrainingNeeds((prev) => prev.filter((_, i) => i !== index));
  };

  const renderStarRating = (field: string, value: number) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange(field as keyof FormData, star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-900">{value > 0 ? value.toFixed(1) : '-'}</span>
      </div>
    );
  };

  const generateReviewNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PR-${year}-${random}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }

    if (!formData.reviewPeriod) {
      newErrors.reviewPeriod = 'Review period is required';
    }

    if (!formData.reviewDate) {
      newErrors.reviewDate = 'Review date is required';
    }

    if (!formData.reviewerName) {
      newErrors.reviewerName = 'Reviewer name is required';
    }

    if (!formData.reviewerPosition) {
      newErrors.reviewerPosition = 'Reviewer position is required';
    }

    if (!formData.nextReviewDate) {
      newErrors.nextReviewDate = 'Next review date is required';
    }

    if (formData.nextReviewDate && formData.reviewDate && formData.nextReviewDate <= formData.reviewDate) {
      newErrors.nextReviewDate = 'Next review date must be after review date';
    }

    // Check if at least one rating is provided
    const hasRatings = [
      formData.technicalSkills,
      formData.communication,
      formData.teamwork,
      formData.leadership,
      formData.problemSolving,
      formData.productivity,
      formData.attendance,
      formData.punctuality,
    ].some((r) => r > 0);

    if (!hasRatings) {
      newErrors.ratings = 'At least one performance rating is required';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('Please fix all errors before submitting');
      return;
    }

    const reviewData = {
      reviewNumber: generateReviewNumber(),
      ...formData,
      overallRating: calculateOverallRating(),
      achievements,
      goals,
      trainingNeeds,
      status: 'draft',
      createdDate: new Date().toISOString(),
    };

    console.log('Creating performance review:', reviewData);
    alert('Performance review created successfully!');
    router.push('/hr/performance');
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
              <h1 className="text-3xl font-bold text-gray-900">New Performance Review</h1>
              <p className="text-gray-600 mt-1">Create a new performance evaluation</p>
            </div>
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

        {/* Overall Rating Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 text-white shadow-lg mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 mb-1">Overall Rating (Auto-calculated)</p>
              <p className="text-4xl font-bold">{overallRating > 0 ? overallRating.toFixed(1) : '0.0'}/5.0</p>
            </div>
            <Star className="w-16 h-16 opacity-50" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Employee Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Employee Selection
            </h3>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmployeeSearch(!showEmployeeSearch)}
                    className={`w-full px-4 py-3 border rounded-lg text-left flex items-center justify-between ${
                      errors.employeeId ? 'border-red-500' : 'border-gray-300'
                    } ${selectedEmployee ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    {selectedEmployee ? (
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedEmployee.name} ({selectedEmployee.employeeId})
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedEmployee.department} - {selectedEmployee.position}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500">Click to select employee</span>
                    )}
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {showEmployeeSearch && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={employeeSearchQuery}
                            onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                            placeholder="Search by name, ID, or department..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {filteredEmployees.map((employee) => (
                          <button
                            key={employee.id}
                            type="button"
                            onClick={() => handleSelectEmployee(employee)}
                            className="w-full p-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-semibold text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-600">
                              {employee.employeeId} - {employee.department}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{employee.position}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.employeeId}
                  </p>
                )}
              </div>

              {selectedEmployee && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <label className="text-xs text-blue-700 font-medium">Department</label>
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {selectedEmployee.department}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-blue-700 font-medium">Position</label>
                    <p className="text-sm font-semibold text-blue-900 flex items-center gap-1 mt-1">
                      <Briefcase className="w-3 h-3" />
                      {selectedEmployee.position}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Period *
                </label>
                <input
                  type="text"
                  value={formData.reviewPeriod}
                  onChange={(e) => handleInputChange('reviewPeriod', e.target.value)}
                  placeholder="e.g., Q3 2025 (Jul - Sep)"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reviewPeriod ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.reviewPeriod && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reviewPeriod}
                  </p>
                )}
              </div>

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
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  value={formData.reviewerName}
                  onChange={(e) => handleInputChange('reviewerName', e.target.value)}
                  placeholder="Your name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reviewerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.reviewerName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reviewerName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reviewer Position *
                </label>
                <input
                  type="text"
                  value={formData.reviewerPosition}
                  onChange={(e) => handleInputChange('reviewerPosition', e.target.value)}
                  placeholder="Your position"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.reviewerPosition ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.reviewerPosition && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.reviewerPosition}
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
              Performance Ratings *
            </h3>
            {errors.ratings && (
              <p className="mb-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.ratings}
              </p>
            )}
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
                  {renderStarRating(item.field, formData[item.field as keyof FormData] as number)}
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Save className="w-4 h-4" />
              Create Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
