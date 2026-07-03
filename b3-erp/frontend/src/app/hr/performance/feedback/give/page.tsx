'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Search, ThumbsUp, AlertCircle, Lightbulb } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  department: string;
}

export default function GiveFeedbackPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'constructive' | 'suggestion'>('positive');
  const [category, setCategory] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  const mockEmployees: Employee[] = [
    { id: '1', code: 'KMF2451', name: 'Rahul Sharma', designation: 'Production Supervisor', department: 'Manufacturing' },
    { id: '2', code: 'KMF2452', name: 'Priya Patel', designation: 'Quality Inspector', department: 'Quality Assurance' },
    { id: '3', code: 'KMF2453', name: 'Amit Kumar', designation: 'Machine Operator', department: 'Manufacturing' },
    { id: '4', code: 'KMF2454', name: 'Sneha Reddy', designation: 'Production Coordinator', department: 'Manufacturing' },
    { id: '5', code: 'KMF2455', name: 'Vikram Singh', designation: 'Maintenance Engineer', department: 'Maintenance' },
    { id: '6', code: 'KMF2456', name: 'Anjali Nair', designation: 'QA Analyst', department: 'Quality Assurance' },
    { id: '7', code: 'KMF2457', name: 'Rajesh Iyer', designation: 'Production Lead', department: 'Manufacturing' },
    { id: '8', code: 'KMF2458', name: 'Deepa Gupta', designation: 'Assembly Technician', department: 'Manufacturing' }
  ];

  const [rows, setRows] = useState<Employee[]>(mockEmployees);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await HrTalentService.getPerformance<Employee>('feedback-target');
        if (!cancelled && data.length > 0) setRows(data);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredEmployees = rows.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeList(false);
    setSearchTerm('');
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !category || !feedbackText.trim()) {
      alert('Please fill all required fields');
      return;
    }

    alert('Feedback submitted successfully!');
    // Reset form
    setSelectedEmployee(null);
    setFeedbackType('positive');
    setCategory('');
    setFeedbackText('');
    setIsAnonymous(false);
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <ThumbsUp className="h-5 w-5" />;
      case 'constructive':
        return <AlertCircle className="h-5 w-5" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-300 text-green-700';
      case 'constructive':
        return 'bg-orange-50 border-orange-300 text-orange-700';
      case 'suggestion':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-teal-600" />
          Give Feedback
        </h1>
        <p className="text-gray-600 mt-2">Provide constructive feedback to colleagues</p>
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

      {/* Info Banner */}
      <div className="bg-teal-50 border-l-4 border-teal-500 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-3">
          <MessageSquare className="w-6 h-6 text-teal-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-teal-900">Feedback Guidelines</h3>
            <p className="text-sm text-teal-700 mt-1">
              Constructive feedback helps colleagues grow. Be specific, focus on behaviors not personality, and provide actionable suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="space-y-3">
          {/* Select Employee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="flex items-center gap-2">
                {selectedEmployee ? (
                  <div className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{selectedEmployee.name}</p>
                        <p className="text-sm text-gray-600">{selectedEmployee.code} • {selectedEmployee.designation}</p>
                      </div>
                      <button
                        onClick={() => setSelectedEmployee(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by name or employee code..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowEmployeeList(true);
                      }}
                      onFocus={() => setShowEmployeeList(true)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                )}
              </div>

              {/* Employee Dropdown */}
              {showEmployeeList && !selectedEmployee && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => handleSelectEmployee(emp)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-sm text-gray-600">{emp.code} • {emp.designation} • {emp.department}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No employees found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'positive', label: 'Positive', desc: 'Appreciation & Recognition' },
                { value: 'constructive', label: 'Constructive', desc: 'Areas for Improvement' },
                { value: 'suggestion', label: 'Suggestion', desc: 'Ideas & Recommendations' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setFeedbackType(type.value as any)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    feedbackType === type.value
                      ? getFeedbackTypeColor(type.value)
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {getFeedbackTypeIcon(type.value)}
                  </div>
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select category</option>
              <option value="quality_of_work">Quality of Work</option>
              <option value="productivity">Productivity</option>
              <option value="technical_skills">Technical Skills</option>
              <option value="teamwork">Teamwork & Collaboration</option>
              <option value="communication">Communication</option>
              <option value="initiative">Initiative & Innovation</option>
              <option value="leadership">Leadership</option>
              <option value="problem_solving">Problem Solving</option>
              <option value="safety">Safety Compliance</option>
              <option value="attendance">Attendance & Punctuality</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={6}
              placeholder={
                feedbackType === 'positive'
                  ? 'Example: I noticed how you helped the new team member learn the quality inspection process. Your patience and clear explanations made a real difference...'
                  : feedbackType === 'constructive'
                  ? 'Example: I observed that the machine setup took longer than usual. Consider reviewing the setup checklist to identify steps that could be optimized...'
                  : 'Example: I think implementing a daily team huddle could improve communication. We could use it to discuss production targets and any issues...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedbackText.length} / 500 characters
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="anonymous" className="text-sm font-medium text-gray-900 cursor-pointer">
                Submit as Anonymous Feedback
              </label>
              <p className="text-xs text-gray-600 mt-1">
                Your identity will not be shared with the recipient. Anonymous feedback is used for development purposes only.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
            >
              <Send className="h-4 w-4" />
              Submit Feedback
            </button>
            <button
              onClick={() => {
                setSelectedEmployee(null);
                setFeedbackType('positive');
                setCategory('');
                setFeedbackText('');
                setIsAnonymous(false);
              }}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Recent Feedback Given */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          Recent Feedback Given
        </h2>
        <div className="space-y-3">
          {[
            {
              id: '1', employee: 'Priya Patel', type: 'positive', category: 'Quality of Work',
              date: '2024-10-20', preview: 'Excellent attention to detail in the quality inspection process...'
            },
            {
              id: '2', employee: 'Amit Kumar', type: 'suggestion', category: 'Productivity',
              date: '2024-10-18', preview: 'Consider using the new automated tool for faster production...'
            },
            {
              id: '3', employee: 'Sneha Reddy', type: 'positive', category: 'Teamwork',
              date: '2024-10-15', preview: 'Great collaboration during the production rush last week...'
            }
          ].map(feedback => (
            <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{feedback.employee}</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      feedback.type === 'positive' ? 'bg-green-100 text-green-800' :
                      feedback.type === 'constructive' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{feedback.category}</p>
                  <p className="text-sm text-gray-500 mt-1">{feedback.preview}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(feedback.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-teal-900 mb-2">Effective Feedback Best Practices</h3>
        <ul className="text-sm text-teal-800 space-y-1">
          <li>• <strong>Be Specific:</strong> Focus on concrete examples and observable behaviors</li>
          <li>• <strong>Be Timely:</strong> Provide feedback soon after the observed behavior</li>
          <li>• <strong>Be Balanced:</strong> Acknowledge strengths while addressing development areas</li>
          <li>• <strong>Be Constructive:</strong> Focus on improvement, not criticism</li>
          <li>• <strong>Be Actionable:</strong> Include specific suggestions for improvement</li>
          <li>• <strong>Be Respectful:</strong> Use professional language and maintain a supportive tone</li>
        </ul>
      </div>
    </div>
  );
}
