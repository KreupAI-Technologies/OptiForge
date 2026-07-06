'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { ArrowLeft, Download, Send, Printer, CreditCard, CheckCircle, AlertCircle, FileText, Calendar, DollarSign, Building2 } from 'lucide-react';

export default function ViewInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  // Fallback invoice data (defaults so every field the JSX reads is defined)
  const FALLBACK = {
    id: params.id,
    invoiceNumber: 'SI-2025-00145',
    invoiceType: 'Installation',
    invoiceDate: '2025-10-05',
    dueDate: '2025-10-20',
    status: 'partial_paid',
    customerName: 'Urban Interiors & Designers',
    customerAddress: 'Showroom 3, Interior Design Hub, Koramangala, Bangalore - 560095',
    customerGSTIN: '29PQRST9012H3Z7',
    customerPhone: '+91-98123-45678',
    customerEmail: 'anita@urbaninteriors.in',
    paymentTerms: '50% Advance, 50% on Completion',
    lineItems: [
      {
        id: '1',
        itemType: 'installation_fee',
        description: 'Modular Kitchen Installation - L-Shape Premium',
        quantity: 1,
        unitPrice: 150000,
        discount: 0,
        taxRate: 18,
        subtotal: 150000,
        taxAmount: 27000,
        total: 177000,
      },
      {
        id: '2',
        itemType: 'labor',
        description: 'Built-in Hob & Chimney Installation',
        quantity: 1,
        unitPrice: 8000,
        discount: 0,
        taxRate: 18,
        subtotal: 8000,
        taxAmount: 1440,
        total: 9440,
      },
      {
        id: '3',
        itemType: 'parts',
        description: 'Installation Hardware & Fixtures',
        quantity: 1,
        unitPrice: 12000,
        discount: 10,
        taxRate: 18,
        subtotal: 10800,
        taxAmount: 1944,
        total: 12744,
      },
      {
        id: '4',
        itemType: 'travel',
        description: 'Site Visit & Transportation',
        quantity: 1,
        unitPrice: 2500,
        discount: 0,
        taxRate: 18,
        subtotal: 2500,
        taxAmount: 450,
        total: 2950,
      },
    ],
    subtotal: 285000,
    totalDiscount: 1200,
    taxableAmount: 283800,
    cgst: 25542,
    sgst: 25542,
    igst: 0,
    totalTax: 51084,
    totalAmount: 336300,
    paidAmount: 150000,
    balanceAmount: 186300,
    paymentHistory: [
      {
        id: '1',
        paymentNumber: 'PMT-2025-000234',
        amount: 150000,
        paymentDate: '2025-10-06',
        paymentMethod: 'Bank Transfer',
        paymentReference: 'NEFT/UTR123456789',
        notes: 'Advance payment - 50%',
      },
    ],
    notes: 'Payment Terms: 50% advance on order confirmation, 50% on completion of installation.\n\nBank Details:\nAccount Name: ManufacturingOS ERP Solutions\nAccount Number: 1234567890\nIFSC Code: HDFC0001234\nBank: HDFC Bank, MG Road Branch',
    createdBy: 'Priya Patel',
    sentDate: '2025-10-05',
  };

  const [invoice, setInvoice] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await AfterSalesPagesService.invoice(String(params.id));
        if (!cancelled && data && typeof data === 'object') {
          setInvoice(prev => ({ ...prev, ...data }));
        }
      } catch {
        // keep fallback on error
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRecordPayment = () => {
    const payment = {
      invoiceId: invoice.id,
      amount: parseFloat(paymentAmount),
      paymentMethod,
      paymentReference,
      paymentDate: new Date().toISOString().split('T')[0],
    };
    console.log('Recording payment:', payment);
    setShowPaymentModal(false);
    // Here you would call the API to record the payment
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partial_paid: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{invoice.invoiceNumber}</h1>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                {invoice.status === 'paid' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {invoice.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-gray-600">
                Invoice Type: <span className="font-medium text-gray-900">{invoice.invoiceType}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            {invoice.status !== 'paid' && (
              <>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-3">
        {/* Company Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ManufacturingOS ERP Solutions</h2>
            <p className="text-sm text-gray-600">123 Tech Park, MG Road</p>
            <p className="text-sm text-gray-600">Bangalore - 560001, Karnataka</p>
            <p className="text-sm text-gray-600">GSTIN: 29ABCDE1234F1Z5</p>
            <p className="text-sm text-gray-600">Phone: +91-80-1234-5678</p>
          </div>
          <div className="text-right">
            <h3 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h3>
            <p className="text-sm text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-600">Date: {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
            <p className="text-sm text-gray-600">Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">BILL TO:</h3>
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                <p className="text-sm text-gray-600 mt-1">{invoice.customerAddress}</p>
                <p className="text-sm text-gray-600">GSTIN: {invoice.customerGSTIN}</p>
                <p className="text-sm text-gray-600">Phone: {invoice.customerPhone}</p>
                <p className="text-sm text-gray-600">Email: {invoice.customerEmail}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">PAYMENT TERMS:</h3>
            <p className="text-sm text-gray-900">{invoice.paymentTerms}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Discount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tax</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.lineItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">Type: {item.itemType.replace('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.discount}%</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.taxAmount)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">- {formatCurrency(invoice.totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Taxable Amount:</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.taxableAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CGST (9%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.cgst)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SGST (9%):</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.sgst)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
                <span className="text-gray-600">Total Tax:</span>
                <span className="text-gray-900">{formatCurrency(invoice.totalTax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
                <span className="text-gray-900">TOTAL AMOUNT:</span>
                <span className="text-blue-600">{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {invoice.paidAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Paid: {formatCurrency(invoice.paidAmount)}</span>
              </div>
              {invoice.balanceAmount > 0 && (
                <span className="font-semibold text-orange-900">Balance Due: {formatCurrency(invoice.balanceAmount)}</span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">NOTES & TERMS:</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      {invoice.paymentHistory.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Payment History
          </h2>
          <div className="space-y-3">
            {invoice.paymentHistory.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">{payment.paymentNumber}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      {payment.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                    </span>
                    {payment.paymentReference && (
                      <span>Ref: {payment.paymentReference}</span>
                    )}
                  </div>
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-3 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Record Payment</h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Max: ${invoice.balanceAmount}`}
                  max={invoice.balanceAmount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Balance due: {formatCurrency(invoice.balanceAmount)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., Transaction ID, Cheque Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!paymentAmount || !paymentMethod}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
