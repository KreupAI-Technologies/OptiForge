'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MasterDataService, MDVendor, mdLabel } from '@/services/master-data.service';
import {
  ArrowLeft,
  Save,
  FileText,
  Building2,
  Package,
  Plus,
  Trash2,
  Calculator,
  IndianRupee,
  Upload,
  FileCheck,
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
  billType: 'purchase_invoice' | 'expense' | 'credit_note';
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
  roundOff: number;
  grandTotal: number;

  // Additional Info
  paymentTerms: string;
  notes: string;
  attachments: File[];
}

// Indian Vendors — seed/fallback (kept as unused fallback per wiring contract)
const indianVendorsSeed = [
  { id: 'VEN-001', name: 'JSW Steel Limited', category: 'Raw Material', gst: '27AAACJ8564D1ZV', city: 'Mumbai' },
  { id: 'VEN-002', name: 'Tata Steel Limited', category: 'Raw Material', gst: '20AAACT2727Q1ZV', city: 'Jamshedpur' },
  { id: 'VEN-003', name: 'Hindalco Industries Ltd', category: 'Raw Material', gst: '27AAACH6454L1ZM', city: 'Mumbai' },
  { id: 'VEN-004', name: 'ACC Cement', category: 'Raw Material', gst: '27AAACA3551M1ZV', city: 'Mumbai' },
  { id: 'VEN-005', name: 'Ultratech Cement Ltd', category: 'Raw Material', gst: '08AAACL0266B1ZN', city: 'Ahmedabad' },
  { id: 'VEN-006', name: 'Asian Paints Ltd', category: 'Raw Material', gst: '27AAACA1198L1Z2', city: 'Mumbai' },
  { id: 'VEN-007', name: 'Berger Paints India', category: 'Raw Material', gst: '19AAACB7902F1ZD', city: 'Kolkata' },
  { id: 'VEN-008', name: 'VRL Logistics Ltd', category: 'Services', gst: '29AAACV6393K1ZU', city: 'Bangalore' },
  { id: 'VEN-009', name: 'Blue Dart Express', category: 'Services', gst: '27AABCB2426J1ZO', city: 'Mumbai' },
  { id: 'VEN-010', name: 'Mahindra Logistics', category: 'Services', gst: '27AABCM3939F1ZY', city: 'Mumbai' },
  { id: 'VEN-011', name: 'Reliance Industries Ltd', category: 'Raw Material', gst: '24AAACR5055K1Z4', city: 'Surat' },
  { id: 'VEN-012', name: 'L&T Construction', category: 'Contractor', gst: '27AAACL0489C1ZB', city: 'Mumbai' },
];

const billTypes = [
  { value: 'purchase_invoice', label: 'Purchase Invoice' },
  { value: 'expense', label: 'Expense' },
  { value: 'credit_note', label: 'Credit Note' },
];

const gstRates = [0, 5, 12, 18, 28];
const units = ['MT', 'KG', 'PC', 'BOX', 'SET', 'LTR', 'SQM', 'RM', 'NOS', 'FT', 'CUM'];

export default function AddPayablePage() {
  const router = useRouter();

  // Live vendor picker — initialized from seed so UI renders immediately
  const [vendors, setVendors] = useState<MDVendor[]>(
    indianVendorsSeed.map(v => ({ id: v.id, vendorName: v.name, vendorCode: v.id, category: v.category }))
  );
  const [vendorsLoading, setVendorsLoading] = useState(false);

  useEffect(() => {
    setVendorsLoading(true);
    MasterDataService.getVendors().then(live => {
      if (live.length > 0) setVendors(live);
    }).finally(() => setVendorsLoading(false));
  }, []);

  const [formData, setFormData] = useState<PayableFormData>({
    vendorId: '',
    vendorName: '',
    billType: 'purchase_invoice',
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    poReference: '',
    creditPeriod: 30,

    lineItems: [
      {
        id: '1',
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
      },
    ],

    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalIGST: 0,
    totalGST: 0,
    roundOff: 0,
    grandTotal: 0,

    paymentTerms: 'Payment via NEFT/RTGS within credit period.',
    notes: '',
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);

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
    const totalBeforeRounding = taxableAmount + totalGST;
    const roundOff = Math.round(totalBeforeRounding) - totalBeforeRounding;
    const grandTotal = Math.round(totalBeforeRounding);

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGST,
      roundOff,
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
    if (formData.lineItems.length === 1) {
      alert('At least one line item is required');
      return;
    }

    const updatedItems = formData.lineItems.filter((_, i) => i !== index);
    const totals = calculateTotals(updatedItems);

    setFormData({
      ...formData,
      lineItems: updatedItems,
      ...totals,
    });
  };

  const handleDueDateCalculation = (billDate: string, creditDays: number) => {
    const date = new Date(billDate);
    date.setDate(date.getDate() + creditDays);
    return date.toISOString().split('T')[0];
  };

  const generateBillNumber = () => {
    const vendor = vendors.find(v => v.id === formData.vendorId);
    if (!vendor) return '';

    const vendorName = mdLabel.vendor(vendor);
    const vendorCode = vendorName.split(' ')[0].toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${vendorCode}/${year}/INV-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent, draft: boolean = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveAsDraft(draft);

    // Generate bill number if empty
    if (!formData.billNumber) {
      setFormData({
        ...formData,
        billNumber: generateBillNumber(),
      });
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('New Payable:', { ...formData, status: draft ? 'draft' : 'submitted' });
    alert(draft ? 'Payable saved as draft!' : 'Payable created successfully!');
    router.push('/finance/payables');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/finance/payables')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Payables</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Payable</h1>
            <p className="text-sm text-gray-600 mt-1">Add vendor bill and payment details</p>
          </div>
        </div>
      </div>

      <form className="space-y-3">
        {/* Vendor & Bill Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-orange-600" />
            Vendor & Bill Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Vendor Selection */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vendor <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => {
                  const vendor = vendors.find(v => v.id === e.target.value);
                  const vendorName = vendor ? mdLabel.vendor(vendor) : '';
                  setFormData(prev => ({
                    ...prev,
                    vendorId: e.target.value,
                    vendorName,
                    billNumber: vendor ? generateBillNumber() : '',
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                disabled={vendorsLoading}
              >
                <option value="">{vendorsLoading ? 'Loading vendors…' : 'Select Vendor'}</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {mdLabel.vendor(vendor)}{vendor.category ? ` (${vendor.category})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Bill Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.billType}
                onChange={(e) => setFormData({ ...formData, billType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {billTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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
                placeholder="Auto-generated"
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
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Reference (Optional)
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
            {formData.totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Discount:</span>
                <span className="font-semibold text-red-600">- {formatCurrency(formData.totalDiscount)}</span>
              </div>
            )}
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
            {formData.roundOff !== 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Round Off:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(formData.roundOff)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl border-t-2 border-gray-300 pt-3">
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
                Notes & Instructions
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter any additional notes, delivery instructions, or special terms"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/finance/payables')}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileCheck className="h-5 w-5" />
            <span>{isSubmitting && saveAsDraft ? 'Saving...' : 'Save as Draft'}</span>
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting && !saveAsDraft ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
