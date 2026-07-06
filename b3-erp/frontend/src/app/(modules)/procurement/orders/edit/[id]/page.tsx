'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { procurementPagesService } from '@/services/procurement-pages.service';
import { purchaseOrderService } from '@/services/purchase-order.service';
import {
  ArrowLeft,
  Save,
  ShoppingCart,
  Building2,
  Calendar,
  Plus,
  X,
  Copy,
  Trash2,
  MapPin,
  FileText,
  Package,
  Truck,
  IndianRupee,
  Tag,
  Percent,
  Info,
  AlertCircle,
} from 'lucide-react';

interface LineItem {
  id: string;
  itemCode: string;
  description: string;
  hsn: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxRate: string;
  taxType: 'CGST+SGST' | 'IGST';
  discountPercent: string;
}

interface DeliveryScheduleItem {
  id: string;
  deliveryDate: string;
  quantity: string;
  location: string;
}

interface QualitySpecItem {
  id: string;
  parameter: string;
  specification: string;
  testMethod: string;
  acceptanceCriteria: string;
}

interface POFormData {
  vendorName: string;
  vendorGST: string;
  vendorPAN: string;
  vendorContact: string;
  vendorEmail: string;
  vendorPhone: string;
  poDate: string;
  expectedDelivery: string;
  paymentTerms: string;
  incoterms: string;
  freightTerms: string;
  buyerName: string;
  requisitionRef: string;
  rfqRef: string;
  vendorAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  lineItems: LineItem[];
  deliverySchedule: DeliveryScheduleItem[];
  qualitySpecs: QualitySpecItem[];
  discountType: 'percentage' | 'amount';
  discountValue: string;
  notes: string;
  termsConditions: string;
}

// Vendor record shape used by the PO form (populated from the live vendors endpoint).
interface VendorOption {
  id: string;
  name: string;
  gst: string;
  pan: string;
  state: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const paymentTermsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'Advance Payment', 'Letter of Credit (LC)', 'Post-Dated Cheque (PDC)'];
const incotermsOptions = ['Ex-Works', 'FOB', 'CIF', 'DDP', 'DDU', 'FCA', 'CPT', 'CIP'];
const freightTermsOptions = ['Vendor Paid', 'Buyer Paid', 'Shared'];
const unitsOptions = ['MT', 'KG', 'PC', 'BOX', 'LTR', 'SQM', 'CFT', 'SET', 'BAG', 'ROLL', 'BUNDLE', 'DRUM'];

