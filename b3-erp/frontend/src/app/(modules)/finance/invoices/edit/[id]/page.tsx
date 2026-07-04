'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MasterDataService, MDCustomer, mdLabel, fetchRecordById } from '@/services/master-data.service';
import {
  ArrowLeft,
  Save,
  Receipt,
  Building2,
  Calendar,
  Plus,
  X,
  Copy,
  Trash2,
  MapPin,
  FileText,
  IndianRupee,
  Package,
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
  invoiceNumber: string;
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

// Seed/fallback customer list (kept as unused fallback per wiring contract)
const indianCompaniesSeed: MDCustomer[] = [
  { id: 'seed-1', customerName: 'Tata Steel Limited', customerCode: 'seed-1' },
  { id: 'seed-2', customerName: 'Reliance Industries Ltd', customerCode: 'seed-2' },
  { id: 'seed-3', customerName: 'HDFC Bank Limited', customerCode: 'seed-3' },
  { id: 'seed-4', customerName: 'ICICI Bank Limited', customerCode: 'seed-4' },
  { id: 'seed-5', customerName: 'Infosys Limited', customerCode: 'seed-5' },
  { id: 'seed-6', customerName: 'Wipro Limited', customerCode: 'seed-6' },
  { id: 'seed-7', customerName: 'Mahindra & Mahindra', customerCode: 'seed-7' },
  { id: 'seed-8', customerName: 'Larsen & Toubro Ltd', customerCode: 'seed-8' },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const paymentTermsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'];

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  // Live customer picker — initialized from seed so UI renders immediately
  const [customers, setCustomers] = useState<MDCustomer[]>(indianCompaniesSeed);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    setCustomersLoading(true);
    MasterDataService.getCustomers().then(live => {
      if (live.length > 0) setCustomers(live);
    }).finally(() => setCustomersLoading(false));
  }, []);

  // Pre-populated with existing invoice data (mock default)
  const [formData, setFormData] = useState<InvoiceFormData>({
    invoiceNumber: 'INV-2024-00125',
    customer: 'Tata Steel Limited',
    customerGST: '27AAACT2727Q1ZV',
    invoiceDate: '2024-10-01',
    dueDate: '2024-10-31',
    poReference: 'PO-TATA-2024-0892',
    paymentTerms: 'Net 30',
    billingAddress: {
      street: 'Tata Centre, 43 Jawaharlal Nehru Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700071',
    },
    shippingAddress: {
      street: 'Tata Steel Plant, Adityapur Industrial Area',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      pincode: '831013',
    },
    lineItems: [
      {
        id: '1',
        item: 'High-Grade Steel Plates (IS 2062)',
        description: 'E250 Grade steel plates for industrial construction, thickness 12mm',
        hsn: '7208',
        quantity: '500',
        unitPrice: '4500',
        taxRate: '18',
        taxType: 'CGST+SGST',
      },
      {
        id: '2',
        item: 'Structural Steel Beams (ISMB 300)',
        description: 'I-Section beams for structural framework, length 12m',
        hsn: '7216',
        quantity: '100',
        unitPrice: '3500',
        taxRate: '18',
        taxType: 'CGST+SGST',
      },
    ],
    discountType: 'amount',
    discountValue: '50000',
    notes: 'Please make payment within 30 days. Bank details: HDFC Bank, A/C: 50200012345678, IFSC: HDFC0001234',
    termsConditions: '1. Payment due within 30 days\n2. Late payment subject to 2% monthly interest\n3. Goods once sold cannot be returned\n4. Subject to West Bengal jurisdiction',
  });

  // Fetch the real invoice record and prefill form if found
  useEffect(() => {
    if (!invoiceId) return;
    fetchRecordById<Partial<InvoiceFormData>>('/finance/invoices', invoiceId).then(record => {
      if (!record) return;
      setFormData(prev => ({
        ...prev,
        invoiceNumber: record.invoiceNumber ?? prev.invoiceNumber,
        customer: record.customer ?? prev.customer,
        customerGST: record.customerGST ?? prev.customerGST,
        invoiceDate: record.invoiceDate ?? prev.invoiceDate,
        dueDate: record.dueDate ?? prev.dueDate,
        poReference: record.poReference ?? prev.poReference,
        paymentTerms: record.paymentTerms ?? prev.paymentTerms,
        billingAddress: record.billingAddress ?? prev.billingAddress,
        shippingAddress: record.shippingAddress ?? prev.shippingAddress,
        lineItems: record.lineItems ?? prev.lineItems,
        discountType: record.discountType ?? prev.discountType,
        discountValue: record.discountValue ?? prev.discountValue,
        notes: record.notes ?? prev.notes,
        termsConditions: record.termsConditions ?? prev.termsConditions,
      }));
    });
  }, [invoiceId]);

  const [companyState, setCompanyState] = useState('West Bengal'); // Our company state

  const updateFormData = (field: keyof InvoiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (type: 'billingAddress' | 'shippingAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      updateFormData('customer', mdLabel.customer(customer));
      updateFormData('customerGST', (customer as MDCustomer & { gst?: string }).gst ?? '');
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

  const handleSubmit = () => {
    console.log('Updated Invoice Data:', formData);
    console.log('Totals:', calculateTotals());
    router.push('/finance/invoices');
  };

  const totals = calculateTotals();

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-3 py-2 w-full max-w-full">
          {/* Header */}
          <div className="mb-3">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Invoice</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
                <p className="text-sm text-gray-600">Update invoice information and line items</p>
              </div>
            </div>
          </div>

          {/* Form */}
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
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="INV-2024-00001"
                  />
                </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-2">PO Reference</label>
                  <input
                    type="text"
                    value={formData.poReference}
                    onChange={(e) => updateFormData('poReference', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PO-2024-00001"
                  />
                </div>

                <div className="md:col-span-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="27AAACT2727Q1ZV"
                  />
                </div>
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={formData.billingAddress.pincode}
                        onChange={(e) => updateAddress('billingAddress', 'pincode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={formData.shippingAddress.pincode}
                        onChange={(e) => updateAddress('shippingAddress', 'pincode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      {/* Item Details */}
                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                          type="text"
                          value={item.item}
                          onChange={(e) => updateLineItem(index, 'item', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Product/Service name"
                        />
                      </div>

                      <div className="col-span-12 md:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Item description"
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

                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="1"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tax Type</label>
                        <select
                          value={item.taxType}
                          onChange={(e) => updateLineItem(index, 'taxType', e.target.value as 'CGST+SGST' | 'IGST')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="CGST+SGST">CGST + SGST</option>
                          <option value="IGST">IGST</option>
                        </select>
                      </div>

                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate (%)</label>
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

                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Line Total</label>
                        <div className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-semibold text-gray-900">
                          ₹{calculateLineTotal(item).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="col-span-12 md:col-span-2 flex items-end space-x-2">
                        <button
                          onClick={() => duplicateLineItem(index)}
                          className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"

                        >
                          <Copy className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeLineItem(index)}
                          className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"

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

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Notes
                </h2>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Payment instructions, bank details, etc."
                />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Terms & Conditions
                </h2>
                <textarea
                  value={formData.termsConditions}
                  onChange={(e) => updateFormData('termsConditions', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Terms and conditions..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
