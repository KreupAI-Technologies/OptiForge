'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  Activity,
  Users,
  Package,
  Wrench,
  Download,
  Edit,
  Play,
  Pause,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  Zap,
  CircleDot,
  User,
  Award,
  BookOpen,
  BarChart3,
  Box,
  AlertCircle,
  PackageCheck,
  Boxes,
  TrendingDown,
  DollarSign,
  Settings,
  RefreshCw,
  Calendar,
  FileText,
  Bell,
  Radio,
  Shield,
  Gauge,
  Factory,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

// TypeScript Interfaces
interface FloorActivity {
  id: string;
  workCenter: string;
  status: 'running' | 'idle' | 'setup' | 'breakdown';
  statusColor: string;
  currentWO: string;
  product: string;
  targetQuantity: number;
  producedQuantity: number;
  progress: number;
  plannedCycleTime: number; // seconds
  actualCycleTime: number; // seconds
  operator: string;
  operatorId: string;
  startTime: string;
  elapsedTime: string; // HH:MM
  machineStatus: 'running' | 'idle' | 'breakdown' | 'setup';
  machineHealth: number; // 0-100
  temperature: number; // celsius
  speed: number; // rpm or units/hr
  lastUpdate: string;
}

interface OperatorPerformance {
  id: string;
  operatorName: string;
  operatorId: string;
  photo: string;
  workCenter: string;
  operationsCompleted: number;
  quantityProduced: number;
  targetQuantity: number;
  efficiency: number; // percentage
  qualityScore: number; // percentage
  loginTime: string;
  hoursWorked: number;
  skills: string[];
  certifications: string[];
  trainingNeeded: string[];
  performanceRating: 'excellent' | 'good' | 'average' | 'poor';
  attendanceStreak: number; // days
}

interface MaterialConsumption {
  id: string;
  materialCode: string;
  materialDescription: string;
  requiredQuantity: number;
  issuedQuantity: number;
  consumedQuantity: number;
  balanceQuantity: number;
  variance: number; // positive = over consumption
  variancePercent: number;
  scrapQuantity: number;
  scrapPercent: number;
  storageLocation: string;
  batchNumber: string;
  lotNumber: string;
  expiryDate: string;
  unitCost: number;
  totalCost: number;
  status: 'adequate' | 'low' | 'critical' | 'excess';
}

interface ToolTracking {
  id: string;
  toolId: string;
  toolDescription: string;
  toolType: 'cutting' | 'die' | 'mold' | 'fixture' | 'gauge';
  workCenter: string;
  toolLife: number; // remaining percentage
  totalLifeCapacity: number; // shots or hours
  usedLife: number;
  remainingLife: number;
  usageCountToday: number;
  status: 'active' | 'due_for_maintenance' | 'replacement_due' | 'broken';
  lastMaintenanceDate: string;
  nextMaintenanceDue: string;
  maintenanceInterval: number; // shots or hours
  costPerPart: number;
  toolLocation: string;
  assignedOperator: string;
}

interface DowntimeAlert {
  id: string;
  workCenter: string;
  reason: string;
  category: 'breakdown' | 'material' | 'quality' | 'setup' | 'tool' | 'other';
  startTime: string;
  duration: string; // HH:MM
  severity: 'high' | 'medium' | 'low';
  status: 'ongoing' | 'resolved';
  actionTaken?: string;
}

interface MaterialRequest {
  id: string;
  workCenter: string;
  materialCode: string;
  materialName: string;
  requestedQuantity: number;
  urgency: 'normal' | 'urgent' | 'critical';
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'issued' | 'rejected';
}

interface QualityAlert {
  id: string;
  workCenter: string;
  woNumber: string;
  product: string;
  defectType: string;
  defectCount: number;
  severity: 'critical' | 'major' | 'minor';
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'under_investigation' | 'resolved';
}

