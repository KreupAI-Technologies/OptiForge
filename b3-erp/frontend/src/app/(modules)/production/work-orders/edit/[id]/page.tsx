'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { workOrderService } from '@/services/work-order.service';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Copy,
  Package,
  Factory,
  Calendar,
  Users,
  FileText,
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
} from 'lucide-react';

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
}

interface Operation {
  id: string;
  sequence: number;
  operationName: string;
  workCenter: string;
  setupTime: string;
  runTime: string;
  estimatedDuration: string;
}

interface WorkOrderFormData {
  woNumber: string;
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
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  plannedStartDate: string;
  plannedEndDate: string;
  workCenter: string;
  secondaryWorkCenters: string[];
  shift: string;
  supervisor: string;
  foreman: string;
  bomRef: string;
  routingRef: string;
  materialRequirements: MaterialRequirement[];
  operations: Operation[];
  specialInstructions: string;
  estimatedMaterialCost: string;
  estimatedLaborCost: string;
  estimatedOverheadCost: string;
}

// Static config option lists (not entity data)
const workCenters = [
  'Assembly Line 1',
  'Assembly Line 2',
  'Machining Center',
  'CNC Cutting Center',
  'Welding Shop',
  'Paint Shop',
  'QC Station',
  'Packing Station',
  'Edge Banding Machine',
];

const shifts = ['Morning (6AM-2PM)', 'Afternoon (2PM-10PM)', 'Night (10PM-6AM)', 'Morning/Afternoon', 'All Shifts'];

const uomOptions = ['Pcs', 'Sets', 'KG', 'MT', 'Ltrs', 'Meters', 'SqM'];

