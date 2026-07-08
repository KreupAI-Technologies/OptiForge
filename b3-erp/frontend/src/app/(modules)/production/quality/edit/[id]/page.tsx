"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  FileText,
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

interface Defect {
  type: string;
  quantity: number;
  location: string;
  severity: "critical" | "major" | "minor";
}

const QualityInspectionEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const inspectionId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [workOrderId, setWorkOrderId] = useState("");
  const [product, setProduct] = useState("");
  const [productCode, setProductCode] = useState("");
  const [inspectionType, setInspectionType] = useState("final");
  const [inspector, setInspector] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");
  const [shift, setShift] = useState("Morning");
  const [sampleSize, setSampleSize] = useState(0);
  const [lotSize, setLotSize] = useState(0);
  const [samplingPlan, setSamplingPlan] = useState("Normal Inspection Level II");
  const [aqlLevel, setAqlLevel] = useState("1.5");
  const [lotNumber, setLotNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [testParameters, setTestParameters] = useState<TestParameter[]>([]);
  const [overallDisposition, setOverallDisposition] = useState("Accept");
  const [inspectorSignature, setInspectorSignature] = useState("");

  // NCR fields
  const [showNCR, setShowNCR] = useState(false);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [rootCause, setRootCause] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [preventiveAction, setPreventiveAction] = useState("");
  const [disposition, setDisposition] = useState("rework");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const res = await ProductionOrphanService.getNcr(inspectionId);
        const d: any = Array.isArray(res) ? res[0] : (res?.data ?? res);
        if (!d || typeof d !== "object") {
          throw new Error("Inspection not found");
        }

        setWorkOrderId(d?.workOrderId ?? d?.workOrderNumber ?? "");
        setProduct(d?.product ?? d?.productName ?? "");
        setProductCode(d?.productCode ?? "");
        setInspectionType(d?.inspectionType ?? "final");
        setInspector(d?.inspector ?? "");
        setInspectionDate(d?.inspectionDate ?? "");
        setShift(d?.shift ?? "Morning");
        setSampleSize(d?.sampleSize ?? 0);
        setLotSize(d?.lotSize ?? 0);
        setSamplingPlan(d?.samplingPlan ?? "Normal Inspection Level II");
        setAqlLevel(d?.aqlLevel ?? "1.5");
        setLotNumber(d?.lotNumber ?? "");
        setBatchNumber(d?.batchNumber ?? "");
        setEquipmentUsed(
          Array.isArray(d?.equipmentUsed)
            ? d.equipmentUsed.join(", ")
            : (d?.equipmentUsed ?? "")
        );
        setInspectorSignature(d?.inspectorSignature ?? "");
        setTestParameters(
          Array.isArray(d?.testParameters) ? d.testParameters : []
        );
        setOverallDisposition(d?.overallDisposition ?? "Accept");
      } catch (err: any) {
        setLoadError(err?.message ?? "Failed to load inspection");
      } finally {
        setLoading(false);
      }
    };

    if (inspectionId) {
      fetchData();
    }
  }, [inspectionId]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await ProductionOrphanService.updateNcr(inspectionId, {
        workOrderId,
        product,
        productCode,
        inspectionType,
        inspector,
        inspectionDate,
        shift,
        sampleSize,
        lotSize,
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
      router.push(`/production/quality/view/${inspectionId}`);
    } catch (err) {
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const calculatePassRate = () => {
    const passed = testParameters.filter((p) => p.result === "pass").length;
    return testParameters.length > 0
      ? ((passed / testParameters.length) * 100).toFixed(1)
      : "0.0";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-lg font-semibold text-gray-800">
            Unable to load inspection
          </p>
          <p className="text-sm text-gray-600">{loadError}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Edit Quality Inspection
            </h1>
            <p className="text-gray-600">QC-2025-{inspectionId}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left Panel - Basic Info */}
        <div className="col-span-4 space-y-3">
          {/* Work Order & Product */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Work Order Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Order ID
                </label>
                <input
                  type="text"
                  value={workOrderId}
                  onChange={(e) => setWorkOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Code
                </label>
                <input
                  type="text"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Inspection Info */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Inspection Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Type
                </label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="first_article">First Article</option>
                  <option value="in_process">In-Process</option>
                  <option value="final">Final</option>
                  <option value="receiving">Receiving</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector
                </label>
                <select
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Rajesh Kumar">Rajesh Kumar</option>
                  <option value="Priya Sharma">Priya Sharma</option>
                  <option value="Amit Patel">Amit Patel</option>
                  <option value="Sunita Desai">Sunita Desai</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Date & Time
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
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sampling */}
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
                  Auto-suggested based on AQL
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
                  <option value="Reduced Inspection">
                    Reduced Inspection
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AQL Level
                </label>
                <select
                  value={aqlLevel}
                  onChange={(e) => setAqlLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0.65">0.65</option>
                  <option value="1.0">1.0</option>
                  <option value="1.5">1.5</option>
                  <option value="2.5">2.5</option>
                  <option value="4.0">4.0</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Equipment Used
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment/Instrument
              </label>
              <input
                type="text"
                value={equipmentUsed}
                onChange={(e) => setEquipmentUsed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digital Micrometer DM-450"
              />
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                Calibration Status: Valid
              </div>
            </div>
          </div>
        </div>

        {/* Middle Panel - Test Parameters */}
        <div className="col-span-8 space-y-3">
          {/* Test Parameters */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Quality Parameters Entry
              </h3>
              <button
                onClick={handleAddParameter}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Parameter
              </button>
            </div>

            <div className="space-y-2">
              {testParameters.map((param) => (
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
                        placeholder="e.g., Inner Diameter"
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
                        placeholder="mm, kg, HRC"
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
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Test Method
                      </label>
                      <input
                        type="text"
                        value={param.testMethod}
                        onChange={(e) =>
                          handleParameterChange(
                            param.id,
                            "testMethod",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Micrometer, Caliper"
                      />
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
              ))}
            </div>
          </div>

          {/* Visual Inspection Checklist */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visual Inspection Checklist
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
                "Marking",
                "Packaging",
                "Labeling",
                "Burrs",
                "Sharp Edges",
                "Rust",
                "Oil Stains",
                "Foreign Material",
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-sm text-gray-900">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Functional Testing */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2">
              Functional Testing
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation Test
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
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
                  <option value="none">None</option>
                  <option value="minimal">Minimal</option>
                  <option value="excessive">Excessive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Overall Disposition */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-2">
              Overall Result & Disposition
            </h3>
            <div className="grid grid-cols-2 gap-2">
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
                <div className="px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-900">
                  {calculatePassRate()}%
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Signature
              </label>
              <input
                type="text"
                value={inspectorSignature}
                onChange={(e) => setInspectorSignature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Signature code"
              />
            </div>
          </div>

          {/* NCR Creation (if failed) */}
          {showNCR && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Non-Conformance Report (NCR)
              </h3>

              {/* Defects */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-red-900">Defects</h4>
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
                    Root Cause
                  </label>
                  <textarea
                    value={rootCause}
                    onChange={(e) => setRootCause(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Disposition
                  </label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="scrap">Scrap</option>
                    <option value="rework">Rework</option>
                    <option value="use_as_is">Use As Is</option>
                    <option value="return_to_vendor">Return to Vendor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-red-900 mb-1">
                    Photos/Evidence
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-red-400 cursor-pointer">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload photos
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

export default QualityInspectionEditPage;
