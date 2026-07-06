'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  Headphones,
  Save,
  X,
  Search,
  AlertCircle,
  Clock,
  Calendar,
  Info
} from 'lucide-react';

export default function AddServiceRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [ticketNumber, setTicketNumber] = useState('SR-2025-AUTO');
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3' | 'P4'>('P3');
  const [channel, setChannel] = useState<'Phone' | 'Email' | 'Web Portal' | 'Mobile App' | 'WhatsApp' | 'Chat'>('Phone');

  // Customer Details
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Issue Details
  const [issueType, setIssueType] = useState<'Breakdown' | 'Maintenance' | 'Installation' | 'Consultation' | 'Other'>('Breakdown');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [equipmentAffected, setEquipmentAffected] = useState('');

  // Service Details
  const [serviceAddress, setServiceAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  // Related Records
  const [linkedContract, setLinkedContract] = useState('');
  const [linkedWarranty, setLinkedWarranty] = useState('');

  // SLA Information (Auto-calculated based on priority)
  const [responseTimeSLA, setResponseTimeSLA] = useState('8');
  const [resolutionTimeSLA, setResolutionTimeSLA] = useState('48');

  // Mock customer list
  const mockCustomers = [
    {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      contact: 'Rajesh Sharma',
      phone: '+91-98765-43210',
      email: 'rajesh.sharma@sharmakitchens.com',
      address: '123, MG Road, Koramangala, Bangalore, Karnataka - 560034'
    },
    {
      id: 'CUST-002',
      name: 'Prestige Developers',
      contact: 'Priya Menon',
      phone: '+91-98765-43211',
      email: 'priya@prestigedev.com',
      address: '45, Brigade Road, Mumbai, Maharashtra - 400001'
    },
    {
      id: 'CUST-003',
      name: 'Royal Restaurant Chain',
      contact: 'Amit Patel',
      phone: '+91-98765-43212',
      email: 'amit@royalrest.com',
      address: '78, Park Street, Delhi - 110001'
    },
  ];

  // SLA mapping based on priority
  const slaMapping = {
    P1: { response: 2, resolution: 6 },
    P2: { response: 4, resolution: 24 },
    P3: { response: 8, resolution: 48 },
    P4: { response: 24, resolution: 72 }
  };

  React.useEffect(() => {
    const sla = slaMapping[priority];
    setResponseTimeSLA(sla.response.toString());
    setResolutionTimeSLA(sla.resolution.toString());
  }, [priority]);

  const buildPayload = () => ({
    ticketNumber,
    priority,
    channel,
    customerId,
    customerName,
    contactPerson,
    contactPhone,
    contactEmail,
    issueType,
    issueTitle,
    issueDescription,
    equipmentAffected,
    serviceAddress,
    preferredDate,
    preferredTime,
    linkedContract,
    linkedWarranty,
    responseTimeSLA,
    resolutionTimeSLA,
    createdBy: 'system',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await AfterSalesPagesService.createServiceRequest(buildPayload());
      router.push('/after-sales-service/service-requests');
    } catch (err) {
      console.error('Create failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityInfo = (p: string) => {
    const info = {
      P1: { label: 'Critical', description: 'Complete system down, operations halted', color: 'bg-red-100 text-red-700 border-red-300' },
      P2: { label: 'High', description: 'Major functionality impaired, business impact', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      P3: { label: 'Medium', description: 'Moderate impact, workaround available', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      P4: { label: 'Low', description: 'Minor issue, minimal impact', color: 'bg-blue-100 text-blue-700 border-blue-300' }
    };
    return info[p as keyof typeof info];
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Service Request</h1>
            <p className="text-sm text-gray-500 mt-1">Log a new service request ticket</p>
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
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Number
              </label>
              <input
                type="text"
                value={ticketNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Channel <span className="text-red-500">*</span>
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="Web Portal">Web Portal</option>
                <option value="Mobile App">Mobile App</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Chat">Live Chat</option>
              </select>
            </div>
          </div>

          {/* Priority Info Banner */}
          <div className={`mt-4 p-3 rounded-lg border-2 ${getPriorityInfo(priority).color}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold mb-1">{getPriorityInfo(priority).label} Priority</div>
                <div className="text-sm">{getPriorityInfo(priority).description}</div>
                <div className="text-sm mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Response SLA: {responseTimeSLA}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Resolution SLA: {resolutionTimeSLA}h
                  </span>
                </div>
              </div>
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
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type to search customer..."
                required
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              {customerName && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {mockCustomers
                    .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setCustomerId(customer.id);
                          setCustomerName(customer.name);
                          setContactPerson(customer.contact);
                          setContactPhone(customer.phone);
                          setContactEmail(customer.email);
                          setServiceAddress(customer.address);
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.id} • {customer.phone}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <input
                type="text"
                value={customerId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name of person reporting issue"
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
                placeholder="+91-98765-43210"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@example.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Issue Details */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Issue Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Breakdown">Breakdown/Failure</option>
                <option value="Maintenance">Preventive Maintenance</option>
                <option value="Installation">Installation Support</option>
                <option value="Consultation">Technical Consultation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Affected
              </label>
              <input
                type="text"
                value={equipmentAffected}
                onChange={(e) => setEquipmentAffected(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Commercial Gas Range CGR-6B-PRO"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the issue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the issue in detail. Include symptoms, when it started, and any error messages..."
              required
            />
          </div>
        </div>

        {/* Service Location & Schedule */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Service Location & Schedule</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Complete address where service is required"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Service Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for immediate service</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time Slot
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Time</option>
                <option value="Morning">Morning (9 AM - 12 PM)</option>
                <option value="Afternoon">Afternoon (12 PM - 3 PM)</option>
                <option value="Evening">Evening (3 PM - 6 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Related Records */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Related Records (Optional)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Service Contract
              </label>
              <input
                type="text"
                value={linkedContract}
                onChange={(e) => setLinkedContract(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AMC-2025-XXXX"
              />
              <p className="text-xs text-gray-500 mt-1">Link to existing AMC/CMC contract if applicable</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Warranty
              </label>
              <input
                type="text"
                value={linkedWarranty}
                onChange={(e) => setLinkedWarranty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="WRN-2025-XXXX"
              />
              <p className="text-xs text-gray-500 mt-1">Link to active warranty if issue is covered</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Service Request Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>For P1 (Critical) issues, our team will respond within 2 hours</li>
                <li>Customer will receive ticket confirmation via email and SMS</li>
                <li>Engineer will be assigned based on location and expertise</li>
                <li>Track ticket status in real-time through the portal</li>
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
            {isSubmitting ? 'Creating Ticket...' : 'Create Service Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
