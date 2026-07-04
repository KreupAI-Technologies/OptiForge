'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import {
  Headphones,
  Edit,
  Download,
  Mail,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Phone,
  FileText,
  Package,
  Calendar,
  MessageSquare,
  Send,
  Paperclip
} from 'lucide-react';

interface Activity {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  performedBy: string;
}

export default function ViewServiceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'notes'>('details');
  const [newNote, setNewNote] = useState('');

  // Mock Service Request Data
  const ticket = {
    id: params.id,
    ticketNumber: 'SR-2025-0045',
    status: 'In Progress',
    priority: 'P2',

    // Customer
    customer: {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      contactPerson: 'Rajesh Sharma',
      phone: '+91-98765-43210',
      email: 'rajesh.sharma@sharmakitchens.com',
      address: '123, MG Road, Koramangala, Bangalore, Karnataka - 560034'
    },

    // Issue
    issueType: 'Breakdown',
    issueTitle: 'Commercial refrigerator not cooling properly',
    issueDescription: 'Customer reported that the 4-door commercial refrigerator is not maintaining proper temperature. Started yesterday evening. Temperature reading shows 12°C instead of required 2-4°C. Food items are at risk. Urgent attention required.',
    equipmentAffected: 'Commercial Refrigerator - 4 Door (Model: IR-4D-COMM)',

    // Service Details
    serviceAddress: '123, MG Road, Koramangala, Bangalore, Karnataka - 560034',
    preferredDate: '2025-02-18',
    preferredTime: 'Morning',

    // Assignment
    assignedTo: 'Rajesh Kumar',
    assignedDate: '2025-02-17',
    engineerPhone: '+91-98765-11111',

    // Dates & Times
    createdDate: '2025-02-17T10:30:00',
    responseDeadline: '2025-02-17T14:30:00',
    resolutionDeadline: '2025-02-18T10:30:00',
    firstResponseTime: '2025-02-17T11:45:00',

    // Channel & SLA
    channel: 'Phone',
    responseTimeSLA: 4,
    resolutionTimeSLA: 24,

    // Related
    linkedContract: 'AMC-2025-0001',
    linkedWarranty: '',

    // Progress
    estimatedCompletion: '2025-02-18',
    actualCompletion: '',

    createdBy: 'Customer Service',
    lastUpdated: '2025-02-17T15:30:00'
  };

  // Mock Activity Timeline
  // Activities + notes derived from the service-request record.
  const [activities, setActivities] = useState<Activity[]>([]);

  const [notes, setNotes] = useState<Array<{ id: string; timestamp: string; author: string; note: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const sr = (await AfterSalesPagesService.serviceRequest(params.id)) as any;
        const acts: Activity[] = (Array.isArray(sr?.activities) ? sr.activities : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          timestamp: r?.timestamp ?? r?.createdAt ?? '',
          action: r?.action ?? '',
          description: r?.description ?? '',
          performedBy: r?.performedBy ?? r?.by ?? '',
        }));
        const nts = (Array.isArray(sr?.notes) ? sr.notes : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          timestamp: r?.timestamp ?? r?.createdAt ?? '',
          author: r?.author ?? r?.by ?? '',
          note: r?.note ?? r?.text ?? '',
        }));
        if (!cancelled) { setActivities(acts); setNotes(nts); }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load service request');
          setActivities([]); setNotes([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (hours < 2) return { text: `${hours}h ${minutes}m left`, color: 'text-red-600' };
    if (hours < 4) return { text: `${hours}h ${minutes}m left`, color: 'text-orange-600' };
    return { text: `${hours}h ${minutes}m left`, color: 'text-gray-600' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Resolved': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-700';
      case 'P2': return 'bg-orange-100 text-orange-700';
      case 'P3': return 'bg-yellow-100 text-yellow-700';
      case 'P4': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const responseTimeRemaining = getTimeRemaining(ticket.responseDeadline);
  const resolutionTimeRemaining = getTimeRemaining(ticket.resolutionDeadline);
  const isResponseMet = ticket.firstResponseTime !== '';

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Created on {formatDateTime(ticket.createdDate)} via {ticket.channel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/after-sales-service/service-requests/edit/${ticket.id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* SLA Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Response SLA</span>
            {isResponseMet ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <Clock className="w-4 h-4 text-orange-600" />
            )}
          </div>
          {isResponseMet ? (
            <>
              <div className="text-2xl font-bold text-green-600">Met</div>
              <div className="text-xs text-gray-500 mt-1">
                Responded in {Math.floor((new Date(ticket.firstResponseTime).getTime() - new Date(ticket.createdDate).getTime()) / 3600000)}h
              </div>
            </>
          ) : (
            <>
              <div className={`text-2xl font-bold ${responseTimeRemaining.color}`}>
                {responseTimeRemaining.text}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Target: {ticket.responseTimeSLA}h
              </div>
            </>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Resolution SLA</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className={`text-2xl font-bold ${resolutionTimeRemaining.color}`}>
            {resolutionTimeRemaining.text}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: {ticket.resolutionTimeSLA}h
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Assigned Engineer</span>
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">{ticket.assignedTo}</div>
          <div className="text-xs text-gray-500 mt-1">
            {ticket.engineerPhone}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Ticket Details
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Activity Timeline ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'notes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Internal Notes ({notes.length})
          </button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Customer & Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Customer Name</div>
                  <div className="font-medium text-gray-900">{ticket.customer.name}</div>
                  <div className="text-xs text-gray-500">{ticket.customer.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Contact Person</div>
                  <div className="text-gray-900">{ticket.customer.contactPerson}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-gray-900">{ticket.customer.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-900">{ticket.customer.email}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Service Location</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="text-gray-900">{ticket.serviceAddress}</div>
                </div>
                {ticket.preferredDate && (
                  <>
                    <div>
                      <div className="text-sm text-gray-500">Preferred Date</div>
                      <div className="text-gray-900">{formatDate(ticket.preferredDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Preferred Time</div>
                      <div className="text-gray-900">{ticket.preferredTime}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Issue Details</h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-gray-500">Issue Type</div>
                  <div className="font-medium text-gray-900">{ticket.issueType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Equipment Affected</div>
                  <div className="font-medium text-gray-900">{ticket.equipmentAffected}</div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Issue Title</div>
                <div className="text-gray-900">{ticket.issueTitle}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Detailed Description</div>
                <div className="text-gray-700 bg-gray-50 p-3 rounded-md">{ticket.issueDescription}</div>
              </div>
            </div>
          </div>

          {/* Related Records */}
          {(ticket.linkedContract || ticket.linkedWarranty) && (
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Related Records</h2>
              <div className="grid grid-cols-2 gap-2">
                {ticket.linkedContract && (
                  <div>
                    <div className="text-sm text-gray-500">Service Contract</div>
                    <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                      {ticket.linkedContract}
                    </div>
                  </div>
                )}
                {ticket.linkedWarranty && (
                  <div>
                    <div className="text-sm text-gray-500">Warranty</div>
                    <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                      {ticket.linkedWarranty}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment Details */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Assignment Details</h2>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-sm text-gray-500">Assigned To</div>
                <div className="font-medium text-gray-900">{ticket.assignedTo}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Assigned Date</div>
                <div className="text-gray-900">{formatDate(ticket.assignedDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Engineer Contact</div>
                <div className="text-gray-900">{ticket.engineerPhone}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline Tab */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Activity Timeline</h2>
          <div className="space-y-2">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-900">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{activity.description}</div>
                  <div className="text-xs text-gray-500">By {activity.performedBy}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Internal Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-2">
          {/* Add Note Form */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add internal note..."
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                <Send className="w-4 h-4" />
                Add Note
              </button>
            </div>
          </div>

          {/* Existing Notes */}
          {notes.map((note) => (
            <div key={note.id} className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{note.author}</div>
                    <div className="text-xs text-gray-500">{note.timestamp}</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-700 ml-10">{note.note}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
