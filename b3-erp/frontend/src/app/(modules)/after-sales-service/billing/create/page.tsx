'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Send, Calculator, FileText } from 'lucide-react';
import { MasterDataService, mdLabel, MDCustomer } from '@/services/master-data.service';

interface LineItem {
  id: string;
  itemType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  amount: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();

  const [invoiceType, setInvoiceType] = useState('Service');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [serviceJobId, setServiceJobId] = useState('');
  const [contractId, setContractId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15 days');
  const [notes, setNotes] = useState('');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      itemType: 'labor',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      amount: 0,
    },
  ]);

  // Seed customer data (kept as unused fallback per convention)
  const customersSeed = [
    { id: 'CUST001', name: 'Sharma Modular Kitchens Pvt Ltd', gstin: '29ABCDE1234F1Z5' },
    { id: 'CUST002', name: 'Prestige Developers Bangalore', gstin: '29XYZAB5678G2Z6' },
    { id: 'CUST003', name: 'Urban Interiors & Designers', gstin: '29PQRST9012H3Z7' },
    { id: 'CUST004', name: 'Elite Contractors & Builders', gstin: '27LMNOP3456I4Z8' },
    { id: 'CUST005', name: 'DLF Universal Projects', gstin: '07UVWXY7890J5Z9' },
  ];
  const [customers, setCustomers] = useState<MDCustomer[]>(
    customersSeed.map(c => ({ id: c.id, customerName: c.name }))
  );
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    setLoadingCustomers(true);
    MasterDataService.getCustomers().then(live => {
      if (live.length > 0) setCustomers(live);
    }).finally(() => setLoadingCustomers(false));
  }, []);

  const invoiceTypes = ['Service', 'AMC', 'Installation', 'Parts', 'Warranty'];
  const itemTypes = [
    { value: 'labor', label: 'Labor Charges' },
    { value: 'parts', label: 'Parts & Components' },
    { value: 'travel', label: 'Travel Charges' },
    { value: 'emergency', label: 'Emergency Charge' },
    { value: 'amc_fee', label: 'AMC Fee' },
    { value: 'installation_fee', label: 'Installation Fee' },
  ];

  const paymentTermsOptions = [
    'Net 15 days',
    'Net 30 days',
    'Net 45 days',
    'Due on Receipt',
    'Against Delivery',
    '50% Advance, 50% on Completion',
    'PDC (Post Dated Cheque)',
  ];

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      itemType: 'labor',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      amount: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Calculate amount
        const subtotal = updated.quantity * updated.unitPrice;
        const discountAmount = (subtotal * updated.discount) / 100;
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = (taxableAmount * updated.taxRate) / 100;
        updated.amount = taxableAmount + taxAmount;
        return updated;
      }
      return item;
    }));
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);

  const totalDiscount = lineItems.reduce((sum, item) => {
    return sum + ((item.quantity * item.unitPrice * item.discount) / 100);
  }, 0);

  const taxableAmount = subtotal - totalDiscount;

  const totalTax = lineItems.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = (itemSubtotal * item.discount) / 100;
    const itemTaxable = itemSubtotal - itemDiscount;
    return sum + ((itemTaxable * item.taxRate) / 100);
  }, 0);

  const totalAmount = taxableAmount + totalTax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCustomerChange = (custId: string) => {
    setCustomerId(custId);
    const customer = customers.find(c => c.id === custId);
    if (customer) {
      setCustomerName(mdLabel.customer(customer));
    }
  };

  const handleSave = (status: 'draft' | 'sent') => {
    const invoice = {
      invoiceType,
      customerId,
      customerName,
      serviceJobId,
      contractId,
      lineItems,
      subtotal,
      totalDiscount,
      taxableAmount,
      totalTax,
      totalAmount,
      paymentTerms,
      notes,
      status,
    };
    console.log('Saving invoice:', invoice);
    // Here you would call the API to save the invoice
    router.push('/after-sales-service/billing');
  };

  return (
    <div className="p-6 max-w-[1400px]">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Invoice</h1>
            <p className="text-gray-600">Generate a new service invoice</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSave('draft')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('sent')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Save & Send
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invoice Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Type *
                </label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {invoiceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loadingCustomers}
                >
                  <option value="">{loadingCustomers ? 'Loading…' : 'Select Customer'}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {mdLabel.customer(customer)}
                    </option>
                  ))}
                </select>
              </div>

              {invoiceType === 'Service' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Job Reference
                  </label>
                  <input
                    type="text"
                    value={serviceJobId}
                    onChange={(e) => setServiceJobId(e.target.value)}
                    placeholder="e.g., FS-2025-000456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {invoiceType === 'AMC' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Reference
                  </label>
                  <input
                    type="text"
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    placeholder="e.g., AMC-2025-0012"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Terms *
                </label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {paymentTermsOptions.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
              <button
                onClick={addLineItem}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    {lineItems.length > 1 && (
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Type *
                      </label>
                      <select
                        value={item.itemType}
                        onChange={(e) => updateLineItem(item.id, 'itemType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      >
                        {itemTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Enter item description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price (₹) *
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST Rate (%)
                      </label>
                      <select
                        value={item.taxRate}
                        onChange={(e) => updateLineItem(item.id, 'taxRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes or terms & conditions..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Invoice Summary</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-red-600">- {formatCurrency(totalDiscount)}</span>
              </div>

              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Taxable Amount</span>
                <span className="font-medium text-gray-900">{formatCurrency(taxableAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(totalTax)}</span>
              </div>

              <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Invoice Preview</p>
                  <p className="text-xs text-blue-700 mt-1">
                    {customerName || 'Select a customer'} will receive this invoice with {lineItems.length} item(s)
                  </p>
                </div>
              </div>
            </div>

            {customerId && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Customer Details</p>
                <p className="text-sm text-gray-900">{customerName}</p>
                {customers.find(c => c.id === customerId)?.customerCode && (
                  <p className="text-xs text-gray-600 mt-1">
                    Code: {customers.find(c => c.id === customerId)?.customerCode}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Payment Terms:</strong> {paymentTerms}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
