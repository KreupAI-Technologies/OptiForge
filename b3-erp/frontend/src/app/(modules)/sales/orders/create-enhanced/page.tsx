'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  ShoppingCart,
  Building2,
  Calendar,
  Plus,
  Trash2,
  Search,
  Package,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
} from '@/components/ui/FormUX';
import { StepIndicator, Step } from '@/components/ui/StepIndicator';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { salesOrderService } from '@/services/sales-order.service';

const COMPANY_ID = 'default-company-id';

interface OrderItem {
  id: string;
  productCode: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: 'percent' | 'amount';
  tax: number;
  lineTotal: number;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
}

interface SalesOrderFormData {
  orderNumber: string;
  orderDate: string;
  expectedDeliveryDate: string;
  customer: Customer | null;
  paymentTerms: string;
  deliveryTerms: string;
  shippingMethod: string;
  priority: 'normal' | 'high' | 'urgent';
  items: OrderItem[];
  notes: string;
  termsAndConditions: string;
}

const getInitialForm = (): SalesOrderFormData => ({
  orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  orderDate: new Date().toISOString().split('T')[0],
  expectedDeliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  customer: null,
  paymentTerms: 'net_30',
  deliveryTerms: 'Ex-Works',
  shippingMethod: 'standard',
  priority: 'normal',
  items: [{ id: '1', productCode: '', productName: '', description: '', quantity: 1, unit: 'pcs', unitPrice: 0, discount: 0, discountType: 'percent', tax: 18, lineTotal: 0 }],
  notes: '',
  termsAndConditions: '1. All orders subject to acceptance\n2. Prices exclusive of taxes unless stated\n3. Delivery dates are estimates',
});

const customers: Customer[] = [
  { id: 'CUST-001', name: 'Rajesh Sharma', company: 'Tech Innovations Pvt Ltd', email: 'rajesh@techinnovations.com', phone: '+91 98765 43210', billingAddress: '123 Industrial Area, Mumbai 400001', shippingAddress: '123 Industrial Area, Mumbai 400001' },
  { id: 'CUST-002', name: 'Priya Menon', company: 'Manufacturing Solutions Inc', email: 'priya.menon@mansol.com', phone: '+91 98123 45678', billingAddress: '456 Tech Park, Bangalore 560066', shippingAddress: '789 Warehouse Complex, Bangalore 560100' },
  { id: 'CUST-003', name: 'Amit Kumar', company: 'Industrial Automation Ltd', email: 'amit@indauto.com', phone: '+91 97654 32109', billingAddress: '789 Export Zone, Noida 201301', shippingAddress: '789 Export Zone, Noida 201301' },
];

const products = [
  { code: 'PRD-001', name: 'Industrial Motor 5HP', price: 45000, unit: 'pcs' },
  { code: 'PRD-002', name: 'Control Panel Assembly', price: 32000, unit: 'pcs' },
  { code: 'PRD-003', name: 'Conveyor Belt (per meter)', price: 1500, unit: 'mt' },
  { code: 'PRD-004', name: 'Safety Sensor Kit', price: 8500, unit: 'set' },
  { code: 'PRD-005', name: 'PLC Module', price: 25000, unit: 'pcs' },
];

const paymentTermsOptions = [
  { value: 'advance', label: 'Advance Payment' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'cod', label: 'Cash on Delivery' },
];

const shippingMethods = [
  { value: 'standard', label: 'Standard Shipping (5-7 days)' },
  { value: 'express', label: 'Express Shipping (2-3 days)' },
  { value: 'overnight', label: 'Overnight Delivery' },
  { value: 'pickup', label: 'Customer Pickup' },
];

const FIELD_HELP = {
  paymentTerms: { title: 'Payment Terms', content: 'Net 30 means payment is due within 30 days of invoice date.' },
  deliveryTerms: { title: 'Delivery Terms (Incoterms)', content: 'Ex-Works: Buyer arranges pickup. FOB: Seller delivers to port. CIF: Includes cost, insurance, freight.' },
  priority: { title: 'Order Priority', content: 'Normal: Standard processing. High: Prioritized production. Urgent: Rush order with expedited handling.' },
};

