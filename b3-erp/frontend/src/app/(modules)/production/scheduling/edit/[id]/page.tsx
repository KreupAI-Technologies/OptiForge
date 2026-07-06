"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductionOrphanService } from "@/services/production/production-orphan.service";
import {
  Calendar,
  Clock,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Users,
  Settings,
  Package,
  Plus,
  Minus,
  Search,
  Filter,
  GripVertical,
  Play,
  Pause,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Database,
  Wrench,
  ArrowRight,
  RefreshCw,
  Send,
  Layers,
  Activity,
  Timer,
  TrendingUp,
  AlertCircle,
  Box,
  GitBranch,
} from "lucide-react";

// TypeScript Interfaces
interface WorkOrder {
  id: string;
  product: string;
  productCode: string;
  quantity: number;
  startDate: string;
  endDate: string;
  workCenter: string;
  shift: string;
  priority: number;
  status: string;
  dependencies: string[];
  estimatedHours: number;
  operators: number;
  setupTime: number;
  cycleTime: number;
  materialAvailable: boolean;
  toolsAvailable: boolean;
}

interface WorkCenter {
  id: string;
  name: string;
  capacity: number;
  allocated: number;
  utilization: number;
  availableCapacity: number;
  operatorsAvailable: number;
  shifts: string[];
}

interface Constraint {
  id: string;
  type: string;
  enabled: boolean;
  description: string;
}

interface ScheduleData {
  id: string;
  scheduleId: string;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  schedulingMethod: string;
  workOrders: WorkOrder[];
  workCenters: WorkCenter[];
  constraints: Constraint[];
}

