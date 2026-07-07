'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { goodsReceiptService } from '@/services/goods-receipt.service';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { warehouseService } from '@/services/warehouse.service';
import {
  Package,
  FileText,
  User,
  Calendar,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Truck,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  MapPin,
  Hash,
  Clock,
  Receipt,
  ShieldCheck,
  Target,
  Edit,
  Eye,
  Loader,
  ArrowLeft,
  Info,
  FileCheck,
  BarChart3,
  Send,
  Filter,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Zap,
  AlertTriangle
} from 'lucide-react';

// TypeScript Interfaces
interface PurchaseOrder {
  id: string;
  po_number: string;
  po_date: string;
  vendor_id: string;
  vendor_name: string;
  vendor_code: string;
  status: 'open' | 'partially_received' | 'closed';
  total_value: number;
  currency: string;
  pending_items: number;
  delivery_date: string;
}

interface POLineItem {
  id: string;
  item_code: string;
  item_name: string;
  description: string;
  unit: string;
  ordered_quantity: number;
  received_quantity: number;
  pending_quantity: number;
  unit_price: number;
  qc_required: boolean;
}

interface QualityParameter {
  id: string;
  parameter_name: string;
  test_method: string;
  acceptance_criteria: string;
  actual_value: string;
  unit: string;
  status: 'pass' | 'fail' | 'pending';
  remarks?: string;
}

interface QualityInspection {
  item_id: string;
  qc_required: boolean;
  inspector_id?: string;
  inspector_name?: string;
  sample_size?: number;
  parameters: QualityParameter[];
  overall_status: 'pass' | 'fail' | 'pending';
  remarks?: string;
}

interface GRNLineItem {
  id: string;
  item_code: string;
  item_name: string;
  description: string;
  unit: string;
  po_quantity: number;
  previously_received: number;
  pending_quantity: number;
  receiving_now: number;
  accepted_quantity: number;
  rejected_quantity: number;
  rejection_reason?: string;
  batch_number?: string;
  lot_number?: string;
  storage_location: string;
  unit_price: number;
  qc_required: boolean;
  qc_status?: 'pending' | 'pass' | 'fail';
  accept_reject: 'accept' | 'reject' | 'pending';
}

interface DocumentFile {
  id: string;
  document_type: 'invoice' | 'packing_list' | 'test_certificate' | 'photo' | 'lr_copy' | 'other';
  document_name: string;
  file: File;
  file_size: number;
}

interface GRNFormData {
  grn_number: string;
  grn_date: string;
  grn_time: string;
  po_id: string;
  po_number: string;
  po_date: string;
  po_value: number;
  vendor_id: string;
  vendor_name: string;
  vendor_code: string;
  receipt_date: string;
  receipt_time: string;
  received_by: string;
  gate_entry_no: string;
  invoice_number: string;
  invoice_date: string;
  invoice_value: number;
  transporter_name: string;
  vehicle_number: string;
  driver_name: string;
  driver_mobile: string;
  lr_number: string;
  lr_date: string;
  freight_charges: number;
  freight_paid_by: 'vendor' | 'company';
  line_items: GRNLineItem[];
  quality_inspections: QualityInspection[];
  documents: DocumentFile[];
  notes: string;
}

const REJECTION_REASONS = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'wrong_spec', label: 'Wrong Specification' },
  { value: 'expired', label: 'Expired/Near Expiry' },
  { value: 'quantity_short', label: 'Quantity Shortage' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'packaging_issue', label: 'Packaging Issue' },
  { value: 'other', label: 'Other' }
];

// Fallback used only until warehouse master data loads (or if it is empty).
const DEFAULT_STORAGE_LOCATION = 'UNASSIGNED';

