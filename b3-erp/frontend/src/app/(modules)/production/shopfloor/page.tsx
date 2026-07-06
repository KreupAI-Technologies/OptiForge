'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  LogIn,
  LogOut,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Wrench,
  PhoneCall,
  Plus,
  Minus,
  Clock,
  Award,
  Factory,
  Shield,
  Coffee,
  Utensils,
  Power,
  Settings,
  HelpCircle,
  Bell,
  Target,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { QualityAlertModal, SupervisorCallModal, QuickDowntimeModal, QualityAlertData, SupervisorCallData, QuickDowntimeData } from '@/components/shopfloor/ShopFloorActionModals';
import { workOrderService, WorkOrder as ServiceWorkOrder } from '@/services/work-order.service';
import { workCenterService, WorkCenter as ServiceWorkCenter } from '@/services/work-center.service';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

// TypeScript Interfaces
interface Operator {
  id: string;
  name: string;
  photo: string;
  employeeId: string;
}

interface WorkOrder {
  id: string;
  woNumber: string;
  productName: string;
  operationName: string;
  targetQuantity: number;
  producedQuantity: number;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'next' | 'queued';
  cycleTime: number; // seconds
  targetCycleTime: number; // seconds
}

// Map service work order to local shopfloor format
function mapServiceWorkOrderToShopfloor(wo: ServiceWorkOrder, index: number): WorkOrder {
  const priorityMap: Record<string, WorkOrder['priority']> = {
    'Low': 'low',
    'Medium': 'medium',
    'High': 'high',
    'Critical': 'high',
  };

  return {
    id: wo.id,
    woNumber: wo.workOrderNumber,
    productName: wo.productName,
    operationName: wo.bomCode ? `BOM: ${wo.bomCode}` : 'Production',
    targetQuantity: wo.plannedQuantity,
    producedQuantity: wo.completedQuantity,
    priority: priorityMap[wo.priority] || 'medium',
    status: index === 0 ? 'next' : 'queued',
    cycleTime: 180, // Default cycle time
    targetCycleTime: 180, // Default target cycle time
  };
}

