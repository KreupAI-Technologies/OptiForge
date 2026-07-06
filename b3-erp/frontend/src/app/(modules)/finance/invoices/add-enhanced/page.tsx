'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceService } from '@/services/invoice.service';
import {
  ArrowLeft,
  Save,
  Send,
  Receipt,
  Building2,
  Calendar,
  Plus,
  Trash2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
} from 'lucide-react';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
  FormProgressIndicator,
} from '@/components/ui/FormUX';
import { StepIndicator, Step } from '@/components/ui/StepIndicator';

interface LineItem {
  id: string;
  item: string;
  description: string;
  hsn: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxType: 'CGST+SGST' | 'IGST';
}

interface InvoiceFormData {
  invoiceNumber: string;
  customer: string;
  customerGST: string;
  invoiceDate: string;
  dueDate: string;
  poReference: string;
  paymentTerms: string;
  billingAddress: { street: string; city: string; state: string; pincode: string };
  shippingAddress: { street: string; city: string; state: string; pincode: string };
  lineItems: LineItem[];
  discountType: 'percentage' | 'amount';
  discountValue: number;
  notes: string;
  termsConditions: string;
}

const getInitialForm = (): InvoiceFormData => ({
  invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
  customer: '',
  customerGST: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  poReference: '',
  paymentTerms: 'Net 30',
  billingAddress: { street: '', city: '', state: 'Maharashtra', pincode: '' },
  shippingAddress: { street: '', city: '', state: 'Maharashtra', pincode: '' },
  lineItems: [{ id: '1', item: '', description: '', hsn: '', quantity: 1, unitPrice: 0, taxRate: 18, taxType: 'CGST+SGST' }],
  discountType: 'amount',
  discountValue: 0,
  notes: 'Please make payment within the specified terms.',
  termsConditions: '1. Payment due as per agreed terms\n2. Late payment subject to 2% monthly interest',
});

const indianCompanies = [
  { name: 'Tata Steel Limited', gst: '27AAACT2727Q1ZV', state: 'Maharashtra' },
  { name: 'Reliance Industries Ltd', gst: '24AAACR5055K1Z4', state: 'Gujarat' },
  { name: 'Infosys Limited', gst: '29AAACI1681G1Z9', state: 'Karnataka' },
  { name: 'Larsen & Toubro Ltd', gst: '27AAACL0125F1Z5', state: 'Maharashtra' },
];

