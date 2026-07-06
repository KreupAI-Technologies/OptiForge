'use client';

import { useState } from 'react';
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
  X,
  Copy,
  Trash2,
  MapPin,
  FileText,
  Eye,
  Package,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react';

interface LineItem {
  id: string;
  item: string;
  description: string;
  hsn: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
  taxType: 'CGST+SGST' | 'IGST';
}

interface InvoiceFormData {
  customer: string;
  customerGST: string;
  invoiceDate: string;
  dueDate: string;
  poReference: string;
  paymentTerms: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  lineItems: LineItem[];
  discountType: 'percentage' | 'amount';
  discountValue: string;
  notes: string;
  termsConditions: string;
}

const indianCompanies = [
  { name: 'Tata Steel Limited', gst: '27AAACT2727Q1ZV', state: 'West Bengal', email: 'procurement@tatasteel.com', phone: '+91 657 2345678' },
  { name: 'Reliance Industries Ltd', gst: '24AAACR5055K1Z4', state: 'Gujarat', email: 'purchase@ril.com', phone: '+91 22 35556666' },
  { name: 'HDFC Bank Limited', gst: '27AAACH6393K1ZF', state: 'Maharashtra', email: 'corporate@hdfcbank.com', phone: '+91 22 66526000' },
  { name: 'ICICI Bank Limited', gst: '27AAACI1681G1ZA', state: 'Maharashtra', email: 'corporate@icicibank.com', phone: '+91 22 26531414' },
  { name: 'Infosys Limited', gst: '29AAACI1681G1Z9', state: 'Karnataka', email: 'procurement@infosys.com', phone: '+91 80 28520261' },
  { name: 'Wipro Limited', gst: '29AAACW3775F1ZR', state: 'Karnataka', email: 'purchase@wipro.com', phone: '+91 80 28440011' },
  { name: 'Mahindra & Mahindra', gst: '27AAACM1474E1ZH', state: 'Maharashtra', email: 'scm@mahindra.com', phone: '+91 22 28468300' },
  { name: 'Larsen & Toubro Ltd', gst: '27AAACL0125F1Z5', state: 'Maharashtra', email: 'procurement@larsentoubro.com', phone: '+91 22 67525656' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const paymentTermsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'];

const productService = [
  'High-Grade Steel Plates (IS 2062)',
  'Structural Steel Beams (ISMB 300)',
  'Steel Wire Rods (6mm diameter)',
  'TMT Steel Bars (8mm, 10mm, 12mm)',
  'Stainless Steel Sheets',
  'Industrial Machinery Parts',
  'Electrical Components',
  'Hydraulic Equipment',
  'Installation Services',
  'Maintenance Contract',
  'Consulting Services',
  'Technical Support',
];

export default function AddInvoicePage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [companyState] = useState('West Bengal'); // Our company state

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `INV-${year}-${random}`;
  };

  const [invoiceNumber] = useState(generateInvoiceNumber());

  const [formData, setFormData] = useState<InvoiceFormData>({
    customer: '',
    customerGST: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    poReference: '',
    paymentTerms: 'Net 30',
    billingAddress: {
      street: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
    },
    shippingAddress: {
      street: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
    },
    lineItems: [
      {
        id: Math.random().toString(36).substr(2, 9),
        item: '',
        description: '',
        hsn: '',
        quantity: '1',
        unitPrice: '0',
        taxRate: '18',
        taxType: 'CGST+SGST',
      },
    ],
    discountType: 'amount',
    discountValue: '0',
    notes: 'Please make payment within the specified terms. Bank details: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234',
    termsConditions: '1. Payment due as per agreed terms\n2. Late payment subject to 2% monthly interest\n3. Goods once sold cannot be returned\n4. Subject to applicable jurisdiction',
  });

  const [selectedCompanyInfo, setSelectedCompanyInfo] = useState<{ email: string; phone: string } | null>(null);

  const updateFormData = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (type: 'billingAddress' | 'shippingAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleCustomerChange = (customerName: string) => {
    const customer = indianCompanies.find(c => c.name === customerName);
    if (customer) {
      updateFormData('customer', customer.name);
      updateFormData('customerGST', customer.gst);
      setSelectedCompanyInfo({ email: customer.email, phone: customer.phone });

      // Update billing address state
      updateAddress('billingAddress', 'state', customer.state);

      // Auto-determine tax type based on state
      const taxType = companyState === customer.state ? 'CGST+SGST' : 'IGST';
      const updatedItems = formData.lineItems.map(item => ({
        ...item,
        taxType: taxType as 'CGST+SGST' | 'IGST',
      }));
      updateFormData('lineItems', updatedItems);
    }
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      item: '',
      description: '',
      hsn: '',
      quantity: '1',
      unitPrice: '0',
      taxRate: '18',
      taxType: companyState === formData.billingAddress.state ? 'CGST+SGST' : 'IGST',
    };
    updateFormData('lineItems', [...formData.lineItems, newItem]);
  };

  const duplicateLineItem = (index: number) => {
    const itemToDuplicate = formData.lineItems[index];
    const newItem: LineItem = {
      ...itemToDuplicate,
      id: Math.random().toString(36).substr(2, 9),
    };
    const newItems = [...formData.lineItems];
    newItems.splice(index + 1, 0, newItem);
    updateFormData('lineItems', newItems);
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      updateFormData('lineItems', formData.lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const updated = [...formData.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('lineItems', updated);
  };

  const calculateLineTotal = (item: LineItem) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const taxRate = parseFloat(item.taxRate) || 0;
    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal * taxRate) / 100;
    return subtotal + taxAmount;
  };

  const calculateTotals = () => {
    const subtotal = formData.lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
    }, 0);

    const taxAmount = formData.lineItems.reduce((sum, item) => {
      const itemSubtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
      return sum + (itemSubtotal * (parseFloat(item.taxRate) || 0)) / 100;
    }, 0);

    let discount = 0;
    if (formData.discountType === 'percentage') {
      discount = (subtotal * (parseFloat(formData.discountValue) || 0)) / 100;
    } else {
      discount = parseFloat(formData.discountValue) || 0;
    }

    const total = subtotal + taxAmount - discount;

    return {
      subtotal,
      taxAmount,
      cgst: formData.lineItems[0]?.taxType === 'CGST+SGST' ? taxAmount / 2 : 0,
      sgst: formData.lineItems[0]?.taxType === 'CGST+SGST' ? taxAmount / 2 : 0,
      igst: formData.lineItems[0]?.taxType === 'IGST' ? taxAmount : 0,
      discount,
      total,
    };
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildPayload = (status: 'draft' | 'sent') => ({
    companyId: 'default-company-id',
    invoiceNumber,
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
    discountValue: parseFloat(formData.discountValue) || 0,
    lineItems: formData.lineItems.map((li) => ({
      productName: li.item,
      description: li.description,
      hsn: li.hsn,
      quantity: parseFloat(li.quantity) || 0,
      unitPrice: parseFloat(li.unitPrice) || 0,
      taxRate: parseFloat(li.taxRate) || 0,
      taxType: li.taxType,
      discount: 0,
    })),
  });

  const submitInvoice = async (status: 'draft' | 'sent') => {
    if (!formData.customer) {
      alert('Please select a customer before saving the invoice.');
      return;
    }
    if (!formData.invoiceDate || !formData.dueDate) {
      alert('Please provide both an invoice date and a due date.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await InvoiceService.createInvoice(buildPayload(status) as any);
      const newId = (created as any)?.id;
      router.push(newId ? `/finance/invoices/view/${newId}` : '/finance/invoices');
    } catch (err: any) {
      alert(err?.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    void submitInvoice('draft');
  };

  const handleSendInvoice = () => {
    void submitInvoice('sent');
  };

  const totals = calculateTotals();

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-3 py-2 w-full max-w-full">
          {/* Header */}
          <div className="mb-3">
            <button
              onClick={() => router.push('/finance/invoices')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Invoices</span>
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
                  <p className="text-sm text-gray-600">Invoice Number: <span className="font-semibold text-blue-600">{invoiceNumber}</span></p>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
              </button>
            </div>
          </div>

          {!showPreview ? (
            <div className="space-y-3">
              {/* Basic Invoice Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-blue-600" />
                  Invoice Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.invoiceDate}
                        onChange={(e) => updateFormData('invoiceDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => updateFormData('dueDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {paymentTermsOptions.map(term => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">PO Reference</label>
                    <input
                      type="text"
                      value={formData.poReference}
                      onChange={(e) => updateFormData('poReference', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PO-2024-00001 (Optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Customer Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.customer}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Customer</option>
                      {indianCompanies.map(company => (
                        <option key={company.gst} value={company.name}>{company.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer GST Number</label>
                    <input
                      type="text"
                      value={formData.customerGST}
                      onChange={(e) => updateFormData('customerGST', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      placeholder="27AAACT2727Q1ZV"
                      readOnly
                    />
                  </div>

                  {selectedCompanyInfo && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedCompanyInfo.email}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{selectedCompanyInfo.phone}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Billing Address */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Billing Address
                  </h2>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={formData.billingAddress.street}
                        onChange={(e) => updateAddress('billingAddress', 'street', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Building, Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.billingAddress.city}
                          onChange={(e) => updateAddress('billingAddress', 'city', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={formData.billingAddress.pincode}
                          onChange={(e) => updateAddress('billingAddress', 'pincode', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="400001"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={formData.billingAddress.state}
                        onChange={(e) => updateAddress('billingAddress', 'state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Shipping Address
                  </h2>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.street}
                        onChange={(e) => updateAddress('shippingAddress', 'street', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Building, Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={formData.shippingAddress.city}
                          onChange={(e) => updateAddress('shippingAddress', 'city', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={formData.shippingAddress.pincode}
                          onChange={(e) => updateAddress('shippingAddress', 'pincode', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="400001"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={formData.shippingAddress.state}
                        onChange={(e) => updateAddress('shippingAddress', 'state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Line Items
                  </h2>
                  <button
                    onClick={addLineItem}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.lineItems.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Item / Product</label>
                          <input
                            type="text"
                            value={item.item}
                            onChange={(e) => updateLineItem(index, 'item', e.target.value)}
                            list={`products-${index}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Select or type product"
                          />
                          <datalist id={`products-${index}`}>
                            {productService.map(product => (
                              <option key={product} value={product} />
                            ))}
                          </datalist>
                        </div>

                        <div className="col-span-12 md:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Item details"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">HSN Code</label>
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => updateLineItem(index, 'hsn', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="7208"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="1"
                          />
                        </div>

                        <div className="col-span-6 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="col-span-6 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tax%</label>
                          <select
                            value={item.taxRate}
                            onChange={(e) => updateLineItem(index, 'taxRate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </div>

                        <div className="col-span-12 flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Line Total</label>
                            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm font-semibold text-blue-900">
                              ₹{calculateLineTotal(item).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                          <button
                            onClick={() => duplicateLineItem(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                          >
                            <Copy className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => removeLineItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

                            disabled={formData.lineItems.length === 1}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="max-w-md ml-auto space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold text-gray-900">₹{totals.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>

                    {totals.cgst > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">CGST (9%):</span>
                          <span className="font-semibold text-gray-900">₹{totals.cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">SGST (9%):</span>
                          <span className="font-semibold text-gray-900">₹{totals.sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    )}

                    {totals.igst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">IGST (18%):</span>
                        <span className="font-semibold text-gray-900">₹{totals.igst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">Discount:</span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={formData.discountType}
                          onChange={(e) => updateFormData('discountType', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="amount">₹</option>
                          <option value="percentage">%</option>
                        </select>
                        <input
                          type="number"
                          value={formData.discountValue}
                          onChange={(e) => updateFormData('discountValue', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="border-t-2 border-blue-300 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-900">₹{totals.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Notes & Terms
                </h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Payment instructions, bank details)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateFormData('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Payment instructions, bank details, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                    <textarea
                      value={formData.termsConditions}
                      onChange={(e) => updateFormData('termsConditions', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Terms and conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="bg-white rounded-lg border border-gray-200 p-8 w-full">
              <div className="border-b-2 border-gray-300 pb-6 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-4xl font-bold text-blue-900 mb-2">INVOICE</h1>
                    <p className="text-lg text-gray-700">#{invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice Date</p>
                    <p className="font-semibold text-gray-900">{formData.invoiceDate}</p>
                    <p className="text-sm text-gray-600 mt-2">Due Date</p>
                    <p className="font-semibold text-gray-900">{formData.dueDate}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Bill To:</h3>
                  <p className="font-semibold text-gray-900">{formData.customer}</p>
                  <p className="text-sm text-gray-700">{formData.billingAddress.street}</p>
                  <p className="text-sm text-gray-700">{formData.billingAddress.city}, {formData.billingAddress.state}</p>
                  <p className="text-sm text-gray-700">{formData.billingAddress.pincode}</p>
                  <p className="text-sm text-gray-700 mt-1">GST: {formData.customerGST}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Ship To:</h3>
                  <p className="text-sm text-gray-700">{formData.shippingAddress.street}</p>
                  <p className="text-sm text-gray-700">{formData.shippingAddress.city}, {formData.shippingAddress.state}</p>
                  <p className="text-sm text-gray-700">{formData.shippingAddress.pincode}</p>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">Tax</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{item.item}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">₹{parseFloat(item.unitPrice).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">{item.taxRate}%</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">₹{calculateLineTotal(item).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-8">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {totals.cgst > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{totals.cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{totals.sgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {totals.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGST (18%):</span>
                      <span className="font-semibold text-gray-900">₹{totals.igst.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold text-red-600">-₹{totals.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-blue-900">₹{totals.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Notes:</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.notes}</p>
                </div>
              )}

              {formData.termsConditions && (
                <div className="border-t border-gray-300 pt-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Terms & Conditions:</h3>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{formData.termsConditions}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/finance/invoices')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              <span>Save as Draft</span>
            </button>
            <button
              onClick={handleSendInvoice}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              <span>Send Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
