'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Download, Send, Copy, FileText, DollarSign, Calendar, User, Building2, CheckCircle, XCircle, Clock, Package, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  customer: string;
  contact: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  amount: number;
  discount: number;
  finalAmount: number;
  validUntil: string;
  createdDate: string;
  sentDate?: string;
  acceptedDate?: string;
  owner: string;
  products: number;
  probability: number;
}

interface QuoteItem {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export default function QuoteViewPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.id as string;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);

  const [quote, setQuote] = useState<Quote | undefined>(undefined);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!quoteId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw: any = await crmService.quotes.getById(quoteId);
        if (!cancelled && raw && typeof raw === 'object') {
          const items = Array.isArray(raw.items) ? raw.items : [];
          setQuote({
            id: raw.id ?? quoteId,
            quoteNumber: raw.quoteNumber ?? raw.number ?? quoteId,
            title: raw.title ?? '',
            customer: raw.customerName ?? '',
            contact: raw.contactName ?? '',
            status: (raw.status ?? 'draft') as Quote['status'],
            amount: Number(raw.subtotal ?? raw.amount ?? 0),
            discount: Number(raw.discountAmount ?? 0),
            finalAmount: Number(raw.totalAmount ?? raw.amount ?? 0),
            validUntil: (raw.validUntil ?? '').toString().slice(0, 10),
            createdDate: (raw.createdAt ?? '').toString().slice(0, 10),
            sentDate: raw.sentDate ? raw.sentDate.toString().slice(0, 10) : undefined,
            acceptedDate: raw.acceptedDate ? raw.acceptedDate.toString().slice(0, 10) : undefined,
            owner: raw.preparedByName ?? '',
            products: items.length,
            probability: Number(raw.probability ?? 0),
          });
          setQuoteItems(
            items.map((it: any, i: number) => ({
              id: it.id ?? String(i),
              product: it.product ?? it.productName ?? it.name ?? 'Item',
              description: it.description ?? '',
              quantity: Number(it.quantity ?? 1),
              unitPrice: Number(it.unitPrice ?? it.price ?? 0),
              discount: Number(it.discount ?? it.discountAmount ?? 0),
              total: Number(it.total ?? it.lineTotal ?? 0),
            })),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load quote');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-blue-700">Loading quote…</div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-600 mb-2">
            {loadError ? loadError : "The quote you're looking for doesn't exist."}
          </p>
          <Link href="/crm/quotes" className="text-blue-600 hover:underline">
            Return to Quotes
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'viewed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'viewed':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleEdit = () => {
    router.push(`/crm/quotes/edit/${quote.id}`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    router.push('/crm/quotes');
  };

  const handleDownload = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${quote.quoteNumber}.pdf`;
  };

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const confirmSend = () => {
    setShowSendDialog(false);
    router.push('/crm/quotes');
  };

  const handleCopy = () => {
    router.push('/crm/quotes');
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const discountPercentage = quote.amount > 0 ? ((quote.discount / quote.amount) * 100).toFixed(0) : '0';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotes</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{quote.quoteNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${getStatusColor(quote.status)}`}>
                {getStatusIcon(quote.status)}
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </span>
              {isExpiringSoon(quote.validUntil) && quote.status === 'sent' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  Expiring Soon
                </span>
              )}
            </div>
            <h2 className="text-xl text-gray-700 mb-1">{quote.title}</h2>
            <p className="text-gray-600">{quote.customer}</p>
          </div>

          <div className="flex items-center gap-2">
            {quote.status === 'draft' && (
              <button
                onClick={handleSend}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Send className="w-4 h-4" />
                <span>Send Quote</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-600"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>
            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Original Amount</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">${(quote.amount / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-900">Discount</p>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{discountPercentage}%</p>
          <p className="text-sm text-orange-700 mt-1">${(quote.discount / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-900">Final Amount</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">${(quote.finalAmount / 1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-900">Win Probability</p>
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{quote.probability}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Quote Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Quote Items</h2>

            <div className="space-y-2">
              {quoteItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">${item.total.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-gray-500">Qty: </span>
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Unit Price: </span>
                      <span className="font-medium text-gray-900">${item.unitPrice.toLocaleString()}</span>
                    </div>
                    {item.discount > 0 && (
                      <div>
                        <span className="text-gray-500">Discount: </span>
                        <span className="font-medium text-orange-600">-${item.discount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">${quote.amount.toLocaleString()}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex items-center justify-between text-orange-600">
                    <span>Total Discount ({discountPercentage}%)</span>
                    <span className="font-semibold">-${quote.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                  <span>Total Amount</span>
                  <span>${quote.finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Payment terms: Net 30 days from invoice date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>This quote is valid until {new Date(quote.validUntil).toLocaleDateString()}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>All prices are in USD and exclude applicable taxes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Implementation timeline: 8-12 weeks from contract signature</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>Standard warranty and support terms apply</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Quote Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Quote Details</h2>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 mb-1">Quote Number</p>
                <p className="text-sm font-medium text-gray-900">{quote.quoteNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border ${getStatusColor(quote.status)}`}>
                  {getStatusIcon(quote.status)}
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Created Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(quote.createdDate).toLocaleDateString()}</p>
              </div>

              {quote.sentDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Sent Date</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(quote.sentDate).toLocaleDateString()}</p>
                </div>
              )}

              {quote.acceptedDate && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Accepted Date</p>
                  <p className="text-sm font-medium text-green-600">{new Date(quote.acceptedDate).toLocaleDateString()}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-1">Valid Until</p>
                <p className={`text-sm font-medium ${isExpiringSoon(quote.validUntil) ? 'text-orange-600' : 'text-gray-900'}`}>
                  {new Date(quote.validUntil).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Quote Owner</p>
                <p className="text-sm font-medium text-gray-900">{quote.owner}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Number of Products</p>
                <p className="text-sm font-medium text-gray-900">{quote.products}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-sm font-medium text-gray-900">{quote.customer}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-sm font-medium text-gray-900">{quote.contact}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium text-blue-600">contact@customer.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">123 Business Ave<br />Suite 456<br />San Francisco, CA 94105</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Quote"
        message={`Are you sure you want to delete ${quote.quoteNumber} - "${quote.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Send Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSendDialog}
        onClose={() => setShowSendDialog(false)}
        onConfirm={confirmSend}
        title="Send Quote"
        message={`Are you sure you want to send ${quote.quoteNumber} to ${quote.customer}?`}
        confirmLabel="Send"
        variant="info"
      />
    </div>
  );
}