interface ShiftHandoverNote {
  id: string;
  fromShift: string;
  toShift: string;
  date: string;
  notes: string;
  pendingIssues: string[];
  completedWOs: number;
  ongoingWOs: number;
  handoverBy: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

interface ActivityTimelineItem {
  id: string;
  timestamp: string;
  type: 'production' | 'downtime' | 'material' | 'quality' | 'tool' | 'operator';
  workCenter: string;
  description: string;
  details: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

interface ProductionFloorData {
  id: string;
  floorName: string;
  workCenterName: string;
  shift: string;
  shiftStartTime: string;
  shiftEndTime: string;
  date: string;
  status: 'active' | 'idle' | 'breakdown' | 'maintenance';
  activeWorkOrders: number;
  outputToday: number;
  outputTarget: number;
  oee: number; // Overall Equipment Effectiveness %
  availability: number; // %
  performance: number; // %
  quality: number; // %
  downtimeHours: number;
  plannedDowntime: number;
  unplannedDowntime: number;
  supervisor: string;
  totalOperators: number;
  activeOperators: number;
  floorActivities: FloorActivity[];
  operatorPerformance: OperatorPerformance[];
  materialConsumption: MaterialConsumption[];
  toolTracking: ToolTracking[];
  downtimeAlerts: DowntimeAlert[];
  materialRequests: MaterialRequest[];
  qualityAlerts: QualityAlert[];
  shiftHandoverNotes: ShiftHandoverNote[];
  activityTimeline: ActivityTimelineItem[];
}

export default function ProductionFloorViewPage() {
  const params = useParams();
  const router = useRouter();
  const floorId = params.id as string;

  const [activeTab, setActiveTab] = useState<'floor' | 'operators' | 'materials' | 'tools'>('floor');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Mock data - replace with API call
  const [floorData, setFloorData] = useState<ProductionFloorData>({
    id: floorId,
    floorName: 'Production Floor A',
    workCenterName: 'Main Manufacturing Unit',
    shift: 'Shift 1 (Morning)',
    shiftStartTime: '06:00 AM',
    shiftEndTime: '02:00 PM',
    date: '2025-01-15',
    status: 'active',
    activeWorkOrders: 8,
    outputToday: 1250,
    outputTarget: 1500,
    oee: 78.5,
    availability: 85.2,
    performance: 92.1,
    quality: 96.8,
    downtimeHours: 1.8,
    plannedDowntime: 0.5,
    unplannedDowntime: 1.3,
    supervisor: 'Rajesh Kumar',
    totalOperators: 15,
    activeOperators: 14,
    floorActivities: [
      {
        id: '1',
        workCenter: 'Assembly Line 1',
        status: 'running',
        statusColor: 'green',
        currentWO: 'WO-2025-0145',
        product: 'Electric Motor - 5HP',
        targetQuantity: 200,
        producedQuantity: 145,
        progress: 72.5,
        plannedCycleTime: 180,
        actualCycleTime: 175,
        operator: 'Amit Sharma',
        operatorId: 'EMP-1234',
        startTime: '06:15 AM',
        elapsedTime: '05:35',
        machineStatus: 'running',
        machineHealth: 92,
        temperature: 65,
        speed: 1200,
        lastUpdate: '11:50 AM',
      },
      {
        id: '2',
        workCenter: 'Machining Center 1',
        status: 'running',
        statusColor: 'green',
        currentWO: 'WO-2025-0146',
        product: 'Shaft - 50mm Dia',
        targetQuantity: 150,
        producedQuantity: 98,
        progress: 65.3,
        plannedCycleTime: 240,
        actualCycleTime: 252,
        operator: 'Suresh Patel',
        operatorId: 'EMP-1235',
        startTime: '06:30 AM',
        elapsedTime: '05:20',
        machineStatus: 'running',
        machineHealth: 88,
        temperature: 72,
        speed: 850,
        lastUpdate: '11:50 AM',
      },
      {
        id: '3',
        workCenter: 'Welding Station 1',
        status: 'setup',
        statusColor: 'blue',
        currentWO: 'WO-2025-0147',
        product: 'Frame Assembly',
        targetQuantity: 80,
        producedQuantity: 52,
        progress: 65.0,
        plannedCycleTime: 420,
        actualCycleTime: 410,
        operator: 'Vikram Singh',
        operatorId: 'EMP-1236',
        startTime: '06:00 AM',
        elapsedTime: '05:50',
        machineStatus: 'setup',
        machineHealth: 85,
        temperature: 45,
        speed: 0,
        lastUpdate: '11:50 AM',
      },
      {
        id: '4',
        workCenter: 'Paint Shop 1',
        status: 'running',
        statusColor: 'green',
        currentWO: 'WO-2025-0148',
        product: 'Cabinet - Powder Coated',
        targetQuantity: 120,
        producedQuantity: 87,
        progress: 72.5,
        plannedCycleTime: 300,
        actualCycleTime: 295,
        operator: 'Ramesh Yadav',
        operatorId: 'EMP-1237',
        startTime: '06:45 AM',
        elapsedTime: '05:05',
        machineStatus: 'running',
        machineHealth: 94,
        temperature: 55,
        speed: 450,
        lastUpdate: '11:50 AM',
      },
      {
        id: '5',
        workCenter: 'Assembly Line 2',
        status: 'breakdown',
        statusColor: 'red',
        currentWO: 'WO-2025-0149',
        product: 'Control Panel',
        targetQuantity: 100,
        producedQuantity: 38,
        progress: 38.0,
        plannedCycleTime: 360,
        actualCycleTime: 360,
        operator: 'Deepak Verma',
        operatorId: 'EMP-1238',
        startTime: '06:00 AM',
        elapsedTime: '05:50',
        machineStatus: 'breakdown',
        machineHealth: 45,
        temperature: 85,
        speed: 0,
        lastUpdate: '11:50 AM',
      },
      {
        id: '6',
        workCenter: 'CNC Machine 1',
        status: 'running',
        statusColor: 'green',
        currentWO: 'WO-2025-0150',
        product: 'Gear - 20 Teeth',
        targetQuantity: 300,
        producedQuantity: 234,
        progress: 78.0,
        plannedCycleTime: 120,
        actualCycleTime: 118,
        operator: 'Manoj Kumar',
        operatorId: 'EMP-1239',
        startTime: '06:00 AM',
        elapsedTime: '05:50',
        machineStatus: 'running',
        machineHealth: 96,
        temperature: 68,
        speed: 2400,
        lastUpdate: '11:50 AM',
      },
      {
        id: '7',
        workCenter: 'QC Station 1',
        status: 'running',
        statusColor: 'green',
        currentWO: 'WO-2025-0145',
        product: 'Electric Motor - Inspection',
        targetQuantity: 200,
        producedQuantity: 142,
        progress: 71.0,
        plannedCycleTime: 60,
        actualCycleTime: 58,
        operator: 'Priya Desai',
        operatorId: 'EMP-1240',
        startTime: '06:30 AM',
        elapsedTime: '05:20',
        machineStatus: 'running',
        machineHealth: 100,
        temperature: 28,
        speed: 0,
        lastUpdate: '11:50 AM',
      },
      {
        id: '8',
        workCenter: 'Packaging Line 1',
        status: 'idle',
        statusColor: 'yellow',
        currentWO: 'WO-2025-0144',
        product: 'Finished Goods Packing',
        targetQuantity: 150,
        producedQuantity: 150,
        progress: 100.0,
        plannedCycleTime: 90,
        actualCycleTime: 88,
        operator: 'Sunita Rao',
        operatorId: 'EMP-1241',
        startTime: '06:00 AM',
        elapsedTime: '05:50',
        machineStatus: 'idle',
        machineHealth: 98,
        temperature: 25,
        speed: 0,
        lastUpdate: '11:50 AM',
      },
    ],
    operatorPerformance: [
      {
        id: '1',
        operatorName: 'Amit Sharma',
        operatorId: 'EMP-1234',
        photo: '/avatars/amit.jpg',
        workCenter: 'Assembly Line 1',
        operationsCompleted: 3,
        quantityProduced: 145,
        targetQuantity: 150,
        efficiency: 102.5,
        qualityScore: 98.5,
        loginTime: '06:00 AM',
        hoursWorked: 5.83,
        skills: ['Assembly', 'Quality Check', 'Machine Operation'],
        certifications: ['Assembly Level 3', 'Safety Training', '5S Certified'],
        trainingNeeded: [],
        performanceRating: 'excellent',
        attendanceStreak: 45,
      },
      {
        id: '2',
        operatorName: 'Suresh Patel',
        operatorId: 'EMP-1235',
        photo: '/avatars/suresh.jpg',
        workCenter: 'Machining Center 1',
        operationsCompleted: 2,
        quantityProduced: 98,
        targetQuantity: 100,
        efficiency: 95.2,
        qualityScore: 97.0,
        loginTime: '06:15 AM',
        hoursWorked: 5.58,
        skills: ['CNC Operation', 'Programming', 'Wrench Setting'],
        certifications: ['CNC Level 2', 'Safety Training'],
        trainingNeeded: ['Advanced Programming'],
        performanceRating: 'good',
        attendanceStreak: 30,
      },
      {
        id: '3',
        operatorName: 'Vikram Singh',
        operatorId: 'EMP-1236',
        photo: '/avatars/vikram.jpg',
        workCenter: 'Welding Station 1',
        operationsCompleted: 2,
        quantityProduced: 52,
        targetQuantity: 60,
        efficiency: 88.5,
        qualityScore: 95.0,
        loginTime: '06:00 AM',
        hoursWorked: 5.83,
        skills: ['MIG Welding', 'TIG Welding', 'Spot Welding'],
        certifications: ['Welding Level 2', 'Safety Training'],
        trainingNeeded: ['TIG Advanced'],
        performanceRating: 'good',
        attendanceStreak: 22,
      },
      {
        id: '4',
        operatorName: 'Ramesh Yadav',
        operatorId: 'EMP-1237',
        photo: '/avatars/ramesh.jpg',
        workCenter: 'Paint Shop 1',
        operationsCompleted: 3,
        quantityProduced: 87,
        targetQuantity: 85,
        efficiency: 108.2,
        qualityScore: 99.0,
        loginTime: '06:30 AM',
        hoursWorked: 5.33,
        skills: ['Powder Coating', 'Surface Prep', 'Quality Inspection'],
        certifications: ['Painting Level 3', 'Safety Training', 'Environment Compliance'],
        trainingNeeded: [],
        performanceRating: 'excellent',
        attendanceStreak: 60,
      },
      {
        id: '5',
        operatorName: 'Deepak Verma',
        operatorId: 'EMP-1238',
        photo: '/avatars/deepak.jpg',
        workCenter: 'Assembly Line 2',
        operationsCompleted: 1,
        quantityProduced: 38,
        targetQuantity: 70,
        efficiency: 65.0,
        qualityScore: 94.0,
        loginTime: '06:00 AM',
        hoursWorked: 5.83,
        skills: ['Assembly', 'Electrical Wiring'],
        certifications: ['Assembly Level 1', 'Safety Training'],
        trainingNeeded: ['Electrical Advanced', 'Troubleshooting'],
        performanceRating: 'average',
        attendanceStreak: 15,
      },
      {
        id: '6',
        operatorName: 'Manoj Kumar',
        operatorId: 'EMP-1239',
        photo: '/avatars/manoj.jpg',
        workCenter: 'CNC Machine 1',
        operationsCompleted: 4,
        quantityProduced: 234,
        targetQuantity: 220,
        efficiency: 110.5,
        qualityScore: 99.5,
        loginTime: '06:00 AM',
        hoursWorked: 5.83,
        skills: ['CNC Programming', 'Wrench Setting', 'Maintenance'],
        certifications: ['CNC Level 3', 'Programming Advanced', 'Safety Training'],
        trainingNeeded: [],
        performanceRating: 'excellent',
        attendanceStreak: 75,
      },
      {
        id: '7',
        operatorName: 'Priya Desai',
        operatorId: 'EMP-1240',
        photo: '/avatars/priya.jpg',
        workCenter: 'QC Station 1',
        operationsCompleted: 5,
        quantityProduced: 142,
        targetQuantity: 140,
        efficiency: 103.5,
        qualityScore: 100.0,
        loginTime: '06:15 AM',
        hoursWorked: 5.58,
        skills: ['Quality Inspection', 'CMM Operation', 'Statistical Analysis'],
        certifications: ['QC Level 3', 'ISO 9001 Auditor', 'Six Sigma Green Belt'],
        trainingNeeded: [],
        performanceRating: 'excellent',
        attendanceStreak: 90,
      },
      {
        id: '8',
        operatorName: 'Sunita Rao',
        operatorId: 'EMP-1241',
        photo: '/avatars/sunita.jpg',
        workCenter: 'Packaging Line 1',
        operationsCompleted: 3,
        quantityProduced: 150,
        targetQuantity: 150,
        efficiency: 100.0,
        qualityScore: 98.0,
        loginTime: '06:00 AM',
        hoursWorked: 5.83,
        skills: ['Packaging', 'Labeling', 'Dispatch Coordination'],
        certifications: ['Packaging Level 2', 'Safety Training'],
        trainingNeeded: ['Forklift Operation'],
        performanceRating: 'good',
        attendanceStreak: 35,
      },
    ],
    materialConsumption: [
      {
        id: '1',
        materialCode: 'RM-SS-304-001',
        materialDescription: 'Stainless Steel 304 - Sheet 2mm',
        requiredQuantity: 250,
        issuedQuantity: 260,
        consumedQuantity: 245,
        balanceQuantity: 15,
        variance: -5,
        variancePercent: -2.0,
        scrapQuantity: 12,
        scrapPercent: 4.8,
        storageLocation: 'WH-A-R12-B03',
        batchNumber: 'BTH-2025-0234',
        lotNumber: 'LOT-SS304-098',
        expiryDate: 'N/A',
        unitCost: 450,
        totalCost: 110250,
        status: 'adequate',
      },
      {
        id: '2',
        materialCode: 'RM-AL-6061-002',
        materialDescription: 'Aluminium 6061 - Rod 50mm',
        requiredQuantity: 180,
        issuedQuantity: 185,
        consumedQuantity: 178,
        balanceQuantity: 7,
        variance: -2,
        variancePercent: -1.1,
        scrapQuantity: 5,
        scrapPercent: 2.8,
        storageLocation: 'WH-A-R08-B12',
        batchNumber: 'BTH-2025-0198',
        lotNumber: 'LOT-AL6061-145',
        expiryDate: 'N/A',
        unitCost: 380,
        totalCost: 67640,
        status: 'adequate',
      },
      {
        id: '3',
        materialCode: 'RM-MS-001',
        materialDescription: 'Mild Steel - Plate 10mm',
        requiredQuantity: 320,
        issuedQuantity: 320,
        consumedQuantity: 298,
        balanceQuantity: 22,
        variance: -22,
        variancePercent: -6.9,
        scrapQuantity: 18,
        scrapPercent: 5.6,
        storageLocation: 'WH-B-R03-B05',
        batchNumber: 'BTH-2025-0156',
        lotNumber: 'LOT-MS-267',
        expiryDate: 'N/A',
        unitCost: 280,
        totalCost: 83440,
        status: 'adequate',
      },
      {
        id: '4',
        materialCode: 'RM-WD-E7018-003',
        materialDescription: 'Welding Electrode E7018 - 3.2mm',
        requiredQuantity: 45,
        issuedQuantity: 50,
        consumedQuantity: 42,
        balanceQuantity: 8,
        variance: -3,
        variancePercent: -6.7,
        scrapQuantity: 3,
        scrapPercent: 6.7,
        storageLocation: 'WH-C-R05-B08',
        batchNumber: 'BTH-2025-0287',
        lotNumber: 'LOT-WD-E7018-034',
        expiryDate: '2026-06-30',
        unitCost: 850,
        totalCost: 35700,
        status: 'adequate',
      },
      {
        id: '5',
        materialCode: 'RM-PT-PWD-BLK-004',
        materialDescription: 'Powder Paint - Black RAL 9005',
        requiredQuantity: 75,
        issuedQuantity: 80,
        consumedQuantity: 72,
        balanceQuantity: 8,
        variance: -3,
        variancePercent: -4.0,
        scrapQuantity: 5,
        scrapPercent: 6.7,
        storageLocation: 'WH-D-R02-B15',
        batchNumber: 'BTH-2025-0312',
        lotNumber: 'LOT-PWD-BLK-089',
        expiryDate: '2026-12-31',
        unitCost: 1200,
        totalCost: 86400,
        status: 'adequate',
      },
      {
        id: '6',
        materialCode: 'RM-BR-M12-005',
        materialDescription: 'Bolt M12x50 - Grade 8.8',
        requiredQuantity: 1200,
        issuedQuantity: 1250,
        consumedQuantity: 1195,
        balanceQuantity: 55,
        variance: -5,
        variancePercent: -0.4,
        scrapQuantity: 8,
        scrapPercent: 0.6,
        storageLocation: 'WH-E-R10-B20',
        batchNumber: 'BTH-2025-0245',
        lotNumber: 'LOT-BR-M12-156',
        expiryDate: 'N/A',
        unitCost: 8,
        totalCost: 9560,
        status: 'adequate',
      },
      {
        id: '7',
        materialCode: 'RM-CB-PVC-006',
        materialDescription: 'PVC Cable 1.5 sq mm - Red',
        requiredQuantity: 850,
        issuedQuantity: 900,
        consumedQuantity: 835,
        balanceQuantity: 65,
        variance: -15,
        variancePercent: -1.8,
        scrapQuantity: 45,
        scrapPercent: 5.3,
        storageLocation: 'WH-F-R06-B11',
        batchNumber: 'BTH-2025-0178',
        lotNumber: 'LOT-CB-PVC-223',
        expiryDate: 'N/A',
        unitCost: 15,
        totalCost: 12525,
        status: 'adequate',
      },
      {
        id: '8',
        materialCode: 'RM-GB-STD-007',
        materialDescription: 'Gearbox - Standard 1:10',
        requiredQuantity: 200,
        issuedQuantity: 205,
        consumedQuantity: 198,
        balanceQuantity: 7,
        variance: -2,
        variancePercent: -1.0,
        scrapQuantity: 2,
        scrapPercent: 1.0,
        storageLocation: 'WH-G-R15-B07',
        batchNumber: 'BTH-2025-0289',
        lotNumber: 'LOT-GB-STD-045',
        expiryDate: 'N/A',
        unitCost: 3500,
        totalCost: 693000,
        status: 'low',
      },
      {
        id: '9',
        materialCode: 'RM-BRG-6205-008',
        materialDescription: 'Bearing 6205 ZZ',
        requiredQuantity: 400,
        issuedQuantity: 410,
        consumedQuantity: 395,
        balanceQuantity: 15,
        variance: -5,
        variancePercent: -1.3,
        scrapQuantity: 3,
        scrapPercent: 0.7,
        storageLocation: 'WH-H-R09-B14',
        batchNumber: 'BTH-2025-0267',
        lotNumber: 'LOT-BRG-6205-178',
        expiryDate: 'N/A',
        unitCost: 180,
        totalCost: 71100,
        status: 'critical',
      },
      {
        id: '10',
        materialCode: 'RM-TH-003',
        materialDescription: 'Thinner - Industrial Grade',
        requiredQuantity: 120,
        issuedQuantity: 125,
        consumedQuantity: 118,
        balanceQuantity: 7,
        variance: -2,
        variancePercent: -1.7,
        scrapQuantity: 5,
        scrapPercent: 4.0,
        storageLocation: 'WH-I-R01-B09',
        batchNumber: 'BTH-2025-0301',
        lotNumber: 'LOT-TH-067',
        expiryDate: '2026-03-31',
        unitCost: 450,
        totalCost: 53100,
        status: 'adequate',
      },
    ],
    toolTracking: [
      {
        id: '1',
        toolId: 'TL-CNC-001',
        toolDescription: 'Carbide End Mill 12mm - 4 Flute',
        toolType: 'cutting',
        workCenter: 'CNC Machine 1',
        toolLife: 68,
        totalLifeCapacity: 5000,
        usedLife: 1600,
        remainingLife: 3400,
        usageCountToday: 234,
        status: 'active',
        lastMaintenanceDate: '2025-01-10',
        nextMaintenanceDue: '2025-01-20',
        maintenanceInterval: 1000,
        costPerPart: 2.5,
        toolLocation: 'Wrench Crib A - Rack 5',
        assignedOperator: 'Manoj Kumar',
      },
      {
        id: '2',
        toolId: 'TL-WLD-002',
        toolDescription: 'Welding Tip - 1.2mm',
        toolType: 'cutting',
        workCenter: 'Welding Station 1',
        toolLife: 45,
        totalLifeCapacity: 2000,
        usedLife: 1100,
        remainingLife: 900,
        usageCountToday: 52,
        status: 'due_for_maintenance',
        lastMaintenanceDate: '2025-01-08',
        nextMaintenanceDue: '2025-01-15',
        maintenanceInterval: 500,
        costPerPart: 1.8,
        toolLocation: 'Wrench Crib B - Rack 2',
        assignedOperator: 'Vikram Singh',
      },
      {
        id: '3',
        toolId: 'TL-DIE-003',
        toolDescription: 'Bending Die - 90 Degree V-Type',
        toolType: 'die',
        workCenter: 'Press Machine 1',
        toolLife: 82,
        totalLifeCapacity: 10000,
        usedLife: 1800,
        remainingLife: 8200,
        usageCountToday: 145,
        status: 'active',
        lastMaintenanceDate: '2025-01-05',
        nextMaintenanceDue: '2025-01-25',
        maintenanceInterval: 2000,
        costPerPart: 0.8,
        toolLocation: 'Wrench Crib C - Rack 1',
        assignedOperator: 'Amit Sharma',
      },
      {
        id: '4',
        toolId: 'TL-MLD-004',
        toolDescription: 'Injection Mold - Part A',
        toolType: 'mold',
        workCenter: 'Molding Machine 1',
        toolLife: 15,
        totalLifeCapacity: 50000,
        usedLife: 42500,
        remainingLife: 7500,
        usageCountToday: 0,
        status: 'replacement_due',
        lastMaintenanceDate: '2025-01-01',
        nextMaintenanceDue: '2025-01-12',
        maintenanceInterval: 10000,
        costPerPart: 5.2,
        toolLocation: 'Wrench Crib D - Rack 8',
        assignedOperator: 'Not Assigned',
      },
      {
        id: '5',
        toolId: 'TL-FIX-005',
        toolDescription: 'Assembly Fixture - Motor Housing',
        toolType: 'fixture',
        workCenter: 'Assembly Line 1',
        toolLife: 95,
        totalLifeCapacity: 100000,
        usedLife: 5000,
        remainingLife: 95000,
        usageCountToday: 145,
        status: 'active',
        lastMaintenanceDate: '2024-12-20',
        nextMaintenanceDue: '2025-02-20',
        maintenanceInterval: 20000,
        costPerPart: 0.05,
        toolLocation: 'Assembly Floor - Station 1',
        assignedOperator: 'Amit Sharma',
      },
      {
        id: '6',
        toolId: 'TL-GAG-006',
        toolDescription: 'Go/No-Go Gauge - 50mm Dia',
        toolType: 'gauge',
        workCenter: 'QC Station 1',
        toolLife: 100,
        totalLifeCapacity: 50000,
        usedLife: 0,
        remainingLife: 50000,
        usageCountToday: 142,
        status: 'active',
        lastMaintenanceDate: '2025-01-01',
        nextMaintenanceDue: '2025-07-01',
        maintenanceInterval: 25000,
        costPerPart: 0.02,
        toolLocation: 'QC Lab - Cabinet 3',
        assignedOperator: 'Priya Desai',
      },
      {
        id: '7',
        toolId: 'TL-CUT-007',
        toolDescription: 'Plasma Cutting Nozzle',
        toolType: 'cutting',
        workCenter: 'Cutting Machine 1',
        toolLife: 38,
        totalLifeCapacity: 1500,
        usedLife: 930,
        remainingLife: 570,
        usageCountToday: 0,
        status: 'due_for_maintenance',
        lastMaintenanceDate: '2025-01-12',
        nextMaintenanceDue: '2025-01-14',
        maintenanceInterval: 300,
        costPerPart: 3.2,
        toolLocation: 'Wrench Crib A - Rack 12',
        assignedOperator: 'Not Assigned',
      },
      {
        id: '8',
        toolId: 'TL-DRL-008',
        toolDescription: 'HSS Drill Bit 8mm',
        toolType: 'cutting',
        workCenter: 'Machining Center 1',
        toolLife: 72,
        totalLifeCapacity: 800,
        usedLife: 224,
        remainingLife: 576,
        usageCountToday: 98,
        status: 'active',
        lastMaintenanceDate: '2025-01-13',
        nextMaintenanceDue: '2025-01-18',
        maintenanceInterval: 200,
        costPerPart: 1.2,
        toolLocation: 'Wrench Crib A - Rack 7',
        assignedOperator: 'Suresh Patel',
      },
    ],
    downtimeAlerts: [
      {
        id: '1',
        workCenter: 'Assembly Line 2',
        reason: 'Conveyor Belt Breakdown',
        category: 'breakdown',
        startTime: '10:15 AM',
        duration: '01:35',
        severity: 'high',
        status: 'ongoing',
      },
      {
        id: '2',
        workCenter: 'Welding Station 1',
        reason: 'Wrench Change - Welding Tip',
        category: 'tool',
        startTime: '11:30 AM',
        duration: '00:20',
        severity: 'low',
        status: 'resolved',
        actionTaken: 'Replaced welding tip, tested and resumed',
      },
      {
        id: '3',
        workCenter: 'Machining Center 1',
        reason: 'Setup for New Part',
        category: 'setup',
        startTime: '09:00 AM',
        duration: '00:45',
        severity: 'medium',
        status: 'resolved',
        actionTaken: 'Setup completed, first piece approved',
      },
    ],
    materialRequests: [
      {
        id: '1',
        workCenter: 'Assembly Line 1',
        materialCode: 'RM-BRG-6205-008',
        materialName: 'Bearing 6205 ZZ',
        requestedQuantity: 50,
        urgency: 'critical',
        requestedBy: 'Amit Sharma',
        requestedAt: '11:25 AM',
        status: 'pending',
      },
      {
        id: '2',
        workCenter: 'Welding Station 1',
        materialCode: 'RM-WD-E7018-003',
        materialName: 'Welding Electrode E7018',
        requestedQuantity: 10,
        urgency: 'urgent',
        requestedBy: 'Vikram Singh',
        requestedAt: '11:10 AM',
        status: 'approved',
      },
      {
        id: '3',
        workCenter: 'Paint Shop 1',
        materialCode: 'RM-TH-003',
        materialName: 'Thinner - Industrial Grade',
        requestedQuantity: 20,
        urgency: 'normal',
        requestedBy: 'Ramesh Yadav',
        requestedAt: '10:45 AM',
        status: 'issued',
      },
    ],
    qualityAlerts: [
      {
        id: '1',
        workCenter: 'Machining Center 1',
        woNumber: 'WO-2025-0146',
        product: 'Shaft - 50mm Dia',
        defectType: 'Dimension Out of Tolerance',
        defectCount: 3,
        severity: 'major',
        reportedBy: 'Priya Desai',
        reportedAt: '10:30 AM',
        status: 'under_investigation',
      },
      {
        id: '2',
        workCenter: 'Paint Shop 1',
        woNumber: 'WO-2025-0148',
        product: 'Cabinet - Powder Coated',
        defectType: 'Surface Roughness',
        defectCount: 2,
        severity: 'minor',
        reportedBy: 'Ramesh Yadav',
        reportedAt: '09:45 AM',
        status: 'resolved',
      },
    ],
    shiftHandoverNotes: [
      {
        id: '1',
        fromShift: 'Night Shift',
        toShift: 'Morning Shift',
        date: '2025-01-15',
        notes: 'Assembly Line 2 conveyor belt showing signs of wear. Maintenance requested. All other lines running smoothly.',
        pendingIssues: [
          'Assembly Line 2 - Conveyor belt maintenance pending',
          'Wrench change required for CNC Machine 2',
          'Material shortage alert for Bearing 6205',
        ],
        completedWOs: 6,
        ongoingWOs: 8,
        handoverBy: 'Rakesh Mehta',
        acknowledgedBy: 'Rajesh Kumar',
        acknowledgedAt: '06:10 AM',
      },
    ],
    activityTimeline: [
      {
        id: '1',
        timestamp: '11:50 AM',
        type: 'production',
        workCenter: 'CNC Machine 1',
        description: 'Production milestone reached',
        details: 'Completed 234/300 units of Gear - 20 Teeth',
        severity: 'success',
      },
      {
        id: '2',
        timestamp: '11:45 AM',
        type: 'quality',
        workCenter: 'QC Station 1',
        description: 'Quality inspection completed',
        details: '50 units inspected, 2 rejections logged',
        severity: 'warning',
      },
      {
        id: '3',
        timestamp: '11:30 AM',
        type: 'tool',
        workCenter: 'Welding Station 1',
        description: 'Wrench change completed',
        details: 'Welding tip replaced, downtime: 20 minutes',
        severity: 'info',
      },
      {
        id: '4',
        timestamp: '11:25 AM',
        type: 'material',
        workCenter: 'Assembly Line 1',
        description: 'Critical material request',
        details: 'Bearing 6205 ZZ - 50 units requested urgently',
        severity: 'error',
      },
      {
        id: '5',
        timestamp: '11:15 AM',
        type: 'operator',
        workCenter: 'Paint Shop 1',
        description: 'Break time started',
        details: 'Operator Ramesh Yadav - Tea break (15 min)',
        severity: 'info',
      },
      {
        id: '6',
        timestamp: '11:00 AM',
        type: 'production',
        workCenter: 'Assembly Line 1',
        description: 'Production update',
        details: 'Completed 130/200 units of Electric Motor - 5HP',
        severity: 'success',
      },
      {
        id: '7',
        timestamp: '10:45 AM',
        type: 'material',
        workCenter: 'Paint Shop 1',
        description: 'Material issued',
        details: 'Thinner - 20 liters issued to Paint Shop',
        severity: 'success',
      },
      {
        id: '8',
        timestamp: '10:30 AM',
        type: 'quality',
        workCenter: 'Machining Center 1',
        description: 'Quality alert raised',
        details: 'Dimension out of tolerance - 3 rejections',
        severity: 'error',
      },
      {
        id: '9',
        timestamp: '10:15 AM',
        type: 'downtime',
        workCenter: 'Assembly Line 2',
        description: 'Breakdown reported',
        details: 'Conveyor belt breakdown - Maintenance called',
        severity: 'error',
      },
      {
        id: '10',
        timestamp: '10:00 AM',
        type: 'production',
        workCenter: 'Packaging Line 1',
        description: 'Work order completed',
        details: 'WO-2025-0144 completed - 150/150 units packed',
        severity: 'success',
      },
    ],
  });

  // Load real floor-activity data from the API and merge it over the mock
  // fallback (which keeps the JSX from crashing when the backend returns
  // partial rows). Raw ORM fields are mapped defensively.
  useEffect(() => {
    let cancelled = false;

    const loadFloorData = async () => {
      try {
        let raw: any = null;
        if (floorId) {
          try {
            raw = await ProductionOrphanService.getFloorActivity(floorId);
          } catch {
            // Fall through to list fetch below if single-record fetch fails.
          }
        }
        if (!raw) {
          const list = await ProductionOrphanService.getFloorActivities();
          if (Array.isArray(list)) {
            raw =
              list.find((a: any) => String(a?.id) === String(floorId)) ||
              list[0] ||
              null;
          }
        }

        if (!cancelled && raw && typeof raw === 'object') {
          setFloorData((prev) => {
            const num = (v: any, fallback: number) =>
              v === null || v === undefined || Number.isNaN(Number(v))
                ? fallback
                : Number(v);
            const str = (v: any, fallback: string) =>
              v === null || v === undefined ? fallback : String(v);
            const arr = <T,>(v: any, fallback: T[]): T[] =>
              Array.isArray(v) ? v : fallback;

            return {
              ...prev,
              id: str(raw.id, prev.id),
              floorName: str(raw.floorName ?? raw.name, prev.floorName),
              workCenterName: str(
                raw.workCenterName ?? raw.workCenter,
                prev.workCenterName
              ),
              shift: str(raw.shift, prev.shift),
              shiftStartTime: str(raw.shiftStartTime, prev.shiftStartTime),
              shiftEndTime: str(raw.shiftEndTime, prev.shiftEndTime),
              date: str(raw.date, prev.date),
              status: str(raw.status, prev.status) as ProductionFloorData['status'],
              activeWorkOrders: num(raw.activeWorkOrders, prev.activeWorkOrders),
              outputToday: num(raw.outputToday ?? raw.producedQuantity, prev.outputToday),
              outputTarget: num(raw.outputTarget ?? raw.targetQuantity, prev.outputTarget),
              oee: num(raw.oee, prev.oee),
              availability: num(raw.availability, prev.availability),
              performance: num(raw.performance, prev.performance),
              quality: num(raw.quality, prev.quality),
              downtimeHours: num(raw.downtimeHours, prev.downtimeHours),
              plannedDowntime: num(raw.plannedDowntime, prev.plannedDowntime),
              unplannedDowntime: num(raw.unplannedDowntime, prev.unplannedDowntime),
              supervisor: str(raw.supervisor, prev.supervisor),
              totalOperators: num(raw.totalOperators, prev.totalOperators),
              activeOperators: num(raw.activeOperators, prev.activeOperators),
              floorActivities: arr(raw.floorActivities, prev.floorActivities),
              operatorPerformance: arr(raw.operatorPerformance, prev.operatorPerformance),
              materialConsumption: arr(raw.materialConsumption, prev.materialConsumption),
              toolTracking: arr(raw.toolTracking, prev.toolTracking),
              downtimeAlerts: arr(raw.downtimeAlerts, prev.downtimeAlerts),
              materialRequests: arr(raw.materialRequests, prev.materialRequests),
              qualityAlerts: arr(raw.qualityAlerts, prev.qualityAlerts),
              shiftHandoverNotes: arr(raw.shiftHandoverNotes, prev.shiftHandoverNotes),
              activityTimeline: arr(raw.activityTimeline, prev.activityTimeline),
            };
          });
        }
      } catch (err) {
        // Keep the mock fallback rendering if the API is unavailable.
        console.error('Failed to load floor activity', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLastRefreshTime(new Date().toLocaleTimeString());
        }
      }
    };

    loadFloorData();

    // Auto-refresh every minute
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefreshTime(new Date().toLocaleTimeString());
        loadFloorData();
      }, 60000);

      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [autoRefresh, floorId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'idle':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'setup':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'breakdown':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'maintenance':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="w-4 h-4" />;
      case 'idle':
        return <Pause className="w-4 h-4" />;
      case 'setup':
        return <Settings className="w-4 h-4" />;
      case 'breakdown':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CircleDot className="w-4 h-4" />;
    }
  };

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'breakdown':
        return 'bg-red-500';
      case 'setup':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPerformanceRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaterialStatusColor = (status: string) => {
    switch (status) {
      case 'adequate':
        return 'bg-green-100 text-green-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'excess':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getToolStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'due_for_maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'replacement_due':
        return 'bg-red-100 text-red-800';
      case 'broken':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'major':
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimelineSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading production floor data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/production/floor')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{floorData.floorName}</h1>
              <p className="text-gray-600">{floorData.workCenterName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                autoRefresh
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span className="text-sm font-medium">
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </span>
            </button>
            <button
              onClick={() => router.push(`/production/floor/edit/${floorId}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Record Production</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Floor Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shift</p>
                <p className="text-lg font-semibold text-gray-900">{floorData.shift}</p>
                <p className="text-xs text-gray-500">
                  {floorData.shiftStartTime} - {floorData.shiftEndTime}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-lg font-semibold text-gray-900">{floorData.date}</p>
                <p className="text-xs text-gray-500">Supervisor: {floorData.supervisor}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      floorData.status
                    )}`}
                  >
                    {floorData.status.toUpperCase()}
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Operators</p>
                <p className="text-lg font-semibold text-gray-900">
                  {floorData.activeOperators}/{floorData.totalOperators}
                </p>
                <p className="text-xs text-gray-500">Active on floor</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Active Work Orders</p>
                <p className="text-3xl font-bold">{floorData.activeWorkOrders}</p>
              </div>
              <ClipboardList className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Output Today</p>
                <p className="text-3xl font-bold">{floorData.outputToday}</p>
                <p className="text-xs text-green-100">
                  Target: {floorData.outputTarget} ({((floorData.outputToday / floorData.outputTarget) * 100).toFixed(1)}%)
                </p>
              </div>
              <Target className="w-12 h-12 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">OEE %</p>
                <p className="text-3xl font-bold">{floorData.oee}%</p>
                <div className="text-xs text-purple-100 mt-1">
                  <div>A: {floorData.availability}% | P: {floorData.performance}%</div>
                  <div>Q: {floorData.quality}%</div>
                </div>
              </div>
              <Gauge className="w-12 h-12 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-100">Downtime Hours</p>
                <p className="text-3xl font-bold">{floorData.downtimeHours}</p>
                <p className="text-xs text-red-100">
                  Planned: {floorData.plannedDowntime}h | Unplanned: {floorData.unplannedDowntime}h
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-200" />
            </div>
          </div>
        </div>

        {/* Last Refresh */}
        {lastRefreshTime && (
          <div className="mt-4 text-sm text-gray-600 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Last updated: {lastRefreshTime}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border mb-3">
        <div className="border-b">
          <div className="flex space-x-1 p-1">
            <button
              onClick={() => setActiveTab('floor')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'floor'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Factory className="w-5 h-5" />
              <span>Floor Status</span>
            </button>
            <button
              onClick={() => setActiveTab('operators')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'operators'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Operator Performance</span>
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'materials'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Material Consumption</span>
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tools'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>Wrench & Die Tracking</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Floor Status Tab */}
          {activeTab === 'floor' && (
            <div className="space-y-3">
              {/* Work Center Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Work Center Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {floorData.floorActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`bg-white border-2 rounded-lg p-3 ${
                        activity.status === 'breakdown'
                          ? 'border-red-300 animate-pulse'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{activity.workCenter}</h4>
                        <div
                          className={`w-4 h-4 rounded-full ${getMachineStatusColor(
                            activity.machineStatus
                          )} animate-pulse`}
                        ></div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {getStatusIcon(activity.status)}
                          <span>{activity.status.toUpperCase()}</span>
                        </span>
                        <span className="text-xs text-gray-500">{activity.lastUpdate}</span>
                      </div>

                      {/* WO and Product */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">WO: {activity.currentWO}</p>
                        <p className="font-medium text-gray-900">{activity.product}</p>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">
                            {activity.producedQuantity}/{activity.targetQuantity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              activity.progress >= 90
                                ? 'bg-green-500'
                                : activity.progress >= 50
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{activity.progress.toFixed(1)}% completed</p>
                      </div>

                      {/* Cycle Time */}
                      <div className="mb-3 grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-blue-600">Planned Cycle</p>
                          <p className="text-sm font-semibold text-blue-900">
                            {Math.floor(activity.plannedCycleTime / 60)}:{String(activity.plannedCycleTime % 60).padStart(2, '0')}
                          </p>
                        </div>
                        <div
                          className={`p-2 rounded ${
                            activity.actualCycleTime <= activity.plannedCycleTime
                              ? 'bg-green-50'
                              : 'bg-red-50'
                          }`}
                        >
                          <p
                            className={`text-xs ${
                              activity.actualCycleTime <= activity.plannedCycleTime
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            Actual Cycle
                          </p>
                          <p
                            className={`text-sm font-semibold ${
                              activity.actualCycleTime <= activity.plannedCycleTime
                                ? 'text-green-900'
                                : 'text-red-900'
                            }`}
                          >
                            {Math.floor(activity.actualCycleTime / 60)}:{String(activity.actualCycleTime % 60).padStart(2, '0')}
                          </p>
                        </div>
                      </div>

                      {/* Operator */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.operator}</p>
                            <p className="text-xs text-gray-500">{activity.operatorId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Start Time</p>
                          <p className="text-sm font-medium text-gray-900">{activity.startTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Elapsed</p>
                          <p className="text-sm font-medium text-gray-900">{activity.elapsedTime}</p>
                        </div>
                      </div>

                      {/* Machine Metrics */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Health</p>
                          <p className="text-sm font-semibold text-gray-900">{activity.machineHealth}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Temp</p>
                          <p className="text-sm font-semibold text-gray-900">{activity.temperature}°C</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Speed</p>
                          <p className="text-sm font-semibold text-gray-900">{activity.speed}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Downtime Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Downtime Alerts</span>
                  </h3>
                  <div className="space-y-3">
                    {floorData.downtimeAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`bg-white border-l-4 rounded-lg p-3 ${
                          alert.status === 'ongoing' ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{alert.workCenter}</p>
                            <p className="text-sm text-gray-600">{alert.reason}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Started: {alert.startTime}</span>
                          <span className="font-semibold text-gray-900">Duration: {alert.duration}</span>
                        </div>
                        {alert.actionTaken && (
                          <div className="mt-2 text-xs text-green-700 bg-green-50 p-2 rounded">
                            {alert.actionTaken}
                          </div>
                        )}
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'ongoing'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {alert.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Requests */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <PackageCheck className="w-5 h-5 text-orange-600" />
                    <span>Material Call-off Requests</span>
                  </h3>
                  <div className="space-y-3">
                    {floorData.materialRequests.map((request) => (
                      <div key={request.id} className="bg-white border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{request.workCenter}</p>
                            <p className="text-sm text-gray-600">{request.materialName}</p>
                            <p className="text-xs text-gray-500">{request.materialCode}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                              request.urgency
                            )}`}
                          >
                            {request.urgency.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Qty: {request.requestedQuantity}</span>
                          <span className="text-gray-600">Time: {request.requestedAt}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">By: {request.requestedBy}</p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'approved'
                                ? 'bg-blue-100 text-blue-800'
                                : request.status === 'issued'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quality Alerts & Shift Handover */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Quality Alerts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span>Quality Alerts</span>
                  </h3>
                  <div className="space-y-3">
                    {floorData.qualityAlerts.map((alert) => (
                      <div key={alert.id} className="bg-white border-l-4 border-purple-500 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{alert.workCenter}</p>
                            <p className="text-sm text-gray-600">{alert.product}</p>
                            <p className="text-xs text-gray-500">WO: {alert.woNumber}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                              alert.severity
                            )}`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-900">{alert.defectType}</p>
                          <p className="text-sm text-gray-600">Defect Count: {alert.defectCount}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Reported by: {alert.reportedBy}</span>
                          <span className="text-gray-500">{alert.reportedAt}</span>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.status === 'open'
                                ? 'bg-red-100 text-red-800'
                                : alert.status === 'under_investigation'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {alert.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shift Handover Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>Shift Handover Notes</span>
                  </h3>
                  {floorData.shiftHandoverNotes.map((note) => (
                    <div key={note.id} className="bg-white border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {note.fromShift} → {note.toShift}
                          </p>
                          <p className="text-sm text-gray-600">{note.date}</p>
                        </div>
                        {note.acknowledgedBy && (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        )}
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{note.notes}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-900 mb-2">Pending Issues:</p>
                        <ul className="space-y-1">
                          {note.pendingIssues.map((issue, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-green-600">Completed WOs</p>
                          <p className="text-lg font-semibold text-green-900">{note.completedWOs}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-blue-600">Ongoing WOs</p>
                          <p className="text-lg font-semibold text-blue-900">{note.ongoingWOs}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Handover by: {note.handoverBy}</p>
                        {note.acknowledgedBy && (
                          <>
                            <p>Acknowledged by: {note.acknowledgedBy}</p>
                            <p>Acknowledged at: {note.acknowledgedAt}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Activity Timeline</span>
                </h3>
                <div className="bg-white border rounded-lg p-3">
                  <div className="space-y-2">
                    {floorData.activityTimeline.map((activity, index) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${getTimelineSeverityColor(
                              activity.severity
                            )}`}
                          ></div>
                          {index < floorData.activityTimeline.length - 1 && (
                            <div className="w-0.5 h-12 bg-gray-300 my-1"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{activity.description}</p>
                              <p className="text-sm text-gray-600">{activity.workCenter}</p>
                              <p className="text-sm text-gray-500">{activity.details}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                              {activity.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Operator Performance Tab */}
          {activeTab === 'operators' && (
            <div className="space-y-3">
              {/* Top Performers */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Top Performers Today</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {floorData.operatorPerformance
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .slice(0, 3)
                    .map((operator, index) => (
                      <div
                        key={operator.id}
                        className={`bg-gradient-to-br ${
                          index === 0
                            ? 'from-yellow-100 to-yellow-200 border-yellow-400'
                            : index === 1
                            ? 'from-gray-100 to-gray-200 border-gray-400'
                            : 'from-orange-100 to-orange-200 border-orange-400'
                        } border-2 rounded-lg p-3`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div
                            className={`w-12 h-12 rounded-full ${
                              index === 0
                                ? 'bg-yellow-500'
                                : index === 1
                                ? 'bg-gray-500'
                                : 'bg-orange-500'
                            } flex items-center justify-center text-white font-bold text-xl`}
                          >
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{operator.operatorName}</p>
                            <p className="text-sm text-gray-600">{operator.operatorId}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-center bg-white rounded p-2">
                            <p className="text-xs text-gray-600">Efficiency</p>
                            <p className="text-lg font-bold text-gray-900">{operator.efficiency}%</p>
                          </div>
                          <div className="text-center bg-white rounded p-2">
                            <p className="text-xs text-gray-600">Quality</p>
                            <p className="text-lg font-bold text-gray-900">{operator.qualityScore}%</p>
                          </div>
                        </div>
                        <div className="mt-2 text-center bg-white rounded p-2">
                          <p className="text-xs text-gray-600">Produced Today</p>
                          <p className="text-lg font-bold text-gray-900">{operator.quantityProduced}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Operator Performance Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Operators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {floorData.operatorPerformance.map((operator) => (
                    <div key={operator.id} className="bg-white border rounded-lg p-3">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{operator.operatorName}</p>
                            <p className="text-sm text-gray-600">{operator.operatorId}</p>
                            <p className="text-xs text-gray-500">{operator.workCenter}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPerformanceRatingColor(
                            operator.performanceRating
                          )}`}
                        >
                          {operator.performanceRating.toUpperCase()}
                        </span>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <div className="bg-blue-50 p-3 rounded text-center">
                          <p className="text-xs text-blue-600 mb-1">Operations</p>
                          <p className="text-lg font-bold text-blue-900">{operator.operationsCompleted}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded text-center">
                          <p className="text-xs text-green-600 mb-1">Efficiency</p>
                          <p className="text-lg font-bold text-green-900">{operator.efficiency}%</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded text-center">
                          <p className="text-xs text-purple-600 mb-1">Quality</p>
                          <p className="text-lg font-bold text-purple-900">{operator.qualityScore}%</p>
                        </div>
                      </div>

                      {/* Production Progress */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Production Target</span>
                          <span className="font-semibold text-gray-900">
                            {operator.quantityProduced}/{operator.targetQuantity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (operator.quantityProduced / operator.targetQuantity) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-gray-600">Login Time</p>
                          <p className="text-sm font-medium text-gray-900">{operator.loginTime}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Hours Worked</p>
                          <p className="text-sm font-medium text-gray-900">
                            {operator.hoursWorked.toFixed(2)}h
                          </p>
                        </div>
                      </div>

                      {/* Attendance Streak */}
                      <div className="mb-2">
                        <div className="flex items-center space-x-2 bg-orange-50 p-2 rounded">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-orange-900">
                            Attendance Streak: <strong>{operator.attendanceStreak} days</strong>
                          </span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {operator.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-2">Certifications:</p>
                        <div className="flex flex-wrap gap-1">
                          {operator.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Training Needed */}
                      {operator.trainingNeeded.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-2 flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>Training Needed:</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {operator.trainingNeeded.map((training, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                              >
                                {training}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Material Consumption Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total Materials</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {floorData.materialConsumption.length}
                      </p>
                    </div>
                    <Box className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Total Cost</p>
                      <p className="text-2xl font-bold text-green-900">
                        ₹
                        {floorData.materialConsumption
                          .reduce((sum, mat) => sum + mat.totalCost, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Avg Scrap %</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {(
                          floorData.materialConsumption.reduce(
                            (sum, mat) => sum + mat.scrapPercent,
                            0
                          ) / floorData.materialConsumption.length
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Critical Items</p>
                      <p className="text-2xl font-bold text-red-900">
                        {floorData.materialConsumption.filter((mat) => mat.status === 'critical').length}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Material Consumption Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Material Consumption Details</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Material
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Required
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Issued
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Consumed
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Balance
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Variance
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Scrap
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                            Batch/Lot
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Total Cost
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {floorData.materialConsumption.map((material) => (
                          <tr key={material.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{material.materialCode}</p>
                                <p className="text-sm text-gray-600">{material.materialDescription}</p>
                                <p className="text-xs text-gray-500">{material.storageLocation}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <p className="font-medium text-gray-900">{material.requiredQuantity}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <p className="font-medium text-blue-900">{material.issuedQuantity}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <p className="font-medium text-green-900">{material.consumedQuantity}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <p className="font-medium text-gray-900">{material.balanceQuantity}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div>
                                <p
                                  className={`font-medium ${
                                    material.variance > 0
                                      ? 'text-red-900'
                                      : material.variance < 0
                                      ? 'text-green-900'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {material.variance > 0 ? '+' : ''}
                                  {material.variance}
                                </p>
                                <p
                                  className={`text-xs ${
                                    material.variance > 0
                                      ? 'text-red-600'
                                      : material.variance < 0
                                      ? 'text-green-600'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  ({material.variancePercent > 0 ? '+' : ''}
                                  {material.variancePercent.toFixed(1)}%)
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div>
                                <p className="font-medium text-gray-900">{material.scrapQuantity}</p>
                                <p className="text-xs text-gray-600">({material.scrapPercent.toFixed(1)}%)</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm">
                                <p className="text-gray-900">{material.batchNumber}</p>
                                <p className="text-gray-600">{material.lotNumber}</p>
                                {material.expiryDate !== 'N/A' && (
                                  <p className="text-xs text-orange-600">Exp: {material.expiryDate}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <p className="font-medium text-gray-900">
                                ₹{material.totalCost.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-600">
                                @₹{material.unitCost}/unit
                              </p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getMaterialStatusColor(
                                  material.status
                                )}`}
                              >
                                {material.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wrench & Die Tracking Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Active Tools</p>
                      <p className="text-2xl font-bold text-green-900">
                        {floorData.toolTracking.filter((tool) => tool.status === 'active').length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600">Due for Maintenance</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {
                          floorData.toolTracking.filter((tool) => tool.status === 'due_for_maintenance')
                            .length
                        }
                      </p>
                    </div>
                    <Settings className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Replacement Due</p>
                      <p className="text-2xl font-bold text-red-900">
                        {floorData.toolTracking.filter((tool) => tool.status === 'replacement_due').length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Total Tools</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {floorData.toolTracking.length}
                      </p>
                    </div>
                    <Wrench className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Wrench Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Tools & Dies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {floorData.toolTracking.map((tool) => (
                    <div
                      key={tool.id}
                      className={`bg-white border-2 rounded-lg p-3 ${
                        tool.status === 'replacement_due'
                          ? 'border-red-300'
                          : tool.status === 'due_for_maintenance'
                          ? 'border-yellow-300'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{tool.toolId}</p>
                          <p className="text-sm text-gray-600">{tool.toolDescription}</p>
                        </div>
                        <Wrench className="w-6 h-6 text-gray-400" />
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getToolStatusColor(
                            tool.status
                          )}`}
                        >
                          {tool.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tool.toolType.toUpperCase()}
                        </span>
                      </div>

                      {/* Work Center */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Work Center</p>
                        <p className="font-medium text-gray-900">{tool.workCenter}</p>
                      </div>

                      {/* Wrench Life Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Wrench Life Remaining</span>
                          <span className="font-semibold text-gray-900">{tool.toolLife}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              tool.toolLife >= 70
                                ? 'bg-green-500'
                                : tool.toolLife >= 40
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${tool.toolLife}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {tool.remainingLife.toLocaleString()} / {tool.totalLifeCapacity.toLocaleString()}{' '}
                          remaining
                        </p>
                      </div>

                      {/* Usage Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-blue-600">Used Life</p>
                          <p className="text-sm font-semibold text-blue-900">
                            {tool.usedLife.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-xs text-purple-600">Usage Today</p>
                          <p className="text-sm font-semibold text-purple-900">{tool.usageCountToday}</p>
                        </div>
                      </div>

                      {/* Maintenance Info */}
                      <div className="mb-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-600">Last Maintenance:</span>
                          <span className="text-gray-900">{tool.lastMaintenanceDate}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Next Due:</span>
                          <span className="font-medium text-gray-900">{tool.nextMaintenanceDue}</span>
                        </div>
                      </div>

                      {/* Cost & Location */}
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Cost per Part:</span>
                          <span className="font-medium text-gray-900">₹{tool.costPerPart}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <p>Location: {tool.toolLocation}</p>
                          <p>Assigned: {tool.assignedOperator}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
