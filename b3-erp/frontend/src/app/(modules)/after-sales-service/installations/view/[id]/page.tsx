'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  Wrench,
  Edit,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Package,
  MapPin,
  Phone,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export default function ViewInstallationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'documents'>('details');

  // Fallback Installation Data (defaults so every field the JSX reads is defined)
  const FALLBACK = {
    id: params.id,
    jobNumber: 'INS-2025-0012',
    status: 'In Progress',
    installationType: 'New Installation',
    priority: 'Standard',
    progress: 65,

    // Customer
    customer: {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      contactPerson: 'Rajesh Sharma',
      phone: '+91-98765-43210',
      email: 'rajesh.sharma@sharmakitchens.com',
      address: '123, MG Road, Koramangala, Bangalore - 560034'
    },

    // Schedule
    scheduledDate: '2025-02-18',
    scheduledTime: '09:00',
    estimatedDuration: 6,
    actualStartTime: '2025-02-18T09:15:00',
    estimatedCompletion: '2025-02-18T15:00:00',

    // Team
    team: [
      { name: 'Rajesh Kumar', role: 'Lead', phone: '+91-98765-11111' },
      { name: 'Amit Patel', role: 'Technician', phone: '+91-98765-22222' },
      { name: 'Vikram Rao', role: 'Helper', phone: '+91-98765-33333' }
    ],

    // Equipment
    equipment: [
      { name: 'Commercial Gas Range - 6 Burner', quantity: 2, serialNumbers: 'CGR-2025-001, CGR-2025-002', installed: true },
      { name: 'Industrial Refrigerator - 4 Door', quantity: 1, serialNumbers: 'IR4D-2025-015', installed: true },
      { name: 'Commercial Deep Fryer', quantity: 1, serialNumbers: 'CDF-2025-008', installed: false }
    ],

    // Site Details
    requiresSiteSurvey: true,
    siteSurveyCompleted: true,
    siteSurveyDate: '2025-02-10',
    siteRequirements: 'Three-phase power connection required. Adequate ventilation needed for gas equipment. Floor reinforcement completed.',
    specialInstructions: 'Access restricted before 9 AM. Parking available in basement. Contact security for access.',

    // Progress Milestones
    milestones: [
      { id: 1, title: 'Site preparation', status: 'Completed', completedAt: '2025-02-18 09:30' },
      { id: 2, title: 'Equipment positioning', status: 'Completed', completedAt: '2025-02-18 10:45' },
      { id: 3, title: 'Gas connection', status: 'Completed', completedAt: '2025-02-18 12:00' },
      { id: 4, title: 'Electrical wiring', status: 'In Progress', completedAt: null },
      { id: 5, title: 'Testing & commissioning', status: 'Pending', completedAt: null },
      { id: 6, title: 'Customer training', status: 'Pending', completedAt: null }
    ],

    createdDate: '2025-02-10',
    createdBy: 'Sales Team',
    lastUpdated: '2025-02-18T13:30:00'
  };

  const [installation, setInstallation] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await AfterSalesPagesService.installation(String(params.id));
        if (!cancelled && data && typeof data === 'object') {
          setInstallation(prev => ({ ...prev, ...data }));
        }
      } catch {
        // keep fallback on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'On Hold': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'In Progress': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Pending': return <Clock className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{installation.jobNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(installation.status)}`}>
              {installation.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {installation.installationType} • Scheduled for {formatDate(installation.scheduledDate)} at {installation.scheduledTime}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/after-sales-service/installations/edit/${installation.id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Installation Progress</span>
          <span className="text-sm font-bold text-gray-900">{installation.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${installation.progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Started: {formatDateTime(installation.actualStartTime)} • ETA: {formatDateTime(installation.estimatedCompletion)}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Installation Details
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'progress'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Progress Tracking
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Customer & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Customer Name</div>
                  <div className="font-medium text-gray-900">{installation.customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact Person</div>
                  <div className="text-gray-900">{installation.customer.contactPerson}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-gray-900">{installation.customer.phone}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Installation Location</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="text-gray-900">{installation.customer.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Installation Team */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Installation Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {installation.team.map((member, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600">{member.role}</span>
                  </div>
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Equipment to Install</h2>
            <div className="space-y-3">
              {installation.equipment.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">Qty: {item.quantity} • Serial: {item.serialNumbers}</div>
                  </div>
                  {item.installed ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      Installed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Site Details */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Site Details</h2>
            <div className="space-y-2">
              {installation.requiresSiteSurvey && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Site Survey Completed</span>
                  </div>
                  <div className="text-xs text-green-700">Completed on {formatDate(installation.siteSurveyDate)}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Site Requirements</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{installation.siteRequirements}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Special Instructions</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{installation.specialInstructions}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Installation Milestones</h2>
          <div className="space-y-2">
            {installation.milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.status === 'Completed' ? 'bg-green-100' :
                    milestone.status === 'In Progress' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    {getMilestoneIcon(milestone.status)}
                  </div>
                  {index < installation.milestones.length - 1 && (
                    <div className={`w-0.5 h-full my-2 ${
                      milestone.status === 'Completed' ? 'bg-green-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="font-medium text-gray-900">{milestone.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {milestone.status === 'Completed' && milestone.completedAt && (
                      <span>Completed at {milestone.completedAt}</span>
                    )}
                    {milestone.status === 'In Progress' && <span>Currently in progress...</span>}
                    {milestone.status === 'Pending' && <span>Pending</span>}
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    milestone.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    milestone.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-red-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Installation Checklist</div>
                <div className="text-xs text-gray-500">PDF • 1.2 MB</div>
              </div>
              <Download className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Site Photos</div>
                <div className="text-xs text-gray-500">ZIP • 8.5 MB</div>
              </div>
              <Download className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Equipment Manuals</div>
                <div className="text-xs text-gray-500">PDF • 15.3 MB</div>
              </div>
              <Download className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Warranty Certificates</div>
                <div className="text-xs text-gray-500">PDF • 2.1 MB</div>
              </div>
              <Download className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
