'use client';

import { useState, useEffect } from 'react';
import { CheckSquare, Check, X, Clock, Eye, Send, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { OffboardingTasksService, OffboardingTaskRecord } from '@/services/onboarding-tasks.service';

interface ClearanceItem {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  lastWorkingDay: string;
  clearanceItems: {
    it: 'pending' | 'in-progress' | 'completed';
    hr: 'pending' | 'in-progress' | 'completed';
    finance: 'pending' | 'in-progress' | 'completed';
    assets: 'pending' | 'in-progress' | 'completed';
    admin: 'pending' | 'in-progress' | 'completed';
  };
  overallStatus: 'pending' | 'in-progress' | 'completed';
  completionPercentage: number;
}

export default function ClearanceChecklistPage() {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedClearance, setSelectedClearance] = useState<ClearanceItem | null>(null);
  const [reminderDepartments, setReminderDepartments] = useState<string[]>([]);

  const [mockClearances, setMockClearances] = useState<ClearanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const records = await OffboardingTasksService.list('clearance-checklist');
        if (!active) return;
        setMockClearances(
          records.map((r: OffboardingTaskRecord) => ({
            id: r.id,
            employeeName: r.employeeName || '',
            designation: r.designation || '',
            department: r.department || '',
            overallStatus: (r.status as any) || 'pending',
            ...(r.data || {}),
          })) as unknown as ClearanceItem[],
        );
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const stats = {
    total: mockClearances.length,
    pending: mockClearances.filter(c => c.overallStatus === 'pending').length,
    inProgress: mockClearances.filter(c => c.overallStatus === 'in-progress').length,
    completed: mockClearances.filter(c => c.overallStatus === 'completed').length
  };

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-600" />,
    'in-progress': <Clock className="h-4 w-4 text-blue-600" />,
    completed: <Check className="h-4 w-4 text-green-600" />
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700'
  };

  const departmentLabels = {
    it: 'IT Department',
    hr: 'HR Department',
    finance: 'Finance Department',
    assets: 'Assets Department',
    admin: 'Administration'
  };

  const handleViewDetails = (clearance: ClearanceItem) => {
    setSelectedClearance(clearance);
    setShowDetailsModal(true);
  };

  const handleSendReminder = (clearance: ClearanceItem) => {
    setSelectedClearance(clearance);
    const pending = Object.entries(clearance.clearanceItems)
      .filter(([_, status]) => status !== 'completed')
      .map(([dept, _]) => dept);
    setReminderDepartments(pending);
    setShowReminderModal(true);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReminder = async () => {
    if (!selectedClearance || submitting) return;
    setSubmitting(true);
    try {
      await OffboardingTasksService.update(selectedClearance.id, {
        data: {
          ...(selectedClearance as any),
          lastReminderSentAt: new Date().toISOString(),
          lastReminderDepartments: reminderDepartments,
        },
      });
      toast({
        title: 'Reminders Sent',
        description: `Clearance reminders have been sent to ${reminderDepartments.length} department(s) for ${selectedClearance.employeeName}.`,
      });
      setShowReminderModal(false);
      setSelectedClearance(null);
      setReminderDepartments([]);
    } catch {
      toast({ title: 'Failed to send reminders', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Exit Clearance Checklist</h1>
        <p className="text-sm text-gray-600 mt-1">Track departmental clearance status for exiting employees</p>
      </div>

      {loading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading clearance records…</div>
      )}
      {error && !loading && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {mockClearances.map(clearance => (
          <div key={clearance.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{clearance.employeeName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[clearance.overallStatus]}`}>
                    {clearance.overallStatus.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{clearance.designation} • {clearance.department}</p>
                <p className="text-xs text-gray-500 mt-1">Last Working Day: {new Date(clearance.lastWorkingDay).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Clearance Progress</span>
                <span className="font-semibold text-gray-900">{clearance.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${clearance.completionPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(clearance.clearanceItems).map(([dept, status]) => (
                <div key={dept} className={`p-3 rounded-lg border-2 ${
                  status === 'completed' ? 'border-green-200 bg-green-50' :
                  status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                  'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{departmentLabels[dept as keyof typeof departmentLabels]}</span>
                    {statusIcons[status]}
                  </div>
                  <span className={`text-xs font-semibold ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'in-progress' ? 'text-blue-700' :
                    'text-yellow-700'
                  }`}>
                    {status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewDetails(clearance)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Detailed Status
              </button>
              <button
                onClick={() => handleSendReminder(clearance)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-sm inline-flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Reminder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedClearance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Clearance Status Details</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedClearance.employeeName} • {selectedClearance.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-600">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedClearance.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedClearance.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Last Working Day</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(selectedClearance.lastWorkingDay).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Overall Status</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded ${statusColors[selectedClearance.overallStatus]}`}>
                      {selectedClearance.overallStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-900">Overall Clearance Progress</span>
                  <span className="font-bold text-blue-600">{selectedClearance.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="h-4 rounded-full bg-blue-600" style={{ width: `${selectedClearance.completionPercentage}%` }} />
                </div>
              </div>

              {/* Department-wise Clearance */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Department-wise Clearance Status</h3>
                <div className="space-y-3">
                  {Object.entries(selectedClearance.clearanceItems).map(([dept, status]) => (
                    <div key={dept} className={`p-4 rounded-lg border-2 ${
                      status === 'completed' ? 'border-green-200 bg-green-50' :
                      status === 'in-progress' ? 'border-blue-200 bg-blue-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {statusIcons[status]}
                          <div>
                            <p className="font-semibold text-gray-900">{departmentLabels[dept as keyof typeof departmentLabels]}</p>
                            <p className={`text-xs font-medium mt-1 ${
                              status === 'completed' ? 'text-green-700' :
                              status === 'in-progress' ? 'text-blue-700' :
                              'text-yellow-700'
                            }`}>
                              {status.replace('-', ' ').toUpperCase()}
                            </p>
                          </div>
                        </div>
                        {status === 'completed' && (
                          <CheckSquare className="h-6 w-6 text-green-600" />
                        )}
                        {status === 'in-progress' && (
                          <Clock className="h-6 w-6 text-blue-600" />
                        )}
                        {status === 'pending' && (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleSendReminder(selectedClearance);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && selectedClearance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="bg-blue-50 border-b border-blue-200 px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div className="flex items-center gap-3">
                <Send className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Send Clearance Reminder</h2>
                  <p className="text-sm text-blue-700 mt-1">{selectedClearance.employeeName} • {selectedClearance.employeeId}</p>
                </div>
              </div>
              <button onClick={() => setShowReminderModal(false)} className="text-blue-600 hover:text-blue-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900 mb-2">Pending Clearances</p>
                <p className="text-xs text-yellow-800">
                  The following departments have pending clearances that will receive reminder notifications:
                </p>
              </div>

              <div className="space-y-2">
                {reminderDepartments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">{departmentLabels[dept as keyof typeof departmentLabels]}</span>
                    </div>
                    <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                      {selectedClearance.clearanceItems[dept as keyof typeof selectedClearance.clearanceItems].replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex gap-3">
                  <Send className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Reminder Details</p>
                    <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Department heads will receive email notifications</li>
                      <li>Reminder includes employee details and last working day</li>
                      <li>Pending clearance items will be highlighted</li>
                      <li>Follow-up reminders can be sent if needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReminder}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Sending…' : `Send Reminders (${reminderDepartments.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
