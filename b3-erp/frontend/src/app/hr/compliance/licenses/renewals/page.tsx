'use client';

import { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, Clock, FileText, Upload, RefreshCw } from 'lucide-react';
import { HrComplianceDocsService, ComplianceLicense } from '@/services/hr-compliance-docs.service';

interface LicenseRenewal {
  id: string;
  licenseName: string;
  licenseNumber: string;
  currentExpiryDate: string;
  renewalDueDate: string;
  renewalStatus: 'upcoming' | 'in_progress' | 'submitted' | 'completed' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  authority: string;
  assignedTo: string;
  renewalCost?: number;
  documentsRequired: string[];
  submissionDeadline: string;
  applicationNumber?: string;
  newExpiryDate?: string;
  remarks?: string;
}

export default function Page() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [renewals, setRenewals] = useState<LicenseRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getLicenses('renewal');
        if (!active) return;
        const mapped: LicenseRenewal[] = rows.map((r: ComplianceLicense) => ({
          id: r.id,
          licenseName: r.name || '',
          licenseNumber: r.number || '',
          currentExpiryDate: r.expiryDate || '',
          renewalDueDate: r.renewalDueDate || '',
          renewalStatus: (r.status as LicenseRenewal['renewalStatus']) || 'upcoming',
          priority: (r.priority as LicenseRenewal['priority']) || 'medium',
          authority: r.authority || '',
          assignedTo: r.assignedTo || '',
          renewalCost: r.renewalCost,
          documentsRequired: r.documentsRequired || [],
          submissionDeadline: r.submissionDeadline || '',
          applicationNumber: r.applicationNumber,
          newExpiryDate: r.newExpiryDate,
          remarks: r.remarks,
        }));
        setRenewals(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load renewals');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockRenewals: LicenseRenewal[] = [
    {
      id: '1',
      licenseName: 'Shops & Establishments License',
      licenseNumber: 'SE/MH/2024/67890',
      currentExpiryDate: '2025-03-31',
      renewalDueDate: '2025-02-28',
      renewalStatus: 'in_progress',
      priority: 'high',
      authority: 'Labour Commissioner, Maharashtra',
      assignedTo: 'Priya Sharma',
      renewalCost: 5000,
      documentsRequired: ['Application Form', 'PAN Card', 'Address Proof', 'Previous License Copy'],
      submissionDeadline: '2025-02-28',
      remarks: 'Documents being prepared'
    },
    {
      id: '2',
      licenseName: 'Professional Tax Registration',
      licenseNumber: 'PT/MH/12345/2024',
      currentExpiryDate: '2025-01-31',
      renewalDueDate: '2025-01-15',
      renewalStatus: 'upcoming',
      priority: 'high',
      authority: 'Sales Tax Department, Maharashtra',
      assignedTo: 'Neha Desai',
      renewalCost: 2500,
      documentsRequired: ['Renewal Application', 'Payment Proof', 'Employee List'],
      submissionDeadline: '2025-01-15',
      remarks: 'Renewal to be initiated in January'
    },
    {
      id: '3',
      licenseName: 'Fire Safety Certificate',
      licenseNumber: 'FSC/MH/2024/98765',
      currentExpiryDate: '2025-03-19',
      renewalDueDate: '2025-02-19',
      renewalStatus: 'upcoming',
      priority: 'high',
      authority: 'Mumbai Fire Brigade',
      assignedTo: 'Suresh Mehta',
      renewalCost: 15000,
      documentsRequired: ['Inspection Report', 'Fire Safety Equipment Certificates', 'Building Plan'],
      submissionDeadline: '2025-02-19',
      remarks: 'Fire inspection scheduled'
    },
    {
      id: '4',
      licenseName: 'Factory License',
      licenseNumber: 'FL/MH/2024/12345',
      currentExpiryDate: '2026-01-14',
      renewalDueDate: '2025-11-14',
      renewalStatus: 'upcoming',
      priority: 'medium',
      authority: 'Chief Inspector of Factories, Maharashtra',
      assignedTo: 'Rajesh Kumar',
      renewalCost: 25000,
      documentsRequired: ['Factory Plan', 'Safety Inspection Report', 'Worker List', 'Previous License'],
      submissionDeadline: '2025-11-14',
      remarks: 'Renewal due in 12 months'
    },
    {
      id: '5',
      licenseName: 'Contract Labour License',
      licenseNumber: 'CL/MH/2023/45678',
      currentExpiryDate: '2026-06-09',
      renewalDueDate: '2026-04-09',
      renewalStatus: 'upcoming',
      priority: 'low',
      authority: 'Regional Labour Commissioner',
      assignedTo: 'Amit Patel',
      renewalCost: 10000,
      documentsRequired: ['Application Form', 'Contractor Details', 'Worker List', 'Wage Register'],
      submissionDeadline: '2026-04-09',
      remarks: 'Renewal due in 18 months'
    }
  ];

  const sourceRenewals = renewals.length > 0 ? renewals : mockRenewals;

  const filteredRenewals = useMemo(() => {
    return sourceRenewals.filter(renewal => {
      const matchesStatus = selectedStatus === 'all' || renewal.renewalStatus === selectedStatus;
      const matchesPriority = selectedPriority === 'all' || renewal.priority === selectedPriority;
      const renewalMonth = new Date(renewal.renewalDueDate).getMonth();
      const matchesMonth = selectedMonth === -1 || renewalMonth === selectedMonth;
      return matchesStatus && matchesPriority && matchesMonth;
    });
  }, [selectedStatus, selectedPriority, selectedMonth, sourceRenewals]);

  const stats = {
    upcoming: sourceRenewals.filter(r => r.renewalStatus === 'upcoming').length,
    inProgress: sourceRenewals.filter(r => r.renewalStatus === 'in_progress').length,
    submitted: sourceRenewals.filter(r => r.renewalStatus === 'submitted').length,
    overdue: sourceRenewals.filter(r => r.renewalStatus === 'overdue').length
  };

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700 border-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    submitted: 'bg-purple-100 text-purple-700 border-purple-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    overdue: 'bg-red-100 text-red-700 border-red-300'
  };

  const statusIcons = {
    upcoming: Clock,
    in_progress: RefreshCw,
    submitted: Upload,
    completed: CheckCircle,
    overdue: AlertCircle
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  const months = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.floor((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          License Renewal Tracking
        </h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage license renewal timelines and submissions</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading renewals…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Upcoming</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.upcoming}</p>
              <p className="text-xs text-blue-700 mt-1">Due soon</p>
            </div>
            <Clock className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">In Progress</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.inProgress}</p>
              <p className="text-xs text-yellow-700 mt-1">Being processed</p>
            </div>
            <RefreshCw className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Submitted</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.submitted}</p>
              <p className="text-xs text-purple-700 mt-1">Awaiting approval</p>
            </div>
            <Upload className="h-10 w-10 text-purple-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdue}</p>
              <p className="text-xs text-red-700 mt-1">Past deadline</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {months.map((month, index) => (
                <option key={index} value={index - 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRenewals.length > 0 ? (
          filteredRenewals.map((renewal) => {
            const StatusIcon = statusIcons[renewal.renewalStatus];
            const daysUntilDue = getDaysUntilDue(renewal.renewalDueDate);

            return (
              <div key={renewal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{renewal.licenseName}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[renewal.renewalStatus]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {renewal.renewalStatus.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[renewal.priority]}`}>
                        {renewal.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">License No: {renewal.licenseNumber}</p>
                    <p className="text-xs text-gray-600">Authority: {renewal.authority}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Current Expiry</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(renewal.currentExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Renewal Due Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(renewal.renewalDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Days Until Due</p>
                    <p className={`text-sm font-bold ${daysUntilDue < 30 ? 'text-red-600' : 'text-green-600'}`}>
                      {daysUntilDue} days
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Assigned To</p>
                    <p className="text-sm font-bold text-gray-900">{renewal.assignedTo}</p>
                  </div>
                </div>

                {renewal.renewalCost && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-2">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Renewal Cost</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(renewal.renewalCost)}</p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-2">
                  <h4 className="text-sm font-bold text-blue-900 mb-3">Required Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {renewal.documentsRequired.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white rounded p-2 border border-blue-100">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <p className="text-xs text-gray-600 uppercase font-medium mb-1">Submission Deadline</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(renewal.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {renewal.applicationNumber && (
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 mb-2">
                    <p className="text-xs text-purple-600 uppercase font-medium mb-1">Application Number</p>
                    <p className="text-sm font-bold text-purple-900">{renewal.applicationNumber}</p>
                  </div>
                )}

                {renewal.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-yellow-900">{renewal.remarks}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  {renewal.renewalStatus === 'upcoming' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
                      Start Renewal Process
                    </button>
                  )}
                  {renewal.renewalStatus === 'in_progress' && (
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Submit Application
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Calendar className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No renewals found</h3>
            <p className="text-gray-600">No license renewals match the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
