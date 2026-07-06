'use client';

import { useState, useEffect } from 'react';
import { Receipt, Download, Upload, CheckCircle, AlertCircle, Clock, FileText, Calendar } from 'lucide-react';
import { HrComplianceDocsService, ComplianceReturn } from '@/services/hr-compliance-docs.service';

interface TDSReturn {
  id: string;
  quarter: string;
  financialYear: string;
  formType: '24Q' | '26Q';
  establishment: string;
  tanNumber: string;
  dueDate: string;
  filingDate?: string;
  status: 'draft' | 'filed' | 'overdue' | 'pending_approval';
  totalDeductees: number;
  grossSalary: number;
  totalTDSDeducted: number;
  totalTDSDeposited: number;
  acknowledgmentNumber?: string;
  challanDetails: {
    challanNumber: string;
    date: string;
    amount: number;
  }[];
  remarks?: string;
}

export default function Page() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q3');
  const [selectedYear, setSelectedYear] = useState('2025-26');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [items, setItems] = useState<TDSReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const rows = await HrComplianceDocsService.getReturns('tds');
        if (!active) return;
        const mapped: TDSReturn[] = rows.map((r: ComplianceReturn) => ({
          id: r.id,
          quarter: r.quarter || '',
          financialYear: r.financialYear || '',
          formType: (r.formType as TDSReturn['formType']) || '24Q',
          establishment: r.establishment || '',
          tanNumber: r.registrationNumber || '',
          dueDate: r.dueDate || '',
          filingDate: r.filingDate,
          status: (r.status as TDSReturn['status']) || 'draft',
          totalDeductees: r.totalDeductees || 0,
          grossSalary: r.grossSalary || 0,
          totalTDSDeducted: r.totalDeducted || 0,
          totalTDSDeposited: r.totalPaid || 0,
          acknowledgmentNumber: r.acknowledgmentNumber,
          challanDetails: r.challanDetails || [],
          remarks: r.remarks,
        }));
        setItems(mapped);
        setError(null);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load returns');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const sourceTDSReturns = items;

  const filteredReturns = sourceTDSReturns.filter(ret => {
    const matchesQuarter = selectedQuarter === 'all' || ret.quarter === selectedQuarter;
    const matchesYear = selectedYear === 'all' || ret.financialYear === selectedYear;
    const matchesStatus = selectedStatus === 'all' || ret.status === selectedStatus;
    return matchesQuarter && matchesYear && matchesStatus;
  });

  const stats = {
    totalReturns: sourceTDSReturns.length,
    filed: sourceTDSReturns.filter(r => r.status === 'filed').length,
    pending: sourceTDSReturns.filter(r => r.status === 'pending_approval' || r.status === 'draft').length,
    overdue: sourceTDSReturns.filter(r => r.status === 'overdue').length
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
          <Receipt className="h-6 w-6 text-indigo-600" />
          TDS Returns (Form 24Q)
        </h1>
        <p className="text-sm text-gray-600 mt-1">Quarterly TDS return for salary payments</p>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-500">Loading returns…</div>
      )}
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error} — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-sm border border-indigo-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Total Returns</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{stats.totalReturns}</p>
              <p className="text-xs text-indigo-700 mt-1">Quarterly returns</p>
            </div>
            <Receipt className="h-10 w-10 text-indigo-600 opacity-60" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
            <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Quarters</option>
              <option value="Q1">Q1 (Apr-Jun)</option>
              <option value="Q2">Q2 (Jul-Sep)</option>
              <option value="Q3">Q3 (Oct-Dec)</option>
              <option value="Q4">Q4 (Jan-Mar)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="all">All Years</option>
              <option value="2025-26">FY 2025-26</option>
              <option value="2024-25">FY 2024-25</option>
              <option value="2023-24">FY 2023-24</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
          filteredReturns.map((tdsReturn) => {
            const StatusIcon = statusIcons[tdsReturn.status];
            return (
              <div key={tdsReturn.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Form {tdsReturn.formType} - {tdsReturn.quarter} FY {tdsReturn.financialYear}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex items-center gap-1 ${statusColors[tdsReturn.status]}`}>
                        <StatusIcon className="h-3 w-3" />
                        {tdsReturn.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{tdsReturn.establishment}</p>
                    <p className="text-xs text-gray-600">TAN: {tdsReturn.tanNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Due Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {new Date(tdsReturn.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {tdsReturn.filingDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Filing Date</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(tdsReturn.filingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-medium mb-1">Total Deductees</p>
                    <p className="text-sm font-bold text-gray-900">{tdsReturn.totalDeductees}</p>
                  </div>
                  {tdsReturn.acknowledgmentNumber && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 uppercase font-medium mb-1">Ack. Number</p>
                      <p className="text-sm font-bold text-gray-900">{tdsReturn.acknowledgmentNumber}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase font-medium mb-1">Gross Salary</p>
                    <p className="text-lg font-bold text-blue-900">{formatCurrency(tdsReturn.grossSalary)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <p className="text-xs text-orange-600 uppercase font-medium mb-1">TDS Deducted</p>
                    <p className="text-lg font-bold text-orange-900">{formatCurrency(tdsReturn.totalTDSDeducted)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 uppercase font-medium mb-1">TDS Deposited</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(tdsReturn.totalTDSDeposited)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Challan Details
                  </h4>
                  <div className="space-y-2">
                    {tdsReturn.challanDetails.map((challan, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{challan.challanNumber}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(challan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-indigo-600">{formatCurrency(challan.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {tdsReturn.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-600 uppercase font-medium mb-1">Remarks</p>
                    <p className="text-sm text-yellow-900">{tdsReturn.remarks}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Return
                  </button>
                  {tdsReturn.status === 'draft' && (
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
            <Receipt className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600">No TDS returns for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
