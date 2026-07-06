'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Download, Upload, CheckCircle, Clock, AlertCircle, DollarSign, Shield, Home, Heart, BookOpen } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface TaxDeclaration {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  financialYear: string;
  status: 'draft' | 'submitted' | 'verified' | 'approved' | 'rejected';
  submittedDate?: string;
  verifiedDate?: string;
  totalDeductions: number;
  section80C: number;
  section80D: number;
  section80E: number;
  section80G: number;
  section24B: number;
  otherDeductions: number;
  proofStatus: 'pending' | 'partial' | 'complete';
  proofCount: number;
  requiredProofCount: number;
}

interface TaxSection {
  section: string;
  name: string;
  maxLimit: number;
  declared: number;
  proofSubmitted: boolean;
}

export default function TaxDeclarationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPayrollService.getTaxRecords('declarations');
        const mapped: TaxDeclaration[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.declarationNumber ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? '—',
          designation: r.designation ?? r.details?.designation ?? '',
          department: r.department ?? r.details?.department ?? '',
          financialYear: r.financialYear ?? r.details?.financialYear ?? '',
          status: (r.status ?? 'draft') as TaxDeclaration['status'],
          submittedDate: r.submittedDate ?? r.details?.submittedDate ?? undefined,
          verifiedDate: r.verifiedDate ?? r.details?.verifiedDate ?? undefined,
          totalDeductions: Number(r.totalDeductions ?? r.details?.totalDeductions ?? 0),
          section80C: Number(r.section80C ?? r.details?.section80C ?? 0),
          section80D: Number(r.section80D ?? r.details?.section80D ?? 0),
          section80E: Number(r.section80E ?? r.details?.section80E ?? 0),
          section80G: Number(r.section80G ?? r.details?.section80G ?? 0),
          section24B: Number(r.section24B ?? r.details?.section24B ?? 0),
          otherDeductions: Number(r.otherDeductions ?? r.details?.otherDeductions ?? 0),
          proofStatus: (r.proofStatus ?? r.details?.proofStatus ?? 'pending') as TaxDeclaration['proofStatus'],
          proofCount: Number(r.proofCount ?? r.details?.proofCount ?? 0),
          requiredProofCount: Number(r.requiredProofCount ?? r.details?.requiredProofCount ?? 0),
        }));
        if (!cancelled) setDeclarations(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load tax declarations');
          setDeclarations([]);
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

  const filteredDeclarations = useMemo(() => {
    return declarations.filter(decl => {
      const matchesSearch =
        decl.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decl.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || decl.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || decl.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [declarations, searchTerm, selectedDepartment, selectedStatus]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'draft', 'submitted', 'verified', 'approved', 'rejected'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    verified: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    draft: Clock,
    submitted: Upload,
    verified: CheckCircle,
    approved: CheckCircle,
    rejected: AlertCircle
  };

  const proofStatusColors = {
    pending: 'bg-gray-100 text-gray-700',
    partial: 'bg-yellow-100 text-yellow-700',
    complete: 'bg-green-100 text-green-700'
  };

  const stats = {
    totalEmployees: declarations.length,
    submitted: declarations.filter(d => ['submitted', 'verified', 'approved'].includes(d.status)).length,
    approved: declarations.filter(d => d.status === 'approved').length,
    pending: declarations.filter(d => d.status === 'draft').length,
    totalDeductions: declarations.reduce((sum, d) => sum + d.totalDeductions, 0)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Tax Declarations</h1>
        <p className="text-sm text-gray-600 mt-1">Employee income tax investment declarations (FY 2025-26)</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading tax declarations…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && declarations.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No tax declarations found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalEmployees}</p>
            </div>
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Submitted</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.submitted}</p>
            </div>
            <Upload className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-sm border border-cyan-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-700">Total Deductions</p>
              <p className="text-lg font-bold text-cyan-900 mt-1">{formatCurrency(stats.totalDeductions)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-cyan-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name or ID..."
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
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.toUpperCase()}
              </option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredDeclarations.map(declaration => {
          const StatusIcon = statusIcons[declaration.status];

          return (
            <div key={declaration.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{declaration.employeeName}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {declaration.employeeId}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[declaration.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {declaration.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${proofStatusColors[declaration.proofStatus]}`}>
                      PROOF: {declaration.proofStatus.toUpperCase()} ({declaration.proofCount}/{declaration.requiredProofCount})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {declaration.designation} • {declaration.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>FY: {declaration.financialYear}</span>
                    {declaration.submittedDate && <span>Submitted: {new Date(declaration.submittedDate).toLocaleDateString('en-IN')}</span>}
                    {declaration.verifiedDate && <span>Verified: {new Date(declaration.verifiedDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Total Tax Deductions</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(declaration.totalDeductions)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <h4 className="text-xs font-semibold text-blue-900">Section 80C</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Declared Amount</span>
                      <span className="font-bold text-blue-900">{formatCurrency(declaration.section80C)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Max Limit</span>
                      <span className="font-medium text-blue-800">₹1,50,000</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <p className="text-xs text-blue-700">PPF, ELSS, LIC, NSC, Home Loan Principal</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-green-600" />
                    <h4 className="text-xs font-semibold text-green-900">Section 80D</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Declared Amount</span>
                      <span className="font-bold text-green-900">{formatCurrency(declaration.section80D)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Max Limit</span>
                      <span className="font-medium text-green-800">₹50,000</span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <p className="text-xs text-green-700">Health Insurance Premium</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <h4 className="text-xs font-semibold text-purple-900">Other Sections</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">80E (Education Loan)</span>
                      <span className="font-medium text-purple-900">{formatCurrency(declaration.section80E)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">80G (Donations)</span>
                      <span className="font-medium text-purple-900">{formatCurrency(declaration.section80G)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-purple-700">24B (Home Loan Int.)</span>
                      <span className="font-medium text-purple-900">{formatCurrency(declaration.section24B)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                <button className="px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50">
                  View Proofs
                </button>
                {declaration.status === 'submitted' && (
                  <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Verify
                  </button>
                )}
                {declaration.status === 'verified' && (
                  <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Approve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tax Declaration Guidelines (FY 2025-26)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Section 80C (Max ₹1,50,000)</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• PPF (Public Provident Fund)</li>
              <li>• ELSS (Equity Linked Savings Scheme)</li>
              <li>• LIC Premium</li>
              <li>• NSC (National Savings Certificate)</li>
              <li>• Home Loan Principal Repayment</li>
              <li>• Tuition Fees (2 children)</li>
              <li>• Fixed Deposits (5 years)</li>
            </ul>
          </div>
          <div className="bg-white p-3 rounded">
            <h4 className="text-xs font-bold text-blue-800 mb-2">Section 80D (Health Insurance)</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Self & Family: ₹25,000 (Below 60 years)</li>
              <li>• Self & Family: ₹50,000 (Above 60 years)</li>
              <li>• Parents: ₹25,000 (Below 60 years)</li>
              <li>• Parents: ₹50,000 (Above 60 years)</li>
              <li>• Preventive Health Checkup: ₹5,000</li>
            </ul>
          </div>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Section 80E:</strong> Education loan interest (No upper limit)</li>
          <li>• <strong>Section 80G:</strong> Donations to approved charitable institutions (50% or 100% based on institution)</li>
          <li>• <strong>Section 24(b):</strong> Home loan interest deduction (Max ₹2,00,000 for self-occupied property)</li>
          <li>• <strong>HRA:</strong> House Rent Allowance exemption (based on rent paid, salary, and city of residence)</li>
          <li>• <strong>Standard Deduction:</strong> ₹50,000 (automatically applied to salary income)</li>
          <li>• <strong>Deadline:</strong> Submit declarations by June 30th for current financial year</li>
          <li>• <strong>Proof Submission:</strong> Investment proofs to be submitted by February end for final TDS adjustment</li>
        </ul>
      </div>
    </div>
  );
}
