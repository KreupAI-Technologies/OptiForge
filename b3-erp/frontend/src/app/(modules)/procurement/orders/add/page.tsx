'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
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
  Upload,
  Eye,
  CheckSquare,
  Clock,
  User,
  FileSpreadsheet,
  Link as LinkIcon,
  ClipboardCheck,
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
  insuranceRequired: boolean;
  insuranceDetails: string;
  packagingRequirements: string;
  approvalRequired: boolean;
  approver: string;
}

// Indian vendors for manufacturing
const indianVendors = [
  {
    name: 'JSW Steel Limited',
    gst: '27AABCJ8578D1ZS',
    pan: 'AABCJ8578D',
    state: 'Maharashtra',
    contact: 'Rajesh Kumar',
    email: 'sales@jswsteel.in',
    phone: '+91 836 2513333',
    address: 'JSW Centre, Bandra Kurla Complex, Mumbai, Maharashtra, 400051',
  },
  {
    name: 'Tata Steel Limited',
    gst: '27AAACT2727Q1ZV',
    pan: 'AAACT2727Q',
    state: 'West Bengal',
    contact: 'Amit Patel',
    email: 'procurement@tatasteel.com',
    phone: '+91 657 2345678',
    address: 'Tata Centre, 43 Jawaharlal Nehru Road, Kolkata, West Bengal, 700071',
  },
  {
    name: 'Hindalco Industries Limited',
    gst: '27AAACH6781G1ZN',
    pan: 'AAACH6781G',
    state: 'Maharashtra',
    contact: 'Suresh Reddy',
    email: 'sales@hindalco.com',
    phone: '+91 22 66911700',
    address: 'Century Bhavan, Dr. Annie Besant Road, Worli, Mumbai, Maharashtra, 400030',
  },
  {
    name: 'ACC Cement Limited',
    gst: '27AAACA3803M1ZY',
    pan: 'AAACA3803M',
    state: 'Maharashtra',
    contact: 'Priya Singh',
    email: 'sales@acclimited.com',
    phone: '+91 22 33023000',
    address: 'Cement House, 121 Maharshi Karve Road, Mumbai, Maharashtra, 400020',
  },
  {
    name: 'UltraTech Cement Limited',
    gst: '27AAACU0179K1Z3',
    pan: 'AAACU0179K',
    state: 'Maharashtra',
    contact: 'Vikram Malhotra',
    email: 'info@ultratechcement.com',
    phone: '+91 22 66917800',
    address: 'B-Wing, Ahura Centre, Mahakali Caves Road, Mumbai, Maharashtra, 400093',
  },
  {
    name: 'Asian Paints Limited',
    gst: '27AAACA9887J1ZD',
    pan: 'AAACA9887J',
    state: 'Maharashtra',
    contact: 'Neha Gupta',
    email: 'corporate@asianpaints.com',
    phone: '+91 22 66569000',
    address: 'Asian Paints House, 6A Shantinagar, Santacruz (E), Mumbai, Maharashtra, 400055',
  },
  {
    name: 'Bharat Petroleum Corporation',
    gst: '27AAACB2902B1ZW',
    pan: 'AAACB2902B',
    state: 'Maharashtra',
    contact: 'Rajiv Desai',
    email: 'corporate@bharatpetroleum.in',
    phone: '+91 22 22713000',
    address: 'Bharat Bhavan, 4&6 Currimbhoy Road, Ballard Estate, Mumbai, Maharashtra, 400001',
  },
  {
    name: 'Indian Oil Corporation',
    gst: '07AAACI1681G1ZM',
    pan: 'AAACI1681G',
    state: 'Delhi',
    contact: 'Anjali Sharma',
    email: 'procurement@iocl.com',
    phone: '+91 11 23352819',
    address: 'Indian Oil Bhavan, G-9 Ali Yavar Jung Marg, Bandra East, Mumbai, Maharashtra, 400051',
  },
  {
    name: 'Reliance Industries Limited',
    gst: '24AAACR5055K1Z4',
    pan: 'AAACR5055K',
    state: 'Gujarat',
    contact: 'Karan Shah',
    email: 'purchase@ril.com',
    phone: '+91 22 35556666',
    address: 'Maker Chambers IV, 222 Nariman Point, Mumbai, Maharashtra, 400021',
  },
  {
    name: 'Vedanta Limited',
    gst: '27AAACV3860L1ZF',
    pan: 'AAACV3860L',
    state: 'Maharashtra',
    contact: 'Deepa Verma',
    email: 'sales@vedantalimited.com',
    phone: '+91 22 66461000',
    address: '75, Nehru Road, Vile Parle East, Mumbai, Maharashtra, 400099',
  },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const paymentTermsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Net 90', 'Advance Payment', 'Letter of Credit (LC)', 'Post-Dated Cheque (PDC)', 'Custom'];
const incotermsOptions = ['Ex-Works', 'FOB', 'CIF', 'DDP', 'DDU', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU'];
const freightTermsOptions = ['Vendor Paid', 'Buyer Paid', 'Shared', 'FOB Destination', 'FOB Origin'];
const unitsOptions = ['MT', 'KG', 'PC', 'BOX', 'LTR', 'SQM', 'CFT', 'SET', 'BAG', 'ROLL', 'BUNDLE', 'DRUM', 'TON', 'METER'];

const materialItems = [
  { name: 'Hot Rolled Steel Coils - IS 2062 E250', hsn: '7208', unit: 'MT' },
  { name: 'Cold Rolled Steel Sheets - IS 513 CR4', hsn: '7209', unit: 'MT' },
  { name: 'TMT Steel Bars - Fe 500D Grade', hsn: '7214', unit: 'MT' },
  { name: 'Stainless Steel Plates - Grade 304', hsn: '7219', unit: 'MT' },
  { name: 'Aluminum Sheets - Grade 1100', hsn: '7606', unit: 'MT' },
  { name: 'Copper Wire Rods - 8mm diameter', hsn: '7408', unit: 'MT' },
  { name: 'Portland Cement - Grade 53', hsn: '2523', unit: 'MT' },
  { name: 'Ready Mix Concrete - M25 Grade', hsn: '3824', unit: 'CFT' },
  { name: 'Industrial Paint - Epoxy Based', hsn: '3208', unit: 'LTR' },
  { name: 'Hydraulic Oil - ISO VG 68', hsn: '2710', unit: 'LTR' },
  { name: 'Industrial Chemicals - Sulphuric Acid', hsn: '2807', unit: 'LTR' },
  { name: 'Packaging Materials - Corrugated Boxes', hsn: '4819', unit: 'PC' },
  { name: 'Welding Electrodes - E7018', hsn: '8311', unit: 'KG' },
  { name: 'Industrial Fasteners - M12 Bolts', hsn: '7318', unit: 'PC' },
  { name: 'PVC Pipes - 110mm diameter', hsn: '3917', unit: 'METER' },
];

const approversList = [
  'Priya Desai - Procurement Manager',
  'Rajesh Kumar - Operations Head',
  'Amit Sharma - Finance Controller',
  'Suresh Patel - Plant Manager',
  'Neha Gupta - Supply Chain Director',
];

export default function AddPurchaseOrderPage() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [createFromRequisition, setCreateFromRequisition] = useState(false);
  const [createFromRFQ, setCreateFromRFQ] = useState(false);
  const [companyState] = useState('Maharashtra'); // Our company state

  // Generate PO number
  const generatePONumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `PO-${year}-${random}`;
  };

  const [poNumber] = useState(generatePONumber());

  const [formData, setFormData] = useState<POFormData>({
    vendorName: '',
    vendorGST: '',
    vendorPAN: '',
    vendorContact: '',
    vendorEmail: '',
    vendorPhone: '',
    poDate: new Date().toISOString().split('T')[0],
    expectedDelivery: '',
    paymentTerms: 'Net 45',
    incoterms: 'Ex-Works',
    freightTerms: 'Vendor Paid',
    buyerName: '',
    requisitionRef: '',
    rfqRef: '',
    vendorAddress: {
      street: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
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
        id: Math.random().toString(36).substr(2, 9),
        itemCode: '',
        description: '',
        hsn: '',
        quantity: '1',
        unit: 'MT',
        unitPrice: '0',
        taxRate: '18',
        taxType: 'CGST+SGST',
        discountPercent: '0',
      },
    ],
    deliverySchedule: [
      {
        id: Math.random().toString(36).substr(2, 9),
        deliveryDate: '',
        quantity: '0',
        location: 'Pune Manufacturing Unit 2',
      },
    ],
    qualitySpecs: [
      {
        id: Math.random().toString(36).substr(2, 9),
        parameter: '',
        specification: '',
        testMethod: '',
        acceptanceCriteria: '',
      },
    ],
    discountType: 'amount',
    discountValue: '0',
    notes: 'Please ensure timely delivery with proper packaging and handling. Material test certificates to accompany each delivery.',
    termsConditions: '1. Material to be delivered as per delivery schedule\n2. Quality inspection at vendor premises before dispatch\n3. Payment as per agreed payment terms from GRN date\n4. Prices are firm and fixed for the PO duration\n5. Penalty for delayed delivery as per contract terms\n6. All statutory compliances to be adhered to\n7. Insurance and freight as per agreed terms\n8. Dispute resolution through arbitration in Pune jurisdiction',
    insuranceRequired: false,
    insuranceDetails: '',
    packagingRequirements: 'Standard industrial packaging with weather-proof covering. Proper labeling with item code, quantity, and batch/heat number.',
    approvalRequired: false,
    approver: '',
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

  const handleLoadFromRequisition = () => {
    // Mock loading data from requisition
    setCreateFromRequisition(true);
    updateFormData('requisitionRef', 'PR-2025-00089');
    // In real implementation, fetch and populate items from PR
    alert('Load items from Purchase Requisition (Feature coming soon)');
  };

  const handleLoadFromRFQ = () => {
    // Mock loading data from RFQ
    setCreateFromRFQ(true);
    updateFormData('rfqRef', 'RFQ-2025-00056');
    // In real implementation, fetch vendor and quoted prices from RFQ
    alert('Load vendor and prices from RFQ (Feature coming soon)');
  };

  const handleBulkImport = () => {
    // Mock bulk import from Excel/CSV
    alert('Bulk import from Excel/CSV (Feature coming soon)');
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

  const handleMaterialSelect = (index: number, materialName: string) => {
    const material = materialItems.find(m => m.name === materialName);
    if (material) {
      updateLineItem(index, 'description', material.name);
      updateLineItem(index, 'hsn', material.hsn);
      updateLineItem(index, 'unit', material.unit);
    }
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

  const handleSaveDraft = () => {
    console.log('Save as Draft:', { poNumber, ...formData, status: 'draft' });
    router.push('/procurement/purchase-orders');
  };

  const handleSubmitForApproval = () => {
    if (!formData.approver) {
      alert('Please select an approver');
      return;
    }
    console.log('Submit for Approval:', { poNumber, ...formData, status: 'pending_approval' });
    router.push('/procurement/purchase-orders');
  };

  const handleSendToVendor = () => {
    if (!formData.vendorName) {
      alert('Please select a vendor');
      return;
    }
    console.log('Send to Vendor:', { poNumber, ...formData, status: 'sent' });
    router.push('/procurement/purchase-orders');
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
                  <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
                  <p className="text-sm text-gray-600">PO Number: <span className="font-semibold text-blue-600">{poNumber}</span></p>
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
              {/* Quick Create Options */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Create Options
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button
                    onClick={handleLoadFromRequisition}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">From Requisition</p>
                      <p className="text-xs text-gray-500">Load items from PR</p>
                    </div>
                  </button>

                  <button
                    onClick={handleLoadFromRFQ}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all"
                  >
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Tag className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">From RFQ</p>
                      <p className="text-xs text-gray-500">Load vendor & prices</p>
                    </div>
                  </button>

                  <button
                    onClick={handleBulkImport}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">Bulk Import</p>
                      <p className="text-xs text-gray-500">Import from Excel/CSV</p>
                    </div>
                  </button>
                </div>
              </div>

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

                  {formData.vendorName && (
                    <>
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
                    </>
                  )}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Buyer / Purchaser Name</label>
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
                      placeholder="PR-2025-XXXXX (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">RFQ Reference</label>
                    <input
                      type="text"
                      value={formData.rfqRef}
                      onChange={(e) => updateFormData('rfqRef', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="RFQ-2025-XXXXX (Optional)"
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkImport}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Bulk Import</span>
                    </button>
                    <button
                      onClick={addLineItem}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
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
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description / Select Material</label>
                          <select
                            value={item.description}
                            onChange={(e) => handleMaterialSelect(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">Select material or enter custom description</option>
                            {materialItems.map(material => (
                              <option key={material.name} value={material.name}>{material.name}</option>
                            ))}
                          </select>
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

              {/* Additional Requirements */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                  Additional Requirements
                </h2>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Requirements</label>
                    <textarea
                      value={formData.packagingRequirements}
                      onChange={(e) => updateFormData('packagingRequirements', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Specify packaging requirements..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.insuranceRequired}
                      onChange={(e) => updateFormData('insuranceRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Insurance Required</label>
                  </div>

                  {formData.insuranceRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Details</label>
                      <textarea
                        value={formData.insuranceDetails}
                        onChange={(e) => updateFormData('insuranceDetails', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Specify insurance requirements and coverage..."
                      />
                    </div>
                  )}
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
                      rows={6}
                      placeholder="Enter terms and conditions..."
                    />
                  </div>
                </div>
              </div>

              {/* Approval Workflow */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-3">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                  <CheckSquare className="h-5 w-5 mr-2 text-orange-600" />
                  Approval Workflow
                </h2>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.approvalRequired}
                      onChange={(e) => updateFormData('approvalRequired', e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700">Multi-Level Approval Required</label>
                  </div>

                  {formData.approvalRequired && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Approver <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.approver}
                        onChange={(e) => updateFormData('approver', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Approver</option>
                        {approversList.map(approver => (
                          <option key={approver} value={approver}>{approver}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.approvalRequired && (
                    <div className="bg-white rounded-lg p-3 border border-yellow-300">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-gray-700">
                          <p className="font-semibold">Approval Required</p>
                          <p className="mt-1">This PO will be sent for approval before being sent to the vendor. The approver will receive a notification.</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                  onClick={handleSaveDraft}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save as Draft</span>
                </button>
                {formData.approvalRequired ? (
                  <button
                    onClick={handleSubmitForApproval}
                    className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <CheckSquare className="h-5 w-5" />
                    <span>Submit for Approval</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSendToVendor}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send to Vendor</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">PURCHASE ORDER</h2>
                <p className="text-xl text-blue-600 font-semibold">{poNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Vendor Details</h3>
                  <p className="text-sm font-semibold text-gray-900">{formData.vendorName || 'Not Selected'}</p>
                  <p className="text-sm text-gray-600">GST: {formData.vendorGST || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Contact: {formData.vendorContact || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">PO Date: {formData.poDate}</p>
                  <p className="text-sm text-gray-600">Delivery Date: {formData.expectedDelivery || 'Not Set'}</p>
                  <p className="text-sm text-gray-600">Payment Terms: {formData.paymentTerms}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Line Items</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Rate</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lineItems.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-4 py-2">{item.description || `Item ${index + 1}`}</td>
                        <td className="px-4 py-2 text-center">{item.quantity} {item.unit}</td>
                        <td className="px-4 py-2 text-right">₹{parseFloat(item.unitPrice).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-2 text-right">₹{calculateLineTotal(item).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{totals.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{totals.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {formData.notes && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Special Instructions</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{formData.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
