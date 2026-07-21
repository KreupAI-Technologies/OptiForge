'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Printer,
  Send,
  Calendar,
  DollarSign,
  TrendingUp,
  Building,
  FileText,
  Mail,
  Phone
} from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface Collection {
  id: string;
  collectionNumber: string;
  collectionDate: string;
  customerName: string;
  customerCode: string;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash' | 'Credit Card' | 'UPI' | 'DD';
  bankAccount: string;
  referenceNumber?: string;
  invoiceNumber?: string;
  amount: number;
  tdsDeducted: number;
  netCollection: number;
  status: 'Draft' | 'Pending Verification' | 'Verified' | 'Deposited' | 'Cleared' | 'Bounced' | 'Cancelled';
  verifiedBy?: string;
  verifiedDate?: string;
  clearedDate?: string;
  description: string;
  costCenter?: string;
  department?: string;
  createdBy: string;
  createdDate: string;
  followUpRequired: boolean;
  collectionAgent: string;
}

export default function CollectionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Collections derived from AR customer accounts (overdue / last-collection data)
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await FinanceService.getReceivables()) as any[];
        const mapped: Collection[] = (raw ?? []).map((c, i) => {
          const lastAmount = Number(c.lastCollectionAmount ?? 0);
          const overdue = Number(c.overdueAmount ?? 0);
          const status: Collection['status'] = overdue > 0 ? 'Pending Verification' : 'Cleared';
          return {
            id: c.id ?? `COL-${i}`,
            collectionNumber: c.customerCode ?? c.customerId ?? `COL-${i}`,
            collectionDate: c.lastCollectionDate ?? '',
            customerName: c.customerName ?? '-',
            customerCode: c.customerCode ?? c.customerId ?? '-',
            paymentMethod: 'Bank Transfer',
            bankAccount: '-',
            referenceNumber: undefined,
            invoiceNumber: undefined,
            amount: lastAmount,
            tdsDeducted: 0,
            netCollection: lastAmount,
            status,
            verifiedBy: undefined,
            verifiedDate: undefined,
            clearedDate: c.lastCollectionDate ?? undefined,
            description: `Outstanding: ₹${Number(c.totalOutstanding ?? 0).toLocaleString()}`,
            costCenter: undefined,
            department: undefined,
            createdBy: '-',
            createdDate: c.lastCollectionDate ?? '',
            followUpRequired: overdue > 0,
            collectionAgent: c.collectionAgent ?? '-',
          };
        });
        if (!cancelled) setCollections(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load collections');
          setCollections([]);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Pending Verification': return 'bg-yellow-100 text-yellow-700';
      case 'Verified': return 'bg-blue-100 text-blue-700';
      case 'Deposited': return 'bg-purple-100 text-purple-700';
      case 'Cleared': return 'bg-green-100 text-green-700';
      case 'Bounced': return 'bg-red-100 text-red-700';
      case 'Cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Cleared': return <CheckCircle className="h-4 w-4" />;
      case 'Bounced': return <XCircle className="h-4 w-4" />;
      case 'Pending Verification': return <Clock className="h-4 w-4" />;
      case 'Deposited': return <TrendingUp className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.collectionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (collection.invoiceNumber && collection.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || collection.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleExport = () => {
    setIsExporting(true);
    try {
      const headers = ['Collection Number', 'Collection Date', 'Customer Name', 'Customer Code', 'Payment Method', 'Invoice Number', 'Amount', 'TDS Deducted', 'Net Collection', 'Status', 'Collection Agent', 'Follow-up Required'];
      const rows = filteredCollections.map(c => [
        c.collectionNumber,
        c.collectionDate,
        c.customerName,
        c.customerCode,
        c.paymentMethod,
        c.invoiceNumber ?? '',
        c.amount,
        c.tdsDeducted,
        c.netCollection,
        c.status,
        c.collectionAgent,
        c.followUpRequired ? 'Yes' : 'No',
      ]);
      const csvContent = [headers, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Collections_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const stats = {
    totalCollections: collections.length,
    totalAmount: collections.reduce((sum, c) => sum + c.netCollection, 0),
    cleared: collections.filter(c => c.status === 'Cleared').length,
    pending: collections.filter(c => c.status === 'Pending Verification').length,
    bounced: collections.filter(c => c.status === 'Bounced').length,
    followUpRequired: collections.filter(c => c.followUpRequired).length
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full h-full px-3 py-2">
          {isLoading && (
            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Loading collections…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-6 w-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">Collections Management</h1>
              </div>
              <p className="text-sm text-gray-600">Track and manage customer payment collections</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={isExporting || filteredCollections.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Record Collection</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Collections</p>
                <Wallet className="h-5 w-5 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{(stats.totalAmount / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalCollections} transactions</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-700">Cleared</p>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.cleared}</p>
              <p className="text-xs text-green-600 mt-1">Funds received</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting verification</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-700">Follow-up</p>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">{stats.followUpRequired}</p>
              <p className="text-xs text-red-600 mt-1">{stats.bounced} bounced</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Verified">Verified</option>
                <option value="Deposited">Deposited</option>
                <option value="Cleared">Cleared</option>
                <option value="Bounced">Bounced</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Methods</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
                <option value="DD">Demand Draft</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Collections Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collection Details
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCollections.map((collection) => (
                    <tr key={collection.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{collection.collectionNumber}</div>
                          <div className="text-xs text-gray-500">{collection.collectionDate}</div>
                          {collection.referenceNumber && (
                            <div className="text-xs text-blue-600 mt-1">Ref: {collection.referenceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{collection.customerName}</div>
                            <div className="text-xs text-gray-500">{collection.customerCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{collection.paymentMethod}</div>
                        <div className="text-xs text-gray-500">{collection.bankAccount}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {collection.invoiceNumber ? (
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600">{collection.invoiceNumber}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-gray-900">₹{collection.netCollection.toLocaleString()}</div>
                        {collection.tdsDeducted > 0 && (
                          <div className="text-xs text-gray-500">TDS: ₹{collection.tdsDeducted.toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                          {getStatusIcon(collection.status)}
                          {collection.status}
                        </span>
                        {collection.followUpRequired && (
                          <div className="text-xs text-red-600 font-semibold mt-1 flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Follow-up
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-800">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-purple-600 hover:text-purple-800">
                            <Printer className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
