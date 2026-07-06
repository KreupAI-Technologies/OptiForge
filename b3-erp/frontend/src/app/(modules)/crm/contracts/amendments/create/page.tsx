'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, FileText, AlertCircle, DollarSign, Calendar, Users, Building2, Scale } from 'lucide-react';
import { crmService } from '@/services/crm.service';

export default function CreateContractAmendmentPage() {
  const router = useRouter();

  // Form state
  const [contractNumber, setContractNumber] = useState('');
  const [amendmentType, setAmendmentType] = useState<'value_change' | 'scope_change' | 'term_extension' | 'term_reduction' | 'pricing_adjustment' | 'service_modification'>('value_change');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Value change fields
  const [originalValue, setOriginalValue] = useState('');
  const [newValue, setNewValue] = useState('');

  // Term change fields
  const [originalEndDate, setOriginalEndDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Dates
  const [effectiveDate, setEffectiveDate] = useState('');

  // Impacted clauses
  const [impactedClauses, setImpactedClauses] = useState(['']);

  // Requirements
  const [requiresLegalReview, setRequiresLegalReview] = useState(false);
  const [requiresCustomerApproval, setRequiresCustomerApproval] = useState(true);

  // Assignment
  const [assignedTo, setAssignedTo] = useState('');
  const [requestedBy, setRequestedBy] = useState('');

  // Tags
  const [tags, setTags] = useState(['']);

  // Notes
  const [notes, setNotes] = useState('');

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const addClause = () => {
    setImpactedClauses([...impactedClauses, '']);
  };

  const removeClause = (index: number) => {
    if (impactedClauses.length > 1) {
      setImpactedClauses(impactedClauses.filter((_, i) => i !== index));
    }
  };

  const updateClause = (index: number, value: string) => {
    const updated = [...impactedClauses];
    updated[index] = value;
    setImpactedClauses(updated);
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const updateTag = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!contractNumber.trim()) newErrors.contractNumber = 'Contract number is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!reason.trim()) newErrors.reason = 'Reason is required';
    if (!effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!assignedTo.trim()) newErrors.assignedTo = 'Assigned to is required';
    if (!requestedBy.trim()) newErrors.requestedBy = 'Requested by is required';

    if (amendmentType === 'value_change' || amendmentType === 'pricing_adjustment') {
      if (!originalValue) newErrors.originalValue = 'Original value is required';
      if (!newValue) newErrors.newValue = 'New value is required';
    }

    if (amendmentType === 'term_extension' || amendmentType === 'term_reduction') {
      if (!originalEndDate) newErrors.originalEndDate = 'Original end date is required';
      if (!newEndDate) newErrors.newEndDate = 'New end date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        contractNumber,
        amendmentType,
        description,
        reason,
        priority,
        effectiveDate,
        assignedTo,
        requestedBy,
        requiresLegalReview,
        requiresCustomerApproval,
        impactedClauses: impactedClauses.filter((c) => c.trim()),
        tags: tags.filter((t) => t.trim()),
        notes,
        ...(originalValue ? { originalValue: parseFloat(originalValue) } : {}),
        ...(newValue ? { newValue: parseFloat(newValue) } : {}),
        ...(originalValue && newValue ? { valueImpact } : {}),
        ...(originalEndDate ? { originalEndDate } : {}),
        ...(newEndDate ? { newEndDate } : {}),
      };
      await crmService.contractAmendments.create(payload);
      router.push('/crm/contracts/amendments');
    } catch (err) {
      console.error('Failed to create amendment', err);
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/crm/contracts/amendments');
  };

  const valueImpact = originalValue && newValue ? parseFloat(newValue) - parseFloat(originalValue) : 0;

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-1 px-3 py-2 overflow-auto">
        <button
          onClick={() => router.push('/crm/contracts/amendments')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Amendments
        </button>

        <div className="mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Create Contract Amendment</h1>
          <p className="text-gray-600 mt-1">Modify an existing contract with formal amendment documentation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-3">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={contractNumber}
                      onChange={(e) => setContractNumber(e.target.value)}
                      placeholder="CNT-2024-001"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.contractNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.contractNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.contractNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amendment Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={amendmentType}
                      onChange={(e) => setAmendmentType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="value_change">Value Change</option>
                      <option value="scope_change">Scope Change</option>
                      <option value="term_extension">Term Extension</option>
                      <option value="term_reduction">Term Reduction</option>
                      <option value="pricing_adjustment">Pricing Adjustment</option>
                      <option value="service_modification">Service Modification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe the amendment..."
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Amendment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide detailed business justification for this amendment..."
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.reason ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Value/Term Changes */}
              {(amendmentType === 'value_change' || amendmentType === 'pricing_adjustment') && (
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Value Changes</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Original Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={originalValue}
                          onChange={(e) => setOriginalValue(e.target.value)}
                          placeholder="450000"
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.originalValue ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.originalValue && (
                        <p className="text-red-500 text-sm mt-1">{errors.originalValue}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Value <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder="575000"
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors.newValue ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.newValue && (
                        <p className="text-red-500 text-sm mt-1">{errors.newValue}</p>
                      )}
                    </div>
                  </div>

                  {originalValue && newValue && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      valueImpact > 0 ? 'bg-green-50 border border-green-200' :
                      valueImpact < 0 ? 'bg-red-50 border border-red-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <div className={`text-sm font-medium ${
                        valueImpact > 0 ? 'text-green-700' :
                        valueImpact < 0 ? 'text-red-700' :
                        'text-gray-700'
                      }`}>
                        Value Impact: {valueImpact > 0 && '+'}{valueImpact >= 0 ? '$' : '-$'}{Math.abs(valueImpact).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(amendmentType === 'term_extension' || amendmentType === 'term_reduction') && (
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Term Changes</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Original End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={originalEndDate}
                        onChange={(e) => setOriginalEndDate(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.originalEndDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.originalEndDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.originalEndDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.newEndDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.newEndDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.newEndDate}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Effective Date */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Effective Date</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    When should this amendment take effect? <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.effectiveDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.effectiveDate}</p>
                  )}
                </div>
              </div>

              {/* Impacted Clauses */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Impacted Contract Clauses</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addClause}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Add Clause
                  </button>
                </div>

                <div className="space-y-3">
                  {impactedClauses.map((clause, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={clause}
                        onChange={(e) => updateClause(index, e.target.value)}
                        placeholder="e.g., License Grant, Pricing Schedule, Service Level Agreement"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {impactedClauses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClause(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Assignment & Ownership</h2>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested By <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={requestedBy}
                      onChange={(e) => setRequestedBy(e.target.value)}
                      placeholder="Sarah Johnson"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.requestedBy ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.requestedBy && (
                      <p className="text-red-500 text-sm mt-1">{errors.requestedBy}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Michael Chen"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.assignedTo && (
                      <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tag
                  </button>
                </div>

                <div className="space-y-3">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        placeholder="e.g., Upsell, Capacity Increase, Strategic"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h2>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional information, special instructions, or context..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresLegalReview}
                      onChange={(e) => setRequiresLegalReview(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Requires Legal Review</div>
                      <div className="text-sm text-gray-600">Amendment needs legal team approval</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiresCustomerApproval}
                      onChange={(e) => setRequiresCustomerApproval(e.target.checked)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Requires Customer Approval</div>
                      <div className="text-sm text-gray-600">Customer must sign off on changes</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Amendment Guidelines */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
                <h3 className="font-semibold text-blue-900 mb-3">Amendment Guidelines</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Clearly describe all contract changes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Include business justification for changes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>List all affected contract clauses</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Specify effective date of changes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Obtain necessary approvals before execution</span>
                  </li>
                </ul>
              </div>

              {/* Form Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="font-semibold text-gray-900 mb-2">Actions</h3>
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                  >
                    {submitting ? 'Creating...' : 'Create Amendment'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
