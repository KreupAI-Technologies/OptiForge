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

// Normalise a raw NCR/inspection record into the QualityInspection shape the UI expects.
function normaliseInspection(rec: any, id: string): QualityInspection {
  return {
    id: String(rec.id ?? id),
    qcNumber: rec.qcNumber ?? rec.qc_number ?? rec.ncrNumber ?? rec.ncr_number ?? '',
    workOrderNumber: rec.workOrderNumber ?? rec.work_order_number ?? '',
    workOrderId: rec.workOrderId ?? rec.work_order_id ?? '',
    batchNumber: rec.batchNumber ?? rec.batch_number ?? '',
    inspectionType: (rec.inspectionType ?? rec.inspection_type ?? 'final') as QualityInspection['inspectionType'],
    inspectionStage: (rec.inspectionStage ?? rec.inspection_stage ?? 'finished_goods') as QualityInspection['inspectionStage'],
    status: (rec.status ?? 'pending') as QualityInspection['status'],
    date: rec.date ?? '',
    time: rec.time ?? '',
    shift: rec.shift ?? '',
    inspector: rec.inspector ?? '',
    inspectorCertification: rec.inspectorCertification ?? rec.inspector_certification ?? '',
    productCode: rec.productCode ?? rec.product_code ?? '',
    productName: rec.productName ?? rec.product_name ?? '',
    lotNumber: rec.lotNumber ?? rec.lot_number ?? '',
    quantityInspected: rec.quantityInspected ?? rec.quantity_inspected ?? 0,
    sampleSize: rec.sampleSize ?? rec.sample_size ?? 0,
    testedQty: rec.testedQty ?? rec.tested_qty ?? 0,
    passRate: rec.passRate ?? rec.pass_rate ?? 0,
    defectsFound: rec.defectsFound ?? rec.defects_found ?? 0,
    aql: rec.aql ?? 0,
    inspectionLevel: (rec.inspectionLevel ?? rec.inspection_level ?? 'II') as QualityInspection['inspectionLevel'],
    samplingMethod: rec.samplingMethod ?? rec.sampling_method ?? '',
    inspectionMethod: rec.inspectionMethod ?? rec.inspection_method ?? '',
    equipmentUsed: Array.isArray(rec.equipmentUsed) ? rec.equipmentUsed : [],
    referenceStandards: rec.referenceStandards ?? rec.reference_standards ?? {},
    environmentalConditions: rec.environmentalConditions ?? rec.environmental_conditions ?? {},
    testParameters: Array.isArray(rec.testParameters) ? rec.testParameters : [],
    defects: Array.isArray(rec.defects) ? rec.defects : [],
    disposition: (rec.disposition ?? 'hold') as QualityInspection['disposition'],
    reworkInstructions: rec.reworkInstructions ?? rec.rework_instructions,
    deviationNumber: rec.deviationNumber ?? rec.deviation_number,
    spcAnalysis: Array.isArray(rec.spcAnalysis) ? rec.spcAnalysis : (Array.isArray(rec.spc_analysis) ? rec.spc_analysis : []),
    capa: rec.capa,
    qualityCost: rec.qualityCost ?? rec.quality_cost ?? { scrapCost: 0, reworkCost: 0, sortingCost: 0 },
    attachments: Array.isArray(rec.attachments) ? rec.attachments : [],
    activityLog: Array.isArray(rec.activityLog) ? rec.activityLog : (Array.isArray(rec.activity_log) ? rec.activity_log : []),
    notes: rec.notes ?? '',
    createdBy: rec.createdBy ?? rec.created_by ?? '',
    createdAt: rec.createdAt ?? rec.created_at ?? '',
    updatedAt: rec.updatedAt ?? rec.updated_at ?? '',
  };
}

export default function QualityControlViewPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inspection');

  const [inspection, setInspection] = useState<QualityInspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    const id = params?.id as string;
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await ProductionOrphanService.getNcr(id);
      const rec = Array.isArray(res) ? res[0] : (res?.data ?? res);
      if (rec && typeof rec === 'object' && Object.keys(rec).length > 0) {
        setInspection(normaliseInspection(rec, id));
      } else {
        setNotFound(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load inspection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading inspection…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 px-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !inspection) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3 px-4">
        <div className="text-center">
          <AlertTriangle className="h-10 w-10 text-gray-400 mb-2 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900">Inspection not found</h3>
          <p className="text-sm text-gray-600 mt-1">
            No inspection record exists for ID {params.id as string}.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    );
  }

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
