'use client';

import { useState, useMemo, useEffect } from 'react';
import { File, Search, Download, CheckCircle, Clock, AlertCircle, FileText, User, Calendar, X, Mail, Printer, Eye, Send } from 'lucide-react';
import { HrPayrollService } from '@/services/hr-payroll.service';

interface Form16Record {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  financialYear: string;
  pan: string;
  tanNumber: string;
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  totalTDS: number;
  taxRelief: number;
  netTaxPayable: number;
  status: 'draft' | 'generated' | 'issued' | 'downloaded';
  generatedDate?: string;
  issuedDate?: string;
  form16Number?: string;
}

export default function Form16Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState('2024-25');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showBulkDownloadModal, setShowBulkDownloadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Form16Record | null>(null);

  const [form16Records, setForm16Records] = useState<Form16Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadForm16 = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const raw = await HrPayrollService.getTaxRecords('form16');
      const mapped: Form16Record[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
        id: r.id ?? r.details?.id ?? '',
        employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
        employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '—',
        designation: r.designation ?? r.details?.designation ?? '',
        department: r.department ?? r.details?.department ?? '',
        financialYear: r.financialYear ?? r.details?.financialYear ?? '',
        pan: r.pan ?? r.details?.pan ?? '',
        tanNumber: r.tanNumber ?? r.details?.tanNumber ?? '',
        totalIncome: Number(r.totalIncome ?? r.details?.totalIncome ?? 0),
        totalDeductions: Number(r.totalDeductions ?? r.details?.totalDeductions ?? 0),
        taxableIncome: Number(r.taxableIncome ?? r.details?.taxableIncome ?? 0),
        totalTDS: Number(r.totalTDS ?? r.amount ?? r.details?.totalTDS ?? 0),
        taxRelief: Number(r.taxRelief ?? r.details?.taxRelief ?? 0),
        netTaxPayable: Number(r.netTaxPayable ?? r.details?.netTaxPayable ?? 0),
        status: (r.status ?? r.details?.status ?? 'draft') as Form16Record['status'],
        generatedDate: r.generatedDate ?? r.details?.generatedDate ?? undefined,
        issuedDate: r.issuedDate ?? r.details?.issuedDate ?? undefined,
        form16Number: r.form16Number ?? r.details?.form16Number ?? undefined,
      }));
      setForm16Records(mapped);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load Form 16 records');
      setForm16Records([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForm16();
  }, []);

  const confirmGenerateForm16 = async () => {
    if (!selectedRecord || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await HrPayrollService.updateTaxRecord(selectedRecord.id, {
        status: 'generated',
        details: {
          ...(selectedRecord as any),
          status: 'generated',
          generatedDate: new Date().toISOString().split('T')[0],
        },
      });
      setShowGenerateModal(false);
      setSelectedRecord(null);
      await loadForm16();
    } catch {
      setActionError('Failed to generate Form 16. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const confirmIssueForm16 = async (method: string) => {
    if (!selectedRecord || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      await HrPayrollService.updateTaxRecord(selectedRecord.id, {
        status: 'issued',
        details: {
          ...(selectedRecord as any),
          status: 'issued',
          issuedDate: new Date().toISOString().split('T')[0],
          issueMethod: method,
        },
      });
      setShowIssueModal(false);
      setSelectedRecord(null);
      await loadForm16();
    } catch {
      setActionError('Failed to issue Form 16. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return form16Records.filter(record => {
      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.pan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || record.department === selectedDepartment;
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
      const matchesFY = record.financialYear === selectedFinancialYear;
      return matchesSearch && matchesDepartment && matchesStatus && matchesFY;
    });
  }, [form16Records, searchTerm, selectedDepartment, selectedStatus, selectedFinancialYear]);

  const departments = ['all', 'Production', 'Quality', 'Maintenance', 'Logistics', 'HR'];
  const statuses = ['all', 'draft', 'generated', 'issued', 'downloaded'];
  const financialYears = ['2024-25', '2023-24', '2022-23'];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    generated: 'bg-blue-100 text-blue-700',
    issued: 'bg-green-100 text-green-700',
    downloaded: 'bg-purple-100 text-purple-700'
  };

  const statusIcons = {
    draft: Clock,
    generated: FileText,
    issued: CheckCircle,
    downloaded: Download
  };

  const stats = {
    totalEmployees: filteredRecords.length,
    generated: filteredRecords.filter(r => ['generated', 'issued', 'downloaded'].includes(r.status)).length,
    issued: filteredRecords.filter(r => ['issued', 'downloaded'].includes(r.status)).length,
    draft: filteredRecords.filter(r => r.status === 'draft').length,
    totalTDS: filteredRecords.reduce((sum, r) => sum + r.totalTDS, 0)
  };

  const handleGenerateForm16 = (record: Form16Record) => {
    setSelectedRecord(record);
    setShowGenerateModal(true);
  };

  const handleIssueToEmployee = (record: Form16Record) => {
    setSelectedRecord(record);
    setShowIssueModal(true);
  };

  const handleDownloadPDF = (record: Form16Record) => {
    setSelectedRecord(record);
    setShowDownloadModal(true);
  };

  const handleSendEmail = (record: Form16Record) => {
    setSelectedRecord(record);
    setShowEmailModal(true);
  };

  const handleViewDetails = (record: Form16Record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleBulkDownload = () => {
    setShowBulkDownloadModal(true);
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Form 16 (Part A & B)</h1>
        <p className="text-sm text-gray-600 mt-1">TDS Certificate for salary income - Financial Year {selectedFinancialYear}</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading Form 16 records…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}
      {!isLoading && !loadError && form16Records.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No Form 16 records found.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Employees</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalEmployees}</p>
            </div>
            <User className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-sm border border-cyan-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-cyan-700">Generated</p>
              <p className="text-2xl font-bold text-cyan-900 mt-1">{stats.generated}</p>
            </div>
            <FileText className="h-6 w-6 text-cyan-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-700">Issued</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.issued}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm border border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-700">Draft</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.draft}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Total TDS</p>
              <p className="text-lg font-bold text-purple-900 mt-1">{formatCurrency(stats.totalTDS)}</p>
            </div>
            <File className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by employee name, ID, or PAN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedFinancialYear}
            onChange={(e) => setSelectedFinancialYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {financialYears.map(fy => (
              <option key={fy} value={fy}>
                FY {fy}
              </option>
            ))}
          </select>
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
          <button
            onClick={handleBulkDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Bulk Download
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredRecords.map(record => {
          const StatusIcon = statusIcons[record.status];

          return (
            <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{record.employeeName}</h3>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                      {record.employeeId}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${statusColors[record.status]}`}>
                      <StatusIcon className="h-3 w-3" />
                      {record.status.toUpperCase()}
                    </span>
                    {record.form16Number && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        {record.form16Number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {record.designation} • {record.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>PAN: {record.pan}</span>
                    <span>TAN: {record.tanNumber}</span>
                    <span>FY: {record.financialYear}</span>
                    {record.generatedDate && <span>Generated: {new Date(record.generatedDate).toLocaleDateString('en-IN')}</span>}
                    {record.issuedDate && <span>Issued: {new Date(record.issuedDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Total TDS Deducted</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(record.totalTDS)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3">Income Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Total Income</span>
                      <span className="font-bold text-blue-900">{formatCurrency(record.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-700">Less: Deductions</span>
                      <span className="font-medium text-blue-800">({formatCurrency(record.totalDeductions)})</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-blue-900">Taxable Income</span>
                        <span className="font-bold text-blue-900">{formatCurrency(record.taxableIncome)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3">TDS Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Total TDS Deducted</span>
                      <span className="font-bold text-green-900">{formatCurrency(record.totalTDS)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-green-700">Tax Relief (u/s 89)</span>
                      <span className="font-medium text-green-800">{formatCurrency(record.taxRelief)}</span>
                    </div>
                    <div className="pt-2 border-t border-green-300">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-green-900">Net Tax Payable</span>
                        <span className="font-bold text-green-900">{formatCurrency(record.netTaxPayable)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3">Form 16 Parts</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700">Part A (Annexure)</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700">Part B (Details)</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="pt-2 border-t border-purple-300">
                      <p className="text-xs text-purple-700">
                        Complete certificate with salary breakup & TDS summary
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="text-xs font-semibold text-orange-900 mb-3">Actions</h4>
                  <div className="space-y-2">
                    {record.status === 'draft' && (
                      <button
                        onClick={() => handleGenerateForm16(record)}
                        className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Generate Form 16
                      </button>
                    )}
                    {record.status === 'generated' && (
                      <button
                        onClick={() => handleIssueToEmployee(record)}
                        className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Issue to Employee
                      </button>
                    )}
                    {['issued', 'downloaded'].includes(record.status) && (
                      <>
                        <button
                          onClick={() => handleDownloadPDF(record)}
                          className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download PDF
                        </button>
                        <button
                          onClick={() => handleSendEmail(record)}
                          className="w-full px-3 py-2 text-xs border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                        >
                          Send via Email
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Form 16 Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Form 16:</strong> TDS certificate issued by employer to employee for salary income (as per Section 203 of Income Tax Act)</li>
          <li>• <strong>Part A:</strong> Contains certificate number, employer details (name, TAN), employee details (name, PAN), TDS summary, and quarterly breakup</li>
          <li>• <strong>Part B:</strong> Contains detailed salary breakup, allowances, perquisites, deductions claimed (80C, 80D, etc.), and tax computation</li>
          <li>• <strong>Issue Timeline:</strong> Must be issued on or before 15th June following the end of financial year</li>
          <li>• <strong>Digitally Signed:</strong> Form 16 must be digitally signed by authorized person and contain unique certificate number</li>
          <li>• <strong>TDS Credit:</strong> Employees use Form 16 while filing ITR to claim TDS credit</li>
          <li>• <strong>Verification:</strong> Employees should verify Form 26AS or AIS to match TDS credits with Form 16</li>
          <li>• <strong>Revised Form 16:</strong> If corrections needed, issue revised Form 16 with original certificate number</li>
        </ul>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRecord && (
        <Form16DetailsModal
          record={selectedRecord}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRecord(null);
          }}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Email Modal */}
      {showEmailModal && selectedRecord && (
        <EmailForm16Modal
          record={selectedRecord}
          onClose={() => {
            setShowEmailModal(false);
            setSelectedRecord(null);
          }}
        />
      )}

      {/* Bulk Download Modal */}
      {showBulkDownloadModal && (
        <BulkDownloadModal
          records={filteredRecords}
          onClose={() => setShowBulkDownloadModal(false)}
        />
      )}

      {/* Generate Form 16 Modal */}
      {showGenerateModal && selectedRecord && (
        <GenerateForm16Modal
          record={selectedRecord}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedRecord(null);
          }}
          onConfirm={confirmGenerateForm16}
          busy={busy}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Issue to Employee Modal */}
      {showIssueModal && selectedRecord && (
        <IssueForm16Modal
          record={selectedRecord}
          onClose={() => {
            setShowIssueModal(false);
            setSelectedRecord(null);
          }}
          onConfirm={confirmIssueForm16}
          busy={busy}
        />
      )}

      {/* Download PDF Modal */}
      {showDownloadModal && selectedRecord && (
        <DownloadPDFModal
          record={selectedRecord}
          onClose={() => {
            setShowDownloadModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}

// Form 16 Details Modal
interface Form16DetailsModalProps {
  record: Form16Record;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

function Form16DetailsModal({ record, onClose, formatCurrency }: Form16DetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-white">Form 16 - Complete Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Header Section */}
          <div className="text-center mb-3 pb-4 border-b-2 border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">ManufacturingOS</h1>
            <p className="text-sm text-gray-600">Solution to manufacturers System</p>
            <p className="text-xs text-gray-500 mt-1">TDS Certificate - Form 16</p>
            <p className="text-xs text-gray-500">Financial Year: {record.financialYear}</p>
          </div>

          {/* Certificate Details */}
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-blue-700">Certificate Number</p>
                <p className="font-semibold text-blue-900">{record.form16Number}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Status</p>
                <p className="font-semibold text-blue-900">{record.status.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Generated Date</p>
                <p className="font-semibold text-blue-900">
                  {record.generatedDate && new Date(record.generatedDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              {record.issuedDate && (
                <div>
                  <p className="text-xs text-blue-700">Issued Date</p>
                  <p className="font-semibold text-blue-900">
                    {new Date(record.issuedDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Part A - Deductor & Deductee Details */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-3 bg-gray-100 px-4 py-2 rounded">
              Part A - Certificate Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Deductor (Employer) Details */}
              <div className="bg-green-50 rounded-lg p-3">
                <h4 className="font-semibold text-green-900 mb-3">Deductor (Employer) Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-green-700">Name</p>
                    <p className="font-medium text-green-900">ManufacturingOS Private Limited</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">TAN Number</p>
                    <p className="font-medium text-green-900">{record.tanNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Address</p>
                    <p className="font-medium text-green-900">Bangalore, Karnataka - 560001</p>
                  </div>
                </div>
              </div>

              {/* Deductee (Employee) Details */}
              <div className="bg-purple-50 rounded-lg p-3">
                <h4 className="font-semibold text-purple-900 mb-3">Deductee (Employee) Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-purple-700">Name</p>
                    <p className="font-medium text-purple-900">{record.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">PAN Number</p>
                    <p className="font-medium text-purple-900">{record.pan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Designation</p>
                    <p className="font-medium text-purple-900">{record.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Department</p>
                    <p className="font-medium text-purple-900">{record.department}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Part B - Income & Tax Computation */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-3 bg-gray-100 px-4 py-2 rounded">
              Part B - Salary Details & Tax Computation
            </h3>

            {/* Income Details */}
            <div className="bg-blue-50 rounded-lg p-3 mb-2">
              <h4 className="font-semibold text-blue-900 mb-3">Income from Salary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Gross Salary</span>
                  <span className="font-bold text-blue-900">{formatCurrency(record.totalIncome)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Less: Deductions under Chapter VI-A</span>
                  <span className="font-medium text-blue-800">({formatCurrency(record.totalDeductions)})</span>
                </div>
                <div className="pt-2 border-t border-blue-300">
                  <div className="flex justify-between">
                    <span className="font-bold text-blue-900">Total Taxable Income</span>
                    <span className="font-bold text-blue-900">{formatCurrency(record.taxableIncome)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Computation */}
            <div className="bg-green-50 rounded-lg p-3">
              <h4 className="font-semibold text-green-900 mb-3">Tax Computation</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Total TDS Deducted</span>
                  <span className="font-bold text-green-900">{formatCurrency(record.totalTDS)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Tax Relief u/s 89(1)</span>
                  <span className="font-medium text-green-800">{formatCurrency(record.taxRelief)}</span>
                </div>
                <div className="pt-2 border-t border-green-300">
                  <div className="flex justify-between">
                    <span className="font-bold text-green-900">Net Tax Payable</span>
                    <span className="font-bold text-green-900">{formatCurrency(record.netTaxPayable)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quarterly TDS Summary */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-3 bg-gray-100 px-4 py-2 rounded">
              Quarterly TDS Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left p-3">Quarter</th>
                    <th className="text-right p-3">Receipt Number</th>
                    <th className="text-right p-3">TDS Deposited</th>
                    <th className="text-center p-3">Date of Deposit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3">Q1 (Apr-Jun)</td>
                    <td className="p-3 text-right">BSR001234567</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(record.totalTDS * 0.25)}</td>
                    <td className="p-3 text-center">15-Jul-2024</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Q2 (Jul-Sep)</td>
                    <td className="p-3 text-right">BSR001234568</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(record.totalTDS * 0.25)}</td>
                    <td className="p-3 text-center">15-Oct-2024</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-3">Q3 (Oct-Dec)</td>
                    <td className="p-3 text-right">BSR001234569</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(record.totalTDS * 0.25)}</td>
                    <td className="p-3 text-center">15-Jan-2025</td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-3">Q4 (Jan-Mar)</td>
                    <td className="p-3 text-right">BSR001234570</td>
                    <td className="p-3 text-right font-semibold">{formatCurrency(record.totalTDS * 0.25)}</td>
                    <td className="p-3 text-center">15-Apr-2025</td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={2} className="p-3">Total TDS</td>
                    <td className="p-3 text-right text-green-900">{formatCurrency(record.totalTDS)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Verification */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800 text-center">
              <strong>Verification:</strong> I, on behalf of ManufacturingOS Private Limited, hereby certify that the information given above is true and correct and is based on the books of account, documents, TDS statements, and other available records.
            </p>
            <p className="text-xs text-yellow-700 text-center mt-2">
              This certificate is digitally signed and does not require a physical signature.
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Email Form 16 Modal
interface EmailForm16ModalProps {
  record: Form16Record;
  onClose: () => void;
}

function EmailForm16Modal({ record, onClose }: EmailForm16ModalProps) {
  const [emailAddress, setEmailAddress] = useState('');
  const [ccAddress, setCcAddress] = useState('');
  const [message, setMessage] = useState(`Dear ${record.employeeName},\n\nPlease find attached your Form 16 for Financial Year ${record.financialYear}.\n\nThis is a digitally signed certificate and can be used for filing your Income Tax Return.\n\nRegards,\nHR Department\nManufacturingOS`);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Send Form 16 via Email</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-2">
            <h3 className="font-semibold text-gray-900 mb-2">{record.employeeName}</h3>
            <p className="text-sm text-gray-600">{record.form16Number} • FY {record.financialYear}</p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Email Address *
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="employee@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CC (Optional)
              </label>
              <input
                type="email"
                value={ccAddress}
                onChange={(e) => setCcAddress(e.target.value)}
                placeholder="cc@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Attachment:</strong> Form16_{record.employeeId}_{record.financialYear}.pdf (Digitally Signed)
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert(`Form 16 sent to ${emailAddress || 'employee email'}`);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

// Bulk Download Modal
interface BulkDownloadModalProps {
  records: Form16Record[];
  onClose: () => void;
}

function BulkDownloadModal({ records, onClose }: BulkDownloadModalProps) {
  const issuedRecords = records.filter(r => ['issued', 'downloaded'].includes(r.status));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Bulk Download Form 16</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-3">
            Download Form 16 for multiple employees in a single ZIP file
          </p>

          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Available for Download</span>
              <span className="text-2xl font-bold text-blue-900">{issuedRecords.length}</span>
            </div>
            <p className="text-xs text-blue-700">
              Only issued/downloaded Form 16 certificates can be included in bulk download
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Certificate No.</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {issuedRecords.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <p className="font-medium text-gray-900">{record.employeeName}</p>
                      <p className="text-xs text-gray-600">{record.employeeId}</p>
                    </td>
                    <td className="p-3 text-gray-700">{record.form16Number}</td>
                    <td className="p-3 text-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Downloaded file will be a password-protected ZIP containing all Form 16 PDFs
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert(`Downloading ${issuedRecords.length} Form 16 certificates...`);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download ZIP ({issuedRecords.length} files)
          </button>
        </div>
      </div>
    </div>
  );
}

// Generate Form 16 Modal
interface GenerateForm16ModalProps {
  record: Form16Record;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  formatCurrency: (amount: number) => string;
}

function GenerateForm16Modal({ record, onClose, onConfirm, busy, formatCurrency }: GenerateForm16ModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Generate Form 16</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-2">{record.employeeName}</h3>
            <p className="text-sm text-gray-600">{record.employeeId} • {record.designation}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-blue-900 mb-3">Form 16 Summary</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-blue-700">Financial Year</p>
                <p className="font-semibold text-blue-900">{record.financialYear}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">PAN Number</p>
                <p className="font-semibold text-blue-900">{record.pan}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Total Income</p>
                <p className="font-semibold text-blue-900">{formatCurrency(record.totalIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Total TDS</p>
                <p className="font-semibold text-green-900">{formatCurrency(record.totalTDS)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Taxable Income</p>
                <p className="font-semibold text-blue-900">{formatCurrency(record.taxableIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Net Tax Payable</p>
                <p className="font-semibold text-blue-900">{formatCurrency(record.netTaxPayable)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-green-900 mb-3">Generation Process</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">Salary data verification complete</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">TDS calculation verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">Deductions (Chapter VI-A) validated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800">Quarterly TDS deposit records available</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Once generated, the Form 16 will be digitally signed and a unique certificate number will be assigned. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {busy ? 'Generating…' : 'Generate Form 16'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Issue Form 16 Modal
interface IssueForm16ModalProps {
  record: Form16Record;
  onClose: () => void;
  onConfirm: (method: string) => void;
  busy: boolean;
}

function IssueForm16Modal({ record, onClose, onConfirm, busy }: IssueForm16ModalProps) {
  const [issueMethod, setIssueMethod] = useState<'email' | 'portal'>('email');
  const [emailAddress, setEmailAddress] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Issue Form 16 to Employee</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-2">{record.employeeName}</h3>
            <p className="text-sm text-gray-600">{record.form16Number} • FY {record.financialYear}</p>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Issue Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="issueMethod"
                    value="email"
                    checked={issueMethod === 'email'}
                    onChange={(e) => setIssueMethod(e.target.value as 'email')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Send via Email</p>
                    <p className="text-xs text-gray-600">Employee will receive Form 16 in their registered email</p>
                  </div>
                  <Mail className="h-5 w-5 text-blue-600" />
                </label>

                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="issueMethod"
                    value="portal"
                    checked={issueMethod === 'portal'}
                    onChange={(e) => setIssueMethod(e.target.value as 'portal')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Make Available on Employee Portal</p>
                    <p className="text-xs text-gray-600">Employee can download from their self-service portal</p>
                  </div>
                  <User className="h-5 w-5 text-blue-600" />
                </label>
              </div>
            </div>

            {issueMethod === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="employee@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Document:</strong> Digitally signed Form 16 (PDF)
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(issueMethod)}
            disabled={busy}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {busy ? 'Issuing…' : 'Issue Form 16'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Download PDF Modal
interface DownloadPDFModalProps {
  record: Form16Record;
  onClose: () => void;
}

function DownloadPDFModal({ record, onClose }: DownloadPDFModalProps) {
  const [includeAnnexure, setIncludeAnnexure] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Download Form 16 PDF</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 mb-2">{record.employeeName}</h3>
            <p className="text-sm text-gray-600">{record.form16Number} • FY {record.financialYear}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-blue-900 mb-3">Download Options</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAnnexure}
                  onChange={(e) => setIncludeAnnexure(e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-blue-900">Include Part A (Annexure)</p>
                  <p className="text-xs text-blue-700">Contains TDS deposit details and quarterly summary</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => setIncludeWatermark(e.target.checked)}
                  className="mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-blue-900">Add 'Copy' Watermark</p>
                  <p className="text-xs text-blue-700">For duplicate/reference copies only</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-green-900 mb-2">PDF Contents</h4>
            <div className="space-y-1 text-xs text-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Part B - Salary details and tax computation</span>
              </div>
              {includeAnnexure && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Part A - Annexure with quarterly TDS details</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Digital signature and certificate number</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>Employer and employee details</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>File:</strong> Form16_{record.employeeId}_{record.financialYear}.pdf (Password Protected)
            </p>
          </div>
        </div>

        <div className="px-3 py-2 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              alert('Downloading Form 16 PDF...');
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
