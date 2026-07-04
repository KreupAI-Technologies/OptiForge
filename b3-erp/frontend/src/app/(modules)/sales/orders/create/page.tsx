'use client';

import React, { useState, useEffect } from 'react';
import { MasterDataService, MDCustomer } from '@/services/master-data.service';
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
  ArrowLeft,
  Copy,
  Eye,
  Upload,
  Download,
  ShoppingCart,
  Truck,
  CreditCard
} from 'lucide-react';

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
  taxType: string;
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

export default function CreateSalesOrderPage() {
  const customersSeed: Customer[] = [
    {
      id: 'CUST-001',
      name: 'Rajesh Sharma',
      company: 'Tech Innovations Pvt Ltd',
      email: 'rajesh@techinnovations.com',
      phone: '+91 98765 43210',
      billingAddress: '123 Industrial Area, Phase 1, Mumbai, Maharashtra 400001',
      shippingAddress: '123 Industrial Area, Phase 1, Mumbai, Maharashtra 400001'
    },
    {
      id: 'CUST-002',
      name: 'Priya Menon',
      company: 'Manufacturing Solutions Inc',
      email: 'priya.menon@mansol.com',
      phone: '+91 98123 45678',
      billingAddress: '456 Tech Park, Whitefield, Bangalore, Karnataka 560066',
      shippingAddress: '789 Warehouse Complex, Electronic City, Bangalore, Karnataka 560100'
    },
    {
      id: 'CUST-003',
      name: 'Amit Kumar',
      company: 'Industrial Automation Ltd',
      email: 'amit@indauto.com',
      phone: '+91 97654 32109',
      billingAddress: '789 Export Zone, Noida, Uttar Pradesh 201301',
      shippingAddress: '789 Export Zone, Noida, Uttar Pradesh 201301'
    },
    {
      id: 'CUST-004',
      name: 'Sneha Patel',
      company: 'Global Machinery Corp',
      email: 'sneha.p@globalmach.com',
      phone: '+91 98234 56789',
      billingAddress: '321 Industrial Estate, Ahmedabad, Gujarat 380015',
      shippingAddress: '654 Distribution Center, Gandhinagar, Gujarat 382010'
    }
  ];

  const [customers, setCustomers] = useState<Customer[]>(customersSeed);
  const [customersLoading, setCustomersLoading] = useState(false);

  const [orderNumber, setOrderNumber] = useState('SO-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'));
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('net_30');
  const [deliveryTerms, setDeliveryTerms] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [documents, setDocuments] = useState<{
    po?: File;
    specs?: File;
    drawings?: File;
    others: File[];
  }>({ others: [] });
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  useEffect(() => {
    setCustomersLoading(true);
    MasterDataService.getCustomers().then((live) => {
      if (live.length > 0) {
        setCustomers(live.map((c: MDCustomer): Customer => ({
          id: c.id,
          name: c.customerName || c.name || c.customerCode || c.id,
          company: c.customerName || c.name || '',
          email: c.email || '',
          phone: c.phone || '',
          billingAddress: '',
          shippingAddress: '',
        })));
      }
      setCustomersLoading(false);
    });
  }, []);

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: '1',
      productCode: '',
      productName: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      discount: 0,
      discountType: 'percent',
      tax: 18,
      taxType: 'GST',
      lineTotal: 0
    }
  ]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const calculateLineTotal = (item: OrderItem): number => {
    let subtotal = item.quantity * item.unitPrice;

    // Apply discount
    if (item.discountType === 'percent') {
      subtotal = subtotal - (subtotal * item.discount / 100);
    } else {
      subtotal = subtotal - item.discount;
    }

    // Apply tax
    const taxAmount = subtotal * (item.tax / 100);

    return subtotal + taxAmount;
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].lineTotal = calculateLineTotal(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: (items.length + 1).toString(),
        productCode: '',
        productName: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0,
        discount: 0,
        discountType: 'percent',
        tax: 18,
        taxType: 'GST',
        lineTotal: 0
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
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
      let lineSubtotal = item.quantity * item.unitPrice;
      if (item.discountType === 'percent') {
        lineSubtotal = lineSubtotal - (lineSubtotal * item.discount / 100);
      } else {
        lineSubtotal = lineSubtotal - item.discount;
      }
      return sum + (lineSubtotal * item.tax / 100);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const handleFileUpload = (type: 'po' | 'specs' | 'drawings' | 'others', file: File | null) => {
    if (!file) return;

    if (type === 'others') {
      setDocuments({ ...documents, others: [...documents.others, file] });
    } else {
      setDocuments({ ...documents, [type]: file });
    }
  };

  const removeDocument = (type: 'po' | 'specs' | 'drawings' | 'others', index?: number) => {
    if (type === 'others' && index !== undefined) {
      const newOthers = documents.others.filter((_, i) => i !== index);
      setDocuments({ ...documents, others: newOthers });
    } else if (type !== 'others') {
      const newDocs = { ...documents };
      delete newDocs[type];
      setDocuments(newDocs);
    }
  };

  const handleSave = (action: 'draft' | 'confirm') => {
    // Validate mandatory documents before confirming
    if (action === 'confirm' && !documents.po) {
      setUploadErrors(['PO document is required to confirm the order']);
      return;
    }

    setUploadErrors([]);
    console.log('Saving order:', {
      orderNumber,
      customer: selectedCustomer,
      items,
      documents,
      action
    });
    // Add save logic here
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

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
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('confirm')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Confirm Order
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {/* Main Form - Left Side */}
          <div className="xl:col-span-2 space-y-2">
            {/* Order Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline mr-1" />
                    Expected Delivery
                  </label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getPriorityColor(priority)}`}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                        placeholder="Search customer by name, company, or email..."
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setShowCustomerSearch(true);
                        }}
                        onFocus={() => setShowCustomerSearch(true)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <Plus className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Add</span>
                    </button>
                  </div>

                  {showCustomerSearch && customerSearchTerm && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {customersLoading && (
                        <div className="p-4 text-center text-gray-500 text-sm">Loading customers…</div>
                      )}
                      {!customersLoading && filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowCustomerSearch(false);
                            setCustomerSearchTerm('');
                          }}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-600">{customer.company}</p>
                              <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <div className="p-4 text-center text-gray-500">
                          No customers found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                        <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                          <Building2 className="w-4 h-4" />
                          {selectedCustomer.company}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{selectedCustomer.email}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                        <div className="mt-3 space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-600">Billing Address</p>
                            <p className="text-xs text-gray-600 mt-1">{selectedCustomer.billingAddress}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-600">Shipping Address</p>
                            <p className="text-xs text-gray-600 mt-1">{selectedCustomer.shippingAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Items
                </h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-600 pb-3 px-2">Product</th>
                      <th className="text-left text-xs font-semibold text-gray-600 pb-3 px-2">Description</th>
                      <th className="text-center text-xs font-semibold text-gray-600 pb-3 px-2">Qty</th>
                      <th className="text-right text-xs font-semibold text-gray-600 pb-3 px-2">Unit Price</th>
                      <th className="text-right text-xs font-semibold text-gray-600 pb-3 px-2">Discount</th>
                      <th className="text-right text-xs font-semibold text-gray-600 pb-3 px-2">Tax %</th>
                      <th className="text-right text-xs font-semibold text-gray-600 pb-3 px-2">Total</th>
                      <th className="pb-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            placeholder="Product name"
                            value={item.productName}
                            onChange={(e) => updateItem(index, 'productName', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-28 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.discount}
                              onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <select
                              value={item.discountType}
                              onChange={(e) => updateItem(index, 'discountType', e.target.value)}
                              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="percent">%</option>
                              <option value="amount">₹</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.tax}
                            onChange={(e) => updateItem(index, 'tax', parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className="font-semibold text-gray-900">
                            ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Terms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment
                </h2>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="immediate">Immediate Payment</option>
                  <option value="net_7">Net 7 Days</option>
                  <option value="net_15">Net 15 Days</option>
                  <option value="net_30">Net 30 Days</option>
                  <option value="net_45">Net 45 Days</option>
                  <option value="net_60">Net 60 Days</option>
                  <option value="custom">Custom Terms</option>
                </select>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Delivery
                </h2>
                <input
                  type="text"
                  placeholder="e.g., FOB, CIF, Ex-Works"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping Method</h2>
                <input
                  type="text"
                  placeholder="e.g., Standard, Express"
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h2>
                <textarea
                  placeholder="Add any internal notes for this order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>
                <textarea
                  placeholder="Enter terms and conditions..."
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Document Upload
              </h2>

              {uploadErrors.length > 0 && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  {uploadErrors.map((error, idx) => (
                    <p key={idx} className="text-sm text-red-700">{error}</p>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* PO Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Order (PO) <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    {!documents.po ? (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload('po', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload PO</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX</p>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-700 truncate">{documents.po.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument('po')}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specs Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Specifications
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    {!documents.specs ? (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload('specs', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload specs</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX</p>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-700 truncate">{documents.specs.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument('specs')}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Drawings Document */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Drawings
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    {!documents.drawings ? (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.dwg,.dxf"
                          onChange={(e) => handleFileUpload('drawings', e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Click to upload drawings</p>
                          <p className="text-xs text-gray-500 mt-1">PDF, DWG, DXF</p>
                        </div>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm text-gray-700 truncate">{documents.drawings.name}</span>
                        </div>
                        <button
                          onClick={() => removeDocument('drawings')}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Other Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => handleFileUpload('others', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">Any file type</p>
                      </div>
                    </label>
                    {documents.others.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {documents.others.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-gray-700 truncate">{file.name}</span>
                            </div>
                            <button
                              onClick={() => removeDocument('others', idx)}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                <span className="text-red-500">*</span> PO document is mandatory to confirm the order
              </p>
            </div>
          </div>

          {/* Summary - Right Side */}
          <div className="space-y-2">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Order Summary
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{calculateSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Discount</span>
                  <span className="font-semibold text-orange-600">
                    -₹{calculateTotalDiscount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Tax</span>
                  <span className="font-semibold text-gray-900">
                    ₹{calculateTotalTax().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-800 font-medium">
                    Total Items: {items.length}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Total Quantity: {items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Copy className="w-4 h-4" />
                  Copy from Quotation
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Import Items
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