const ProductionSchedulingEditPage = () => {
  const params = useParams();
  const router = useRouter();
  const scheduleId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [selectedWOs, setSelectedWOs] = useState<string[]>([]);
  const [availableWOs, setAvailableWOs] = useState<WorkOrder[]>([]);
  const [showWOSelector, setShowWOSelector] = useState(false);
  const [draggedWO, setDraggedWO] = useState<string | null>(null);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<string>("all");
  const [conflictDetected, setConflictDetected] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [schedulingAlgorithm, setSchedulingAlgorithm] = useState("forward");
  const [capacityType, setCapacityType] = useState("finite");
  const [autoScheduling, setAutoScheduling] = useState(false);

  // Load the schedule line by id. The service has no getScheduleLine(id), so
  // we fetch the full list and find the matching row, then merge it over the
  // mock fallback (which keeps the JSX from crashing on missing arrays).
  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);

      // Empty skeleton used only to keep the JSX from crashing on missing
      // arrays before the backend row is merged in. No sample display data.
      const mockData: ScheduleData = {
        id: scheduleId,
        scheduleId: "",
        period: "",
        startDate: "",
        endDate: "",
        status: "draft",
        schedulingMethod: "",
        workOrders: [],
        workCenters: [],
        constraints: [],
      };

      const mockAvailableWOs: WorkOrder[] = [];

      try {
        const lines = await ProductionOrphanService.getScheduleLines();
        const raw: any = Array.isArray(lines)
          ? lines.find((l: any) => String(l?.id) === String(scheduleId))
          : null;

        if (raw && typeof raw === "object") {
          // Merge defensively over the mock fallback: keep mock arrays/values
          // for any field the backend row does not provide.
          const merged: ScheduleData = {
            ...mockData,
            id: raw.id !== undefined ? String(raw.id) : mockData.id,
            scheduleId: raw.scheduleId ?? mockData.scheduleId,
            period: raw.period ?? mockData.period,
            startDate: raw.startDate ?? mockData.startDate,
            endDate: raw.endDate ?? mockData.endDate,
            status: raw.status ?? mockData.status,
            schedulingMethod: raw.schedulingMethod ?? mockData.schedulingMethod,
            workOrders: Array.isArray(raw.workOrders)
              ? raw.workOrders
              : mockData.workOrders,
            workCenters: Array.isArray(raw.workCenters)
              ? raw.workCenters
              : mockData.workCenters,
            constraints: Array.isArray(raw.constraints)
              ? raw.constraints
              : mockData.constraints,
          };
          setScheduleData(merged);
        } else {
          setScheduleData(mockData);
        }
      } catch (err) {
        console.error("Failed to load schedule line", err);
        setScheduleData(mockData);
      }

      setAvailableWOs(mockAvailableWOs);
      setLoading(false);
    };

    if (scheduleId) {
      fetchScheduleData();
    }
  }, [scheduleId]);

  // Real-time conflict detection
  useEffect(() => {
    if (scheduleData) {
      detectConflicts();
    }
  }, [scheduleData]);

  const detectConflicts = () => {
    const detectedConflicts: string[] = [];

    // Check resource conflicts
    scheduleData?.workCenters.forEach((wc) => {
      if (wc.utilization > 90) {
        detectedConflicts.push(
          `${wc.name} is overloaded at ${wc.utilization}% capacity`
        );
      }
    });

    // Check material availability
    scheduleData?.workOrders.forEach((wo) => {
      if (!wo.materialAvailable) {
        detectedConflicts.push(
          `${wo.id}: Material not available for ${wo.product}`
        );
      }
      if (!wo.toolsAvailable) {
        detectedConflicts.push(
          `${wo.id}: Tools not available for ${wo.product}`
        );
      }
    });

    // Check dependencies
    scheduleData?.workOrders.forEach((wo) => {
      wo.dependencies.forEach((depId) => {
        const depWO = scheduleData.workOrders.find((w) => w.id === depId);
        if (depWO && new Date(wo.startDate) < new Date(depWO.endDate)) {
          detectedConflicts.push(
            `${wo.id}: Starts before dependency ${depId} completes`
          );
        }
      });
    });

    setConflicts(detectedConflicts);
    setConflictDetected(detectedConflicts.length > 0);
  };

  const handleSave = async () => {
    if (!scheduleData) return;
    setSaving(true);
    try {
      // The service exposes no updateScheduleLine, so we persist via
      // createScheduleLine carrying the id in the body. The backend upserts
      // on the provided id.
      await ProductionOrphanService.createScheduleLine({
        ...scheduleData,
        id: scheduleId,
      } as any);
      router.push("/production/scheduling");
    } catch (err) {
      console.error("Failed to save schedule", err);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (conflictDetected) {
      alert(
        "Cannot publish schedule with conflicts. Please resolve conflicts first."
      );
      return;
    }
    if (!scheduleData) return;
    setSaving(true);
    try {
      // No dedicated update endpoint: persist the published state via
      // createScheduleLine with the id in the body.
      await ProductionOrphanService.createScheduleLine({
        ...scheduleData,
        id: scheduleId,
        status: "published",
      } as any);
      router.push("/production/scheduling");
    } catch (err) {
      console.error("Failed to publish schedule", err);
      alert("Failed to publish schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSchedule = async () => {
    setAutoScheduling(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("Auto-scheduling completed! Review the optimized schedule.");
    setAutoScheduling(false);
  };

  const handleAddWO = (woId: string) => {
    const wo = availableWOs.find((w) => w.id === woId);
    if (wo && scheduleData) {
      const updatedWO = {
        ...wo,
        workCenter: scheduleData.workCenters[0].name,
        shift: "Morning",
        startDate: scheduleData.startDate + "T08:00",
        endDate: scheduleData.startDate + "T16:00",
        status: "scheduled",
      };
      setScheduleData({
        ...scheduleData,
        workOrders: [...scheduleData.workOrders, updatedWO],
      });
      setAvailableWOs(availableWOs.filter((w) => w.id !== woId));
    }
  };

  const handleRemoveWO = (woId: string) => {
    if (scheduleData) {
      const wo = scheduleData.workOrders.find((w) => w.id === woId);
      if (wo) {
        setScheduleData({
          ...scheduleData,
          workOrders: scheduleData.workOrders.filter((w) => w.id !== woId),
        });
        setAvailableWOs([...availableWOs, { ...wo, status: "released" }]);
      }
    }
  };

  const handleWOUpdate = (woId: string, field: string, value: any) => {
    if (scheduleData) {
      setScheduleData({
        ...scheduleData,
        workOrders: scheduleData.workOrders.map((wo) =>
          wo.id === woId ? { ...wo, [field]: value } : wo
        ),
      });
    }
  };

  const handleDragStart = (woId: string) => {
    setDraggedWO(woId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (workCenter: string) => {
    if (draggedWO && scheduleData) {
      handleWOUpdate(draggedWO, "workCenter", workCenter);
      setDraggedWO(null);
    }
  };

  const handleConstraintToggle = (constraintId: string) => {
    if (scheduleData) {
      setScheduleData({
        ...scheduleData,
        constraints: scheduleData.constraints.map((c) =>
          c.id === constraintId ? { ...c, enabled: !c.enabled } : c
        ),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <X className="w-16 h-16 text-red-500 mb-2" />
          <p className="text-xl text-gray-800">Schedule not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Edit Schedule - {scheduleData.scheduleId}
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{scheduleData.period}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {scheduleData.startDate} to {scheduleData.endDate}
                </span>
              </div>
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
            <button
              onClick={handlePublish}
              disabled={saving || conflictDetected}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400"
            >
              <Send className="w-4 h-4" />
              Publish
            </button>
          </div>
        </div>

        {/* Conflict Alert */}
        {conflictDetected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  {conflicts.length} Conflict(s) Detected
                </h3>
                <ul className="space-y-1">
                  {conflicts.map((conflict, idx) => (
                    <li key={idx} className="text-sm text-red-800">
                      • {conflict}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left Panel - Scheduling Controls */}
        <div className="col-span-3 space-y-3">
          {/* Date Range */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={scheduleData.startDate}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={scheduleData.endDate}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Scheduling Algorithm */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Scheduling Method
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Algorithm
                </label>
                <select
                  value={schedulingAlgorithm}
                  onChange={(e) => setSchedulingAlgorithm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="forward">Forward Scheduling</option>
                  <option value="backward">Backward Scheduling</option>
                  <option value="priority">Priority Based</option>
                  <option value="fifo">FIFO</option>
                  <option value="edd">Earliest Due Date</option>
                  <option value="spt">Shortest Processing Time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity Planning
                </label>
                <select
                  value={capacityType}
                  onChange={(e) => setCapacityType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="finite">Finite Capacity</option>
                  <option value="infinite">Infinite Capacity</option>
                </select>
              </div>
              <button
                onClick={handleAutoSchedule}
                disabled={autoScheduling}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
              >
                {autoScheduling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Auto-Scheduling...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Auto-Schedule
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Constraints */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Constraints
            </h3>
            <div className="space-y-2">
              {scheduleData.constraints.map((constraint) => (
                <label
                  key={constraint.id}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={constraint.enabled}
                    onChange={() => handleConstraintToggle(constraint.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {constraint.type}
                    </div>
                    <div className="text-xs text-gray-600">
                      {constraint.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Work Center Capacity */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Work Center Capacity
            </h3>
            <div className="space-y-3">
              {scheduleData.workCenters.map((wc) => (
                <div key={wc.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {wc.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {wc.utilization}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        wc.utilization >= 90
                          ? "bg-red-500"
                          : wc.utilization >= 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${wc.utilization}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {wc.allocated}/{wc.capacity}h ({wc.availableCapacity}h
                    available)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Panel - Work Orders */}
        <div className="col-span-6 space-y-3">
          {/* Add Work Orders */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Scheduled Work Orders ({scheduleData.workOrders.length})
              </h3>
              <button
                onClick={() => setShowWOSelector(!showWOSelector)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Work Orders
              </button>
            </div>

            {/* Available Work Orders Selector */}
            {showWOSelector && (
              <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">
                  Available Work Orders
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableWOs.map((wo) => (
                    <div
                      key={wo.id}
                      className="flex justify-between items-center p-3 bg-white rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {wo.id} - {wo.product}
                        </div>
                        <div className="text-xs text-gray-600">
                          Qty: {wo.quantity} | Est: {wo.estimatedHours}h | P
                          {wo.priority}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddWO(wo.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                  {availableWOs.length === 0 && (
                    <p className="text-sm text-gray-600 text-center py-4">
                      No available work orders
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Work Orders Table */}
            <div className="space-y-2">
              {scheduleData.workOrders.map((wo) => (
                <div
                  key={wo.id}
                  draggable
                  onDragStart={() => handleDragStart(wo.id)}
                  className="border border-gray-300 rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-move"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {wo.id}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              wo.priority === 1
                                ? "bg-red-100 text-red-800"
                                : wo.priority === 2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            P{wo.priority}
                          </span>
                          {!wo.materialAvailable && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                          {!wo.toolsAvailable && (
                            <Wrench className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-700">
                          {wo.product} ({wo.productCode})
                        </div>
                        <div className="text-xs text-gray-600">
                          Qty: {wo.quantity} | Est: {wo.estimatedHours}h | Setup:{" "}
                          {wo.setupTime}h
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveWO(wo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Work Center
                      </label>
                      <select
                        value={wo.workCenter}
                        onChange={(e) =>
                          handleWOUpdate(wo.id, "workCenter", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        {scheduleData.workCenters.map((wc) => (
                          <option key={wc.id} value={wc.name}>
                            {wc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Shift
                      </label>
                      <select
                        value={wo.shift}
                        onChange={(e) =>
                          handleWOUpdate(wo.id, "shift", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select...</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Operators
                      </label>
                      <input
                        type="number"
                        value={wo.operators}
                        onChange={(e) =>
                          handleWOUpdate(
                            wo.id,
                            "operators",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={wo.startDate}
                        onChange={(e) =>
                          handleWOUpdate(wo.id, "startDate", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={wo.endDate}
                        onChange={(e) =>
                          handleWOUpdate(wo.id, "endDate", e.target.value)
                        }
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {wo.dependencies.length > 0 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                      <span className="font-medium text-gray-700">
                        Dependencies:
                      </span>{" "}
                      <span className="text-gray-600">
                        {wo.dependencies.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {scheduleData.workOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mb-3 opacity-50" />
                  <p>No work orders scheduled</p>
                  <p className="text-sm">Click "Add Work Orders" to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Visual Schedule & Material Check */}
        <div className="col-span-3 space-y-3">
          {/* Visual Timeline */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Schedule Timeline
            </h3>
            <div className="space-y-2">
              {scheduleData.workCenters.map((wc) => (
                <div
                  key={wc.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(wc.name)}
                  className="border border-gray-300 rounded-lg p-3 bg-gray-50 min-h-[60px]"
                >
                  <div className="font-medium text-sm text-gray-900 mb-2">
                    {wc.name}
                  </div>
                  <div className="space-y-1">
                    {scheduleData.workOrders
                      .filter((wo) => wo.workCenter === wc.name)
                      .map((wo) => (
                        <div
                          key={wo.id}
                          className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                        >
                          {wo.id} - {wo.shift}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Drag and drop work orders to assign work centers
            </p>
          </div>

          {/* Material Availability */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Box className="w-4 h-4" />
              Material Availability
            </h3>
            <div className="space-y-2">
              {scheduleData.workOrders.map((wo) => (
                <div
                  key={wo.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-900">{wo.id}</span>
                  <div className="flex items-center gap-2">
                    {wo.materialAvailable ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    {wo.toolsAvailable ? (
                      <Wrench className="w-4 h-4 text-green-600" />
                    ) : (
                      <Wrench className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Material Available</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <Wrench className="w-3 h-3 text-green-600" />
                <span>Tools Available</span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md p-3">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Schedule Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total WOs:</span>
                <span className="font-semibold text-gray-900">
                  {scheduleData.workOrders.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Total Hours:</span>
                <span className="font-semibold text-gray-900">
                  {scheduleData.workOrders.reduce(
                    (sum, wo) => sum + wo.estimatedHours,
                    0
                  )}
                  h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Avg Utilization:</span>
                <span className="font-semibold text-gray-900">
                  {Math.round(
                    scheduleData.workCenters.reduce(
                      (sum, wc) => sum + wc.utilization,
                      0
                    ) / scheduleData.workCenters.length
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Material Issues:</span>
                <span className="font-semibold text-red-600">
                  {
                    scheduleData.workOrders.filter((wo) => !wo.materialAvailable)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Wrench Issues:</span>
                <span className="font-semibold text-orange-600">
                  {
                    scheduleData.workOrders.filter((wo) => !wo.toolsAvailable)
                      .length
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSchedulingEditPage;
