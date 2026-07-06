'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Clock,
  User,
  Package,
  AlertTriangle,
  Wrench,
  CheckCircle2,
  XCircle,
  Factory,
  ClipboardList,
  Calendar,
  Timer,
  TrendingDown,
  Settings,
  RefreshCw,
  Info,
  Award,
} from 'lucide-react';

// TypeScript Interfaces
interface ProductionEntry {
  workCenter: string;
  shift: string;
  workOrder: string;
  operation: string;
  quantityProduced: number;
  startTime: string;
  endTime: string;
  actualCycleTime: number; // minutes
  okQuantity: number;
  rejectionQuantity: number;
  rejectionReason: string;
  reworkQuantity: number;
  operator: string;
  operatorId: string;
}

interface DowntimeEntry {
  id: string;
  downtimeType: 'planned' | 'unplanned';
  category: string;
  reason: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  remarks: string;
  responsiblePerson: string;
  actionTaken: string;
}

interface MaterialEntry {
  id: string;
  materialCode: string;
  materialName: string;
  requiredQuantity: number;
  consumedQuantity: number;
  scrapQuantity: number;
  scrapReason: string;
  batchNumber: string;
  lotNumber: string;
}

interface ToolChangeEntry {
  id: string;
  toolId: string;
  toolDescription: string;
  reasonForChange: 'scheduled' | 'breakage' | 'wear';
  changeoverTime: number; // minutes
  newToolId: string;
  remarks: string;
}

interface LaborEntry {
  id: string;
  operatorId: string;
  operatorName: string;
  skillLevel: string;
  laborHours: number;
  trainingHours: number;
}