const materialItems = [
  'Hot Rolled Steel Coils - IS 2062 E250',
  'Cold Rolled Steel Sheets - IS 513 CR4',
  'TMT Steel Bars - Fe 500D Grade',
  'Stainless Steel Plates - Grade 304',
  'Aluminum Sheets - Grade 1100',
  'Copper Wire Rods - 8mm diameter',
  'Portland Cement - Grade 53',
  'Ready Mix Concrete - M25 Grade',
  'Industrial Paint - Epoxy Based',
  'Hydraulic Oil - ISO VG 68',
  'Industrial Chemicals - Various',
  'Packaging Materials - Corrugated Boxes',
];

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;

  const [companyState] = useState('Maharashtra'); // Our company state
  const [indianVendors, setIndianVendors] = useState<VendorOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    procurementPagesService
      .getVendors()
      .then((rows) => {
        if (cancelled) return;
        const mapped: VendorOption[] = (rows ?? []).map((r: any) => ({
          id: r.id ?? r.vendorId ?? r.vendorCode ?? '',
          name: r.name ?? r.vendorName ?? r.legalName ?? '',
          gst: r.gst ?? r.gstNumber ?? r.gstin ?? '',
          pan: r.pan ?? r.panNumber ?? '',
          state: r.state ?? r.stateName ?? '',
          contact: r.contact ?? r.contactPerson ?? r.contactName ?? '',
          email: r.email ?? r.contactEmail ?? '',
          phone: r.phone ?? r.contactPhone ?? r.phoneNumber ?? '',
          address: r.address ?? r.addressLine ?? '',
        }));
        setIndianVendors(mapped);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err?.message ?? 'Failed to load vendors');
        setIndianVendors([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Mock existing PO data
  const [poNumber] = useState('PO-2025-00142');

  const [formData, setFormData] = useState<POFormData>({
    vendorName: 'JSW Steel Limited',
    vendorGST: '27AABCJ8578D1ZS',
    vendorPAN: 'AABCJ8578D',
    vendorContact: 'Rajesh Kumar',
    vendorEmail: 'sales@jswsteel.in',
    vendorPhone: '+91 836 2513333',
    poDate: '2025-10-01',
    expectedDelivery: '2025-10-30',
    paymentTerms: 'Net 45',
    incoterms: 'Ex-Works',
    freightTerms: 'Vendor Paid',
    buyerName: 'Amit Sharma',
    requisitionRef: 'PR-2025-00089',
    rfqRef: 'RFQ-2025-00056',
    vendorAddress: {
      street: 'JSW Centre, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
    },
    billingAddress: {
      street: 'Plot No. 45, MIDC Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411019',
    },
    deliveryAddress: {
      street: 'Manufacturing Unit 2, Talegaon Industrial Park',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '410507',
    },
    lineItems: [
      {
        id: '1',
        itemCode: 'STL-HR-12MM-001',
        description: 'Hot Rolled Steel Coils - Grade IS 2062 E250, Thickness 12mm',
        hsn: '7208',
        quantity: '500',
        unit: 'MT',
        unitPrice: '52000',
        taxRate: '18',
        taxType: 'CGST+SGST',
        discountPercent: '2',
      },
    ],
    deliverySchedule: [
      {
        id: '1',
        deliveryDate: '2025-10-15',
        quantity: '350',
        location: 'Pune Manufacturing Unit 2',
      },
    ],
    qualitySpecs: [
      {
        id: '1',
        parameter: 'Yield Strength',
        specification: 'Min 250 MPa',
        testMethod: 'IS 1608',
        acceptanceCriteria: 'As per IS 2062 standards',
      },
    ],
    discountType: 'amount',
    discountValue: '170000',
    notes: 'Urgent requirement for production line. Please ensure timely delivery with proper packaging.',
    termsConditions: '1. Material to be delivered as per delivery schedule\n2. Quality inspection at vendor premises before dispatch\n3. Payment within 45 days from GRN date\n4. Prices are firm and fixed for the PO duration\n5. Penalty for delayed delivery as per contract terms',
  });

  const updateFormData = (field: keyof POFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (type: 'vendorAddress' | 'billingAddress' | 'deliveryAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  const handleVendorChange = (vendorName: string) => {
    const vendor = indianVendors.find(v => v.name === vendorName);
    if (vendor) {
      const addressParts = vendor.address.split(', ');
      updateFormData('vendorName', vendor.name);
      updateFormData('vendorGST', vendor.gst);
      updateFormData('vendorPAN', vendor.pan);
      updateFormData('vendorContact', vendor.contact);
      updateFormData('vendorEmail', vendor.email);
      updateFormData('vendorPhone', vendor.phone);

      // Update vendor address
      updateAddress('vendorAddress', 'street', addressParts.slice(0, -3).join(', '));
      updateAddress('vendorAddress', 'city', addressParts[addressParts.length - 3]);
      updateAddress('vendorAddress', 'state', addressParts[addressParts.length - 2]);
      updateAddress('vendorAddress', 'pincode', addressParts[addressParts.length - 1]);

      // Auto-determine tax type based on state
      const taxType = companyState === vendor.state ? 'CGST+SGST' : 'IGST';
      const updatedItems = formData.lineItems.map(item => ({
        ...item,
        taxType: taxType as 'CGST+SGST' | 'IGST',
      }));
      updateFormData('lineItems', updatedItems);
    }
  };

  // Line Items Management
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemCode: '',
      description: '',
      hsn: '',
      quantity: '1',
      unit: 'MT',
      unitPrice: '0',
      taxRate: '18',
      taxType: companyState === formData.vendorAddress.state ? 'CGST+SGST' : 'IGST',
      discountPercent: '0',
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

  // Delivery Schedule Management
  const addDeliverySchedule = () => {
    const newSchedule: DeliveryScheduleItem = {
      id: Math.random().toString(36).substr(2, 9),
      deliveryDate: '',
      quantity: '0',
      location: formData.deliveryAddress.city,
    };
    updateFormData('deliverySchedule', [...formData.deliverySchedule, newSchedule]);
  };

  const removeDeliverySchedule = (index: number) => {
    if (formData.deliverySchedule.length > 1) {
      updateFormData('deliverySchedule', formData.deliverySchedule.filter((_, i) => i !== index));
    }
  };

  const updateDeliverySchedule = (index: number, field: keyof DeliveryScheduleItem, value: string) => {
    const updated = [...formData.deliverySchedule];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('deliverySchedule', updated);
  };

  // Quality Specs Management
  const addQualitySpec = () => {
    const newSpec: QualitySpecItem = {
      id: Math.random().toString(36).substr(2, 9),
      parameter: '',
      specification: '',
      testMethod: '',
      acceptanceCriteria: '',
    };
    updateFormData('qualitySpecs', [...formData.qualitySpecs, newSpec]);
  };

  const removeQualitySpec = (index: number) => {
    if (formData.qualitySpecs.length > 1) {
      updateFormData('qualitySpecs', formData.qualitySpecs.filter((_, i) => i !== index));
    }
  };

  const updateQualitySpec = (index: number, field: keyof QualitySpecItem, value: string) => {
    const updated = [...formData.qualitySpecs];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('qualitySpecs', updated);
  };

  const calculateLineTotal = (item: LineItem) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const taxRate = parseFloat(item.taxRate) || 0;
    const discountPercent = parseFloat(item.discountPercent) || 0;

    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discountPercent) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * taxRate) / 100;

    return afterDiscount + taxAmount;
  };

  const calculateTotals = () => {
    const subtotal = formData.lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + quantity * unitPrice;
    }, 0);

    const itemDiscounts = formData.lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discountPercent = parseFloat(item.discountPercent) || 0;
      const itemTotal = quantity * unitPrice;
      return sum + (itemTotal * discountPercent) / 100;
    }, 0);

    const afterItemDiscount = subtotal - itemDiscounts;

    let additionalDiscount = 0;
    if (formData.discountType === 'percentage') {
      additionalDiscount = (afterItemDiscount * (parseFloat(formData.discountValue) || 0)) / 100;
    } else {
      additionalDiscount = parseFloat(formData.discountValue) || 0;
    }

    const afterAllDiscounts = afterItemDiscount - additionalDiscount;

    const taxAmount = formData.lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discountPercent = parseFloat(item.discountPercent) || 0;
      const itemTotal = quantity * unitPrice;
      const afterDiscount = itemTotal - (itemTotal * discountPercent) / 100;
      return sum + (afterDiscount * (parseFloat(item.taxRate) || 0)) / 100;
    }, 0);

    const total = afterAllDiscounts + taxAmount;

    return {
      subtotal,
      itemDiscounts,
      additionalDiscount,
      totalDiscount: itemDiscounts + additionalDiscount,
      taxAmount,
      cgst: formData.lineItems[0]?.taxType === 'CGST+SGST' ? taxAmount / 2 : 0,
      sgst: formData.lineItems[0]?.taxType === 'CGST+SGST' ? taxAmount / 2 : 0,
      igst: formData.lineItems[0]?.taxType === 'IGST' ? taxAmount : 0,
      total,
    };
  };

  const handleSave = async () => {
    const matchedVendor = indianVendors.find((v) => v.name === formData.vendorName);
    try {
      await purchaseOrderService.updatePurchaseOrder(poId, {
        vendorId: matchedVendor?.id || undefined,
        deliveryDate: formData.expectedDelivery || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        currency: 'INR',
        items: formData.lineItems.map((it) => ({
          itemId: it.itemCode || it.description,
          quantity: Number(it.quantity || 0),
          unitPrice: Number(it.unitPrice || 0),
          discount: Number(it.discountPercent || 0),
          taxRate: Number(it.taxRate || 0),
          deliveryDate: formData.expectedDelivery || new Date().toISOString().split('T')[0],
        })),
      });
      alert('Purchase order updated successfully.');
      router.push('/procurement/purchase-orders');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update purchase order');
    }
  };

  const handleCancel = () => {
    router.push('/procurement/purchase-orders');
  };

  const totals = calculateTotals();

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {/* Header */}
          <div className="mb-3">
            <button
              onClick={() => router.push('/procurement/purchase-orders')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Purchase Orders</span>
            </button>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Purchase Order</h1>
                  <p className="text-sm text-gray-600">PO Number: <span className="font-semibold text-blue-600">{poNumber}</span></p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading vendors…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {loadError}
            </div>
          )}

          <div className="space-y-3">
            {/* Vendor Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Vendor Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.vendorName}
                    onChange={(e) => handleVendorChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Vendor</option>
                    {indianVendors.map(vendor => (
                      <option key={vendor.gst} value={vendor.name}>{vendor.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input
                    type="text"
                    value={formData.vendorGST}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={formData.vendorPAN}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.vendorContact}
                    onChange={(e) => updateFormData('vendorContact', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.vendorEmail}
                    onChange={(e) => updateFormData('vendorEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.vendorPhone}
                    onChange={(e) => updateFormData('vendorPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* PO Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Purchase Order Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.poDate}
                      onChange={(e) => updateFormData('poDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Delivery Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.expectedDelivery}
                      onChange={(e) => updateFormData('expectedDelivery', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name</label>
                  <input
                    type="text"
                    value={formData.buyerName}
                    onChange={(e) => updateFormData('buyerName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter buyer name"
                  />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incoterms</label>
                  <select
                    value={formData.incoterms}
                    onChange={(e) => updateFormData('incoterms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {incotermsOptions.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Freight Terms</label>
                  <select
                    value={formData.freightTerms}
                    onChange={(e) => updateFormData('freightTerms', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {freightTermsOptions.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requisition Reference</label>
                  <input
                    type="text"
                    value={formData.requisitionRef}
                    onChange={(e) => updateFormData('requisitionRef', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="PR-2025-XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RFQ Reference</label>
                  <input
                    type="text"
                    value={formData.rfqRef}
                    onChange={(e) => updateFormData('rfqRef', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="RFQ-2025-XXXXX"
                  />
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Addresses
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Billing Address */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Billing Address</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.billingAddress.street}
                      onChange={(e) => updateAddress('billingAddress', 'street', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.billingAddress.city}
                        onChange={(e) => updateAddress('billingAddress', 'city', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                      />
                      <select
                        value={formData.billingAddress.state}
                        onChange={(e) => updateAddress('billingAddress', 'state', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={formData.billingAddress.pincode}
                      onChange={(e) => updateAddress('billingAddress', 'pincode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Delivery Address</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.deliveryAddress.street}
                      onChange={(e) => updateAddress('deliveryAddress', 'street', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street Address"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={formData.deliveryAddress.city}
                        onChange={(e) => updateAddress('deliveryAddress', 'city', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                      />
                      <select
                        value={formData.deliveryAddress.state}
                        onChange={(e) => updateAddress('deliveryAddress', 'state', e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={formData.deliveryAddress.pincode}
                      onChange={(e) => updateAddress('deliveryAddress', 'pincode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pincode"
                    />
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
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.lineItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-700">Item #{index + 1}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => duplicateLineItem(index)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                         
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {formData.lineItems.length > 1 && (
                          <button
                            onClick={() => removeLineItem(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
                        <input
                          type="text"
                          value={item.itemCode}
                          onChange={(e) => updateLineItem(index, 'itemCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="STL-XXX-XXX"
                        />
                      </div>

                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Item description"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">HSN Code</label>
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => updateLineItem(index, 'hsn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="7208"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          {unitsOptions.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                        <input
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => updateLineItem(index, 'discountPercent', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">GST Rate (%)</label>
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

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tax Type</label>
                        <input
                          type="text"
                          value={item.taxType}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Line Total</p>
                        <p className="text-lg font-bold text-blue-900">₹{calculateLineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="max-w-md ml-auto space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>

                  {totals.itemDiscounts > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Item Discounts:</span>
                      <span className="font-semibold text-red-600">-₹{totals.itemDiscounts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <select
                      value={formData.discountType}
                      onChange={(e) => updateFormData('discountType', e.target.value as 'percentage' | 'amount')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="percentage">Discount %</option>
                      <option value="amount">Discount ₹</option>
                    </select>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => updateFormData('discountValue', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    <span className="text-sm font-semibold text-red-600 min-w-[120px] text-right">
                      -₹{totals.additionalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {totals.cgst > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SGST (9%):</span>
                        <span className="font-semibold text-gray-900">₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}

                  {totals.igst > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IGST (18%):</span>
                      <span className="font-semibold text-gray-900">₹{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Grand Total:</span>
                      <span className="text-xl font-bold text-blue-900">₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Additional Information
              </h2>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions / Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter any special instructions or notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                  <textarea
                    value={formData.termsConditions}
                    onChange={(e) => updateFormData('termsConditions', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    placeholder="Enter terms and conditions..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pb-6">
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
