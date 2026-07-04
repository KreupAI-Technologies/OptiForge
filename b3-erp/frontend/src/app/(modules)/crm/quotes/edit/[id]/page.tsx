'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { MasterDataService, MDCustomer, MDEmployee, mdLabel, fetchRecordById } from '@/services/master-data.service';

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

const mockQuotesSeed: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QT-2024-001',
    title: 'Enterprise Software License - Annual',
    customer: 'TechCorp Global Inc.',
    contact: 'Sarah Johnson (CTO)',
    status: 'sent',
    amount: 850000,
    discount: 212500,
    finalAmount: 637500,
    validUntil: '2024-11-30',
    createdDate: '2024-10-15',
    sentDate: '2024-10-16',
    owner: 'Michael Chen',
    products: 5,
    probability: 75,
  },
  {
    id: '2',
    quoteNumber: 'QT-2024-002',
    title: 'Professional Services Package',
    customer: 'FinanceHub International',
    contact: 'Elizabeth Wilson (CFO)',
    status: 'accepted',
    amount: 520000,
    discount: 52000,
    finalAmount: 468000,
    validUntil: '2024-10-31',
    createdDate: '2024-10-10',
    sentDate: '2024-10-11',
    acceptedDate: '2024-10-18',
    owner: 'Emily Rodriguez',
    products: 3,
    probability: 100,
  },
  {
    id: '3',
    quoteNumber: 'QT-2024-003',
    title: 'Cloud Infrastructure Setup',
    customer: 'StartupTech Inc.',
    contact: 'Michael Chen (CEO)',
    status: 'viewed',
    amount: 125000,
    discount: 12500,
    finalAmount: 112500,
    validUntil: '2024-11-15',
    createdDate: '2024-10-18',
    sentDate: '2024-10-19',
    owner: 'David Martinez',
    products: 4,
    probability: 60,
  },
  {
    id: '4',
    quoteNumber: 'QT-2024-004',
    title: 'Manufacturing ERP Implementation',
    customer: 'GlobalManufacturing Corp',
    contact: 'Robert Davis (VP Operations)',
    status: 'draft',
    amount: 950000,
    discount: 95000,
    finalAmount: 855000,
    validUntil: '2024-12-15',
    createdDate: '2024-10-20',
    owner: 'Sarah Johnson',
    products: 8,
    probability: 50,
  },
];

interface QuoteItem {
  id: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export default function QuoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.id as string;

  const existingQuote = mockQuotesSeed.find(q => q.id === quoteId);

  // Live customer picker — initialized empty, filled on mount
  const [customers, setCustomers] = useState<MDCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Live employee picker for "Quote Owner" — initialized empty, filled on mount
  const [employees, setEmployees] = useState<MDEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    setCustomersLoading(true);
    MasterDataService.getCustomers().then(live => {
      if (live.length > 0) setCustomers(live);
    }).finally(() => setCustomersLoading(false));