export default function ShopfloorTerminalPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screen, setScreen] = useState<
    'login' | 'dashboard' | 'activeJob' | 'downtime' | 'materialRequest' | 'endShift'
  >('login');

  // Login State
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [selectedWorkCenter, setSelectedWorkCenter] = useState('');
  const [selectedShift, setSelectedShift] = useState('');

  // Operator State
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loginTime, setLoginTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Job State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activeJob, setActiveJob] = useState<WorkOrder | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [goodPartsCount, setGoodPartsCount] = useState(0);
  const [rejectCount, setRejectCount] = useState(0);
  const [reworkCount, setReworkCount] = useState(0);

  // Downtime State
  const [downtimeReason, setDowntimeReason] = useState('');
  const [downtimeSubReason, setDowntimeSubReason] = useState('');
  const [downtimeStartTime, setDowntimeStartTime] = useState('');
  const [downtimeElapsed, setDowntimeElapsed] = useState(0);
  const [downtimeRemarks, setDowntimeRemarks] = useState('');

  // Material Request State
  const [requestedMaterial, setRequestedMaterial] = useState('');
  const [requestQuantity, setRequestQuantity] = useState(0);
  const [requestUrgency, setRequestUrgency] = useState<'normal' | 'urgent'>('normal');

  // Shift Summary
  const [totalProduced, setTotalProduced] = useState(0);
  const [totalRejections, setTotalRejections] = useState(0);
  const [totalDowntime, setTotalDowntime] = useState(0);

  // Modal State
  const [isQualityAlertOpen, setIsQualityAlertOpen] = useState(false);
  const [isSupervisorCallOpen, setIsSupervisorCallOpen] = useState(false);
  const [isQuickDowntimeOpen, setIsQuickDowntimeOpen] = useState(false);

  // Loading state
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Work Centers from service
  const [workCenterOptions, setWorkCenterOptions] = useState<string[]>([]);
  const [loadingWorkCenters, setLoadingWorkCenters] = useState(true);

  // Shop-floor-control records (used to resolve the active record id for downtime reporting)
  const [shopFloorRecords, setShopFloorRecords] = useState<any[]>([]);

  // Locally-tracked alerts. The allowed orphan service exposes no backend
  // endpoint for "quality alert" or "request supervisor", so these are held in
  // optimistic local state until such endpoints exist.
  const [localAlerts, setLocalAlerts] = useState<any[]>([]);

  // Load shop-floor-control records on mount so downtime reporting can target a real record id.
  const loadShopFloorControl = async () => {
    try {
      const res = await ProductionOrphanService.getShopFloorControl();
      const data = Array.isArray(res) ? res : ((res as any)?.data ?? res);
      setShopFloorRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching shop-floor-control records:', err);
    }
  };

  useEffect(() => {
    loadShopFloorControl();
  }, []);

  // Fetch work centers on mount
  useEffect(() => {
    async function fetchWorkCenters() {
      try {
        const data = await workCenterService.getAllWorkCenters();
        setWorkCenterOptions(data.map((wc: ServiceWorkCenter) => wc.workCenterName));
      } catch (err) {
        console.error('Error fetching work centers:', err);
        // Fallback to static list if service fails
        setWorkCenterOptions([
          'Assembly Line 1',
          'Assembly Line 2',
          'Machining Center 1',
          'Welding Station 1',
          'Paint Shop 1',
          'CNC Machine 1',
          'QC Station 1',
        ]);
      } finally {
        setLoadingWorkCenters(false);
      }
    }
    fetchWorkCenters();
  }, []);

  // Fallback work centers (used if loading)
  const workCenters = workCenterOptions.length > 0 ? workCenterOptions : [
    'Assembly Line 1',
    'Assembly Line 2',
    'Machining Center 1',
    'Welding Station 1',
    'Paint Shop 1',
    'CNC Machine 1',
    'QC Station 1',
  ];

  const shifts = ['Shift 1 (06:00-14:00)', 'Shift 2 (14:00-22:00)', 'Shift 3 (22:00-06:00)'];

  const downtimeCategories = [
    {
      id: 'breakdown',
      name: 'Machine Breakdown',
      icon: AlertTriangle,
      color: 'bg-red-500',
      subReasons: [
        'Motor Failure',
        'Hydraulic Issue',
        'Electrical Problem',
        'Bearing Failure',
        'Belt Breakage',
        'Other',
      ],
    },
    {
      id: 'material',
      name: 'Material Shortage',
      icon: Package,
      color: 'bg-orange-500',
      subReasons: [
        'Stock Out',
        'Wrong Material Issued',
        'Material Quality Issue',
        'Waiting for Material',
        'Other',
      ],
    },
    {
      id: 'tool',
      name: 'Tool Change/Issue',
      icon: Wrench,
      color: 'bg-yellow-500',
      subReasons: ['Tool Breakage', 'Tool Wear', 'Scheduled Tool Change', 'Tool Not Available', 'Other'],
    },
    {
      id: 'quality',
      name: 'Quality Problem',
      icon: Shield,
      color: 'bg-purple-500',
      subReasons: [
        'Dimensional Issue',
        'Surface Defect',
        'Waiting for QC',
        'Rework Required',
        'Other',
      ],
    },
    {
      id: 'power',
      name: 'Power Failure',
      icon: Power,
      color: 'bg-blue-500',
      subReasons: ['Power Cut', 'Generator Issue', 'UPS Failure', 'Voltage Fluctuation', 'Other'],
    },
    {
      id: 'other',
      name: 'Other',
      icon: Settings,
      color: 'bg-gray-500',
      subReasons: [
        'Setup/Changeover',
        'Waiting for Crane',
        'Waiting for Maintenance',
        'Meeting',
        'Training',
        'Other',
      ],
    },
  ];

  const bomMaterials = [
    'Stainless Steel Sheet 2mm',
    'Aluminium Rod 50mm',
    'Mild Steel Plate 10mm',
    'Welding Electrode',
    'Powder Paint Black',
    'Bolt M12x50',
    'Bearing 6205',
    'Gearbox 1:10',
  ];

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());

      // Update downtime elapsed
      if (screen === 'downtime' && downtimeStartTime) {
        const start = new Date(downtimeStartTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000 / 60); // minutes
        setDowntimeElapsed(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, downtimeStartTime]);

  // Login with service call
  const handleLogin = async () => {
    if (!employeeId || !pin || !selectedWorkCenter || !selectedShift) {
      alert('Please fill all fields');
      return;
    }

    setIsLoggingIn(true);

    try {
      // Mock operator data (in real app, would authenticate via API)
      setOperator({
        id: employeeId,
        name: 'Amit Sharma',
        photo: '/avatars/amit.jpg',
        employeeId: employeeId,
      });

      setLoginTime(new Date().toLocaleTimeString());

      // Fetch work orders from service
      const serviceWorkOrders = await workOrderService.getAllWorkOrders();
      // Filter to only show Released or In Progress work orders
      const activeWorkOrders = serviceWorkOrders.filter(
        (wo: ServiceWorkOrder) => wo.status === 'Released' || wo.status === 'In Progress'
      );
      // Map to local format and take first 5
      const mappedWorkOrders = activeWorkOrders
        .slice(0, 5)
        .map((wo: ServiceWorkOrder, idx: number) => mapServiceWorkOrderToShopfloor(wo, idx));

      setWorkOrders(mappedWorkOrders);
      setIsLoggedIn(true);
      setScreen('dashboard');

      // Play audio feedback
      playAudioFeedback('success');
    } catch (err) {
      console.error('Error during login:', err);
      alert('Failed to load work orders. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen('login');
    setOperator(null);
    setEmployeeId('');
    setPin('');
    setSelectedWorkCenter('');
    setSelectedShift('');
    setWorkOrders([]);
    setActiveJob(null);
    playAudioFeedback('logout');
  };

  // Start Job
  const handleStartJob = (job: WorkOrder) => {
    setActiveJob({ ...job, status: 'active', producedQuantity: 0 });
    setGoodPartsCount(0);
    setRejectCount(0);
    setReworkCount(0);
    setScreen('activeJob');
    playAudioFeedback('success');
  };

  // Increment Good Parts
  const incrementGoodParts = () => {
    setGoodPartsCount(goodPartsCount + 1);
    if (activeJob) {
      setActiveJob({ ...activeJob, producedQuantity: activeJob.producedQuantity + 1 });
    }
    playAudioFeedback('click');
  };

  // Reject
  const handleReject = () => {
    setRejectCount(rejectCount + 1);
    playAudioFeedback('error');
  };

  // Rework
  const handleRework = () => {
    setReworkCount(reworkCount + 1);
    playAudioFeedback('warning');
  };

  // Manual Quantity Entry
  const handleManualEntry = () => {
    const qty = prompt('Enter quantity produced:');
    if (qty) {
      const quantity = parseInt(qty);
      setGoodPartsCount(goodPartsCount + quantity);
      if (activeJob) {
        setActiveJob({ ...activeJob, producedQuantity: activeJob.producedQuantity + quantity });
      }
      playAudioFeedback('success');
    }
  };

  // Complete Operation
  const handleCompleteOperation = () => {
    if (!activeJob) return;

    const confirm = window.confirm(
      `Complete operation?\n\nProduced: ${goodPartsCount}\nRejected: ${rejectCount}\nRework: ${reworkCount}`
    );

    if (confirm) {
      setTotalProduced(totalProduced + goodPartsCount);
      setTotalRejections(totalRejections + rejectCount);
      setActiveJob(null);
      setScreen('dashboard');
      playAudioFeedback('success');
      alert('Operation completed successfully!');
    }
  };

  // Pause Production
  const handlePauseProduction = () => {
    setIsPaused(!isPaused);
    playAudioFeedback('warning');
  };

  // Log Downtime
  const handleLogDowntime = () => {
    setDowntimeStartTime(new Date().toISOString());
    setDowntimeElapsed(0);
    setDowntimeReason('');
    setDowntimeSubReason('');
    setDowntimeRemarks('');
    setScreen('downtime');
    playAudioFeedback('warning');
  };

  // End Downtime
  const handleEndDowntime = () => {
    if (!downtimeReason || !downtimeSubReason) {
      alert('Please select downtime reason');
      return;
    }

    setTotalDowntime(totalDowntime + downtimeElapsed);
    setScreen('activeJob');
    playAudioFeedback('success');
    alert(`Downtime logged: ${downtimeElapsed} minutes`);
  };

  // Material Request
  const handleMaterialRequest = () => {
    setRequestedMaterial('');
    setRequestQuantity(0);
    setRequestUrgency('normal');
    setScreen('materialRequest');
  };

  // Submit Material Request
  const handleSubmitMaterialRequest = () => {
    if (!requestedMaterial || requestQuantity <= 0) {
      alert('Please select material and enter quantity');
      return;
    }

    alert(`Material request submitted!\n\nMaterial: ${requestedMaterial}\nQuantity: ${requestQuantity}\nUrgency: ${requestUrgency.toUpperCase()}`);
    setScreen('activeJob');
    playAudioFeedback('success');
  };

  // End Shift
  const handleEndShift = () => {
    setScreen('endShift');
  };

  // Confirm End Shift
  const handleConfirmEndShift = () => {
    alert('Shift ended. Thank you!');
    handleLogout();
  };

  // Audio Feedback
  const playAudioFeedback = (type: 'success' | 'error' | 'warning' | 'click' | 'logout') => {
    // In real app, play actual audio files
    console.log(`Audio feedback: ${type}`);
  };

  // Modal Handlers
  const handleQualityAlert = () => {
    setIsQualityAlertOpen(true);
  };

  const handleQualityAlertSubmit = (alertData: QualityAlertData) => {
    // No quality-alert endpoint exists on the allowed orphan service, so record
    // the alert optimistically in local state (append to the alerts array).
    setLocalAlerts((prev) => [
      ...prev,
      { type: 'quality-alert', createdAt: new Date().toISOString(), ...getModalContext(), data: alertData },
    ]);
    setIsQualityAlertOpen(false);
    alert('Quality Alert raised successfully. Supervisor has been notified.');
  };

  const handleCallSupervisor = () => {
    setIsSupervisorCallOpen(true);
  };

  const handleSupervisorCallSubmit = (request: SupervisorCallData) => {
    // No "request supervisor" endpoint exists on the allowed orphan service, so
    // record the request optimistically in local state (append to the alerts array).
    setLocalAlerts((prev) => [
      ...prev,
      { type: 'supervisor-call', createdAt: new Date().toISOString(), ...getModalContext(), data: request },
    ]);
    setIsSupervisorCallOpen(false);
    alert('Supervisor has been notified. Estimated response time: ' + (request.priority === 'emergency' ? '2-3 minutes' : request.priority === 'urgent' ? '5-10 minutes' : '15-30 minutes'));
  };

  const handleQuickDowntime = () => {
    setIsQuickDowntimeOpen(true);
  };

  const handleQuickDowntimeSubmit = async (downtime: QuickDowntimeData) => {
    try {
      // Target the active shop-floor-control record; fall back to the first loaded record's id.
      const activeRecord =
        shopFloorRecords.find((r) => r?.status === 'active' || r?.isActive) ?? shopFloorRecords[0];
      const recordId = activeRecord?.id ?? activeRecord?._id;
      if (!recordId) {
        alert('No shop-floor-control record available to log downtime against.');
        return;
      }
      await ProductionOrphanService.reportShopFloorDowntime(String(recordId), {
        ...downtime,
        ...getModalContext(),
        reportedAt: new Date().toISOString(),
      });
      // Refresh loaded shop-floor-control data after logging downtime.
      await loadShopFloorControl();
      alert('Downtime logged successfully.');
    } catch (err) {
      console.error('Error logging downtime:', err);
      alert('Failed to log downtime. Please try again.');
    } finally {
      setIsQuickDowntimeOpen(false);
    }
  };

  // Create context object for modals
  const getModalContext = () => ({
    workOrderId: activeJob?.woNumber || '',
    operatorId: operator?.employeeId || '',
    stationId: selectedWorkCenter || 'STATION-01' // Use selected work center
  });

  // Login Screen
  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-3">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-2">
              <Factory className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopfloor Terminal</h1>
            <p className="text-gray-600 text-xl">Production Floor A</p>
          </div>

          {/* Login Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-3">
                Employee ID / Badge
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter Employee ID"
              />
            </div>

            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-3">PIN / Password</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter PIN"
              />
            </div>

            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-3">Work Center</label>
              <select
                value={selectedWorkCenter}
                onChange={(e) => setSelectedWorkCenter(e.target.value)}
                className="w-full px-3 py-2 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-xl font-semibold text-gray-700 mb-3">Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-3 py-2 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Shift</option>
                {shifts.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn || loadingWorkCenters}
              className="w-full flex items-center justify-center space-x-3 px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-2xl font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-8 h-8" />
                  <span>Login to Shopfloor</span>
                </>
              )}
            </button>
          </div>

          {/* Help */}
          <div className="mt-8 text-center">
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <HelpCircle className="w-6 h-6" />
              <span className="text-lg">Need Help?</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  if (screen === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-100 p-3">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{operator?.name}</h2>
                <p className="text-gray-600 text-xl">{operator?.employeeId}</p>
                <p className="text-gray-500 text-lg">{selectedWorkCenter}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600 mb-2">{currentTime}</div>
              <p className="text-gray-600 text-lg">{selectedShift}</p>
              <p className="text-gray-500">Logged in: {loginTime}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-green-500 text-white rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xl mb-2">Produced Today</p>
                <p className="text-5xl font-bold">{totalProduced}</p>
              </div>
              <CheckCircle2 className="w-16 h-16 text-green-200" />
            </div>
          </div>
          <div className="bg-red-500 text-white rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xl mb-2">Rejections</p>
                <p className="text-5xl font-bold">{totalRejections}</p>
              </div>
              <XCircle className="w-16 h-16 text-red-200" />
            </div>
          </div>
          <div className="bg-orange-500 text-white rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xl mb-2">Downtime (min)</p>
                <p className="text-5xl font-bold">{totalDowntime}</p>
              </div>
              <Clock className="w-16 h-16 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Job Queue */}
        <div className="bg-white rounded-xl shadow-lg p-3 mb-2">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Your Job Queue</h3>
          <div className="space-y-2">
            {workOrders.map((job) => (
              <div
                key={job.id}
                className={`border-2 rounded-xl p-3 ${
                  job.status === 'active'
                    ? 'border-green-500 bg-green-50'
                    : job.status === 'next'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-2xl font-bold text-gray-900">{job.woNumber}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          job.priority === 'high'
                            ? 'bg-red-200 text-red-800'
                            : job.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {job.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xl text-gray-700 mb-1">{job.productName}</p>
                    <p className="text-lg text-gray-600">{job.operationName}</p>
                    <p className="text-lg text-gray-600">
                      Target: {job.targetQuantity} | Cycle Time: {Math.floor(job.targetCycleTime / 60)}:{String(job.targetCycleTime % 60).padStart(2, '0')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartJob(job)}
                    className="flex items-center space-x-3 px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-2xl font-semibold shadow-lg"
                  >
                    <Play className="w-8 h-8" />
                    <span>Start</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleEndShift}
            className="flex items-center justify-center space-x-3 px-8 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-2xl font-semibold shadow-lg"
          >
            <Clock className="w-8 h-8" />
            <span>End Shift</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 px-8 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-2xl font-semibold shadow-lg"
          >
            <LogOut className="w-8 h-8" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Job Screen
  if (screen === 'activeJob') {
    const progress = activeJob ? (activeJob.producedQuantity / activeJob.targetQuantity) * 100 : 0;

    return (
      <div className="min-h-screen bg-gray-900 p-3">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-lg p-3 mb-2 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen('dashboard')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-xl">Back to Jobs</span>
            </button>
            <div className="text-center flex-1">
              <h2 className="text-4xl font-bold mb-2">{activeJob?.woNumber}</h2>
              <p className="text-2xl text-blue-100">{activeJob?.productName}</p>
              <p className="text-xl text-blue-200">{activeJob?.operationName}</p>
            </div>
            <div className="text-4xl font-bold">{currentTime}</div>
          </div>
        </div>

        {/* Production Counter - Large Display */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
          <div className="text-center mb-3">
            <p className="text-3xl text-gray-600 mb-2">Produced Quantity</p>
            <div className="text-9xl font-bold text-blue-600 mb-3">{goodPartsCount}</div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className="bg-blue-600 h-8 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <p className="text-3xl text-gray-600 mt-4">
              Target: {activeJob?.targetQuantity} ({progress.toFixed(1)}%)
            </p>
          </div>

          {/* Production Entry Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={incrementGoodParts}
              className="flex items-center justify-center space-x-4 px-12 py-16 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors shadow-2xl"
            >
              <Plus className="w-20 h-20" />
              <div className="text-left">
                <div className="text-4xl font-bold">Good Part</div>
                <div className="text-2xl text-green-100">Click to add +1</div>
              </div>
            </button>

            <button
              onClick={handleReject}
              className="flex items-center justify-center space-x-4 px-12 py-16 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors shadow-2xl"
            >
              <XCircle className="w-20 h-20" />
              <div className="text-left">
                <div className="text-4xl font-bold">Reject</div>
                <div className="text-2xl text-red-100">Count: {rejectCount}</div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={handleRework}
              className="flex items-center justify-center space-x-4 px-12 py-16 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 transition-colors shadow-2xl"
            >
              <RefreshCw className="w-20 h-20" />
              <div className="text-left">
                <div className="text-4xl font-bold">Rework</div>
                <div className="text-2xl text-orange-100">Count: {reworkCount}</div>
              </div>
            </button>

            <button
              onClick={handleManualEntry}
              className="flex items-center justify-center space-x-4 px-12 py-16 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors shadow-2xl"
            >
              <BarChart3 className="w-20 h-20" />
              <div className="text-left">
                <div className="text-4xl font-bold">Manual Entry</div>
                <div className="text-2xl text-purple-100">Enter quantity</div>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={handlePauseProduction}
            className={`flex items-center justify-center space-x-3 px-8 py-8 rounded-xl hover:opacity-90 transition-colors text-2xl font-semibold shadow-lg ${
              isPaused ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
            }`}
          >
            {isPaused ? <Play className="w-10 h-10" /> : <Pause className="w-10 h-10" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleLogDowntime}
            className="flex items-center justify-center space-x-3 px-8 py-8 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-2xl font-semibold shadow-lg"
          >
            <AlertTriangle className="w-10 h-10" />
            <span>Log Downtime</span>
          </button>

          <button
            onClick={handleMaterialRequest}
            className="flex items-center justify-center space-x-3 px-8 py-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-2xl font-semibold shadow-lg"
          >
            <Package className="w-10 h-10" />
            <span>Material Request</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleQualityAlert}
            className="flex items-center justify-center space-x-3 px-8 py-8 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-2xl font-semibold shadow-lg"
          >
            <Shield className="w-10 h-10" />
            <span>Quality Alert</span>
          </button>

          <button
            onClick={handleCallSupervisor}
            className="flex items-center justify-center space-x-3 px-8 py-8 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-2xl font-semibold shadow-lg"
          >
            <PhoneCall className="w-10 h-10" />
            <span>Call Supervisor</span>
          </button>
        </div>

        {/* Complete Operation */}
        <div className="mt-4">
          <button
            onClick={handleCompleteOperation}
            className="w-full flex items-center justify-center space-x-4 px-12 py-10 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-3xl font-bold shadow-2xl"
          >
            <CheckCircle2 className="w-12 h-12" />
            <span>Complete Operation</span>
          </button>
        </div>
      </div>
    );
  }

  // Downtime Entry Screen
  if (screen === 'downtime') {
    return (
      <div className="min-h-screen bg-gray-900 p-3">
        {/* Header */}
        <div className="bg-red-600 rounded-xl shadow-lg p-3 mb-2 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen('activeJob')}
              className="flex items-center space-x-2 px-3 py-2 bg-red-700 rounded-xl hover:bg-red-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-xl">Back</span>
            </button>
            <h2 className="text-4xl font-bold">Log Downtime</h2>
            <div className="text-right">
              <div className="text-4xl font-bold">{currentTime}</div>
              <div className="text-2xl text-red-100 mt-2">
                Elapsed: {downtimeElapsed} min
              </div>
            </div>
          </div>
        </div>

        {/* Downtime Categories - Large Buttons */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Select Downtime Reason</h3>
          <div className="grid grid-cols-2 gap-3">
            {downtimeCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setDowntimeReason(category.id)}
                className={`flex items-center space-x-6 px-10 py-12 rounded-2xl transition-all shadow-xl ${
                  downtimeReason === category.id
                    ? `${category.color} text-white ring-8 ring-blue-400`
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-16 h-16" />
                <span className="text-3xl font-bold">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Reasons */}
        {downtimeReason && (
          <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Select Specific Reason</h3>
            <div className="grid grid-cols-2 gap-2">
              {downtimeCategories
                .find((cat) => cat.id === downtimeReason)
                ?.subReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setDowntimeSubReason(reason)}
                    className={`px-8 py-2 rounded-xl text-2xl font-semibold transition-all ${
                      downtimeSubReason === reason
                        ? 'bg-blue-600 text-white ring-4 ring-blue-400'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Remarks */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Remarks (Optional)</h3>
          <textarea
            value={downtimeRemarks}
            onChange={(e) => setDowntimeRemarks(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Additional remarks..."
          />
        </div>

        {/* End Downtime */}
        <button
          onClick={handleEndDowntime}
          className="w-full flex items-center justify-center space-x-4 px-12 py-10 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-3xl font-bold shadow-2xl"
        >
          <CheckCircle2 className="w-12 h-12" />
          <span>End Downtime & Resume Production</span>
        </button>
      </div>
    );
  }

  // Material Request Screen
  if (screen === 'materialRequest') {
    return (
      <div className="min-h-screen bg-gray-900 p-3">
        {/* Header */}
        <div className="bg-blue-600 rounded-xl shadow-lg p-3 mb-2 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen('activeJob')}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-700 rounded-xl hover:bg-blue-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-xl">Back</span>
            </button>
            <h2 className="text-4xl font-bold">Material Request</h2>
            <div className="text-4xl font-bold">{currentTime}</div>
          </div>
        </div>

        {/* Material Selection */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Select Material</h3>
          <div className="grid grid-cols-2 gap-2">
            {bomMaterials.map((material) => (
              <button
                key={material}
                onClick={() => setRequestedMaterial(material)}
                className={`px-8 py-8 rounded-xl text-2xl font-semibold transition-all ${
                  requestedMaterial === material
                    ? 'bg-blue-600 text-white ring-4 ring-blue-400'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {material}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Entry */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Request Quantity</h3>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setRequestQuantity(Math.max(0, requestQuantity - 10))}
              className="w-20 h-20 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Minus className="w-10 h-10" />
            </button>
            <input
              type="number"
              value={requestQuantity}
              onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 0)}
              className="flex-1 px-8 py-2 text-5xl font-bold text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => setRequestQuantity(requestQuantity + 10)}
              className="w-20 h-20 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-10 h-10" />
            </button>
          </div>
        </div>

        {/* Urgency */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-2">
          <h3 className="text-3xl font-bold text-gray-900 mb-3">Urgency Level</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRequestUrgency('normal')}
              className={`px-10 py-10 rounded-xl text-3xl font-bold transition-all ${
                requestUrgency === 'normal'
                  ? 'bg-blue-600 text-white ring-4 ring-blue-400'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setRequestUrgency('urgent')}
              className={`px-10 py-10 rounded-xl text-3xl font-bold transition-all ${
                requestUrgency === 'urgent'
                  ? 'bg-red-600 text-white ring-4 ring-red-400'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Urgent
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmitMaterialRequest}
          className="w-full flex items-center justify-center space-x-4 px-12 py-10 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-3xl font-bold shadow-2xl"
        >
          <CheckCircle2 className="w-12 h-12" />
          <span>Submit Material Request</span>
        </button>
      </div>
    );
  }

  // End Shift Screen
  if (screen === 'endShift') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center p-3">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Clock className="w-24 h-24 text-orange-600 mb-2" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">End of Shift Summary</h1>
            <p className="text-gray-600 text-xl">{selectedShift}</p>
          </div>

          {/* Summary Stats */}
          <div className="space-y-3 mb-8">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                  <div>
                    <p className="text-gray-600 text-xl">Total Produced</p>
                    <p className="text-4xl font-bold text-gray-900">{totalProduced}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <XCircle className="w-12 h-12 text-red-600" />
                  <div>
                    <p className="text-gray-600 text-xl">Total Rejections</p>
                    <p className="text-4xl font-bold text-gray-900">{totalRejections}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-500 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <AlertTriangle className="w-12 h-12 text-orange-600" />
                  <div>
                    <p className="text-gray-600 text-xl">Total Downtime</p>
                    <p className="text-4xl font-bold text-gray-900">{totalDowntime} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Sign-off */}
          <div className="mb-8">
            <label className="block text-xl font-semibold text-gray-700 mb-3">
              Digital Sign-off (Enter PIN)
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 text-2xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter PIN to confirm"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScreen('dashboard')}
              className="px-8 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-2xl font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEndShift}
              className="px-8 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors text-2xl font-semibold shadow-lg"
            >
              Confirm & Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Components */}
      <QualityAlertModal
        isOpen={isQualityAlertOpen}
        onClose={() => setIsQualityAlertOpen(false)}
        onSubmit={handleQualityAlertSubmit}
        context={getModalContext()}
      />

      <SupervisorCallModal
        isOpen={isSupervisorCallOpen}
        onClose={() => setIsSupervisorCallOpen(false)}
        onSubmit={handleSupervisorCallSubmit}
        context={getModalContext()}
      />

      <QuickDowntimeModal
        isOpen={isQuickDowntimeOpen}
        onClose={() => setIsQuickDowntimeOpen(false)}
        onSubmit={handleQuickDowntimeSubmit}
        context={getModalContext()}
      />
    </>
  );
}