const stockStatusColors = {
  available: 'bg-green-100 text-green-700',
  shortage: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function EditWorkOrderPage() {
  const router = useRouter();
  const params = useParams();
  const workOrderId = params.id as string;

  // Populated only from real fetched data — no mock fallback.
  const emptyFormData: WorkOrderFormData = {
    woNumber: '',
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
    priority: 'Medium',
    plannedStartDate: '',
    plannedEndDate: '',
    workCenter: '',
    secondaryWorkCenters: [],
    shift: '',
    supervisor: '',
    foreman: '',
    bomRef: '',
    routingRef: '',
    materialRequirements: [],
    operations: [],
    specialInstructions: '',
    estimatedMaterialCost: '',
    estimatedLaborCost: '',
    estimatedOverheadCost: '',
  };

  const [formData, setFormData] = useState<WorkOrderFormData>(emptyFormData);

  const [selectedSecondaryWC, setSelectedSecondaryWC] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    ProductionOrphanService.getWorkOrder(workOrderId)
      .then((data) => {
        if (cancelled) return;
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
          setNotFound(true);
          return;
        }
        const r = data || {};
        setFormData((prev) => ({
          ...prev,
          woNumber: r.woNumber ?? r.wo_number ?? r.orderNumber ?? r.order_number ?? prev.woNumber,
          productCode: r.productCode ?? r.product_code ?? prev.productCode,
          productName: r.productName ?? r.product_name ?? prev.productName,
          productDescription: r.productDescription ?? r.product_description ?? prev.productDescription,
          drawingNumber: r.drawingNumber ?? r.drawing_number ?? prev.drawingNumber,
          revision: r.revision ?? prev.revision,
          quantity: r.quantity != null ? String(r.quantity) : (r.plannedQty ?? r.planned_qty) != null ? String(r.plannedQty ?? r.planned_qty) : prev.quantity,
          uom: r.uom ?? prev.uom,
          salesOrderRef: r.salesOrderRef ?? r.sales_order_ref ?? prev.salesOrderRef,
          customerName: r.customerName ?? r.customer_name ?? prev.customerName,
          dueDate: r.dueDate ?? r.due_date ?? prev.dueDate,
          priority: (r.priority ?? prev.priority) as WorkOrderFormData['priority'],
          plannedStartDate: r.plannedStartDate ?? r.planned_start_date ?? prev.plannedStartDate,
          plannedEndDate: r.plannedEndDate ?? r.planned_end_date ?? prev.plannedEndDate,
          workCenter: r.workCenter ?? r.work_center ?? prev.workCenter,
          shift: r.shift ?? prev.shift,
          supervisor: r.supervisor ?? prev.supervisor,
          foreman: r.foreman ?? prev.foreman,
          bomRef: r.bomRef ?? r.bom_ref ?? prev.bomRef,
          routingRef: r.routingRef ?? r.routing_ref ?? prev.routingRef,
          specialInstructions: r.specialInstructions ?? r.special_instructions ?? prev.specialInstructions,
          estimatedMaterialCost: (r.materialCost ?? r.material_cost ?? r.estimatedMaterialCost ?? r.estimated_material_cost) != null ? String(r.materialCost ?? r.material_cost ?? r.estimatedMaterialCost ?? r.estimated_material_cost) : prev.estimatedMaterialCost,
          estimatedLaborCost: (r.laborCost ?? r.labor_cost ?? r.estimatedLaborCost ?? r.estimated_labor_cost) != null ? String(r.laborCost ?? r.labor_cost ?? r.estimatedLaborCost ?? r.estimated_labor_cost) : prev.estimatedLaborCost,
          estimatedOverheadCost: (r.overheadCost ?? r.overhead_cost ?? r.estimatedOverheadCost ?? r.estimated_overhead_cost) != null ? String(r.overheadCost ?? r.overhead_cost ?? r.estimatedOverheadCost ?? r.estimated_overhead_cost) : prev.estimatedOverheadCost,
        }));
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message || 'Failed to load work order');
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workOrderId]);

  const updateFormData = (field: keyof WorkOrderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      estimatedDuration: '0 hrs',
    };
    updateFormData('operations', [...formData.operations, newOp]);
  };

  const removeOperation = (index: number) => {
    if (formData.operations.length > 1) {
      updateFormData('operations', formData.operations.filter((_, i) => i !== index));
    }
  };

  const moveOperationUp = (index: number) => {
    if (index > 0) {
      const updated = [...formData.operations];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      // Update sequences
      updated.forEach((op, i) => {
        op.sequence = (i + 1) * 10;
      });
      updateFormData('operations', updated);
    }
  };

  const moveOperationDown = (index: number) => {
    if (index < formData.operations.length - 1) {
      const updated = [...formData.operations];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      // Update sequences
      updated.forEach((op, i) => {
        op.sequence = (i + 1) * 10;
      });
      updateFormData('operations', updated);
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

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      // Map local form data to the update DTO expected by the work-order service.
      const payload: any = {
        priority: formData.priority,
        plannedQuantity: parseInt(formData.quantity) || 0,
        plannedStartDate: formData.plannedStartDate,
        plannedEndDate: formData.plannedEndDate,
        notes: formData.specialInstructions,
      };
      await workOrderService.updateWorkOrder(workOrderId, payload);
      router.push(`/production/work-orders/view/${workOrderId}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to save work order');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading work order…
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <EmptyState
          icon={AlertCircle}
          title="Work order not found"
          description={error || `No work order exists for ID ${workOrderId}.`}
          action={{
            label: 'Back to Work Orders',
            onClick: () => router.push('/production/work-orders'),
            icon: ArrowLeft,
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* Header */}
          <div className="mb-3">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Work Order</span>
            </button>

            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Factory className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Work Order</h1>
                <p className="text-sm text-gray-600">Update work order information and production details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            {/* Basic WO Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Factory className="h-5 w-5 mr-2 text-orange-600" />
                Work Order Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WO Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.woNumber}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Order Reference
                  </label>
                  <input
                    type="text"
                    value={formData.salesOrderRef}
                    onChange={(e) => updateFormData('salesOrderRef', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Sales order reference"
                  />
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
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productCode}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
                  <input
                    type="text"
                    value={formData.productDescription}
                    onChange={(e) => updateFormData('productDescription', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              </div>
            </div>

            {/* Dates & Priority */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                Dates & Priority
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                </div>

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

            {/* Work Centers & Personnel */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-orange-600" />
                Work Centers & Personnel
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
                      <option key={wc} value={wc}>{wc}</option>
                    ))}
                  </select>
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
                      {workCenters.filter(wc => wc !== formData.workCenter && !formData.secondaryWorkCenters.includes(wc)).map(wc => (
                        <option key={wc} value={wc}>{wc}</option>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => updateFormData('shift', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {shifts.map(shift => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor</label>
                  <input
                    type="text"
                    value={formData.supervisor}
                    onChange={(e) => updateFormData('supervisor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Supervisor name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foreman</label>
                  <input
                    type="text"
                    value={formData.foreman}
                    onChange={(e) => updateFormData('foreman', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Foreman name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BOM Reference</label>
                  <input
                    type="text"
                    value={formData.bomRef}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Routing Reference</label>
                  <input
                    type="text"
                    value={formData.routingRef}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Material Requirements */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Box className="h-5 w-5 mr-2 text-orange-600" />
                  Material Requirements
                </h2>
                <button
                  onClick={addMaterialRequirement}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Material</span>
                </button>
              </div>

              {/* Material Shortage Alert */}
              {formData.materialRequirements.some(m => m.stockStatus === 'shortage' || m.stockStatus === 'critical') && (
                <div className="mb-2 bg-orange-50 border-l-4 border-orange-500 p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-800">Material Shortage Alert</p>
                      <p className="text-xs text-orange-700 mt-1">
                        {formData.materialRequirements.filter(m => m.stockStatus === 'shortage' || m.stockStatus === 'critical').length} items have stock shortage. Consider creating Purchase Requisition.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {formData.materialRequirements.map((material, index) => (
                  <div key={material.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Item Code</label>
                        <input
                          type="text"
                          value={material.itemCode}
                          onChange={(e) => updateMaterialRequirement(index, 'itemCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          placeholder="ITEM-CODE"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={material.description}
                          onChange={(e) => updateMaterialRequirement(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          placeholder="Material description"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Required Qty</label>
                        <input
                          type="number"
                          value={material.requiredQty}
                          onChange={(e) => updateMaterialRequirement(index, 'requiredQty', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          placeholder="1"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">UOM</label>
                        <select
                          value={material.uom}
                          onChange={(e) => updateMaterialRequirement(index, 'uom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        >
                          {uomOptions.map(uom => (
                            <option key={uom} value={uom}>{uom}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-1 flex items-end">
                        <button
                          onClick={() => removeMaterialRequirement(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         
                          disabled={formData.materialRequirements.length === 1}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="col-span-12 grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Stock Available</label>
                          <input
                            type="number"
                            value={material.stockAvailable}
                            onChange={(e) => updateMaterialRequirement(index, 'stockAvailable', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Stock Status</label>
                          <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${stockStatusColors[material.stockStatus]}`}>
                            {material.stockStatus.toUpperCase()}
                          </span>
                        </div>

                        {material.canSubstitute && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Substitute Item</label>
                            <input
                              type="text"
                              value={material.substituteItem}
                              onChange={(e) => updateMaterialRequirement(index, 'substituteItem', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                              placeholder="Alternative item code"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                  Operations / Routing
                </h2>
                <button
                  onClick={addOperation}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Operation</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.operations.map((operation, index) => (
                  <div key={operation.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Seq</label>
                        <input
                          type="number"
                          value={operation.sequence}
                          onChange={(e) => updateOperation(index, 'sequence', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-bold text-center"
                        />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Operation Name</label>
                        <input
                          type="text"
                          value={operation.operationName}
                          onChange={(e) => updateOperation(index, 'operationName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          placeholder="Operation name"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Work Center</label>
                        <select
                          value={operation.workCenter}
                          onChange={(e) => updateOperation(index, 'workCenter', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                        >
                          {workCenters.map(wc => (
                            <option key={wc} value={wc}>{wc}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Setup (min)</label>
                        <input
                          type="number"
                          value={operation.setupTime}
                          onChange={(e) => {
                            updateOperation(index, 'setupTime', e.target.value);
                            const estimated = calculateEstimatedDuration(e.target.value, operation.runTime);
                            updateOperation(index, 'estimatedDuration', estimated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          placeholder="30"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Run (min)</label>
                        <input
                          type="number"
                          value={operation.runTime}
                          onChange={(e) => {
                            updateOperation(index, 'runTime', e.target.value);
                            const estimated = calculateEstimatedDuration(operation.setupTime, e.target.value);
                            updateOperation(index, 'estimatedDuration', estimated);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                          placeholder="240"
                        />
                      </div>

                      <div className="col-span-9">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Estimated Duration</label>
                        <input
                          type="text"
                          value={operation.estimatedDuration}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium"
                        />
                      </div>

                      <div className="col-span-3 flex items-end space-x-2">
                        <button
                          onClick={() => moveOperationUp(index)}
                          className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                         
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveOperationDown(index)}
                          className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                         
                          disabled={index === formData.operations.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeOperation(index)}
                          className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         
                          disabled={formData.operations.length === 1}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-orange-600" />
                Cost Estimation
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
                placeholder="Enter any special instructions, quality requirements, or customer-specific requirements..."
              />
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
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
