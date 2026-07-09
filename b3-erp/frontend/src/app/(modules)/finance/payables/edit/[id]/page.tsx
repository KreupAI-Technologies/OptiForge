'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FinanceService } from '@/services/finance.service';
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  Calendar,
  FileText,
  Plus,
  Trash2,
  Upload,
  IndianRupee,
  Package,
  Calculator,
} from 'lucide-react';

// TypeScript Interfaces
interface BillLineItem {
  id: string;
  productService: string;
  description: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

interface PayableFormData {
  vendorId: string;
  vendorName: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  poReference: string;
  creditPeriod: number;

  // Line Items
  lineItems: BillLineItem[];

  // Totals
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  grandTotal: number;

  // Additional Info
  paymentTerms: string;
  notes: string;
  attachments: string[];
}

// Empty form shell; hydrated from the backend on mount.
const emptyPayable: PayableFormData = {
  vendorId: '',
  vendorName: '',
  billNumber: '',
  billDate: '',
  dueDate: '',
  poReference: '',
  creditPeriod: 0,

  lineItems: [],

  subtotal: 0,
  totalDiscount: 0,
  taxableAmount: 0,
  totalCGST: 0,
  totalSGST: 0,
  totalIGST: 0,
  totalGST: 0,
  grandTotal: 0,

  paymentTerms: '',
  notes: '',
  attachments: [],
};

const gstRates = [0, 5, 12, 18, 28];

const units = ['MT', 'KG', 'PC', 'BOX', 'SET', 'LTR', 'SQM', 'RM', 'NOS'];

export default function EditPayablePage() {
  const router = useRouter();
  const params = useParams();
  const payableId = params.id as string;

  const [formData, setFormData] = useState<PayableFormData>(emptyPayable);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!payableId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    setNotFound(false);
    (async () => {
      try {
        const raw = await FinanceService.getPayable(payableId);
        if (cancelled) return;
        if (!raw || (raw.id == null && raw.billNumber == null && raw.vendorName == null)) {
          setNotFound(true);
          return;
        }
        const m: any = raw || {};
        setFormData((prev) => ({
          ...prev,
          ...(m.vendorId != null ? { vendorId: String(m.vendorId) } : {}),
          ...(m.vendorName != null ? { vendorName: String(m.vendorName) } : {}),
          ...(m.billNumber != null ? { billNumber: String(m.billNumber) } : {}),
          ...(m.billDate != null ? { billDate: String(m.billDate) } : {}),
          ...(m.dueDate != null ? { dueDate: String(m.dueDate) } : {}),
          ...(m.poReference != null ? { poReference: String(m.poReference) } : {}),
          ...(m.grandTotal != null ? { grandTotal: Number(m.grandTotal) } : {}),
          ...(m.paymentTerms != null ? { paymentTerms: String(m.paymentTerms) } : {}),
          ...(m.notes != null ? { notes: String(m.notes) } : {}),
          ...(Array.isArray(m.lineItems) ? { lineItems: m.lineItems } : {}),
        }));
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message || 'Failed to load payable');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payableId, reloadKey]);

  const calculateLineItemTotals = (item: Partial<BillLineItem>): BillLineItem => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discount = item.discount || 0;
    const gstRate = item.gstRate || 0;

    const grossAmount = quantity * unitPrice;
    const discountAmount = (grossAmount * discount) / 100;
    const taxableAmount = grossAmount - discountAmount;

    const gstAmount = (taxableAmount * gstRate) / 100;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const igst = 0; // For simplicity, assuming intra-state

    const totalAmount = taxableAmount + gstAmount;

    return {
      id: item.id || Date.now().toString(),
      productService: item.productService || '',
      description: item.description || '',
      hsnSac: item.hsnSac || '',
      quantity,
      unit: item.unit || 'PC',
      unitPrice,
      discount,
      taxableAmount,
      gstRate,
      cgst,
      sgst,
      igst,
      totalAmount,
    };
  };

