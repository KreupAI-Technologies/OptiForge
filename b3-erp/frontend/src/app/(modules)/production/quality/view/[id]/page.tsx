'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Pause,
  FileText,
  Calendar,
  User,
  Package,
  Ruler,
  ClipboardCheck,
  Camera,
  TrendingUp,
  AlertCircle,
  Download,
  Printer,
  Edit,
  ThumbsUp,
  ThumbsDown,
  FileWarning,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Activity,
  Gauge,
  Layers,
  FileSignature,
  MessageSquare,
  Paperclip,
  ExternalLink,
  RefreshCw,
  Bell,
  DollarSign,
  TrendingDown,
  CheckSquare,
  XSquare,
  MinusCircle,
  Settings,
} from 'lucide-react';

// TypeScript Interfaces
interface TestParameter {
  id: string;
  parameterName: string;
  specification: string;
  targetValue: number;
  upperLimit: number;
  lowerLimit: number;
  measuredValue: number;
  unit: string;
  tolerance: string;
  result: 'pass' | 'fail' | 'borderline';
  instrument: string;
  remarks: string;
  photo?: string;
}

interface Defect {
  id: string;
  type: string;
  location: string;
  quantity: number;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  photo?: string;
  status: string;
}

interface SPCData {
  parameter: string;
  mean: number;
  stdDev: number;
  ucl: number;
  lcl: number;
  cl: number;
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  sigmaLevel: number;
  measurements: number[];
  outOfControlPoints: number[];
}

interface CAPA {
  ncrNumber: string;
  dateRaised: string;
  nonConformanceDescription: string;
  rootCauseCategory: string;
  rootCauseAnalysis: string;
  containmentActions: string;
  correctiveActions: string;
  preventiveActions: string;
  responsiblePerson: string;
  targetDate: string;
  verificationMethod: string;
  status: 'open' | 'in_progress' | 'closed';
  closureDate?: string;
  effectiveness?: string;
}

