'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import { exportToCsv, printCurrentView } from '@/lib/export';
import { Package, FileText, DollarSign, MessageSquare, Download, Calendar, TrendingUp, Bell, User, Settings, LogOut, Search, Filter, Eye, ChevronRight, Clock, CheckCircle, AlertCircle, XCircle, Receipt, FileSpreadsheet, Printer } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  total: number;
  trackingNumber?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  pdfUrl?: string;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
}

interface StatementTransaction {
  id: string;
  date: string;
  type: 'invoice' | 'payment' | 'credit' | 'debit';
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
}

export default function CustomerPortalViewPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'invoices' | 'receipts' | 'statement' | 'support' | 'documents'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mock customer data (fallback seed)
  const customerInfoSeed = {
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    company: 'TechCorp Global Inc.',
    accountNumber: 'CUST-10234',
    memberSince: '2022-03-15',
    accountValue: 12500000,
    creditLimit: 500000,
    currentBalance: 73500,
  };

  const mockOrdersSeed: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-1523',
      date: '2024-10-18',
      status: 'delivered',
      items: 5,
      total: 45000,
      trackingNumber: 'TRK-458963',
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-1489',
      date: '2024-10-15',
      status: 'shipped',
      items: 3,
      total: 28500,
      trackingNumber: 'TRK-457821',
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-1456',
      date: '2024-10-10',
      status: 'processing',
      items: 8,
      total: 67000,
    },
    {
      id: '4',
      orderNumber: 'ORD-2024-1423',
      date: '2024-10-05',
      status: 'delivered',
      items: 2,
      total: 15000,
      trackingNumber: 'TRK-456789',
    },
  ];

  const mockInvoicesSeed: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-3456',
      date: '2024-10-18',
      dueDate: '2024-11-18',
      amount: 45000,
      status: 'pending',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-3422',
      date: '2024-10-15',
      dueDate: '2024-11-15',
      amount: 28500,
      status: 'paid',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-3401',
      date: '2024-09-20',
      dueDate: '2024-10-20',
      amount: 15000,
      status: 'overdue',
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024-3387',
      date: '2024-09-15',
      dueDate: '2024-10-15',
      amount: 67000,
      status: 'paid',
    },
  ];

  const mockReceiptsSeed: Receipt[] = [
    {
      id: '1',
      receiptNumber: 'RCP-2024-8923',
      invoiceNumber: 'INV-2024-3422',
      date: '2024-10-14',
      amount: 28500,
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-BT-789456123',
    },
    {
      id: '2',
      receiptNumber: 'RCP-2024-8901',
      invoiceNumber: 'INV-2024-3387',
      date: '2024-09-12',
      amount: 67000,
      paymentMethod: 'Cheque',
      transactionId: 'CHQ-123456',
    },
    {
      id: '3',
      receiptNumber: 'RCP-2024-8878',
      invoiceNumber: 'INV-2024-3345',
      date: '2024-08-25',
      amount: 52000,
      paymentMethod: 'Wire Transfer',
      transactionId: 'TXN-WT-456789321',
    },
    {
      id: '4',
      receiptNumber: 'RCP-2024-8856',
      invoiceNumber: 'INV-2024-3312',
      date: '2024-08-10',
      amount: 38000,
      paymentMethod: 'Bank Transfer',
      transactionId: 'TXN-BT-321654987',
    },
  ];

  const mockStatementTransactionsSeed: StatementTransaction[] = [
    {
      id: '1',
      date: '2024-10-18',
      type: 'invoice',
      reference: 'INV-2024-3456',
      description: 'Sales Invoice - ORD-2024-1523',
      debit: 45000,
      credit: 0,
      balance: 73500,
    },
    {
      id: '2',
      date: '2024-10-15',
      type: 'invoice',
      reference: 'INV-2024-3422',
      description: 'Sales Invoice - ORD-2024-1489',
      debit: 28500,
      credit: 0,
      balance: 28500,
    },
    {
      id: '3',
      date: '2024-10-14',
      type: 'payment',
      reference: 'RCP-2024-8923',
      description: 'Payment Received - Bank Transfer',
      debit: 0,
      credit: 28500,
      balance: 0,
    },
    {
      id: '4',
      date: '2024-09-20',
      type: 'invoice',
      reference: 'INV-2024-3401',
      description: 'Sales Invoice - ORD-2024-1456',
      debit: 15000,
      credit: 0,
      balance: 15000,
    },
    {
      id: '5',
      date: '2024-09-15',
      type: 'invoice',
      reference: 'INV-2024-3387',
      description: 'Sales Invoice - ORD-2024-1423',
      debit: 67000,
      credit: 0,
      balance: 67000,
    },
    {
      id: '6',
      date: '2024-09-12',
      type: 'payment',
      reference: 'RCP-2024-8901',
      description: 'Payment Received - Cheque',
      debit: 0,
      credit: 67000,
      balance: 0,
    },
    {
      id: '7',
      date: '2024-08-28',
      type: 'invoice',
      reference: 'INV-2024-3345',
      description: 'Sales Invoice - ORD-2024-1289',
      debit: 52000,
      credit: 0,
      balance: 52000,
    },
    {
      id: '8',
      date: '2024-08-25',
      type: 'payment',
      reference: 'RCP-2024-8878',
      description: 'Payment Received - Wire Transfer',
      debit: 0,
      credit: 52000,
      balance: 0,
    },
  ];

  const mockTicketsSeed: SupportTicket[] = [
    {
      id: '1',
      ticketNumber: 'TKT-5623',
      subject: 'Product delivery delay inquiry',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2024-10-19',
      lastUpdate: '2024-10-20',
    },
    {
      id: '2',
      ticketNumber: 'TKT-5589',
      subject: 'Invoice discrepancy - ORD-2024-1456',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-10-15',
      lastUpdate: '2024-10-16',
    },
    {
      id: '3',
      ticketNumber: 'TKT-5534',
      subject: 'Request for product specifications',
      status: 'closed',
      priority: 'low',
      createdAt: '2024-10-10',
      lastUpdate: '2024-10-12',
    },
  ];

  const mockDocumentsSeed: Document[] = [
    {
      id: '1',
      name: 'Master Service Agreement 2024',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      category: 'Contracts',
    },
    {
      id: '2',
      name: 'Product Catalog - Electronics',
      type: 'PDF',
      size: '8.7 MB',
      uploadDate: '2024-09-01',
      category: 'Catalogs',
    },
    {
      id: '3',
      name: 'Technical Specifications - Series A',
      type: 'PDF',
      size: '1.2 MB',
      uploadDate: '2024-08-20',
      category: 'Specifications',
    },
    {
      id: '4',
      name: 'Pricing Sheet Q4 2024',
      type: 'XLSX',
      size: '456 KB',
      uploadDate: '2024-10-01',
      category: 'Pricing',
    },
  ];

  // ---- Live-loaded portal data ----
  const searchParams = useSearchParams();
  const portalCustomerId = searchParams?.get('customerId') || searchParams?.get('id') || '';

  const [customerInfo, setCustomerInfo] = useState(customerInfoSeed);
  const [mockOrders, setMockOrders] = useState<Order[]>([]);
  // No CRM endpoints exist for portal invoices / receipts / statement /
  // documents, so those panels fall back to their (empty) live state. The
  // orders panel is fed from the customer's quotes and support from tickets.
  const [mockInvoices] = useState<Invoice[]>([]);
  const [mockReceipts] = useState<Receipt[]>([]);
  const [mockStatementTransactions] = useState<StatementTransaction[]>([]);
  const [mockTickets, setMockTickets] = useState<SupportTicket[]>([]);
  const [mockDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!portalCustomerId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // (a) primary entity
        const raw: any = await crmService.customers.getById(portalCustomerId);
        if (!cancelled && raw && typeof raw === 'object') {
          setCustomerInfo({
            name: raw.contactName ?? raw.customerName ?? customerInfoSeed.name,
            email: raw.generalEmail ?? raw.email ?? customerInfoSeed.email,
            company: raw.customerName ?? raw.legalName ?? customerInfoSeed.company,
            accountNumber: raw.customerNumber ?? raw.id ?? customerInfoSeed.accountNumber,
            memberSince: (raw.customerSince ?? raw.createdAt ?? customerInfoSeed.memberSince).toString().slice(0, 10),
            accountValue: Number(raw.lifetimeValue ?? customerInfoSeed.accountValue),
            creditLimit: Number(raw.creditLimit ?? customerInfoSeed.creditLimit),
            currentBalance: Number(raw.creditUsed ?? customerInfoSeed.currentBalance),
          });
        }

        // (b) related lists — orders from quotes, support from tickets.
        const [quotesRaw, ticketsRaw] = await Promise.all([
          crmService.customers.getQuotes(portalCustomerId).catch(() => []),
          crmService.tickets.getAll({ customerId: portalCustomerId }).then((r: any) => (Array.isArray(r) ? r : r?.data ?? [])).catch(() => []),
        ]);

        if (!cancelled) {
          setMockOrders(
            (quotesRaw as any[]).map((q, i) => ({
              id: q.id ?? String(i),
              orderNumber: q.quoteNumber ?? q.number ?? q.id ?? `Q-${i + 1}`,
              date: (q.createdAt ?? '').toString().slice(0, 10),
              status:
                q.status === 'accepted'
                  ? 'delivered'
                  : q.status === 'rejected'
                  ? 'cancelled'
                  : 'processing',
              items: Array.isArray(q.items) ? q.items.length : Number(q.itemCount ?? 0),
              total: Number(q.totalAmount ?? q.amount ?? 0),
            })),
          );
          setMockTickets(
            (ticketsRaw as any[]).map((t, i) => ({
              id: t.id ?? String(i),
              ticketNumber: t.ticketNumber ?? t.number ?? t.id ?? `TKT-${i + 1}`,
              subject: t.subject ?? t.title ?? '',
              status:
                ['open', 'in-progress', 'resolved', 'closed'].includes(t.status)
                  ? t.status
                  : 'open',
              priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
              createdAt: (t.createdAt ?? '').toString().slice(0, 10),
              lastUpdate: (t.updatedAt ?? t.createdAt ?? '').toString().slice(0, 10),
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load portal data');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [portalCustomerId]);

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTicketStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Handler functions
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleDownload = (type: string, id: string) => {
    setToastMessage(`${type} downloaded successfully!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePrint = (type: string) => {
    printCurrentView();
    setToastMessage(`Printing ${type}...`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExport = () => {
    exportToCsv('statement-of-accounts', mockStatementTransactions as unknown as Record<string, unknown>[]);
    setToastMessage('Statement exported successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePaymentSubmit = () => {
    setToastMessage('Payment submitted successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    setShowPaymentModal(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {loadError && (
        <div className="flex items-center gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span>{loadError}</span>
        </div>
      )}
      {isLoading && (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading portal…
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-3">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {customerInfo.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{customerInfo.company}</h1>
                <p className="text-sm text-gray-600">{customerInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-3">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'invoices'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Invoices
              </div>
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'receipts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Receipts
              </div>
            </button>
            <button
              onClick={() => setActiveTab('statement')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'statement'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Statement
              </div>
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'support'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Support
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-3">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{mockOrders.length}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    ${(mockInvoices.reduce((sum, inv) => sum + inv.amount, 0) / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Total Invoiced</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className={`w-8 h-8 ${customerInfo.currentBalance > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                  </div>
                  <div className="text-3xl font-bold mb-1">${customerInfo.currentBalance.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Current Balance</div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {mockTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Tickets</div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold mb-2">Account Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="text-lg font-semibold">{customerInfo.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Credit Limit</p>
                    <p className="text-lg font-semibold">${customerInfo.creditLimit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available Credit</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${(customerInfo.creditLimit - customerInfo.currentBalance).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Recent Orders</h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {mockOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{order.orderNumber}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.date).toLocaleDateString()} • {order.items} items • ${order.total.toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Pending Invoices</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {mockInvoices.filter(inv => inv.status !== 'paid').map((invoice) => (
                      <div key={invoice.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{invoice.invoiceNumber}</div>
                            <div className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${invoice.amount.toLocaleString()}</div>
                            <span className={`px-2 py-1 rounded-full text-xs ${getInvoiceStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Active Support Tickets</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {mockTickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').map((ticket) => (
                      <div key={ticket.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-1 rounded ${getTicketStatusColor(ticket.status)}`}>
                            {getTicketStatusIcon(ticket.status)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium mb-1">{ticket.subject}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{ticket.ticketNumber}</span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">My Orders</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      New Order
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Order Date: {new Date(order.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${order.total.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{order.items} items</div>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="text-sm text-blue-900">
                            Tracking Number: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        {order.trackingNumber && (
                          <button
                            onClick={() => {
                              setToastMessage(`Tracking shipment ${order.trackingNumber}...`);
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 3000);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            Track Shipment
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload('Order', order.id)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-2">Invoices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-green-600 mb-1">Paid</div>
                      <div className="text-2xl font-bold text-green-900">
                        ${mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="text-sm text-yellow-600 mb-1">Pending</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        ${mockInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-sm text-red-600 mb-1">Overdue</div>
                      <div className="text-2xl font-bold text-red-900">
                        ${mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {mockInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Issued: {new Date(invoice.date).toLocaleDateString()} • Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">${invoice.amount.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Invoice
                        </button>
                        <button
                          onClick={() => handleDownload('Invoice PDF', invoice.id)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handlePayInvoice(invoice)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">Payment Receipts</h2>
                    <button
                      onClick={() => handlePrint('All Receipts')}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print All
                    </button>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-blue-600 mb-1">Total Payments Received</div>
                        <div className="text-2xl font-bold text-blue-900">
                          ${mockReceipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </div>
                      </div>
                      <Receipt className="w-12 h-12 text-blue-600 opacity-50" />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {mockReceipts.map((receipt) => (
                    <div key={receipt.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Receipt className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold">{receipt.receiptNumber}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Paid
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1 ml-8">
                            <div>Invoice: <span className="font-medium">{receipt.invoiceNumber}</span></div>
                            <div>Payment Date: {new Date(receipt.date).toLocaleDateString()}</div>
                            <div>Payment Method: <span className="font-medium">{receipt.paymentMethod}</span></div>
                            <div>Transaction ID: <span className="font-mono text-xs">{receipt.transactionId}</span></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">${receipt.amount.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-8">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Receipt
                        </button>
                        <button
                          onClick={() => handleDownload('Receipt PDF', receipt.id)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                        <button
                          onClick={() => handlePrint(`Receipt ${receipt.receiptNumber}`)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                        >
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statement of Accounts Tab */}
          {activeTab === 'statement' && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold">Statement of Accounts</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <button
                        onClick={() => handlePrint('Statement of Accounts')}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </div>

                  {/* Account Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-sm text-blue-600 mb-1">Opening Balance</div>
                      <div className="text-xl font-bold text-blue-900">$0</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <div className="text-sm text-red-600 mb-1">Total Debits</div>
                      <div className="text-xl font-bold text-red-900">
                        ${mockStatementTransactions.reduce((sum, t) => sum + t.debit, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-green-600 mb-1">Total Credits</div>
                      <div className="text-xl font-bold text-green-900">
                        ${mockStatementTransactions.reduce((sum, t) => sum + t.credit, 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-sm text-orange-600 mb-1">Closing Balance</div>
                      <div className="text-xl font-bold text-orange-900">${customerInfo.currentBalance.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Date Range Filter */}
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockStatementTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'invoice' ? 'bg-blue-100 text-blue-700' :
                              transaction.type === 'payment' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                            {transaction.reference}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {transaction.description}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-red-600 font-medium">
                            {transaction.debit > 0 ? `$${transaction.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                            {transaction.credit > 0 ? `$${transaction.credit.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-semibold">
                            ${transaction.balance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-sm font-semibold text-right">
                          Total:
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-red-600 font-bold">
                          ${mockStatementTransactions.reduce((sum, t) => sum + t.debit, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-green-600 font-bold">
                          ${mockStatementTransactions.reduce((sum, t) => sum + t.credit, 0).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-bold">
                          ${customerInfo.currentBalance.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Support Tickets</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      New Ticket
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {mockTickets.map((ticket) => (
                    <div key={ticket.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 p-2 rounded-lg ${getTicketStatusColor(ticket.status)}`}>
                          {getTicketStatusIcon(ticket.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority} priority
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            {ticket.ticketNumber} • Created: {new Date(ticket.createdAt).toLocaleDateString()} •
                            Last Update: {new Date(ticket.lastUpdate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTicketStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold mb-2">Document Library</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {mockDocuments.map((document) => (
                    <div key={document.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{document.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs">{document.category}</span>
                              <span>{document.type}</span>
                              <span>•</span>
                              <span>{document.size}</span>
                              <span>•</span>
                              <span>Uploaded {new Date(document.uploadDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDocument(document)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload('Document', document.id)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order View Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold">{selectedOrder.orderNumber}</h3>
                <p className="text-sm text-gray-500">Order Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold">${selectedOrder.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="text-lg font-semibold">{selectedOrder.items}</p>
                </div>
                {selectedOrder.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="text-lg font-mono font-semibold">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Order Items</p>
                <p className="text-sm text-gray-500 italic">Item details would be displayed here</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload('Order', selectedOrder.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold">{selectedInvoice.invoiceNumber}</h3>
                <p className="text-sm text-gray-500">Issue Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Due</p>
                  <p className="text-2xl font-bold">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-lg font-semibold">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Days Until Due</p>
                  <p className="text-lg font-semibold">
                    {Math.ceil((new Date(selectedInvoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Invoice Details</p>
                <p className="text-sm text-gray-500 italic">Line items would be displayed here</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload('Invoice PDF', selectedInvoice.id)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download PDF
              </button>
              {selectedInvoice.status !== 'paid' && (
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    handlePayInvoice(selectedInvoice);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold">{selectedReceipt.receiptNumber}</h3>
                <p className="text-sm text-gray-500">Payment Date: {new Date(selectedReceipt.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="bg-green-50 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-green-900">Payment Confirmed</p>
                </div>
                <p className="text-3xl font-bold text-green-900">${selectedReceipt.amount.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="text-lg font-semibold">{selectedReceipt.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-lg font-semibold">{selectedReceipt.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedReceipt.transactionId}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload('Receipt PDF', selectedReceipt.id)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Download PDF
              </button>
              <button
                onClick={() => handlePrint(`Receipt ${selectedReceipt.receiptNumber}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3  w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold">{selectedDocument.name}</h3>
                <p className="text-sm text-gray-500">Uploaded: {new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedDocument.category}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Type</p>
                  <p className="text-lg font-semibold">{selectedDocument.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="text-lg font-semibold">{selectedDocument.size}</p>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mb-2" />
                <p className="text-gray-600">Document preview would be displayed here</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload('Document', selectedDocument.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-3 max-w-md w-full">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-bold">Make Payment</h3>
                <p className="text-sm text-gray-500">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-600 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-blue-900">${selectedInvoice.amount.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                  <option>Wire Transfer</option>
                  <option>Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="h-4 w-4" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
