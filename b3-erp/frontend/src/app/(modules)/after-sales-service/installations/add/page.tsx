'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  Wrench,
  Save,
  X,
  Plus,
  Trash2,
  Search,
  Calendar,
  Clock,
  Users,
  Info,
  Eye,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: 'Lead' | 'Technician' | 'Helper';
}

interface Equipment {
  id: string;
  name: string;
  quantity: number;
  serialNumbers: string;
}

export default function AddInstallationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Form State
  const [jobNumber, setJobNumber] = useState('INS-2025-AUTO');
  const [status, setStatus] = useState<'Scheduled' | 'Draft'>('Draft');
  const [priority, setPriority] = useState<'Standard' | 'Urgent' | 'Express'>('Standard');

  // Customer Details
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Installation Details
  const [installationType, setInstallationType] = useState<'New Installation' | 'Replacement' | 'Upgrade'>('New Installation');
  const [installationAddress, setInstallationAddress] = useState('');

  // Schedule
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('4');

  // Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: '', role: 'Lead' }
  ]);

  // Equipment
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', name: '', quantity: 1, serialNumbers: '' }
  ]);

  // Additional Details
  const [siteRequirements, setSiteRequirements] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Site Survey
  const [requiresSiteSurvey, setRequiresSiteSurvey] = useState(false);
  const [siteSurveyCompleted, setSiteSurveyCompleted] = useState(false);
  const [siteSurveyDate, setSiteSurveyDate] = useState('');

  // Mock customer list
  const mockCustomers = [
    {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      contact: 'Rajesh Sharma',
      phone: '+91-98765-43210',
      email: 'rajesh.sharma@sharmakitchens.com',
      address: '123, MG Road, Koramangala, Bangalore - 560034'
    },
    {
      id: 'CUST-002',
      name: 'Prestige Developers',
      contact: 'Priya Menon',
      phone: '+91-98765-43211',
      email: 'priya@prestigedev.com',
      address: '45, Brigade Road, Mumbai - 400001'
    }
  ];

  // Mock engineers
  const mockEngineers = [
    'Rajesh Kumar', 'Amit Patel', 'Priya Singh', 'Suresh Reddy', 'Neha Sharma',
    'Vikram Rao', 'Anjali Gupta', 'Karthik Menon'
  ];

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { id: Date.now().toString(), name: '', role: 'Technician' }]);
    setToast({ message: 'Team member added', type: 'success' });
  };

  const removeTeamMember = (id: string) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
      setToast({ message: 'Team member removed', type: 'info' });
    }
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
    setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addEquipment = () => {
    setEquipment([...equipment, { id: Date.now().toString(), name: '', quantity: 1, serialNumbers: '' }]);
    setToast({ message: 'Equipment added', type: 'success' });
  };

  const removeEquipment = (id: string) => {
    if (equipment.length > 1) {
      setEquipment(equipment.filter(e => e.id !== id));
      setToast({ message: 'Equipment removed', type: 'info' });
    }
  };

  const updateEquipment = (id: string, field: keyof Equipment, value: any) => {
    setEquipment(equipment.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreviewModal(true);
  };

  const buildPayload = () => ({
    jobNumber,
    status,
    priority,
    customerId,
    customerName,
    contactPerson,
    contactPhone,
    contactEmail,
    installationType,
    installationAddress,
    scheduledDate,
    scheduledTime,
    estimatedDuration,
    teamMembers,
    equipment,
    siteRequirements,
    specialInstructions,
    internalNotes,
    requiresSiteSurvey,
    siteSurveyCompleted,
    siteSurveyDate,
    createdBy: 'system',
  });

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowPreviewModal(false);

    try {
      await AfterSalesPagesService.createInstallation(buildPayload());
      setToast({ message: 'Installation scheduled successfully!', type: 'success' });
      router.push('/after-sales-service/installations');
    } catch (err) {
      console.error('Create failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Tooltip = ({ content, id }: { content: string; id: string }) => (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setActiveTooltip(id)}
        onMouseLeave={() => setActiveTooltip(null)}
        className="text-gray-400 hover:text-gray-600 ml-1"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {activeTooltip === id && (
        <div className="absolute z-50 w-64 p-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-6">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertTriangle className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule Installation</h1>
            <p className="text-sm text-gray-500 mt-1">Create new installation job</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Schedule Installation'}
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input
                type="text"
                value={jobNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation Type <span className="text-red-500">*</span>
              </label>
              <select
                value={installationType}
                onChange={(e) => setInstallationType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="New Installation">New Installation</option>
                <option value="Replacement">Replacement</option>
                <option value="Upgrade">Upgrade</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
                <Tooltip
                  id="priority-tooltip"
                  content="Express: within 24 hours, Urgent: within 48 hours, Standard: 3-5 business days"
                />
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Standard">Standard</option>
                <option value="Urgent">Urgent</option>
                <option value="Express">Express (24h)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Customer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type to search customer..."
                required
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              {showCustomerDropdown && customerName && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {mockCustomers
                    .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setCustomerId(customer.id);
                          setCustomerName(customer.name);
                          setContactPerson(customer.contact);
                          setContactPhone(customer.phone);
                          setContactEmail(customer.email);
                          setInstallationAddress(customer.address);
                          setShowCustomerDropdown(false);
                          setToast({ message: `Customer ${customer.name} selected`, type: 'success' });
                        }}
                        className="w-full px-3 py-2 hover:bg-blue-50 cursor-pointer text-left transition-colors"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{customer.id}</span>
                          <span>•</span>
                          <Phone className="w-3 h-3" />
                          <span>{customer.phone}</span>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Installation Address <span className="text-red-500">*</span>
              </label>
              <textarea
                value={installationAddress}
                onChange={(e) => setInstallationAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                required
              />
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
          </div>
        </div>

        {/* Installation Team */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Installation Team</h2>
            <button
              type="button"
              onClick={addTeamMember}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={member.name}
                      onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Engineer</option>
                      {mockEngineers.map(eng => (
                        <option key={eng} value={eng}>{eng}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="Lead">Team Lead</option>
                      <option value="Technician">Technician</option>
                      <option value="Helper">Helper</option>
                    </select>
                  </div>
                </div>
                {teamMembers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTeamMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Equipment to Install */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Equipment to Install</h2>
            <button
              type="button"
              onClick={addEquipment}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          </div>

          <div className="space-y-3">
            {equipment.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Equipment Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateEquipment(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Commercial Gas Range - 6 Burner"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateEquipment(item.id, 'quantity', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Serial Numbers <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.serialNumbers}
                        onChange={(e) => updateEquipment(item.id, 'serialNumbers', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Comma-separated serial numbers"
                        required
                      />
                    </div>
                  </div>
                  {equipment.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEquipment(item.id)}
                      className="text-red-600 hover:text-red-700 mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Survey */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Site Survey</h2>

          <div className="space-y-2">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={requiresSiteSurvey}
                  onChange={(e) => setRequiresSiteSurvey(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Requires site survey before installation</span>
              </label>
            </div>

            {requiresSiteSurvey && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={siteSurveyCompleted}
                      onChange={(e) => setSiteSurveyCompleted(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Site survey completed</span>
                  </label>
                </div>
                {siteSurveyCompleted && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Survey Date</label>
                    <input
                      type="date"
                      value={siteSurveyDate}
                      onChange={(e) => setSiteSurveyDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Details</h2>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Requirements</label>
              <textarea
                value={siteRequirements}
                onChange={(e) => setSiteRequirements(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Power requirements, space constraints, access instructions, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Special handling, customer preferences, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Internal notes (not visible to customer)"
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Installation Scheduling Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Ensure site survey is completed for complex installations</li>
                <li>Assign team lead with appropriate expertise</li>
                <li>Verify all equipment serial numbers before scheduling</li>
                <li>Customer will receive installation confirmation via SMS and email</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Installation'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Eye className="h-7 w-7" />
                  Installation Preview
                </h2>
                <p className="text-sm text-blue-100 mt-1">Review details before scheduling</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Job Information */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Job Number</p>
                    <p className="text-base font-medium text-gray-900">{jobNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Installation Type</p>
                    <p className="text-base font-medium text-gray-900">{installationType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      priority === 'Express' ? 'bg-red-100 text-red-800' :
                      priority === 'Urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="text-base font-medium text-gray-900">{customerName || 'Not selected'}</p>
                    {customerId && <p className="text-xs text-gray-500">ID: {customerId}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="text-base font-medium text-gray-900">{contactPerson || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Contact Phone
                      </p>
                      <p className="text-base font-medium text-gray-900">{contactPhone || '-'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Installation Address
                    </p>
                    <p className="text-base font-medium text-gray-900">{installationAddress || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  Schedule
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Time
                    </p>
                    <p className="text-base font-medium text-gray-900">{scheduledTime || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-base font-medium text-gray-900">{estimatedDuration} hours</p>
                  </div>
                </div>
              </div>

              {/* Installation Team */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Installation Team ({teamMembers.length} members)
                </h3>
                <div className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                          member.role === 'Lead' ? 'bg-green-600' :
                          member.role === 'Technician' ? 'bg-blue-600' :
                          'bg-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name || 'Not assigned'}</p>
                          <p className="text-xs text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        member.role === 'Lead' ? 'bg-green-100 text-green-800' :
                        member.role === 'Technician' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-orange-600" />
                  Equipment to Install ({equipment.length} items)
                </h3>
                <div className="space-y-2">
                  {equipment.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name || 'Not specified'}</p>
                          <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">
                          Item #{index + 1}
                        </span>
                      </div>
                      {item.serialNumbers && (
                        <div className="mt-2 pt-2 border-t border-orange-200">
                          <p className="text-xs text-gray-600">Serial Numbers:</p>
                          <p className="text-xs font-mono text-gray-900 break-all">{item.serialNumbers}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Survey */}
              {requiresSiteSurvey && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Info className="h-5 w-5 text-yellow-600" />
                    Site Survey
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${siteSurveyCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-900">
                        {siteSurveyCompleted ? 'Site survey completed' : 'Site survey required'}
                      </span>
                    </div>
                    {siteSurveyCompleted && siteSurveyDate && (
                      <p className="text-sm text-gray-600 ml-6">
                        Survey Date: {new Date(siteSurveyDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {(siteRequirements || specialInstructions || internalNotes) && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Details</h3>
                  <div className="space-y-3">
                    {siteRequirements && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Site Requirements</p>
                        <p className="text-sm text-gray-600 mt-1">{siteRequirements}</p>
                      </div>
                    )}
                    {specialInstructions && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Special Instructions</p>
                        <p className="text-sm text-gray-600 mt-1">{specialInstructions}</p>
                      </div>
                    )}
                    {internalNotes && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Internal Notes</p>
                        <p className="text-sm text-gray-600 mt-1 italic">{internalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Scheduling...' : 'Confirm & Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