export default function CreateSalesOrderEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SalesOrderFormData>(getInitialForm);
  const [initialForm, setInitialForm] = useState<SalesOrderFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const steps: Step[] = [
    { id: '1', label: 'Customer', description: 'Select customer' },
    { id: '2', label: 'Items', description: 'Add products' },
    { id: '3', label: 'Shipping', description: 'Delivery details' },
    { id: '4', label: 'Review', description: 'Confirm order' },
  ];

  const completionPercentage = useMemo(() => {
    let filled = 0;
    const total = 10;
    if (formData.customer) filled++;
    if (formData.expectedDeliveryDate) filled++;
    if (formData.items.some(i => i.productCode)) filled++;
    if (formData.items.some(i => i.quantity > 0)) filled++;
    if (formData.items.some(i => i.unitPrice > 0)) filled++;
    if (formData.paymentTerms) filled++;
    if (formData.shippingMethod) filled++;
    if (formData.deliveryTerms) filled++;
    if (formData.items.length >= 1 && formData.items[0].productCode) filled++;
    if (currentStep === 3) filled++;
    return Math.round((filled / total) * 100);
  }, [formData, currentStep]);

  // Calculate totals
  const calculateTotals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    formData.items.forEach(item => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const discount = item.discountType === 'percent' ? lineSubtotal * (item.discount / 100) : item.discount;
      totalDiscount += discount;
      subtotal += lineSubtotal;
      totalTax += (lineSubtotal - discount) * (item.tax / 100);
    });
    const total = subtotal - totalDiscount + totalTax;
    return { subtotal, totalTax, totalDiscount, total };
  }, [formData.items]);

  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(formData as unknown as Record<string, unknown>, {
    key: 'sales-order-draft',
    debounceMs: 2000,
    onRestore: (data: Record<string, unknown>) => { setFormData(data as unknown as SalesOrderFormData); setShowDraftBanner(false); },
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

  const handleInputChange = (field: keyof SalesOrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const selectCustomer = (customer: Customer) => {
    setFormData((prev) => ({ ...prev, customer }));
    setCustomerSearch('');
  };

  const addItem = () => {
    const newItem: OrderItem = {
      id: Date.now().toString(),
      productCode: '', productName: '', description: '',
      quantity: 1, unit: 'pcs', unitPrice: 0,
      discount: 0, discountType: 'percent', tax: 18, lineTotal: 0,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (id: string, field: keyof OrderItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Recalculate line total
        const subtotal = updated.quantity * updated.unitPrice;
        const discount = updated.discountType === 'percent' ? subtotal * (updated.discount / 100) : updated.discount;
        updated.lineTotal = (subtotal - discount) * (1 + updated.tax / 100);
        return updated;
      }),
    }));
  };

  const selectProduct = (id: string, product: typeof products[0]) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          productCode: product.code,
          productName: product.name,
          unitPrice: product.price,
          unit: product.unit,
        };
        const subtotal = updated.quantity * updated.unitPrice;
        updated.lineTotal = subtotal * (1 + updated.tax / 100);
        return updated;
      }),
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.company.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.customer) newErrors.customer = 'Customer required';
    }
    if (step === 1) {
      if (!formData.items.some(i => i.productCode && i.unitPrice > 0)) {
        newErrors.items = 'Add at least one product';
      }
    }
    if (step === 2) {
      if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Delivery date required';
      if (!formData.shippingMethod) newErrors.shippingMethod = 'Shipping method required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, 3)); };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const buildOrderPayload = (status: 'draft' | 'pending') => ({
    companyId: COMPANY_ID,
    customerId: formData.customer?.id,
    customerName: formData.customer?.name || formData.customer?.company || 'Customer',
    customerEmail: formData.customer?.email,
    customerPhone: formData.customer?.phone,
    requestedDeliveryDate: formData.expectedDeliveryDate
      ? new Date(formData.expectedDeliveryDate).toISOString()
      : undefined,
    paymentTerms: formData.paymentTerms,
    deliveryTerms: formData.deliveryTerms,
    shippingMethod: formData.shippingMethod,
    priority: formData.priority,
    notes: formData.notes || undefined,
    termsAndConditions: formData.termsAndConditions || undefined,
    status,
    items: formData.items
      .filter((i) => i.productCode || i.productName)
      .map((i) => ({
        itemCode: i.productCode || undefined,
        itemName: i.productName || i.productCode || 'Item',
        quantity: i.quantity,
        uom: i.unit,
        unitPrice: i.unitPrice,
        discountPercent: i.discountType === 'percent' ? i.discount : 0,
        taxRate: i.tax,
      })),
  });

  const persistOrder = async (status: 'draft' | 'pending') => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      const created = await salesOrderService.createOrderEnhanced(buildOrderPayload(status));
      clearDraft();
      const newId = (created as { id?: string })?.id;
      router.push(newId ? `/sales/orders/${newId}` : '/sales/orders');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save sales order.');
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      void persistOrder('pending');
    }
  };

  const handleSaveDraft = () => {
    void persistOrder('draft');
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
    router.push('/sales/orders');
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      <DraftRecoveryBanner
        hasDraft={showDraftBanner}
        onRestore={() => { restoreDraft(); setShowDraftBanner(false); }}
        onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
      />

      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Sales Orders</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Sales Order</h1>
              <p className="text-gray-600 text-sm font-mono">{formData.orderNumber}</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      <div className="mb-2">
        <ProgressBar value={completionPercentage} max={100} label="Order completion" showValue variant="gradient" color="blue" />
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
              Customer Selection
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Customer *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Search by name or company..."
                />
              </div>
              {customerSearch && (
                <div className="mt-2 border border-gray-200 rounded-lg divide-y max-h-60 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <button key={c.id} onClick={() => selectCustomer(c)} className="w-full p-3 text-left hover:bg-blue-50">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-gray-600">{c.company}</p>
                      <p className="text-sm text-gray-500">{c.email} | {c.phone}</p>
                    </button>
                  ))}
                </div>
              )}
              {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
            </div>

            {formData.customer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">{formData.customer.name}</h4>
                    <p className="text-blue-800">{formData.customer.company}</p>
                    <p className="text-sm text-blue-700 mt-2">{formData.customer.email} | {formData.customer.phone}</p>
                  </div>
                  <button onClick={() => handleInputChange('customer', null)} className="text-blue-600 hover:text-blue-800">
                    Change
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700 font-medium">Billing Address</p>
                    <p className="text-blue-800">{formData.customer.billingAddress}</p>
                  </div>
                  <div>
                    <p className="text-blue-700 font-medium">Shipping Address</p>
                    <p className="text-blue-800">{formData.customer.shippingAddress}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Priority
                  <HelpIcon {...FIELD_HELP.priority} />
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />
                Order Items
              </h3>
              <button onClick={addItem} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {errors.items && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{errors.items}</div>
            )}

            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Item {index + 1}</span>
                    <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800" disabled={formData.items.length <= 1}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                      <select
                        value={item.productCode}
                        onChange={(e) => {
                          const product = products.find(p => p.code === e.target.value);
                          if (product) selectProduct(item.id, product);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tax (%)</label>
                      <select
                        value={item.tax}
                        onChange={(e) => updateItem(item.id, 'tax', parseInt(e.target.value))}
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
                    <span className="font-semibold">{formatCurrency(item.lineTotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-900 font-medium">Order Total</span>
                <span className="text-2xl font-bold text-purple-900">{formatCurrency(calculateTotals.total)}</span>
              </div>
              <div className="mt-2 text-sm text-purple-700 space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(calculateTotals.subtotal)}</span></div>
                <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(calculateTotals.totalDiscount)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(calculateTotals.totalTax)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Shipping & Payment */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-500" />
              Shipping & Payment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date *</label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-300'}`}
                  min={formData.orderDate}
                />
                {errors.expectedDeliveryDate && <p className="text-xs text-red-500 mt-1">{errors.expectedDeliveryDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Method *</label>
                <select
                  value={formData.shippingMethod}
                  onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${errors.shippingMethod ? 'border-red-500' : 'border-gray-300'}`}
                >
                  {shippingMethods.map((sm) => (
                    <option key={sm.value} value={sm.value}>{sm.label}</option>
                  ))}
                </select>
                {errors.shippingMethod && <p className="text-xs text-red-500 mt-1">{errors.shippingMethod}</p>}
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
                  {paymentTermsOptions.map((pt) => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Delivery Terms
                  <HelpIcon {...FIELD_HELP.deliveryTerms} />
                </label>
                <select
                  value={formData.deliveryTerms}
                  onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Ex-Works">Ex-Works (EXW)</option>
                  <option value="FOB">Free on Board (FOB)</option>
                  <option value="CIF">Cost, Insurance, Freight (CIF)</option>
                  <option value="DDP">Delivered Duty Paid (DDP)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Special instructions or notes..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Review Order</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Order #:</span><span className="font-mono">{formData.orderNumber}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Date:</span><span>{formData.orderDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery:</span><span>{formData.expectedDeliveryDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Priority:</span><span className="capitalize">{formData.priority}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Customer</h4>
                <div className="text-sm">
                  <p className="font-medium">{formData.customer?.name}</p>
                  <p className="text-gray-600">{formData.customer?.company}</p>
                  <p className="text-gray-500 mt-2">{formData.customer?.email}</p>
                  <p className="text-gray-500">{formData.customer?.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-3">Order Items ({formData.items.filter(i => i.productCode).length})</h4>
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.filter(i => i.productCode).map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2 text-right">{item.quantity} {item.unit}</td>
                      <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-semibold text-purple-900 mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(calculateTotals.subtotal)}</span></div>
                <div className="flex justify-between"><span>Discount:</span><span>-{formatCurrency(calculateTotals.totalDiscount)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(calculateTotals.totalTax)}</span></div>
                <div className="flex justify-between pt-2 border-t border-purple-300 font-bold text-lg">
                  <span>Total:</span><span>{formatCurrency(calculateTotals.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Ready to Create Order</h4>
                  <p className="text-sm text-green-800">
                    Payment Terms: {paymentTermsOptions.find(p => p.value === formData.paymentTerms)?.label} |
                    Shipping: {shippingMethods.find(s => s.value === formData.shippingMethod)?.label}
                  </p>
                </div>
              </div>
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
          {submitError && <span className="text-sm text-red-600">{submitError}</span>}
          <button onClick={handleSaveDraft} disabled={submitting} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Save Draft</button>
          {currentStep < 3 ? (
            <button onClick={nextStep} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              <Send className="h-5 w-5" />
              <span>{submitting ? 'Creating…' : 'Create Order'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
