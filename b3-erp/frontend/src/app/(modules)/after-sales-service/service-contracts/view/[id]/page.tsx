'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Edit,
  Download,
  Mail,
  Printer,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Phone,
  Building2,
  AlertCircle,
  TrendingUp,
  Activity,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface ServiceHistory {
  id: string;
  ticketNumber: string;
  date: string;
  type: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  engineer: string;
  description: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
}

export default function ViewContractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'invoices'>('details');

  // Mock Contract Data
  const contract = {
    id: params.id,
    contractNumber: 'AMC-2025-0001',
    contractType: 'AMC',
    status: 'Active',

    // Customer
    customer: {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      gstin: '29ABCDE1234F1Z5',
      address: '123, MG Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      primaryContact: {
        name: 'Rajesh Sharma',
        designation: 'Operations Manager',
        phone: '+91-98765-43210',
        email: 'rajesh.sharma@sharmakitchens.com'
      }
    },

    // Dates
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    signedDate: '2024-12-28',
    daysRemaining: 318,

    // SLA
    responseTimeSLA: 4,
    resolutionTimeSLA: 24,
    coverageHours: 'Business Hours (9 AM - 6 PM)',

    // Financial
    contractValue: 450000,
    taxAmount: 81000,
    totalValue: 531000,
    billingFrequency: 'Annually',
    paymentTerms: 'Net 30',
    autoRenewal: true,
    renewalNoticeDays: 30,

    // Line Items
    lineItems: [
      {
        description: 'Preventive Maintenance - Kitchen Equipment',
        quantity: 4,
        unitPrice: 5000,
        frequency: 'Quarterly',
        amount: 20000
      },
      {
        description: 'Emergency Repair Services',
        quantity: 1,
        unitPrice: 150000,
        frequency: 'Annually',
        amount: 150000
      },
      {
        description: 'Parts Coverage - Premium',
        quantity: 1,
        unitPrice: 280000,
        frequency: 'Annually',
        amount: 280000
      }
    ],

    // Terms
    inclusions: '• Preventive maintenance visits (quarterly)\n• Emergency repair services (unlimited calls)\n• Parts replacement (up to ₹50,000 per incident)\n• Labor charges\n• Routine inspections',
    exclusions: '• Consumables and supplies\n• Damages due to misuse or negligence\n• Third-party equipment\n• Cosmetic repairs\n• Upgrades and modifications',
    specialTerms: '• Priority response for P1 incidents\n• Dedicated service engineer\n• Annual performance review meeting',

    // Performance Metrics
    metrics: {
      serviceRequests: 12,
      completed: 10,
      inProgress: 2,
      slaCompliance: 95,
      avgResponseTime: 3.2,
      avgResolutionTime: 18.5,
      customerRating: 4.8
    },

    // Contacts
    additionalContacts: [
      {
        name: 'Priya Sharma',
        designation: 'Facility Manager',
        phone: '+91-98765-43211',
        email: 'priya.sharma@sharmakitchens.com',
        isPrimary: false
      }
    ],

    createdBy: 'Admin User',
    createdDate: '2024-12-28',
    lastModified: '2025-01-05'
  };

  // Mock Service History
  // Service history + invoices derived from the contract record.
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);

  // Mock Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const c = (await AfterSalesPagesService.contract(params.id)) as any;
        const sh: ServiceHistory[] = (Array.isArray(c?.serviceHistory) ? c.serviceHistory : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          ticketNumber: r?.ticketNumber ?? r?.requestNumber ?? '',
          date: r?.date ?? r?.createdAt ?? '',
          type: r?.type ?? r?.serviceType ?? '',
          status: (r?.status ?? 'Pending') as ServiceHistory['status'],
          engineer: r?.engineer ?? r?.assignedTo ?? '',
          description: r?.description ?? '',
        }));
        const inv: Invoice[] = (Array.isArray(c?.invoices) ? c.invoices : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          invoiceNumber: r?.invoiceNumber ?? '',
          date: r?.date ?? r?.invoiceDate ?? '',
          amount: Number(r?.amount ?? r?.totalAmount ?? 0) || 0,
          status: (r?.status ?? 'Pending') as Invoice['status'],
          dueDate: r?.dueDate ?? '',
        }));
        if (!cancelled) { setServiceHistory(sh); setInvoices(inv); }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load contract details');
          setServiceHistory([]); setInvoices([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Expiring Soon': return 'bg-orange-100 text-orange-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{contract.contractNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
              {contract.status}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {contract.contractType}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Valid from {formatDate(contract.startDate)} to {formatDate(contract.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/after-sales-service/service-contracts/edit/${contract.id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => router.push(`/after-sales-service/service-contracts/renew/${contract.id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Renew
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Service Requests</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{contract.metrics.serviceRequests}</div>
          <div className="text-xs text-gray-500 mt-1">{contract.metrics.completed} completed, {contract.metrics.inProgress} in progress</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">SLA Compliance</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{contract.metrics.slaCompliance}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${contract.metrics.slaCompliance}%` }} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Response Time</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{contract.metrics.avgResponseTime}h</div>
          <div className="text-xs text-gray-500 mt-1">Target: {contract.responseTimeSLA}h</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Customer Rating</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{contract.metrics.customerRating}</div>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-sm ${i < Math.floor(contract.metrics.customerRating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Status Alert */}
      {contract.daysRemaining < 90 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900">Contract Expiring Soon</h3>
              <p className="text-sm text-orange-800 mt-1">
                This contract will expire in {contract.daysRemaining} days on {formatDate(contract.endDate)}.
                {contract.autoRenewal && ` Auto-renewal is enabled with ${contract.renewalNoticeDays} days notice.`}
              </p>
              <button
                onClick={() => router.push(`/after-sales-service/service-contracts/renew/${contract.id}`)}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700"
              >
                <RefreshCw className="w-3 h-3" />
                Initiate Renewal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Contract Details
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Service History ({serviceHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Customer Information */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Customer Name</div>
                      <div className="font-medium text-gray-900">{contract.customer.name}</div>
                      <div className="text-xs text-gray-500">{contract.customer.id}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Service Address</div>
                      <div className="text-gray-900">
                        {contract.customer.address}<br />
                        {contract.customer.city}, {contract.customer.state} - {contract.customer.pincode}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">GSTIN</div>
                      <div className="font-medium text-gray-900">{contract.customer.gstin}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Primary Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">{contract.customer.primaryContact.name}</div>
                      <div className="text-sm text-gray-500">{contract.customer.primaryContact.designation}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="text-gray-900">{contract.customer.primaryContact.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="text-gray-900">{contract.customer.primaryContact.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Contract Terms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Contract Period</span>
                </div>
                <div className="text-gray-900">
                  {formatDate(contract.startDate)} to {formatDate(contract.endDate)}
                </div>
                <div className="text-xs text-gray-500 mt-1">{contract.daysRemaining} days remaining</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">SLA Terms</span>
                </div>
                <div className="text-sm text-gray-900">
                  Response: {contract.responseTimeSLA}h<br />
                  Resolution: {contract.resolutionTimeSLA}h
                </div>
                <div className="text-xs text-gray-500 mt-1">{contract.coverageHours}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Payment Terms</span>
                </div>
                <div className="text-sm text-gray-900">
                  Billing: {contract.billingFrequency}<br />
                  Terms: {contract.paymentTerms}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {contract.autoRenewal ? `Auto-renewal enabled (${contract.renewalNoticeDays} days notice)` : 'Auto-renewal disabled'}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Contract Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contract.lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {item.frequency}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="w-full md:w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(contract.contractValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%):</span>
                    <span className="font-medium text-gray-900">{formatCurrency(contract.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                    <span className="font-semibold text-gray-900">Total Contract Value:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(contract.totalValue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Inclusions</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">{contract.inclusions}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Exclusions</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">{contract.exclusions}</div>
            </div>
          </div>

          {contract.specialTerms && (
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Special Terms</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">{contract.specialTerms}</div>
            </div>
          )}
        </div>
      )}

      {/* Service History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Service History</h2>
            <p className="text-sm text-gray-500 mt-1">All service requests under this contract</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Engineer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {serviceHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                      {record.ticketNumber}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatDate(record.date)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{record.type}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          record.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{record.engineer}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{record.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            <p className="text-sm text-gray-500 mt-1">Billing and payment history for this contract</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatDate(invoice.date)}</td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(invoice.amount)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatDate(invoice.dueDate)}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
