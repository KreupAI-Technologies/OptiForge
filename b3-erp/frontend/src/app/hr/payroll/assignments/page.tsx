'use client';

import { useState, useMemo, useEffect } from 'react';
import { UserCheck, Search, Edit, CheckCircle, Clock, AlertTriangle, Users, FileText } from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';

interface EmployeeAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  grade: string;
  employmentType: 'permanent' | 'contract' | 'temporary';
  joiningDate: string;
  templateCode: string;
  templateName: string;
  ctcAmount: number;
  effectiveFrom: string;
  assignedBy: string;
  assignedOn: string;
  status: 'active' | 'pending' | 'revised';
  previousCTC?: number;
  revisionDate?: string;
}

export default function PayrollAssignmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<EmployeeAssignment | null>(null);

  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend returns salary structures (templates), not per-employee
        // assignments; map best-effort to the EmployeeAssignment shape.
        const raw = (await PayrollService.getSalaryStructures()) as any[];
        const statusMap: Record<string, EmployeeAssignment['status']> = {
          Active: 'active',
          Draft: 'pending',
          Pending: 'pending',
          Revised: 'revised',
          Inactive: 'pending',
        };
        const mapped: EmployeeAssignment[] = raw.map((r) => ({
          id: r.id,
          employeeId: r.applicableDesignations?.[0] ?? '',
          employeeName: r.name ?? '',
          designation: r.applicableDesignations?.[0] ?? '',
          department: r.applicableDepartments?.[0] ?? '',
          grade: '',
          employmentType:
            (r.applicableEmployeeTypes?.[0]?.toLowerCase() as EmployeeAssignment['employmentType']) ??
            'permanent',
          joiningDate: r.effectiveFrom ?? '',
          templateCode: r.code ?? '',
          templateName: r.name ?? '',
          ctcAmount: Number(r.ctcAmount ?? 0),
          effectiveFrom: r.effectiveFrom ?? '',
          assignedBy: r.createdBy ?? 'System',
          assignedOn: r.createdAt ?? '',
          status: statusMap[r.status] ?? 'active',
        }));
        if (!cancelled) setAssignments(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load salary assignments');
          setAssignments([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewBreakdown = (assignment: EmployeeAssignment) => {
    setSelectedAssignment(assignment);
    setShowBreakdownModal(true);
  };

  const handleReviseSalary = (assignment: EmployeeAssignment) => {
    setSelectedAssignment(assignment);
    setShowReviseModal(true);
  };

  const handleViewHistory = (assignment: EmployeeAssignment) => {
    setSelectedAssignment(assignment);
    setShowHistoryModal(true);
  };

  const handleApprove = (assignmentId: string) => {
    setAssignments(assignments.map(a =>
      a.id === assignmentId ? { ...a, status: 'active' as const } : a
    ));
  };

  const handleSaveRevision = (newCTC: number, effectiveFrom: string) => {
    if (selectedAssignment) {
      setAssignments(assignments.map(a =>
        a.id === selectedAssignment.id
          ? {
              ...a,
              previousCTC: a.ctcAmount,
              ctcAmount: newCTC,
              effectiveFrom,
              status: 'revised' as const,
              revisionDate: effectiveFrom
            }
          : a
      ));
      setShowReviseModal(false);
      setSelectedAssignment(null);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch =
        assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.designation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || assignment.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [assignments, searchTerm, selectedDepartment, selectedStatus]);

  const stats = {
    total: assignments.length,
    active: assignments.filter(a => a.status === 'active').length,
    pending: assignments.filter(a => a.status === 'pending').length,
    revised: assignments.filter(a => a.status === 'revised').length
  };

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    revised: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const statusIcons = {
    active: <CheckCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    revised: <AlertTriangle className="h-4 w-4" />
  };

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2)}L`;
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Salary Template Assignments</h1>
        <p className="text-sm text-gray-600 mt-1">Assign and manage salary structures for employees</p>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm mb-3">
          Loading salary assignments…
        </div>
      )}
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 text-sm mb-3">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Assignments</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Recent Revisions</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.revised}</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="revised">Revised</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserCheck className="h-4 w-4" />
            Bulk Assignment
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredAssignments.map(assignment => (
          <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{assignment.employeeName}</h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                    {assignment.employeeId}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[assignment.status]}`}>
                    <span className="inline-flex items-center gap-1">
                      {statusIcons[assignment.status]}
                      {assignment.status.toUpperCase()}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {assignment.designation} • {assignment.department} • Grade {assignment.grade}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {assignment.employmentType.charAt(0).toUpperCase() + assignment.employmentType.slice(1)} Employee •
                  Joined: {new Date(assignment.joiningDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h4 className="text-xs font-medium text-blue-600 mb-2">Assigned Template</h4>
                <p className="text-sm font-bold text-blue-900">{assignment.templateName}</p>
                <p className="text-xs text-blue-700 mt-1">Code: {assignment.templateCode}</p>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h4 className="text-xs font-medium text-green-600 mb-2">CTC Amount</h4>
                <p className="text-xl font-bold text-green-900">{formatCurrency(assignment.ctcAmount)}</p>
                <p className="text-xs text-green-700 mt-1">Annual CTC</p>
                {assignment.previousCTC && (
                  <p className="text-xs text-green-600 mt-1">
                    Previous: {formatCurrency(assignment.previousCTC)}
                    <span className="ml-1 font-semibold">
                      (+{(((assignment.ctcAmount - assignment.previousCTC) / assignment.previousCTC) * 100).toFixed(1)}%)
                    </span>
                  </p>
                )}
              </div>

              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h4 className="text-xs font-medium text-purple-600 mb-2">Effective Date</h4>
                <p className="text-sm font-bold text-purple-900">
                  {new Date(assignment.effectiveFrom).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
                {assignment.revisionDate && (
                  <p className="text-xs text-purple-700 mt-1">Revision Date: {new Date(assignment.revisionDate).toLocaleDateString('en-IN')}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Assigned by: {assignment.assignedBy} on {new Date(assignment.assignedOn).toLocaleDateString('en-IN')}
                </div>
                <div className="flex gap-2">
                  {assignment.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(assignment.id)}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve Assignment
                    </button>
                  )}
                  {assignment.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleReviseSalary(assignment)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Revise Salary
                      </button>
                      <button
                        onClick={() => handleViewBreakdown(assignment)}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        View Breakdown
                      </button>
                    </>
                  )}
                  {assignment.status === 'revised' && (
                    <>
                      <button
                        onClick={() => handleViewHistory(assignment)}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        View Revision History
                      </button>
                      <button
                        onClick={() => handleViewBreakdown(assignment)}
                        className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        View Breakdown
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Salary Assignment Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Each employee must be assigned a salary template based on their grade and designation</li>
          <li>• CTC amount is entered as annual gross cost to company</li>
          <li>• Template components automatically calculate based on assigned CTC</li>
          <li>• Salary revisions require approval before becoming effective</li>
          <li>• Changes take effect from the specified effective date</li>
          <li>• Bulk assignment allows assigning templates to multiple employees at once</li>
        </ul>
      </div>

      {showBreakdownModal && selectedAssignment && (
        <SalaryBreakdownModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowBreakdownModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}

      {showReviseModal && selectedAssignment && (
        <ReviseSalaryModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowReviseModal(false);
            setSelectedAssignment(null);
          }}
          onSave={handleSaveRevision}
        />
      )}

      {showHistoryModal && selectedAssignment && (
        <RevisionHistoryModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}

interface SalaryBreakdownModalProps {
  assignment: EmployeeAssignment;
  onClose: () => void;
}

function SalaryBreakdownModal({ assignment, onClose }: SalaryBreakdownModalProps) {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  // Mock salary breakdown based on template
  const breakdown = {
    earnings: [
      { code: 'BASIC', name: 'Basic Salary', calculation: '50% of CTC', amount: assignment.ctcAmount * 0.5 },
      { code: 'HRA', name: 'House Rent Allowance', calculation: '40% of Basic', amount: assignment.ctcAmount * 0.5 * 0.4 },
      { code: 'DA', name: 'Dearness Allowance', calculation: '10% of Basic', amount: assignment.ctcAmount * 0.5 * 0.1 },
      { code: 'CONV', name: 'Conveyance Allowance', calculation: 'Flat', amount: 19200 },
      { code: 'MED', name: 'Medical Allowance', calculation: 'Flat', amount: 15000 }
    ],
    deductions: [
      { code: 'PF_EMP', name: 'PF (Employee)', calculation: '12% of Basic', amount: assignment.ctcAmount * 0.5 * 0.12 },
      { code: 'ESI_EMP', name: 'ESI (Employee)', calculation: '0.75% of Gross', amount: assignment.ctcAmount * 0.0075 },
      { code: 'PT', name: 'Professional Tax', calculation: 'Flat', amount: 2400 }
    ]
  };

  const totalEarnings = breakdown.earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = breakdown.deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = totalEarnings - totalDeductions;
  const monthlyNet = netPay / 12;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 rounded-t-lg">
          <h2 className="text-2xl font-bold">Salary Breakdown</h2>
          <p className="text-purple-100 text-sm mt-1">
            {assignment.employeeName} ({assignment.employeeId})
          </p>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-blue-600 font-medium">Template</p>
                <p className="text-lg font-bold text-blue-900">{assignment.templateName}</p>
                <p className="text-xs text-blue-700">{assignment.templateCode}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Annual CTC</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(assignment.ctcAmount)}</p>
                <p className="text-xs text-blue-700">Effective from: {new Date(assignment.effectiveFrom).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center justify-between">
                <span>Earnings</span>
                <span className="text-lg">{formatCurrency(totalEarnings)}</span>
              </h3>
              <div className="space-y-2">
                {breakdown.earnings.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-green-700">{item.name}</span>
                      <span className="text-green-600 ml-2 text-xs">({item.calculation})</span>
                    </div>
                    <span className="font-bold text-green-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="font-semibold text-red-900 mb-3 flex items-center justify-between">
                <span>Deductions</span>
                <span className="text-lg">{formatCurrency(totalDeductions)}</span>
              </h3>
              <div className="space-y-2">
                {breakdown.deductions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-red-700">{item.name}</span>
                      <span className="text-red-600 ml-2 text-xs">({item.calculation})</span>
                    </div>
                    <span className="font-bold text-red-900">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Annual Net Pay</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(netPay)}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Monthly Net Pay</p>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(monthlyNet)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviseSalaryModalProps {
  assignment: EmployeeAssignment;
  onClose: () => void;
  onSave: (newCTC: number, effectiveFrom: string) => void;
}

function ReviseSalaryModal({ assignment, onClose, onSave }: ReviseSalaryModalProps) {
  const [newCTC, setNewCTC] = useState(assignment.ctcAmount);
  const [effectiveFrom, setEffectiveFrom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveFrom) {
      alert('Please select effective date');
      return;
    }
    if (newCTC <= 0) {
      alert('Please enter valid CTC amount');
      return;
    }
    onSave(newCTC, effectiveFrom);
  };

  const increment = newCTC - assignment.ctcAmount;
  const incrementPercentage = ((increment / assignment.ctcAmount) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-t-lg">
          <h2 className="text-2xl font-bold">Revise Salary</h2>
          <p className="text-blue-100 text-sm mt-1">
            {assignment.employeeName} ({assignment.employeeId})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <h3 className="font-semibold text-gray-900 mb-3">Current Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600">Current CTC</p>
                <p className="font-bold text-gray-900">₹{(assignment.ctcAmount / 100000).toFixed(2)}L</p>
              </div>
              <div>
                <p className="text-gray-600">Template</p>
                <p className="font-bold text-gray-900">{assignment.templateName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New CTC (Annual) *
              </label>
              <input
                type="number"
                value={newCTC}
                onChange={(e) => setNewCTC(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new CTC amount"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From *
              </label>
              <input
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {increment !== 0 && (
            <div className={`rounded-lg p-3 mb-3 ${increment > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${increment > 0 ? 'text-green-900' : 'text-red-900'}`}>
                Revision Summary
              </h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className={increment > 0 ? 'text-green-600' : 'text-red-600'}>Increment/Decrement</p>
                  <p className={`font-bold ${increment > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {increment > 0 ? '+' : ''}₹{(increment / 100000).toFixed(2)}L
                  </p>
                </div>
                <div>
                  <p className={increment > 0 ? 'text-green-600' : 'text-red-600'}>Percentage</p>
                  <p className={`font-bold ${increment > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {incrementPercentage > '0' ? '+' : ''}{incrementPercentage}%
                  </p>
                </div>
                <div>
                  <p className={increment > 0 ? 'text-green-600' : 'text-red-600'}>New CTC</p>
                  <p className={`font-bold ${increment > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    ₹{(newCTC / 100000).toFixed(2)}L
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Revision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface RevisionHistoryModalProps {
  assignment: EmployeeAssignment;
  onClose: () => void;
}

function RevisionHistoryModal({ assignment, onClose }: RevisionHistoryModalProps) {
  const formatCurrency = (amount: number) => `₹${(amount / 100000).toFixed(2)}L`;

  // Mock revision history
  const history = [
    {
      date: assignment.revisionDate || assignment.effectiveFrom,
      previousCTC: assignment.previousCTC || 0,
      newCTC: assignment.ctcAmount,
      increment: assignment.ctcAmount - (assignment.previousCTC || 0),
      percentage: assignment.previousCTC ? ((assignment.ctcAmount - assignment.previousCTC) / assignment.previousCTC * 100).toFixed(2) : '0',
      reason: 'Annual increment',
      approvedBy: 'HR Manager'
    },
    {
      date: assignment.joiningDate,
      previousCTC: 0,
      newCTC: assignment.previousCTC || assignment.ctcAmount,
      increment: assignment.previousCTC || assignment.ctcAmount,
      percentage: '100',
      reason: 'Initial assignment',
      approvedBy: 'HR Admin'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-gray-600 to-gray-700 text-white p-3 rounded-t-lg">
          <h2 className="text-2xl font-bold">Salary Revision History</h2>
          <p className="text-gray-100 text-sm mt-1">
            {assignment.employeeName} ({assignment.employeeId})
          </p>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-blue-600">Current CTC</p>
                <p className="font-bold text-blue-900">{formatCurrency(assignment.ctcAmount)}</p>
              </div>
              <div>
                <p className="text-blue-600">Previous CTC</p>
                <p className="font-bold text-blue-900">{formatCurrency(assignment.previousCTC || 0)}</p>
              </div>
              <div>
                <p className="text-blue-600">Last Revision</p>
                <p className="font-bold text-blue-900">
                  {assignment.revisionDate ? new Date(assignment.revisionDate).toLocaleDateString('en-IN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{item.reason}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    item.increment > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.increment > 0 ? `+${item.percentage}%` : 'Initial'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  {item.previousCTC > 0 && (
                    <div>
                      <p className="text-gray-600">Previous CTC</p>
                      <p className="font-bold text-gray-900">{formatCurrency(item.previousCTC)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">New CTC</p>
                    <p className="font-bold text-gray-900">{formatCurrency(item.newCTC)}</p>
                  </div>
                  {item.increment > 0 && item.previousCTC > 0 && (
                    <div>
                      <p className="text-gray-600">Increment</p>
                      <p className="font-bold text-green-700">+{formatCurrency(item.increment)}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  Approved by: {item.approvedBy}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
