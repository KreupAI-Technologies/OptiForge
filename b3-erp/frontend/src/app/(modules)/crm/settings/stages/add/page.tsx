'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Target, Palette, AlertCircle, Percent, Clock } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface StageFormData {
  name: string;
  description: string;
  probability: number;
  color: string;
  rottenDays: number;
  isActive: boolean;
}

const colors = [
  { name: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { name: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { name: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { name: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { name: 'green', label: 'Green', class: 'bg-green-500' },
  { name: 'red', label: 'Red', class: 'bg-red-500' },
  { name: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { name: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
];

export default function AddStagePage() {
  const router = useRouter();

  const [formData, setFormData] = useState<StageFormData>({
    name: '',
    description: '',
    probability: 50,
    color: 'blue',
    rottenDays: 14,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof StageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Stage name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (formData.rottenDays < 0) {
      newErrors.rottenDays = 'Rotten days cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        name: formData.name,
        description: formData.description,
        probability: formData.probability,
        color: formData.color,
        rottenDays: formData.rottenDays,
        isActive: formData.isActive,
      };
      await crmService.pipelineStages.create(payload);
      router.push('/crm/settings/stages');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create stage. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/crm/settings/stages');
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stages
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Deal Stage</h1>
        <p className="text-gray-600 mt-2">Create a new stage for your sales pipeline</p>
      </div>

      {submitError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {submitError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="">
        <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Discovery, Proposal, Negotiation"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe when a deal should be in this stage..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stage Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Stage Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probability (%) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.probability}
                    onChange={(e) => handleChange('probability', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
                    className={`w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.probability ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="text-gray-600">%</span>
                </div>
                {errors.probability && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.probability}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Likelihood of deals in this stage to close
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Rotten After (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.rottenDays}
                  onChange={(e) => handleChange('rottenDays', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.rottenDays ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="14"
                />
                {errors.rottenDays && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.rottenDays}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Days before a deal becomes rotten (0 = disabled)
                </p>
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Stage Color
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.name}
                  type="button"
                  onClick={() => handleChange('color', colorOption.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    formData.color === colorOption.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full ${colorOption.class}`}></div>
                  <span className="text-sm font-medium text-gray-700">{colorOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Stage Status</h3>
                <p className="text-sm text-gray-500">
                  {formData.isActive ? 'Stage will be active and can be used immediately' : 'Stage will be inactive'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isActive', !formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Creating…' : 'Create Stage'}
          </button>
        </div>
      </form>
    </div>
  );
}
