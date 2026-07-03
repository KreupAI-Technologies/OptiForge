'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Upload, CheckCircle, AlertCircle, Clock, Calendar, TrendingUp } from 'lucide-react';
import { HrComplianceDocsService, ComplianceReturn } from '@/services/hr-compliance-docs.service';

interface PFReturn {
  id: string;
  returnMonth: string;
  returnType: 'ECR' | 'Annual Return';
  establishment: string;
  establishmentCode: string;
  dueDate: string;
  filingDate?: string;
  status: 'draft' | 'filed' | 'overdue' | 'pending_approval';
  totalEmployees: number;
  eligibleEmployees: number;
  grossWages: number;
  employeeContribution: number;
  employerContribution: number;
  adminCharges: number;
  totalAmount: number;
  challanNumber?: string;
  challanDate?: string;
  uanLinked: number;
  aadharLinked: number;
  remarks?: string;
}

export default function Page() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pfReturns, setPfReturns] = useState<PFReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getReturns('pf');
        if (!active) return;
        const mapped: PFReturn[] = rows.map((r: ComplianceReturn) => ({
          id: r.id,
          returnMonth: r.returnMonth || '',
          returnType: (r.formType as PFReturn['returnType']) || 'ECR',
          establishment: r.establishment || '',
          establishmentCode: r.registrationNumber || '',
          dueDate: r.dueDate || '',
          filingDate: r.filingDate,
          status: (r.status as PFReturn['status']) || 'draft',
          totalEmployees: r.totalEmployees ?? 0,
          eligibleEmployees: r.coveredEmployees ?? 0,
          grossWages: r.grossWages ?? 0,
          employeeContribution: r.employeeContribution ?? 0,
          employerContribution: r.employerContribution ?? 0,
          adminCharges: 0,
          totalAmount: r.totalContribution ?? 0,
          challanNumber: r.challanNumber,
          challanDate: r.challanDate,
          uanLinked: r.coveredEmployees ?? 0,
          aadharLinked: r.coveredEmployees ?? 0,
          remarks: r.remarks,
        }));
        setPfReturns(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load PF returns');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockPFReturns: PFReturn[] = [
    {
      id: '1',
      returnMonth: '2025-10',
      returnType: 'ECR',
      establishment: 'B3 Manufacturing Unit 1',
      establishmentCode: 'MH/12345/000001',
      dueDate: '2025-11-15',
      filingDate: '2025-11-12',
      status: 'filed',
      totalEmployees: 245,
      eligibleEmployees: 238,
      grossWages: 62450000,
      employeeContribution: 7494000,
      employerContribution: 8118600,
      adminCharges: 124900,
      totalAmount: 15737500,
      challanNumber: 'PF/2025/10/001',
      challanDate: '2025-11-12',
      uanLinked: 238,
      aadharLinked: 235,
      remarks: 'Successfully filed on time'
    },
    {
      id: '2',
      returnMonth: '2025-09',
      returnType: 'ECR',
      establishment: 'B3 Manufacturing Unit 1',
      establishmentCode: 'MH/12345/000001',
      dueDate: '2025-10-15',
      filingDate: '2025-10-14',
      status: 'filed',
      totalEmployees: 242,
      eligibleEmployees: 235,
      grossWages: 61275000,
      employeeContribution: 7353000,
      employerContribution: 7963050,
      adminCharges: 122550,
      totalAmount: 15438600,
      challanNumber: 'PF/2025/09/001',
      challanDate: '2025-10-14',
      uanLinked: 235,
      aadharLinked: 232
    },
    {
      id: '3',
      returnMonth: '2025-08',
      returnType: 'ECR',
      establishment: 'B3 Manufacturing Unit 1',
      establishmentCode: 'MH/12345/000001',
      dueDate: '2025-09-15',
      filingDate: '2025-09-13',
      status: 'filed',
      totalEmployees: 240,
      eligibleEmployees: 233,
      grossWages: 60825000,
      employeeContribution: 7299000,
      employerContribution: 7907325,
      adminCharges: 121650,
      totalAmount: 15327975,
      challanNumber: 'PF/2025/08/001',
      challanDate: '2025-09-13',
      uanLinked: 233,
      aadharLinked: 230
    },
    {
      id: '4',
      returnMonth: '2025-11',
      returnType: 'ECR',
      establishment: 'B3 Manufacturing Unit 1',
      establishmentCode: 'MH/12345/000001',
      dueDate: '2025-12-15',
      status: 'pending_approval',
      totalEmployees: 248,
      eligibleEmployees: 241,
      grossWages: 63175000,
      employeeContribution: 7581000,
      employerContribution: 8212785,
      adminCharges: 126350,
      totalAmount: 15920135,
      uanLinked: 241,
      aadharLinked: 238,
      remarks: 'Awaiting manager approval'
    },
    {
      id: '5',
      returnMonth: '2024-03',
      returnType: 'Annual Return',
      establishment: 'B3 Manufacturing Unit 1',
      establishmentCode: 'MH/12345/000001',
      dueDate: '2025-04-30',
      filingDate: '2025-04-28',
      status: 'filed',
      totalEmployees: 235,
      eligibleEmployees: 228,
      grossWages: 725000000,
      employeeContribution: 87000000,
      employerContribution: 94275000,
      adminCharges: 1450000,
      totalAmount: 182725000,
      challanNumber: 'PF/2024/ANNUAL/001',
      challanDate: '2025-04-28',
      uanLinked: 228,
      aadharLinked: 225,
      remarks: 'Annual return for FY 2023-24'
    }
  ];

  const sourcePFReturns = pfReturns.length > 0 ? pfReturns : mockPFReturns;

  const filteredReturns = sourcePFReturns.filter(ret => {
    const returnDate = new Date(ret.returnMonth);
    const matchesMonth = returnDate.getMonth() === selectedMonth;
    const matchesYear = returnDate.getFullYear() === selectedYear;
    const matchesStatus = selectedStatus === 'all' || ret.status === selectedStatus;
    return (ret.returnType === 'Annual Return' ? matchesYear : matchesMonth && matchesYear) && matchesStatus;
  });

  const stats = {
    totalReturns: sourcePFReturns.filter(r => r.returnType === 'ECR').length,
    filed: sourcePFReturns.filter(r => r.status === 'filed').length,
    pending: sourcePFReturns.filter(r => r.status === 'pending_approval' || r.status === 'draft').length,
    overdue: sourcePFReturns.filter(r => r.status === 'overdue').length
  };

  const statusColors = {
    filed: 'bg-green-100 text-green-700 border-green-300',
    draft: 'bg-gray-100 text-gray-700 border-gray-300',
    overdue: 'bg-red-100 text-red-700 border-red-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  };

  const statusIcons = {
    filed: CheckCircle,
    draft: FileText,
    overdue: AlertCircle,
    pending_approval: Clock
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [2024, 2025, 2026];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          PF Returns (ECR Filing)
        </h1>
        <p className="text-sm text-gray-600 mt-1">Electronic Challan-cum-Return filing for Provident Fund</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading PF returns…</div>
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
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Returns</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalReturns}</p>
              <p className="text-xs text-blue-700 mt-1">Monthly ECR</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Filed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.filed}</p>
              <p className="text-xs text-green-700 mt-1">Successfully filed</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              <p className="text-xs text-yellow-700 mt-1">Awaiting action</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Overdue</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.overdue}</p>
              <p className="text-xs text-red-700 mt-1">Past due date</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-60" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="filed">Filed</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="draft">Draft</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredReturns.length > 0 ? (
          filteredReturns.map((pfReturn) => {
            const StatusIcon = statusIcons[pfReturn.status];
            return (
              <div key={pfReturn.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {pfReturn.returnType} - {new Date(pfReturn.returnMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[pfReturn.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {pfReturn.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{pfReturn.establishment}</p>
                    <p className="text-xs text-gray-600">Establishment Code: {pfReturn.establishmentCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Due Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(pfReturn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {pfReturn.filingDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Filing Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(pfReturn.filingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Employees</p>
                    <p className="text-sm font-bold text-gray-900">{pfReturn.totalEmployees}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Eligible Employees</p>
                    <p className="text-sm font-bold text-gray-900">{pfReturn.eligibleEmployees}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Gross Wages</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(pfReturn.grossWages)}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                    <p className="text-xs text-teal-600 uppercase font-medium mb-1">Employee Contribution (12%)</p>
                    <p className="text-lg font-bold text-teal-900">{formatCurrency(pfReturn.employeeContribution)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 uppercase font-medium mb-1">Employer Contribution (13%)</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(pfReturn.employerContribution)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Admin Charges</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(pfReturn.adminCharges)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Total Amount</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(pfReturn.totalAmount)}</p>
                  </div>
                  {pfReturn.challanNumber && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Challan Number</p>
                      <p className="text-sm font-bold text-gray-900">{pfReturn.challanNumber}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                    <p className="text-xs text-indigo-600 uppercase font-medium mb-2">UAN Linked</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-indigo-900">{pfReturn.uanLinked} / {pfReturn.eligibleEmployees}</p>
                      <p className="text-sm font-semibold text-indigo-700">{Math.round((pfReturn.uanLinked / pfReturn.eligibleEmployees) * 100)}%</p>
                    </div>
                    <div className="bg-indigo-200 rounded-full h-2 mt-2">
                      <div className="bg-indigo-600 rounded-full h-2" style={{ width: `${(pfReturn.uanLinked / pfReturn.eligibleEmployees) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                    <p className="text-xs text-pink-600 uppercase font-medium mb-2">Aadhar Linked</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-pink-900">{pfReturn.aadharLinked} / {pfReturn.eligibleEmployees}</p>
                      <p className="text-sm font-semibold text-pink-700">{Math.round((pfReturn.aadharLinked / pfReturn.eligibleEmployees) * 100)}%</p>
                    </div>
                    <div className="bg-pink-200 rounded-full h-2 mt-2">
                      <div className="bg-pink-600 rounded-full h-2" style={{ width: `${(pfReturn.aadharLinked / pfReturn.eligibleEmployees) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                {pfReturn.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-yellow-900">{pfReturn.remarks}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download ECR
                  </button>
                  {pfReturn.status === 'draft' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Submit Return
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600">No PF returns for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
