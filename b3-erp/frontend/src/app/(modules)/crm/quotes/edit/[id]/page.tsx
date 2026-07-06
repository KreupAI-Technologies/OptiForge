'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { MasterDataService, MDCustomer, MDEmployee, mdLabel } from '@/services/master-data.service';
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
}

export default function QuoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.id as string;

  // The live quote record (loaded from the API), used for read-only summary fields.
  const [existingQuote, setExistingQuote] = useState<Partial<Quote> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live customer picker — initialized empty, filled on mount
  const [customers, setCustomers] = useState<MDCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  // Live employee picker for "Quote Owner" — initialized empty, filled on mount
  const [employees, setEmployees] = useState<MDEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Live product catalogue for the "Add from catalogue" picker.
  const [products, setProducts] = useState<{ id: string; name: string; price: number; description: string }[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  useEffect(() => {
    setCustomersLoading(true);
    MasterDataService.getCustomers().then(live => {
      if (live.length > 0) setCustomers(live);
    }).finally(() => setCustomersLoading(false));

    setEmployeesLoading(true);
    MasterDataService.getEmployees().then(live => {
      if (live.length > 0) setEmployees(live);
    }).finally(() => setEmployeesLoading(false));

    crmService.products.getAll()
      .then((r: any) => {
        const rows = Array.isArray(r) ? r : r?.data ?? [];
        setProducts(
          rows.map((p: any, i: number) => ({
            id: p.id ?? String(i),
            name: p.name ?? p.productName ?? 'Product',
            price: Number(p.basePrice ?? p.price ?? p.unitPrice ?? 0),
            description: p.description ?? '',
          })),
        );
      })
      .catch(() => setProducts([]));
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    contact: '',
    status: 'draft' as Quote['status'],
    validUntil: '',
    owner: '',
    probability: 50,
  });

  const [items, setItems] = useState<QuoteItem[]>([]);

  // Fetch the real quote record and prefill form + items.
  useEffect(() => {
    if (!quoteId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    crmService.quotes
      .getById(quoteId)
      .then((record: any) => {
        if (cancelled || !record || typeof record !== 'object') return;
        setExistingQuote({
          id: record.id ?? quoteId,
          quoteNumber: record.quoteNumber ?? record.number ?? quoteId,
          createdDate: (record.createdAt ?? record.createdDate ?? '').toString().slice(0, 10),
        });
        setFormData(prev => ({
          ...prev,
          title: record.title ?? prev.title,
          customer: record.customerName ?? record.customer ?? prev.customer,
          contact: record.contactName ?? record.contact ?? prev.contact,
          status: (record.status ?? prev.status) as Quote['status'],
          validUntil: (record.validUntil ?? prev.validUntil ?? '').toString().slice(0, 10),
          owner: record.preparedByName ?? record.owner ?? prev.owner,
          probability: Number(record.probability ?? prev.probability),
        }));
        const rawItems = Array.isArray(record.items) ? record.items : [];
        if (rawItems.length > 0) {
          setItems(
            rawItems.map((it: any, i: number) => ({
              id: it.id ?? String(i),
              product: it.product ?? it.productName ?? it.name ?? '',
              description: it.description ?? '',
              quantity: Number(it.quantity ?? 1),
              unitPrice: Number(it.unitPrice ?? it.price ?? 0),
              discount: Number(it.discount ?? it.discountAmount ?? 0),
            })),
          );
        }
      })
      .catch((err: any) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load quote');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-blue-700">Loading quote…</div>
    );
  }

  if (!existingQuote) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-600 mb-2">
            {loadError ? loadError : "The quote you're trying to edit doesn't exist."}
          </p>
          <Link href="/crm/quotes" className="text-blue-600 hover:underline">
            Return to Quotes
          </Link>
        </div>
      </div>
    );
  }

  const addProductFromCatalogue = (p: { name: string; price: number; description: string }) => {
    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        product: p.name,
        description: p.description,
        quantity: 1,
        unitPrice: p.price,
        discount: 0,
      },
    ]);
    setShowProductPicker(false);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    setSubmitError(null);
    try {
      const t = calculateTotals();
      const payload: any = {
        title: formData.title,
        customerName: formData.customer,
        contactName: formData.contact,
        status: formData.status,
        validUntil: formData.validUntil,
        preparedByName: formData.owner,
        probability: formData.probability,
        subtotal: t.subtotal,
        discountAmount: t.totalDiscount,
        totalAmount: t.total,
        items: items.map((it) => ({
          product: it.product,
          productName: it.product,
          description: it.description,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discount: it.discount,
        })),
      };
      await crmService.quotes.update(quoteId, payload);
      router.push(`/crm/quotes/view/${quoteId}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update quote');
      setSaving(false);
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
            <p className="text-gray-600 mt-1">{existingQuote.quoteNumber ?? quoteId}</p>
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
                <div className="flex items-center gap-2">
                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowProductPicker(v => !v)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                      From Catalogue
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {showProductPicker && products.length > 0 && (
                <div className="mb-3 border border-gray-200 rounded-lg p-2 max-h-56 overflow-y-auto space-y-1">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => addProductFromCatalogue(p)}
                      className="w-full text-left p-2 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                          <div className="text-xs text-gray-600">{p.description}</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">${p.price.toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

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
                  <p className="text-sm font-medium text-gray-900">{existingQuote.quoteNumber ?? quoteId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Created Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {existingQuote.createdDate ? new Date(existingQuote.createdDate).toLocaleDateString() : '—'}
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
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? 'Saving…' : 'Save Changes'}</span>
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
