'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, Plus, X, Clock, Target, TrendingUp } from 'lucide-react';
import { crmService } from '@/services/crm.service';

export default function EditSLAPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const slaId = params?.id as string;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    category: 'all' as 'technical' | 'billing' | 'general' | 'all',
    firstResponseTime: '',
    resolutionTime: '',
    businessHoursOnly: false,
    isActive: true,
  });

  const [appliesTo, setAppliesTo] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Performance metrics have no matching backend endpoint; kept as reference-only sample.
  const stats = {
    firstResponseCompliance: 93.3,
    resolutionCompliance: 88.9,
    avgFirstResponseTime: 12,
    avgResolutionTime: 3.5,
    totalTickets: 45,
    createdDate: '2024-01-10',
  };

  useEffect(() => {
    if (!slaId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const s = (await crmService.slas.getById(slaId)) as any;
        if (cancelled || !s) return;
        const categories: string[] = Array.isArray(s.customerCategories) ? s.customerCategories : [];
        setFormData({
          name: s.name ?? '',
          description: s.description ?? '',
          priority: (s.priority ?? 'medium') as 'critical' | 'high' | 'medium' | 'low',
          category: (s.category ?? (Array.isArray(s.ticketCategories) && s.ticketCategories.length === 1 ? s.ticketCategories[0] : 'all')) as 'technical' | 'billing' | 'general' | 'all',
          firstResponseTime: s.responseTimeHours != null ? String(Number(s.responseTimeHours) * 60) : '',
          resolutionTime: s.resolutionTimeHours != null ? String(Number(s.resolutionTimeHours)) : '',
          businessHoursOnly: Boolean(s.businessHoursOnly),
          isActive: s.isActive ?? (s.status ? s.status === 'active' : true),
        });
        setAppliesTo(categories.length ? categories : ['']);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load SLA policy.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.firstResponseTime) newErrors.firstResponseTime = 'First response time is required';
    if (!formData.resolutionTime) newErrors.resolutionTime = 'Resolution time is required';
    if (appliesTo.filter(a => a.trim()).length === 0) newErrors.appliesTo = 'At least one application is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        responseTimeHours: Number(formData.firstResponseTime) / 60,
        resolutionTimeHours: Number(formData.resolutionTime),
        businessHoursOnly: formData.businessHoursOnly,
        isActive: formData.isActive,
        customerCategories: appliesTo.map((a) => a.trim()).filter(Boolean),
      };
      await crmService.slas.update(slaId, payload);
      router.push('/crm/support/sla');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save SLA policy. Please try again.');
      setIsSubmitting(false);
    }
  };

  const addAppliesTo = () => {
    setAppliesTo([...appliesTo, '']);
  };

  const removeAppliesTo = (index: number) => {
    if (appliesTo.length > 1) {
      setAppliesTo(appliesTo.filter((_, i) => i !== index));
    }
  };

  const updateAppliesTo = (index: number, value: string) => {
    const newAppliesTo = [...appliesTo];
    newAppliesTo[index] = value;
    setAppliesTo(newAppliesTo);
  };

  const formatTime = (minutes: string) => {
    if (!minutes) return '-';
    const num = parseInt(minutes);
    if (num < 60) return `${num}m`;
    const hours = Math.floor(num / 60);
    const mins = num % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SLA Management
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit SLA Policy</h1>
          <p className="text-gray-600 mt-2">Update service level agreement targets and response times</p>
        </div>

        {isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading SLA policy…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {submitError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-3">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Critical Issues - Enterprise"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe when this SLA policy applies and its purpose"
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority Level *
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="general">General</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLA Targets */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">SLA Targets</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Response Time (minutes) *
                      </label>
                      <input
                        type="number"
                        value={formData.firstResponseTime}
                        onChange={(e) => setFormData({ ...formData, firstResponseTime: e.target.value })}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.firstResponseTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="15"
                      />
                      {errors.firstResponseTime && <p className="text-red-600 text-sm mt-1">{errors.firstResponseTime}</p>}
                      <p className="text-xs text-gray-500 mt-1">Time to first customer response</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resolution Time (hours) *
                      </label>
                      <input
                        type="number"
                        value={formData.resolutionTime}
                        onChange={(e) => setFormData({ ...formData, resolutionTime: e.target.value })}
                        min="1"
                        step="0.5"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.resolutionTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="4"
                      />
                      {errors.resolutionTime && <p className="text-red-600 text-sm mt-1">{errors.resolutionTime}</p>}
                      <p className="text-xs text-gray-500 mt-1">Time to issue resolution</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.businessHoursOnly}
                        onChange={(e) => setFormData({ ...formData, businessHoursOnly: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-blue-900">Business Hours Only</span>
                        <p className="text-xs text-blue-700">Calculate SLA times only during business hours (9 AM - 5 PM, Mon-Fri)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Applies To */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Applies To *</h2>
                  <button
                    type="button"
                    onClick={addAppliesTo}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Application
                  </button>
                </div>
                <div className="space-y-3">
                  {appliesTo.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateAppliesTo(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Enterprise Plan, Premium Support"
                      />
                      {appliesTo.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAppliesTo(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.appliesTo && <p className="text-red-600 text-sm mt-2">{errors.appliesTo}</p>}
                <p className="text-xs text-gray-500 mt-2">Specify customer tiers, plans, or segments this SLA applies to</p>
              </div>

              {/* Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Policy Status</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active Policy</span>
                    <p className="text-xs text-gray-500">Policy will be enforced immediately when active</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Current Performance */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Performance</h3>
                <div className="space-y-2">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Response Compliance</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{stats.firstResponseCompliance}%</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Resolution Compliance</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{stats.resolutionCompliance}%</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-medium text-gray-900">{stats.avgFirstResponseTime}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Resolution Time</span>
                      <span className="font-medium text-gray-900">{stats.avgResolutionTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Tickets</span>
                      <span className="font-medium text-gray-900">{stats.totalTickets}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policy Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Policy Summary</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Priority</div>
                    <div className="text-gray-900 capitalize font-medium">
                      {formData.priority}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Category</div>
                    <div className="text-gray-900 capitalize">
                      {formData.category === 'all' ? 'All Categories' : formData.category}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">First Response</div>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(formData.firstResponseTime)}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Resolution Time</div>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Target className="w-4 h-4" />
                      <span>{formData.resolutionTime ? `${formData.resolutionTime}h` : '-'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Coverage</div>
                    <div className="text-gray-900">
                      {formData.businessHoursOnly ? 'Business Hours Only' : '24/7'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Created</div>
                    <div className="text-gray-900">
                      {new Date(stats.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">Note</h4>
                    <p className="text-xs text-yellow-700">
                      Changes to SLA targets will apply to new tickets immediately. Existing tickets will continue using their original SLA targets.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
