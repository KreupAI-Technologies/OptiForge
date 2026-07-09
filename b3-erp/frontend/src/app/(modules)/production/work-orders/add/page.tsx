'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  X,
  Plus,
  Trash2,
  Copy,
  Package,
  Factory,
  Calendar,
  Users,
  AlertCircle,
  Settings,
  Wrench,
  IndianRupee,
  Clock,
  ShoppingCart,
  User,
  Box,
  Layers,
  Target,
  CheckCircle,
  Info,
  Upload,
  Link as LinkIcon,
  Search,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Gauge,
  Hash,
  PlayCircle,
  FileCheck,
} from 'lucide-react';
import { PurchaseRequisitionModal } from '@/components/production/PurchaseRequisitionModal';
import { workOrderService } from '@/services/work-order.service';
import { purchaseRequisitionService } from '@/services/purchase-requisition.service';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// TypeScript Interfaces
interface MaterialRequirement {
  id: string;
  itemCode: string;
  description: string;
  requiredQty: string;
  uom: string;
  stockAvailable: number;
  stockStatus: 'available' | 'shortage' | 'critical';
  canSubstitute: boolean;
  substituteItem: string;
  reserveStock: boolean;
}

interface Operation {
  id: string;
  sequence: number;
  operationName: string;
  workCenter: string;
  setupTime: string;
  runTime: string;
  timePerPiece: string;
  estimatedDuration: string;
  resourceAvailability: 'available' | 'limited' | 'unavailable';
}

interface WorkOrderFormData {
  woNumber: string;
  createFrom: 'sales_order' | 'manual';
  productCode: string;
  productName: string;
  productDescription: string;
  drawingNumber: string;
  revision: string;
  quantity: string;
  uom: string;
  salesOrderRef: string;
  customerName: string;
  dueDate: string;
  urgency: 'normal' | 'urgent' | 'critical';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  plannedStartDate: string;
  plannedEndDate: string;
  workCenter: string;
  secondaryWorkCenters: string[];
  shifts: string[];
  supervisor: string;
  bomRef: string;
  routingRef: string;
  materialRequirements: MaterialRequirement[];
  operations: Operation[];
  specialInstructions: string;
  estimatedMaterialCost: string;
  estimatedLaborCost: string;
  estimatedOverheadCost: string;
  attachments: File[];
}

// Mock data for dropdowns
const products = [
  {
    code: 'MKC-CAB-001',
    name: 'Premium Modular Kitchen Cabinet - Upper Unit',
    description: '900mm x 600mm x 300mm Wall-mounted Cabinet with Soft-close Hinges',
    drawingNumber: 'DRG-MKC-001-Rev3',
    revision: 'C',
    bomRef: 'BOM-MKC-CAB-001-Rev2',
    routingRef: 'RTG-MKC-CAB-001',
  },
  {
    code: 'MKC-DRW-002',
    name: 'Modular Kitchen Drawer Unit - 3 Drawer',
    description: '600mm x 600mm x 850mm Base Unit with Soft-close Drawers',
    drawingNumber: 'DRG-MKC-002-Rev2',
    revision: 'B',
    bomRef: 'BOM-MKC-DRW-002-Rev1',
    routingRef: 'RTG-MKC-DRW-002',
  },
  {
    code: 'SFC-TBL-002',
    name: 'Steel Office Table - Executive',
    description: '1500mm x 750mm x 750mm with powder coating',
    drawingNumber: 'DRG-SFC-TBL-002-Rev2',
    revision: 'B',
    bomRef: 'BOM-SFC-TBL-002-Rev1',
    routingRef: 'RTG-SFC-TBL-002',
  },
  {
    code: 'SFC-CHR-003',
    name: 'Steel Office Chair - Ergonomic',
    description: 'Revolving chair with adjustable height and lumbar support',
    drawingNumber: 'DRG-SFC-CHR-003-Rev3',
    revision: 'C',
    bomRef: 'BOM-SFC-CHR-003-Rev2',
    routingRef: 'RTG-SFC-CHR-003',
  },
  {
    code: 'ELP-PNL-003',
    name: 'Electrical Control Panel - 32A',
    description: 'MCB Distribution Panel with 32A Rating',
    drawingNumber: 'DRG-ELP-003-Rev4',
    revision: 'D',
    bomRef: 'BOM-ELP-PNL-003-Rev3',
    routingRef: 'RTG-ELP-PNL-003',
  },
  {
    code: 'ELP-PNL-004',
    name: 'Electrical Control Panel - 63A',
    description: 'MCB Distribution Panel with 63A Rating',
    drawingNumber: 'DRG-ELP-004-Rev2',
    revision: 'B',
    bomRef: 'BOM-ELP-PNL-004-Rev1',
    routingRef: 'RTG-ELP-PNL-004',
  },
  {
    code: 'MTR-ASM-004',
    name: '3-Phase Motor Assembly - 5HP',
    description: 'Industrial motor with gearbox assembly',
    drawingNumber: 'DRG-MTR-004-Rev2',
    revision: 'B',
    bomRef: 'BOM-MTR-ASM-004-Rev1',
    routingRef: 'RTG-MTR-ASM-004',
  },
  {
    code: 'MTR-ASM-005',
    name: '3-Phase Motor Assembly - 10HP',
    description: 'Heavy-duty industrial motor with gearbox',
    drawingNumber: 'DRG-MTR-005-Rev3',
    revision: 'C',
    bomRef: 'BOM-MTR-ASM-005-Rev2',
    routingRef: 'RTG-MTR-ASM-005',
  },
];

