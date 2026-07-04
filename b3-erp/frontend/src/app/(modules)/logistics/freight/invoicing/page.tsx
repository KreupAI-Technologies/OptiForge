'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, FileText, DollarSign, CheckCircle, Clock, XCircle, AlertTriangle, AlertCircle, Filter, Download, Eye } from 'lucide-react';
import { LogisticsService } from '@/services/logistics.service';

interface FreightInvoice {
  id: string;
  invoiceNo: string;
  bookingNo: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  baseAmount: number;
  fuelSurcharge: number;
  insuranceCharge: number;
  handlingCharge: number;
  customsCharge: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  carrier: string;
  origin: string;
  destination: string;
  billOfLading: string;
}

export default function FreightInvoicingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const invoices: FreightInvoice[] = [
    {
      id: '1',
      invoiceNo: 'INV-2025-3001',
      bookingNo: 'FB-2025-2001',
      customerName: 'ABC Manufacturing Ltd',
      invoiceDate: '2025-10-25',
      dueDate: '2025-11-24',
      baseAmount: 397700,
      fuelSurcharge: 48500,
      insuranceCharge: 14550,
      handlingCharge: 24250,
      customsCharge: 0,
      tax: 0,
      totalAmount: 485000,
      paidAmount: 0,
      balanceAmount: 485000,
      status: 'sent',
      paymentTerms: 'Net 30',
      carrier: 'Maersk Line',
      origin: 'Chennai Port',
      destination: 'Singapore Port',
      billOfLading: 'BL-2025-8765'
    },
    {
      id: '2',
      invoiceNo: 'INV-2025-3002',
      bookingNo: 'FB-2025-2002',
      customerName: 'Global Traders Inc',
      invoiceDate: '2025-10-22',
      dueDate: '2025-11-21',
      baseAmount: 731800,
      fuelSurcharge: 89000,
      insuranceCharge: 26700,
      handlingCharge: 44500,
      customsCharge: 35000,
      tax: 0,
      totalAmount: 927000,
      paidAmount: 927000,
      balanceAmount: 0,
      status: 'paid',
      paymentTerms: 'Net 30',
      carrier: 'Emirates SkyCargo',
      origin: 'Mumbai Airport',
      destination: 'Dubai Airport',
      billOfLading: 'AWB-2025-4532'
    },
    {
      id: '3',
      invoiceNo: 'INV-2025-3003',
      bookingNo: 'FB-2025-2003',
      customerName: 'TechCorp Solutions',
      invoiceDate: '2025-10-24',
      dueDate: '2025-11-08',
      baseAmount: 152250,
      fuelSurcharge: 18500,
      insuranceCharge: 5550,
      handlingCharge: 9250,
      customsCharge: 0,
      tax: 0,
      totalAmount: 185550,
      paidAmount: 100000,
      balanceAmount: 85550,
      status: 'partial',
      paymentTerms: 'Net 15',
      carrier: 'VRL Logistics',
      origin: 'Bangalore',
      destination: 'Delhi',
      billOfLading: 'LR-2025-9876'
    },
    {
      id: '4',
      invoiceNo: 'INV-2025-3004',
      bookingNo: 'FB-2025-2004',
      customerName: 'Precision Parts Ltd',
      invoiceDate: '2025-10-26',
      dueDate: '2025-11-25',
      baseAmount: 102500,
      fuelSurcharge: 12500,
      insuranceCharge: 3750,
      handlingCharge: 6250,
      customsCharge: 0,
      tax: 0,
      totalAmount: 125000,
      paidAmount: 0,
      balanceAmount: 125000,
      status: 'sent',
      paymentTerms: 'Net 30',
      carrier: 'Indian Railways',
      origin: 'Chennai',
      destination: 'Kolkata',
      billOfLading: 'RR-2025-3456'
    },
    {
      id: '5',
      invoiceNo: 'INV-2025-3005',
      bookingNo: 'FB-2025-2005',
      customerName: 'Eastern Electronics',
      invoiceDate: '2025-10-28',
      dueDate: '2025-11-27',
      baseAmount: 512500,
      fuelSurcharge: 62500,
      insuranceCharge: 18750,
      handlingCharge: 31250,
      customsCharge: 0,
      tax: 0,
      totalAmount: 625000,
      paidAmount: 0,
      balanceAmount: 625000,
      status: 'draft',
      paymentTerms: 'Net 30',
      carrier: 'COSCO Shipping',
      origin: 'Visakhapatnam Port',
      destination: 'Hong Kong Port',
      billOfLading: 'BL-2025-5432'
    },
    {
      id: '6',
      invoiceNo: 'INV-2025-3006',
      bookingNo: 'FB-2025-2006',
      customerName: 'Metro Wholesale',
      invoiceDate: '2025-10-21',
      dueDate: '2025-11-05',
      baseAmount: 78000,
      fuelSurcharge: 9500,
      insuranceCharge: 2850,
      handlingCharge: 4750,
      customsCharge: 0,
      tax: 0,
      totalAmount: 95100,
      paidAmount: 95100,
      balanceAmount: 0,
      status: 'paid',
      paymentTerms: 'Net 15',
      carrier: 'Gati Ltd',
      origin: 'Hyderabad',
      destination: 'Mumbai',
      billOfLading: 'LR-2025-7654'
    },
    {
      id: '7',
      invoiceNo: 'INV-2025-3007',
      bookingNo: 'FB-2025-2007',
      customerName: 'Northern Distributors',
      invoiceDate: '2025-10-19',
      dueDate: '2025-10-26',
      baseAmount: 1025000,
      fuelSurcharge: 125000,
      insuranceCharge: 37500,
      handlingCharge: 62500,
      customsCharge: 45000,
      tax: 0,
      totalAmount: 1295000,
      paidAmount: 0,
      balanceAmount: 1295000,
      status: 'overdue',
      paymentTerms: 'Net 7',
      carrier: 'Lufthansa Cargo',
      origin: 'Delhi Airport',
      destination: 'Frankfurt Airport',
      billOfLading: 'AWB-2025-8901'
    },
    {
      id: '8',
      invoiceNo: 'INV-2025-3008',
      bookingNo: 'FB-2025-2008',
      customerName: 'Coastal Enterprises',
      invoiceDate: '2025-10-15',
      dueDate: '2025-10-30',
      baseAmount: 176250,
      fuelSurcharge: 21500,
      insuranceCharge: 6450,
      handlingCharge: 10750,
      customsCharge: 8500,
      tax: 0,
      totalAmount: 223450,
      paidAmount: 0,
      balanceAmount: 0,
      status: 'cancelled',
      paymentTerms: 'Net 15',
      carrier: 'Sri Lanka Shipping',
      origin: 'Kochi',
      destination: 'Colombo',
      billOfLading: 'BL-2025-2109'
    }
  ];

  const invoiceStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    partial: invoices.filter(i => i.status === 'partial').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalBilled: invoices.filter(i => i.status !== 'cancelled').reduce((sum, i) => sum + i.totalAmount, 0),
    totalReceived: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
    totalOutstanding: invoices.filter(i => i.status !== 'cancelled' && i.status !== 'paid').reduce((sum, i) => sum + i.balanceAmount, 0)
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.bookingNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'partial': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Freight Invoicing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage freight invoices and payments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{invoiceStats.total}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Invoices</p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{invoiceStats.draft}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Draft</p>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{invoiceStats.sent}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Sent</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{invoiceStats.partial}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Partial</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{invoiceStats.paid}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Paid</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-7 h-7 opacity-80" />
            <span className="text-2xl font-bold">{invoiceStats.overdue}</span>
          </div>
          <p className="text-xs font-medium opacity-90">Overdue</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-7 h-7 opacity-80" />
            <span className="text-lg font-bold">�{(invoiceStats.totalBilled / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-xs font-medium opacity-90">Total Billed</p>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-7 h-7 opacity-80" />
            <span className="text-lg font-bold">�{(invoiceStats.totalReceived / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-xs font-medium opacity-90">Received</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-7 h-7 opacity-80" />
            <span className="text-lg font-bold">�{(invoiceStats.totalOutstanding / 1000000).toFixed(1)}M</span>
          </div>
          <p className="text-xs font-medium opacity-90">Outstanding</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice no, booking no, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredInvoices.length} of {invoiceStats.total} invoices</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Invoice Details</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Paid</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Balance</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Dates</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <p className="text-sm font-bold text-gray-900">{invoice.invoiceNo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{invoice.bookingNo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{invoice.billOfLading}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">{invoice.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{invoice.carrier}</p>
                    <p className="text-xs text-gray-600 mt-1">{invoice.origin} � {invoice.destination}</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <p className="text-sm font-bold text-gray-900">�{invoice.totalAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Base: �{invoice.baseAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <p className="text-sm font-semibold text-green-600">�{invoice.paidAmount.toLocaleString()}</p>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <p className={`text-sm font-semibold ${invoice.balanceAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      �{invoice.balanceAmount.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-xs text-gray-600">Invoice: {invoice.invoiceDate}</p>
                    <p className="text-xs text-gray-600 mt-1">Due: {invoice.dueDate}</p>
                    <p className="text-xs text-orange-600 mt-1">{invoice.paymentTerms}</p>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Eye className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">View</span>
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Download className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Download</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInvoices.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <p className="text-gray-500 text-lg mb-2">No invoices found</p>
          <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Invoice Status Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
          <div><span className="font-medium">Draft:</span> Invoice created but not yet sent</div>
          <div><span className="font-medium">Sent:</span> Invoice sent to customer, awaiting payment</div>
          <div><span className="font-medium">Partial:</span> Partial payment received</div>
          <div><span className="font-medium">Paid:</span> Full payment received</div>
          <div><span className="font-medium">Overdue:</span> Payment deadline has passed</div>
          <div><span className="font-medium">Cancelled:</span> Invoice cancelled due to booking cancellation</div>
        </div>
      </div>
    </div>
  );
}
