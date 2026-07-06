'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { goodsReceiptService } from '@/services/goods-receipt.service';
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
  BarChart3
} from 'lucide-react';

// TypeScript Interfaces
interface PurchaseOrder {
  id: string;
  po_number: string;
  po_date: string;
  vendor_id: string;
  vendor_name: string;
  status: string;
  total_value: number;
  pending_items: number;
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
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  rejection_reason?: string;
  batch_number?: string;
  lot_number?: string;
  storage_location: string;
  unit_price: number;
  qc_required: boolean;
  qc_status?: 'pending' | 'pass' | 'fail';
}

interface DocumentFile {
  id: string;
  document_type: 'invoice' | 'packing_list' | 'test_certificate' | 'photo' | 'lr_copy' | 'other';
  document_name: string;
  file?: File;
  document_url?: string;
  file_size: number;
}

interface GRNFormData {
  grn_number: string;
  grn_date: string;
  grn_time: string;
  po_id: string;
  po_number: string;
  vendor_id: string;
  vendor_name: string;
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
  status: 'draft' | 'under_inspection' | 'partially_accepted' | 'accepted' | 'rejected';
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

const STORAGE_LOCATIONS = [
  'WH-A-RACK-12-BIN-05',
  'WH-A-RACK-13-BIN-02',
  'WH-A-RACK-14-BIN-01',
  'WH-B-RACK-01-BIN-03',
  'WH-B-RACK-02-BIN-04',
  'WH-C-RACK-05-BIN-01',
  'YARD-01',
  'YARD-02',
  'COLD-STORAGE-01'
];

const GRNEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const grnId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchingPO, setSearchingPO] = useState(false);
  const [showPOSearch, setShowPOSearch] = useState(false);
  const [availablePOs, setAvailablePOs] = useState<PurchaseOrder[]>([]);
  const [selectedItemForQC, setSelectedItemForQC] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<GRNFormData>({
    grn_number: '',
    grn_date: new Date().toISOString().split('T')[0],
    grn_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    po_id: '',
    po_number: '',
    vendor_id: '',
    vendor_name: '',
    receipt_date: new Date().toISOString().split('T')[0],
    receipt_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    received_by: 'Current User',
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
    status: 'draft',
    notes: ''
  });

  // Load existing GRN data
  useEffect(() => {
    let cancelled = false;
    const fetchGRNData = async () => {
      setLoading(true);
      const applyMock = () => {
        const mockData: GRNFormData = {
          grn_number: 'GRN-2025-00123',
          grn_date: '2025-01-15',
          grn_time: '10:30',
          po_id: 'PO-2025-00089',
          po_number: 'PO-2025-00089',
          vendor_id: 'V001',
          vendor_name: 'Tata Steel Limited',
          receipt_date: '2025-01-15',
          receipt_time: '10:30',
          received_by: 'Suresh Patil',
          gate_entry_no: 'GE-2025-00456',
          invoice_number: 'TSL/2025/00789',
          invoice_date: '2025-01-14',
          invoice_value: 545000,
          transporter_name: 'Blue Dart Logistics',
          vehicle_number: 'MH-12-AB-1234',
          driver_name: 'Ramesh Singh',
          driver_mobile: '+91 98765 12345',
          lr_number: 'BD/LR/2025/12345',
          lr_date: '2025-01-14',
          freight_charges: 5000,
          freight_paid_by: 'vendor',
          line_items: [
            {
              id: 'LI-001',
              item_code: 'RM-STEEL-001',
              item_name: 'Cold Rolled Steel Sheet',
              description: 'Cold Rolled Steel Sheet, Grade: CR4, Thickness: 1.5mm',
              unit: 'KG',
              po_quantity: 5000,
              previously_received: 0,
              pending_quantity: 5000,
              received_quantity: 4850,
              accepted_quantity: 0,
              rejected_quantity: 0,
              batch_number: 'BATCH-CR4-2025-01',
              lot_number: 'LOT-TS-00123',
              storage_location: 'WH-A-RACK-12-BIN-05',
              unit_price: 95,
              qc_required: true,
              qc_status: 'pending'
            },
            {
              id: 'LI-002',
              item_code: 'RM-STEEL-002',
              item_name: 'Galvanized Steel Coil',
              description: 'Galvanized Steel Coil, Grade: GI, Width: 1200mm',
              unit: 'KG',
              po_quantity: 3000,
              previously_received: 0,
              pending_quantity: 3000,
              received_quantity: 3000,
              accepted_quantity: 0,
              rejected_quantity: 0,
              batch_number: 'BATCH-GI-2025-01',
              lot_number: 'LOT-TS-00124',
              storage_location: 'WH-A-RACK-13-BIN-02',
              unit_price: 110,
              qc_required: true,
              qc_status: 'pending'
            }
          ],
          quality_inspections: [],
          documents: [],
          status: 'draft',
          notes: ''
        };

        setFormData(mockData);
      };

      try {
        const raw = (await goodsReceiptService.getGoodsReceiptById(grnId)) as any;
        if (cancelled) return;
        if (raw && (raw.id || raw.grnNumber)) {
          setFormData((prev) => ({
            ...prev,
            grn_number: raw.grnNumber ?? prev.grn_number,
            grn_date: (raw.receiptDate ?? raw.grnDate ?? prev.grn_date)?.toString().slice(0, 10),
            po_id: raw.poId ?? raw.poNumber ?? prev.po_id,
            po_number: raw.poNumber ?? prev.po_number,
            vendor_id: raw.vendorId ?? prev.vendor_id,
            vendor_name: raw.vendorName ?? prev.vendor_name,
            receipt_date: (raw.deliveryDate ?? raw.receiptDate ?? prev.receipt_date)?.toString().slice(0, 10),
            invoice_number: raw.deliveryNoteNumber ?? prev.invoice_number,
            status: ((): GRNFormData['status'] => {
              const s = String(raw.status ?? '').toLowerCase();
              const allowed: GRNFormData['status'][] = ['draft', 'under_inspection', 'partially_accepted', 'accepted', 'rejected'];
              return (allowed as string[]).includes(s) ? (s as GRNFormData['status']) : prev.status;
            })(),
            notes: raw.notes ?? prev.notes,
            line_items: Array.isArray(raw.items) && raw.items.length
              ? raw.items.map((it: any, idx: number) => ({
                  ...(prev.line_items[idx] ?? prev.line_items[0]),
                  id: it.id ?? String(idx),
                  item_code: it.itemCode ?? prev.line_items[idx]?.item_code ?? '',
                  item_name: it.itemName ?? prev.line_items[idx]?.item_name ?? '',
                  received_quantity: Number(it.receivedQuantity ?? 0),
                  accepted_quantity: Number(it.acceptedQuantity ?? 0),
                  rejected_quantity: Number(it.rejectedQuantity ?? 0),
                  batch_number: it.batchNumber ?? '',
                }))
              : prev.line_items,
          }));
        } else {
          applyMock();
        }
      } catch {
        if (!cancelled) applyMock();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchGRNData();
    return () => { cancelled = true; };
  }, [grnId]);

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
    if (field === 'received_quantity' || field === 'accepted_quantity') {
      const received = field === 'received_quantity' ? Number(value) : newLineItems[index].received_quantity;
      const accepted = field === 'accepted_quantity' ? Number(value) : newLineItems[index].accepted_quantity;
      newLineItems[index].rejected_quantity = received - accepted;
    }

    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const handleQCParameterChange = (itemId: string, paramIndex: number, field: string, value: any) => {
    const newQCInspections = [...formData.quality_inspections];
    const qcIndex = newQCInspections.findIndex(qc => qc.item_id === itemId);

    if (qcIndex !== -1) {
      const newParams = [...newQCInspections[qcIndex].parameters];
      newParams[paramIndex] = { ...newParams[paramIndex], [field]: value };

      // Auto-update status based on actual value vs criteria (simple logic)
      if (field === 'actual_value' && value) {
        newParams[paramIndex].status = 'pass'; // In real app, compare with acceptance criteria
      }

      newQCInspections[qcIndex].parameters = newParams;

      // Update overall status
      const allPassed = newParams.every(p => p.status === 'pass');
      const anyFailed = newParams.some(p => p.status === 'fail');
      newQCInspections[qcIndex].overall_status = anyFailed ? 'fail' : allPassed ? 'pass' : 'pending';

      setFormData(prev => ({ ...prev, quality_inspections: newQCInspections }));
    }
  };

  const addQCParameter = (itemId: string) => {
    const newQCInspections = [...formData.quality_inspections];
    const qcIndex = newQCInspections.findIndex(qc => qc.item_id === itemId);

    if (qcIndex !== -1) {
      const newParam: QualityParameter = {
        id: `QP-${Date.now()}`,
        parameter_name: '',
        test_method: '',
        acceptance_criteria: '',
        actual_value: '',
        unit: '',
        status: 'pending',
        remarks: ''
      };

      newQCInspections[qcIndex].parameters.push(newParam);
      setFormData(prev => ({ ...prev, quality_inspections: newQCInspections }));
    }
  };

  const removeQCParameter = (itemId: string, paramIndex: number) => {
    const newQCInspections = [...formData.quality_inspections];
    const qcIndex = newQCInspections.findIndex(qc => qc.item_id === itemId);

    if (qcIndex !== -1) {
      newQCInspections[qcIndex].parameters.splice(paramIndex, 1);
      setFormData(prev => ({ ...prev, quality_inspections: newQCInspections }));
    }
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

    // Validate line items
    formData.line_items.forEach((item, index) => {
      if (item.received_quantity > item.pending_quantity) {
        newErrors[`line_item_${index}_received`] = 'Received quantity cannot exceed pending quantity';
      }
      if (item.received_quantity < 0) {
        newErrors[`line_item_${index}_received`] = 'Received quantity cannot be negative';
      }
      if (item.rejected_quantity > 0 && !item.rejection_reason) {
        newErrors[`line_item_${index}_rejection`] = 'Rejection reason is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (saveType: 'draft' | 'submit') => {
    if (!validateForm()) {
      alert('Please fix all validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      await goodsReceiptService.updateGoodsReceipt(grnId, {
        deliveryNoteNumber: formData.invoice_number || undefined,
        notes: formData.notes || undefined,
        items: formData.line_items.map((li) => ({
          id: li.id,
          receivedQuantity: Number(li.received_quantity ?? 0),
          batchNumber: li.batch_number || undefined,
          locationId: li.storage_location || undefined,
        })),
      });
      alert(`GRN ${saveType === 'draft' ? 'saved as draft' : 'submitted for inspection'} successfully!`);
      router.push(`/procurement/grn/view/${grnId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save GRN');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push(`/procurement/grn/view/${grnId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mb-2" />
          <p className="text-gray-600">Loading GRN data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/procurement/grn/view/${grnId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit GRN</h1>
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
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSubmit('submit')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Submit for QC'}
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-900 font-medium">Editing Mode - Draft Status</span>
              <span className="text-blue-700">Last saved: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* PO and Vendor Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Purchase Order Details
          </h2>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.po_number}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
              <input
                type="text"
                value={formData.vendor_name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GRN Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.grn_date}
                onChange={(e) => handleInputChange('grn_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Receipt Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.receipt_date ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.receipt_date && <p className="text-xs text-red-500 mt-1">{errors.receipt_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.receipt_time}
                onChange={(e) => handleInputChange('receipt_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received By</label>
              <input
                type="text"
                value={formData.received_by}
                onChange={(e) => handleInputChange('received_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gate Entry No</label>
              <input
                type="text"
                value={formData.gate_entry_no}
                onChange={(e) => handleInputChange('gate_entry_no', e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.invoice_number ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.invoice_number && <p className="text-xs text-red-500 mt-1">{errors.invoice_number}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.invoice_date ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.invoice_date && <p className="text-xs text-red-500 mt-1">{errors.invoice_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.invoice_value}
                onChange={(e) => handleInputChange('invoice_value', parseFloat(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.invoice_value ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.invoice_value && <p className="text-xs text-red-500 mt-1">{errors.invoice_value}</p>}
            </div>
          </div>
        </div>

        {/* Transporter Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                placeholder="MH-12-AB-1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
              <input
                type="text"
                value={formData.driver_name}
                onChange={(e) => handleInputChange('driver_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Mobile</label>
              <input
                type="tel"
                value={formData.driver_mobile}
                onChange={(e) => handleInputChange('driver_mobile', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LR Number</label>
              <input
                type="text"
                value={formData.lr_number}
                onChange={(e) => handleInputChange('lr_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LR Date</label>
              <input
                type="date"
                value={formData.lr_date}
                onChange={(e) => handleInputChange('lr_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Freight Charges</label>
              <input
                type="number"
                value={formData.freight_charges}
                onChange={(e) => handleInputChange('freight_charges', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Freight Paid By</label>
              <select
                value={formData.freight_paid_by}
                onChange={(e) => handleInputChange('freight_paid_by', e.target.value as 'vendor' | 'company')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vendor">Vendor</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Line Items
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Item</th>
                  <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">Unit</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Ordered</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Prev. Recv.</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Pending</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Receiving</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Accepted</th>
                  <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b">Rejected</th>
                  <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Rejection Reason</th>
                  <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b">Storage Location</th>
                  <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b">QC</th>
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
                    <td className="p-3 border-b text-center text-sm text-gray-700">{item.unit}</td>
                    <td className="p-3 border-b text-right text-sm text-gray-700">
                      {item.po_quantity.toLocaleString()}
                    </td>
                    <td className="p-3 border-b text-right text-sm text-gray-500">
                      {item.previously_received.toLocaleString()}
                    </td>
                    <td className="p-3 border-b text-right text-sm font-medium text-blue-700">
                      {item.pending_quantity.toLocaleString()}
                    </td>
                    <td className="p-3 border-b">
                      <input
                        type="number"
                        value={item.received_quantity}
                        onChange={(e) => handleLineItemChange(index, 'received_quantity', parseFloat(e.target.value))}
                        max={item.pending_quantity}
                        className={`w-24 px-2 py-1 border rounded text-sm text-right focus:ring-2 focus:ring-blue-500 ${errors[`line_item_${index}_received`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                    </td>
                    <td className="p-3 border-b">
                      <input
                        type="number"
                        value={item.accepted_quantity}
                        onChange={(e) => handleLineItemChange(index, 'accepted_quantity', parseFloat(e.target.value))}
                        max={item.received_quantity}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-3 border-b text-right text-sm font-medium text-red-600">
                      {item.rejected_quantity}
                    </td>
                    <td className="p-3 border-b">
                      {item.rejected_quantity > 0 && (
                        <select
                          value={item.rejection_reason || ''}
                          onChange={(e) => handleLineItemChange(index, 'rejection_reason', e.target.value)}
                          className={`w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${errors[`line_item_${index}_rejection`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                          <option value="">Select reason...</option>
                          {REJECTION_REASONS.map(reason => (
                            <option key={reason.value} value={reason.value}>{reason.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="p-3 border-b">
                      <select
                        value={item.storage_location}
                        onChange={(e) => handleLineItemChange(index, 'storage_location', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        {STORAGE_LOCATIONS.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 border-b text-center">
                      {item.qc_required && (
                        <button
                          onClick={() => setSelectedItemForQC(item.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Setup QC
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Certificate</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentUpload('test_certificate', e.target.files)}
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
              <h3 className="text-sm font-medium text-gray-700">Uploaded Documents</h3>
              <div className="grid grid-cols-2 gap-2">
                {formData.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-gray-600" />
            Notes
          </h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            placeholder="Add any additional notes or comments..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mb-3">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit('submit')}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Submit for QC'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GRNEditPage;
