'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import { InvoiceService } from '@/services/invoice.service';
import {
  ArrowLeft,
  Edit,
  Receipt,
  Send,
  Download,
  DollarSign,
  Calendar,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  Share2,
  XCircle,
  IndianRupee,
  Package,
  User,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  customer: string;
  customerGST: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  poReference: string;
  paymentTerms: string;
  notes: string;
}

interface InvoiceLineItem {
  id: string;
  item: string;
  description: string;
  hsn: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxType: 'CGST+SGST' | 'IGST';
  taxAmount: number;
  total: number;
}

interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  notes: string;
  recordedBy: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const emptyAddress: Address = {
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
};

const statusConfig = {
  draft: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText, label: 'Draft' },
  sent: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Send, label: 'Sent' },
  partially_paid: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'Partially Paid' },
  paid: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Paid' },
  overdue: { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle, label: 'Overdue' },
  cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle, label: 'Cancelled' },
};

const getProgressStages = (status: Invoice['status']) => {
  const allStages = ['draft', 'sent', 'partially_paid', 'paid'];
  const currentIndex = allStages.indexOf(status);

  return [
    { id: 'draft', name: 'Draft', completed: currentIndex > 0 || status === 'draft', current: status === 'draft' },
    { id: 'sent', name: 'Sent', completed: currentIndex > 1, current: status === 'sent' },
    { id: 'partially_paid', name: 'Partially Paid', completed: currentIndex > 2, current: status === 'partially_paid' },
    { id: 'paid', name: 'Paid', completed: status === 'paid', current: status === 'paid' },
  ];
};

