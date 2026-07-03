'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Edit, Download, FileText, AlertCircle, CheckCircle,
  Calendar, User, Clock, Hash, DollarSign, BookOpen, RotateCcw,
  TrendingUp, ArrowUpCircle, ArrowDownCircle, Activity, FileCheck,
  Shield, Eye, Printer, Mail, Share2, Archive, Info, ChevronRight
} from 'lucide-react';
import { exportToCsv, printCurrentView } from '@/lib/export';

// TypeScript Interfaces
interface JournalLine {
  id: string;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  dimension1?: string;
  dimension2?: string;
  costCenter?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

interface GLEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  postingDate: string;
  description: string;
  referenceNumber: string;
  sourceDocument: string;
  entryType: 'Manual' | 'System' | 'Adjustment' | 'Closing' | 'Opening' | 'Reversal';
  status: 'Draft' | 'Posted' | 'Reversed';
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
  createdBy: string;
  createdDate: string;
  postedBy?: string;
  postedDate?: string;
  reversedBy?: string;
  reversedDate?: string;
  reversalReason?: string;
  journalLines: JournalLine[];
  auditTrail: AuditEntry[];
  notes?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  approvedDate?: string;
}

// Mock Data
const mockGLEntry: GLEntry = {
  id: 'JE-001',
  entryNumber: 'JE-2025-001',
  entryDate: '2025-10-01',
  postingDate: '2025-10-01',
  description: 'Customer payment received from Hotel Paradise Ltd',
  referenceNumber: 'INV-2025-001',
  sourceDocument: 'Sales Invoice',
  entryType: 'Manual',
  status: 'Posted',
  totalDebit: 172500,
  totalCredit: 172500,
  isBalanced: true,
  difference: 0,
  createdBy: 'John Accountant',
  createdDate: '2025-10-01 09:30:00',
  postedBy: 'Finance Manager',
  postedDate: '2025-10-01 10:15:00',
  notes: 'Payment received via bank transfer. Reference number: TXN-2025-10-001',
  approvalStatus: 'Approved',
  approvedBy: 'Finance Manager',
  approvedDate: '2025-10-01 10:10:00',
  journalLines: [
    {
      id: 'JL-001',
      lineNumber: 1,
      accountCode: '1000',
      accountName: 'Cash - Operating Account',
      description: 'Customer payment received',
      debitAmount: 172500,
      creditAmount: 0,
      costCenter: 'CC-001',
      dimension1: 'North Region',
      dimension2: 'Hotel Sales',
    },
    {
      id: 'JL-002',
      lineNumber: 2,
      accountCode: '1100',
      accountName: 'Accounts Receivable - Trade',
      description: 'Clear receivable from Hotel Paradise Ltd',
      debitAmount: 0,
      creditAmount: 172500,
      costCenter: 'CC-001',
      dimension1: 'North Region',
      dimension2: 'Hotel Sales',
    },
  ],
  auditTrail: [
    {
      id: 'AUDIT-001',
      timestamp: '2025-10-01 09:30:00',
      action: 'Entry Created',
      performedBy: 'John Accountant',
      details: 'Journal entry JE-2025-001 created as draft',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 'AUDIT-002',
      timestamp: '2025-10-01 09:45:00',
      action: 'Lines Added',
      performedBy: 'John Accountant',
      details: 'Added 2 journal lines with total debit ₹172,500 and credit ₹172,500',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 'AUDIT-003',
      timestamp: '2025-10-01 10:10:00',
      action: 'Approval Requested',
      performedBy: 'John Accountant',
      details: 'Submitted entry for approval',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 'AUDIT-004',
      timestamp: '2025-10-01 10:10:00',
      action: 'Entry Approved',
      performedBy: 'Finance Manager',
      details: 'Entry approved for posting',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 'AUDIT-005',
      timestamp: '2025-10-01 10:15:00',
      action: 'Entry Posted',
      performedBy: 'Finance Manager',
      details: 'Journal entry posted to General Ledger',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: 'AUDIT-006',
      timestamp: '2025-10-01 14:30:00',
      action: 'Entry Viewed',
      performedBy: 'Auditor',
      details: 'Entry details accessed for review',
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  ],
};

export default function GLEntryViewPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [entry] = useState<GLEntry>(mockGLEntry);
  const [activeTab, setActiveTab] = useState<'details' | 'lines' | 'audit'>('details');
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [reversalReason, setReversalReason] = useState('');

  const statusConfig = {
    Draft: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Clock },
    Posted: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
    Reversed: { color: 'bg-red-100 text-red-700 border-red-300', icon: RotateCcw },
  };

  const entryTypeConfig = {
    Manual: { color: 'bg-blue-100 text-blue-700', icon: Edit },
    System: { color: 'bg-purple-100 text-purple-700', icon: Activity },
    Adjustment: { color: 'bg-orange-100 text-orange-700', icon: TrendingUp },
    Closing: { color: 'bg-red-100 text-red-700', icon: Archive },
    Opening: { color: 'bg-green-100 text-green-700', icon: FileCheck },
    Reversal: { color: 'bg-pink-100 text-pink-700', icon: RotateCcw },
  };

  const handleReverseEntry = () => {
    if (!reversalReason.trim()) {
      alert('Please provide a reason for reversal');
      return;
    }
    console.log('Reversing entry:', entryId, 'Reason:', reversalReason);
    alert('Entry reversed successfully!');
    setShowReverseModal(false);
  };

  const handleExport = (_format: 'pdf' | 'excel') => {
    exportToCsv(`journal-entry-${entryId}`, entry.journalLines as unknown as Record<string, unknown>[]);
  };

  const handlePrint = () => {
    printCurrentView();
  };

  const handleEmail = () => {
    alert('Email functionality will open email client');
  };

  const StatusIcon = statusConfig[entry.status].icon;
  const TypeIcon = entryTypeConfig[entry.entryType].icon;

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{entry.entryNumber}</h1>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusConfig[entry.status].color}`}>
                  <StatusIcon className="h-3 w-3 inline mr-1" />
                  {entry.status}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${entryTypeConfig[entry.entryType].color}`}>
                  <TypeIcon className="h-3 w-3 inline mr-1" />
                  {entry.entryType}
                </span>
              </div>
              <p className="text-gray-600">{entry.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Entry Date: {entry.entryDate}
                </span>
                <span className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  Ref: {entry.referenceNumber}
                </span>
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Created by: {entry.createdBy}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {entry.status === 'Draft' && (
              <button
                onClick={() => router.push(`/finance/accounting/edit/${entryId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
            {entry.status === 'Posted' && (
              <button
                onClick={() => setShowReverseModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reverse Entry</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </button>
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg"
                >
                  Export as Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Check Alert */}
        {entry.isBalanced ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900">Entry Balanced</h3>
              <p className="text-sm text-green-700 mt-1">
                Total Debits (₹{entry.totalDebit.toLocaleString()}) = Total Credits (₹{entry.totalCredit.toLocaleString()})
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900">Entry Not Balanced</h3>
              <p className="text-sm text-red-700 mt-1">
                Difference: ₹{Math.abs(entry.difference).toLocaleString()} ({entry.difference > 0 ? 'Debit' : 'Credit'} excess)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-3">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Info className="h-4 w-4 inline mr-2" />
            Entry Details
          </button>
          <button
            onClick={() => setActiveTab('lines')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'lines'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <BookOpen className="h-4 w-4 inline mr-2" />
            Journal Lines ({entry.journalLines.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'audit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Audit Trail ({entry.auditTrail.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Entry Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Entry Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Entry Number:</span>
                <span className="text-sm font-semibold text-gray-900">{entry.entryNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Entry Type:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded ${entryTypeConfig[entry.entryType].color}`}>
                  {entry.entryType}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded border ${statusConfig[entry.status].color}`}>
                  {entry.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Entry Date:</span>
                <span className="text-sm font-medium text-gray-900">{entry.entryDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Posting Date:</span>
                <span className="text-sm font-medium text-gray-900">{entry.postingDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Reference Number:</span>
                <span className="text-sm font-medium text-blue-600">{entry.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Source Document:</span>
                <span className="text-sm font-medium text-gray-900">{entry.sourceDocument}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm font-medium text-gray-900 text-right">{entry.description}</span>
              </div>
            </div>
          </div>

          {/* Amounts Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Amounts Summary
            </h2>
            <div className="space-y-2">
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Total Debits</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">₹{entry.totalDebit.toLocaleString()}</p>
                  </div>
                  <ArrowUpCircle className="h-10 w-10 text-orange-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Credits</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">₹{entry.totalCredit.toLocaleString()}</p>
                  </div>
                  <ArrowDownCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className={`bg-gradient-to-br rounded-lg p-3 border ${entry.isBalanced
                  ? 'from-blue-50 to-blue-100 border-blue-200'
                  : 'from-red-50 to-red-100 border-red-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${entry.isBalanced ? 'text-blue-600' : 'text-red-600'}`}>
                      Difference
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${entry.isBalanced ? 'text-blue-900' : 'text-red-900'}`}>
                      ₹{Math.abs(entry.difference).toLocaleString()}
                    </p>
                    <p className={`text-xs mt-1 ${entry.isBalanced ? 'text-blue-600' : 'text-red-600'}`}>
                      {entry.isBalanced ? 'Balanced ✓' : 'Not Balanced'}
                    </p>
                  </div>
                  {entry.isBalanced ? (
                    <CheckCircle className="h-10 w-10 text-blue-600" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <User className="h-5 w-5 mr-2 text-purple-600" />
              User Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Created By:</span>
                <span className="text-sm font-medium text-gray-900">{entry.createdBy}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Created Date:</span>
                <span className="text-sm font-medium text-gray-900">{entry.createdDate}</span>
              </div>
              {entry.postedBy && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Posted By:</span>
                    <span className="text-sm font-medium text-gray-900">{entry.postedBy}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Posted Date:</span>
                    <span className="text-sm font-medium text-gray-900">{entry.postedDate}</span>
                  </div>
                </>
              )}
              {entry.approvalStatus && (
                <>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Approval Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${entry.approvalStatus === 'Approved' ? 'bg-green-100 text-green-700' :
                        entry.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {entry.approvalStatus}
                    </span>
                  </div>
                  {entry.approvedBy && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Approved By:</span>
                        <span className="text-sm font-medium text-gray-900">{entry.approvedBy}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Approved Date:</span>
                        <span className="text-sm font-medium text-gray-900">{entry.approvedDate}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {entry.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Notes
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'lines' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Line #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit (₹)</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit (₹)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost Center</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entry.journalLines.map((line) => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {line.lineNumber}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-mono font-semibold text-blue-600">{line.accountCode}</div>
                      <div className="text-sm text-gray-700">{line.accountName}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{line.description}</div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {line.debitAmount > 0 ? (
                        <span className="font-bold text-orange-700">
                          {line.debitAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {line.creditAmount > 0 ? (
                        <span className="font-bold text-green-700">
                          {line.creditAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {line.costCenter ? (
                        <span className="text-sm text-gray-700">{line.costCenter}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        {line.dimension1 && (
                          <div className="text-xs text-gray-600">D1: {line.dimension1}</div>
                        )}
                        {line.dimension2 && (
                          <div className="text-xs text-gray-600">D2: {line.dimension2}</div>
                        )}
                        {!line.dimension1 && !line.dimension2 && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-bold text-gray-900">
                    Totals:
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-bold text-orange-700 text-lg">
                      ₹{entry.totalDebit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-bold text-green-700 text-lg">
                      ₹{entry.totalCredit.toLocaleString()}
                    </span>
                  </td>
                  <td colSpan={2} className="px-3 py-2">
                    {entry.isBalanced ? (
                      <span className="flex items-center text-sm text-green-700 font-semibold">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Balanced
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-red-700 font-semibold">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Difference: ₹{Math.abs(entry.difference).toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {entry.auditTrail.map((audit, index) => (
              <div key={audit.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {audit.performedBy.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{audit.action}</h3>
                        <p className="text-sm text-gray-600 mt-1">{audit.details}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {audit.performedBy}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {audit.timestamp}
                          </span>
                          <span className="flex items-center">
                            <Shield className="h-3 w-3 mr-1" />
                            {audit.ipAddress}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-4">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reverse Entry Modal */}
      {showReverseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <RotateCcw className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reverse Entry</h2>
                  <p className="text-sm text-gray-600">Entry: {entry.entryNumber}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Reversal *
                </label>
                <textarea
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter the reason for reversing this entry..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  This action will create a reversal entry and mark the original entry as reversed. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowReverseModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReverseEntry}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Reversal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