  const calculateTotals = (items: BillLineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = items.reduce((sum, item) => sum + ((item.quantity * item.unitPrice * item.discount) / 100), 0);
    const taxableAmount = items.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalCGST = items.reduce((sum, item) => sum + item.cgst, 0);
    const totalSGST = items.reduce((sum, item) => sum + item.sgst, 0);
    const totalIGST = items.reduce((sum, item) => sum + item.igst, 0);
    const totalGST = totalCGST + totalSGST + totalIGST;
    const grandTotal = taxableAmount + totalGST;

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGST,
      grandTotal,
    };
  };

  const handleLineItemChange = (index: number, field: keyof BillLineItem, value: any) => {
    const updatedItems = [...formData.lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Recalculate line item totals
    updatedItems[index] = calculateLineItemTotals(updatedItems[index]);

    // Recalculate overall totals
    const totals = calculateTotals(updatedItems);

    setFormData({
      ...formData,
      lineItems: updatedItems,
      ...totals,
    });
  };

  const addLineItem = () => {
    const newItem: BillLineItem = {
      id: Date.now().toString(),
      productService: '',
      description: '',
      hsnSac: '',
      quantity: 1,
      unit: 'PC',
      unitPrice: 0,
      discount: 0,
      taxableAmount: 0,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalAmount: 0,
    };

    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, newItem],
    });
  };

  const removeLineItem = (index: number) => {
    const updatedItems = formData.lineItems.filter((_, i) => i !== index);
    const totals = calculateTotals(updatedItems);

    setFormData({
      ...formData,
      lineItems: updatedItems,
      ...totals,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await FinanceService.updatePayable(payableId, formData);
      router.push(`/finance/payables/view/${payableId}`);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to update payable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDueDateCalculation = (billDate: string, creditDays: number) => {
    const date = new Date(billDate);
    date.setDate(date.getDate() + creditDays);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {isLoading && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
          Loading…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center justify-between">
          <span>{loadError}</span>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="ml-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      {notFound && !isLoading && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm text-yellow-700">
          Payable not found.
        </div>
      )}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push(`/finance/payables/view/${payableId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Payable Details</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Payable</h1>
            <p className="text-sm text-gray-600 mt-1">Update bill and payment details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Vendor & Bill Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-orange-600" />
            Vendor & Bill Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter vendor name"
                required
              />
            </div>

            {/* Bill Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billNumber}
                onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter bill number"
                required
              />
            </div>

            {/* Bill Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.billDate}
                onChange={(e) => {
                  const newDueDate = handleDueDateCalculation(e.target.value, formData.creditPeriod);
                  setFormData({
                    ...formData,
                    billDate: e.target.value,
                    dueDate: newDueDate,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* Credit Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credit Period (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.creditPeriod}
                onChange={(e) => {
                  const creditDays = parseInt(e.target.value) || 0;
                  const newDueDate = handleDueDateCalculation(formData.billDate, creditDays);
                  setFormData({
                    ...formData,
                    creditPeriod: creditDays,
                    dueDate: newDueDate,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="30"
                min="0"
                required
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            {/* PO Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Reference
              </label>
              <input
                type="text"
                value={formData.poReference}
                onChange={(e) => setFormData({ ...formData, poReference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="PO-2025-XXXX"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Package className="h-5 w-5 mr-2 text-orange-600" />
              Line Items
            </h2>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.lineItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Item {index + 1}</h3>
                  {formData.lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {/* Product/Service */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product/Service <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.productService}
                      onChange={(e) => handleLineItemChange(index, 'productService', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter product/service name"
                      required
                    />
                  </div>

                  {/* HSN/SAC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN/SAC Code
                    </label>
                    <input
                      type="text"
                      value={item.hsnSac}
                      onChange={(e) => handleLineItemChange(index, 'hsnSac', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="HSN/SAC"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Discount % */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) => handleLineItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  {/* GST Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.gstRate}
                      onChange={(e) => handleLineItemChange(index, 'gstRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      {gstRates.map((rate) => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter item description"
                      rows={2}
                    />
                  </div>

                  {/* Item Summary */}
                  <div className="lg:col-span-4 bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Taxable Amount:</p>
                        <p className="font-bold text-gray-900">{formatCurrency(item.taxableAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">CGST ({item.gstRate / 2}%):</p>
                        <p className="font-bold text-gray-900">{formatCurrency(item.cgst)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">SGST ({item.gstRate / 2}%):</p>
                        <p className="font-bold text-gray-900">{formatCurrency(item.sgst)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount:</p>
                        <p className="font-bold text-green-600 text-lg">{formatCurrency(item.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-orange-600" />
            Bill Summary
          </h2>

          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(formData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-semibold text-red-600">- {formatCurrency(formData.totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-gray-600">Taxable Amount:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(formData.taxableAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">CGST:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(formData.totalCGST)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SGST:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(formData.totalSGST)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total GST:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(formData.totalGST)}</span>
            </div>
            <div className="flex justify-between text-lg border-t-2 border-gray-300 pt-3">
              <span className="font-bold text-gray-900">Grand Total:</span>
              <span className="font-bold text-green-600">{formatCurrency(formData.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-600" />
            Additional Information
          </h2>

          <div className="space-y-2">
            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <textarea
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter payment terms"
                rows={2}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter any additional notes"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push(`/finance/payables/view/${payableId}`)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Updating...' : 'Update Payable'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
