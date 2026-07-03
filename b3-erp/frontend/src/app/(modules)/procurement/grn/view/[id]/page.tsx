'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exportToCsv, printCurrentView } from '@/lib/export';
import {
  Package,
  FileText,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Truck,
  FileCheck,
  Upload,
  Download,
  Edit,
  Send,
  RotateCcw,
  Archive,
  Receipt,
  ClipboardCheck,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Eye,
  Printer,
  Mail,
  Share2,
  MoreVertical,
  ExternalLink,
  Image as ImageIcon,
  FileImage,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Info,
  DollarSign,
  Layers,
  Box,
  CheckSquare,
  XSquare,
  MinusSquare,
  Hash,
  MapPin,
  Building2,
  Phone,
  Mail as MailIcon,
  Globe,
  CreditCard,
  Banknote,
  CircleDollarSign
} from 'lucide-react';

// TypeScript Interfaces
interface QualityParameter {
  id: string;
  parameter_name: string;
  test_method: string;
  acceptance_criteria: string;
  actual_value: string;
  unit: string;
  status: 'pass' | 'fail' | 'pending';
  tested_at: string;
  remarks?: string;
}

interface QualityInspection {
  id: string;
  grn_line_item_id: string;
  item_code: string;
  item_name: string;
  inspector_name: string;
  inspector_id: string;
  inspection_date: string;
  sample_size: number;
  lot_number: string;
  batch_number: string;
  overall_status: 'pass' | 'fail' | 'pending' | 'conditional_pass';
  parameters: QualityParameter[];
  defect_details?: string;
  defect_category?: 'critical' | 'major' | 'minor';
  defect_count?: number;
  qc_report_url?: string;
  sign_off_status: boolean;
  sign_off_date?: string;
  remarks: string;
  disposition: 'accept' | 'reject' | 'rework' | 'use_as_is' | 'pending';
}

interface GRNLineItem {
  id: string;
  item_code: string;
  item_name: string;
  description: string;
  unit: string;
  po_quantity: number;
  received_quantity: number;
  accepted_quantity: number;
  rejected_quantity: number;
  rejection_reason?: string;
  variance: number;
  variance_percentage: number;
  batch_number?: string;
  lot_number?: string;
  storage_location: string;
  expiry_date?: string;
  unit_price: number;
  total_value: number;
  qc_required: boolean;
  qc_status?: 'pending' | 'pass' | 'fail';
  qc_inspector?: string;
  remarks?: string;
}

interface GRNDocument {
  id: string;
  document_type: 'invoice' | 'packing_list' | 'test_certificate' | 'photo' | 'lr_copy' | 'other';
  document_name: string;
  document_url: string;
  uploaded_by: string;
  uploaded_at: string;
  file_size: number;
}

interface TransporterDetails {
  name: string;
  vehicle_number: string;
  driver_name: string;
  driver_mobile: string;
  lr_number: string;
  lr_date: string;
  freight_charges?: number;
  freight_paid_by?: 'vendor' | 'company';
}

interface VendorDetails {
  id: string;
  vendor_code: string;
  vendor_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  gstin: string;
  pan: string;
  rating: number;
  performance_score: number;
}

interface GRNData {
  id: string;
  grn_number: string;
  grn_date: string;
  grn_time: string;
  po_id: string;
  po_number: string;
  po_date: string;
  vendor_id: string;
  vendor: VendorDetails;
  status: 'draft' | 'under_inspection' | 'partially_accepted' | 'accepted' | 'rejected' | 'invoice_matched';
  receipt_date: string;
  receipt_time: string;
  received_by: string;
  received_by_id: string;
  gate_entry_no?: string;
  invoice_number: string;
  invoice_date: string;
  invoice_value: number;
  currency: string;
  transporter: TransporterDetails;
  line_items: GRNLineItem[];
  quality_inspections: QualityInspection[];
  documents: GRNDocument[];
  total_ordered_qty: number;
  total_received_qty: number;
  total_accepted_qty: number;
  total_rejected_qty: number;
  total_value: number;
  tax_amount: number;
  grand_total: number;
  price_variance: number;
  qty_variance: number;
  discrepancy_notes?: string;
  posted_to_inventory: boolean;
  inventory_posting_date?: string;
  invoice_matched: boolean;
  invoice_matching_date?: string;
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
}

interface ProgressStep {
  name: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  date?: string;
}

const GRNViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const grnId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'line_items' | 'quality_inspection'>('overview');
  const [loading, setLoading] = useState(true);
  const [grnData, setGrnData] = useState<GRNData | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedQCItem, setSelectedQCItem] = useState<string | null>(null);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchGRNData = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData: GRNData = {
          id: grnId,
          grn_number: 'GRN-2025-00123',
          grn_date: '2025-01-15',
          grn_time: '10:30 AM',
          po_id: 'PO-2025-00089',
          po_number: 'PO-2025-00089',
          po_date: '2025-01-10',
          vendor_id: 'V001',
          vendor: {
            id: 'V001',
            vendor_code: 'V001',
            vendor_name: 'Tata Steel Limited',
            contact_person: 'Rajesh Kumar',
            email: 'rajesh.kumar@tatasteel.com',
            phone: '+91 98765 43210',
            address: 'Steel Plant Road, Industrial Area',
            city: 'Jamshedpur',
            state: 'Jharkhand',
            gstin: '20AAACT2727Q1ZV',
            pan: 'AAACT2727Q',
            rating: 4.5,
            performance_score: 92
          },
          status: 'under_inspection',
          receipt_date: '2025-01-15',
          receipt_time: '10:30 AM',
          received_by: 'Suresh Patil',
          received_by_id: 'EMP-234',
          gate_entry_no: 'GE-2025-00456',
          invoice_number: 'TSL/2025/00789',
          invoice_date: '2025-01-14',
          invoice_value: 545000,
          currency: 'INR',
          transporter: {
            name: 'Blue Dart Logistics',
            vehicle_number: 'MH-12-AB-1234',
            driver_name: 'Ramesh Singh',
            driver_mobile: '+91 98765 12345',
            lr_number: 'BD/LR/2025/12345',
            lr_date: '2025-01-14',
            freight_charges: 5000,
            freight_paid_by: 'vendor'
          },
          line_items: [
            {
              id: 'LI-001',
              item_code: 'RM-STEEL-001',
              item_name: 'Cold Rolled Steel Sheet',
              description: 'Cold Rolled Steel Sheet, Grade: CR4, Thickness: 1.5mm',
              unit: 'KG',
              po_quantity: 5000,
              received_quantity: 4850,
              accepted_quantity: 4700,
              rejected_quantity: 150,
              rejection_reason: 'Surface defects and rust marks',
              variance: -150,
              variance_percentage: -3.0,
              batch_number: 'BATCH-CR4-2025-01',
              lot_number: 'LOT-TS-00123',
              storage_location: 'WH-A-RACK-12-BIN-05',
              expiry_date: undefined,
              unit_price: 95,
              total_value: 460750,
              qc_required: true,
              qc_status: 'pass',
              qc_inspector: 'Amit Deshmukh'
            },
            {
              id: 'LI-002',
              item_code: 'RM-STEEL-002',
              item_name: 'Galvanized Steel Coil',
              description: 'Galvanized Steel Coil, Grade: GI, Width: 1200mm',
              unit: 'KG',
              po_quantity: 3000,
              received_quantity: 3000,
              accepted_quantity: 0,
              rejected_quantity: 0,
              variance: 0,
              variance_percentage: 0,
              batch_number: 'BATCH-GI-2025-01',
              lot_number: 'LOT-TS-00124',
              storage_location: 'WH-A-RACK-13-BIN-02',
              unit_price: 110,
              total_value: 330000,
              qc_required: true,
              qc_status: 'pending',
              qc_inspector: 'Amit Deshmukh'
            },
            {
              id: 'LI-003',
              item_code: 'RM-STEEL-003',
              item_name: 'Stainless Steel Rod',
              description: 'Stainless Steel Rod, Grade: SS304, Diameter: 12mm',
              unit: 'MTR',
              po_quantity: 1000,
              received_quantity: 1000,
              accepted_quantity: 1000,
              rejected_quantity: 0,
              variance: 0,
              variance_percentage: 0,
              batch_number: 'BATCH-SS-2025-01',
              lot_number: 'LOT-TS-00125',
              storage_location: 'WH-A-RACK-14-BIN-01',
              unit_price: 250,
              total_value: 250000,
              qc_required: true,
              qc_status: 'pass',
              qc_inspector: 'Priya Sharma'
            }
          ],
          quality_inspections: [
            {
              id: 'QC-001',
              grn_line_item_id: 'LI-001',
              item_code: 'RM-STEEL-001',
              item_name: 'Cold Rolled Steel Sheet',
              inspector_name: 'Amit Deshmukh',
              inspector_id: 'EMP-QC-045',
              inspection_date: '2025-01-15',
              sample_size: 50,
              lot_number: 'LOT-TS-00123',
              batch_number: 'BATCH-CR4-2025-01',
              overall_status: 'pass',
              parameters: [
                {
                  id: 'QP-001',
                  parameter_name: 'Thickness',
                  test_method: 'Micrometer Measurement',
                  acceptance_criteria: '1.5mm ± 0.05mm',
                  actual_value: '1.48',
                  unit: 'mm',
                  status: 'pass',
                  tested_at: '2025-01-15 11:00 AM'
                },
                {
                  id: 'QP-002',
                  parameter_name: 'Surface Finish',
                  test_method: 'Visual Inspection',
                  acceptance_criteria: 'No scratches, rust, or defects',
                  actual_value: 'Minor scratches on 3% samples',
                  unit: '-',
                  status: 'fail',
                  tested_at: '2025-01-15 11:15 AM',
                  remarks: '150 kg rejected due to surface defects'
                },
                {
                  id: 'QP-003',
                  parameter_name: 'Hardness',
                  test_method: 'Rockwell Hardness Test',
                  acceptance_criteria: '60-70 HRB',
                  actual_value: '65',
                  unit: 'HRB',
                  status: 'pass',
                  tested_at: '2025-01-15 11:30 AM'
                },
                {
                  id: 'QP-004',
                  parameter_name: 'Tensile Strength',
                  test_method: 'Universal Testing Machine',
                  acceptance_criteria: '≥ 350 MPa',
                  actual_value: '385',
                  unit: 'MPa',
                  status: 'pass',
                  tested_at: '2025-01-15 12:00 PM'
                },
                {
                  id: 'QP-005',
                  parameter_name: 'Width',
                  test_method: 'Measuring Tape',
                  acceptance_criteria: '1200mm ± 2mm',
                  actual_value: '1201',
                  unit: 'mm',
                  status: 'pass',
                  tested_at: '2025-01-15 12:15 PM'
                }
              ],
              defect_details: 'Surface defects found: Scratches (2%), Rust marks (1%), Total affected: 150 kg',
              defect_category: 'minor',
              defect_count: 3,
              qc_report_url: '/uploads/qc-reports/QC-001.pdf',
              sign_off_status: true,
              sign_off_date: '2025-01-15 14:30 PM',
              remarks: 'Partially accepted. 4700 kg accepted, 150 kg rejected due to surface quality issues.',
              disposition: 'accept'
            },
            {
              id: 'QC-002',
              grn_line_item_id: 'LI-002',
              item_code: 'RM-STEEL-002',
              item_name: 'Galvanized Steel Coil',
              inspector_name: 'Amit Deshmukh',
              inspector_id: 'EMP-QC-045',
              inspection_date: '2025-01-15',
              sample_size: 30,
              lot_number: 'LOT-TS-00124',
              batch_number: 'BATCH-GI-2025-01',
              overall_status: 'pending',
              parameters: [
                {
                  id: 'QP-006',
                  parameter_name: 'Zinc Coating Thickness',
                  test_method: 'Magnetic Thickness Gauge',
                  acceptance_criteria: '≥ 80 μm',
                  actual_value: 'Pending',
                  unit: 'μm',
                  status: 'pending',
                  tested_at: '2025-01-15 02:00 PM'
                },
                {
                  id: 'QP-007',
                  parameter_name: 'Coating Adhesion',
                  test_method: 'Bend Test',
                  acceptance_criteria: 'No flaking or cracking',
                  actual_value: 'Pending',
                  unit: '-',
                  status: 'pending',
                  tested_at: '2025-01-15 02:30 PM'
                },
                {
                  id: 'QP-008',
                  parameter_name: 'Surface Appearance',
                  test_method: 'Visual Inspection',
                  acceptance_criteria: 'Uniform, smooth finish',
                  actual_value: 'Pending',
                  unit: '-',
                  status: 'pending',
                  tested_at: '2025-01-15 02:45 PM'
                }
              ],
              sign_off_status: false,
              remarks: 'Inspection in progress. Expected completion by EOD.',
              disposition: 'pending'
            },
            {
              id: 'QC-003',
              grn_line_item_id: 'LI-003',
              item_code: 'RM-STEEL-003',
              item_name: 'Stainless Steel Rod',
              inspector_name: 'Priya Sharma',
              inspector_id: 'EMP-QC-067',
              inspection_date: '2025-01-15',
              sample_size: 20,
              lot_number: 'LOT-TS-00125',
              batch_number: 'BATCH-SS-2025-01',
              overall_status: 'pass',
              parameters: [
                {
                  id: 'QP-009',
                  parameter_name: 'Diameter',
                  test_method: 'Vernier Caliper',
                  acceptance_criteria: '12mm ± 0.1mm',
                  actual_value: '12.05',
                  unit: 'mm',
                  status: 'pass',
                  tested_at: '2025-01-15 03:00 PM'
                },
                {
                  id: 'QP-010',
                  parameter_name: 'Surface Finish',
                  test_method: 'Visual Inspection',
                  acceptance_criteria: 'Smooth, no pits or scratches',
                  actual_value: 'Excellent',
                  unit: '-',
                  status: 'pass',
                  tested_at: '2025-01-15 03:15 PM'
                },
                {
                  id: 'QP-011',
                  parameter_name: 'Chemical Composition',
                  test_method: 'XRF Analysis',
                  acceptance_criteria: 'SS304 Grade (18% Cr, 8% Ni)',
                  actual_value: 'Cr: 18.2%, Ni: 8.1%',
                  unit: '%',
                  status: 'pass',
                  tested_at: '2025-01-15 03:45 PM'
                },
                {
                  id: 'QP-012',
                  parameter_name: 'Straightness',
                  test_method: 'Straight Edge Method',
                  acceptance_criteria: '≤ 1mm per meter',
                  actual_value: '0.5',
                  unit: 'mm/m',
                  status: 'pass',
                  tested_at: '2025-01-15 04:00 PM'
                }
              ],
              sign_off_status: true,
              sign_off_date: '2025-01-15 04:30 PM',
              remarks: 'All parameters within specification. Material approved for production use.',
              disposition: 'accept'
            }
          ],
          documents: [
            {
              id: 'DOC-001',
              document_type: 'invoice',
              document_name: 'Invoice_TSL_2025_00789.pdf',
              document_url: '/uploads/grn/GRN-2025-00123/invoice.pdf',
              uploaded_by: 'Suresh Patil',
              uploaded_at: '2025-01-15 10:45 AM',
              file_size: 245000
            },
            {
              id: 'DOC-002',
              document_type: 'packing_list',
              document_name: 'Packing_List_TSL.pdf',
              document_url: '/uploads/grn/GRN-2025-00123/packing_list.pdf',
              uploaded_by: 'Suresh Patil',
              uploaded_at: '2025-01-15 10:47 AM',
              file_size: 189000
            },
            {
              id: 'DOC-003',
              document_type: 'test_certificate',
              document_name: 'Mill_Test_Certificate.pdf',
              document_url: '/uploads/grn/GRN-2025-00123/mtc.pdf',
              uploaded_by: 'Amit Deshmukh',
              uploaded_at: '2025-01-15 11:30 AM',
              file_size: 512000
            },
            {
              id: 'DOC-004',
              document_type: 'photo',
              document_name: 'Material_Photo_1.jpg',
              document_url: '/uploads/grn/GRN-2025-00123/photo1.jpg',
              uploaded_by: 'Suresh Patil',
              uploaded_at: '2025-01-15 10:35 AM',
              file_size: 1024000
            },
            {
              id: 'DOC-005',
              document_type: 'photo',
              document_name: 'Material_Photo_2.jpg',
              document_url: '/uploads/grn/GRN-2025-00123/photo2.jpg',
              uploaded_by: 'Suresh Patil',
              uploaded_at: '2025-01-15 10:36 AM',
              file_size: 987000
            },
            {
              id: 'DOC-006',
              document_type: 'lr_copy',
              document_name: 'LR_Copy_BD_2025_12345.pdf',
              document_url: '/uploads/grn/GRN-2025-00123/lr_copy.pdf',
              uploaded_by: 'Suresh Patil',
              uploaded_at: '2025-01-15 10:50 AM',
              file_size: 156000
            }
          ],
          total_ordered_qty: 9000,
          total_received_qty: 8850,
          total_accepted_qty: 5700,
          total_rejected_qty: 150,
          total_value: 1040750,
          tax_amount: 187335,
          grand_total: 1228085,
          price_variance: 5000,
          qty_variance: -150,
          discrepancy_notes: 'Quantity shortage: 150 kg of Cold Rolled Steel Sheet. Surface quality issues noted.',
          posted_to_inventory: false,
          invoice_matched: false,
          created_by: 'Suresh Patil',
          created_at: '2025-01-15 10:30 AM',
          updated_by: 'Amit Deshmukh',
          updated_at: '2025-01-15 04:30 PM',
          notes: 'First GRN for this vendor this month. Partial rejection due to surface quality issues.'
        };

        setGrnData(mockData);
        setLoading(false);
      }, 1000);
    };

    fetchGRNData();
  }, [grnId]);

  // Calculate progress steps
  const getProgressSteps = (): ProgressStep[] => {
    if (!grnData) return [];

    const steps: ProgressStep[] = [
      {
        name: 'Draft',
        status: 'completed',
        date: grnData.created_at
      },
      {
        name: 'Under Inspection',
        status: grnData.status === 'under_inspection' ? 'current' :
          grnData.status === 'draft' ? 'pending' : 'completed',
        date: grnData.status !== 'draft' ? grnData.updated_at : undefined
      },
      {
        name: 'QC Result',
        status: grnData.status === 'rejected' ? 'failed' :
          grnData.status === 'partially_accepted' || grnData.status === 'accepted' ? 'completed' :
            'pending'
      },
      {
        name: grnData.status === 'rejected' ? 'Rejected' : 'Accepted',
        status: grnData.status === 'accepted' || grnData.status === 'invoice_matched' ? 'completed' :
          grnData.status === 'rejected' ? 'failed' :
            grnData.status === 'partially_accepted' ? 'completed' :
              'pending',
        date: grnData.approved_at
      },
      {
        name: 'Invoice Matched',
        status: grnData.invoice_matched ? 'completed' : 'pending',
        date: grnData.invoice_matching_date
      }
    ];

    return steps;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'under_inspection':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'partially_accepted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'invoice_matched':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getQCStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'fail':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'conditional_pass':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleEdit = () => {
    router.push(`/procurement/grn/edit/${grnId}`);
  };

  const handleSubmitForQC = () => {
    alert('Submit for QC functionality will be implemented');
  };

  const handleAccept = () => {
    alert('Accept GRN functionality will be implemented');
  };

  const handleReject = () => {
    alert('Reject GRN functionality will be implemented');
  };

  const handlePartialAccept = () => {
    alert('Partial Accept functionality will be implemented');
  };

  const handleCreateReturn = () => {
    alert('Create Return functionality will be implemented');
  };

  const handlePostToInventory = () => {
    alert('Post to Inventory functionality will be implemented');
  };

  const handleMatchWithInvoice = () => {
    alert('Match with Invoice functionality will be implemented');
  };

  const handlePrint = () => {
    printCurrentView();
  };

  const handleExport = () => {
    exportToCsv('grn-line-items', (grnData?.line_items ?? []) as unknown as Record<string, unknown>[]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading GRN details...</p>
        </div>
      </div>
    );
  }

  if (!grnData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">GRN Not Found</h2>
          <p className="text-gray-600 mb-2">The requested GRN could not be found.</p>
          <button
            onClick={() => router.push('/procurement/grn')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to GRN List
          </button>
        </div>
      </div>
    );
  }

  const progressSteps = getProgressSteps();

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{grnData.grn_number}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(grnData.status)}`}>
                  {grnData.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>GRN Date: {grnData.grn_date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <button
                    onClick={() => router.push(`/procurement/purchase-orders/view/${grnData.po_id}`)}
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    PO: {grnData.po_number}
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>Vendor: {grnData.vendor.vendor_name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Actions
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {grnData.status === 'draft' && (
                      <>
                        <button
                          onClick={handleEdit}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit GRN
                        </button>
                        <button
                          onClick={handleSubmitForQC}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <Send className="w-4 h-4" />
                          Submit for QC
                        </button>
                      </>
                    )}
                    {grnData.status === 'under_inspection' && (
                      <>
                        <button
                          onClick={handleAccept}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept All
                        </button>
                        <button
                          onClick={handlePartialAccept}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-yellow-600"
                        >
                          <MinusSquare className="w-4 h-4" />
                          Partial Accept
                        </button>
                        <button
                          onClick={handleReject}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject All
                        </button>
                      </>
                    )}
                    {(grnData.status === 'accepted' || grnData.status === 'partially_accepted') && (
                      <>
                        {!grnData.posted_to_inventory && (
                          <button
                            onClick={handlePostToInventory}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <Archive className="w-4 h-4" />
                            Post to Inventory
                          </button>
                        )}
                        {!grnData.invoice_matched && (
                          <button
                            onClick={handleMatchWithInvoice}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                          >
                            <Receipt className="w-4 h-4" />
                            Match with Invoice
                          </button>
                        )}
                        <button
                          onClick={handleCreateReturn}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Create Return
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">Ordered Qty</span>
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-900">{grnData.total_ordered_qty.toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-1">As per PO</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-700">Received Qty</span>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-900">{grnData.total_received_qty.toLocaleString()}</p>
              <p className="text-xs text-purple-600 mt-1">
                {grnData.qty_variance >= 0 ? '+' : ''}{grnData.qty_variance} variance
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Accepted Qty</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-900">{grnData.total_accepted_qty.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">
                {((grnData.total_accepted_qty / grnData.total_received_qty) * 100).toFixed(1)}% of received
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">Rejected Qty</span>
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-900">{grnData.total_rejected_qty.toLocaleString()}</p>
              <p className="text-xs text-red-600 mt-1">
                {((grnData.total_rejected_qty / grnData.total_received_qty) * 100).toFixed(1)}% of received
              </p>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">GRN Progress</h3>
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step.status === 'completed'
                          ? 'bg-green-500 text-white'
                          : step.status === 'current'
                            ? 'bg-blue-500 text-white animate-pulse'
                            : step.status === 'failed'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-300 text-gray-500'
                        }`}
                    >
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : step.status === 'failed' ? (
                        <XCircle className="w-5 h-5" />
                      ) : step.status === 'current' ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">{step.name}</span>
                    {step.date && (
                      <span className="text-xs text-gray-500 mt-1">{step.date}</span>
                    )}
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 mb-8 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Discrepancy Alerts */}
          {(grnData.qty_variance !== 0 || grnData.total_rejected_qty > 0 || grnData.price_variance !== 0) && (
            <div className="mt-4 space-y-2">
              {grnData.qty_variance < 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Quantity Variance</p>
                    <p className="text-xs text-yellow-700">
                      Received quantity is {Math.abs(grnData.qty_variance)} units less than ordered.
                      Variance: {((grnData.qty_variance / grnData.total_ordered_qty) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
              {grnData.total_rejected_qty > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Quality Issues Detected</p>
                    <p className="text-xs text-red-700">
                      {grnData.total_rejected_qty} units rejected due to quality issues.
                      Rejection rate: {((grnData.total_rejected_qty / grnData.total_received_qty) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              )}
              {grnData.price_variance !== 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded flex items-start gap-2">
                  <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Price Variance</p>
                    <p className="text-xs text-orange-700">
                      Invoice value differs from PO value by {grnData.currency} {Math.abs(grnData.price_variance).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex gap-3 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('line_items')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'line_items'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
              >
                Line Items ({grnData.line_items.length})
              </button>
              <button
                onClick={() => setActiveTab('quality_inspection')}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'quality_inspection'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
              >
                Quality Inspection
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                {/* Vendor Details */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Vendor Details
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Vendor Code</label>
                      <p className="text-sm font-semibold text-gray-900">{grnData.vendor.vendor_code}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Vendor Name</label>
                      <p className="text-sm font-semibold text-gray-900">{grnData.vendor.vendor_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Contact Person</label>
                      <p className="text-sm font-semibold text-gray-900">{grnData.vendor.contact_person}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <MailIcon className="w-3 h-3 text-gray-400" />
                        {grnData.vendor.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {grnData.vendor.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">GSTIN</label>
                      <p className="text-sm font-mono text-gray-900">{grnData.vendor.gstin}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500">Address</label>
                      <p className="text-sm text-gray-900">
                        {grnData.vendor.address}, {grnData.vendor.city}, {grnData.vendor.state}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Vendor Rating</label>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-lg ${star <= grnData.vendor.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {grnData.vendor.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Receipt Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-600" />
                      Receipt Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PO Reference</span>
                        <button
                          onClick={() => router.push(`/procurement/purchase-orders/view/${grnData.po_id}`)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          {grnData.po_number}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PO Date</span>
                        <span className="text-sm font-medium text-gray-900">{grnData.po_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Receipt Date</span>
                        <span className="text-sm font-medium text-gray-900">{grnData.receipt_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Receipt Time</span>
                        <span className="text-sm font-medium text-gray-900">{grnData.receipt_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Received By</span>
                        <span className="text-sm font-medium text-gray-900">{grnData.received_by}</span>
                      </div>
                      {grnData.gate_entry_no && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Gate Entry No</span>
                          <span className="text-sm font-medium text-gray-900">{grnData.gate_entry_no}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-purple-600" />
                      Invoice Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Invoice Number</span>
                        <span className="text-sm font-medium text-gray-900">{grnData.invoice_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Invoice Date</span>
                        <span className="text-sm font-medium text-gray-900">{grnData.invoice_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Invoice Value</span>
                        <span className="text-sm font-medium text-gray-900">
                          {grnData.currency} {grnData.invoice_value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax Amount</span>
                        <span className="text-sm font-medium text-gray-900">
                          {grnData.currency} {grnData.tax_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="text-sm font-semibold text-gray-700">Grand Total</span>
                        <span className="text-sm font-bold text-gray-900">
                          {grnData.currency} {grnData.grand_total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Invoice Matched</span>
                        <span className={`text-sm font-medium ${grnData.invoice_matched ? 'text-green-600' : 'text-yellow-600'}`}>
                          {grnData.invoice_matched ? 'Yes' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transporter Details */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-600" />
                    Transporter Details
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Transporter Name</label>
                      <p className="text-sm font-semibold text-gray-900">{grnData.transporter.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Vehicle Number</label>
                      <p className="text-sm font-mono text-gray-900">{grnData.transporter.vehicle_number}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Driver Name</label>
                      <p className="text-sm text-gray-900">{grnData.transporter.driver_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Driver Mobile</label>
                      <p className="text-sm text-gray-900">{grnData.transporter.driver_mobile}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">LR Number</label>
                      <p className="text-sm font-mono text-gray-900">{grnData.transporter.lr_number}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">LR Date</label>
                      <p className="text-sm text-gray-900">{grnData.transporter.lr_date}</p>
                    </div>
                    {grnData.transporter.freight_charges && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Freight Charges</label>
                          <p className="text-sm font-semibold text-gray-900">
                            {grnData.currency} {grnData.transporter.freight_charges.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Freight Paid By</label>
                          <p className="text-sm text-gray-900 capitalize">
                            {grnData.transporter.freight_paid_by?.replace('_', ' ')}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Inspection Details */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Inspection Summary
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Total Items</label>
                      <p className="text-2xl font-bold text-gray-900">{grnData.line_items.length}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">QC Completed</label>
                      <p className="text-2xl font-bold text-green-600">
                        {grnData.quality_inspections.filter(q => q.sign_off_status).length}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">QC Pending</label>
                      <p className="text-2xl font-bold text-yellow-600">
                        {grnData.quality_inspections.filter(q => !q.sign_off_status).length}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Posted to Inventory</label>
                      <p className={`text-2xl font-bold ${grnData.posted_to_inventory ? 'text-green-600' : 'text-gray-400'}`}>
                        {grnData.posted_to_inventory ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-indigo-600" />
                    Documents & Photos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {grnData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className={`p-2 rounded-lg ${doc.document_type === 'photo' ? 'bg-purple-100' :
                            doc.document_type === 'invoice' ? 'bg-green-100' :
                              doc.document_type === 'test_certificate' ? 'bg-blue-100' :
                                'bg-gray-100'
                          }`}>
                          {doc.document_type === 'photo' ? (
                            <ImageIcon className="w-5 h-5 text-purple-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.document_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{(doc.file_size / 1024).toFixed(0)} KB</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{doc.uploaded_at}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => window.open(doc.document_url, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {grnData.notes && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Notes
                    </h4>
                    <p className="text-sm text-amber-800">{grnData.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Line Items Tab */}
            {activeTab === 'line_items' && (
              <div className="space-y-2">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Item Code
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Description
                        </th>
                        <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Unit
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          PO Qty
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Received
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Accepted
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Rejected
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Variance
                        </th>
                        <th className="text-center text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          QC Status
                        </th>
                        <th className="text-left text-xs font-semibold text-gray-700 p-3 border-b border-gray-300">
                          Storage Location
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {grnData.line_items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <td className="p-3 border-b border-gray-200">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.item_code}</p>
                              {item.batch_number && (
                                <p className="text-xs text-gray-500">Batch: {item.batch_number}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-b border-gray-200">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.item_name}</p>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-center">
                            <span className="text-sm text-gray-700">{item.unit}</span>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-right">
                            <span className="text-sm font-medium text-gray-900">
                              {item.po_quantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-right">
                            <span className="text-sm font-semibold text-blue-600">
                              {item.received_quantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-right">
                            <span className="text-sm font-semibold text-green-600">
                              {item.accepted_quantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-right">
                            <span className="text-sm font-semibold text-red-600">
                              {item.rejected_quantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {item.variance !== 0 && (
                                <>
                                  {item.variance < 0 ? (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                  )}
                                </>
                              )}
                              <span className={`text-sm font-medium ${item.variance < 0 ? 'text-red-600' : item.variance > 0 ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                {item.variance > 0 ? '+' : ''}{item.variance}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({item.variance_percentage > 0 ? '+' : ''}{item.variance_percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </td>
                          <td className="p-3 border-b border-gray-200 text-center">
                            {item.qc_status && (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${item.qc_status === 'pass' ? 'bg-green-100 text-green-700' :
                                  item.qc_status === 'fail' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {item.qc_status === 'pass' && <CheckCircle className="w-3 h-3" />}
                                {item.qc_status === 'fail' && <XCircle className="w-3 h-3" />}
                                {item.qc_status === 'pending' && <Clock className="w-3 h-3" />}
                                {item.qc_status.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td className="p-3 border-b border-gray-200">
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-xs">{item.storage_location}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-semibold">
                      <tr>
                        <td colSpan={3} className="p-3 border-t-2 border-gray-300 text-sm text-gray-900">
                          TOTAL
                        </td>
                        <td className="p-3 border-t-2 border-gray-300 text-right text-sm text-gray-900">
                          {grnData.total_ordered_qty.toLocaleString()}
                        </td>
                        <td className="p-3 border-t-2 border-gray-300 text-right text-sm text-blue-700">
                          {grnData.total_received_qty.toLocaleString()}
                        </td>
                        <td className="p-3 border-t-2 border-gray-300 text-right text-sm text-green-700">
                          {grnData.total_accepted_qty.toLocaleString()}
                        </td>
                        <td className="p-3 border-t-2 border-gray-300 text-right text-sm text-red-700">
                          {grnData.total_rejected_qty.toLocaleString()}
                        </td>
                        <td className="p-3 border-t-2 border-gray-300 text-right text-sm text-gray-900">
                          {grnData.qty_variance > 0 ? '+' : ''}{grnData.qty_variance}
                        </td>
                        <td colSpan={2} className="p-3 border-t-2 border-gray-300"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Rejection Reasons */}
                {grnData.line_items.some(item => item.rejected_quantity > 0) && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Rejection Details
                    </h4>
                    <div className="space-y-2">
                      {grnData.line_items
                        .filter(item => item.rejected_quantity > 0)
                        .map(item => (
                          <div key={item.id} className="flex items-start gap-2 text-sm">
                            <span className="font-medium text-red-800 min-w-[150px]">{item.item_code}:</span>
                            <span className="text-red-700">
                              {item.rejected_quantity} {item.unit} rejected - {item.rejection_reason}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Variance Analysis */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Variance Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs font-medium text-blue-700">Total Variance</label>
                      <p className={`text-lg font-bold ${grnData.qty_variance < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {grnData.qty_variance > 0 ? '+' : ''}{grnData.qty_variance} units
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-blue-700">Variance Percentage</label>
                      <p className={`text-lg font-bold ${grnData.qty_variance < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {((grnData.qty_variance / grnData.total_ordered_qty) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-blue-700">Acceptance Rate</label>
                      <p className="text-lg font-bold text-green-600">
                        {((grnData.total_accepted_qty / grnData.total_received_qty) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quality Inspection Tab */}
            {activeTab === 'quality_inspection' && (
              <div className="space-y-3">
                {grnData.quality_inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className="bg-white rounded-lg border border-gray-300 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b border-gray-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{inspection.item_name}</h3>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getQCStatusColor(inspection.overall_status)}`}>
                              {inspection.overall_status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Item Code: {inspection.item_code}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                            <span>Batch: {inspection.batch_number}</span>
                            <span>Lot: {inspection.lot_number}</span>
                            <span>Sample Size: {inspection.sample_size}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-700">Inspector: {inspection.inspector_name}</p>
                          <p className="text-xs text-gray-500">Date: {inspection.inspection_date}</p>
                          {inspection.sign_off_status && (
                            <div className="mt-2 flex items-center justify-end gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Signed Off</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Quality Parameters */}
                      <div className="mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          Test Parameters & Results
                        </h4>
                        <div className="space-y-2">
                          {inspection.parameters.map((param) => (
                            <div
                              key={param.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${param.status === 'pass' ? 'bg-green-50 border-green-200' :
                                  param.status === 'fail' ? 'bg-red-50 border-red-200' :
                                    'bg-yellow-50 border-yellow-200'
                                }`}
                            >
                              <div className="flex-shrink-0">
                                {param.status === 'pass' ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : param.status === 'fail' ? (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-yellow-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-gray-900">{param.parameter_name}</p>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${param.status === 'pass' ? 'bg-green-200 text-green-800' :
                                      param.status === 'fail' ? 'bg-red-200 text-red-800' :
                                        'bg-yellow-200 text-yellow-800'
                                    }`}>
                                    {param.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Method:</span>
                                    <span className="ml-1 text-gray-700">{param.test_method}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Acceptance:</span>
                                    <span className="ml-1 text-gray-700">{param.acceptance_criteria}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Actual:</span>
                                    <span className={`ml-1 font-semibold ${param.status === 'pass' ? 'text-green-700' :
                                        param.status === 'fail' ? 'text-red-700' :
                                          'text-yellow-700'
                                      }`}>
                                      {param.actual_value} {param.unit}
                                    </span>
                                  </div>
                                </div>
                                {param.remarks && (
                                  <p className="text-xs text-gray-600 mt-1 italic">{param.remarks}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Defect Details */}
                      {inspection.defect_details && (
                        <div className="mb-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                          <h5 className="text-sm font-semibold text-orange-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Defect Details
                          </h5>
                          <p className="text-sm text-orange-800 mb-2">{inspection.defect_details}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-orange-700">
                              Category: <span className="font-medium capitalize">{inspection.defect_category}</span>
                            </span>
                            <span className="text-orange-700">
                              Count: <span className="font-medium">{inspection.defect_count}</span>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Disposition */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Disposition</label>
                          <p className={`text-sm font-bold capitalize ${inspection.disposition === 'accept' ? 'text-green-600' :
                              inspection.disposition === 'reject' ? 'text-red-600' :
                                'text-yellow-600'
                            }`}>
                            {inspection.disposition.replace('_', ' ')}
                          </p>
                        </div>
                        {inspection.qc_report_url && (
                          <button
                            onClick={() => window.open(inspection.qc_report_url, '_blank')}
                            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Download className="w-4 h-4" />
                            Download QC Report
                          </button>
                        )}
                      </div>

                      {/* Remarks */}
                      {inspection.remarks && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Inspector Remarks</h5>
                          <p className="text-sm text-gray-800">{inspection.remarks}</p>
                        </div>
                      )}

                      {/* Sign-off Status */}
                      {inspection.sign_off_status && (
                        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-green-900">Inspection Signed Off</p>
                              <p className="text-xs text-green-700">
                                By {inspection.inspector_name} on {inspection.sign_off_date}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                            APPROVED
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Overall QC Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Quality Inspection Summary
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="text-xs font-medium text-gray-600">Total Inspections</label>
                      <p className="text-2xl font-bold text-gray-900">{grnData.quality_inspections.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <label className="text-xs font-medium text-green-700">Passed</label>
                      <p className="text-2xl font-bold text-green-600">
                        {grnData.quality_inspections.filter(q => q.overall_status === 'pass').length}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <label className="text-xs font-medium text-red-700">Failed</label>
                      <p className="text-2xl font-bold text-red-600">
                        {grnData.quality_inspections.filter(q => q.overall_status === 'fail').length}
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <label className="text-xs font-medium text-yellow-700">Pending</label>
                      <p className="text-2xl font-bold text-yellow-600">
                        {grnData.quality_inspections.filter(q => q.overall_status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRNViewPage;
