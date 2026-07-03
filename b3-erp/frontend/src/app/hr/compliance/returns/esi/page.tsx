'use client';

import { useState, useEffect } from 'react';
import { Heart, Download, Upload, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { HrComplianceDocsService, ComplianceReturn } from '@/services/hr-compliance-docs.service';

interface ESIReturn {
  id: string;
  returnMonth: string;
  returnPeriod: string;
  establishment: string;
  esiCode: string;
  dueDate: string;
  filingDate?: string;
  status: 'draft' | 'filed' | 'overdue' | 'pending_approval';
  totalEmployees: number;
  coveredEmployees: number;
  grossWages: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  challanNumber?: string;
  challanDate?: string;
  branch: string;
  remarks?: string;
}

export default function Page() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [esiReturns, setEsiReturns] = useState<ESIReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getReturns('esi');
        if (!active) return;
        const mapped: ESIReturn[] = rows.map((r: ComplianceReturn) => ({
          id: r.id,
          returnMonth: r.returnMonth || '',
          returnPeriod: r.returnPeriod || '',
          establishment: r.establishment || '',
          esiCode: r.registrationNumber || '',
          dueDate: r.dueDate || '',
          filingDate: r.filingDate,
          status: (r.status as ESIReturn['status']) || 'draft',
          totalEmployees: r.totalEmployees ?? 0,
          coveredEmployees: r.coveredEmployees ?? 0,
          grossWages: r.grossWages ?? 0,
          employeeContribution: r.employeeContribution ?? 0,
          employerContribution: r.employerContribution ?? 0,
          totalContribution: r.totalContribution ?? 0,
          challanNumber: r.challanNumber,
          challanDate: r.challanDate,
          branch: r.branch || '',
          remarks: r.remarks,
        }));
        setEsiReturns(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load ESI returns');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const mockESIReturns: ESIReturn[] = [
    {
      id: '1',
      returnMonth: '2025-10',
      returnPeriod: 'October 2025',
      establishment: 'B3 Manufacturing Unit 1',
      esiCode: 'ESI/MH/12345',
      branch: 'Mumbai ESI Branch',
      dueDate: '2025-11-21',
      filingDate: '2025-11-18',
      status: 'filed',
      totalEmployees: 245,
      coveredEmployees: 178,
      grossWages: 28450000,
      employeeContribution: 569000,
      employerContribution: 994750,
      totalContribution: 1563750,
      challanNumber: 'ESI/2025/10/001',
      challanDate: '2025-11-18',
      remarks: 'Successfully filed before due date'
    },
    {
      id: '2',
      returnMonth: '2025-09',
      returnPeriod: 'September 2025',
      establishment: 'B3 Manufacturing Unit 1',
      esiCode: 'ESI/MH/12345',
      branch: 'Mumbai ESI Branch',
      dueDate: '2025-10-21',
      filingDate: '2025-10-19',
      status: 'filed',
      totalEmployees: 242,
      coveredEmployees: 175,
      grossWages: 27825000,
      employeeContribution: 556500,
      employerContribution: 973875,
      totalContribution: 1530375,
      challanNumber: 'ESI/2025/09/001',
      challanDate: '2025-10-19'
    },
    {
      id: '3',
      returnMonth: '2025-08',
      returnPeriod: 'August 2025',
      establishment: 'B3 Manufacturing Unit 1',
      esiCode: 'ESI/MH/12345',
      branch: 'Mumbai ESI Branch',
      dueDate: '2025-09-21',
      filingDate: '2025-09-20',
      status: 'filed',
      totalEmployees: 240,
      coveredEmployees: 173,
      grossWages: 27360000,
      employeeContribution: 547200,
      employerContribution: 957600,
      totalContribution: 1504800,
      challanNumber: 'ESI/2025/08/001',
      challanDate: '2025-09-20'
    },
    {
      id: '4',
      returnMonth: '2025-11',
      returnPeriod: 'November 2025',
      establishment: 'B3 Manufacturing Unit 1',
      esiCode: 'ESI/MH/12345',
      branch: 'Mumbai ESI Branch',
      dueDate: '2025-12-21',
      status: 'pending_approval',
      totalEmployees: 248,
      coveredEmployees: 180,
      grossWages: 28980000,
      employeeContribution: 579600,
      employerContribution: 1014300,
      totalContribution: 1593900,
      remarks: 'Awaiting HR manager approval before submission'
    },
    {
      id: '5',
      returnMonth: '2025-07',
      returnPeriod: 'July 2025',
      establishment: 'B3 Manufacturing Unit 1',
      esiCode: 'ESI/MH/12345',
      branch: 'Mumbai ESI Branch',
      dueDate: '2025-08-21',
      filingDate: '2025-08-19',
      status: 'filed',
      totalEmployees: 238,
      coveredEmployees: 171,
      grossWages: 26895000,
      employeeContribution: 537900,
      employerContribution: 941325,
      totalContribution: 1479225,
      challanNumber: 'ESI/2025/07/001',
      challanDate: '2025-08-19'
    }
  ];

  const sourceESIReturns = esiReturns.length > 0 ? esiReturns : mockESIReturns;

  const filteredReturns = sourceESIReturns.filter(ret => {
    const returnDate = new Date(ret.returnMonth);
    const matchesMonth = returnDate.getMonth() === selectedMonth;
    const matchesYear = returnDate.getFullYear() === selectedYear;
    const matchesStatus = selectedStatus === 'all' || ret.status === selectedStatus;
    return matchesMonth && matchesYear && matchesStatus;
  });

  const stats = {
    totalReturns: sourceESIReturns.length,
    filed: sourceESIReturns.filter(r => r.status === 'filed').length,
    pending: sourceESIReturns.filter(r => r.status === 'pending_approval' || r.status === 'draft').length,
    overdue: sourceESIReturns.filter(r => r.status === 'overdue').length
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
          <Heart className="h-6 w-6 text-pink-600" />
          ESI Returns Filing
        </h1>
        <p className="text-sm text-gray-600 mt-1">Employee State Insurance monthly contribution returns</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading ESI returns…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-sm border border-pink-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Total Returns</p>
              <p className="text-3xl font-bold text-pink-900 mt-1">{stats.totalReturns}</p>
              <p className="text-xs text-pink-700 mt-1">Monthly returns</p>
            </div>
            <Heart className="h-10 w-10 text-pink-600 opacity-60" />
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
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
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
          filteredReturns.map((esiReturn) => {
            const StatusIcon = statusIcons[esiReturn.status];
            return (
              <div key={esiReturn.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">ESI Return - {esiReturn.returnPeriod}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[esiReturn.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {esiReturn.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{esiReturn.establishment}</p>
                    <p className="text-xs text-gray-600">ESI Code: {esiReturn.esiCode}</p>
                    <p className="text-xs text-gray-600">Branch: {esiReturn.branch}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Due Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(esiReturn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {esiReturn.filingDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Filing Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(esiReturn.filingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Employees</p>
                    <p className="text-sm font-bold text-gray-900">{esiReturn.totalEmployees}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Covered Employees</p>
                    <p className="text-sm font-bold text-gray-900">{esiReturn.coveredEmployees}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Gross Wages</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(esiReturn.grossWages)}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                    <p className="text-xs text-teal-600 uppercase font-medium mb-1">Employee Contribution (2%)</p>
                    <p className="text-lg font-bold text-teal-900">{formatCurrency(esiReturn.employeeContribution)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 uppercase font-medium mb-1">Employer Contribution (3.5%)</p>
                    <p className="text-lg font-bold text-purple-900">{formatCurrency(esiReturn.employerContribution)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">Total Contribution</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(esiReturn.totalContribution)}</p>
                  </div>
                  {esiReturn.challanNumber && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Challan Number</p>
                      <p className="text-sm font-bold text-gray-900">{esiReturn.challanNumber}</p>
                      {esiReturn.challanDate && (
                        <p className="text-xs text-gray-600 mt-1">
                          Date: {new Date(esiReturn.challanDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-pink-50 rounded-lg p-3 border border-pink-200 mb-2">
                  <p className="text-xs text-pink-600 uppercase font-medium mb-2">Coverage Ratio</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-pink-900">{esiReturn.coveredEmployees} / {esiReturn.totalEmployees}</p>
                    <p className="text-sm font-semibold text-pink-700">{Math.round((esiReturn.coveredEmployees / esiReturn.totalEmployees) * 100)}%</p>
                  </div>
                  <div className="bg-pink-200 rounded-full h-2 mt-2">
                    <div className="bg-pink-600 rounded-full h-2" style={{ width: `${(esiReturn.coveredEmployees / esiReturn.totalEmployees) * 100}%` }}></div>
                  </div>
                </div>

                {esiReturn.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-yellow-900">{esiReturn.remarks}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Return
                  </button>
                  {esiReturn.status === 'draft' && (
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
            <Heart className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600">No ESI returns for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
