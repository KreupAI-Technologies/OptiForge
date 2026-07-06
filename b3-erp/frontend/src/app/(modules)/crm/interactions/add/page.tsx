'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Headphones,
  AlertCircle,
  ThumbsUp,
  Calendar,
  Clock,
  User,
  Building2,
  FileText,
  Paperclip,
  Tag,
  Plus,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface InteractionFormData {
  // Step 1
  type: string;
  customer: string;
  contactPerson: string;
  dateTime: string;

  // Step 2
  subject: string;
  description: string;
  outcome: string;
  duration: string;
  location: string;

  // Step 3
  followUpRequired: boolean;
  followUpDate: string;
  assignedTo: string;
  tags: string[];
  relatedOpportunity: string;
  relatedOrder: string;
}

const customers = [
  'Modern Kitchen Designs Ltd',
  'Gourmet Restaurant Group',
  'Urban Living Spaces',
  'HomeTech Solutions',
  'Premium Kitchens Inc',
  'Elite Home Builders',
  'Luxury Interiors Co',
  'Smart Home Solutions',
];

const contactPersons = {
  'Modern Kitchen Designs Ltd': ['Sarah Johnson', 'Mike Thompson'],
  'Gourmet Restaurant Group': ['David Martinez', 'Emily Chen'],
  'Urban Living Spaces': ['Emily Davis', 'Robert Lee'],
  'HomeTech Solutions': ['Robert Wilson', 'Anna Smith'],
  'Premium Kitchens Inc': ['Lisa Anderson', 'Tom Brown'],
  'Elite Home Builders': ['James Martinez', 'Patricia White'],
  'Luxury Interiors Co': ['Patricia Brown', 'Kevin Jones'],
  'Smart Home Solutions': ['Richard Taylor', 'Susan Miller'],
};

export default function AddInteractionPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InteractionFormData>({
    type: 'call',
    customer: '',
    contactPerson: '',
    dateTime: '',
    subject: '',
    description: '',
    outcome: 'neutral',
    duration: '',
    location: '',
    followUpRequired: false,
    followUpDate: '',
    assignedTo: '',
    tags: [],
    relatedOpportunity: '',
    relatedOrder: '',
  });

  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const updateFormData = (field: keyof InteractionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        type: formData.type,
        customer: formData.customer || undefined,
        contactPerson: formData.contactPerson || undefined,
        dateTime: formData.dateTime || undefined,
        subject: formData.subject || undefined,
        description: formData.description || undefined,
        outcome: formData.outcome || undefined,
        duration: formData.duration || undefined,
        location: formData.location || undefined,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate || undefined,
        assignedTo: formData.assignedTo || undefined,
        tags: formData.tags,
        relatedOpportunity: formData.relatedOpportunity || undefined,
        relatedOrder: formData.relatedOrder || undefined,
      };
      await crmService.interactions.create(payload);
      addToast({
        title: 'Interaction Logged',
        message: `${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} with ${formData.customer} has been logged successfully`,
        variant: 'success'
      });
      router.push('/crm/interactions');
    } catch (err: any) {
      addToast({
        title: 'Error',
        message: err?.message || 'Failed to log interaction',
        variant: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'meeting', label: 'Meeting', icon: MessageSquare },
    { value: 'site_visit', label: 'Site Visit', icon: MapPin },
    { value: 'support', label: 'Support', icon: Headphones },
    { value: 'complaint', label: 'Complaint', icon: AlertCircle },
    { value: 'feedback', label: 'Feedback', icon: ThumbsUp },
  ];

  const outcomeOptions = [
    { value: 'positive', label: 'Positive', color: 'text-green-700' },
    { value: 'neutral', label: 'Neutral', color: 'text-gray-700' },
    { value: 'negative', label: 'Negative', color: 'text-red-700' },
    { value: 'follow_up_required', label: 'Follow-up Required', color: 'text-yellow-700' },
  ];

  const steps = [
    { id: 1, name: 'Type & Customer', icon: User },
    { id: 2, name: 'Details', icon: FileText },
    { id: 3, name: 'Follow-up', icon: Calendar },
  ];

  const availableContacts = formData.customer ? (contactPersons[formData.customer as keyof typeof contactPersons] || []) : [];

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Log New Interaction</h1>
                <p className="text-sm text-gray-600">Record customer interaction details</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-3 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center space-x-3 ${
                        currentStep === step.id
                          ? 'text-blue-600'
                          : currentStep > step.id
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          currentStep === step.id
                            ? 'border-blue-600 bg-blue-50'
                            : currentStep > step.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm hidden md:block">{step.name}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div
                          className={`h-1 rounded ${
                            currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {/* Step 1: Interaction Type & Customer */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Interaction Type & Customer</h2>
                </div>

                {/* Interaction Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interaction Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {typeOptions.map((option) => {
                      const TypeIcon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateFormData('type', option.value)}
                          className={`flex items-center space-x-2 p-3 border-2 rounded-lg transition-all ${
                            formData.type === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <TypeIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.customer}
                      onChange={(e) => {
                        updateFormData('customer', e.target.value);
                        updateFormData('contactPerson', '');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer} value={customer}>{customer}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.contactPerson}
                      onChange={(e) => updateFormData('contactPerson', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.customer}
                    >
                      <option value="">Select Contact Person</option>
                      {availableContacts.map(contact => (
                        <option key={contact} value={contact}>{contact}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date & Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={formData.dateTime}
                        onChange={(e) => updateFormData('dateTime', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Interaction Details */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Interaction Details</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => updateFormData('subject', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the interaction"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description / Notes</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed notes about the interaction, key points discussed, customer requirements, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outcome <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.outcome}
                      onChange={(e) => updateFormData('outcome', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {outcomeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => updateFormData('duration', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 30 mins, 2 hours"
                      />
                    </div>
                  </div>
                </div>

                {(formData.type === 'meeting' || formData.type === 'site_visit') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => updateFormData('location', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Meeting or visit location"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Follow-up & Additional Info */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Follow-up & Additional Info</h2>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.followUpRequired}
                      onChange={(e) => updateFormData('followUpRequired', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-yellow-900">Follow-up Required</span>
                  </label>
                </div>

                {formData.followUpRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={formData.followUpDate}
                          onChange={(e) => updateFormData('followUpDate', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => updateFormData('assignedTo', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Team Member</option>
                        <option value="sarah-johnson">Sarah Johnson</option>
                        <option value="michael-chen">Michael Chen</option>
                        <option value="david-park">David Park</option>
                        <option value="john-smith">John Smith</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Related Records</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Related Opportunity</label>
                      <select
                        value={formData.relatedOpportunity}
                        onChange={(e) => updateFormData('relatedOpportunity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Opportunity (Optional)</option>
                        <option value="opp-001">Modular Kitchen Project - $45K</option>
                        <option value="opp-002">Commercial Kitchen Setup - $120K</option>
                        <option value="opp-003">Home Interior Renovation - $75K</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Related Order</label>
                      <select
                        value={formData.relatedOrder}
                        onChange={(e) => updateFormData('relatedOrder', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Order (Optional)</option>
                        <option value="ord-001">Order #1001 - Kitchen Cabinets</option>
                        <option value="ord-002">Order #1002 - Countertops Installation</option>
                        <option value="ord-003">Order #1003 - Complete Kitchen Setup</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer with Save Button */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Interaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