    setEmployeesLoading(true);
    MasterDataService.getEmployees().then(live => {
      if (live.length > 0) setEmployees(live);
    }).finally(() => setEmployeesLoading(false));
  }, []);

  const [formData, setFormData] = useState({
    title: existingQuote?.title || '',
    customer: existingQuote?.customer || '',
    contact: existingQuote?.contact || '',
    status: existingQuote?.status || 'draft',
    validUntil: existingQuote?.validUntil || '',
    owner: existingQuote?.owner || '',
    probability: existingQuote?.probability || 50,
  });

  // Fetch the real quote record and prefill form if found
  useEffect(() => {
    if (!quoteId) return;
    fetchRecordById<Partial<Quote>>('/crm/quotes', quoteId).then(record => {
      if (!record) return;
      setFormData(prev => ({
        ...prev,
        title: record.title ?? prev.title,
        customer: record.customer ?? prev.customer,
        contact: record.contact ?? prev.contact,
        status: record.status ?? prev.status,
        validUntil: record.validUntil ?? prev.validUntil,
        owner: record.owner ?? prev.owner,
        probability: record.probability ?? prev.probability,
      }));
    });
  }, [quoteId]);

  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      product: 'Enterprise Software License',
      description: 'Annual subscription for up to 500 users',
      quantity: 1,
      unitPrice: 500000,
      discount: 100000,
    },
    {
      id: '2',
      product: 'Implementation Services',
      description: 'Professional setup and configuration',
      quantity: 1,
      unitPrice: 150000,
      discount: 50000,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!existingQuote) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-600 mb-2">The quote you're trying to edit doesn't exist.</p>
          <Link href="/crm/quotes" className="text-blue-600 hover:underline">
            Return to Quotes
          </Link>
        </div>
      </div>
    );
  }

  const calculateItemTotal = (item: QuoteItem) => {
    return (item.quantity * item.unitPrice) - item.discount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
    const total = subtotal - totalDiscount;
    return { subtotal, totalDiscount, total };
  };

  const totals = calculateTotals();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Quote title is required';
    }

    if (!formData.customer.trim()) {
      newErrors.customer = 'Customer name is required';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact person is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (!formData.owner.trim()) {
      newErrors.owner = 'Quote owner is required';
    }

    if (items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    items.forEach((item, index) => {
      if (!item.product.trim()) {
        newErrors[`item_${index}_product`] = 'Product name is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      router.push(`/crm/quotes/view/${quoteId}`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        product: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
            <p className="text-gray-600 mt-1">{existingQuote.quoteNumber}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-3">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>

              <div className="space-y-2">
                {/* Quote Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter quote title"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Customer */}
                  <div>
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer *
                    </label>
                    <select
                      id="customer"
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.customer ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={customersLoading}
                    >
                      <option value="">{customersLoading ? 'Loading customers…' : 'Select customer'}</option>
                      {customers.map(c => (
                        <option key={c.id} value={mdLabel.customer(c)}>{mdLabel.customer(c)}</option>
                      ))}
                      {/* Keep existing value selectable even if not yet in live list */}
                      {formData.customer && !customers.find(c => mdLabel.customer(c) === formData.customer) && (
                        <option value={formData.customer}>{formData.customer}</option>
                      )}
                    </select>
                    {errors.customer && (
                      <p className="text-sm text-red-600 mt-1">{errors.customer}</p>
                    )}
                  </div>

                  {/* Contact */}
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.contact ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter contact person"
                    />
                    {errors.contact && (
                      <p className="text-sm text-red-600 mt-1">{errors.contact}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="viewed">Viewed</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  {/* Valid Until */}
                  <div>
                    <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-1">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      id="validUntil"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.validUntil ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.validUntil && (
                      <p className="text-sm text-red-600 mt-1">{errors.validUntil}</p>
                    )}
                  </div>

                  {/* Win Probability */}
                  <div>
                    <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-1">
                      Win Probability (%)
                    </label>
                    <input
                      type="number"
                      id="probability"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Owner */}
                <div>
                  <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Owner *
                  </label>
                  <select
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.owner ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={employeesLoading}
                  >
                    <option value="">{employeesLoading ? 'Loading employees…' : 'Select owner'}</option>
                    {employees.map(e => (
                      <option key={e.id} value={mdLabel.employee(e)}>{mdLabel.employee(e)}</option>
                    ))}
                    {/* Keep existing value selectable even if not yet in live list */}
                    {formData.owner && !employees.find(e => mdLabel.employee(e) === formData.owner) && (
                      <option value={formData.owner}>{formData.owner}</option>
                    )}
                  </select>
                  {errors.owner && (
                    <p className="text-sm text-red-600 mt-1">{errors.owner}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quote Items */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Quote Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              {errors.items && (
                <p className="text-sm text-red-600 mb-2">{errors.items}</p>
              )}

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Item {index + 1}</h3>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Product Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={item.product}
                          onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter product name"
                        />
                        {errors[`item_${index}_product`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_product`]}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product description"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Quantity */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Price ($) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_unitPrice`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_unitPrice`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`item_${index}_unitPrice`]}</p>
                          )}
                        </div>

                        {/* Discount */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Total */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total
                          </label>
                          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-semibold text-gray-900">
                            ${calculateItemTotal(item).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-orange-600">
                      <span>Total Discount:</span>
                      <span className="font-semibold">-${totals.totalDiscount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                      <span>Total:</span>
                      <span>${totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Quote Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Quote Summary</h2>

              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quote Number</p>
                  <p className="text-sm font-medium text-gray-900">{existingQuote.quoteNumber}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(existingQuote.createdDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Number of Items</p>
                  <p className="text-sm font-medium text-gray-900">{items.length}</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Current Total</p>
                  <p className="text-2xl font-bold text-green-600">${totals.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
