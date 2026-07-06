'use client';

import { useState } from 'react';
import { AlertTriangle, FileText, Users, Clock, Save, Send, ArrowLeft, CheckCircle2, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ITILService } from '@/services/support.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

interface AffectedService {
  id: string;
  name: string;
  status: string;
}

interface IncidentForm {
  title: string;
  description: string;
  priority: string;
  severity: string;
  category: string;
  affectedServices: string[];
  reportedBy: string;
  contactEmail: string;
  contactPhone: string;
  impactedUsers: string;
  businessImpact: string;
  workaround: string;
  attachments: File[];
}

const CreateIncidentPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState<IncidentForm>({
    title: '',
    description: '',
    priority: 'P3',
    severity: 'Medium',
    category: 'Application',
    affectedServices: [],
    reportedBy: '',
    contactEmail: '',
    contactPhone: '',
    impactedUsers: '',
    businessImpact: '',
    workaround: '',
    attachments: [],
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const services: AffectedService[] = [
    { id: '1', name: 'ERP Application', status: 'Operational' },
    { id: '2', name: 'Database Server', status: 'Operational' },
    { id: '3', name: 'Email Service', status: 'Operational' },
    { id: '4', name: 'File Storage', status: 'Operational' },
    { id: '5', name: 'Authentication Service', status: 'Operational' },
    { id: '6', name: 'API Gateway', status: 'Operational' },
    { id: '7', name: 'Payment Gateway', status: 'Operational' },
    { id: '8', name: 'Backup Service', status: 'Operational' },
    { id: '9', name: 'Network Infrastructure', status: 'Operational' },
    { id: '10', name: 'VPN Service', status: 'Operational' },
  ];

  const priorityOptions = [
    { value: 'P0', label: 'P0 - Critical', color: 'text-red-700', bg: 'bg-red-50', description: 'Complete system outage' },
    { value: 'P1', label: 'P1 - High', color: 'text-orange-700', bg: 'bg-orange-50', description: 'Major functionality impaired' },
    { value: 'P2', label: 'P2 - Medium', color: 'text-yellow-700', bg: 'bg-yellow-50', description: 'Significant impact on operations' },
    { value: 'P3', label: 'P3 - Low', color: 'text-blue-700', bg: 'bg-blue-50', description: 'Minor inconvenience' },
  ];

  const severityOptions = [
    { value: 'Critical', label: 'Critical', description: 'System down, no workaround' },
    { value: 'High', label: 'High', description: 'Major features unavailable' },
    { value: 'Medium', label: 'Medium', description: 'Some features affected' },
    { value: 'Low', label: 'Low', description: 'Minor issue with workaround' },
  ];

  const categoryOptions = [
    'Application Error',
    'Performance Issue',
    'Data Issue',
    'Security Incident',
    'Network Problem',
    'Hardware Failure',
    'Access Issue',
    'Integration Failure',
    'Configuration Error',
    'Other',
  ];

  const handleInputChange = (field: keyof IncidentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Incident title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.reportedBy.trim()) newErrors.reportedBy = 'Reporter name is required';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (selectedServices.length === 0) newErrors.services = 'Please select at least one affected service';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      setErrors({ title: 'At least a title is required to save draft' });
      return;
    }
    alert('Incident saved as draft');
    router.push('/support/incidents/tracking');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      P0: 'critical',
      P1: 'high',
      P2: 'medium',
      P3: 'low',
    };
    const impactMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      Critical: 'critical',
      High: 'high',
      Medium: 'medium',
      Low: 'low',
    };

    const priority = priorityMap[formData.priority] ?? 'medium';
    const impact = impactMap[formData.severity] ?? 'medium';

    try {
      await ITILService.createIncident({
        title: formData.title,
        description: formData.description,
        priority,
        impact,
        urgency: impact,
        category: formData.category,
        status: 'open',
        reportedBy: formData.reportedBy || undefined,
        companyId: COMPANY_ID,
      });
      router.push('/support/incidents/tracking');
    } catch (err) {
      setErrors({ submit: 'Failed to create incident. Please try again.' });
      alert('Failed to create incident. Please try again.');
    }
  };

  const getPriorityStyle = (priority: string) => {
    const option = priorityOptions.find(p => p.value === priority);
    return option ? `${option.color} ${option.bg}` : '';
  };

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Incident</h1>
              <p className="text-gray-600">Report a new incident affecting system operations</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2 space-y-3">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Incident Details
              </h2>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Brief description of the incident"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the incident, including steps to reproduce, error messages, and any relevant context..."
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impacted Users <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.impactedUsers}
                      onChange={(e) => handleInputChange('impactedUsers', e.target.value)}
                      placeholder="e.g., All users, Finance team, 50+"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Impact
                  </label>
                  <textarea
                    value={formData.businessImpact}
                    onChange={(e) => handleInputChange('businessImpact', e.target.value)}
                    placeholder="Describe the business impact (e.g., revenue loss, customer impact, operational delays)..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workaround (if available)
                  </label>
                  <textarea
                    value={formData.workaround}
                    onChange={(e) => handleInputChange('workaround', e.target.value)}
                    placeholder="Describe any temporary workaround or alternative process..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Affected Services */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Affected Services <span className="text-red-500">*</span>
              </h2>
              {errors.services && <p className="text-red-500 text-sm mb-3">{errors.services}</p>}
              
              <div className="grid grid-cols-2 gap-3">
                {services.map(service => (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      {selectedServices.includes(service.id) && (
                        <CheckCircle2 className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reporter Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Reporter Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reported By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reportedBy}
                    onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                    placeholder="Your name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.reportedBy ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.reportedBy && <p className="text-red-500 text-sm mt-1">{errors.reportedBy}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="email@company.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                      errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-3">
            {/* Priority & Severity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Classification</h2>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {priorityOptions.map(option => (
                      <div
                        key={option.value}
                        onClick={() => handleInputChange('priority', option.value)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.priority === option.value
                            ? `${option.bg} border-current ${option.color}`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold mb-1">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {severityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 p-3">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Response Times
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">P0 (Critical):</span>
                  <span className="font-semibold text-red-700">15 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P1 (High):</span>
                  <span className="font-semibold text-orange-700">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P2 (Medium):</span>
                  <span className="font-semibold text-yellow-700">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P3 (Low):</span>
                  <span className="font-semibold text-blue-700">24 hours</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  Create Incident
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateIncidentPage;
