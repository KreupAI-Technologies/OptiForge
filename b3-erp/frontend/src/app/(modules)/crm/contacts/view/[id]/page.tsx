'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  Globe,
  Clock,
  MessageSquare,
  FileText,
  PhoneCall,
  Video,
  Activity,
  ArrowRight,
  MapPin,
  UserCheck,
  Tag,
  Linkedin,
  Twitter,
  Facebook,
  MoreVertical
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface Contact {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  company: string;
  contactType: 'primary' | 'secondary' | 'billing' | 'technical';
  status: 'active' | 'inactive' | 'pending';
  lastContact: string;
  createdAt: string;
}

interface ContactActivity {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'video_call';
  title: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: {
    duration?: string;
    outcome?: string;
    attachments?: number;
  };
}

const emptyContact: Contact = {
  id: '',
  salutation: '',
  firstName: '',
  lastName: '',
  title: '',
  department: '',
  email: '',
  phone: '',
  mobile: '',
  company: '',
  contactType: 'primary',
  status: 'active',
  lastContact: '',
  createdAt: '',
};

const activityIcons = {
  call: PhoneCall,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  status_change: Activity,
  video_call: Video
};

const activityColors = {
  call: 'bg-blue-100 text-blue-600 border-blue-200',
  email: 'bg-purple-100 text-purple-600 border-purple-200',
  meeting: 'bg-green-100 text-green-600 border-green-200',
  note: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  status_change: 'bg-orange-100 text-orange-600 border-orange-200',
  video_call: 'bg-pink-100 text-pink-600 border-pink-200'
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const contactTypeColors = {
  primary: 'bg-blue-100 text-blue-700',
  secondary: 'bg-purple-100 text-purple-700',
  billing: 'bg-green-100 text-green-700',
  technical: 'bg-orange-100 text-orange-700',
};

const contactTypes = ['primary', 'secondary', 'billing', 'technical'] as const;
const contactStatuses = ['active', 'inactive', 'pending'] as const;

export default function ViewContactPage() {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id as string;
  const { addToast } = useToast();

  const [contact, setContact] = useState<Contact>(emptyContact);
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'communication' | 'details'>('overview');

  useEffect(() => {
    if (!contactId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await crmService.contacts.getById(contactId);
        if (!cancelled && data) {
          const rawType = String((data as any).contactType ?? '').toLowerCase();
          const contactType = (contactTypes as readonly string[]).includes(rawType)
            ? (rawType as Contact['contactType'])
            : 'primary';
          const rawStatus = String((data as any).status ?? '').toLowerCase();
          const isActiveFlag = (data as any).isActive;
          const status = (contactStatuses as readonly string[]).includes(rawStatus)
            ? (rawStatus as Contact['status'])
            : isActiveFlag === false
              ? 'inactive'
              : 'active';
          setContact({
            id: String(data.id ?? contactId),
            salutation: (data as any).salutation ?? '',
            firstName: data.firstName ?? '',
            lastName: data.lastName ?? '',
            title: data.position ?? (data as any).title ?? '',
            department: data.department ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            mobile: data.mobile ?? '',
            company: data.customerName ?? (data as any).company ?? (data as any).companyName ?? '',
            contactType,
            status,
            lastContact: data.lastContactDate ?? (data as any).lastContact ?? data.updatedAt ?? '',
            createdAt: data.createdAt ?? '',
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
  }, [contactId]);

  // Handler functions for contact actions
  const handleSendEmail = () => {
    addToast({
      title: 'Send Email',
      message: `Opening email compose for ${contact.firstName} ${contact.lastName}...`,
      variant: 'info'
    });
    // Future: router.push(`/crm/contacts/${contactId}/send-email`);
  };

  const handleCall = () => {
    addToast({
      title: 'Initiate Call',
      message: `Initiating call to ${contact.phone}...`,
      variant: 'info'
    });
    // Future: Integrate with phone system or router.push(`/crm/contacts/${contactId}/call`);
  };

  const handleMore = () => {
    addToast({
      title: 'More Actions',
      message: 'Opening additional contact actions menu...',
      variant: 'info'
    });
    // Future: Show dropdown menu with additional actions
  };

  const handleLogCall = () => {
    addToast({
      title: 'Log Call',
      message: 'Opening call log form...',
      variant: 'info'
    });
    // Future: router.push(`/crm/contacts/${contactId}/log-call`);
  };

  const handleScheduleMeeting = () => {
    addToast({
      title: 'Schedule Meeting',
      message: 'Opening meeting scheduler...',
      variant: 'info'
    });
    // Future: router.push(`/crm/contacts/${contactId}/schedule-meeting`);
  };

  const handleAddNote = () => {
    addToast({
      title: 'Add Note',
      message: 'Opening note creation form...',
      variant: 'info'
    });
    // Future: router.push(`/crm/contacts/${contactId}/add-note`);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'communication', name: 'Communication History', icon: MessageSquare },
    { id: 'details', name: 'Details', icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
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
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/crm/contacts')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Contacts</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Contact Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {contact.salutation} {contact.firstName} {contact.lastName}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{contact.title}</p>
                <p className="text-base text-gray-500">{contact.company}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${contactTypeColors[contact.contactType]}`}>
                    {contact.contactType.charAt(0).toUpperCase() + contact.contactType.slice(1)} Contact
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[contact.status]}`}>
                    {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/crm/contacts/edit/${contactId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </button>
              <button
                onClick={handleCall}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call</span>
              </button>
              <button
                onClick={handleMore}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <MoreVertical className="h-5 w-5" />
                <span>More</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Email</p>
              <a href={`mailto:${contact.email}`} className="text-sm font-semibold text-blue-900 hover:underline break-all">
                {contact.email}
              </a>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Phone</p>
              <a href={`tel:${contact.phone}`} className="text-sm font-semibold text-purple-900 hover:underline">
                {contact.phone}
              </a>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Type</p>
              <p className="text-sm font-semibold text-green-900 capitalize">{contact.contactType}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Status</p>
              <p className="text-sm font-semibold text-orange-900 capitalize">{contact.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                    <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline break-all">{contact.email}</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                    <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:underline">{contact.phone}</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Mobile</p>
                    <a href={`tel:${contact.mobile}`} className="text-sm text-blue-600 hover:underline">{contact.mobile}</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase">Address</p>
                    <p className="text-sm text-gray-900">456 Business Park Drive, Suite 200</p>
                    <p className="text-sm text-gray-900">San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Company Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{contact.company}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Department</p>
                  <p className="text-sm text-gray-900">{contact.department}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Industry</p>
                  <p className="text-sm text-gray-900">Kitchen Design & Manufacturing</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Website</p>
                  <a href="https://www.premierkitchen.com" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    www.premierkitchen.com
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Contact Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Type</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${contactTypeColors[contact.contactType]}`}>
                    {contact.contactType.charAt(0).toUpperCase() + contact.contactType.slice(1)} Contact
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Reports To</p>
                  <p className="text-sm font-semibold text-gray-900">Michael Chen</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Preferred Contact Method</p>
                  <p className="text-sm text-gray-900">Email</p>
                </div>
              </div>
            </div>

            {/* Key Dates */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Key Dates
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Created</p>
                  <p className="text-sm font-semibold text-gray-900">{contact.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Contact</p>
                  <p className="text-sm font-semibold text-gray-900">{contact.lastContact}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">Birthday</p>
                  <p className="text-sm text-gray-900">June 15, 1985</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication History Tab */}
        {activeTab === 'communication' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Communication Timeline</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleLogCall}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Log Call</span>
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={handleScheduleMeeting}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  <span>Add Note</span>
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-2">
              {activities
                .filter(activity => activity.contactId === contactId)
                .map((activity, index) => {
                  const ActivityIcon = activityIcons[activity.type];
                  const isLast = index === activities.filter(a => a.contactId === contactId).length - 1;

                  return (
                    <div key={activity.id} className="relative">
                      {/* Timeline connector */}
                      {!isLast && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300"></div>
                      )}

                      <div className="flex items-start space-x-4">
                        {/* Activity Icon */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${activityColors[activity.type]}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>

                        {/* Activity Content */}
                        <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-base font-bold text-gray-900">{activity.title}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                by {activity.performedBy} • {activity.timestamp}
                              </p>
                            </div>
                            {activity.metadata?.outcome && (
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                activity.metadata.outcome === 'Positive' || activity.metadata.outcome === 'Very Positive'
                                  ? 'bg-green-100 text-green-700'
                                  : activity.metadata.outcome === 'Interested'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {activity.metadata.outcome}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-700 mb-3">{activity.description}</p>

                          {/* Activity Metadata */}
                          {activity.metadata && (
                            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                              {activity.metadata.duration && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{activity.metadata.duration}</span>
                                </div>
                              )}
                              {activity.metadata.attachments && (
                                <div className="flex items-center space-x-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{activity.metadata.attachments} attachments</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-3">
            {/* All detailed sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Basic Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Full Name</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {contact.salutation} {contact.firstName} {contact.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Title/Position</p>
                    <p className="text-sm text-gray-900">{contact.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Department</p>
                    <p className="text-sm text-gray-900">{contact.department}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Assistant Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Assistant Name</p>
                    <p className="text-sm font-semibold text-gray-900">Emily Rodriguez</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Assistant Phone</p>
                    <a href="tel:+15552345678" className="text-sm text-blue-600 hover:underline">+1 (555) 234-5678</a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Social Media Profiles</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <a
                      href="https://linkedin.com/in/sarah-williams"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span className="text-sm font-medium">LinkedIn Profile</span>
                    </a>
                    <a
                      href="https://twitter.com/sarahwilliams"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-600"
                    >
                      <Twitter className="h-5 w-5" />
                      <span className="text-sm font-medium">Twitter Profile</span>
                    </a>
                    <a
                      href="https://facebook.com/sarah.williams"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-700 hover:text-blue-900"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="text-sm font-medium">Facebook Profile</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Preferences</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Preferred Contact Method</p>
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Best Time to Contact</p>
                    <p className="text-sm text-gray-900">Weekdays, 9 AM - 5 PM PST</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tags</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Tag className="h-3 w-3 mr-1" />
                      VIP
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      <Tag className="h-3 w-3 mr-1" />
                      Decision Maker
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <Tag className="h-3 w-3 mr-1" />
                      Procurement
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Key decision maker for kitchen procurement. Prefers detailed product specifications and competitive pricing.
                    Has a strong focus on quality and reliability. Currently evaluating suppliers for their Q4 budget allocation.
                    Interested in long-term partnership opportunities with volume discount pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