const salesOrders = [
  { ref: 'SO-2025-0892', customer: 'Sharma Modular Kitchens Pvt Ltd', productCode: 'MKC-CAB-001', quantity: 50, dueDate: '2025-10-25' },
  { ref: 'SO-2025-0895', customer: 'Metro Office Interiors', productCode: 'SFC-TBL-002', quantity: 100, dueDate: '2025-10-30' },
  { ref: 'SO-2025-0898', customer: 'Electrical Solutions India', productCode: 'ELP-PNL-003', quantity: 75, dueDate: '2025-11-05' },
  { ref: 'SO-2025-0901', customer: 'Industrial Pumps Ltd', productCode: 'MTR-ASM-004', quantity: 25, dueDate: '2025-11-10' },
  { ref: 'SO-2025-0904', customer: 'Modern Kitchens Bangalore', productCode: 'MKC-DRW-002', quantity: 60, dueDate: '2025-11-15' },
  { ref: 'SO-2025-0907', customer: 'Corporate Solutions Mumbai', productCode: 'SFC-CHR-003', quantity: 150, dueDate: '2025-11-20' },
];

const workCenters = [
  { name: 'Assembly Line 1', capacity: '80%', status: 'available' },
  { name: 'Assembly Line 2', capacity: '65%', status: 'available' },
  { name: 'Machining Center', capacity: '90%', status: 'limited' },
  { name: 'CNC Cutting Center', capacity: '75%', status: 'available' },
  { name: 'Welding Shop', capacity: '85%', status: 'available' },
  { name: 'Paint Shop', capacity: '95%', status: 'limited' },
  { name: 'QC Station', capacity: '60%', status: 'available' },
  { name: 'Packing Station', capacity: '70%', status: 'available' },
  { name: 'Edge Banding Machine', capacity: '80%', status: 'available' },
];

const shiftOptions = [
  'Morning (6AM-2PM)',
  'Afternoon (2PM-10PM)',
  'Night (10PM-6AM)',
];

const supervisors = ['Rajesh Kumar', 'Priya Desai', 'Amit Sharma', 'Suresh Patel', 'Neha Gupta'];

const uomOptions = ['Pcs', 'Sets', 'KG', 'MT', 'Ltrs', 'Meters', 'SqM'];