interface QualityInspection {
  id: string;
  qcNumber: string;
  workOrderNumber: string;
  workOrderId: string;
  batchNumber: string;
  inspectionType: 'in_process' | 'final' | 'first_article' | 'receiving' | 'patrol' | 'audit';
  inspectionStage: 'raw_material' | 'wip' | 'finished_goods';
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'on_hold';
  date: string;
  time: string;
  shift: string;
  inspector: string;
  inspectorCertification: string;
  productCode: string;
  productName: string;
  lotNumber: string;
  quantityInspected: number;
  sampleSize: number;
  testedQty: number;
  passRate: number;
  defectsFound: number;
  aql: number;
  inspectionLevel: 'I' | 'II' | 'III';
  samplingMethod: string;
  inspectionMethod: string;
  equipmentUsed: string[];
  referenceStandards: {
    drawingNumber?: string;
    specDocument?: string;
    qualityPlan?: string;
  };
  environmentalConditions: {
    temperature?: number;
    humidity?: number;
  };
  testParameters: TestParameter[];
  defects: Defect[];
  disposition: 'accept' | 'reject' | 'rework' | 'use_as_is' | 'hold';
  reworkInstructions?: string;
  deviationNumber?: string;
  spcAnalysis?: SPCData[];
  capa?: CAPA;
  qualityCost: {
    scrapCost: number;
    reworkCost: number;
    sortingCost: number;
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  activityLog: Array<{
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
  }>;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function QualityControlViewPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inspection');

  // Mock data - used as fallback default until/if the API returns a record
  const mockInspection: QualityInspection = {
    id: params.id as string,
    qcNumber: 'QC-2025-00147',
    workOrderNumber: 'WO-2025-00523',
    workOrderId: 'wo-523',
    batchNumber: 'BATCH-2025-00892',
    inspectionType: 'final',
    inspectionStage: 'finished_goods',
    status: 'passed',
    date: '2025-10-15',
    time: '14:30',
    shift: 'Day Shift',
    inspector: 'Rajesh Kumar',
    inspectorCertification: 'ISO 9001 Lead Auditor, CMM Level 2',
    productCode: 'PRD-5847',
    productName: 'Precision Shaft Assembly - 50mm',
    lotNumber: 'LOT-2025-1547',
    quantityInspected: 500,
    sampleSize: 80,
    testedQty: 80,
    passRate: 96.25,
    defectsFound: 3,
    aql: 1.5,
    inspectionLevel: 'II',
    samplingMethod: 'Random Sampling',
    inspectionMethod: 'Dimensional & Visual',
    equipmentUsed: ['Vernier Caliper', 'Micrometer', 'Surface Roughness Tester', 'CMM'],
    referenceStandards: {
      drawingNumber: 'DRG-2025-5847-A',
      specDocument: 'SPEC-5847-Rev3.pdf',
      qualityPlan: 'QP-5847-2025',
    },
    environmentalConditions: {
      temperature: 22.5,
      humidity: 45,
    },
    testParameters: [
      {
        id: '1',
        parameterName: 'Overall Length',
        specification: '50±0.05 mm',
        targetValue: 50,
        upperLimit: 50.05,
        lowerLimit: 49.95,
        measuredValue: 50.02,
        unit: 'mm',
        tolerance: '±0.05',
        result: 'pass',
        instrument: 'Vernier Caliper (0.01mm)',
        remarks: 'Within tolerance',
        photo: '/images/measurement1.jpg',
      },
      {
        id: '2',
        parameterName: 'Shaft Diameter',
        specification: '25±0.02 mm',
        targetValue: 25,
        upperLimit: 25.02,
        lowerLimit: 24.98,
        measuredValue: 25.01,
        unit: 'mm',
        tolerance: '±0.02',
        result: 'pass',
        instrument: 'Micrometer (0.001mm)',
        remarks: 'Good',
      },
      {
        id: '3',
        parameterName: 'Surface Roughness (Ra)',
        specification: '≤3.2 µm',
        targetValue: 3.2,
        upperLimit: 3.2,
        lowerLimit: 0,
        measuredValue: 2.8,
        unit: 'µm',
        tolerance: 'Max 3.2',
        result: 'pass',
        instrument: 'Surface Roughness Tester',
        remarks: 'Excellent finish',
      },
      {
        id: '4',
        parameterName: 'Hardness (HRC)',
        specification: '58-62 HRC',
        targetValue: 60,
        upperLimit: 62,
        lowerLimit: 58,
        measuredValue: 59.5,
        unit: 'HRC',
        tolerance: '58-62',
        result: 'pass',
        instrument: 'Rockwell Hardness Tester',
        remarks: 'Within range',
      },
      {
        id: '5',
        parameterName: 'Concentricity',
        specification: '≤0.03 mm',
        targetValue: 0,
        upperLimit: 0.03,
        lowerLimit: 0,
        measuredValue: 0.025,
        unit: 'mm',
        tolerance: 'Max 0.03',
        result: 'pass',
        instrument: 'CMM',
        remarks: 'Acceptable',
      },
      {
        id: '6',
        parameterName: 'Thread Pitch',
        specification: 'M20x2.5',
        targetValue: 2.5,
        upperLimit: 2.52,
        lowerLimit: 2.48,
        measuredValue: 2.49,
        unit: 'mm',
        tolerance: '±0.02',
        result: 'pass',
        instrument: 'Thread Pitch Gauge',
        remarks: 'Thread quality good',
      },
    ],
    defects: [
      {
        id: '1',
        type: 'Minor Surface Scratch',
        location: 'Side face, 30mm from end',
        quantity: 2,
        severity: 'minor',
        description: 'Light scratches on non-functional surface',
        photo: '/images/defect1.jpg',
        status: 'Acceptable - cosmetic only',
      },
      {
        id: '2',
        type: 'Edge Burr',
        location: 'Thread exit point',
        quantity: 1,
        severity: 'minor',
        description: 'Small burr at thread end',
        photo: '/images/defect2.jpg',
        status: 'Removed during inspection',
      },
    ],
    disposition: 'accept',
    spcAnalysis: [
      {
        parameter: 'Overall Length',
        mean: 50.015,
        stdDev: 0.018,
        ucl: 50.069,
        lcl: 49.961,
        cl: 50.015,
        cp: 1.54,
        cpk: 1.48,
        pp: 1.52,
        ppk: 1.46,
        sigmaLevel: 4.44,
        measurements: [50.02, 50.01, 50.03, 50.00, 50.02, 50.01, 50.02, 50.03, 50.01, 50.02],
        outOfControlPoints: [],
      },
      {
        parameter: 'Shaft Diameter',
        mean: 25.005,
        stdDev: 0.008,
        ucl: 25.029,
        lcl: 24.981,
        cl: 25.005,
        cp: 1.67,
        cpk: 1.63,
        pp: 1.65,
        ppk: 1.61,
        sigmaLevel: 4.89,
        measurements: [25.01, 25.00, 25.01, 25.00, 25.01, 25.01, 25.00, 25.01, 25.00, 25.01],
        outOfControlPoints: [],
      },
    ],
    qualityCost: {
      scrapCost: 0,
      reworkCost: 50,
      sortingCost: 0,
    },
    attachments: [
      {
        id: '1',
        name: 'Inspection_Report_QC-2025-00147.pdf',
        type: 'pdf',
        url: '/attachments/inspection_report.pdf',
      },
      {
        id: '2',
        name: 'CMM_Measurement_Data.xlsx',
        type: 'excel',
        url: '/attachments/cmm_data.xlsx',
      },
      {
        id: '3',
        name: 'Product_Photos.zip',
        type: 'zip',
        url: '/attachments/photos.zip',
      },
    ],
    activityLog: [
      {
        id: '1',
        timestamp: '2025-10-15 14:30',
        user: 'Rajesh Kumar',
        action: 'Inspection Started',
        details: 'Final inspection initiated for WO-2025-00523',
      },
      {
        id: '2',
        timestamp: '2025-10-15 15:45',
        user: 'Rajesh Kumar',
        action: 'Measurements Completed',
        details: '6 parameters tested, all within tolerance',
      },
      {
        id: '3',
        timestamp: '2025-10-15 16:00',
        user: 'Rajesh Kumar',
        action: 'Inspection Completed',
        details: 'Disposition: Accept - Pass rate 96.25%',
      },
      {
        id: '4',
        timestamp: '2025-10-15 16:15',
        user: 'Priya Sharma',
        action: 'Approved',
        details: 'Quality Manager approval - Released for shipment',
      },
    ],
    notes: 'Minor cosmetic defects found but within acceptable limits. Product meets all functional requirements. Batch approved for shipment.',
    createdBy: 'Rajesh Kumar',
    createdAt: '2025-10-15T14:30:00Z',
    updatedAt: '2025-10-15T16:15:00Z',
  };

  const [inspection, setInspection] = useState<QualityInspection>(mockInspection);

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    const load = async () => {
      try {
        const res = await ProductionOrphanService.getNcr(id);
        const rec = Array.isArray(res) ? res[0] : (res?.data ?? res);
        if (rec && typeof rec === 'object') {
          setInspection({
            ...mockInspection,
            ...rec,
            testParameters: Array.isArray(rec.testParameters)
              ? rec.testParameters
              : mockInspection.testParameters,
            defects: Array.isArray(rec.defects)
              ? rec.defects
              : mockInspection.defects,
            equipmentUsed: Array.isArray(rec.equipmentUsed)
              ? rec.equipmentUsed
              : mockInspection.equipmentUsed,
            activityLog: Array.isArray(rec.activityLog)
              ? rec.activityLog
              : mockInspection.activityLog,
            attachments: Array.isArray(rec.attachments)
              ? rec.attachments
              : mockInspection.attachments,
            referenceStandards:
              rec.referenceStandards ?? mockInspection.referenceStandards,
            environmentalConditions:
              rec.environmentalConditions ??
              mockInspection.environmentalConditions,
            qualityCost: rec.qualityCost ?? mockInspection.qualityCost,
          });
        }
      } catch {
        // keep mock fallback on error
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'on_hold':
        return <Pause className="h-5 w-5 text-yellow-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      passed: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getResultBadge = (result: string) => {
    const styles = {
      pass: 'bg-green-50 text-green-700 border-green-200',
      fail: 'bg-red-50 text-red-700 border-red-200',
      borderline: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return styles[result as keyof typeof styles];
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      major: 'bg-orange-100 text-orange-800 border-orange-300',
      minor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return styles[severity as keyof typeof styles];
  };

  const getProcessCapabilityRating = (cpk: number) => {
    if (cpk >= 2.0) return { label: 'Excellent', color: 'text-green-600' };
    if (cpk >= 1.67) return { label: 'Very Good', color: 'text-blue-600' };
    if (cpk >= 1.33) return { label: 'Good', color: 'text-teal-600' };
    if (cpk >= 1.0) return { label: 'Adequate', color: 'text-yellow-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {inspection.qcNumber}
                  </h1>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusBadge(inspection.status)}`}>
                    {getStatusIcon(inspection.status)}
                    <span className="font-medium capitalize">
                      {inspection.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>WO: {inspection.workOrderNumber}</span>
                    <button className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-700">
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">Open</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{inspection.inspectionType.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{inspection.date} {inspection.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{inspection.inspector}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {inspection.status === 'pending' && (
                <button
                  onClick={() => router.push(`/production/quality/edit/${inspection.id}`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <ThumbsUp className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <ThumbsDown className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <FileWarning className="h-4 w-4" />
                <span>Request Deviation</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">Print</span>
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">Download</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Sample Size</p>
                  <p className="text-2xl font-bold text-blue-900">{inspection.sampleSize}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    of {inspection.quantityInspected} units
                  </p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Tested Quantity</p>
                  <p className="text-2xl font-bold text-purple-900">{inspection.testedQty}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {inspection.testParameters.length} parameters
                  </p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Pass Rate</p>
                  <p className="text-2xl font-bold text-green-900">{inspection.passRate}%</p>
                  <p className="text-xs text-green-600 mt-1">
                    AQL {inspection.aql}% Level {inspection.inspectionLevel}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Defects Found</p>
                  <p className="text-2xl font-bold text-red-900">{inspection.defectsFound}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {inspection.defects.filter(d => d.severity === 'critical').length} critical
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 px-6">
          {[
            { id: 'inspection', label: 'Inspection Details', icon: ClipboardCheck },
            { id: 'results', label: 'Test Results', icon: Ruler },
            { id: 'spc', label: 'SPC Analysis', icon: TrendingUp },
            { id: 'capa', label: 'CAPA', icon: FileWarning },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Rendered based on activeTab (similar structure as previous implementation) */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3">
          {/* Main Content */}
          <div className="col-span-2">
            {activeTab === 'inspection' && (
              <div className="bg-white rounded-lg border p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">QC Number</label>
                      <p className="mt-1 text-gray-900 font-medium">{inspection.qcNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Inspection Date & Time</label>
                      <p className="mt-1 text-gray-900">{inspection.date} at {inspection.time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Inspector Name</label>
                      <p className="mt-1 text-gray-900">{inspection.inspector}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Work Order</label>
                      <p className="mt-1 text-gray-900 font-medium">{inspection.workOrderNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Product Name</label>
                      <p className="mt-1 text-gray-900">{inspection.productName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusBadge(inspection.status)}`}>
                        {getStatusIcon(inspection.status)}
                        <span className="capitalize">{inspection.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'results' && (
              <div className="bg-white rounded-lg border p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Test Results</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Parameter</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Measured</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inspection.testParameters.map((param) => (
                        <tr key={param.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{param.parameterName}</td>
                          <td className="px-4 py-3 text-center">{param.measuredValue} {param.unit}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getResultBadge(param.result)}`}>
                              {param.result.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'spc' && (
              <div className="bg-white rounded-lg border p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">SPC Analysis</h2>
                {inspection.spcAnalysis?.map((spc, index) => (
                  <div key={index} className="mb-3 pb-6 border-b last:border-b-0">
                    <h3 className="font-semibold text-gray-900 mb-3">{spc.parameter}</h3>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium">Cp</p>
                        <p className="text-xl font-bold text-blue-900 mt-1">{spc.cp.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium">Cpk</p>
                        <p className="text-xl font-bold text-green-900 mt-1">{spc.cpk.toFixed(2)}</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-medium">Pp</p>
                        <p className="text-xl font-bold text-purple-900 mt-1">{spc.pp.toFixed(2)}</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs text-orange-600 font-medium">Ppk</p>
                        <p className="text-xl font-bold text-orange-900 mt-1">{spc.ppk.toFixed(2)}</p>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <p className="text-xs text-teal-600 font-medium">Sigma</p>
                        <p className="text-xl font-bold text-teal-900 mt-1">{spc.sigmaLevel.toFixed(2)}σ</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'capa' && (
              <div className="bg-white rounded-lg border p-3">
                <div className="text-center py-12">
                  <CheckCircle2 className="h-16 w-16 text-green-600 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No CAPA Required</h3>
                  <p className="text-gray-600">Inspection passed all quality checks.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg border p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span>Activity Timeline</span>
              </h3>
              <div className="space-y-3">
                {inspection.activityLog.map((activity) => (
                  <div key={activity.id} className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-l-0 last:pb-0">
                    <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white"></div>
                    <div className="text-xs text-gray-500">{activity.timestamp}</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{activity.action}</div>
                    <div className="text-xs text-gray-600 mt-1">{activity.details}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
