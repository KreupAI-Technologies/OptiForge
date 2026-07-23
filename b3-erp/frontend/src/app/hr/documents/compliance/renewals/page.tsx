'use client';

import { useState, useMemo, useEffect } from 'react';
import { Bell, Calendar, FileText, AlertCircle, X, Mail } from 'lucide-react';
import { DocumentManagementService } from '@/services/document-management.service';

interface RenewalReminder {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  documentType: string;
  category: 'personal' | 'statutory';
  expiryDate: string;
  daysUntilExpiry: number;
  uploadedOn: string;
  urgency: 'urgent' | 'soon' | 'upcoming';
  remindersSent: number;
  lastReminderDate?: string;
  fileUrl?: string;
  documentUrl?: string;
  email?: string;
}

export default function RenewalRemindersPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [mockRenewals, setMockRenewals] = useState<RenewalReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewRenewal, setViewRenewal] = useState<RenewalReminder | null>(null);
  const [contactRenewal, setContactRenewal] = useState<RenewalReminder | null>(null);

  const [cancelledRef] = useState<{ current: boolean }>({ current: false });

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await DocumentManagementService.getExpiringDocuments(30);
      const mapped: RenewalReminder[] = rows
        .filter((r) => r.expiryDate)
        .map((r) => {
          const days = calculateDaysUntilExpiry(r.expiryDate as string);
          const urgency: RenewalReminder['urgency'] =
            days <= 30 ? 'urgent' : days <= 60 ? 'soon' : 'upcoming';
          const category: RenewalReminder['category'] =
            r.documentCategory === 'statutory' ? 'statutory' : 'personal';
          return {
            id: r.id,
            employeeId: r.employeeId || r.employeeCode || '',
            employeeName: r.employeeName || '',
            department: r.department || '',
            documentType: r.documentName || r.documentType || '',
            category,
            expiryDate: r.expiryDate as string,
            daysUntilExpiry: days,
            uploadedOn: r.submittedDate || '',
            urgency,
            remindersSent: r.remindersSent || 0,
            lastReminderDate: r.lastReminderAt || undefined,
            fileUrl: (r as unknown as Record<string, unknown>).fileUrl as string | undefined,
            documentUrl: (r as unknown as Record<string, unknown>).documentUrl as string | undefined,
            email: (r as unknown as Record<string, unknown>).email as string | undefined,
          };
        })
        .filter((r) => r.daysUntilExpiry >= 0);
      if (!cancelledRef.current) setMockRenewals(mapped);
    } catch (err) {
      if (!cancelledRef.current) {
        setLoadError(
          err instanceof Error ? err.message : 'Failed to load renewal reminders',
        );
        setMockRenewals([]);
      }
    } finally {
      if (!cancelledRef.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    loadData();
    return () => {
      cancelledRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendReminder = async (id: string) => {
    try {
      await DocumentManagementService.sendComplianceReminder(id);
      await loadData();
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to send reminder',
      );
    }
  };

  const handleViewCurrentDocument = (renewal: RenewalReminder) => {
    const url = renewal.fileUrl || renewal.documentUrl;
    if (url) {
      window.open(url, '_blank');
    } else {
      setViewRenewal(renewal);
    }
  };

  const handleContactEmployee = (renewal: RenewalReminder) => {
    if (renewal.email) {
      window.location.href = `mailto:${renewal.email}?subject=Document%20Renewal%20Required%3A%20${encodeURIComponent(renewal.documentType)}&body=Dear%20${encodeURIComponent(renewal.employeeName)}%2C%0A%0AYour%20document%20%22${encodeURIComponent(renewal.documentType)}%22%20expires%20on%20${encodeURIComponent(new Date(renewal.expiryDate).toLocaleDateString('en-IN'))}.%20Please%20initiate%20the%20renewal%20process.%0A%0AThank%20you.`;
    } else {
      setContactRenewal(renewal);
    }
  };

  const handleResolve = async (id: string) => {
    if (!window.confirm('Mark this document compliant?')) return;
    try {
      await DocumentManagementService.resolveComplianceIssue(id, 'HR Admin');
      await loadData();
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Failed to resolve document',
      );
    }
  };

  const filteredRenewals = useMemo(() => {
    return mockRenewals.filter(renewal => {
      const matchesCategory = selectedCategory === 'all' || renewal.category === selectedCategory;
      const matchesUrgency = selectedUrgency === 'all' || renewal.urgency === selectedUrgency;
      return matchesCategory && matchesUrgency;
    });
  }, [mockRenewals, selectedCategory, selectedUrgency]);

  const stats = {
    total: mockRenewals.length,
    urgent: mockRenewals.filter(r => r.urgency === 'urgent').length,
    soon: mockRenewals.filter(r => r.urgency === 'soon').length,
    upcoming: mockRenewals.filter(r => r.urgency === 'upcoming').length
  };

  const urgencyColors = {
    urgent: 'bg-red-100 text-red-700',
    soon: 'bg-yellow-100 text-yellow-700',
    upcoming: 'bg-blue-100 text-blue-700'
  };

  const categoryLabels = {
    personal: 'Personal',
    statutory: 'Statutory'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Document Renewal Reminders</h1>
        <p className="text-sm text-gray-600 mt-1">Proactive reminders for upcoming document expirations</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading renewal reminders…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Renewals</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Urgent (≤30 days)</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.urgent}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Soon (31-60 days)</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.soon}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Upcoming (61-90 days)</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.upcoming}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="personal">Personal Documents</option>
              <option value="statutory">Statutory Documents</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Urgencies</option>
              <option value="urgent">Urgent (≤30 days)</option>
              <option value="soon">Soon (31-60 days)</option>
              <option value="upcoming">Upcoming (61-90 days)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRenewals.map(renewal => (
          <div key={renewal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{renewal.documentType}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${urgencyColors[renewal.urgency]}`}>
                    {renewal.urgency.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {categoryLabels[renewal.category]}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Renewal ID: {renewal.id}</p>
              </div>
            </div>

            <div className={`border rounded p-3 mb-2 ${
              renewal.urgency === 'urgent' ? 'bg-red-50 border-red-200' :
              renewal.urgency === 'soon' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-2">
                <Calendar className={`h-5 w-5 mt-0.5 ${
                  renewal.urgency === 'urgent' ? 'text-red-600' :
                  renewal.urgency === 'soon' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <p className={`text-sm font-medium ${
                    renewal.urgency === 'urgent' ? 'text-red-900' :
                    renewal.urgency === 'soon' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    Expires in {renewal.daysUntilExpiry} days on {new Date(renewal.expiryDate).toLocaleDateString('en-IN')}
                  </p>
                  <p className={`text-xs mt-1 ${
                    renewal.urgency === 'urgent' ? 'text-red-700' :
                    renewal.urgency === 'soon' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {renewal.urgency === 'urgent' && 'Immediate renewal action required'}
                    {renewal.urgency === 'soon' && 'Please initiate renewal process'}
                    {renewal.urgency === 'upcoming' && 'Renewal reminder for advance planning'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Employee</p>
                <p className="text-sm font-semibold text-gray-900">{renewal.employeeName}</p>
                <p className="text-xs text-gray-500">{renewal.employeeId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department</p>
                <p className="text-sm font-semibold text-gray-900">{renewal.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Originally Uploaded</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(renewal.uploadedOn).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reminders Sent</p>
                <p className="text-sm font-semibold text-gray-900">{renewal.remindersSent}</p>
              </div>
              {renewal.lastReminderDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Reminder</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(renewal.lastReminderDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button onClick={() => handleSendReminder(renewal.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                Send Renewal Reminder
              </button>
              <button onClick={() => handleViewCurrentDocument(renewal)} className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm">
                View Current Document
              </button>
              <button onClick={() => handleContactEmployee(renewal)} className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-sm">
                <Mail className="h-4 w-4" />
                Contact Employee
              </button>
              <button onClick={() => handleResolve(renewal.id)} className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium text-sm">
                Mark Resolved
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRenewals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No renewals due</h3>
          <p className="text-gray-600">No documents require renewal in the selected timeframe</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Renewal Reminder Schedule
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• <strong>Urgent (≤30 days):</strong> Weekly reminders sent automatically</li>
          <li>• <strong>Soon (31-60 days):</strong> Bi-weekly reminders sent automatically</li>
          <li>• <strong>Upcoming (61-90 days):</strong> Monthly advance notice sent</li>
          <li>• First reminder sent at 90 days before expiry</li>
          <li>• Escalation to manager if document not renewed within 15 days of expiry</li>
          <li>• Employees can request early renewal at any time</li>
        </ul>
      </div>

      {/* View Document modal (shown when no URL is stored) */}
      {viewRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Document Details</h2>
              <button onClick={() => setViewRenewal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Document Type</p>
                <p className="font-semibold text-gray-900">{viewRenewal.documentType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Category</p>
                <p className="font-semibold text-gray-900 capitalize">{viewRenewal.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Employee</p>
                <p className="font-semibold text-gray-900">{viewRenewal.employeeName}</p>
                <p className="text-xs text-gray-500">{viewRenewal.employeeId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Expiry Date</p>
                <p className="font-semibold text-gray-900">{new Date(viewRenewal.expiryDate).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">No file is stored for this document — the employee must upload the renewed copy.</p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewRenewal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Employee modal (shown when no email is stored) */}
      {contactRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact Employee</h2>
              <button onClick={() => setContactRenewal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                Please contact <strong>{contactRenewal.employeeName}</strong> ({contactRenewal.employeeId}) in the{' '}
                <strong>{contactRenewal.department}</strong> department regarding the renewal of{' '}
                <strong>{contactRenewal.documentType}</strong>, which expires on{' '}
                <strong>{new Date(contactRenewal.expiryDate).toLocaleDateString('en-IN')}</strong>.
              </p>
              <p className="text-xs text-gray-500">No email address is stored for this employee. Reach out through internal channels or send a manual reminder.</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { handleSendReminder(contactRenewal.id); setContactRenewal(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Bell className="h-4 w-4" />
                Send System Reminder
              </button>
              <button
                onClick={() => setContactRenewal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