const stockStatusColors = {
  available: 'bg-green-100 text-green-700',
  shortage: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const resourceAvailabilityColors = {
  available: 'bg-green-100 text-green-700',
  limited: 'bg-orange-100 text-orange-700',
  unavailable: 'bg-red-100 text-red-700',
};

export default function AddWorkOrderPage() {
  const router = useRouter();

  // Generate WO number
  const generateWONumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
    return `WO-${year}-${random}`;
  };

  const [woNumber] = useState(generateWONumber());
  const [selectedSecondaryWC, setSelectedSecondaryWC] = useState('');
  const [showBOMExplosion, setShowBOMExplosion] = useState(false);
  const [loadingBomExplosion, setLoadingBomExplosion] = useState(false);
  const [bomExplosionError, setBomExplosionError] = useState<string | null>(null);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);
  const [isPRModalOpen, setIsPRModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<WorkOrderFormData>({
    woNumber: woNumber,
    createFrom: 'manual',
    productCode: '',
    productName: '',
    productDescription: '',
    drawingNumber: '',
    revision: '',
    quantity: '',
    uom: 'Pcs',
    salesOrderRef: '',
    customerName: '',
    dueDate: '',
    urgency: 'normal',
    priority: 'Medium',
    plannedStartDate: '',
    plannedEndDate: '',
    workCenter: 'Assembly Line 1',
    secondaryWorkCenters: [],
    shifts: [],
    supervisor: '',
    bomRef: '',
    routingRef: '',
    materialRequirements: [],
    operations: [],
    specialInstructions: '',
    estimatedMaterialCost: '0',
    estimatedLaborCost: '0',
    estimatedOverheadCost: '0',
    attachments: [],
  });

  const updateFormData = (field: keyof WorkOrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate urgency based on due date
  useEffect(() => {
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 3) {
        updateFormData('urgency', 'critical');
      } else if (daysUntilDue <= 7) {
        updateFormData('urgency', 'urgent');
      } else {
        updateFormData('urgency', 'normal');
      }
    }
  }, [formData.dueDate]);

  const handleProductChange = async (productCode: string) => {
    const product = products.find(p => p.code === productCode);
    if (!product) return;

    updateFormData('productCode', product.code);
    updateFormData('productName', product.name);
    updateFormData('productDescription', product.description);
    updateFormData('drawingNumber', product.drawingNumber);
    updateFormData('revision', product.revision);
    updateFormData('bomRef', product.bomRef);
    updateFormData('routingRef', product.routingRef);
    setShowBOMExplosion(true);

    // Explode the BOM (by code or id) to populate material requirements.
    setBomExplosionError(null);
    if (product.bomRef) {
      setLoadingBomExplosion(true);
      try {
        const qty = parseFloat(formData.quantity) || 1;
        const exploded: any = await ProductionOrphanService.getBomExplosion(product.bomRef, qty);
        const rows = Array.isArray(exploded?.explodedItems) ? exploded.explodedItems : [];
        if (rows.length > 0) {
          updateFormData(
            'materialRequirements',
            rows.map((it: any) => {
              const reqQty = it.extendedNetQuantity ?? it.extendedQuantity ?? it.netQuantity ?? it.quantity ?? 0;
              return {
                id: Math.random().toString(36).substr(2, 9),
                itemCode: it.itemCode ?? '',
                description: it.itemName ?? '',
                requiredQty: String(reqQty),
                uom: it.uom ?? 'Pcs',
                stockAvailable: 0,
                stockStatus: 'available' as const,
                canSubstitute: false,
                substituteItem: '',
                reserveStock: false,
              };
            }),
          );
        } else if (formData.materialRequirements.length === 0) {
          updateFormData('materialRequirements', [blankMaterialRow()]);
        }
      } catch (err: any) {
        setBomExplosionError(
          err?.message ?? 'Could not load BOM components. Enter material requirements manually.',
        );
        if (formData.materialRequirements.length === 0) {
          updateFormData('materialRequirements', [blankMaterialRow()]);
        }
      } finally {
        setLoadingBomExplosion(false);
      }
    } else if (formData.materialRequirements.length === 0) {
      updateFormData('materialRequirements', [blankMaterialRow()]);
    }

    if (formData.operations.length === 0) {
      updateFormData('operations', [{
        id: Math.random().toString(36).substr(2, 9),
        sequence: 10, operationName: '', workCenter: 'Assembly Line 1',
        setupTime: '0', runTime: '0', timePerPiece: '0',
        estimatedDuration: '0 hrs', resourceAvailability: 'available' as const,
      }]);
    }
  };

  const blankMaterialRow = (): MaterialRequirement => ({
    id: Math.random().toString(36).substr(2, 9),
    itemCode: '', description: '', requiredQty: '1', uom: 'Pcs',
    stockAvailable: 0, stockStatus: 'available',
    canSubstitute: false, substituteItem: '', reserveStock: false,
  });

  const handleSalesOrderChange = (soRef: string) => {
    const so = salesOrders.find(s => s.ref === soRef);
    if (so) {
      updateFormData('createFrom', 'sales_order');
      updateFormData('salesOrderRef', so.ref);
      updateFormData('customerName', so.customer);
      updateFormData('quantity', so.quantity.toString());
      updateFormData('dueDate', so.dueDate);
      handleProductChange(so.productCode);
    }
  };

  const addSecondaryWorkCenter = () => {
    if (selectedSecondaryWC && !formData.secondaryWorkCenters.includes(selectedSecondaryWC)) {
      updateFormData('secondaryWorkCenters', [...formData.secondaryWorkCenters, selectedSecondaryWC]);
      setSelectedSecondaryWC('');
    }
  };

  const removeSecondaryWorkCenter = (wc: string) => {
    updateFormData('secondaryWorkCenters', formData.secondaryWorkCenters.filter(w => w !== wc));
  };

  const toggleShift = (shift: string) => {
    if (formData.shifts.includes(shift)) {
      updateFormData('shifts', formData.shifts.filter(s => s !== shift));
    } else {
      updateFormData('shifts', [...formData.shifts, shift]);
    }
  };

  const updateMaterialRequirement = (index: number, field: keyof MaterialRequirement, value: any) => {
    const updated = [...formData.materialRequirements];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('materialRequirements', updated);
  };

  const addMaterialRequirement = () => {
    const newMaterial: MaterialRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      itemCode: '',
      description: '',
      requiredQty: '1',
      uom: 'Pcs',
      stockAvailable: 0,
      stockStatus: 'available',
      canSubstitute: false,
      substituteItem: '',
      reserveStock: false,
    };
    updateFormData('materialRequirements', [...formData.materialRequirements, newMaterial]);
  };

  const removeMaterialRequirement = (index: number) => {
    if (formData.materialRequirements.length > 1) {
      updateFormData('materialRequirements', formData.materialRequirements.filter((_, i) => i !== index));
    }
  };

  const updateOperation = (index: number, field: keyof Operation, value: any) => {
    const updated = [...formData.operations];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('operations', updated);
  };

  const addOperation = () => {
    const newOp: Operation = {
      id: Math.random().toString(36).substr(2, 9),
      sequence: (formData.operations.length + 1) * 10,
      operationName: '',
      workCenter: 'Assembly Line 1',
      setupTime: '0',
      runTime: '0',
      timePerPiece: '0',
      estimatedDuration: '0 hrs',
      resourceAvailability: 'available',
    };
    updateFormData('operations', [...formData.operations, newOp]);
  };

  const removeOperation = (index: number) => {
    if (formData.operations.length > 1) {
      updateFormData('operations', formData.operations.filter((_, i) => i !== index));
    }
  };

  const calculateEstimatedDuration = (setupTime: string, runTime: string) => {
    const setup = parseFloat(setupTime) || 0;
    const run = parseFloat(runTime) || 0;
    const total = setup + run;
    return `${(total / 60).toFixed(1)} hrs`;
  };

  const calculateTotalCost = () => {
    const material = parseFloat(formData.estimatedMaterialCost) || 0;
    const labor = parseFloat(formData.estimatedLaborCost) || 0;
    const overhead = parseFloat(formData.estimatedOverheadCost) || 0;
    return material + labor + overhead;
  };

  const calculateTotalTime = () => {
    const totalMinutes = formData.operations.reduce((sum, op) => {
      const setup = parseFloat(op.setupTime) || 0;
      const run = parseFloat(op.runTime) || 0;
      return sum + setup + run;
    }, 0);
    return (totalMinutes / 60).toFixed(1);
  };

  const checkMaterialShortages = () => {
    return formData.materialRequirements.filter(m => m.stockStatus === 'shortage' || m.stockStatus === 'critical').length;
  };

  const checkResourceBottlenecks = () => {
    return formData.operations.filter(o => o.resourceAvailability === 'limited' || o.resourceAvailability === 'unavailable').length;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      updateFormData('attachments', [...formData.attachments, ...files]);
    }
  };

  const removeAttachment = (index: number) => {
    updateFormData('attachments', formData.attachments.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await workOrderService.createWorkOrder({ ...formData, status: 'draft' } as any);
      router.push('/production/work-orders');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save work order draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRelease = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await workOrderService.createWorkOrder(formData as any);
      router.push('/production/work-orders');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePRSubmit = async (prData: any) => {
    setSubmitError(null);
    setNotice(null);
    try {
      const totalCost = prData.items.reduce(
        (sum: number, item: any) => sum + (parseFloat(item.estimatedCost) || 0),
        0,
      );
      // Resolve item codes to master item ids (the backend PR DTO requires itemId).
      const codes: string[] = (prData.items || [])
        .filter((it: any) => !it.itemId && it.itemCode)
        .map((it: any) => it.itemCode);
      let resolvedByCode: Record<string, string> = {};
      if (codes.length) {
        try {
          const resolved = await ProductionOrphanService.resolveItems(codes);
          resolvedByCode = (resolved || []).reduce(
            (acc: Record<string, string>, r: any) => {
              if (r?.itemCode && r?.itemId) acc[r.itemCode] = r.itemId;
              return acc;
            },
            {},
          );
        } catch {
          // Fall back to itemCode if resolution fails.
        }
      }
      await purchaseRequisitionService.createRequisition({
        title: `Materials for Work Order ${woNumber}`,
        description: `Auto-generated from work order ${woNumber} material shortages`,
        department: 'Production',
        priority: 'High',
        requiredDate: formData.dueDate || new Date().toISOString().split('T')[0],
        currency: 'INR',
        justification: `Material shortage for work order ${woNumber}`,
        items: (prData.items || []).map((item: any) => ({
          itemId: item.itemId || resolvedByCode[item.itemCode] || item.itemCode,
          quantity: parseFloat(item.requiredQty) || 0,
          estimatedUnitPrice: parseFloat(item.estimatedCost) || 0,
          requiredDate: formData.dueDate || new Date().toISOString().split('T')[0],
          notes: item.description,
        })),
      });
      setIsPRModalOpen(false);
      setNotice(`Purchase Requisition created (₹${totalCost.toLocaleString('en-IN')}) and submitted for approval.`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create Purchase Requisition');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {/* Header */}
          <div className="mb-3">
            <button
              onClick={() => router.push('/production/work-orders')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Work Orders</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Work Order</h1>
                <p className="text-sm text-gray-600">Auto-generated: {woNumber}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Create From */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-orange-600" />
                Create From
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Create From</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="sales_order"
                        checked={formData.createFrom === 'sales_order'}
                        onChange={(e) => updateFormData('createFrom', e.target.value as any)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-900">Sales Order</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="manual"
                        checked={formData.createFrom === 'manual'}
                        onChange={(e) => updateFormData('createFrom', e.target.value as any)}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-900">Manual Entry</span>
                    </label>
                  </div>
                </div>

                {formData.createFrom === 'sales_order' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Sales Order <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.salesOrderRef}
                      onChange={(e) => handleSalesOrderChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Sales Order</option>
                      {salesOrders.map(so => (
                        <option key={so.ref} value={so.ref}>
                          {so.ref} - {so.customer} ({so.quantity} {so.productCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-600" />
                Product Selection
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productCode}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={formData.createFrom === 'sales_order' && formData.productCode !== ''}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.code} value={product.code}>
                        {product.code} - {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
                  <input
                    type="text"
                    value={formData.productDescription}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drawing Number</label>
                  <input
                    type="text"
                    value={formData.drawingNumber}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Revision</label>
                  <input
                    type="text"
                    value={formData.revision}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity to Produce <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => updateFormData('quantity', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UOM</label>
                  <select
                    value={formData.uom}
                    onChange={(e) => updateFormData('uom', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {uomOptions.map(uom => (
                      <option key={uom} value={uom}>{uom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => updateFormData('customerName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Customer name"
                  />
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {formData.dueDate && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        formData.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                        formData.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {formData.urgency === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {formData.urgency === 'urgent' && <Clock className="h-3 w-3 mr-1" />}
                        {formData.urgency === 'normal' && <CheckCircle className="h-3 w-3 mr-1" />}
                        Urgency: {formData.urgency.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Priority & Dates */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                Priority & Planned Dates
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => updateFormData('priority', e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.plannedStartDate}
                      onChange={(e) => updateFormData('plannedStartDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.plannedEndDate}
                      onChange={(e) => updateFormData('plannedEndDate', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Centers & Shifts */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-orange-600" />
                Work Centers & Shift Planning
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Work Center <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.workCenter}
                    onChange={(e) => updateFormData('workCenter', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {workCenters.map(wc => (
                      <option key={wc.name} value={wc.name}>
                        {wc.name} - Capacity: {wc.capacity}
                      </option>
                    ))}
                  </select>
                  {workCenters.find(wc => wc.name === formData.workCenter)?.status === 'limited' && (
                    <div className="mt-2 flex items-center space-x-2 text-orange-600 text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <span>Limited capacity available</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Work Centers</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedSecondaryWC}
                      onChange={(e) => setSelectedSecondaryWC(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select to add</option>
                      {workCenters
                        .filter(wc => wc.name !== formData.workCenter && !formData.secondaryWorkCenters.includes(wc.name))
                        .map(wc => (
                          <option key={wc.name} value={wc.name}>{wc.name}</option>
                        ))}
                    </select>
                    <button
                      onClick={addSecondaryWorkCenter}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  {formData.secondaryWorkCenters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.secondaryWorkCenters.map(wc => (
                        <span key={wc} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {wc}
                          <button
                            onClick={() => removeSecondaryWorkCenter(wc)}
                            className="ml-2 text-blue-700 hover:text-blue-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Planning <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {shiftOptions.map(shift => (
                      <label key={shift} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.shifts.includes(shift)}
                          onChange={() => toggleShift(shift)}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                        />
                        <span className="text-sm text-gray-900">{shift}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Assignment</label>
                  <select
                    value={formData.supervisor}
                    onChange={(e) => updateFormData('supervisor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map(sup => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* BOM Explosion */}
            {showBOMExplosion && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <Box className="h-5 w-5 mr-2 text-orange-600" />
                    BOM Explosion - Material Requirements
                  </h2>
                  <div className="flex items-center space-x-3">
                    {loadingBomExplosion && (
                      <span className="text-sm text-blue-600">Loading BOM…</span>
                    )}
                    <span className="text-sm text-gray-600">{formData.materialRequirements.length} items</span>
                    <button
                      onClick={addMaterialRequirement}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {bomExplosionError && (
                  <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    {bomExplosionError}
                  </div>
                )}

                {/* Material Shortage Alert */}
                {checkMaterialShortages() > 0 && (
                  <div className="mb-2 bg-orange-50 border-l-4 border-orange-500 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-orange-800">Material Shortage Alert</p>
                          <p className="text-xs text-orange-700 mt-1">
                            {checkMaterialShortages()} items have stock shortage. Create Purchase Requisition?
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPRModalOpen(true)}
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                      >
                        Create PR
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.materialRequirements.map((material, index) => (
                    <div key={material.id} className={`border rounded-lg p-3 ${
                      material.stockStatus === 'shortage' || material.stockStatus === 'critical'
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
                          <input
                            type="text"
                            value={material.itemCode}
                            onChange={(e) => updateMaterialRequirement(index, 'itemCode', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="ITEM-CODE"
                          />
                        </div>

                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={material.description}
                            onChange={(e) => updateMaterialRequirement(index, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Material description"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Required</label>
                          <input
                            type="number"
                            value={material.requiredQty}
                            onChange={(e) => updateMaterialRequirement(index, 'requiredQty', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="1"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">UOM</label>
                          <select
                            value={material.uom}
                            onChange={(e) => updateMaterialRequirement(index, 'uom', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          >
                            {uomOptions.map(uom => (
                              <option key={uom} value={uom}>{uom}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={material.stockAvailable}
                              disabled
                              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm"
                            />
                            <span className={`px-2 py-1 rounded text-xs font-medium ${stockStatusColors[material.stockStatus]}`}>
                              {material.stockStatus === 'available' && <CheckCircle className="h-3 w-3 inline" />}
                              {material.stockStatus === 'shortage' && <AlertCircle className="h-3 w-3 inline" />}
                              {material.stockStatus === 'critical' && <AlertTriangle className="h-3 w-3 inline" />}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-1 flex items-end">
                          <button
                            onClick={() => removeMaterialRequirement(index)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                           
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="col-span-12 flex items-center space-x-4 mt-1">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={material.reserveStock}
                              onChange={(e) => updateMaterialRequirement(index, 'reserveStock', e.target.checked)}
                              className="w-3 h-3 text-orange-600 focus:ring-orange-500 rounded"
                            />
                            <span className="text-xs text-gray-700">Reserve Material</span>
                          </label>

                          {material.canSubstitute && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600">Substitute:</span>
                              <input
                                type="text"
                                value={material.substituteItem}
                                onChange={(e) => updateMaterialRequirement(index, 'substituteItem', e.target.value)}
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-xs"
                                placeholder="Alt. item code"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operations / Routing */}
            {formData.operations.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                    Operations / Routing
                  </h2>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Total: {calculateTotalTime()} hours</span>
                    <button
                      onClick={addOperation}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Resource Bottleneck Alert */}
                {checkResourceBottlenecks() > 0 && (
                  <div className="mb-2 bg-orange-50 border-l-4 border-orange-500 p-3">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-orange-800">Resource Capacity Alert</p>
                        <p className="text-xs text-orange-700 mt-1">
                          {checkResourceBottlenecks()} operations have limited or unavailable resources. Check capacity.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.operations.map((operation, index) => (
                    <div key={operation.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Seq</label>
                          <input
                            type="number"
                            value={operation.sequence}
                            disabled
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-bold text-center bg-gray-100"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Operation</label>
                          <input
                            type="text"
                            value={operation.operationName}
                            onChange={(e) => updateOperation(index, 'operationName', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="Operation name"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Work Center</label>
                          <select
                            value={operation.workCenter}
                            onChange={(e) => updateOperation(index, 'workCenter', e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                          >
                            {workCenters.map(wc => (
                              <option key={wc.name} value={wc.name}>{wc.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Setup</label>
                          <input
                            type="number"
                            value={operation.setupTime}
                            onChange={(e) => {
                              updateOperation(index, 'setupTime', e.target.value);
                              const estimated = calculateEstimatedDuration(e.target.value, operation.runTime);
                              updateOperation(index, 'estimatedDuration', estimated);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="min"
                          />
                        </div>

                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Run</label>
                          <input
                            type="number"
                            value={operation.runTime}
                            onChange={(e) => {
                              updateOperation(index, 'runTime', e.target.value);
                              const estimated = calculateEstimatedDuration(operation.setupTime, e.target.value);
                              updateOperation(index, 'estimatedDuration', estimated);
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            placeholder="min"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={operation.estimatedDuration}
                            disabled
                            className="w-full px-2 py-1.5 border border-gray-300 rounded bg-gray-100 text-gray-600 text-sm font-medium"
                          />
                        </div>

                        <div className="col-span-1 flex items-end">
                          <button
                            onClick={() => removeOperation(index)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                           
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="col-span-12 flex items-center justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Resource:</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${resourceAvailabilityColors[operation.resourceAvailability]}`}>
                              {operation.resourceAvailability.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Time per piece: <span className="font-medium">{operation.timePerPiece} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Production Scheduling Preview */}
            {formData.operations.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                    Production Scheduling Preview
                  </h2>
                  <button
                    onClick={() => setShowSchedulePreview(!showSchedulePreview)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showSchedulePreview ? 'Hide' : 'Show'} Details
                  </button>
                </div>

                {showSchedulePreview && (
                  <div className="space-y-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs font-medium text-blue-700 uppercase mb-1">Total Operations</p>
                          <p className="text-2xl font-bold text-blue-900">{formData.operations.length}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-700 uppercase mb-1">Total Time</p>
                          <p className="text-2xl font-bold text-blue-900">{calculateTotalTime()} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-blue-700 uppercase mb-1">Estimated Cost</p>
                          <p className="text-2xl font-bold text-blue-900">{formatCurrency(calculateTotalCost())}</p>
                        </div>
                      </div>
                    </div>

                    {/* Gantt-style preview placeholder */}
                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-3">Operation Timeline</p>
                      <div className="space-y-2">
                        {formData.operations.map((op, index) => (
                          <div key={op.id} className="flex items-center space-x-3">
                            <span className="text-xs w-8 text-gray-600">{op.sequence}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-orange-600 h-6 rounded-full flex items-center px-3"
                                style={{ width: `${(parseFloat(op.estimatedDuration) / parseFloat(calculateTotalTime())) * 100}%` }}
                              >
                                <span className="text-xs text-white font-medium truncate">{op.operationName}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-600 w-16 text-right">{op.estimatedDuration}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottleneck Identification */}
                    {checkResourceBottlenecks() > 0 && (
                      <div className="border border-orange-300 rounded-lg p-3 bg-orange-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          <p className="text-sm font-medium text-orange-800">Identified Bottlenecks</p>
                        </div>
                        <ul className="text-xs text-orange-700 space-y-1">
                          {formData.operations
                            .filter(o => o.resourceAvailability === 'limited' || o.resourceAvailability === 'unavailable')
                            .map(op => (
                              <li key={op.id}>• {op.operationName} at {op.workCenter} - {op.resourceAvailability}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cost Estimation */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-orange-600" />
                Cost Estimation Breakdown
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Material Cost</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.estimatedMaterialCost}
                      onChange={(e) => updateFormData('estimatedMaterialCost', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="145000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Labor Cost</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.estimatedLaborCost}
                      onChange={(e) => updateFormData('estimatedLaborCost', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="35000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Overhead Cost</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={formData.estimatedOverheadCost}
                      onChange={(e) => updateFormData('estimatedOverheadCost', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="22000"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total Estimated Cost:</span>
                  <span className="text-2xl font-bold text-blue-900">
                    {formatCurrency(calculateTotalCost())}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Cost per unit: {formData.quantity ? formatCurrency(calculateTotalCost() / parseFloat(formData.quantity)) : '₹0'}
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-600" />
                Special Instructions
              </h2>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter any special instructions, quality requirements, customer-specific requirements, handling instructions, etc..."
              />
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-orange-600" />
                Attachments
              </h2>

              <div className="mb-2">
                <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload drawings, specifications, or documents</span>
                    <span className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DWG (Max 10MB each)</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.dwg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        {submitError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</div>
        )}
        {notice && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">{notice}</div>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/production/work-orders')}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5" />
              <span>{submitting ? 'Saving…' : 'Save as Draft'}</span>
            </button>
            <button
              onClick={handleRelease}
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              <span>{submitting ? 'Releasing…' : 'Release Work Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Requisition Modal */}
      <PurchaseRequisitionModal
        isOpen={isPRModalOpen}
        onClose={() => setIsPRModalOpen(false)}
        materials={formData.materialRequirements}
        woNumber={woNumber}
        onSubmit={handlePRSubmit}
      />
    </div>
  );
}