export default function ProductionFloorEditPage() {
  const params = useParams();
  const router = useRouter();
  const floorId = params.id as string;

  // Production Entry State
  const [productionEntry, setProductionEntry] = useState<ProductionEntry>({
    workCenter: '',
    shift: '',
    workOrder: '',
    operation: '',
    quantityProduced: 0,
    startTime: '',
    endTime: '',
    actualCycleTime: 0,
    okQuantity: 0,
    rejectionQuantity: 0,
    rejectionReason: '',
    reworkQuantity: 0,
    operator: '',
    operatorId: '',
  });

  // Downtime Entries State
  const [downtimeEntries, setDowntimeEntries] = useState<DowntimeEntry[]>([]);

  // Material Entries State
  const [materialEntries, setMaterialEntries] = useState<MaterialEntry[]>([]);

  // Tool Change Entries State
  const [toolChangeEntries, setToolChangeEntries] = useState<ToolChangeEntry[]>([]);

  // Labor Entries State
  const [laborEntries, setLaborEntries] = useState<LaborEntry[]>([]);

  const [notes, setNotes] = useState('');
  const [backflush, setBackflush] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load the existing floor activity into the form on mount. Raw ORM fields
  // are mapped defensively so missing values fall back to the empty defaults.
  useEffect(() => {
    let cancelled = false;

    const loadActivity = async () => {
      if (!floorId) return;
      try {
        const raw: any = await ProductionOrphanService.getFloorActivity(floorId);
        if (cancelled || !raw || typeof raw !== 'object') return;

        setProductionEntry((prev) => ({
          ...prev,
          workCenter: raw.workCenter ?? prev.workCenter,
          shift: raw.shift ?? prev.shift,
          workOrder: raw.workOrder ?? raw.currentWO ?? prev.workOrder,
          operation: raw.operation ?? prev.operation,
          quantityProduced: Number(
            raw.quantityProduced ?? raw.producedQuantity ?? prev.quantityProduced
          ) || 0,
          startTime: raw.startTime ?? prev.startTime,
          endTime: raw.endTime ?? prev.endTime,
          actualCycleTime: Number(raw.actualCycleTime ?? prev.actualCycleTime) || 0,
          okQuantity: Number(raw.okQuantity ?? prev.okQuantity) || 0,
          rejectionQuantity: Number(raw.rejectionQuantity ?? prev.rejectionQuantity) || 0,
          rejectionReason: raw.rejectionReason ?? prev.rejectionReason,
          reworkQuantity: Number(raw.reworkQuantity ?? prev.reworkQuantity) || 0,
          operator: raw.operator ?? prev.operator,
          operatorId: raw.operatorId ?? prev.operatorId,
        }));
        if (raw.notes !== undefined && raw.notes !== null) {
          setNotes(String(raw.notes));
        }
      } catch (err) {
        console.error('Failed to load floor activity', err);
      }
    };

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [floorId]);

  // Dropdown Options
  const workCenters = [
    'Assembly Line 1',
    'Assembly Line 2',
    'Machining Center 1',
    'Machining Center 2',
    'Welding Station 1',
    'Welding Station 2',
    'Paint Shop 1',
    'CNC Machine 1',
    'CNC Machine 2',
    'QC Station 1',
    'Packaging Line 1',
  ];

  const shifts = [
    'Shift 1 (Morning) - 06:00 AM to 02:00 PM',
    'Shift 2 (Afternoon) - 02:00 PM to 10:00 PM',
    'Shift 3 (Night) - 10:00 PM to 06:00 AM',
  ];

  const workOrders = [
    'WO-2025-0145 - Electric Motor - 5HP',
    'WO-2025-0146 - Shaft - 50mm Dia',
    'WO-2025-0147 - Frame Assembly',
    'WO-2025-0148 - Cabinet - Powder Coated',
    'WO-2025-0149 - Control Panel',
    'WO-2025-0150 - Gear - 20 Teeth',
  ];

  const operations = [
    'OP-010 - Material Cutting',
    'OP-020 - Machining',
    'OP-030 - Drilling',
    'OP-040 - Welding',
    'OP-050 - Grinding',
    'OP-060 - Assembly',
    'OP-070 - Painting',
    'OP-080 - Quality Inspection',
    'OP-090 - Packaging',
  ];

  const rejectionReasons = [
    'Dimension Out of Tolerance',
    'Surface Defect',
    'Material Defect',
    'Welding Defect',
    'Paint Defect',
    'Assembly Error',
    'Tool Wear',
    'Machine Setting Error',
    'Operator Error',
    'Quality Check Failure',
    'Incomplete Operation',
    'Contamination',
    'Other',
  ];

  const downtimeCategories = {
    planned: [
      'Setup / Changeover',
      'Planned Maintenance',
      'Tea Break',
      'Lunch Break',
      'Shift Handover',
      'Training',
      'Meeting',
    ],
    unplanned: [
      'Machine Breakdown',
      'Tool Breakage',
      'Tool Change Required',
      'Material Shortage',
      'Material Quality Issue',
      'Power Cut / Failure',
      'Compressed Air Failure',
      'Coolant System Failure',
      'Hydraulic System Failure',
      'Electrical Problem',
      'Quality Issue / Rejection',
      'Waiting for Inspection',
      'Waiting for Material',
      'Waiting for Crane',
      'Waiting for Maintenance',
      'Operator Absence',
      'Operator Not Skilled',
      'Drawing / Documentation Issue',
      'Fixture / Jig Problem',
      'Measurement Gauge Issue',
      'Computer / Software Problem',
      'Safety Incident',
      'Fire Alarm / Evacuation',
      'Customer / Management Visit',
      'Other',
    ],
  };

  const scrapReasons = [
    'Process Waste',
    'Material Defect',
    'Cutting Waste',
    'Trial Piece',
    'Setup Rejection',
    'Quality Rejection',
    'Contamination',
    'Handling Damage',
    'Other',
  ];

  const operators = [
    { id: 'EMP-1234', name: 'Amit Sharma' },
    { id: 'EMP-1235', name: 'Suresh Patel' },
    { id: 'EMP-1236', name: 'Vikram Singh' },
    { id: 'EMP-1237', name: 'Ramesh Yadav' },
    { id: 'EMP-1238', name: 'Deepak Verma' },
    { id: 'EMP-1239', name: 'Manoj Kumar' },
    { id: 'EMP-1240', name: 'Priya Desai' },
    { id: 'EMP-1241', name: 'Sunita Rao' },
  ];

  const skillLevels = ['Trainee', 'Level 1', 'Level 2', 'Level 3', 'Expert'];

  // Add Downtime Entry
  const addDowntimeEntry = () => {
    const newEntry: DowntimeEntry = {
      id: Date.now().toString(),
      downtimeType: 'unplanned',
      category: '',
      reason: '',
      startTime: '',
      endTime: '',
      duration: 0,
      remarks: '',
      responsiblePerson: '',
      actionTaken: '',
    };
    setDowntimeEntries([...downtimeEntries, newEntry]);
  };

  // Remove Downtime Entry
  const removeDowntimeEntry = (id: string) => {
    setDowntimeEntries(downtimeEntries.filter((entry) => entry.id !== id));
  };

  // Update Downtime Entry
  const updateDowntimeEntry = (id: string, field: string, value: any) => {
    setDowntimeEntries(
      downtimeEntries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };

          // Auto-calculate duration if both times are set
          if (field === 'startTime' || field === 'endTime') {
            if (updated.startTime && updated.endTime) {
              const start = new Date(`2025-01-15 ${updated.startTime}`);
              const end = new Date(`2025-01-15 ${updated.endTime}`);
              const diffMs = end.getTime() - start.getTime();
              updated.duration = Math.round(diffMs / 60000); // Convert to minutes
            }
          }

          return updated;
        }
        return entry;
      })
    );
  };

  // Add Material Entry
  const addMaterialEntry = () => {
    const newEntry: MaterialEntry = {
      id: Date.now().toString(),
      materialCode: '',
      materialName: '',
      requiredQuantity: 0,
      consumedQuantity: 0,
      scrapQuantity: 0,
      scrapReason: '',
      batchNumber: '',
      lotNumber: '',
    };
    setMaterialEntries([...materialEntries, newEntry]);
  };

  // Remove Material Entry
  const removeMaterialEntry = (id: string) => {
    setMaterialEntries(materialEntries.filter((entry) => entry.id !== id));
  };

  // Update Material Entry
  const updateMaterialEntry = (id: string, field: string, value: any) => {
    setMaterialEntries(
      materialEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  // Add Tool Change Entry
  const addToolChangeEntry = () => {
    const newEntry: ToolChangeEntry = {
      id: Date.now().toString(),
      toolId: '',
      toolDescription: '',
      reasonForChange: 'scheduled',
      changeoverTime: 0,
      newToolId: '',
      remarks: '',
    };
    setToolChangeEntries([...toolChangeEntries, newEntry]);
  };

  // Remove Tool Change Entry
  const removeToolChangeEntry = (id: string) => {
    setToolChangeEntries(toolChangeEntries.filter((entry) => entry.id !== id));
  };

  // Update Tool Change Entry
  const updateToolChangeEntry = (id: string, field: string, value: any) => {
    setToolChangeEntries(
      toolChangeEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    );
  };

  // Add Labor Entry
  const addLaborEntry = () => {
    const newEntry: LaborEntry = {
      id: Date.now().toString(),
      operatorId: '',
      operatorName: '',
      skillLevel: '',
      laborHours: 0,
      trainingHours: 0,
    };
    setLaborEntries([...laborEntries, newEntry]);
  };

  // Remove Labor Entry
  const removeLaborEntry = (id: string) => {
    setLaborEntries(laborEntries.filter((entry) => entry.id !== id));
  };

  // Update Labor Entry
  const updateLaborEntry = (id: string, field: string, value: any) => {
    setLaborEntries(
      laborEntries.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, [field]: value };

          // Auto-fill operator name when ID is selected
          if (field === 'operatorId') {
            const operator = operators.find((op) => op.id === value);
            if (operator) {
              updated.operatorName = operator.name;
            }
          }

          return updated;
        }
        return entry;
      })
    );
  };

  // Auto-calculate cycle time
  const calculateCycleTime = () => {
    if (productionEntry.startTime && productionEntry.endTime && productionEntry.quantityProduced > 0) {
      const start = new Date(`2025-01-15 ${productionEntry.startTime}`);
      const end = new Date(`2025-01-15 ${productionEntry.endTime}`);
      const diffMs = end.getTime() - start.getTime();
      const totalMinutes = diffMs / 60000;
      const cycleTime = totalMinutes / productionEntry.quantityProduced;
      setProductionEntry({ ...productionEntry, actualCycleTime: Math.round(cycleTime) });
    }
  };

  // Auto-fill operator info
  const handleOperatorChange = (operatorId: string) => {
    const operator = operators.find((op) => op.id === operatorId);
    if (operator) {
      setProductionEntry({
        ...productionEntry,
        operatorId: operator.id,
        operator: operator.name,
      });
    }
  };

  // Handle Backflush
  const handleBackflush = () => {
    if (backflush) {
      // Auto-populate material entries from BOM
      const bomMaterials: MaterialEntry[] = [
        {
          id: Date.now().toString() + '-1',
          materialCode: 'RM-SS-304-001',
          materialName: 'Stainless Steel 304 - Sheet 2mm',
          requiredQuantity: 250,
          consumedQuantity: 245,
          scrapQuantity: 5,
          scrapReason: 'Process Waste',
          batchNumber: 'BTH-2025-0234',
          lotNumber: 'LOT-SS304-098',
        },
        {
          id: Date.now().toString() + '-2',
          materialCode: 'RM-BR-M12-005',
          materialName: 'Bolt M12x50 - Grade 8.8',
          requiredQuantity: 1200,
          consumedQuantity: 1195,
          scrapQuantity: 5,
          scrapReason: 'Process Waste',
          batchNumber: 'BTH-2025-0245',
          lotNumber: 'LOT-BR-M12-156',
        },
      ];
      setMaterialEntries(bomMaterials);
    } else {
      setMaterialEntries([]);
    }
  };

  // Handle Save
  const handleSave = async () => {
    // Validation
    if (!productionEntry.workCenter) {
      alert('Please select work center');
      return;
    }
    if (!productionEntry.shift) {
      alert('Please select shift');
      return;
    }
    if (!productionEntry.workOrder) {
      alert('Please select work order');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...productionEntry,
        downtimeEntries,
        materialEntries,
        toolChangeEntries,
        laborEntries,
        notes,
        backflush,
      };
      await ProductionOrphanService.updateFloorActivity(floorId, payload);
      router.push(`/production/floor/view/${floorId}`);
    } catch (err) {
      console.error('Failed to save production entry', err);
      alert('Failed to save production data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push(`/production/floor/view/${floorId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Record Production Entry</h1>
              <p className="text-gray-600">Production Floor A - {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Production Entry</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Work Center & Shift Selection */}
        <div className="bg-white rounded-lg border p-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Factory className="w-6 h-6 text-blue-600" />
            <span>Work Center & Shift</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Center <span className="text-red-500">*</span>
              </label>
              <select
                value={productionEntry.workCenter}
                onChange={(e) => setProductionEntry({ ...productionEntry, workCenter: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Work Center</option>
                {workCenters.map((wc) => (
                  <option key={wc} value={wc}>
                    {wc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Shift <span className="text-red-500">*</span>
              </label>
              <select
                value={productionEntry.shift}
                onChange={(e) => setProductionEntry({ ...productionEntry, shift: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Production Entry Section */}
        <div className="bg-white rounded-lg border p-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <ClipboardList className="w-6 h-6 text-green-600" />
            <span>Production Entry</span>
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Order <span className="text-red-500">*</span>
                </label>
                <select
                  value={productionEntry.workOrder}
                  onChange={(e) => setProductionEntry({ ...productionEntry, workOrder: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Work Order</option>
                  {workOrders.map((wo) => (
                    <option key={wo} value={wo}>
                      {wo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operation <span className="text-red-500">*</span>
                </label>
                <select
                  value={productionEntry.operation}
                  onChange={(e) => setProductionEntry({ ...productionEntry, operation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Operation</option>
                  {operations.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={productionEntry.startTime}
                  onChange={(e) => setProductionEntry({ ...productionEntry, startTime: e.target.value })}
                  onBlur={calculateCycleTime}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={productionEntry.endTime}
                  onChange={(e) => setProductionEntry({ ...productionEntry, endTime: e.target.value })}
                  onBlur={calculateCycleTime}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Cycle Time (min)
                </label>
                <input
                  type="number"
                  value={productionEntry.actualCycleTime}
                  onChange={(e) =>
                    setProductionEntry({
                      ...productionEntry,
                      actualCycleTime: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Produced
                </label>
                <input
                  type="number"
                  value={productionEntry.quantityProduced}
                  onChange={(e) =>
                    setProductionEntry({
                      ...productionEntry,
                      quantityProduced: parseInt(e.target.value) || 0,
                    })
                  }
                  onBlur={calculateCycleTime}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>OK Quantity</span>
                </label>
                <input
                  type="number"
                  value={productionEntry.okQuantity}
                  onChange={(e) =>
                    setProductionEntry({
                      ...productionEntry,
                      okQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Rejection Qty</span>
                </label>
                <input
                  type="number"
                  value={productionEntry.rejectionQuantity}
                  onChange={(e) =>
                    setProductionEntry({
                      ...productionEntry,
                      rejectionQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                  <span>Rework Qty</span>
                </label>
                <input
                  type="number"
                  value={productionEntry.reworkQuantity}
                  onChange={(e) =>
                    setProductionEntry({
                      ...productionEntry,
                      reworkQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
              <select
                value={productionEntry.rejectionReason}
                onChange={(e) =>
                  setProductionEntry({ ...productionEntry, rejectionReason: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Rejection Reason</option>
                {rejectionReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operator <span className="text-red-500">*</span>
                </label>
                <select
                  value={productionEntry.operatorId}
                  onChange={(e) => handleOperatorChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Operator</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operator Name</label>
                <input
                  type="text"
                  value={productionEntry.operator}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Downtime Logging */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span>Downtime Logging</span>
            </h2>
            <button
              onClick={addDowntimeEntry}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Downtime</span>
            </button>
          </div>

          {downtimeEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mb-2 text-gray-400" />
              <p>No downtime entries. Click "Add Downtime" to log downtime.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {downtimeEntries.map((entry, index) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Downtime Entry #{index + 1}</h3>
                    <button
                      onClick={() => removeDowntimeEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Downtime Type
                      </label>
                      <select
                        value={entry.downtimeType}
                        onChange={(e) =>
                          updateDowntimeEntry(entry.id, 'downtimeType', e.target.value as 'planned' | 'unplanned')
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="planned">Planned</option>
                        <option value="unplanned">Unplanned</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                      <select
                        value={entry.reason}
                        onChange={(e) => updateDowntimeEntry(entry.id, 'reason', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Reason</option>
                        <optgroup label="Planned Downtime">
                          {downtimeCategories.planned.map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Unplanned Downtime">
                          {downtimeCategories.unplanned.map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateDowntimeEntry(entry.id, 'startTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateDowntimeEntry(entry.id, 'endTime', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={entry.duration}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Responsible Person
                      </label>
                      <input
                        type="text"
                        value={entry.responsiblePerson}
                        onChange={(e) =>
                          updateDowntimeEntry(entry.id, 'responsiblePerson', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Name or department"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Action Taken
                      </label>
                      <input
                        type="text"
                        value={entry.actionTaken}
                        onChange={(e) => updateDowntimeEntry(entry.id, 'actionTaken', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Action taken to resolve"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      value={entry.remarks}
                      onChange={(e) => updateDowntimeEntry(entry.id, 'remarks', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional remarks..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Material Consumption Entry */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Package className="w-6 h-6 text-purple-600" />
              <span>Material Consumption Entry</span>
            </h2>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={backflush}
                  onChange={(e) => {
                    setBackflush(e.target.checked);
                    handleBackflush();
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Backflush (Auto from BOM)</span>
              </label>
              <button
                onClick={addMaterialEntry}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Material</span>
              </button>
            </div>
          </div>

          {materialEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mb-2 text-gray-400" />
              <p>No material entries. Enable backflush or add manually.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {materialEntries.map((entry, index) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Material Entry #{index + 1}</h3>
                    <button
                      onClick={() => removeMaterialEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Code
                      </label>
                      <input
                        type="text"
                        value={entry.materialCode}
                        onChange={(e) => updateMaterialEntry(entry.id, 'materialCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="RM-XXX-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Name
                      </label>
                      <input
                        type="text"
                        value={entry.materialName}
                        onChange={(e) => updateMaterialEntry(entry.id, 'materialName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Material description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Qty
                      </label>
                      <input
                        type="number"
                        value={entry.requiredQuantity}
                        onChange={(e) =>
                          updateMaterialEntry(entry.id, 'requiredQuantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consumed Qty
                      </label>
                      <input
                        type="number"
                        value={entry.consumedQuantity}
                        onChange={(e) =>
                          updateMaterialEntry(entry.id, 'consumedQuantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scrap Qty</label>
                      <input
                        type="number"
                        value={entry.scrapQuantity}
                        onChange={(e) =>
                          updateMaterialEntry(entry.id, 'scrapQuantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Scrap Reason
                      </label>
                      <select
                        value={entry.scrapReason}
                        onChange={(e) => updateMaterialEntry(entry.id, 'scrapReason', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Reason</option>
                        {scrapReasons.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        value={entry.batchNumber}
                        onChange={(e) => updateMaterialEntry(entry.id, 'batchNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="BTH-XXXX-XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lot Number</label>
                      <input
                        type="text"
                        value={entry.lotNumber}
                        onChange={(e) => updateMaterialEntry(entry.id, 'lotNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="LOT-XXXX-XXXX"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool Change Logging */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Wrench className="w-6 h-6 text-orange-600" />
              <span>Tool Change Logging</span>
            </h2>
            <button
              onClick={addToolChangeEntry}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tool Change</span>
            </button>
          </div>

          {toolChangeEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 mb-2 text-gray-400" />
              <p>No tool changes logged. Click "Add Tool Change" if any tools were changed.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {toolChangeEntries.map((entry, index) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Tool Change #{index + 1}</h3>
                    <button
                      onClick={() => removeToolChangeEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Old Tool ID
                      </label>
                      <input
                        type="text"
                        value={entry.toolId}
                        onChange={(e) => updateToolChangeEntry(entry.id, 'toolId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="TL-XXX-XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tool Description
                      </label>
                      <input
                        type="text"
                        value={entry.toolDescription}
                        onChange={(e) =>
                          updateToolChangeEntry(entry.id, 'toolDescription', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tool description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Change
                      </label>
                      <select
                        value={entry.reasonForChange}
                        onChange={(e) =>
                          updateToolChangeEntry(entry.id, 'reasonForChange', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="scheduled">Scheduled Maintenance</option>
                        <option value="breakage">Tool Breakage</option>
                        <option value="wear">Tool Wear</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Changeover Time (min)
                      </label>
                      <input
                        type="number"
                        value={entry.changeoverTime}
                        onChange={(e) =>
                          updateToolChangeEntry(entry.id, 'changeoverTime', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Tool ID
                      </label>
                      <input
                        type="text"
                        value={entry.newToolId}
                        onChange={(e) => updateToolChangeEntry(entry.id, 'newToolId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="TL-XXX-XXX"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      value={entry.remarks}
                      onChange={(e) => updateToolChangeEntry(entry.id, 'remarks', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional remarks about tool change..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operator Performance / Labor Entry */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-6 h-6 text-blue-600" />
              <span>Multiple Operator / Labor Entry</span>
            </h2>
            <button
              onClick={addLaborEntry}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Operator</span>
            </button>
          </div>

          {laborEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mb-2 text-gray-400" />
              <p>No labor entries. Add operators if multiple operators worked on this WO.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {laborEntries.map((entry, index) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Operator #{index + 1}</h3>
                    <button
                      onClick={() => removeLaborEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operator ID
                      </label>
                      <select
                        value={entry.operatorId}
                        onChange={(e) => updateLaborEntry(entry.id, 'operatorId', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Operator</option>
                        {operators.map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.id} - {op.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operator Name
                      </label>
                      <input
                        type="text"
                        value={entry.operatorName}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skill Level
                      </label>
                      <select
                        value={entry.skillLevel}
                        onChange={(e) => updateLaborEntry(entry.id, 'skillLevel', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Skill Level</option>
                        {skillLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Labor Hours
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={entry.laborHours}
                        onChange={(e) =>
                          updateLaborEntry(entry.id, 'laborHours', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Training Hours
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={entry.trainingHours}
                        onChange={(e) =>
                          updateLaborEntry(entry.id, 'trainingHours', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes and Remarks */}
        <div className="bg-white rounded-lg border p-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Info className="w-6 h-6 text-gray-600" />
            <span>Notes and Remarks</span>
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any additional notes, observations, or remarks about this production entry..."
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push(`/production/floor/view/${floorId}`)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Production Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
}
