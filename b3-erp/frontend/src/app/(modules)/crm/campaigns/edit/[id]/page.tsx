'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Mail, Users, Activity, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';
import { crmService } from '@/services/crm.service';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'webinar' | 'content' | 'event';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  audience: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  owner: string;
  description?: string;
  goals?: string[];
  channels?: string[];
}

export default function CampaignEditPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.id as string;

  const [existingCampaign, setExistingCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as Campaign['type'],
    status: 'draft' as Campaign['status'],
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    audience: 0,
    owner: '',
    goals: [''] as string[],
    channels: [''] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.campaigns.getById(campaignId);
        if (!cancelled) {
          const allowedTypes = ['email', 'social', 'webinar', 'content', 'event'];
          const rawType = String((data as any)?.type ?? '').toLowerCase();
          const mappedType = (allowedTypes.includes(rawType) ? rawType : 'email') as Campaign['type'];

          const allowedStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed'];
          const rawStatus = String((data as any)?.status ?? '').toLowerCase();
          const mappedStatus = (allowedStatuses.includes(rawStatus) ? rawStatus : 'draft') as Campaign['status'];

          const goals = (data as any)?.objective ? [String((data as any).objective)] : [''];
          const channels = Array.isArray((data as any)?.tags) && (data as any).tags.length > 0
            ? (data as any).tags.map((t: any) => String(t))
            : [''];

          const mapped: Campaign = {
            id: String((data as any)?.id ?? campaignId),
            name: (data as any)?.name ?? '',
            type: mappedType,
            status: mappedStatus,
            startDate: (data as any)?.startDate ?? '',
            endDate: (data as any)?.endDate ?? undefined,
            budget: Number((data as any)?.budget ?? 0),
            spent: Number((data as any)?.actualCost ?? 0),
            audience: Number((data as any)?.totalLeads ?? 0),
            sent: Number((data as any)?.totalLeads ?? 0),
            delivered: Number((data as any)?.totalLeads ?? 0),
            opened: 0,
            clicked: 0,
            converted: Number((data as any)?.convertedLeads ?? 0),
            revenue: Number((data as any)?.actualRevenue ?? 0),
            owner: (data as any)?.assignedToName ?? '',
            description: (data as any)?.description ?? undefined,
            goals: goals.filter((g) => g !== ''),
            channels: channels.filter((c: string) => c !== ''),
          };
          setExistingCampaign(mapped);
          setFormData({
            name: mapped.name ?? '',
            type: mapped.type,
            status: mapped.status,
            description: mapped.description ?? '',
            startDate: mapped.startDate ?? '',
            endDate: mapped.endDate ?? '',
            budget: Number(mapped.budget ?? 0),
            audience: Number(mapped.audience ?? 0),
            owner: mapped.owner ?? '',
            goals: goals.length > 0 ? goals : [''],
            channels: channels.length > 0 ? channels : [''],
          });
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
  }, [campaignId]);

  if (!isLoading && !loadError && !existingCampaign) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-2">The campaign you're trying to edit doesn't exist.</p>
          <Link href="/crm/campaigns" className="text-blue-600 hover:underline">
            Return to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Campaign type is required';
    }

    if (!formData.status) {
      newErrors.status = 'Campaign status is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    if (formData.audience < 0) {
      newErrors.audience = 'Audience size cannot be negative';
    }

    if (!formData.owner.trim()) {
      newErrors.owner = 'Campaign owner is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const cleanedGoals = formData.goals.map((g) => g.trim()).filter((g) => g !== '');
      const cleanedChannels = formData.channels.map((c) => c.trim()).filter((c) => c !== '');
      const payload: any = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description || undefined,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        budget: Number(formData.budget) || 0,
        totalLeads: Number(formData.audience) || 0,
        assignedToName: formData.owner || undefined,
        objective: cleanedGoals.length > 0 ? cleanedGoals[0] : undefined,
        tags: cleanedChannels,
      };
      await crmService.campaigns.update(campaignId, payload);
      router.push(`/crm/campaigns/view/${campaignId}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const addGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, '']
    });
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter((_, i) => i !== index)
    });
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData({
      ...formData,
      goals: newGoals
    });
  };

  const addChannel = () => {
    setFormData({
      ...formData,
      channels: [...formData.channels, '']
    });
  };

  const removeChannel = (index: number) => {
    setFormData({
      ...formData,
      channels: formData.channels.filter((_, i) => i !== index)
    });
  };

  const updateChannel = (index: number, value: string) => {
    const newChannels = [...formData.channels];
    newChannels[index] = value;
    setFormData({
      ...formData,
      channels: newChannels
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      case 'webinar':
        return <Activity className="w-5 h-5" />;
      case 'content':
        return <BarChart3 className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
            <p className="text-gray-600 mt-1">Update campaign details and settings</p>
          </div>
        </div>
      </div>

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
      {saveError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-3">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>

              <div className="space-y-2">
                {/* Campaign Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter campaign name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Campaign Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Type *
                  </label>
                  <div className="relative">
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                        errors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="email">Email Campaign</option>
                      <option value="social">Social Media</option>
                      <option value="webinar">Webinar</option>
                      <option value="content">Content Marketing</option>
                      <option value="event">Event</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {getTypeIcon(formData.type)}
                    </div>
                  </div>
                  {errors.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter campaign description"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Campaign Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                  {errors.status && (
                    <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                  )}
                </div>

                {/* Campaign Owner */}
                <div>
                  <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Owner *
                  </label>
                  <input
                    type="text"
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.owner ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter owner name"
                  />
                  {errors.owner && (
                    <p className="text-sm text-red-600 mt-1">{errors.owner}</p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget ($) *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.budget ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.budget && (
                    <p className="text-sm text-red-600 mt-1">{errors.budget}</p>
                  )}
                </div>

                {/* Target Audience */}
                <div>
                  <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience Size *
                  </label>
                  <input
                    type="number"
                    id="audience"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: parseInt(e.target.value) || 0 })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.audience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.audience && (
                    <p className="text-sm text-red-600 mt-1">{errors.audience}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Campaign Goals */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Campaign Goals</h2>
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Goal
                </button>
              </div>

              <div className="space-y-3">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter campaign goal"
                    />
                    {formData.goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing Channels */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Marketing Channels</h2>
                <button
                  type="button"
                  onClick={addChannel}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Channel
                </button>
              </div>

              <div className="space-y-3">
                {formData.channels.map((channel, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={channel}
                      onChange={(e) => updateChannel(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter marketing channel"
                    />
                    {formData.channels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChannel(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Current Stats (Read-only) */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Performance</h2>
              <p className="text-sm text-gray-600 mb-2">These stats are read-only and reflect current campaign performance.</p>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Spent</p>
                  <p className="text-xl font-bold text-blue-600">${(existingCampaign?.spent ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">${(existingCampaign?.revenue ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Conversions</p>
                  <p className="text-xl font-bold text-gray-900">{existingCampaign?.converted ?? 0}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Messages Sent</p>
                  <p className="text-lg font-semibold text-gray-900">{(existingCampaign?.sent ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivered</p>
                  <p className="text-lg font-semibold text-gray-900">{(existingCampaign?.delivered ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Opened</p>
                  <p className="text-lg font-semibold text-gray-900">{(existingCampaign?.opened ?? 0).toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Clicked</p>
                  <p className="text-lg font-semibold text-gray-900">{(existingCampaign?.clicked ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  <span>{isSaving ? 'Saving…' : 'Save Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
