'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/projectManagementService';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  MapPin,
  Paperclip,
  Download,
  Eye,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface BriefingAttachment {
  id: string;
  name: string;
  type: string;
}

interface BriefingAttendee {
  name: string;
  role: string;
  attended: boolean;
}

interface LayoutBriefing {
  id: string;
  briefingNumber: string;
  projectId: string;
  projectName: string;
  briefingDate: string;
  briefingTime: string;
  location: string;
  organizer: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'In Progress';
  attendees: BriefingAttendee[];
  agenda: string;
  minutes: string;
  actionItems: string;
  attachments: BriefingAttachment[];
  duration: string;
}


export default function LayoutBriefingsPage() {
  const [briefings, setBriefings] = useState<LayoutBriefing[]>([]);
  useEffect(() => {
    projectManagementService.listBriefings().then((rows) => {
      if (Array.isArray(rows)) setBriefings(rows as unknown as LayoutBriefing[]);
    });
  }, []);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBriefing, setSelectedBriefing] = useState<LayoutBriefing | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredBriefings = briefings.filter(
    (b) => statusFilter === 'All' || b.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Scheduled':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const stats = {
    total: briefings.length,
    completed: briefings.filter((b) => b.status === 'Completed').length,
    scheduled: briefings.filter((b) => b.status === 'Scheduled').length,
    inProgress: briefings.filter((b) => b.status === 'In Progress').length,
  };

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="px-3 py-2 space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link
                href="/project-management"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Layout Briefings & Meetings
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Phase 3: Conduct layout briefings with technical team
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Schedule Briefing
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Briefings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Briefings List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Technical Briefings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredBriefings.map((briefing) => (
              <div key={briefing.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(briefing.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {briefing.briefingNumber} - {briefing.projectName}
                        </h3>
                        <p className="text-sm text-gray-600">{briefing.projectId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {briefing.briefingDate}
                        </p>
                        <p className="text-xs text-gray-600">{briefing.briefingTime}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {briefing.location}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {briefing.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Attendees</p>
                        <p className="font-medium text-gray-900 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {briefing.attendees.length} people
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-gray-900 mb-1">Agenda:</p>
                      <p className="text-sm text-gray-700">{briefing.agenda}</p>
                    </div>

                    {briefing.attachments.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {briefing.attachments.length} attachment(s)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ml-6 flex flex-col items-end gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(briefing.status)}`}
                    >
                      {briefing.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBriefing(briefing);
                          setShowDetailsModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {briefing.status === 'Completed' && (
                        <button
                          className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                          title="Download Minutes"
                        >
                          <Download className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedBriefing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-3  w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Briefing Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Attendees</h3>
                  <div className="space-y-2">
                    {selectedBriefing.attendees.map((attendee, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{attendee.name}</p>
                          <p className="text-xs text-gray-500">{attendee.role}</p>
                        </div>
                        {attendee.attended ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedBriefing.minutes && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Meeting Minutes
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedBriefing.minutes}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBriefing.actionItems && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Action Items</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900 whitespace-pre-line">
                        {selectedBriefing.actionItems}
                      </p>
                    </div>
                  </div>
                )}

                {selectedBriefing.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
                    <div className="space-y-2">
                      {selectedBriefing.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">{attachment.type}</p>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">About Layout Briefings</h3>
              <p className="text-sm text-blue-700 mt-1">
                Step 3.5: Conduct layout briefings with technical team to review approved designs,
                share BOQ and drawings, discuss specifications, and assign technical drawing tasks.
                Minutes and action items are documented for tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
