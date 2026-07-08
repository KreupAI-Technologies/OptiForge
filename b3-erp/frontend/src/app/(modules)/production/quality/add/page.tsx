"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProductionOrphanService } from "@/services/production/production-orphan.service";
import {
  Save,
  X,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  User,
  Calendar,
  Target,
  Ruler,
  Weight,
  Wrench,
  Camera,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  FileText,
  Send,
  Beaker,
  Activity,
  Download,
} from "lucide-react";

// TypeScript Interfaces
interface TestParameter {
  id: string;
  parameterName: string;
  type: string;
  specification: string;
  nominalValue: number;
  upperTolerance: number;
  lowerTolerance: number;
  unit: string;
  actualMeasurement: number | string;
  testMethod: string;
  acceptanceCriteria: string;
  result: "pass" | "fail" | "";
  deviation: number;
  remarks?: string;
}

interface WorkOrder {
  id: string;
  product: string;
  productCode: string;
  quantity: number;
  qualitySpecs: TestParameter[];
}

interface Defect {
  type: string;
  quantity: number;
  location: string;
  severity: "critical" | "major" | "minor";
}

const QualityInspectionAddPage = () => {
  const router = useRouter();

  const [inspectionId, setInspectionId] = useState("");
  const [inspectionType, setInspectionType] = useState("final");
  const [workOrderId, setWorkOrderId] = useState("");
  const [workOrderSearch, setWorkOrderSearch] = useState("");
  const [showWOSelector, setShowWOSelector] = useState(false);
  const [availableWOs, setAvailableWOs] = useState<WorkOrder[]>([]);
  const [product, setProduct] = useState("");
  const [productCode, setProductCode] = useState("");
  const [inspector, setInspector] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [shift, setShift] = useState("Morning");
  const [lotSize, setLotSize] = useState(0);
  const [sampleSize, setSampleSize] = useState(0);
  const [samplingPlan, setSamplingPlan] = useState("Normal Inspection Level II");
  const [aqlLevel, setAqlLevel] = useState("1.5");
  const [lotNumber, setLotNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState<string[]>([]);
  const [testParameters, setTestParameters] = useState<TestParameter[]>([]);
  const [overallDisposition, setOverallDisposition] = useState("Accept");
  const [inspectorSignature, setInspectorSignature] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [specsError, setSpecsError] = useState<string | null>(null);

  // NCR fields
  const [showNCR, setShowNCR] = useState(false);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [disposition, setDisposition] = useState("rework");

  // Generate Inspection ID on mount
  useEffect(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    setInspectionId(`QC-${year}-${random}`);

    // Set default date to today
    const today = new Date();
    const dateString = today.toISOString().slice(0, 16);
    setInspectionDate(dateString);

    // Load real work orders for the dropdown
    const loadWorkOrders = async () => {
      try {
        const res: any = await ProductionOrphanService.getWorkOrders();
        const data = Array.isArray(res) ? res : (res?.data ?? res);
        const mapped: WorkOrder[] = Array.isArray(data)
          ? data.map((wo: any) => ({
              id: wo?.id ?? "",
              product: wo?.product ?? wo?.productName ?? "",
              productCode:
                wo?.productCode ?? wo?.workOrderNumber ?? wo?.woNumber ?? wo?.code ?? "",
              quantity: wo?.quantity ?? 0,
              qualitySpecs: Array.isArray(wo?.qualitySpecs) ? wo.qualitySpecs : [],
            }))
          : [];
        setAvailableWOs(mapped);
      } catch {
        setAvailableWOs([]);
      }
    };

    loadWorkOrders();
  }, []);

  // Auto-suggest sample size based on lot size and AQL
  useEffect(() => {
    if (lotSize > 0) {
      // Simplified AQL sample size calculation
      if (lotSize <= 150) setSampleSize(13);
      else if (lotSize <= 280) setSampleSize(20);
      else if (lotSize <= 500) setSampleSize(32);
      else if (lotSize <= 1200) setSampleSize(50);
      else if (lotSize <= 3200) setSampleSize(80);
      else if (lotSize <= 10000) setSampleSize(125);
      else setSampleSize(200);
    }
  }, [lotSize, aqlLevel]);

  const handleWOSelect = (wo: WorkOrder) => {
    setWorkOrderId(wo.id);
    setProduct(wo.product);
    setProductCode(wo.productCode);
    setLotSize(wo.quantity);

    // Load quality specs from product/WO
    if (wo.qualitySpecs && wo.qualitySpecs.length > 0) {
      setTestParameters(
        wo.qualitySpecs.map((spec) => ({
          ...spec,
          id: `tp-${Date.now()}-${Math.random()}`,
        }))
      );
    }

    setShowWOSelector(false);
  };

  const handleAddParameter = () => {
    const newParam: TestParameter = {
      id: `tp-${Date.now()}`,
      parameterName: "",
      type: "Dimensional",
      specification: "",
      nominalValue: 0,
      upperTolerance: 0,
      lowerTolerance: 0,
      unit: "",
      actualMeasurement: "",
      testMethod: "",
      acceptanceCriteria: "",
      result: "",
      deviation: 0,
    };
    setTestParameters([...testParameters, newParam]);
  };

  // Load quality specifications (test parameters) from the product master /
  // active quality plan for the selected work order or product.
  const handleLoadSpecs = async () => {
    setSpecsError(null);
    setLoadingSpecs(true);
    try {
      const specs: any = await ProductionOrphanService.getQualitySpecs({
        workOrderId: workOrderId || undefined,
        productCode: productCode || undefined,
      });
      const params = Array.isArray(specs?.parameters) ? specs.parameters : [];
      if (params.length === 0) {
        setSpecsError(
          "No quality specifications found for this product. Add custom parameters instead.",
        );
        return;
      }
      const mapped: TestParameter[] = params.map((p: any, i: number) => ({
        id: `tp-spec-${Date.now()}-${i}`,
        parameterName: p?.parameterName ?? "",
        type: p?.type ?? "Dimensional",
        specification: p?.specification ?? "",
        nominalValue: Number(p?.nominalValue) || 0,
        upperTolerance: Number(p?.upperTolerance) || 0,
        lowerTolerance: Number(p?.lowerTolerance) || 0,
        unit: p?.unit ?? "",
        actualMeasurement: "",
        testMethod: p?.testMethod ?? "",
        acceptanceCriteria: p?.acceptanceCriteria ?? "",
        result: "",
        deviation: 0,
      }));
      setTestParameters(mapped);
      if (specs?.product && !product) setProduct(specs.productName ?? specs.product);
    } catch (err: any) {
      setSpecsError(err?.message ?? "Failed to load specifications from product master.");
    } finally {
      setLoadingSpecs(false);
    }
  };

  const handleRemoveParameter = (id: string) => {
    setTestParameters(testParameters.filter((p) => p.id !== id));
  };

  const handleParameterChange = (
    id: string,
    field: keyof TestParameter,
    value: any
  ) => {
    setTestParameters(
      testParameters.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };

          // Auto-calculate result and deviation
          if (field === "actualMeasurement" && value !== "") {
            const actual = parseFloat(value);
            if (
              actual >= updated.lowerTolerance &&
              actual <= updated.upperTolerance
            ) {
              updated.result = "pass";
            } else {
              updated.result = "fail";
            }

            // Calculate deviation percentage
            if (updated.nominalValue !== 0) {
              updated.deviation =
                ((actual - updated.nominalValue) / updated.nominalValue) * 100;
            }
          }

          return updated;
        }
        return p;
      })
    );
  };

  const handleAddDefect = () => {
    setDefects([
      ...defects,
      { type: "", quantity: 0, location: "", severity: "minor" },
    ]);
  };

  const handleRemoveDefect = (index: number) => {
    setDefects(defects.filter((_, i) => i !== index));
  };

  const handleDefectChange = (
    index: number,
    field: keyof Defect,
    value: any
  ) => {
    setDefects(
      defects.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const buildPayload = () => ({
    inspectionId,
    inspectionType,
    workOrderId,
    product,
    productCode,
    inspector,
    inspectionDate,
    shift,
    lotSize,
    sampleSize,
    samplingPlan,
    aqlLevel,
    lotNumber,
    batchNumber,
    equipmentUsed,
    testParameters,
    overallDisposition,
    inspectorSignature,
    defects,
    rootCause,
    correctiveAction,
    preventiveAction,
    disposition,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await ProductionOrphanService.createNcr({
        ...buildPayload(),
        status: "draft",
      });
      router.push("/production/quality");
    } catch (err) {
      alert("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!workOrderId) {
      alert("Please select a work order");
      return;
    }

    setSaving(true);
    try {
      await ProductionOrphanService.createNcr({
        ...buildPayload(),
        status: "open",
      });
      router.push("/production/quality");
    } catch (err) {
      alert("Failed to submit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteInspection = async () => {
    if (!workOrderId) {
      alert("Please select a work order");
      return;
    }

    if (testParameters.some((p) => p.actualMeasurement === "")) {
      alert("Please complete all measurements");
      return;
    }

    setSaving(true);
    try {
      await ProductionOrphanService.createNcr({
        ...buildPayload(),
        status: "closed",
      });
      router.push("/production/quality");
    } catch (err) {
      alert("Failed to complete inspection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const calculatePassRate = () => {
    const passed = testParameters.filter((p) => p.result === "pass").length;
    return testParameters.length > 0
      ? ((passed / testParameters.length) * 100).toFixed(1)
      : "0.0";
  };

  const filteredWOs = availableWOs.filter(
    (wo) =>
      wo.id.toLowerCase().includes(workOrderSearch.toLowerCase()) ||
      wo.product.toLowerCase().includes(workOrderSearch.toLowerCase()) ||
      wo.productCode.toLowerCase().includes(workOrderSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Quality Inspection
            </h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                {inspectionId}
              </span>
              <span className="text-gray-600">Auto-generated</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save as Draft
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              <Send className="w-4 h-4" />
              Submit for Approval
            </button>
            <button
              onClick={handleCompleteInspection}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Inspection
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left Panel - Basic Info */}
        <div className="col-span-4 space-y-3">
          {/* Inspection Type */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Beaker className="w-5 h-5" />
              Inspection Type Selection
            </h3>
            <div className="space-y-2">
              {[
                {
                  value: "first_article",
                  label: "First Article Inspection",
                  desc: "First piece validation",
                },
                {
                  value: "in_process",
                  label: "In-Process Inspection",
                  desc: "During production",
                },
                { value: "final", label: "Final Inspection", desc: "Before shipment" },
                {
                  value: "receiving",
                  label: "Receiving Inspection",
                  desc: "Incoming materials",
                },
              ].map((type) => (
                <label
                  key={type.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    inspectionType === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="inspectionType"
                    value={type.value}
                    checked={inspectionType === type.value}
                    onChange={(e) => setInspectionType(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Work Order Selection */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Work Order Selection
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search work order..."
                  value={workOrderId}
                  onClick={() => setShowWOSelector(true)}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                />
              </div>

              {showWOSelector && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-96">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      Select Work Order
                    </h4>
                    <button
                      onClick={() => setShowWOSelector(false)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={workOrderSearch}
                    onChange={(e) => setWorkOrderSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                  />
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredWOs.map((wo) => (
                      <button
                        key={wo.id}
                        onClick={() => handleWOSelect(wo)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{wo.id}</div>
                        <div className="text-sm text-gray-700">{wo.product}</div>
                        <div className="text-xs text-gray-600">
                          {wo.productCode} | Qty: {wo.quantity}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900">{product}</div>
                  <div className="text-sm text-blue-700">{productCode}</div>
                </div>
              )}
            </div>
          </div>

          {/* Inspector Details */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <User className="w-5 h-5" />
              Inspector Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector
                </label>
                <select
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Inspector</option>
                  <option value="Rajesh Kumar">Rajesh Kumar</option>
                  <option value="Priya Sharma">Priya Sharma</option>
                  <option value="Amit Patel">Amit Patel</option>
                  <option value="Sunita Desai">Sunita Desai</option>
                  <option value="Vikram Singh">Vikram Singh</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Date
                </label>
                <input
                  type="datetime-local"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Morning">Morning (6 AM - 2 PM)</option>
                  <option value="Afternoon">Afternoon (2 PM - 10 PM)</option>
                  <option value="Night">Night (10 PM - 6 AM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sample Selection */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Sample Selection
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Lot Size
                </label>
                <input
                  type="number"
                  value={lotSize}
                  onChange={(e) => setLotSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sample Size
                </label>
                <input
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Auto-suggested: {sampleSize} based on lot size
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sampling Plan
                </label>
                <select
                  value={samplingPlan}
                  onChange={(e) => setSamplingPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Normal Inspection Level II">
                    Normal Inspection Level II
                  </option>
                  <option value="Tightened Inspection">
                    Tightened Inspection
                  </option>
                  <option value="Reduced Inspection">Reduced Inspection</option>
                  <option value="Special Level S-1">Special Level S-1</option>
                  <option value="Special Level S-2">Special Level S-2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AQL Level (Acceptance Quality Limit)
                </label>
                <select
                  value={aqlLevel}
                  onChange={(e) => setAqlLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0.065">0.065 (Six Sigma)</option>
                  <option value="0.10">0.10</option>
                  <option value="0.15">0.15</option>
                  <option value="0.25">0.25</option>
                  <option value="0.40">0.40</option>
                  <option value="0.65">0.65</option>
                  <option value="1.0">1.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2.5">2.5</option>
                  <option value="4.0">4.0</option>
                  <option value="6.5">6.5</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lot Number
                </label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="LOT-2025-XXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="BATCH-2025-W42-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Equipment Calibration */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Equipment Calibration Check
            </h3>
            <div className="space-y-2">
              {[
                "Digital Micrometer DM-450",
                "Vernier Caliper VC-300",
                "Hardness Tester HT-200",
                "Surface Roughness Tester SRT-100",
                "Precision Balance PB-500",
                "CMM Coordinate Measuring Machine",
              ].map((equipment) => (
                <label
                  key={equipment}
                  className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-900 flex-1">
                    {equipment}
                  </span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Middle & Right Panel - Test Parameters */}
        <div className="col-span-8 space-y-3">
          {/* Quality Parameters Section */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Quality Parameters Entry
              </h3>
              <div className="flex gap-2">
                {(workOrderId || productCode) && (
                  <button
                    type="button"
                    onClick={handleLoadSpecs}
                    disabled={loadingSpecs}
                    title="Load quality specs from the product master / active quality plan"
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    {loadingSpecs ? "Loading…" : "Load from Product Master"}
                  </button>
                )}
                <button
                  onClick={handleAddParameter}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Parameter
                </button>
              </div>
            </div>

            {specsError && (
              <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {specsError}
              </div>
            )}

            <div className="space-y-2">
              {testParameters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Ruler className="w-12 h-12 mb-3 opacity-50" />
                  <p>No quality parameters defined</p>
                  <p className="text-sm">
                    Select a work order to load specs or add custom parameters
                  </p>
                </div>
              ) : (
                testParameters.map((param) => (
                  <div
                    key={param.id}
                    className="border border-gray-300 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Test Parameter
                      </h4>
                      <button
                        onClick={() => handleRemoveParameter(param.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Parameter Name
                        </label>
                        <input
                          type="text"
                          value={param.parameterName}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "parameterName",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Thickness, Width, Weight, Hardness, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={param.type}
                          onChange={(e) =>
                            handleParameterChange(param.id, "type", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Dimensional">Dimensional</option>
                          <option value="Physical">Physical</option>
                          <option value="Chemical">Chemical</option>
                          <option value="Visual">Visual</option>
                          <option value="Functional">Functional</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={param.unit}
                          onChange={(e) =>
                            handleParameterChange(param.id, "unit", e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="mm, kg, HRC, Ra, etc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nominal Value
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={param.nominalValue}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "nominalValue",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Upper Tolerance
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={param.upperTolerance}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "upperTolerance",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Lower Tolerance
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={param.lowerTolerance}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "lowerTolerance",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Actual Measurement
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          value={param.actualMeasurement}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "actualMeasurement",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter measured value"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Test Method
                        </label>
                        <select
                          value={param.testMethod}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "testMethod",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Method</option>
                          <option value="Digital Micrometer">
                            Digital Micrometer
                          </option>
                          <option value="Vernier Caliper">Vernier Caliper</option>
                          <option value="Hardness Tester">Hardness Tester</option>
                          <option value="Surface Roughness Tester">
                            Surface Roughness Tester
                          </option>
                          <option value="Visual">Visual Inspection</option>
                          <option value="CMM">CMM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Acceptance Criteria
                        </label>
                        <input
                          type="text"
                          value={param.acceptanceCriteria}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "acceptanceCriteria",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Within tolerance"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Remarks
                        </label>
                        <input
                          type="text"
                          value={param.remarks || ""}
                          onChange={(e) =>
                            handleParameterChange(
                              param.id,
                              "remarks",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Auto-calculated Result */}
                    {param.result && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {param.result === "pass" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span
                            className={`font-medium ${
                              param.result === "pass"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {param.result === "pass" ? "PASS" : "FAIL"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Deviation:{" "}
                          <span
                            className={`font-medium ${
                              Math.abs(param.deviation) <= 10
                                ? "text-green-600"
                                : Math.abs(param.deviation) <= 30
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {param.deviation > 0 ? "+" : ""}
                            {param.deviation.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Visual Inspection Checklist */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visual Inspection Checklist (15 items)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                "Surface Defects",
                "Corrosion",
                "Cracks",
                "Dents",
                "Scratches",
                "Discoloration",
                "Contamination",
                "Marking & Labeling",
                "Packaging",
                "Burrs & Sharp Edges",
                "Rust",
                "Oil Stains",
                "Foreign Material",
                "Dimensional Integrity",
                "Overall Appearance",
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-900">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Functional Testing */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Functional Testing
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation Test
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select</option>
                  <option value="smooth">Smooth</option>
                  <option value="rough">Rough</option>
                  <option value="stuck">Stuck</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noise Level
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="minimal">Minimal</option>
                  <option value="excessive">Excessive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vibration Test
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select</option>
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="excessive">Excessive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Bearing Test
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
          </div>

          {/* Overall Result */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2">
              Overall Result & Disposition
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Disposition
                </label>
                <select
                  value={overallDisposition}
                  onChange={(e) => {
                    setOverallDisposition(e.target.value);
                    if (e.target.value === "Reject") {
                      setShowNCR(true);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Accept">Accept</option>
                  <option value="Reject">Reject</option>
                  <option value="Conditional Accept">Conditional Accept</option>
                  <option value="Rework">Rework</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pass Rate
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-900 text-center">
                  {calculatePassRate()}%
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Signature
              </label>
              <input
                type="text"
                value={inspectorSignature}
                onChange={(e) => setInspectorSignature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter signature code (e.g., RK-2025-10-17)"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Remarks
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional notes or observations..."
              />
            </div>
          </div>

          {/* NCR Creation (if failed) */}
          {showNCR && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Create Non-Conformance Report (NCR) Inline
              </h3>

              {/* Defects */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-red-900">Defect Details</h4>
                  <button
                    onClick={handleAddDefect}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Defect
                  </button>
                </div>
                <div className="space-y-2">
                  {defects.map((defect, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-5 gap-2 bg-white p-3 rounded-lg"
                    >
                      <input
                        type="text"
                        placeholder="Defect type"
                        value={defect.type}
                        onChange={(e) =>
                          handleDefectChange(idx, "type", e.target.value)
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={defect.quantity}
                        onChange={(e) =>
                          handleDefectChange(
                            idx,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={defect.location}
                        onChange={(e) =>
                          handleDefectChange(idx, "location", e.target.value)
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                      <select
                        value={defect.severity}
                        onChange={(e) =>
                          handleDefectChange(idx, "severity", e.target.value)
                        }
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                      <button
                        onClick={() => handleRemoveDefect(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Root Cause Analysis
                  </label>
                  <textarea
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe the root cause of non-conformance..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Corrective Action
                  </label>
                  <textarea
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={2}
                    placeholder="Immediate corrective actions to be taken..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Preventive Action
                  </label>
                  <textarea
                    value={preventiveAction}
                    onChange={(e) => setPreventiveAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={2}
                    placeholder="Long-term preventive measures..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Disposition Decision
                  </label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="scrap">Scrap - Discard material</option>
                    <option value="rework">Rework - Repair and retest</option>
                    <option value="use_as_is">
                      Use As Is - With MRB approval
                    </option>
                    <option value="return_to_vendor">
                      Return to Vendor - RMA
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Photos & Evidence Upload
                  </label>
                  <div className="border-2 border-dashed border-red-300 rounded-lg p-3 text-center hover:border-red-400 cursor-pointer bg-white">
                    <Camera className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-sm text-red-800">
                      Click to upload defect photos
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      JPG, PNG up to 5MB each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QualityInspectionAddPage;
