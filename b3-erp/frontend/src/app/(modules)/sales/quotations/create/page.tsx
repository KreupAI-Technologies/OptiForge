'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  X,
  Plus,
  Trash2,
  Search,
  Calendar,
  User,
  Building2,
  FileText,
  DollarSign,
  Percent,
  Calculator,
  Package,
  Minus,
  ArrowLeft,
  Copy,
  Eye,
  Settings,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { quotationService } from '@/services/quotation.service';
import { crmService } from '@/services/crm.service';
import { useRouter } from 'next/navigation';

interface QuotationItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  unitCost: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  taxType: string;
  lineTotal: number;
  margin?: number;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0095 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 0.044 },
];

const TAX_RATES = [
  { name: 'GST 0%', rate: 0 },
  { name: 'GST 5%', rate: 5 },
  { name: 'GST 12%', rate: 12 },
  { name: 'GST 18%', rate: 18 },
  { name: 'GST 28%', rate: 28 },
  { name: 'VAT 5%', rate: 5 },
  { name: 'VAT 15%', rate: 15 },
];

export default function CreateQuotationPage() {
  const router = useRouter();
  const [quotationNumber, setQuotationNumber] = useState('QTN-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net_30');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      productId: '',
      productCode: '',
      productName: '',
      description: '',
      quantity: 1,
      unit: 'nos',
      unitPrice: 0,
      unitCost: 0,
      discount: 0,
      discountType: 'percent',
      tax: 18,
      taxType: 'GST 18%',
      lineTotal: 0,
      margin: 0
    }
  ]);

  useEffect(() => {
    let cancelled = false;
    crmService.customers
      .getAll()
      .then((res: any[]) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : [];
        setCustomers(
          list.map((c) => ({
            id: String(c?.id ?? c?.customerId ?? ''),
            name: c?.contactPerson ?? c?.primaryContact ?? c?.contactName ?? c?.name ?? '',
            company: c?.name ?? c?.customerName ?? c?.companyName ?? 'Unnamed Customer',
            email: c?.email ?? c?.contactEmail ?? '',
            phone: c?.phone ?? c?.contactPhone ?? c?.mobile ?? '',
            address: c?.address ?? c?.billingAddress ?? c?.city ?? '',
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setCustomers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const calculateLineTotal = (item: QuotationItem): { total: number; margin: number } => {
    let priceAfterDiscount = item.unitPrice;
    if (item.discountType === 'percent') {
      priceAfterDiscount = item.unitPrice * (1 - item.discount / 100);
    } else {
      priceAfterDiscount = item.unitPrice - item.discount;
    }

    const subtotal = item.quantity * priceAfterDiscount;
    const taxAmount = subtotal * (item.tax / 100);
    const total = subtotal + taxAmount;

    const totalCost = item.quantity * item.unitCost;
    const margin = subtotal > 0 ? ((subtotal - totalCost) / subtotal) * 100 : 0;

    return { total, margin };
  };

  const updateItem = (index: number, field: keyof QuotationItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    const { total, margin } = calculateLineTotal(item);
    item.lineTotal = total;
    item.margin = margin;

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        productId: '',
        productCode: '',
        productName: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0,
        unitCost: 0,
        discount: 0,
        discountType: 'percent',
        tax: 18,
        taxType: 'GST 18%',
        lineTotal: 0,
        margin: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((sum, item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      if (item.discountType === 'percent') {
        return sum + (lineSubtotal * item.discount / 100);
      }
      return sum + item.discount;
    }, 0);
  };

  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      let priceAfterDiscount = item.unitPrice;
      if (item.discountType === 'percent') {
        priceAfterDiscount = item.unitPrice * (1 - item.discount / 100);
      } else {
        priceAfterDiscount = item.unitPrice - item.discount;
      }
      return sum + (item.quantity * priceAfterDiscount * (item.tax / 100));
    }, 0);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const calculateOverallMargin = () => {
    const totalRevenue = items.reduce((sum, item) => {
      let priceAfterDiscount = item.unitPrice;
      if (item.discountType === 'percent') {
        priceAfterDiscount = item.unitPrice * (1 - item.discount / 100);
      } else {
        priceAfterDiscount = item.unitPrice - item.discount;
      }
      return sum + (item.quantity * priceAfterDiscount);
    }, 0);

    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    return totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
  };

  const handleSave = async (status: string) => {
    if (!selectedCustomer) {
      setSaveError('Please select a customer before saving.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const created = await quotationService.createQuotation({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.company,
        quotationDate,
        validUntil,
        status: status as any,
        currency: currency.code,
        exchangeRate: currency.rate,
        paymentTerms,
        deliveryTerms,
        notes,
        termsAndConditions,
        items: items.map(item => ({
          productId: item.productId || 'manual',
          productCode: item.productCode || 'MANUAL',
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercentage: item.discountType === 'percent' ? item.discount : 0,
          taxRate: item.tax,
        }))
      });
      // When "Send Quotation" was clicked, dispatch it to the customer.
      if (status === 'sent' && created?.id) {
        try {
          await quotationService.sendQuotation(created.id);
        } catch {
          // Quotation saved; sending is best-effort and can be retried from the list.
        }
      }
      router.push('/sales/quotations');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to create quotation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const overallMargin = calculateOverallMargin();
  const marginStatus = overallMargin < 15 ? 'critical' : overallMargin < 25 ? 'warning' : 'healthy';

  return (
    <div className="w-full h-full px-4 py-2">
      <div className="space-y-3">
        {/* Inline Header with Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSaving ? 'Sending...' : 'Send Quotation'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{saveError}</span>
            <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Main Form - Left Side */}
          <div className="xl:col-span-2 space-y-2">
            {/* Quotation Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Quotation Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quotation Number
                  </label>
                  <input
                    type="text"
                    value={quotationNumber}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Quotation Date
                  </label>
                  <input
                    type="date"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency.code}
                    onChange={(e) => {
                      const selected = CURRENCIES.find(c => c.code === e.target.value);
                      if (selected) setCurrency(selected);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Customer Information
              </h2>

              {!selectedCustomer ? (
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search customer..."
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setShowCustomerSearch(true);
                        }}
                        onFocus={() => setShowCustomerSearch(true)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {showCustomerSearch && customerSearchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerSearch(false);
                            setCustomerSearchTerm('');
                          }}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-semibold text-sm text-gray-900">{customer.company}</p>
                          <p className="text-xs text-gray-600">{customer.name} • {customer.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 relative group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedCustomer.company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{selectedCustomer.company}</p>
                      <div className="grid grid-cols-2 gap-x-4 mt-1">
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <User className="w-3 h-3" /> {selectedCustomer.name}
                        </p>
                        <p className="text-xs text-gray-600">{selectedCustomer.email}</p>
                        <p className="text-xs text-gray-500 col-span-2 mt-1 italic">{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="absolute top-2 right-2 p-1 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Line Items
                </h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left font-semibold text-gray-600 p-2 min-w-[150px]">Product / Desc</th>
                      <th className="text-center font-semibold text-gray-600 p-2 w-16">Qty</th>
                      <th className="text-right font-semibold text-gray-600 p-2 w-28">Unit Price</th>
                      <th className="text-right font-semibold text-gray-600 p-2 w-24">Discount</th>
                      <th className="text-right font-semibold text-gray-600 p-2 w-24">Tax</th>
                      <th className="text-right font-semibold text-gray-600 p-2 w-24">Margin</th>
                      <th className="text-right font-semibold text-gray-600 p-2 w-28">Total</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100 group hover:bg-gray-50/50">
                        <td className="p-2 space-y-1">
                          <input
                            type="text"
                            placeholder="Product name"
                            value={item.productName}
                            onChange={(e) => updateItem(index, 'productName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 outline-none text-xs font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Brief description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-transparent rounded group-hover:border-gray-200 focus:border-blue-500 outline-none text-[10px] text-gray-500"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-1 py-1 border border-gray-200 rounded text-center text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded">
                            <span className="text-gray-400 text-[10px]">{currency.symbol}</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full text-right outline-none text-xs font-medium bg-transparent"
                            />
                          </div>
                          <div className="mt-1 text-[9px] text-gray-400 text-right">Cost: {currency.symbol}{item.unitCost}</div>
                        </td>
                        <td className="p-2">
                          <div className="flex border border-gray-200 rounded overflow-hidden">
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-full px-1 py-1 outline-none text-right text-xs"
                            />
                            <button
                              onClick={() => updateItem(index, 'discountType', item.discountType === 'percent' ? 'amount' : 'percent')}
                              className="px-1.5 py-1 bg-gray-50 border-l border-gray-200 text-[10px] text-gray-500 hover:bg-gray-100"
                            >
                              {item.discountType === 'percent' ? '%' : currency.symbol}
                            </button>
                          </div>
                        </td>
                        <td className="p-2">
                          <select
                            value={item.taxType}
                            onChange={(e) => {
                              const tax = TAX_RATES.find(t => t.name === e.target.value);
                              updateItem(index, 'taxType', e.target.value);
                              updateItem(index, 'tax', tax?.rate || 0);
                            }}
                            className="w-full p-1 border border-gray-200 rounded text-[10px] outline-none"
                          >
                            {TAX_RATES.map(t => (
                              <option key={t.name} value={t.name}>{t.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-right">
                          <div className={`text-xs font-bold ${(item.margin || 0) < 15 ? 'text-red-500' : (item.margin || 0) < 25 ? 'text-orange-500' : 'text-green-600'}`}>
                            {(item.margin || 0).toFixed(1)}%
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          <span className="font-bold text-gray-900 text-xs">
                            {currency.symbol}{item.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => removeItem(index)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Notes & Internal Comments
                </h3>
                <textarea
                  placeholder="Internal notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-purple-500" />
                  Terms & Conditions
                </h3>
                <textarea
                  placeholder="Terms appearing on PDF..."
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Summary - Right Side */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Price Summary
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-800">
                    {currency.symbol}{calculateSubtotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total Discount</span>
                  <span className="font-semibold text-orange-600">
                    -{currency.symbol}{calculateTotalDiscount().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax Total</span>
                  <span className="font-semibold text-gray-800">
                    {currency.symbol}{calculateTotalTax().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-4 border-t border-dashed border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Payable</span>
                      <span className="text-sm text-gray-400">Exch: {currency.rate}</span>
                    </div>
                    <span className="text-3xl font-black text-blue-600">
                      {currency.symbol}{calculateGrandTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600 uppercase">Margin Health Check</span>
                    {marginStatus === 'healthy' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Healthy
                      </span>
                    ) : marginStatus === 'warning' ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase">
                        <AlertTriangle className="w-3 h-3" /> Warning
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                  </div>

                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-500 ${marginStatus === 'healthy' ? 'bg-green-500' : marginStatus === 'warning' ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(overallMargin * 2, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xl font-bold text-gray-900">{overallMargin.toFixed(1)}%</span>
                    {overallMargin < 15 && (
                      <p className="text-[10px] text-red-500 font-medium italic">Below 15% minimum threshold!</p>
                    )}
                  </div>

                  <div className="mt-4 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 flex gap-2">
                      <Info className="w-3 h-3 shrink-0 text-blue-400" />
                      <span>Margin is calculated based on standard costs and actual selling price after discounts.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Settings & Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-600">
                  <Copy className="w-3.5 h-3.5" /> Template
                </button>
                <button className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-600">
                  <Upload className="w-3.5 h-3.5" /> Import
                </button>
                <button className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-600 col-span-2">
                  <Download className="w-3.5 h-3.5" /> Download Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