const GRNAddPage = () => {
  const router = useRouter();

  const [step, setStep] = useState<'po_selection' | 'grn_details' | 'qc_setup'>('po_selection');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchingPO, setSearchingPO] = useState(false);
  const [showPOList, setShowPOList] = useState(false);
  const [availablePOs, setAvailablePOs] = useState<PurchaseOrder[]>([]);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [poLineItems, setPOLineItems] = useState<POLineItem[]>([]);
  const [selectedItemForQC, setSelectedItemForQC] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterVendor, setFilterVendor] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'partially_received'>('all');
  const [storageLocations, setStorageLocations] = useState<string[]>([]);

  const [formData, setFormData] = useState<GRNFormData>({
    grn_number: `GRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
    grn_date: new Date().toISOString().split('T')[0],
    grn_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    po_id: '',
    po_number: '',
    po_date: '',
    po_value: 0,
    vendor_id: '',
    vendor_name: '',
    vendor_code: '',
    receipt_date: new Date().toISOString().split('T')[0],
    receipt_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    received_by: 'Current User (Auto-filled)',
    gate_entry_no: '',
    invoice_number: '',
    invoice_date: '',
    invoice_value: 0,
    transporter_name: '',
    vehicle_number: '',
    driver_name: '',
    driver_mobile: '',
    lr_number: '',
    lr_date: '',
    freight_charges: 0,
    freight_paid_by: 'vendor',
    line_items: [],
    quality_inspections: [],
    documents: [],
    notes: ''
  });

  // Load available POs from purchase-order master
  useEffect(() => {
    const fetchPOs = async () => {
      setSearchingPO(true);
      try {
        const res = await purchaseOrderService.getAllPurchaseOrders();
        const rows = Array.isArray(res) ? res : res?.data ?? [];
        const mapStatus = (s: string): PurchaseOrder['status'] => {
          const key = (s || '').toLowerCase();
          if (key.includes('partial')) return 'partially_received';
          if (key.includes('close') || key.includes('complete') || key.includes('received')) return 'closed';
          return 'open';
        };
        const mapped: PurchaseOrder[] = rows.map((po: any) => ({
          id: po.id,
          po_number: po.poNumber,
          po_date: po.orderDate,
          vendor_id: po.vendorId,
          vendor_name: po.vendorName,
          vendor_code: po.vendorCode,
          status: mapStatus(po.status),
          total_value: Number(po.totalAmount ?? 0),
          currency: po.currency ?? 'INR',
          pending_items: Array.isArray(po.items)
            ? po.items.filter((it: any) => Number(it.quantity ?? 0) - Number(it.receivedQuantity ?? 0) > 0).length
            : 0,
          delivery_date: po.deliveryDate,
        }));
        setAvailablePOs(mapped);
      } catch {
        setAvailablePOs([]);
      } finally {
        setSearchingPO(false);
      }
    };

    fetchPOs();
  }, []);

  // Load storage locations from warehouse master data
  useEffect(() => {
    const fetchStorageLocations = async () => {
      try {
        const warehouses = await warehouseService.getAllWarehouses();
        const locations: string[] = [];
        (warehouses ?? []).forEach((wh) => {
          if (Array.isArray(wh.locations) && wh.locations.length > 0) {
            wh.locations.forEach((loc) => locations.push(loc.code || loc.name));
          } else {
            locations.push(wh.code);
          }
        });
        setStorageLocations(Array.from(new Set(locations.filter(Boolean))));
      } catch {
        setStorageLocations([]);
      }
    };

    fetchStorageLocations();
  }, []);

  const handlePOSelection = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setFormData(prev => ({
      ...prev,
      po_id: po.id,
      po_number: po.po_number,
      po_date: po.po_date,
      po_value: po.total_value,
      vendor_id: po.vendor_id,
      vendor_name: po.vendor_name,
      vendor_code: po.vendor_code
    }));

    // Load PO line items
    loadPOLineItems(po.id);
    setShowPOList(false);
  };

  const loadPOLineItems = async (poId: string) => {
    setLoading(true);
    let poLineItems: POLineItem[] = [];
    try {
      const po = await purchaseOrderService.getPurchaseOrderById(poId);
      poLineItems = (po?.items ?? []).map((it: any) => {
        const ordered = Number(it.quantity ?? 0);
        const received = Number(it.receivedQuantity ?? 0);
        return {
          id: it.id,
          item_code: it.itemCode,
          item_name: it.itemName,
          description: it.description ?? '',
          unit: it.unit ?? '',
          ordered_quantity: ordered,
          received_quantity: received,
          pending_quantity: ordered - received,
          unit_price: Number(it.unitPrice ?? 0),
          qc_required: false,
        };
      });
    } catch {
      poLineItems = [];
    }

    {
      const lineItems = poLineItems;

      setPOLineItems(lineItems);

      // Convert to GRN line items
      const grnLineItems: GRNLineItem[] = lineItems.map(item => ({
        id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        description: item.description,
        unit: item.unit,
        po_quantity: item.ordered_quantity,
        previously_received: item.received_quantity,
        pending_quantity: item.pending_quantity,
        receiving_now: 0,
        accepted_quantity: 0,
        rejected_quantity: 0,
        batch_number: '',
        lot_number: '',
        storage_location: storageLocations[0] ?? DEFAULT_STORAGE_LOCATION,
        unit_price: item.unit_price,
        qc_required: item.qc_required,
        qc_status: 'pending',
        accept_reject: 'pending'
      }));

      setFormData(prev => ({ ...prev, line_items: grnLineItems }));
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GRNFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLineItemChange = (index: number, field: keyof GRNLineItem, value: any) => {
    const newLineItems = [...formData.line_items];
    newLineItems[index] = { ...newLineItems[index], [field]: value };

    // Auto-calculate rejected quantity
    if (field === 'receiving_now' || field === 'accepted_quantity') {
      const receiving = field === 'receiving_now' ? Number(value) : newLineItems[index].receiving_now;
      const accepted = field === 'accepted_quantity' ? Number(value) : newLineItems[index].accepted_quantity;
      newLineItems[index].rejected_quantity = receiving - accepted;

      // Update accept/reject status
      if (accepted === receiving && receiving > 0) {
        newLineItems[index].accept_reject = 'accept';
      } else if (accepted === 0 && receiving > 0) {
        newLineItems[index].accept_reject = 'reject';
      }
    }

    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const handleQuickQC = (action: 'pass_all' | 'fail_all') => {
    const newLineItems = formData.line_items.map(item => ({
      ...item,
      qc_status: action === 'pass_all' ? 'pass' as const : 'fail' as const,
      accept_reject: action === 'pass_all' ? 'accept' as const : 'reject' as const,
      accepted_quantity: action === 'pass_all' ? item.receiving_now : 0,
      rejected_quantity: action === 'pass_all' ? 0 : item.receiving_now
    }));

    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const handleDocumentUpload = (type: DocumentFile['document_type'], files: FileList | null) => {
    if (!files) return;

    const newDocuments: DocumentFile[] = Array.from(files).map(file => ({
      id: `DOC-${Date.now()}-${Math.random()}`,
      document_type: type,
      document_name: file.name,
      file: file,
      file_size: file.size
    }));

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
  };

  const removeDocument = (docId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== docId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.po_number) newErrors.po_number = 'PO selection is required';
    if (!formData.receipt_date) newErrors.receipt_date = 'Receipt date is required';
    if (!formData.invoice_number) newErrors.invoice_number = 'Invoice number is required';
    if (!formData.invoice_date) newErrors.invoice_date = 'Invoice date is required';
    if (formData.invoice_value <= 0) newErrors.invoice_value = 'Invoice value must be greater than 0';

    // Validate at least one item is being received
    const totalReceiving = formData.line_items.reduce((sum, item) => sum + item.receiving_now, 0);
    if (totalReceiving === 0) {
      newErrors.line_items = 'At least one item must have receiving quantity > 0';
    }

    // Validate line items
    formData.line_items.forEach((item, index) => {
      if (item.receiving_now > item.pending_quantity) {
        newErrors[`line_item_${index}_receiving`] = 'Receiving quantity cannot exceed pending quantity';
      }
      if (item.receiving_now < 0) {
        newErrors[`line_item_${index}_receiving`] = 'Receiving quantity cannot be negative';
      }
      if (item.rejected_quantity > 0 && !item.rejection_reason) {
        newErrors[`line_item_${index}_rejection`] = 'Rejection reason is required';
      }
      if (item.receiving_now > 0 && !item.batch_number) {
        newErrors[`line_item_${index}_batch`] = 'Batch number is required';
      }
      if (item.receiving_now > 0 && !item.lot_number) {
        newErrors[`line_item_${index}_lot`] = 'Lot number is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (submitType: 'draft' | 'inspection' | 'accept_post') => {
    if (!validateForm()) {
      alert('Please fix all validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      const created = await goodsReceiptService.createGoodsReceipt({
        poId: formData.po_id,
        deliveryNoteNumber: formData.invoice_number || undefined,
        deliveryDate: formData.receipt_date || formData.grn_date,
        warehouseId: 'default-warehouse',
        notes: formData.notes || undefined,
        items: formData.line_items.map((li) => ({
          poItemId: li.id,
          receivedQuantity: Number(li.receiving_now ?? 0),
          batchNumber: li.batch_number || undefined,
          locationId: li.storage_location || undefined,
        })),
      });

      if (submitType === 'accept_post' && (created as any)?.id) {
        await goodsReceiptService.postToInventory((created as any).id);
      }

      const message =
        submitType === 'draft' ? 'GRN saved as draft successfully!' :
          submitType === 'inspection' ? 'GRN submitted for inspection successfully!' :
            'GRN accepted and posted to inventory successfully!';
      alert(message);
      router.push('/procurement/grn');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create GRN');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      router.push('/procurement/grn');
    }
  };

  const filteredPOs = availablePOs.filter(po => {
    const matchesVendor = !filterVendor || po.vendor_name.toLowerCase().includes(filterVendor.toLowerCase());
    const matchesStatus = filterStatus === 'all' || po.status === filterStatus;
    return matchesVendor && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/procurement/grn')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New GRN</h1>
                <p className="text-sm text-gray-600 mt-1">GRN Number: {formData.grn_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'po_selection' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
                }`}>
                {step === 'po_selection' ? '1' : <CheckCircle className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium ${step === 'po_selection' ? 'text-blue-600' : 'text-gray-600'}`}>
                Select PO
              </span>
            </div>
            <div className="w-24 h-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'grn_details' ? 'bg-blue-600 text-white' :
                  step === 'qc_setup' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                {step === 'qc_setup' ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className={`text-sm font-medium ${step === 'grn_details' ? 'text-blue-600' : 'text-gray-600'}`}>
                GRN Details
              </span>
            </div>
            <div className="w-24 h-1 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'qc_setup' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                3
              </div>
              <span className={`text-sm font-medium ${step === 'qc_setup' ? 'text-blue-600' : 'text-gray-600'}`}>
                QC Setup
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: PO Selection */}
        {step === 'po_selection' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Search & Select Purchase Order
            </h2>

            {/* Filters */}
            <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Vendor</label>
                <input
                  type="text"
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(e.target.value)}
                  placeholder="Search vendor name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="partially_received">Partially Received</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterVendor(''); setFilterStatus('all'); }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            </div>

            {/* PO List */}
            {searchingPO ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPOs.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">No purchase orders found matching the filters</p>
                  </div>
                ) : (
                  filteredPOs.map(po => (
                    <div
                      key={po.id}
                      onClick={() => handlePOSelection(po)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedPO?.id === po.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{po.po_number}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${po.status === 'open' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {po.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Vendor:</span>
                              <p className="font-medium text-gray-900">{po.vendor_name}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">PO Date:</span>
                              <p className="font-medium text-gray-900">{po.po_date}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Delivery Date:</span>
                              <p className="font-medium text-gray-900">{po.delivery_date}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Value:</span>
                              <p className="font-medium text-gray-900">
                                {po.currency} {po.total_value.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {po.pending_items} pending items
                            </span>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${selectedPO?.id === po.id ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedPO && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep('grn_details')}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: GRN Details */}
        {step === 'grn_details' && (
          <div className="space-y-3">
            {/* PO Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected PO: {formData.po_number}</h3>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Vendor:</span>
                      <p className="font-medium text-gray-900">{formData.vendor_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">PO Date:</span>
                      <p className="font-medium text-gray-900">{formData.po_date}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">PO Value:</span>
                      <p className="font-medium text-gray-900">INR {formData.po_value.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending Items:</span>
                      <p className="font-medium text-gray-900">{formData.line_items.length}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep('po_selection')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                  Change PO
                </button>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Receipt Details
              </h2>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Receipt Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => handleInputChange('receipt_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.receipt_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Time</label>
                  <input
                    type="time"
                    value={formData.receipt_time}
                    onChange={(e) => handleInputChange('receipt_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
                  <input
                    type="text"
                    value={formData.received_by}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gate Entry No</label>
                  <input
                    type="text"
                    value={formData.gate_entry_no}
                    onChange={(e) => handleInputChange('gate_entry_no', e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                Invoice Details
              </h2>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.invoice_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.invoice_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.invoice_value}
                    onChange={(e) => handleInputChange('invoice_value', parseFloat(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.invoice_value ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
              </div>
            </div>

            {/* Transporter Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" />
                Transporter Details
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporter Name</label>
                  <input
                    type="text"
                    value={formData.transporter_name}
                    onChange={(e) => handleInputChange('transporter_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={formData.vehicle_number}
                    onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                    placeholder="MH-12-AB-1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driver_name}
                    onChange={(e) => handleInputChange('driver_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Mobile</label>
                  <input
                    type="tel"
                    value={formData.driver_mobile}
                    onChange={(e) => handleInputChange('driver_mobile', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LR Number</label>
                  <input
                    type="text"
                    value={formData.lr_number}
                    onChange={(e) => handleInputChange('lr_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
                  <input
                    type="date"
                    value={formData.lr_date}
                    onChange={(e) => handleInputChange('lr_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Line Items - Material Receipt
              </h2>

              {errors.line_items && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{errors.line_items}</span>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Item</th>
                      <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Unit</th>
                      <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Ordered</th>
                      <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Pending</th>
                      <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Receiving</th>
                      <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Batch No</th>
                      <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Lot No</th>
                      <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Storage</th>
                      <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.line_items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 border-b">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.item_code}</p>
                            <p className="text-xs text-gray-500">{item.item_name}</p>
                          </div>
                        </td>
                        <td className="p-3 border-b text-center text-sm">{item.unit}</td>
                        <td className="p-3 border-b text-right text-sm">{item.po_quantity.toLocaleString()}</td>
                        <td className="p-3 border-b text-right text-sm font-medium text-blue-700">
                          {item.pending_quantity.toLocaleString()}
                        </td>
                        <td className="p-3 border-b">
                          <input
                            type="number"
                            value={item.receiving_now}
                            onChange={(e) => handleLineItemChange(index, 'receiving_now', parseFloat(e.target.value) || 0)}
                            max={item.pending_quantity}
                            className={`w-24 px-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-blue-500 ${errors[`line_item_${index}_receiving`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => handleLineItemChange(index, 'batch_number', e.target.value)}
                            placeholder="Batch..."
                            className={`w-32 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${errors[`line_item_${index}_batch`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                          />
                        </td>
                        <td className="p-3 border-b">
                          <input
                            type="text"
                            value={item.lot_number}
                            onChange={(e) => handleLineItemChange(index, 'lot_number', e.target.value)}
                            placeholder="Lot..."
                            className={`w-32 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${errors[`line_item_${index}_lot`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                          />
                        </td>
                        <td className="p-3 border-b">
                          <select
                            value={item.storage_location}
                            onChange={(e) => handleLineItemChange(index, 'storage_location', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            {(storageLocations.includes(item.storage_location)
                              ? storageLocations
                              : [item.storage_location, ...storageLocations]
                            ).map(location => (
                              <option key={location} value={location}>{location}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 border-b text-center">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleLineItemChange(index, 'accept_reject', 'accept')}
                              className={`p-1 rounded ${item.accept_reject === 'accept' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}

                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleLineItemChange(index, 'accept_reject', 'reject')}
                              className={`p-1 rounded ${item.accept_reject === 'reject' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}

                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-gray-600" />
                Documents
              </h2>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload('invoice', e.target.files)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Packing List</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleDocumentUpload('packing_list', e.target.files)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => handleDocumentUpload('photo', e.target.files)}
                    className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Uploaded Documents ({formData.documents.length})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-sm text-gray-700 truncate">{doc.document_name}</span>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-gray-600" />
                Notes
              </h2>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                placeholder="Add any additional notes or comments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('po_selection')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit('inspection')}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Submit for QC
                </button>
                <button
                  onClick={() => handleSubmit('accept_post')}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Accept & Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GRNAddPage;
