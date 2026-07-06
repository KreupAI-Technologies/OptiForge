'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Users,
  Target,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface CriteriaRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SegmentFormData {
  name: string;
  description: string;
  status: 'active' | 'inactive';
  criteria: CriteriaRule[];
}

const FIELD_OPTIONS = [
  { value: 'company_size', label: 'Company Size' },
  { value: 'annual_revenue', label: 'Annual Revenue' },
  { value: 'contract_value', label: 'Contract Value' },
  { value: 'active_duration', label: 'Active Duration' },
  { value: 'total_spent', label: 'Total Spent' },
  { value: 'purchase_frequency', label: 'Purchase Frequency' },
  { value: 'industry', label: 'Industry' },
  { value: 'location', label: 'Location' },
  { value: 'customer_status', label: 'Customer Status' },
];

const OPERATOR_OPTIONS = [
  { value: 'greater_than', label: 'Greater Than (>)' },
  { value: 'less_than', label: 'Less Than (<)' },
  { value: 'equals', label: 'Equals (=)' },
  { value: 'not_equals', label: 'Not Equals (≠)' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'in_list', label: 'In List' },
];

// Mock existing segment data
const emptySegmentData: SegmentFormData = {
  name: '',
  description: '',
  status: 'active',
  criteria: [],
};

export default function EditSegmentPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const segmentId = params.id as string;

  const [formData, setFormData] = useState<SegmentFormData>(emptySegmentData);
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!segmentId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.customerSegments.getById(segmentId);
        if (!cancelled && data) {
          const rawStatus = String((data as any)?.status ?? '').toLowerCase();
          const mappedStatus: SegmentFormData['status'] = rawStatus === 'inactive' ? 'inactive' : 'active';

          const rawCriteria = (data as any)?.criteria;
          let criteria: CriteriaRule[] = [];
          if (Array.isArray(rawCriteria)) {
            criteria = rawCriteria.map((c: any, idx: number) => {
              if (c && typeof c === 'object') {
                return {
                  id: String(c.id ?? idx + 1),
                  field: String(c.field ?? 'company_size'),
                  operator: String(c.operator ?? 'greater_than'),
                  value: c.value != null ? String(c.value) : '',
                };
              }
              return {
                id: String(idx + 1),
                field: 'company_size',
                operator: 'greater_than',
                value: typeof c === 'string' ? c : '',
              };
            });
          }

          const mapped: SegmentFormData = {
            name: (data as any)?.name ?? '',
            description: (data as any)?.description ?? '',
            status: mappedStatus,
            criteria,
          };
          setFormData(mapped);
          const count = Number((data as any)?.customerCount ?? (data as any)?.memberCount);
          if (Number.isFinite(count)) setEstimatedCount(count);
          setHasUnsavedChanges(false);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [segmentId]);

  const handleFieldChange = (field: keyof SegmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCriteriaChange = (id: string, field: keyof CriteriaRule, value: string) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.map(rule =>
        rule.id === id ? { ...rule, [field]: value } : rule
      ),
    }));
    setHasUnsavedChanges(true);
    // Simulate recalculating estimated count
    setEstimatedCount(Math.floor(Math.random() * 200) + 100);
  };

  const handleAddCriteria = () => {
    const newRule: CriteriaRule = {
      id: Date.now().toString(),
      field: 'company_size',
      operator: 'greater_than',
      value: '',
    };
    setFormData(prev => ({
      ...prev,
      criteria: [...prev.criteria, newRule],
    }));
    setHasUnsavedChanges(true);
  };

  const handleRemoveCriteria = (id: string) => {
    setFormData(prev => ({
      ...prev,
      criteria: prev.criteria.filter(rule => rule.id !== id),
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await crmService.customerSegments.update(segmentId, {
        ...formData,
        companyId: 'default-company-id',
      } as any);
      addToast({
        title: 'Segment Updated',
        message: `"${formData.name}" has been updated successfully`,
        variant: 'success'
      });
      setHasUnsavedChanges(false);
      router.push(`/crm/customers/segments/${segmentId}`);
    } catch (err) {
      addToast({
        title: 'Error',
        message: 'Failed to update segment. Please try again.',
        variant: 'error'
      });
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const getFieldLabel = (value: string) => {
    return FIELD_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  const getOperatorLabel = (value: string) => {
    return OPERATOR_OPTIONS.find(opt => opt.value === value)?.label || value;
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Segment
        </button>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Segment</h1>
            <p className="text-gray-600 mt-1">Modify segment criteria and settings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segment Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter segment name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter segment description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Criteria Builder */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Segment Criteria</h2>
              <button
                onClick={handleAddCriteria}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Rule</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.criteria.map((rule, index) => (
                <div key={rule.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {index > 0 && (
                    <div className="flex items-center justify-center w-16 pt-2">
                      <span className="text-sm font-medium text-gray-500">AND</span>
                    </div>
                  )}

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Field
                      </label>
                      <select
                        value={rule.field}
                        onChange={(e) => handleCriteriaChange(rule.id, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {FIELD_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Operator
                      </label>
                      <select
                        value={rule.operator}
                        onChange={(e) => handleCriteriaChange(rule.id, 'operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        {OPERATOR_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={rule.value}
                        onChange={(e) => handleCriteriaChange(rule.id, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter value"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveCriteria(rule.id)}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove rule"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {formData.criteria.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mb-3 text-gray-400" />
                  <p className="text-sm">No criteria defined yet</p>
                  <p className="text-xs mt-1">Click "Add Rule" to start building your segment</p>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Criteria Logic</p>
                  <p className="mt-1">All criteria rules are combined with AND logic. Customers must match ALL rules to be included in this segment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Criteria Summary</h2>
            <div className="space-y-2">
              {formData.criteria.map((rule, index) => (
                <div key={rule.id} className="flex items-center gap-2 text-sm">
                  {index > 0 && <span className="text-gray-500 font-medium">AND</span>}
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                    {getFieldLabel(rule.field)}
                  </span>
                  <span className="text-gray-600">
                    {getOperatorLabel(rule.operator)}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono">
                    {rule.value || '(empty)'}
                  </span>
                </div>
              ))}
              {formData.criteria.length === 0 && (
                <p className="text-sm text-gray-500 italic">No criteria defined</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview</h2>

            {/* Estimated Count */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Estimated Customers</span>
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {estimatedCount.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                <span>matching all criteria</span>
              </div>
            </div>

            {/* Status Preview */}
            <div className="mb-3 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Segment Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.status}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {formData.status === 'active'
                  ? 'This segment is currently active and will be updated automatically'
                  : 'This segment is inactive and will not be updated'}
              </p>
            </div>

            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Unsaved Changes</p>
                    <p className="mt-1 text-xs">Don't forget to save your changes before leaving this page.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