export default function ViewInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [billingAddress, setBillingAddress] = useState<Address>(emptyAddress);
  const [shippingAddress, setShippingAddress] = useState<Address>(emptyAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);

  const loadInvoice = async () => {
    if (!invoiceId) return;
    try {
      setIsLoading(true);
      const raw = await FinanceService.getInvoice(invoiceId);
      const m: any = raw || {};
        const validStatuses = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'];
        setInvoice({
          id: m.id != null ? String(m.id) : String(invoiceId),
          invoiceNumber: m.invoiceNumber != null ? String(m.invoiceNumber) : '',
          status: validStatuses.includes(m.status) ? m.status : 'draft',
          customer: m.customer != null ? String(m.customer) : '',
          customerGST: m.customerGST != null ? String(m.customerGST) : '',
          invoiceDate: m.invoiceDate != null ? String(m.invoiceDate) : '',
          dueDate: m.dueDate != null ? String(m.dueDate) : '',
          subtotal: Number(m.subtotal ?? 0),
          cgst: Number(m.cgst ?? 0),
          sgst: Number(m.sgst ?? 0),
          igst: Number(m.igst ?? 0),
          discount: Number(m.discount ?? 0),
          total: Number(m.total ?? 0),
          paidAmount: Number(m.paidAmount ?? 0),
          balanceDue: Number(m.balanceDue ?? 0),
          poReference: m.poReference != null ? String(m.poReference) : '',
          paymentTerms: m.paymentTerms != null ? String(m.paymentTerms) : '',
          notes: m.notes != null ? String(m.notes) : '',
        });
      setLineItems(Array.isArray(m.lineItems) ? m.lineItems : []);
      setPayments(Array.isArray(m.payments) ? m.payments : []);
      setBillingAddress(m.billingAddress ?? emptyAddress);
      setShippingAddress(m.shippingAddress ?? emptyAddress);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!invoiceId) {
      setIsLoading(false);
      return;
    }
    void loadInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  const handleVoid = async () => {
    if (!invoiceId || !voidReason.trim()) return;
    try {
      setIsVoiding(true);
      await InvoiceService.voidInvoice(invoiceId, voidReason.trim());
      setShowVoidModal(false);
      setVoidReason('');
      await loadInvoice();
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to void invoice');
    } finally {
      setIsVoiding(false);
    }
  };

  const handleDownloadPdf = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'line_items' | 'payment_history'>('overview');

  if (isLoading && !invoice) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
        {loadError && (
          <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {loadError}
          </div>
        )}
        <div className="p-6 text-gray-500">Invoice not found</div>
      </div>
    );
  }

  const statusInfo = statusConfig[invoice.status];
  const StatusIcon = statusInfo.icon;
  const progressStages = getProgressStages(invoice.status);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'line_items', name: 'Line Items', icon: Package },
    { id: 'payment_history', name: 'Payment History', icon: CreditCard },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/finance/invoices')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Invoices</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Invoice Header Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-4 flex-1">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Receipt className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-lg text-gray-600">{invoice.customer}</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusInfo.color}`}>
                    <StatusIcon className="h-4 w-4 inline mr-1" />
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">GST: {invoice.customerGST}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">PO: {invoice.poReference}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/finance/invoices/edit/${invoiceId}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Send className="h-4 w-4" />
                <span>Send Email</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <CreditCard className="h-4 w-4" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              {invoice.status !== 'cancelled' && (
                <button
                  onClick={() => setShowVoidModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Void</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Invoice Amount</p>
              <p className="text-2xl font-bold text-blue-900">₹{invoice.total.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-green-900">₹{invoice.paidAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <p className="text-xs font-medium text-orange-600 uppercase mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-orange-900">₹{invoice.balanceDue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <p className="text-xs font-medium text-purple-600 uppercase mb-1">Due Date</p>
              <p className="text-lg font-semibold text-purple-900">{invoice.dueDate}</p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Invoice Status Progress</h3>
            <div className="relative">
              <div className="flex items-center justify-between">
                {progressStages.map((stage, index) => {
                  const isLast = index === progressStages.length - 1;

                  return (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center relative z-10">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          stage.completed
                            ? 'bg-green-500 border-green-600'
                            : stage.current
                            ? 'bg-blue-500 border-blue-600 ring-4 ring-blue-200'
                            : 'bg-gray-200 border-gray-300'
                        }`}>
                          {stage.completed ? (
                            <CheckCircle className="h-6 w-6 text-white" />
                          ) : stage.current ? (
                            <Clock className="h-6 w-6 text-white" />
                          ) : (
                            <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <div className="mt-2 text-center">
                          <p className={`text-xs font-semibold ${
                            stage.current ? 'text-blue-900' : 'text-gray-700'
                          }`}>
                            {stage.name}
                          </p>
                        </div>
                      </div>

                      {!isLast && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          stage.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-3">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {/* Customer and Invoice Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Customer Name</p>
                    <p className="text-sm font-semibold text-gray-900">{invoice.customer}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">GST Number</p>
                    <p className="text-sm text-gray-900">{invoice.customerGST}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Email</p>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">procurement@tatasteel.com</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Contact Phone</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">+91 657 2345678</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                  Invoice Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Invoice Number</p>
                    <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Invoice Date</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{invoice.invoiceDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Due Date</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">{invoice.dueDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Terms</p>
                    <p className="text-sm text-gray-900">{invoice.paymentTerms}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">PO Reference</p>
                    <p className="text-sm text-gray-900">{invoice.poReference}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Billing Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Billing Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{billingAddress.street}</p>
                  <p className="text-sm text-gray-900 mt-1">{billingAddress.city}, {billingAddress.state}</p>
                  <p className="text-sm text-gray-900 mt-1">{billingAddress.pincode}</p>
                  <p className="text-sm text-gray-900 mt-1">{billingAddress.country}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Shipping Address
                </h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{shippingAddress.street}</p>
                  <p className="text-sm text-gray-900 mt-1">{shippingAddress.city}, {shippingAddress.state}</p>
                  <p className="text-sm text-gray-900 mt-1">{shippingAddress.pincode}</p>
                  <p className="text-sm text-gray-900 mt-1">{shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-900">{invoice.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Line Items Tab */}
        {activeTab === 'line_items' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Invoice Line Items</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">Item</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">HSN Code</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Quantity</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Unit Price</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Tax Rate</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Tax Amount</th>
                      <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <p className="text-sm font-medium text-gray-900">{item.item}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{item.hsn}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">
                          {item.taxRate}%
                          <span className="block text-xs text-gray-500">{item.taxType}</span>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 text-right">₹{item.taxAmount.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-sm font-bold text-gray-900 text-right">₹{item.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="bg-gray-50 p-3 border-t border-gray-200">
                <div className="max-w-md ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.cgst > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{invoice.cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{invoice.sgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {invoice.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGST (18%):</span>
                      <span className="font-semibold text-gray-900">₹{invoice.igst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-red-600">-₹{invoice.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-blue-900">₹{invoice.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payment_history' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CreditCard className="h-4 w-4" />
                <span>Record New Payment</span>
              </button>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-medium text-blue-600 uppercase mb-1">Total Invoice</p>
                <p className="text-2xl font-bold text-blue-900">₹{invoice.total.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <p className="text-xs font-medium text-green-600 uppercase mb-1">Amount Paid</p>
                <p className="text-2xl font-bold text-green-900">₹{invoice.paidAmount.toLocaleString('en-IN')}</p>
                <p className="text-xs text-green-600 mt-1">{((invoice.paidAmount / invoice.total) * 100).toFixed(1)}% paid</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                <p className="text-xs font-medium text-orange-600 uppercase mb-1">Balance Due</p>
                <p className="text-2xl font-bold text-orange-900">₹{invoice.balanceDue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Payment Timeline */}
            <div className="space-y-2">
              {payments.map((payment, index) => {
                const isLast = index === payments.length - 1;

                return (
                  <div key={payment.id} className="relative">
                    {!isLast && (
                      <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gray-300"></div>
                    )}

                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-green-100 text-green-600 border-green-200">
                        <CheckCircle className="h-5 w-5" />
                      </div>

                      <div className="flex-1 bg-gradient-to-br from-gray-50 to-green-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-base font-bold text-gray-900">Payment Received</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Recorded by {payment.recordedBy} • {payment.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-900">₹{payment.amount.toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Payment Method</p>
                            <div className="flex items-center space-x-2">
                              <CreditCard className="h-4 w-4 text-gray-400" />
                              <p className="text-sm text-gray-900">{payment.paymentMethod}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Transaction ID</p>
                            <p className="text-sm text-gray-900 font-mono">{payment.transactionId}</p>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{payment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Invoice Created */}
              <div className="relative">
                <div className="flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center border-2 flex-shrink-0 bg-blue-100 text-blue-600 border-blue-200">
                    <Receipt className="h-5 w-5" />
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Invoice Created</h4>
                        <p className="text-sm text-gray-500 mt-1">{invoice.invoiceDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-900">₹{invoice.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Void Confirmation Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-bold text-gray-900">Void Invoice</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Voiding <span className="font-semibold">{invoice.invoiceNumber}</span> cannot be undone. Please provide a reason.
            </p>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Reason for voiding this invoice"
            />
            <div className="flex items-center justify-end space-x-2 mt-3">
              <button
                onClick={() => { setShowVoidModal(false); setVoidReason(''); }}
                disabled={isVoiding}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoid}
                disabled={isVoiding || !voidReason.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                <span>{isVoiding ? 'Voiding…' : 'Void Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
