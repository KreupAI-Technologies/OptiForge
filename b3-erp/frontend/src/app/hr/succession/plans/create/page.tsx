'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, User, Briefcase, Target, Calendar, Save, AlertCircle } from 'lucide-react';
import { HrTalentService } from '@/services/hr-talent.service';

interface SuccessionPlanForm {
  positionTitle: string;
  department: string;
  currentHolder: string;
  currentHolderCode: string;
  location: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  retirementDate?: string;
  reason: 'retirement' | 'resignation' | 'promotion' | 'growth' | 'risk_mitigation';
  successors: {
    employeeName: string;
    employeeCode: string;
    readiness: 'ready_now' | '1_year' | '2_3_years' | '3_5_years';
    risk: 'low' | 'medium' | 'high';
    priority: number;
  }[];
  developmentNeeds: string[];
  timeline: string;
  notes: string;
}

export default function Page() {
  const router = useRouter();
  const [formData, setFormData] = useState<SuccessionPlanForm>({
    positionTitle: '',
    department: '',
    currentHolder: '',
    currentHolderCode: '',
    location: '',
    criticality: 'medium',
    reason: 'growth',
    successors: [],
    developmentNeeds: [],
    timeline: '',
    notes: ''
  });

  const [newSuccessor, setNewSuccessor] = useState({
    employeeName: '',
    employeeCode: '',
    readiness: 'ready_now' as const,
    risk: 'low' as const,
    priority: 1
  });

  const [newDevelopmentNeed, setNewDevelopmentNeed] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addSuccessor = () => {
    if (!newSuccessor.employeeName || !newSuccessor.employeeCode) {
      setErrors(['Please fill in all successor details']);
      return;
    }
    setFormData({
      ...formData,
      successors: [...formData.successors, { ...newSuccessor }]
    });
    setNewSuccessor({
      employeeName: '',
      employeeCode: '',
      readiness: 'ready_now',
      risk: 'low',
      priority: formData.successors.length + 2
    });
    setErrors([]);
  };

  const removeSuccessor = (index: number) => {
    const updated = formData.successors.filter((_, i) => i !== index);
    setFormData({ ...formData, successors: updated });
  };

  const addDevelopmentNeed = () => {
    if (!newDevelopmentNeed.trim()) return;
    setFormData({
      ...formData,
      developmentNeeds: [...formData.developmentNeeds, newDevelopmentNeed]
    });
    setNewDevelopmentNeed('');
  };

  const removeDevelopmentNeed = (index: number) => {
    const updated = formData.developmentNeeds.filter((_, i) => i !== index);
    setFormData({ ...formData, developmentNeeds: updated });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!formData.positionTitle) newErrors.push('Position title is required');
    if (!formData.department) newErrors.push('Department is required');
    if (!formData.currentHolder) newErrors.push('Current holder is required');
    if (!formData.location) newErrors.push('Location is required');
    if (formData.successors.length === 0) newErrors.push('At least one successor is required');
    if (!formData.timeline) newErrors.push('Timeline is required');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setErrors([]);
    try {
      await HrTalentService.createSuccession(formData, {
        recordType: 'plan',
        title: formData.positionTitle,
        status: 'active',
      });
      router.push('/hr/succession/plans/tracking');
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to save. Please try again.']);
      setSubmitting(false);
    }
  };

  const criticalityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const readinessColors = {
    ready_now: 'bg-green-100 text-green-700',
    '1_year': 'bg-blue-100 text-blue-700',
    '2_3_years': 'bg-yellow-100 text-yellow-700',
    '3_5_years': 'bg-orange-100 text-orange-700'
  };

  const riskColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Plus className="h-6 w-6 text-teal-600" />
          Create Succession Plan
        </h1>
        <p className="text-sm text-gray-600 mt-1">Create a new succession plan for critical positions</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Position Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Position Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position Title *</label>
              <input
                type="text"
                value={formData.positionTitle}
                onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Chief Technology Officer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Department</option>
                <option value="Executive">Executive</option>
                <option value="IT">IT</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="Production">Production</option>
                <option value="Quality">Quality</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Holder *</label>
              <input
                type="text"
                value={formData.currentHolder}
                onChange={(e) => setFormData({ ...formData, currentHolder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code *</label>
              <input
                type="text"
                value={formData.currentHolderCode}
                onChange={(e) => setFormData({ ...formData, currentHolderCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., EMP001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Location</option>
                <option value="Mumbai Office">Mumbai Office</option>
                <option value="Delhi Office">Delhi Office</option>
                <option value="Bangalore Office">Bangalore Office</option>
                <option value="Pune Office">Pune Office</option>
                <option value="Hyderabad Office">Hyderabad Office</option>
                <option value="Chennai Office">Chennai Office</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position Criticality</label>
              <select
                value={formData.criticality}
                onChange={(e) => setFormData({ ...formData, criticality: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Succession Reason</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="retirement">Retirement</option>
                <option value="resignation">Resignation</option>
                <option value="promotion">Promotion</option>
                <option value="growth">Growth Planning</option>
                <option value="risk_mitigation">Risk Mitigation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Transition Date</label>
              <input
                type="date"
                value={formData.retirementDate}
                onChange={(e) => setFormData({ ...formData, retirementDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Successors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Identified Successors *</h2>
          </div>

          {/* Add Successor Form */}
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Successor</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <input
                type="text"
                value={newSuccessor.employeeName}
                onChange={(e) => setNewSuccessor({ ...newSuccessor, employeeName: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Employee Name"
              />
              <input
                type="text"
                value={newSuccessor.employeeCode}
                onChange={(e) => setNewSuccessor({ ...newSuccessor, employeeCode: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Employee Code"
              />
              <select
                value={newSuccessor.readiness}
                onChange={(e) => setNewSuccessor({ ...newSuccessor, readiness: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ready_now">Ready Now</option>
                <option value="1_year">1 Year</option>
                <option value="2_3_years">2-3 Years</option>
                <option value="3_5_years">3-5 Years</option>
              </select>
              <select
                value={newSuccessor.risk}
                onChange={(e) => setNewSuccessor({ ...newSuccessor, risk: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <input
                type="number"
                min="1"
                value={newSuccessor.priority}
                onChange={(e) => setNewSuccessor({ ...newSuccessor, priority: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Priority"
              />
            </div>
            <button
              type="button"
              onClick={addSuccessor}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
            >
              Add Successor
            </button>
          </div>

          {/* Successors List */}
          {formData.successors.length > 0 ? (
            <div className="space-y-3">
              {formData.successors.map((successor, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded">
                          #{successor.priority}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900">{successor.employeeName}</h4>
                        <span className="text-xs text-gray-500">{successor.employeeCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${readinessColors[successor.readiness]}`}>
                          {successor.readiness.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${riskColors[successor.risk]}`}>
                          {successor.risk.charAt(0).toUpperCase() + successor.risk.slice(1)} Risk
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSuccessor(idx)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No successors added yet. Add at least one successor above.</p>
          )}
        </div>

        {/* Development Needs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Development Needs</h2>
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newDevelopmentNeed}
              onChange={(e) => setNewDevelopmentNeed(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDevelopmentNeed())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., Leadership training, Technical certification, etc."
            />
            <button
              type="button"
              onClick={addDevelopmentNeed}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm"
            >
              Add
            </button>
          </div>

          {formData.developmentNeeds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.developmentNeeds.map((need, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                  <span>{need}</span>
                  <button
                    type="button"
                    onClick={() => removeDevelopmentNeed(idx)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline and Notes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Timeline & Additional Notes</h2>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Implementation Timeline *</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Q1 2025, 6 months, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={4}
                placeholder="Any additional information about the succession plan..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Create Succession Plan'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.push('/hr/succession/plans/tracking')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