const indianStates = ['Andhra Pradesh', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Delhi'];
const paymentTermsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'];
const productServices = ['Steel Plates (IS 2062)', 'Structural Steel Beams', 'TMT Steel Bars', 'Industrial Machinery Parts', 'Installation Services', 'Consulting Services'];

const FIELD_HELP = {
  gst: { title: 'GSTIN', content: '15-character GST Identification Number. Required for B2B invoices for input tax credit.' },
  hsn: { title: 'HSN/SAC Code', content: 'Harmonized System Nomenclature code for goods or Services Accounting Code for services.' },
  taxType: { title: 'Tax Type', content: 'CGST+SGST for same-state transactions, IGST for inter-state transactions.' },
  paymentTerms: { title: 'Payment Terms', content: 'Net 30 = Payment due within 30 days of invoice date.' },
};

export default function AddInvoiceEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<InvoiceFormData>(getInitialForm);
  const [initialForm, setInitialForm] = useState<InvoiceFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const steps: Step[] = [
    { id: '1', label: 'Customer', description: 'Select customer' },
    { id: '2', label: 'Items', description: 'Line items' },
    { id: '3', label: 'Addresses', description: 'Billing & shipping' },
    { id: '4', label: 'Review', description: 'Preview & submit' },
  ];

  const completionPercentage = useMemo(() => {
    let filled = 0;
    const total = 10;
    if (formData.customer) filled++;
    if (formData.customerGST) filled++;
    if (formData.dueDate) filled++;
    if (formData.lineItems.some(i => i.item)) filled++;
    if (formData.lineItems.some(i => i.unitPrice > 0)) filled++;
    if (formData.billingAddress.street) filled++;
    if (formData.billingAddress.city) filled++;
    if (formData.shippingAddress.street) filled++;
    if (formData.shippingAddress.city) filled++;
    if (currentStep === 3) filled++;
    return Math.round((filled / total) * 100);
  }, [formData, currentStep]);

  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(formData as unknown as Record<string, unknown>, {
    key: 'invoice-draft',
    debounceMs: 2000,
    onRestore: (data) => { setFormData(data as unknown as InvoiceFormData); setShowDraftBanner(false); },
  });

  const hasChanges = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialForm);
  }, [formData, initialForm]);

  useUnsavedChangesWarning(hasChanges);

  useEffect(() => {
    const initial = getInitialForm();
    setFormData(initial);
    setInitialForm(initial);
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  // Calculate totals
  const calculateTotals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    formData.lineItems.forEach(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      subtotal += lineSubtotal;
      totalTax += lineSubtotal * (item.taxRate / 100);
    });
    const discount = formData.discountType === 'percentage' ? subtotal * (formData.discountValue / 100) : formData.discountValue;
    const total = subtotal - discount + totalTax;
    return { subtotal, totalTax, discount, total };
  }, [formData.lineItems, formData.discountType, formData.discountValue]);

  const handleInputChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAddressChange = (type: 'billingAddress' | 'shippingAddress', field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }));
  };

  const selectCustomer = (company: typeof indianCompanies[0]) => {
    setFormData((prev) => ({
      ...prev,
      customer: company.name,
      customerGST: company.gst,
      billingAddress: { ...prev.billingAddress, state: company.state },
      shippingAddress: { ...prev.shippingAddress, state: company.state },
    }));
    // Set tax type based on state
    const isInterState = company.state !== 'Maharashtra';
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map(item => ({ ...item, taxType: isInterState ? 'IGST' : 'CGST+SGST' })),
    }));
    setCustomerSearch('');
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      item: '', description: '', hsn: '',
      quantity: 1, unitPrice: 0, taxRate: 18,
      taxType: formData.lineItems[0]?.taxType || 'CGST+SGST',
    };
    setFormData((prev) => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map(item => item.id === id ? { ...item, [field]: value } : item),
    }));
  };

  const removeLineItem = (id: string) => {
    if (formData.lineItems.length <= 1) return;
    setFormData((prev) => ({ ...prev, lineItems: prev.lineItems.filter(i => i.id !== id) }));
  };

  const copyBillingToShipping = () => {
    setFormData((prev) => ({ ...prev, shippingAddress: { ...prev.billingAddress } }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.customer) newErrors.customer = 'Customer required';
      if (!formData.dueDate) newErrors.dueDate = 'Due date required';
    }
    if (step === 1) {
      if (!formData.lineItems.some(i => i.item && i.unitPrice > 0)) {
        newErrors.lineItems = 'Add at least one item with price';
      }
    }
    if (step === 2) {
      if (!formData.billingAddress.street) newErrors.billingStreet = 'Billing address required';
      if (!formData.billingAddress.city) newErrors.billingCity = 'City required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 3)); };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildPayload = (status: 'draft' | 'sent') => ({
    companyId: 'default-company-id',
    invoiceNumber: formData.invoiceNumber,
    status,
    type: 'SALES',
    customerName: formData.customer,
    customerGST: formData.customerGST,
    invoiceDate: formData.invoiceDate,
    dueDate: formData.dueDate,
    poNumber: formData.poReference,
    paymentTerms: formData.paymentTerms,
    billingAddress: formData.billingAddress,
    shippingAddress: formData.shippingAddress,
    notes: formData.notes,
    terms: formData.termsConditions,
    discountType: formData.discountType,
    discountValue: formData.discountValue,
    lineItems: formData.lineItems.map((li) => ({
      productName: li.item,
      description: li.description,
      hsn: li.hsn,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      taxRate: li.taxRate,
      taxType: li.taxType,
      discount: 0,
    })),
  });

  const submitInvoice = async (status: 'draft' | 'sent') => {
    setIsSubmitting(true);
    try {
      const created = await InvoiceService.createInvoice(buildPayload(status) as any);
      clearDraft();
      const newId = (created as any)?.id;
      router.push(newId ? `/finance/invoices/view/${newId}` : '/finance/invoices');
    } catch (err: any) {
      alert(err?.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      void submitInvoice('sent');
    }
  };

  const handleSaveDraft = () => {
    void submitInvoice('draft');
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
    router.push('/finance/invoices');
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {showDraftBanner && (
        <DraftRecoveryBanner
          hasDraft={hasDraft}
          onRestore={() => { restoreDraft(); setShowDraftBanner(false); }}
          onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
        />
      )}

      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
              <p className="text-gray-600 text-sm font-mono">{formData.invoiceNumber}</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      <div className="mb-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-[3rem]">{completionPercentage}%</span>
        </div>
      </div>

      <div className="mb-8">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(i) => { if (i <= currentStep) setCurrentStep(i); }} variant="circles" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Customer */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Search by company name..."
                  />
                </div>
                {customerSearch && (
                  <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-48 overflow-y-auto">
                    {indianCompanies.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map((c) => (
                      <button key={c.gst} onClick={() => selectCustomer(c)} className="w-full p-3 text-left hover:bg-blue-50">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-gray-500">{c.gst} - {c.state}</p>
                      </button>
                    ))}
                  </div>
                )}
                {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
              </div>

              {formData.customer && (
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-900">{formData.customer}</h4>
                  <p className="text-sm text-blue-700 font-mono">{formData.customerGST}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={formData.invoiceDate}
                />
                {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Reference</label>
                <input
                  type="text"
                  value={formData.poReference}
                  onChange={(e) => handleInputChange('poReference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Customer PO number"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                  <HelpIcon {...FIELD_HELP.paymentTerms} />
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {paymentTermsOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Line Items */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-500" />
                Line Items
              </h3>
              <button onClick={addLineItem} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {errors.lineItems && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.lineItems}</div>
            )}

            <div className="space-y-2">
              {formData.lineItems.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    <button onClick={() => removeLineItem(item.id)} className="text-red-600 hover:text-red-800" disabled={formData.lineItems.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Item/Service</label>
                      <select
                        value={item.item}
                        onChange={(e) => updateLineItem(item.id, 'item', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Select</option>
                        {productServices.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-700 mb-1">
                        HSN/SAC
                        <HelpIcon {...FIELD_HELP.hsn} size="sm" />
                      </label>
                      <input
                        type="text"
                        value={item.hsn}
                        onChange={(e) => updateLineItem(item.id, 'hsn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        placeholder="7208"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                      <select
                        value={item.taxRate}
                        onChange={(e) => updateLineItem(item.id, 'taxRate', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <span className="text-sm text-gray-500">Line Total: </span>
                    <span className="font-semibold">{formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate / 100))}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleInputChange('discountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="amount">Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700">Invoice Total</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(calculateTotals.total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Addresses */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Billing & Shipping Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Billing Address</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                    <input
                      type="text"
                      value={formData.billingAddress.street}
                      onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${errors.billingStreet ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg ${errors.billingCity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <select
                        value={formData.billingAddress.state}
                        onChange={(e) => handleAddressChange('billingAddress', 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.billingAddress.pincode}
                        onChange={(e) => handleAddressChange('billingAddress', 'pincode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Shipping Address</h4>
                  <button onClick={copyBillingToShipping} className="text-sm text-blue-600 hover:underline">
                    Same as billing
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.street}
                      onChange={(e) => handleAddressChange('shippingAddress', 'street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.shippingAddress.city}
                      onChange={(e) => handleAddressChange('shippingAddress', 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <select
                        value={formData.shippingAddress.state}
                        onChange={(e) => handleAddressChange('shippingAddress', 'state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.pincode}
                        onChange={(e) => handleAddressChange('shippingAddress', 'pincode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Review Invoice</h3>
              <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 text-blue-600 hover:underline">
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Invoice Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Invoice #:</span><span className="font-mono">{formData.invoiceNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="font-medium">{formData.customer}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">GST:</span><span className="font-mono">{formData.customerGST}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Invoice Date:</span><span>{formData.invoiceDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Due Date:</span><span>{formData.dueDate}</span></div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-900 mb-3">Amount Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(calculateTotals.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(calculateTotals.discount)}</span></div>
                  <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(calculateTotals.totalTax)}</span></div>
                  <div className="flex justify-between pt-2 border-t border-green-300 font-bold text-lg">
                    <span>Total:</span><span>{formatCurrency(calculateTotals.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-3">Line Items ({formData.lineItems.length})</h4>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Item</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Tax</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lineItems.filter(i => i.item).map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.item}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 text-right">{item.taxRate}%</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice * (1 + item.taxRate / 100))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 py-4">
        <div>
          {currentStep > 0 && (
            <button onClick={prevStep} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSaveDraft} disabled={isSubmitting} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
          {currentStep < 3 ? (
            <button onClick={nextStep} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <Send className="h-5 w-5" />
              <span>Create Invoice</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
